import {useEffect, useState} from 'react';
import {SELF_DELETE_WINDOW_MS} from './signalRiver.js';
import styles from './SignalDeleteButton.module.css';

const secondsLeft = writtenAt => Math.max(0, Math.ceil((writtenAt + SELF_DELETE_WINDOW_MS - Date.now()) / 1000));

// A small, quiet way to take back your own signal while the window is open.
// It counts down in seconds and disappears when the time is up.
export default function SignalDeleteButton({writtenAt, onDelete}) {
  const [left, setLeft] = useState(() => secondsLeft(writtenAt));
  const [busy, setBusy] = useState(false);
  const expired = left <= 0;

  useEffect(() => {
    if (expired) return undefined;
    const timer = window.setInterval(() => setLeft(secondsLeft(writtenAt)), 1000);
    return () => window.clearInterval(timer);
  }, [writtenAt, expired]);

  if (expired) return null;

  return (
    <button
      type="button"
      className={styles.button}
      disabled={busy}
      aria-label={`收回這則訊號（還有 ${left} 秒）`}
      title="收回這則訊號"
      onClick={async event => {
        event.stopPropagation();
        setBusy(true);
        const removed = await onDelete();
        if (!removed) setBusy(false);
      }}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.5 3.5h7M5 3.5V2.5h2v1M3.5 3.5l.5 6h4l.5-6M5.2 5.2v2.8M6.8 5.2v2.8" />
      </svg>
      <span aria-hidden="true">{left}</span>
    </button>
  );
}
