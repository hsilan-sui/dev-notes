import {useEffect, useState} from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;
const formatter = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function taipeiDayKey(now = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(now).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function nextTaipeiMidnight(now = new Date()) {
  return Date.parse(`${taipeiDayKey(now)}T00:00:00+08:00`) + DAY_MS;
}

export default function useTaipeiToday() {
  // Static HTML must not freeze the build date or cause a hydration mismatch.
  const [today, setToday] = useState(null);
  useEffect(() => {
    let timer;
    function update() {
      window.clearTimeout(timer);
      const now = new Date();
      setToday(taipeiDayKey(now));
      timer = window.setTimeout(update, Math.max(1, nextTaipeiMidnight(now) - now.getTime() + 20));
    }
    function visible() { if (document.visibilityState === 'visible') update(); }
    update();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);
  return today;
}
