import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  DESKTOP_WAVE,
  MOBILE_WAVE,
  buildDensityAnchors,
  buildWavePathD,
  dayNodePosition,
  trackWidth,
} from './waveMath.js';
import styles from './WaveTimeline.module.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MOBILE_QUERY = '(max-width: 596px)';

export default function WaveTimeline({days, currentDayKey, mostRecentDayKey, onSelectDay}) {
  const [variant, setVariant] = useState('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollRef = useRef(null);
  const dragRef = useRef(null);
  const settleRef = useRef(null);

  useEffect(() => {
    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);

    function syncMedia() {
      setVariant(mobileMedia.matches ? 'mobile' : 'desktop');
      setReducedMotion(motionMedia.matches);
    }

    syncMedia();
    mobileMedia.addEventListener('change', syncMedia);
    motionMedia.addEventListener('change', syncMedia);

    return () => {
      mobileMedia.removeEventListener('change', syncMedia);
      motionMedia.removeEventListener('change', syncMedia);
    };
  }, []);

  const opts = variant === 'mobile' ? MOBILE_WAVE : DESKTOP_WAVE;
  const width = useMemo(() => trackWidth(days.length, opts), [days.length, opts]);
  const densityAnchors = useMemo(() => buildDensityAnchors(days, opts), [days, opts]);
  const positions = useMemo(
    () => days.map((day, index) => dayNodePosition(index, days.length, opts, opts.phase, densityAnchors)),
    [days, opts, densityAnchors],
  );
  const pathD = useMemo(
    () => buildWavePathD(days.length, opts, opts.phase, densityAnchors),
    [days.length, opts, densityAnchors],
  );
  const activeIndex = days.findIndex((day) => day.dayKey === currentDayKey);
  const activePosition = activeIndex >= 0 ? positions[activeIndex] : null;

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    node.scrollLeft = node.scrollWidth - node.clientWidth;
  }, [width]);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || !activePosition) {
      return;
    }

    const minVisible = node.scrollLeft + 44;
    const maxVisible = node.scrollLeft + node.clientWidth - 88;

    if (activePosition.x >= minVisible && activePosition.x <= maxVisible) {
      return;
    }

    node.scrollTo({
      left: Math.max(0, activePosition.x - node.clientWidth / 2),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [activePosition, reducedMotion]);

  useEffect(() => () => cancelAnimationFrame(settleRef.current), []);

  function handlePointerDown(event) {
    if (event.pointerType === 'touch') {
      return;
    }

    cancelAnimationFrame(settleRef.current);
    const node = scrollRef.current;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: node.scrollLeft,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
    node.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const node = scrollRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const now = performance.now();
    const deltaX = event.clientX - drag.startX;
    node.scrollLeft = drag.startScrollLeft - deltaX;
    const elapsed = Math.max(1, now - drag.lastTime);
    drag.velocity = ((drag.lastX - event.clientX) / elapsed) * 16;
    drag.lastX = event.clientX;
    drag.lastTime = now;
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    if (reducedMotion) {
      return;
    }

    glide(drag.velocity);
  }

  function glide(initialVelocity) {
    const node = scrollRef.current;
    let velocity = initialVelocity;

    function step() {
      if (!node || Math.abs(velocity) < 0.2) {
        return;
      }

      node.scrollLeft += velocity;
      velocity *= 0.94;
      settleRef.current = requestAnimationFrame(step);
    }

    settleRef.current = requestAnimationFrame(step);
  }

  function handleNodeKeyDown(event, day) {
    if (event.key === 'Home') {
      event.preventDefault();
      const first = days.find((candidate) => candidate.entries.length > 0);
      if (first) {
        onSelectDay(first.dayKey);
      }
    }

    if (event.key === 'End') {
      event.preventDefault();
      onSelectDay(mostRecentDayKey);
    }
  }

  return (
    <div
      className={styles.window}
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={styles.track} style={{width}}>
        <svg
          aria-hidden="true"
          className={styles.svg}
          focusable="false"
          height={opts.centerY * 2}
          viewBox={`0 0 ${width} ${opts.centerY * 2}`}
          width={width}
        >
          <path className={styles.wavePath} d={pathD} />
          {activePosition ? (
            <circle
              className={styles.glow}
              cx={activePosition.x}
              cy={activePosition.y}
              r={(variant === 'mobile' ? 62 : 82) / 2}
            />
          ) : null}
          {days.map((day, index) => {
            const position = positions[index];
            const hasEntries = day.entries.length > 0;
            const opacity = hasEntries ? day.opacity : undefined;

            return (
              <g key={day.dayKey}>
                {!hasEntries ? (
                  <circle
                    className={styles.emptyNode}
                    cx={position.x}
                    cy={position.y}
                    r="3.5"
                  />
                ) : null}
                {hasEntries && day.entries.length > 1
                  ? companionDotsForDay(day.entries.length, position, opacity).map((dot) => (
                    <circle
                      className={styles.companionDot}
                      cx={dot.x}
                      cy={dot.y}
                      key={dot.key}
                      r="2.5"
                      style={{opacity: dot.opacity}}
                    />
                  ))
                  : null}
              </g>
            );
          })}
        </svg>
        <ol className={styles.nodeList} aria-label="Journal days">
          {days.map((day, index) => {
            if (day.entries.length === 0) {
              return null;
            }

            const position = positions[index];
            const isViewing = day.dayKey === currentDayKey;
            const isMostRecent = day.dayKey === mostRecentDayKey;
            const buttonClassName = isViewing
              ? `${styles.nodeButton} ${styles.nodeButtonActive}`
              : styles.nodeButton;

            return (
              <li
                className={styles.nodeItem}
                key={day.dayKey}
                style={{
                  left: position.x,
                  top: position.y,
                }}
              >
                <button
                  type="button"
                  className={buttonClassName}
                  aria-current={isViewing ? 'date' : undefined}
                  aria-label={buildDayAriaLabel(day, isMostRecent)}
                  onClick={() => onSelectDay(day.dayKey)}
                  onKeyDown={(event) => handleNodeKeyDown(event, day)}
                  style={{'--node-opacity': day.opacity}}
                >
                  <span className={styles.nodeDot} />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function companionDotsForDay(entryCount, position, opacity) {
  const dotCount = Math.min(entryCount - 1, 5);
  const startY = position.y - 9.5;
  const offsets = [
    {x: 0, y: 0},
    {x: -5.5, y: -7},
    {x: 5.5, y: -7},
    {x: -9, y: -14},
    {x: 9, y: -14},
  ];

  return offsets.slice(0, dotCount).map((offset, index) => ({
    key: `${index}-${offset.x}-${offset.y}`,
    x: position.x + offset.x,
    y: startY + offset.y,
    opacity: opacity * (0.86 - index * 0.08),
  }));
}

function buildDayAriaLabel(day, isMostRecent) {
  const formatter = new Intl.DateTimeFormat('zh-Hant', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const parts = [formatter.format(day.date)];

  if (isMostRecent) {
    parts.push('今天');
  }

  if (day.entries.length > 1) {
    parts.push(`共 ${day.entries.length} 篇`);
  }

  return parts.join('，');
}
