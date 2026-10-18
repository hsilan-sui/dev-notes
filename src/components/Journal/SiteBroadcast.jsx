import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import lockJournalScroll from './lockJournalScroll';
import {BROADCAST_LINE, STATEMENT, STATEMENT_DATE} from './siteStatement.js';
import {useSignalLang} from './signalI18n.js';
import styles from './SiteBroadcast.module.css';

const LABEL = {zh: '站內廣播', en: 'Broadcast'};
const BACK = {zh: '← 折返', en: '← Back'};

// The full statement, on the same misty paper as the stories.
function Statement({onClose}) {
  const {lang: readerLang} = useSignalLang();
  const [lang, setLang] = useState(readerLang === 'zh-Hant' ? 'zh' : 'en');
  const panel = useRef(null);

  useLayoutEffect(() => {
    const unlock = lockJournalScroll();
    panel.current?.focus({preventScroll: true});
    return unlock;
  }, []);

  function keys(event) {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key === 'Tab') {
      const focusable = Array.from(panel.current.querySelectorAll('button'));
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  return createPortal(
    <div className="journal-scope">
      <div className={styles.backdrop} onClick={onClose} />
      <section ref={panel} className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="site-statement-title"
        tabIndex={-1} onKeyDown={keys} lang={lang === 'zh' ? 'zh-Hant' : 'en'}>
        <header className={styles.sheetHead}>
          <span className={styles.tag} id="site-statement-title"><span className={styles.dot} aria-hidden="true" />{LABEL[lang]}</span>
          <span className={styles.date}>{STATEMENT_DATE}</span>
          <span className={styles.switch} role="group" aria-label="中文 / English">
            <button type="button" aria-pressed={lang === 'zh'} onClick={() => setLang('zh')}>中文</button>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
          </span>
          <button type="button" className={styles.back} onClick={onClose}>{BACK[lang]}</button>
        </header>
        <div className={styles.text}>
          {STATEMENT[lang].map(([kind, line]) => (
            <p key={line} className={kind ? styles[kind] : undefined}>{line}</p>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}

// 站內廣播: a small module at the top of the page, like a notice on an old
// personal site — the site owner 「說」, the line scrolls, 「more »」 opens the rest.
export default function SiteBroadcast() {
  const [open, setOpen] = useState(false);
  const opener = useRef(null);
  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => opener.current?.focus({preventScroll: true}));
  };

  // While the statement is open, the page behind it is out of the way.
  useEffect(() => {
    if (!open) return undefined;
    window.dispatchEvent(new CustomEvent('mytide:overlay', {detail: {open: true}}));
    return () => window.dispatchEvent(new CustomEvent('mytide:overlay', {detail: {open: false}}));
  }, [open]);

  const line = (
    <>
      <span className={styles.zh}>{BROADCAST_LINE.zh}</span>
      <span className={styles.en} lang="en">{BROADCAST_LINE.en}</span>
    </>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.box} role="note" aria-label="站內廣播 Broadcast">
        <button ref={opener} type="button" className={styles.tag} aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <span className={styles.dot} aria-hidden="true" />站內廣播<span aria-hidden="true" className={styles.chevron}>›</span>
        </button>
        <span className={styles.who} aria-hidden="true">站長<span className={styles.says}>說</span></span>
        <span className={styles.track}>
          <span className={styles.run}>{line}<span aria-hidden="true" className={styles.copy}>{line}</span></span>
        </span>
        <span className={styles.stamp} aria-hidden="true">{STATEMENT_DATE.slice(5).replace('.', '/')}</span>
        <button type="button" className={styles.more} aria-haspopup="dialog" onClick={() => setOpen(true)}>more »</button>
      </div>
      {open ? <Statement onClose={close} /> : null}
    </div>
  );
}
