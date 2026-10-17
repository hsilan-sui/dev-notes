// 收訊 Signal — what the river already carries.
//
// Signals and replies live only in this visit's React state (no backend yet).
// The first signal of a visit is a line from 〈大爆炸〉, arriving with its source.
export const SIGNAL_MAX_LENGTH = 40;

export const firstArrival = {
  text: '光年明明是距離的單位，卻讓人看見了時間。',
  departed: '2026-10-02',
  source: {title: '大爆炸', dayKey: '2026-10-02'},
};

// Arrival is the visibility boundary: in-flight messages never appear here.
export function recordSignal(entries, signal) {
  if (entries.some(entry => entry.id === signal.id || entry.replies.some(reply => reply.id === signal.id))) return entries;
  if (signal.threadId) {
    return entries.map(entry => entry.id === signal.threadId
      ? {...entry, replies: [...entry.replies, signal]} : entry);
  }
  return [...entries, {...signal, replies: []}];
}
