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

// Count and cut text the way people see it: one flag, one accented letter or
// one Thai syllable is one character (the API counts the same way).
const graphemes = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter(undefined, {granularity: 'grapheme'})
  : null;

export function splitGraphemes(text) {
  return graphemes ? Array.from(graphemes.segment(text), part => part.segment) : Array.from(text);
}

export function clampGraphemes(text, max) {
  const parts = splitGraphemes(text);
  return parts.length > max ? parts.slice(0, max).join('') : text;
}

export const TONE_MAX_LENGTH = 5;
const TONES_KEY = 'mytide.signal.tones';

// A visitor's own tones stay in their browser; nobody else's list grows.
export function loadOwnTones() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(TONES_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(tone => typeof tone === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function saveOwnTone(tone, current) {
  const next = [tone, ...current.filter(item => item !== tone)].slice(0, 6);
  try {
    window.localStorage.setItem(TONES_KEY, JSON.stringify(next));
  } catch {
    // A private window keeps it for this visit only.
  }
  return next;
}

// Links in a signal: each counts as LINK_WEIGHT characters toward the 40 (the
// API counts the same way), and a whole signal is at most SIGNAL_RAW_MAX long.
export const LINK_WEIGHT = 10;
export const SIGNAL_RAW_MAX = 400;
export const LINK_PATTERN = /https?:\/\/[^\s<>"'「」『』（）。，、！？]+/giu;

export function signalLength(text) {
  return splitGraphemes(text.replace(LINK_PATTERN, 'x'.repeat(LINK_WEIGHT))).length;
}
