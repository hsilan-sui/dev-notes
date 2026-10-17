import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './SignalLightYears.module.css';
import lockJournalScroll from './lockJournalScroll';

const MODEL = {past: 'MT01', today: 'MT02'};
const OTHER = {past: 'today', today: 'past'};
const formatTime = value => new Intl.DateTimeFormat('zh-TW', {hour: '2-digit', minute: '2-digit', hour12: false}).format(new Date(value));
const formatDay = value => new Intl.DateTimeFormat('zh-TW', {month: '2-digit', day: '2-digit'}).format(new Date(value));
export const replyBankFor = entry => OTHER[entry.replies.at(-1)?.from || entry.from];

function SignalSheet({entries, onReply, onSource, onClosed, busy}) {
  const [selected, setSelected] = useState(null);
  const [closing, setClosing] = useState(false);
  const panel = useRef(null);
  const scroll = useRef(null);
  const pages = useRef([]);
  const gestures = useRef(null);
  const animation = useRef([]);
  const closingRef = useRef(false);
  const afterClose = useRef(null);

  useLayoutEffect(() => {
    const node = panel.current;
    const unlock = lockJournalScroll();
    node.focus({preventScroll: true});
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(max-width: 596px)').matches;
    const tokens = getComputedStyle(node);
    const duration = parseFloat(tokens.getPropertyValue('--journal-lightyears-unfold'));
    const stagger = parseFloat(tokens.getPropertyValue('--journal-lightyears-stagger'));
    if (typeof node.animate === 'function') {
      if (reduced) animation.current.push(node.animate({opacity: [0, 1]}, {duration: 150}));
      else pages.current.filter(Boolean).forEach((page, index) => {
        animation.current.push(page.animate(
          {opacity: [0, 1], transform: mobile ? ['perspective(900px) rotateX(-65deg)', 'perspective(900px) rotateX(0deg)'] : ['perspective(900px) rotateY(-70deg)', 'perspective(900px) rotateY(0deg)']},
          {duration, delay: index * stagger, easing: 'ease-out', fill: 'backwards'},
        ));
      });
    }
    return () => {
      animation.current.forEach(item => item.cancel());
      unlock();
    };
  }, []);

  useEffect(() => {
    const region = scroll.current;
    if (!region) return;
    if (matchMedia('(max-width: 596px)').matches) region.scrollTop = region.scrollHeight;
    else region.scrollLeft = region.scrollWidth;
  }, [entries.length]);

  function close(callback) {
    if (closingRef.current) return;
    closingRef.current = true;
    afterClose.current = callback;
    setClosing(true);
    animation.current.forEach(item => item.cancel());
    const node = panel.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(max-width: 596px)').matches;
    const tokens = getComputedStyle(node);
    const duration = parseFloat(tokens.getPropertyValue('--journal-lightyears-unfold'));
    const stagger = parseFloat(tokens.getPropertyValue('--journal-lightyears-stagger'));
    if (typeof node.animate !== 'function') { onClosed(callback); return; }
    const all = pages.current.filter(Boolean);
    const finish = reduced || !all.length
      ? node.animate({opacity: [1, 0]}, {duration: 150, fill: 'forwards'}).finished
      : Promise.all(all.map((page, index) => {
        const item = page.animate(
          {opacity: [1, 0], transform: mobile ? ['perspective(900px) rotateX(0deg)', 'perspective(900px) rotateX(-65deg)'] : ['perspective(900px) rotateY(0deg)', 'perspective(900px) rotateY(-70deg)']},
          {duration, delay: (mobile ? index : all.length - 1 - index) * stagger, easing: 'ease-in', fill: 'forwards'},
        );
        animation.current.push(item);
        return item.finished;
      }));
    Promise.resolve(finish).then(() => onClosed(afterClose.current), () => {});
  }
  function keys(event) {
    // Arrow keys belong to this timeline, never to the article carousel below.
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const focusable = Array.from(panel.current.querySelectorAll('button:not(:disabled), [tabindex="0"]'));
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first?.focus(); }
    }
  }
  function pointerDown(event) {
    if (event.target.closest('button')) return;
    gestures.current = {x: event.clientX, y: event.clientY, left: scroll.current.scrollLeft, pointer: event.pointerId};
  }
  function pointerMove(event) {
    const start = gestures.current;
    if (!start || matchMedia('(max-width: 596px)').matches) return;
    scroll.current.scrollLeft = start.left - (event.clientX - start.x);
  }

  return createPortal(
    <div className="journal-scope">
      <div className={styles.backdrop} onClick={() => close()} />
      <section ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="signal-lightyears-title" tabIndex={-1} onKeyDown={keys} data-closing={closing || undefined}>
        <div className={styles.handle} aria-hidden="true" onPointerDown={event => { gestures.current = {y: event.clientY}; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={event => {
          if (gestures.current && event.clientY - gestures.current.y > 60) close();
          gestures.current = null;
        }} />
        <header className={styles.header}>
          <div><h2 id="signal-lightyears-title">訊號光年</h2><p>匿名 · 本次相遇 · {entries.length} 則訊號 · {entries.reduce((sum, entry) => sum + entry.replies.length, 0)} 句回應</p></div>
          <button type="button" onClick={() => close()}>← 折返</button>
        </header>
        <div ref={scroll} className={styles.timeline} tabIndex={0} aria-label="訊號時間線，桌面左右捲動，手機上下捲動"
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { gestures.current = null; }} onPointerCancel={() => { gestures.current = null; }} onPointerLeave={() => { gestures.current = null; }}>
          {!entries.length ? <p className={styles.empty}>還沒有訊號抵達。光還在走，留一句話也可以。</p> : entries.map((entry, index) => {
            const expanded = selected === entry.id;
            const bank = replyBankFor(entry);
            const day = formatDay(entry.writtenAt);
            const startsDay = index === 0 || day !== formatDay(entries[index - 1].writtenAt);
            return <article ref={node => { pages.current[index] = node; }} key={entry.id} className={styles.page}>
              <div className={styles.date}>{startsDay ? day : <span aria-hidden="true">·</span>}</div>
              <span className={styles.node} aria-hidden="true" />
              <button type="button" className={styles.message} aria-expanded={expanded} aria-controls={`signal-thread-${entry.id}`} onClick={() => setSelected(expanded ? null : entry.id)}>
                <span className={styles.meta}><i data-bank={entry.from} />{MODEL[entry.from]} · {formatTime(entry.writtenAt)}</span>
                <span className={styles.sentence}>{entry.text}</span>
                <span className={styles.count}>{entry.replies.length ? `↩ ${entry.replies.length} 句回應` : '還沒有人回'}<span>{expanded ? '收起 ↑' : '展開 ↓'}</span></span>
              </button>
              {expanded ? <div id={`signal-thread-${entry.id}`} className={styles.thread}>
                {entry.source ? <button type="button" className={styles.source} onClick={() => close(() => onSource(entry.source))}>出自〈{entry.source.title}〉 ›</button> : null}
                {entry.replies.map(reply => <div className={styles.reply} key={reply.id}>
                  <span className={styles.meta}><i data-bank={reply.from} />{MODEL[reply.from]} · {formatTime(reply.writtenAt)}</span>
                  <p>{reply.text}</p>
                </div>)}
                <button type="button" className={styles.replyAction} disabled={busy} onClick={() => {
                  // Opening the existing input in this user gesture keeps mobile
                  // keyboards available; the paper folds away above it.
                  onReply(entry);
                  close(() => {});
                }}>回一句（從 {MODEL[bank]}） →</button>
              </div> : null}
            </article>;
          })}
        </div>
      </section>
    </div>, document.body,
  );
}

export default function SignalLightYears({entries, onReply, onSource, busy}) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const trigger = useRef(null);
  const count = entries.length + entries.reduce((sum, entry) => sum + entry.replies.length, 0);
  useEffect(() => { if (open) setSeen(count); }, [open, count]);
  return <>
    <button ref={trigger} type="button" className={styles.trigger} onClick={() => { setOpen(true); setSeen(count); }} aria-haspopup="dialog" aria-expanded={open}>
      <span className={styles.book} aria-hidden="true"><i /><i /><i /><i /></span>
      <span>訊號光年 · {count}</span><span aria-hidden="true">›</span>
      {count > seen ? <span className={styles.unread} aria-label="有新訊號" /> : null}
    </button>
    {open ? <SignalSheet entries={entries} busy={busy} onReply={entry => { if (!busy) onReply(entry); }} onSource={onSource} onClosed={callback => {
      setOpen(false);
      if (callback) callback();
      else trigger.current?.focus({preventScroll: true});
    }} /> : null}
  </>;
}
