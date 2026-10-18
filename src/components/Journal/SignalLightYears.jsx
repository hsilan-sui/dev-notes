import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './SignalLightYears.module.css';
import lockJournalScroll from './lockJournalScroll';
import SignalDeleteButton from './SignalDeleteButton.jsx';
import {nightness, skyAt} from './signalSky.js';
import {PRESET_TONES, toneLabel, useSignalLang} from './signalI18n.js';

const MODEL = {past: 'MT01', today: 'MT02'};
const OTHER = {past: 'today', today: 'past'};
const SEEN_KEY = 'mytide.lightyears.seenAt';
// The river, in px: one signal every STEP along the time axis.
const STEP = 150;
const PAD = 56;
const CARD = 240;
const TONE_COLOR = {說: '#5C7285', 想: '#6B4F7A', 覺得: '#2F6B63', 希望: '#9A4A22', 問: '#345E8A'};
const CUSTOM_TONE_COLOR = '#4A5560';

export const replyBankFor = entry => OTHER[entry.replies.at(-1)?.from || entry.from];

const pad2 = value => String(value).padStart(2, '0');
const timeOf = value => {
  const date = new Date(value);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};
const dayOf = value => {
  const date = new Date(value);
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
};
const isToday = value => new Date(value).toDateString() === new Date().toDateString();

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 596px)');
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return mobile;
}

function PagerIcon({bank}) {
  return (
    <svg className={styles.avatar} data-bank={bank} viewBox="0 0 28 20" aria-hidden="true">
      <rect x="0.5" y="0.5" width="27" height="19" rx="4" />
      <rect className={styles.avatarScreen} x="5" y="4" width="18" height="7" rx="1" />
      <circle cx="9" cy="15" r="1.4" /><circle cx="14" cy="15" r="1.4" /><circle cx="19" cy="15" r="1.4" />
    </svg>
  );
}

function Byline({signal, t}) {
  const tone = signal.tone || '說';
  return (
    <span className={styles.byline}>
      <PagerIcon bank={signal.from} />
      <span className={styles.model} data-bank={signal.from}>{MODEL[signal.from]}</span>
      <span className={styles.tone} style={{background: TONE_COLOR[tone] || CUSTOM_TONE_COLOR}}
        data-custom={PRESET_TONES.includes(tone) ? undefined : ''}>{toneLabel(t, tone)}</span>
      <time className={styles.time} dateTime={new Date(signal.writtenAt).toISOString()}>{timeOf(signal.writtenAt)}</time>
    </span>
  );
}

// One signal, Plurk-style: who, in what tone, when — and its replies opening
// right below it.
function SignalCard({entry, open, unread, onToggle, ownSignals, onDeleteOwn, onSource, onReply, busy, t, style}) {
  const bank = replyBankFor(entry);
  return (
    <article className={styles.card} style={style} data-open={open || undefined} data-unread={unread || undefined}
      onClick={event => { if (!event.target.closest('button, a')) onToggle(); }}>
      <button type="button" className={styles.cardHead} aria-expanded={open} aria-controls={`signal-thread-${entry.id}`}
        aria-label={`${MODEL[entry.from]} ${toneLabel(t, entry.tone)} ${timeOf(entry.writtenAt)}：${entry.text}`} onClick={onToggle}>
        <Byline signal={entry} t={t} />
      </button>
      <p className={styles.text} dir="auto">
        {entry.text}
        {entry.source ? (
          <button type="button" className={styles.source} onClick={() => onSource(entry.source)}>
            —— {t.pager.source(entry.source.title)}
          </button>
        ) : null}
      </p>
      {entry.replies.length > 0 ? <span className={styles.count} aria-hidden="true">{entry.replies.length}</span> : null}
      {ownSignals[entry.id] ? (
        <span className={styles.ownDelete}>
          <SignalDeleteButton writtenAt={ownSignals[entry.id].writtenAt} onDelete={() => onDeleteOwn(entry.id)} />
        </span>
      ) : null}
      {open ? (
        <div id={`signal-thread-${entry.id}`} className={styles.thread}>
          {entry.replies.length ? (
            <>
              <p className={styles.threadCount}>{t.years.replies(entry.replies.length)}</p>
              <div className={styles.replies} data-scroll-y="">
                {entry.replies.map(reply => (
                  <div className={styles.reply} key={reply.id}>
                    <span className={styles.replyHead}>
                      <Byline signal={reply} t={t} />
                      {ownSignals[reply.id] ? (
                        <SignalDeleteButton writtenAt={ownSignals[reply.id].writtenAt} onDelete={() => onDeleteOwn(reply.id)} />
                      ) : null}
                    </span>
                    <p dir="auto">{reply.text}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          <button type="button" className={styles.replyAction} disabled={busy} onClick={() => onReply(entry)}>
            {t.years.replyFrom(MODEL[bank])} →
          </button>
        </div>
      ) : null}
    </article>
  );
}

function SignalSheet({entries, onReply, onSource, onClosed, busy, ownSignals, onDeleteOwn}) {
  const {t} = useSignalLang();
  const mobile = useMobile();
  const [openId, setOpenId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [frame, setFrame] = useState([0.7, 1]);
  const panel = useRef(null);
  const scroller = useRef(null);
  const drag = useRef(null);
  const closingRef = useRef(false);
  const seenBefore = useRef(Infinity);

  useEffect(() => {
    try {
      // A first visit marks nothing as new; after that, what arrived since.
      const stored = window.localStorage.getItem(SEEN_KEY);
      seenBefore.current = stored ? Number(stored) : Infinity;
      window.localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      seenBefore.current = Infinity;
    }
  }, []);
  const isUnread = signal => signal.writtenAt > seenBefore.current && !ownSignals[signal.id];

  useLayoutEffect(() => {
    const node = panel.current;
    const unlock = lockJournalScroll();
    node.focus({preventScroll: true});
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = typeof node.animate === 'function'
      ? node.animate(reduced ? {opacity: [0, 1]} : {opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0)']},
        {duration: reduced ? 150 : 280, easing: 'ease-out'})
      : null;
    // The mini TV (TodaySong) steps aside while this panel is open.
    window.dispatchEvent(new CustomEvent('mytide:overlay', {detail: {open: true}}));
    return () => {
      animation?.cancel();
      unlock();
      window.dispatchEvent(new CustomEvent('mytide:overlay', {detail: {open: false}}));
    };
  }, []);

  // Open on the newest signals: the far right of the river, the top of the list.
  useLayoutEffect(() => {
    const region = scroller.current;
    if (!region) return;
    if (mobile) region.scrollTop = 0;
    else region.scrollLeft = region.scrollWidth;
  }, [mobile, entries.length]);

  // A mouse wheel moves the river sideways, except inside a long reply list.
  useEffect(() => {
    const region = scroller.current;
    if (!region || mobile) return undefined;
    function wheel(event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const list = event.target.closest('[data-scroll-y]');
      if (list && list.scrollHeight > list.clientHeight) return;
      event.preventDefault();
      region.scrollLeft += event.deltaY;
    }
    region.addEventListener('wheel', wheel, {passive: false});
    return () => region.removeEventListener('wheel', wheel);
  }, [mobile]);

  function close(callback) {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const node = panel.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof node.animate !== 'function') { onClosed(callback); return; }
    node.animate(reduced ? {opacity: [1, 0]} : {opacity: [1, 0], transform: ['translateY(0)', 'translateY(24px)']},
      {duration: reduced ? 150 : 220, easing: 'ease-in', fill: 'forwards'})
      .finished.then(() => onClosed(callback), () => {});
  }

  function keys(event) {
    // Arrow keys belong to this river, never to the article carousel below.
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      if (openId) setOpenId(null);
      else close();
    }
    if (event.key === 'Tab') {
      const focusable = Array.from(panel.current.querySelectorAll('button:not(:disabled), [tabindex="0"]'));
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first?.focus(); }
    }
  }

  const toggle = id => setOpenId(current => (current === id ? null : id));
  const reply = entry => {
    if (busy) return;
    // Opening the pager's input inside this click keeps mobile keyboards available.
    onReply(entry);
    close(() => {});
  };
  const source = target => close(() => onSource(target));
  const replyCount = entries.reduce((sum, entry) => sum + entry.replies.length, 0);
  const cardProps = {ownSignals, onDeleteOwn, onSource: source, onReply: reply, busy, t};

  // Days the river passes, for the jump pills (the last few).
  const days = useMemo(() => {
    const seen = new Map();
    entries.forEach((entry, index) => { const day = dayOf(entry.writtenAt); if (!seen.has(day)) seen.set(day, index); });
    return Array.from(seen, ([day, index]) => ({day, index, today: isToday(entries[index].writtenAt)})).slice(-4);
  }, [entries]);

  function jumpTo(index) {
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (mobile) {
      scroller.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({behavior, block: 'start'});
    } else {
      const region = scroller.current;
      if (region) region.scrollTo({left: region.scrollWidth - (Math.max(0, entries.length - 1 - index) * STEP) - region.clientWidth + 120, behavior});
    }
  }

  function pointerDown(event) {
    if (mobile || event.button !== 0 || event.target.closest('article, button, a')) return;
    drag.current = {x: event.clientX, left: scroller.current.scrollLeft};
  }
  function pointerMove(event) {
    if (!drag.current) return;
    scroller.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
  }
  const endDrag = () => { drag.current = null; };

  // Phones: where the visible part of the list sits on the little river above.
  function syncFrame() {
    const list = scroller.current;
    if (!list || !entries.length) return;
    const rows = Array.from(list.querySelectorAll('[data-index]'));
    const top = list.scrollTop, bottom = top + list.clientHeight;
    const visible = rows.filter(row => row.offsetTop + row.offsetHeight > top && row.offsetTop < bottom)
      .map(row => Number(row.dataset.index));
    if (!visible.length) return;
    const last = Math.max(1, entries.length - 1);
    setFrame([Math.min(...visible) / last, Math.max(...visible) / last]);
  }
  useEffect(() => { if (mobile) syncFrame(); }, [mobile, entries.length, openId]);

  const skyStops = (positions) => positions.map(([color, at]) => `${color} ${at}`).join(', ');

  let body;
  if (!entries.length) {
    body = <p className={styles.empty}>{t.years.empty}</p>;
  } else if (mobile) {
    const newestFirst = entries.map((entry, index) => ({entry, index})).reverse();
    const stripStops = entries.map((entry, index) => [skyAt(entry.writtenAt), `${(index / Math.max(1, entries.length - 1)) * 100}%`]);
    body = (
      <>
        <div className={styles.strip} aria-hidden="true">
          <div className={styles.stripSky} style={{background: `linear-gradient(90deg, ${skyStops(stripStops)})`}}>
            {entries.map((entry, index) => (
              <span key={entry.id} className={styles.stripDot} data-unread={isUnread(entry) || undefined}
                style={{left: `${(index / Math.max(1, entries.length - 1)) * 100}%`}} />
            ))}
            <span className={styles.stripFrame} style={{left: `calc(${frame[0] * 100}% - 6px)`, width: `calc(${(frame[1] - frame[0]) * 100}% + 12px)`}} />
          </div>
          <div className={styles.stripLabels}>
            <span>{dayOf(entries[0].writtenAt)}</span>
            <span className={styles.now}>{t.years.now}</span>
          </div>
        </div>
        <div ref={scroller} className={styles.list} tabIndex={0} aria-label={t.years.timeline} onScroll={syncFrame}>
          {newestFirst.map(({entry, index}, position) => {
            const older = newestFirst[position + 1]?.entry;
            const startsDay = position === 0 || dayOf(newestFirst[position - 1].entry.writtenAt) !== dayOf(entry.writtenAt);
            const dark = nightness(entry.writtenAt) > 0.45;
            return (
              <div key={entry.id} className={styles.row} data-index={index} data-dark={dark || undefined}
                style={{'--sky': skyAt(entry.writtenAt), '--sky-next': skyAt((older || entry).writtenAt), '--night': nightness(entry.writtenAt)}}>
                {startsDay ? (
                  <p className={styles.dayHead}>{dayOf(entry.writtenAt)}{isToday(entry.writtenAt) ? ` ${t.years.today}` : ''}</p>
                ) : null}
                <SignalCard entry={entry} open={openId === entry.id} unread={isUnread(entry)} onToggle={() => toggle(entry.id)} {...cardProps} />
              </div>
            );
          })}
        </div>
      </>
    );
  } else {
    const width = PAD * 2 + CARD + Math.max(0, entries.length - 1) * STEP + 48;
    // The newest signals sit toward 「現在」 on the right; with only a few,
    // the sky of the earliest one fills the room to their left.
    const xOf = index => `calc(100% - ${width - PAD - index * STEP}px)`;
    const anchorOf = index => `calc(100% - ${width - PAD - index * STEP - 18}px)`;
    const stops = entries.map((entry, index) => [skyAt(entry.writtenAt), anchorOf(index)]);
    const nightStops = entries.map((entry, index) => [`rgba(0, 0, 0, ${nightness(entry.writtenAt).toFixed(2)})`, anchorOf(index)]);
    const dusk = entries.map((entry, index) => ({index, hour: new Date(entry.writtenAt).getHours() + new Date(entry.writtenAt).getMinutes() / 60}))
      .filter(({hour}) => (hour > 17 && hour < 19.4) || (hour > 5 && hour < 6.6));
    body = (
      <div ref={scroller} className={styles.river} tabIndex={0} aria-label={t.years.timeline}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}
        data-has-open={openId ? '' : undefined}>
        <div className={styles.track} style={{width: `max(100%, ${width}px)`}}>
          <div className={styles.sky} aria-hidden="true" style={{background: `linear-gradient(90deg, ${skyStops(stops)})`}} />
          <div className={styles.nightShade} aria-hidden="true" style={{WebkitMaskImage: `linear-gradient(90deg, ${skyStops(nightStops)})`, maskImage: `linear-gradient(90deg, ${skyStops(nightStops)})`}} />
          {dusk.map(({index}) => (
            <span key={`dusk-${index}`} className={styles.duskGlow} aria-hidden="true" style={{left: `calc(${anchorOf(index)} - 210px)`}} />
          ))}
          <div className={styles.stars} aria-hidden="true" style={{WebkitMaskImage: `linear-gradient(90deg, ${skyStops(nightStops)})`, maskImage: `linear-gradient(90deg, ${skyStops(nightStops)})`}}>
            <span className={styles.starsA} /><span className={styles.starsB} />
          </div>
          <div className={styles.axis} aria-hidden="true" />
          {entries.map((entry, index) => {
            const lane = index % 3;
            const startsDay = index === 0 || dayOf(entries[index - 1].writtenAt) !== dayOf(entry.writtenAt);
            const dark = nightness(entry.writtenAt) > 0.45;
            return (
              <span key={`mark-${entry.id}`} aria-hidden="true">
                <span className={styles.drop} data-dark={dark || undefined} style={{left: anchorOf(index), '--lane': lane}} />
                <span className={styles.node} data-unread={isUnread(entry) || undefined} style={{left: anchorOf(index)}} />
                <span className={styles.tick} style={{left: anchorOf(index)}}>{timeOf(entry.writtenAt)}</span>
                {startsDay ? (
                  <span className={styles.dayFlag} style={{left: anchorOf(index)}}>
                    {dayOf(entry.writtenAt)}{isToday(entry.writtenAt) ? ` ${t.years.today}` : ''}
                  </span>
                ) : null}
              </span>
            );
          })}
          {entries.map((entry, index) => (
            <SignalCard key={entry.id} entry={entry} open={openId === entry.id} unread={isUnread(entry)}
              onToggle={() => toggle(entry.id)} style={{left: xOf(index), '--lane': index % 3}} {...cardProps} />
          ))}
          <span className={styles.nowMark} aria-hidden="true" style={{left: `calc(${anchorOf(entries.length - 1)} + ${CARD - 20}px)`}}>{t.years.now}</span>
        </div>
        <span className={styles.dragHint} aria-hidden="true">{t.years.drag}</span>
      </div>
    );
  }

  return createPortal(
    <div className="journal-scope">
      <div className={styles.backdrop} onClick={() => close()} />
      <section ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="signal-lightyears-title"
        tabIndex={-1} onKeyDown={keys} data-closing={closing || undefined}>
        <div className={styles.handle} aria-hidden="true" onPointerDown={event => { drag.current = {y: event.clientY}; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={event => {
          if (drag.current && event.clientY - drag.current.y > 60) close();
          drag.current = null;
        }} />
        <header className={styles.header}>
          <div className={styles.titles}>
            <h2 id="signal-lightyears-title">{t.years.title}</h2>
            <p>{t.years.summary(entries.length, replyCount)}</p>
          </div>
          <div className={styles.headerActions}>
            {days.length > 1 ? days.map(({day, index, today}) => (
              <button type="button" key={day} className={styles.dayPill} data-today={today || undefined} onClick={() => jumpTo(index)}>
                {day}{today ? ` ${t.years.today}` : ''}
              </button>
            )) : null}
            <button type="button" className={styles.back} onClick={() => close()}>{t.years.back}</button>
          </div>
        </header>
        <div className={styles.body}>{body}</div>
      </section>
    </div>, document.body,
  );
}

export default function SignalLightYears({entries, onReply, onSource, busy, ownSignals = {}, onDeleteOwn}) {
  const {t} = useSignalLang();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const trigger = useRef(null);
  const count = entries.length + entries.reduce((sum, entry) => sum + entry.replies.length, 0);
  useEffect(() => { if (open) setSeen(count); }, [open, count]);
  return <>
    <button ref={trigger} type="button" className={styles.trigger} onClick={() => { setOpen(true); setSeen(count); }} aria-haspopup="dialog" aria-expanded={open}>
      <span className={styles.book} aria-hidden="true"><i /><i /><i /><i /></span>
      <span>{t.years.trigger(count)}</span><span aria-hidden="true">›</span>
      {count > seen ? <span className={styles.unread} aria-label={t.years.unread} /> : null}
    </button>
    {open ? <SignalSheet entries={entries} busy={busy} ownSignals={ownSignals} onDeleteOwn={onDeleteOwn} onReply={entry => { if (!busy) onReply(entry); }} onSource={onSource} onClosed={callback => {
      setOpen(false);
      if (callback) callback();
      else trigger.current?.focus({preventScroll: true});
    }} /> : null}
  </>;
}
