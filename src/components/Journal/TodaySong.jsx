import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import todaySongs from './todaySongs.js';
import styles from './TodaySong.module.css';

const VOLUME_STEPS = 6;
const YOUTUBE_ORIGIN = 'https://www.youtube-nocookie.com';
const CORNER_KEY = 'mytide.tv.corner';
const CORNERS = ['br', 'bl', 'tr', 'tl'];
const phoneQuery = '(max-width: 596px)';

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

  // The mini TV: YouTube's player must stay fully visible and at least
  // 200 × 200 while it plays, so instead of shrinking it, it can be moved to
  // any corner (desktop and tablet), gets out of the way of open panels, and
  // can be folded away — folding also pauses it.
  const [minimized, setMinimized] = useState(false);
  const [corner, setCorner] = useState('br');
  const [drag, setDrag] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CORNER_KEY);
      if (CORNERS.includes(saved)) setCorner(saved);
    } catch {
      // No storage: the TV starts in the lower right.
    }
    const query = window.matchMedia(phoneQuery);
    const sync = () => setPhone(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Panels (訊號光年, 站內廣播) announce themselves; the TV steps aside, and on
  // phones, where it would sit on top of them, it folds away (and pauses).
  useEffect(() => {
    function onOverlay(event) {
      const open = Boolean(event.detail?.open);
      setOverlay(open);
      if (open && window.matchMedia(phoneQuery).matches) fold();
    }
    window.addEventListener('mytide:overlay', onOverlay);
    return () => window.removeEventListener('mytide:overlay', onOverlay);
    // `fold` only sends a command and sets state.
  }, []);

  // Phones: the TV is a bar along the bottom; the page makes room for it.
  useEffect(() => {
    if (!phone || !showEmbed || minimized) return undefined;
    const previous = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '232px';
    return () => { document.body.style.paddingBottom = previous; };
  }, [phone, showEmbed, minimized]);

  function fold() {
    command('pauseVideo');
    setMinimized(true);
  }

  function unfold() {
    setMinimized(false);
    window.setTimeout(() => command('playVideo'), 60);
  }

  function startDrag(event) {
    if (phone || event.button !== 0 || event.target.closest('button, iframe')) return;
    const box = embedRef.current.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({dx: event.clientX - box.left, dy: event.clientY - box.top, x: box.left, y: box.top});
  }

  function moveDrag(event) {
    if (!drag) return;
    setDrag(current => current && {...current, x: event.clientX - current.dx, y: event.clientY - current.dy});
  }

  function endDrag() {
    if (!drag) return;
    const box = embedRef.current.getBoundingClientRect();
    const next = `${box.top + box.height / 2 > window.innerHeight / 2 ? 'b' : 't'}${box.left + box.width / 2 > window.innerWidth / 2 ? 'r' : 'l'}`;
    setCorner(next);
    setDrag(null);
    try {
      window.localStorage.setItem(CORNER_KEY, next);
    } catch {
      // Remembered for this visit only.
    }
  }

  // While a panel is open, a TV in the lower right moves to the lower left.
  const shownCorner = overlay && corner === 'br' ? 'bl' : corner;

  // Resolve "today" on the client, so the static build never pins a date.
  useEffect(() => {
    const key = localDayKey();
    setTodayKey(key);
    setIndex(songIndexFor(key));
  }, []);
  const youtubeId = song.youtubeId || '';

  // Reading owns the room: opening any story (the immersive reader, an
  // expanded card or the film) stops the song and closes the YouTube window.
  // Music only starts again when the reader presses play.
  useEffect(() => {
    function stopForReading(event) {
      if (!event.detail?.open) {
        return;
      }
      audioRef.current?.pause();
      command('pauseVideo');
      setShowEmbed(false);
      setMinimized(false);
      setPlaying(false);
      setCurrent(0);
    }

    window.addEventListener('mytide:immerse', stopForReading);
    window.addEventListener('mytide:film', stopForReading);
    return () => {
      window.removeEventListener('mytide:immerse', stopForReading);
      window.removeEventListener('mytide:film', stopForReading);
    };
    // `command` reads the iframe ref at call time.
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
        setMinimized(false);
        setStarted(true);
      } else if (minimized) {
        unfold();
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

  // 「歌單 ▾」: a native select laid invisibly over the pill, shown on phones too.
  const dayPicker = (
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
  );

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
      <div className={styles.compactRow}>
        {dayPicker}
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
      </div>

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
        </div>

        <div className={styles.barRow}>
        {dayPicker}
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
        </div>
        {showEmbed
          ? createPortal(
              // Rendered on <body> so no clipping ancestor can hide the player.
              <div className="journal-scope">
                <div
                  ref={embedRef}
                  className={styles.embed}
                  role="region"
                  aria-label={`${heading}：YouTube 播放器`}
                  data-corner={shownCorner}
                  data-dragging={drag ? '' : undefined}
                  hidden={minimized}
                  style={drag ? {left: drag.x, top: drag.y, right: 'auto', bottom: 'auto'} : undefined}
                  onPointerDown={startDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <span className={styles.embedGrip} aria-hidden="true" />
                  <button type="button" className={styles.embedFold} aria-label="縮小並暫停" onClick={fold}>–</button>
                  <button
                    type="button"
                    className={styles.embedClose}
                    aria-label="停止並關閉播放器"
                    onClick={() => {
                      setShowEmbed(false);
                      setMinimized(false);
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
                  <p className={styles.embedCaption}>
                    {playing ? <Equalizer /> : null}
                    <span className={styles.embedTitle}>〈{song.title}〉— {song.artist}</span>
                    <span className={styles.embedDate}>{shortDate(song.date)}</span>
                  </p>
                  <span className={styles.embedActions}>
                    <button type="button" onClick={fold}>– 縮小（暫停）</button>
                    <button type="button" data-close="" onClick={() => {
                      setShowEmbed(false);
                      setMinimized(false);
                      setPlaying(false);
                      setCurrent(0);
                    }}>✕ 關閉</button>
                  </span>
                </div>
                {minimized ? (
                  <button type="button" className={styles.pill} data-corner={shownCorner} onClick={unfold}
                    aria-label={`繼續播放：${label}`}>
                    <span className={styles.pillPlay} aria-hidden="true">▶</span>
                    <span>{song.title} — {song.artist}</span>
                  </button>
                ) : null}
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
