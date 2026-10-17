import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import lockJournalScroll from '../../Journal/lockJournalScroll';
import styles from './FridayFilm.module.css';

export function FridayFilmExperience({onClose}) {
  const panel = useRef(null);
  const video = useRef(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState(false);
  const source = useBaseUrl('/video/friday-after-work-20261008.mp4');
  const poster = useBaseUrl('/img/friday-after-work.jpg');
  useLayoutEffect(() => {
    const unlock = lockJournalScroll();
    panel.current?.focus({preventScroll: true});
    return unlock;
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mytide:film', {detail: {open: true}}));
    const media = video.current;
    return () => {
      media?.pause();
      window.dispatchEvent(new CustomEvent('mytide:film', {detail: {open: false}}));
    };
  }, []);
  async function play() {
    setError(false);
    try {
      await video.current.play();
      video.current.focus({preventScroll: true});
      setStarted(true);
      setEnded(false);
    } catch { setError(true); }
  }
  function close() { video.current?.pause(); onClose(); }
  function keys(event) {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const targets = Array.from(panel.current.querySelectorAll('button, video'));
      const first = targets[0], last = targets.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first?.focus(); }
    }
  }
  return createPortal(<div className="journal-scope">
    <section ref={panel} className={styles.room} role="dialog" aria-modal="true" aria-labelledby="friday-film-title" tabIndex={-1} onKeyDown={keys}>
      <header className={styles.header}>
        <button type="button" onClick={close}>← 返回意識潮</button>
        <span>10 月 8 日 · 2 分 45 秒</span>
      </header>
      <h2 id="friday-film-title" className={styles.title}>一個週五下班的日常</h2>
      <div className={styles.window}>
        <video ref={video} src={source} poster={poster} preload="none" controls={started} playsInline tabIndex={0}
          aria-label="一個週五下班的日常，影片含畫面字幕" onPlay={() => {setStarted(true);setEnded(false);}}
          onEnded={() => setEnded(true)} onError={() => setError(true)} />
        {!started ? <div className={styles.departure}>
          <p>跟著人群一路南下。</p>
          <button type="button" onClick={play}>坐一會 · 播放</button>
        </div> : null}
      </div>
      {ended ? <div className={styles.after}>
        <button type="button" onClick={() => {video.current.currentTime = 0; play();}}>再坐一會</button>
        <button type="button" onClick={close}>返回意識潮</button>
      </div> : null}
      {error ? <p role="status" className={styles.notice}>影片暫時無法播放。<button type="button" onClick={play}>再試一次</button></p> : null}
    </section>
  </div>, document.body);
}

export default function FridayFilm() {
  const [open, setOpen] = useState(false);
  return <div className="journal-scope">
    <div className={styles.entry}>
      <button type="button" onClick={() => setOpen(true)}>坐一會 · 2 分 45 秒</button>
      <Link to="/my-tide">返回意識潮</Link>
    </div>
    {open ? <FridayFilmExperience onClose={() => setOpen(false)} /> : null}
  </div>;
}
