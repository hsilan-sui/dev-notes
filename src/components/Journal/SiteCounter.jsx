import {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useSignalLang} from './signalI18n.js';
import styles from './SiteCounter.module.css';

const SESSION_KEY = 'mytide.counter.session';
const VISIT_DAY_KEY = 'mytide.counter.day';
// An open tab checks in this often, so it counts as online (the API forgets
// a tab after 90 seconds of silence).
const HEARTBEAT_MS = 45_000;

const randomId = () => crypto.randomUUID().replaceAll('-', '');
const taipeiDay = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Taipei'}).format(new Date());

function read(storage, key) {
  try { return window[storage].getItem(key); } catch { return null; }
}
function write(storage, key, value) {
  try { window[storage].setItem(key, value); } catch { /* blocked storage: counted again next time */ }
}

function Odometer({value}) {
  return (
    <span className={styles.odometer} aria-label={String(value)}>
      {String(value).padStart(6, '0').split('').map((digit, index) => <span key={index} aria-hidden="true">{digit}</span>)}
    </span>
  );
}

// 無名小站-style counter, quiet in the lower right: who is here now, and how
// many visits and page views today and in all. Stored in D1 by the Signal API;
// no names, no IP addresses — one random id per open tab.
export default function SiteCounter() {
  const {siteConfig} = useDocusaurusContext();
  const apiBase = String(siteConfig.customFields?.signalApiBaseUrl || '').replace(/\/$/, '');
  const {t} = useSignalLang();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!apiBase) return undefined;
    let session = read('sessionStorage', SESSION_KEY);
    if (!session) {
      session = randomId();
      write('sessionStorage', SESSION_KEY, session);
    }
    const day = taipeiDay();
    const firstToday = read('localStorage', VISIT_DAY_KEY) !== day;
    let alive = true;

    async function report(extra) {
      try {
        const response = await fetch(`${apiBase}/api/counter`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify({session, ...extra}),
        });
        if (!response.ok) return;
        const next = await response.json();
        if (alive) setStats(next);
      } catch {
        // The counter simply stays hidden while the API is unreachable.
      }
    }

    report({visit: firstToday, view: true}).then(() => { if (firstToday) write('localStorage', VISIT_DAY_KEY, day); });
    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') report({});
    }, HEARTBEAT_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') report({}); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [apiBase]);

  if (!stats) return null;
  const c = t.counter;
  return (
    <aside className={styles.counter} aria-label={`${c.online} ${stats.online} · ${c.visits} ${stats.visits.total} · ${c.views} ${stats.views.total}`}>
      <p><span className={styles.live} aria-hidden="true" />{c.online}<b>{stats.online}</b></p>
      <p>{c.visits} {c.today}<b>{stats.visits.today}</b><i aria-hidden="true">·</i>{c.total}<Odometer value={stats.visits.total} /></p>
      <p>{c.views} {c.today}<b>{stats.views.today}</b><i aria-hidden="true">·</i>{c.total}<Odometer value={stats.views.total} /></p>
    </aside>
  );
}
