// 收訊 Signal — what the river already carries.
//
// Signal messages loaded from or accepted by the My Tide API.
export const SIGNAL_MAX_LENGTH = 40;

// Arrival is the visibility boundary: in-flight messages never appear here.
export function recordSignal(entries, signal) {
  if (entries.some(entry => entry.id === signal.id || entry.replies.some(reply => reply.id === signal.id))) return entries;
  if (signal.threadId) {
    return entries.map(entry => entry.id === signal.threadId
      ? {...entry, replies: [...entry.replies, signal]} : entry);
  }
  return [...entries, {...signal, replies: []}];
}

// A writer can take back their own signal for a few minutes. The one-time
// delete key stays in this browser only; the server keeps just its hash.
export const SELF_DELETE_WINDOW_MS = 3 * 60_000;
const OWN_SIGNALS_KEY = 'mytide.signal.own';

export function loadOwnSignals(now = Date.now()) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(OWN_SIGNALS_KEY) || '{}');
    return Object.fromEntries(Object.entries(stored)
      .filter(([, own]) => own && now - own.writtenAt < SELF_DELETE_WINDOW_MS));
  } catch {
    return {};
  }
}

export function saveOwnSignals(own) {
  try {
    window.localStorage.setItem(OWN_SIGNALS_KEY, JSON.stringify(own));
  } catch {
    // A private window simply forgets them on reload.
  }
}

export function removeSignal(entries, id) {
  return entries
    .filter(entry => entry.id !== id)
    .map(entry => entry.replies.some(reply => reply.id === id)
      ? {...entry, replies: entry.replies.filter(reply => reply.id !== id)}
      : entry);
}
