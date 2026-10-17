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
