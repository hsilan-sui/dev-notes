// My Tide Signal API on Cloudflare Workers + D1 (SQLite).
// Same endpoints, request and response shapes as backend/MyTide.Api, so the
// site only needs MYTIDE_SIGNAL_API_URL pointed here.

const MAX_TEXT_ELEMENTS = 40;
const RECENT_THREAD_LIMIT = 100;
const WRITES_PER_MINUTE = 10;
// How long a writer can take back their own signal.
const SELF_DELETE_WINDOW_MS = 3 * 60_000;
const BANKS = new Set(['past', 'today']);
const SIGNAL_ID = /^[0-9a-f]{32}$/;
const segmenter = new Intl.Segmenter('zh-Hant', {granularity: 'grapheme'});

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});

    try {
      const response = await route(request, env);
      for (const [name, value] of Object.entries(cors)) response.headers.set(name, value);
      return response;
    } catch (error) {
      console.error(error);
      return json({error: '伺服器暫時無法處理'}, 500, cors);
    }
  },
};

async function route(request, env) {
  const {pathname} = new URL(request.url);

  if (pathname === '/api/health' && request.method === 'GET') {
    await env.DB.prepare('SELECT 1').first();
    return json({status: 'ok'});
  }

  if (pathname === '/api/signals' && request.method === 'GET') {
    return json(await listRecent(env.DB));
  }

  if (pathname === '/api/signals' && request.method === 'POST') {
    return createSignal(request, env);
  }

  const match = pathname.match(/^\/api\/signals\/([^/]+)$/);
  if (match && request.method === 'DELETE') {
    return deleteSignal(request, env, match[1]);
  }

  return json({error: 'not found'}, 404);
}

async function listRecent(db) {
  const {results} = await db.prepare(`
    WITH recent AS (
      SELECT id FROM signals WHERE thread_id IS NULL
      ORDER BY created_at DESC, id DESC LIMIT ?1
    )
    SELECT id, thread_id, text, from_bank, created_at, departed, source_title, source_day_key
    FROM signals
    WHERE id IN (SELECT id FROM recent) OR thread_id IN (SELECT id FROM recent)
    ORDER BY created_at, id`).bind(RECENT_THREAD_LIMIT).all();

  const threads = [];
  const byId = new Map();
  for (const row of results) {
    const signal = {
      id: row.id,
      threadId: row.thread_id,
      text: row.text,
      from: row.from_bank,
      writtenAt: row.created_at,
      departed: row.departed,
      source: row.source_title && row.source_day_key ? {title: row.source_title, dayKey: row.source_day_key} : null,
      replies: [],
    };
    if (row.thread_id === null) {
      byId.set(row.id, signal);
      threads.push(signal);
    } else {
      byId.get(row.thread_id)?.replies.push(signal);
    }
  }
  return threads;
}

async function createSignal(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({error: '請求格式無效'}, 400);
  }

  const {text, error} = validate(body);
  if (error) return json({error}, 400);

  if (!(await allowWrite(env.DB, clientAddress(request)))) {
    return json({error: '訊號放得太快了，請稍後再放'}, 429);
  }

  const id = body.id ?? crypto.randomUUID().replaceAll('-', '');
  const threadId = body.threadId ?? null;
  const existing = await env.DB.prepare('SELECT text, from_bank, thread_id, created_at FROM signals WHERE id = ?1')
    .bind(id).first();
  if (existing) {
    const same = existing.text === text && existing.from_bank === body.from && existing.thread_id === threadId;
    return same
      ? json({id, createdAt: existing.created_at}, 200)
      : json({error: '訊號識別碼已被使用'}, 409);
  }

  if (threadId !== null) {
    const parent = await env.DB.prepare('SELECT thread_id FROM signals WHERE id = ?1').bind(threadId).first();
    if (!parent) return json({error: '找不到要回覆的訊號'}, 400);
    if (parent.thread_id !== null) return json({error: '回應只能接在原始訊號上'}, 400);
  }

  const createdAt = Date.now();
  const deleteKeyHash = body.deleteKey ? await sha256Hex(body.deleteKey) : null;
  await env.DB.prepare(`
    INSERT INTO signals (id, thread_id, text, from_bank, created_at, departed, delete_key_hash)
    VALUES (?1, ?2, ?3, ?4, ?5, 'today', ?6)`).bind(id, threadId, text, body.from, createdAt, deleteKeyHash).run();

  return json({id, createdAt}, 201);
}

// Two ways to remove a signal (and its replies):
// - its writer, with the one-time delete key, within SELF_DELETE_WINDOW_MS;
// - the site owner, with ADMIN_TOKEN, at any time.
async function deleteSignal(request, env, id) {
  if (!SIGNAL_ID.test(id)) return json({error: '訊號識別碼格式無效'}, 400);

  if (request.headers.has('Authorization')) {
    if (!env.ADMIN_TOKEN || !(await isAuthorized(request, env.ADMIN_TOKEN))) return json({error: 'unauthorized'}, 401);
  } else {
    const key = request.headers.get('X-Delete-Key') ?? '';
    if (!SIGNAL_ID.test(key)) return json({error: 'not found'}, 404);
    const row = await env.DB.prepare('SELECT created_at, delete_key_hash FROM signals WHERE id = ?1').bind(id).first();
    if (!row) return json({error: 'not found'}, 404);
    if (!row.delete_key_hash || !timingSafeEqualText(row.delete_key_hash, await sha256Hex(key))) {
      return json({error: '只能收回自己放出的訊號'}, 403);
    }
    if (Date.now() - row.created_at > SELF_DELETE_WINDOW_MS) return json({error: '已經超過可以收回的時間'}, 403);
  }

  const [, removed] = await env.DB.batch([
    env.DB.prepare('DELETE FROM signals WHERE thread_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM signals WHERE id = ?1').bind(id),
  ]);
  return removed.meta.changes > 0 ? new Response(null, {status: 204}) : json({error: 'not found'}, 404);
}

function validate(body) {
  if (!body || typeof body !== 'object') return {error: '請求格式無效'};
  if (!BANKS.has(body.from)) return {error: '訊號來源無效'};
  if (body.id != null && !(typeof body.id === 'string' && SIGNAL_ID.test(body.id))) return {error: '訊號識別碼格式無效'};
  if (body.threadId != null && !(typeof body.threadId === 'string' && SIGNAL_ID.test(body.threadId))) {
    return {error: '回覆訊號格式無效'};
  }
  if (body.deleteKey != null && !(typeof body.deleteKey === 'string' && SIGNAL_ID.test(body.deleteKey))) {
    return {error: '收回金鑰格式無效'};
  }

  const text = clean(body.text);
  if (!text) return {error: '請先寫下一句話'};
  if ([...segmenter.segment(text)].length > MAX_TEXT_ELEMENTS) return {error: `訊號最多 ${MAX_TEXT_ELEMENTS} 個字`};
  return {text};
}

// One quiet line: drop control characters, line breaks and bidirectional
// overrides (which can flip how text reads).
function clean(text) {
  if (typeof text !== 'string') return '';
  return text.normalize('NFC').replace(/[\p{Cc}‪-‮⁦-⁩]/gu, '').trim();
}

async function allowWrite(db, client) {
  const now = Date.now();
  const windowStart = now - (now % 60_000);
  const row = await db.prepare(`
    INSERT INTO write_limits (client, window_start, count) VALUES (?1, ?2, 1)
    ON CONFLICT (client, window_start) DO UPDATE SET count = count + 1
    RETURNING count`).bind(client, windowStart).first();
  // Occasionally clear old windows so the table stays small.
  if (Math.random() < 0.02) {
    await db.prepare('DELETE FROM write_limits WHERE window_start < ?1').bind(windowStart - 600_000).run();
  }
  return row.count <= WRITES_PER_MINUTE;
}

function clientAddress(request) {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

async function isAuthorized(request, adminToken) {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Bearer ')) return false;
  const encoder = new TextEncoder();
  const [supplied, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(header.slice(7))),
    crypto.subtle.digest('SHA-256', encoder.encode(adminToken)),
  ]);
  return crypto.subtle.timingSafeEqual(supplied, expected);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqualText(a, b) {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  return left.length === right.length && crypto.subtle.timingSafeEqual(left, right);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Delete-Key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type': 'application/json; charset=utf-8', ...headers},
  });
}
