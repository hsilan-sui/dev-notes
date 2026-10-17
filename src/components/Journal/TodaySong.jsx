import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import todaySongs from './todaySongs.js';
import styles from './TodaySong.module.css';

const VOLUME_STEPS = 6;
const YOUTUBE_ORIGIN = 'https://www.youtube-nocookie.com';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '--:--';
  }

  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

// Newest first; the player opens on today's song, or the latest one before it.
const songsByDate = [...todaySongs].sort((a, b) => b.date.localeCompare(a.date));

function localDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function songIndexFor(dayKey) {
  const index = songsByDate.findIndex((song) => song.date <= dayKey);
  return index === -1 ? 0 : index;
}

function shortDate(dayKey) {
  const [, month, day] = dayKey.split('-');
  return `${Number(month)}/${Number(day)}`;
}

function PlayIcon({playing}) {
  return playing ? (
    <svg className={styles.icon} viewBox="0 0 10 10" aria-hidden="true">
      <rect x="2" y="1.5" width="2" height="7" rx="0.5" />
      <rect x="6" y="1.5" width="2" height="7" rx="0.5" />
    </svg>
  ) : (
    <svg className={styles.icon} viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.5 1.5v7l6-3.5z" />
    </svg>
  );
}

// 送給『今天』的歌: a quiet strip under JournalMark, in the spirit of the small
// embedded players on early personal blogs. Never autoplays.
export default function TodaySong() {
  const audioRef = useRef(null);
  const iframeRef = useRef(null);
  const embedRef = useRef(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [index, setIndex] = useState(0);
  const [todayKey, setTodayKey] = useState('');
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [volume, setVolume] = useState(0.6);
  const [notice, setNotice] = useState('');
  const song = songsByDate[index];
  const resolvedSrc = useBaseUrl(song.src || '/');
  const src = song.src ? resolvedSrc : '';

  // The player rests in the lower-right corner, but never over the
  // 「未來之來」 tab (the next-day panel) or the story card: if they would meet,
  // it settles just below them instead and scrolls with the page.
  useLayoutEffect(() => {
    const embed = embedRef.current;
    if (!showEmbed || !embed) {
      return undefined;
    }

    function place() {
      delete embed.dataset.belowTab;
      embed.style.top = '';
      embed.style.left = '';
      const box = embed.getBoundingClientRect();
      // The 「未來之來」 tab, and the story card itself, stay uncovered.
      const blockers = ['[aria-label^="下一篇："]', 'main article']
        .map((selector) => document.querySelector(selector)?.getBoundingClientRect())
        .filter((rect) => rect && rect.width > 0
          && box.left < rect.right && box.right > rect.left
          && box.top < rect.bottom && box.bottom > rect.top);
      if (blockers.length === 0) {
        return;
      }

      const below = Math.max(...blockers.map((rect) => rect.bottom));
      const right = Math.max(...blockers.map((rect) => rect.right));
      embed.dataset.belowTab = 'true';
      embed.style.top = `${below + 16 + window.scrollY}px`;
      embed.style.left = `${Math.min(window.innerWidth - box.width - 24, right - box.width) + window.scrollX}px`;
    }

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, {passive: true});
    const timer = window.setInterval(place, 800);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
      window.clearInterval(timer);
    };
  }, [showEmbed]);

  // Resolve "today" on the client, so the static build never pins a date.
  useEffect(() => {
    const key = localDayKey();
    setTodayKey(key);
    setIndex(songIndexFor(key));
  }, []);
  const youtubeId = song.youtubeId || '';

  // A YouTube player may not be covered while it plays. When a diary entry
  // opens over the page, pause it and let the reading layer cover it; resume
  // when the reader returns to the timeline.
  const [covered, setCovered] = useState(false);
  const resumeRef = useRef(false);
  const playingRef = useRef(false);
  playingRef.current = playing;

  useEffect(() => {
    if (!youtubeId) {
      return undefined;
    }

    function handleImmerse(event) {
      const open = Boolean(event.detail?.open);
      if (open) {
        resumeRef.current = playingRef.current;
        if (playingRef.current) {
          command('pauseVideo');
        }
      } else if (resumeRef.current) {
        resumeRef.current = false;
        command('playVideo');
      }
      setCovered(open);
    }

    window.addEventListener('mytide:immerse', handleImmerse);
    return () => window.removeEventListener('mytide:immerse', handleImmerse);
    // `command` reads the iframe ref at call time.
  }, [youtubeId]);

  // A film owns its quiet room. Pause both possible music sources and do
  // not restart music when the film ends or the reader returns through space.
  useEffect(() => {
    function handleFilm(event) {
      const open = Boolean(event.detail?.open);
      if (open) {
        resumeRef.current = false;
        audioRef.current?.pause();
        command('pauseVideo');
        setPlaying(false);
      }
      setCovered(open);
    }
    window.addEventListener('mytide:film', handleFilm);
    return () => window.removeEventListener('mytide:film', handleFilm);
  }, []);

  // YouTube's embedded player is driven through its postMessage protocol, so
  // the strip's controls stay in sync without loading the full IFrame API.
  function command(func, args = []) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({event: 'command', func, args}), YOUTUBE_ORIGIN);
  }

  useEffect(() => {
    if (!youtubeId) {
      return undefined;
    }

    function handleMessage(event) {
      if (event.origin !== YOUTUBE_ORIGIN || event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      let data;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      const info = data?.info;
      if (data?.event === 'onStateChange' && typeof info === 'number') {
        setPlaying(info === 1);
      }
      if (data?.event === 'infoDelivery' && info) {
        if (typeof info.playerState === 'number') {
          setPlaying(info.playerState === 1);
        }
        if (typeof info.currentTime === 'number') {
          setCurrent(info.currentTime);
        }
        if (typeof info.duration === 'number' && info.duration > 0) {
          setDuration(info.duration);
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [youtubeId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (youtubeId && showEmbed) {
      command('setVolume', [Math.round(volume * 100)]);
    }
    // `command` reads the iframe ref at call time.
  }, [volume, youtubeId, showEmbed]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function togglePlay() {
    if (youtubeId) {
      if (!showEmbed) {
        // Opening the embed on the visitor's click starts it (autoplay=1).
        setShowEmbed(true);
        setStarted(true);
      } else {
        command(playing ? 'pauseVideo' : 'playVideo');
      }
      return;
    }

    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      return;
    }

    if (!src) {
      setNotice('音源尚未設定');
      return;
    }

    try {
      await audio.play();
      setStarted(true);
    } catch {
      setNotice('暫時無法播放');
    }
  }

  function chooseDay(nextIndex) {
    if (nextIndex === index) {
      return;
    }

    // Switching days keeps listening if a song was playing.
    if (!playing) {
      setShowEmbed(false);
    }
    audioRef.current?.pause();
    setIndex(nextIndex);
    setCurrent(0);
    setDuration(NaN);
    setPlaying(false);
  }

  const label = `${song.title} — ${song.artist}`;
  const isToday = !todayKey || song.date === todayKey;
  const heading = isToday ? '送給『今天』的歌' : `送給『${Number(song.date.slice(5, 7))}月${Number(song.date.slice(8, 10))}日』的歌`;
  const showMarquee = playing;
  const level = Math.round(volume * VOLUME_STEPS);

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        src={src || undefined}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => src && setNotice('暫時無法播放')}
      />

      {/* Mobile: one line also controls playback; it never expands. */}
      <button
        type="button"
        className={styles.compact}
        aria-label={playing ? `暫停：${label}` : `播放：${label}`}
        onClick={togglePlay}
      >
        {playing ? <Equalizer /> : <PlayIcon playing={false} />}
        <span className={styles.compactLabel}>
          {notice || (playing ? <Marquee text={label} /> : heading)}
        </span>
      </button>

      <div className={styles.full}>
        <div className={styles.titleRow}>
          {showMarquee ? <Equalizer /> : null}
          <span className={styles.title} aria-live="polite">
            {notice ? (
              <span className={styles.notice}>{notice}</span>
            ) : showMarquee ? (
              <Marquee text={label} />
            ) : (
              heading
            )}
          </span>
          <span className={styles.days}>
            <select
              className={styles.daySelect}
              value={index}
              aria-label="選擇哪一天的歌"
              onChange={(event) => chooseDay(Number(event.target.value))}
            >
              {songsByDate.map((item, i) => (
                <option key={item.date} value={i}>
                  {`${item.date === todayKey ? '今天' : shortDate(item.date)}　${item.title} — ${item.artist}`}
                </option>
              ))}
            </select>
            <span className={styles.dayLabel} aria-hidden="true">
              歌單 ▾
            </span>
          </span>
        </div>

        <div className={styles.bar}>
          <button
            type="button"
            className={styles.play}
            onClick={togglePlay}
            aria-label={playing ? `暫停：${label}` : `播放：${label}`}
          >
            <PlayIcon playing={playing} />
          </button>
          <div className={styles.progress}>
            <span className={styles.time}>{formatTime(current)}</span>
            <span className={styles.track}>
              <span className={styles.rail} />
              <span
                className={styles.head}
                style={{left: `${Number.isFinite(duration) && duration > 0 ? (current / duration) * 100 : 0}%`}}
              />
              <input
                className={styles.range}
                type="range"
                min="0"
                max={Number.isFinite(duration) ? duration : 0}
                step="1"
                value={current}
                disabled={!Number.isFinite(duration)}
                aria-label="播放進度"
                onChange={(event) => {
                  const time = Number(event.target.value);
                  if (youtubeId) {
                    command('seekTo', [time, true]);
                  } else {
                    audioRef.current.currentTime = time;
                  }
                  setCurrent(time);
                }}
              />
            </span>
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
          <div className={styles.volume}>
            <svg className={styles.speaker} viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1.5 4.5h2l3-2.5v8l-3-2.5h-2z" />
            </svg>
            <span className={styles.ladder} aria-hidden="true">
              {Array.from({length: VOLUME_STEPS}, (_, i) => (
                <span key={i} className={clsx(styles.step, i < level && styles.stepOn)} style={{height: 3 + i}} />
              ))}
            </span>
            <input
              className={styles.range}
              type="range"
              min="0"
              max="1"
              step={1 / VOLUME_STEPS}
              value={volume}
              aria-label="音量"
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </div>
        </div>
        {showEmbed
          ? createPortal(
              // Rendered on <body> so no clipping ancestor can hide the player.
              <div className="journal-scope">
                <div ref={embedRef} className={styles.embed} data-covered={covered ? '' : undefined} role="region" aria-label={`${heading}：YouTube 播放器`}>
                  <button
                    type="button"
                    className={styles.embedClose}
                    aria-label="停止並關閉播放器"
                    onClick={() => {
                      setShowEmbed(false);
                      setPlaying(false);
                      setCurrent(0);
                    }}
                  >
                    ✕
                  </button>
                  <iframe
                    key={youtubeId}
                    ref={iframeRef}
                    src={`${YOUTUBE_ORIGIN}/embed/${youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
                    title={`${label}（YouTube 官方音源）`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => {
                      iframeRef.current?.contentWindow?.postMessage(
                        JSON.stringify({event: 'listening', id: 'today-song', channel: 'widget'}),
                        YOUTUBE_ORIGIN,
                      );
                      command('setVolume', [Math.round(volume * 100)]);
                    }}
                  />
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}

function Equalizer() {
  return (
    <span className={styles.eq} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function Marquee({text}) {
  return (
    <span className={styles.marquee}>
      <span className={styles.marqueeText} aria-hidden="true">{text}</span>
      <span className={styles.srOnly}>{text}</span>
    </span>
  );
}
