import {useCallback, useEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SignalPager from './SignalPager.jsx';
import SignalLightYears, {replyBankFor} from './SignalLightYears';
import {loadOwnSignals, recordSignal, removeSignal, saveOwnSignals} from './signalRiver.js';
import {readMsToken} from './useHoverIntent.js';
import styles from './SignalRiver.module.css';

const BANKS = ['past', 'today'];
const OTHER = {past: 'today', today: 'past'};
const MODEL = {past: 'MT01', today: 'MT02'};
// Boot frames as offsets from page load; the today bank wakes 0.4s later.
const BOOT = [
  [0, 'off'],
  [300, 'boot1'],
  [900, 'boot2'],
  [1600, 'boot3'],
  [2000, 'idle'],
];
const BANK_DELAY = {past: 0, today: 400};
const BOOTING = ['off', 'boot1', 'boot2', 'boot3'];
const WRITE_HINT_KEY = 'mytide.signal.wrote';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clockNow() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function lcdFor(bank, state, clock, apiStatus) {
  switch (state.phase) {
    case 'off':
      return {off: true, main: '', sub: '', bars: 0};
    case 'boot1':
      return {main: 'MY TIDE', sub: MODEL[bank], bars: 0};
    case 'boot2':
      return {main: 'SEARCHING', sub: '收訊中', bars: 2};
    case 'boot3':
      return {main: 'SIGNAL OK', sub: 'OK', bars: 5};
    case 'incoming':
      return {main: '1 NEW PAGE', sub: state.signal?.source ? `〈${state.signal.source.title}〉` : '未署名'};
    case 'preview':
      return {marquee: state.signal?.text, sub: '▸ 按 ↗ 展開'};
    case 'waiting':
      return {main: '1 NEW PAGE', sub: '▸ 按 ↗ 展開'};
    case 'reading':
      return {main: 'PAGE 1/1', sub: '已收下'};
    case 'sent':
      return {main: '訊號已出發', sub: 'SENT ▸▸▸', bars: 3};
    case 'delivered':
      return {main: '已抵達對岸', sub: 'SENT ✓'};
    default:
      if (apiStatus === 'offline') {
        return {main: '儲存未連線', sub: '訊號尚未送出'};
      }
      return {main: '收訊中', sub: clock};
  }
}

// Find the length along the wave path whose on-screen x is closest to `x`.
// The wave only ever moves rightward, so a binary search is enough.
function lengthAtScreenX(path, x) {
  const matrix = path.getScreenCTM();
  let low = 0;
  let high = path.getTotalLength();
  for (let i = 0; i < 28; i++) {
    const mid = (low + high) / 2;
    const point = path.getPointAtLength(mid).matrixTransform(matrix);
    if (point.x < x) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;

// 收訊 Signal: two pagers on the river — the past bank (MT01) and the today
// bank (MT02). A released signal travels along the wave as a red point and
// arrives, unsigned, at the other bank.
export default function SignalRiver({onSelectDay}) {
  const {siteConfig} = useDocusaurusContext();
  const apiBase = String(siteConfig.customFields?.signalApiBaseUrl || '').replace(/\/$/, '');
  const rootRef = useRef(null);
  const pagerRefs = useRef({past: null, today: null}).current;
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const timersRef = useRef([]);
  const travelRef = useRef(null);
  const replyHintAtRef = useRef({});
  const [banks, setBanks] = useState({past: {phase: 'off'}, today: {phase: 'off'}});
  const banksRef = useRef(banks);
  banksRef.current = banks;
  const [clock, setClock] = useState('--:--');
  const [coarse, setCoarse] = useState(false);
  const [writeHint, setWriteHint] = useState(false);
  const [traveling, setTraveling] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiBase ? 'connecting' : 'unconfigured');
  const flightRef = useRef(false);
  const seenSignalIds = useRef(new Set());
  // Signals this visitor sent and can still take back: {id: {key, writtenAt}}.
  const [ownSignals, setOwnSignals] = useState({});

  useEffect(() => setOwnSignals(loadOwnSignals()), []);

  const rememberOwnSignal = useCallback((id, own) => {
    setOwnSignals(current => {
      const next = {...loadOwnSignals(), ...current, [id]: own};
      saveOwnSignals(next);
      return next;
    });
  }, []);

  const forgetOwnSignal = useCallback((id) => {
    setOwnSignals(current => {
      const next = {...current};
      delete next[id];
      saveOwnSignals(next);
      return next;
    });
  }, []);

  const later = useCallback((delay, fn) => {
    const timer = window.setTimeout(fn, delay);
    timersRef.current.push(timer);
  }, []);

  const setBank = useCallback((bank, next) => {
    setBanks((current) => ({...current, [bank]: {...current[bank], ...next}}));
  }, []);

  const deliver = useCallback(
    (bank, signal) => {
      const arrived = signal.id ? signal : {...signal, id: 'first-arrival', from: OTHER[bank], writtenAt: Date.now()};
      setHistory(current => recordSignal(current, arrived));
      setBanks(current => ({...current, [bank]: {...current[bank], phase: current[bank].phase === 'compose' ? 'compose' : 'incoming', signal: arrived}}));
      later(prefersReducedMotion() ? 0 : 1200, () =>
        setBanks((current) =>
          current[bank].phase === 'incoming'
            ? {...current, [bank]: {...current[bank], phase: prefersReducedMotion() ? 'waiting' : 'preview'}}
            : current,
        ),
      );
    },
    [later, setBank],
  );

  const loadSignals = useCallback(async (announce = false) => {
    if (!apiBase) {
      setApiStatus('unconfigured');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/signals`, {headers: {Accept: 'application/json'}});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const stored = await response.json();
      const signals = Array.isArray(stored) ? stored : [];
      setHistory(signals);
      setApiStatus('connected');

      const chronological = signals.flatMap(signal => [signal, ...(signal.replies || [])])
        .sort((a, b) => a.writtenAt - b.writtenAt);
      const unseen = chronological.filter(signal => !seenSignalIds.current.has(signal.id));
      chronological.forEach(signal => seenSignalIds.current.add(signal.id));
      if (announce && unseen.length) {
        const latest = unseen[unseen.length - 1];
        const bank = OTHER[latest.from];
        if (bank) deliver(bank, latest);
      } else if (!announce && chronological.length) {
        const latest = chronological[chronological.length - 1];
        const bank = OTHER[latest.from];
        if (bank) setBank(bank, {phase: 'waiting', signal: latest});
      }
    } catch {
      setApiStatus('offline');
    }
  }, [apiBase, deliver, setBank]);

  // Both pagers boot on entry; persisted messages are loaded separately below.
  useEffect(() => {
    const coarseQuery = window.matchMedia('(max-width: 596px), (pointer: coarse) and (hover: none)');
    setCoarse(coarseQuery.matches);
    const syncCoarse = () => setCoarse(coarseQuery.matches);
    coarseQuery.addEventListener('change', syncCoarse);

    try {
      setWriteHint(window.localStorage.getItem(WRITE_HINT_KEY) !== '1');
    } catch {
      setWriteHint(true);
    }

    setClock(clockNow());
    const clockTimer = window.setInterval(() => setClock(clockNow()), 30000);
    const reduced = prefersReducedMotion();

    BANKS.forEach((bank) => {
      if (reduced) {
        setBank(bank, {phase: 'idle'});
        return;
      }
      BOOT.forEach(([offset, phase]) => later(offset + BANK_DELAY[bank], () =>
        // Boot only advances a bank that is still booting, so a signal restored
        // from the API before boot ends is not wiped back to idle.
        setBanks((current) => (BOOTING.includes(current[bank].phase)
          ? {...current, [bank]: {...current[bank], phase}}
          : current))));
    });

    return () => {
      coarseQuery.removeEventListener('change', syncCoarse);
      window.clearInterval(clockTimer);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      if (travelRef.current) {
        window.cancelAnimationFrame(travelRef.current);
      }
    };
  }, [later, setBank]);

  useEffect(() => {
    if (!apiBase) {
      setApiStatus('unconfigured');
      return undefined;
    }

    // Let the pager boot animation finish before restoring the latest inbox.
    const initialLoad = window.setTimeout(() => loadSignals(false), 2200);
    const poll = window.setInterval(() => loadSignals(true), 12000);
    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') loadSignals(true);
    };
    window.addEventListener('focus', refreshOnReturn);
    document.addEventListener('visibilitychange', refreshOnReturn);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(poll);
      window.removeEventListener('focus', refreshOnReturn);
      document.removeEventListener('visibilitychange', refreshOnReturn);
    };
  }, [apiBase, loadSignals]);

  // The red point drifts along the actual wave line, lighting the days it passes.
  const travel = useCallback(
    (from, to, onArrive) => {
      const hero = rootRef.current?.closest('section');
      const path = hero?.querySelector('[data-wave-path]');
      const fromEl = pagerRefs[from];
      const toEl = pagerRefs[to];
      if (!path || !fromEl || !toEl || prefersReducedMotion()) {
        onArrive();
        return;
      }

      const centerX = (element) => {
        const rect = element.getBoundingClientRect();
        return rect.left + rect.width / 2;
      };
      const startLength = lengthAtScreenX(path, centerX(fromEl));
      const endLength = lengthAtScreenX(path, centerX(toEl));
      const duration = readMsToken(rootRef.current, '--journal-signal-travel', 3600);
      const nodes = Array.from(hero.querySelectorAll('[data-day-node]'));
      const dot = dotRef.current;
      const trail = trailRefs.current;
      const start = performance.now();
      setTraveling(true);

      const place = (element, t) => {
        if (!element) {
          return null;
        }
        const length = startLength + (endLength - startLength) * easeInOut(Math.min(1, Math.max(0, t)));
        const point = path.getPointAtLength(length).matrixTransform(path.getScreenCTM());
        element.style.transform = `translate(${point.x}px, ${point.y}px)`;
        return point;
      };

      function frame(now) {
        const t = (now - start) / duration;
        const point = place(dot, t);
        trail.forEach((element, index) => place(element, t - (index + 1) * 0.018));
        nodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (Math.abs(rect.left + rect.width / 2 - point.x) < 10 && !node.dataset.signalLit) {
            node.dataset.signalLit = 'true';
            window.setTimeout(() => delete node.dataset.signalLit, 1400);
          }
        });

        if (t < 1) {
          travelRef.current = window.requestAnimationFrame(frame);
        } else {
          travelRef.current = null;
          setTraveling(false);
          onArrive();
        }
      }

      travelRef.current = window.requestAnimationFrame(frame);
    },
    [pagerRefs],
  );

  async function release(bank, text) {
    if (flightRef.current) return false;
    flightRef.current = true;
    setSending(true);
    const signal = {text, departed: 'today', from: bank, writtenAt: Date.now(),
      id: crypto.randomUUID().replaceAll('-', ''), threadId: banksRef.current[bank].replyToId || undefined};
    // Counted from before the request, so the countdown never outlives the server's window.
    const own = {key: crypto.randomUUID().replaceAll('-', ''), writtenAt: Date.now()};

    // Without a configured API (e.g. the static site before a host exists),
    // signals still travel, but only within this visit.
    if (apiBase) {
      try {
        const response = await fetch(`${apiBase}/api/signals`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify({id: signal.id, text, from: bank, threadId: signal.threadId || null, deleteKey: own.key}),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const saved = await response.json();
        signal.id = saved.id;
        signal.writtenAt = saved.createdAt;
        seenSignalIds.current.add(signal.id);
        setApiStatus('connected');
      } catch {
        flightRef.current = false;
        setSending(false);
        setApiStatus('offline');
        return false;
      }
    }

    rememberOwnSignal(signal.id, own);

    try {
      window.localStorage.setItem(WRITE_HINT_KEY, '1');
    } catch {
      // A private window just keeps the hint.
    }
    setWriteHint(false);
    setBank(bank, {phase: 'sent', signal: null, lastSent: text, replyToId: null});
    const other = OTHER[bank];
    // The far bank wakes to full size while the signal is on its way.
    setBanks((current) =>
      ['compose', 'reading'].includes(current[other].phase)
        ? current
        : {...current, [other]: {...current[other], phase: 'idle', awaiting: true}},
    );
    later(prefersReducedMotion() ? 0 : 600, () =>
      travel(bank, other, () => {
        flightRef.current = false;
        setSending(false);
        setBank(bank, {phase: 'delivered'});
        setBank(other, {awaiting: false});
        deliver(other, signal);
        later(3000, () =>
          setBanks((current) =>
            current[bank].phase === 'delivered' ? {...current, [bank]: {...current[bank], phase: 'idle'}} : current,
          ),
        );
      }),
    );
    return true;
  }

  function beginCompose(bank, replyToId) {
    replyHintAtRef.current = {};
    setBanks(current => {
      const other = OTHER[bank];
      return {...current,
        [other]: {...current[other], phase: current[other].phase === 'compose' ? 'idle' : current[other].phase, replyHint: false},
        [bank]: {...current[bank], phase: 'compose', replyHint: false, replyToId: replyToId || null},
      };
    });
  }

  // Take back one of this visitor's own signals (and any replies to it).
  async function deleteOwnSignal(id) {
    const own = ownSignals[id];
    if (!own) return false;
    if (apiBase) {
      try {
        const response = await fetch(`${apiBase}/api/signals/${id}`, {
          method: 'DELETE',
          headers: {'X-Delete-Key': own.key},
        });
        // 404: already gone. 403: the window closed; stop offering it.
        if (response.status === 403) forgetOwnSignal(id);
        if (!response.ok && response.status !== 404) return false;
      } catch {
        setApiStatus('offline');
        return false;
      }
    }

    forgetOwnSignal(id);
    setHistory(current => removeSignal(current, id));
    setBanks(current => Object.fromEntries(Object.entries(current).map(([bank, state]) =>
      [bank, state.signal?.id === id || state.signal?.threadId === id
        ? {...state, phase: ['incoming', 'preview', 'waiting', 'reading'].includes(state.phase) ? 'idle' : state.phase, signal: null}
        : state])));
    return true;
  }

  function replyFromHistory(entry) {
    if (flightRef.current) return;
    const bank = replyBankFor(entry);
    flushSync(() => beginCompose(bank, entry.id));
    pagerRefs[bank]?.querySelector('input')?.focus({preventScroll: true});
  }

  const isSmall = (bank) =>
    bank === 'today' && banks.today.phase === 'idle' && !banks.today.awaiting && !banks.today.replyHint;

  return (
    <div ref={rootRef} className={styles.river}>
      {BANKS.map((bank) => {
        const state = banks[bank];
        const ledOn = ['incoming', 'preview', 'waiting'].includes(state.phase);
        return (
          <div key={bank} className={styles[bank]} data-composing={state.phase === 'compose' ? '' : undefined}>
            <SignalPager
              ref={(element) => {
                pagerRefs[bank] = element;
              }}
              model={MODEL[bank]}
              gray={bank === 'today'}
              small={isSmall(bank)}
              lcd={lcdFor(bank, state, clock, apiStatus)}
              led={ledOn}
              phase={state.phase}
              signal={ledOn || state.phase === 'reading' ? state.signal : null}
              writeHint={
                // While one pager is asking for a reply, the other stays quiet.
                (state.replyHint || (writeHint && !banks[OTHER[bank]].replyHint))
                && ['idle', 'waiting'].includes(state.phase)
              }
              replyHint={Boolean(state.replyHint) && state.phase !== 'compose'}
              coarse={coarse}
              onRead={() => {
                // The bank that received a signal is the one to answer from.
                setBanks((current) => ({
                  past: {...current.past, replyHint: false},
                  today: {...current.today, replyHint: false},
                  [bank]: {...current[bank], phase: 'reading', replyHint: true},
                }));
                const readAt = Date.now();
                replyHintAtRef.current[bank] = readAt;
                later(30000, () => {
                  if (replyHintAtRef.current[bank] === readAt) {
                    setBank(bank, {replyHint: false});
                  }
                });
              }}
              onCloseSlip={() => setBank(bank, {phase: 'idle', signal: null})}
              busy={sending}
              onWrite={reply => beginCompose(bank, reply ? state.signal?.threadId || state.signal?.id : null)}
              onCancel={() => setBank(bank, {phase: state.signal ? 'waiting' : 'idle', replyToId: null})}
              onRelease={(text) => release(bank, text)}
              onPreviewEnd={() =>
                setBanks((current) =>
                  current[bank].phase === 'preview' ? {...current, [bank]: {...current[bank], phase: 'waiting'}} : current,
                )
              }
              onSource={(source) => onSelectDay?.(source.dayKey)}
              ownSignal={state.signal ? ownSignals[state.signal.id] : null}
              onDeleteOwn={() => deleteOwnSignal(state.signal.id)}
            />
          </div>
        );
      })}
      {apiStatus !== 'connected' ? (
        <span className={styles.connectionStatus} role="status">
          {apiStatus === 'connecting'
            ? '訊號連線中…'
            : apiStatus === 'offline'
              ? '訊號暫時送不出去，請稍後再放一次。'
              : '訊號只留在這次造訪，重新整理後不會保存。'}
        </span>
      ) : null}
      <SignalLightYears
        entries={history}
        busy={sending}
        ownSignals={ownSignals}
        onDeleteOwn={deleteOwnSignal}
        onReply={replyFromHistory}
        onSource={source => onSelectDay?.(source.dayKey)}
      />
      <span className={styles.trailLayer} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            ref={(element) => {
              trailRefs.current[index] = element;
            }}
            className={styles.trail}
            style={{opacity: traveling ? 0.45 - index * 0.08 : 0}}
          />
        ))}
        <span ref={dotRef} className={styles.dot} style={{opacity: traveling ? 1 : 0}} />
      </span>
      <span className={styles.srOnly} aria-live="polite">
        {banks.today.phase === 'incoming' || banks.past.phase === 'incoming' ? '收到一則訊號' : ''}
        {banks.past.phase === 'delivered' || banks.today.phase === 'delivered' ? '訊號已抵達對岸' : ''}
      </span>
    </div>
  );
}
