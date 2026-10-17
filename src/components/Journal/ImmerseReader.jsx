import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {BlogPostProvider} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
import Icon from './Icon.jsx';
import CosmicReturn from './CosmicReturn';
import {readMsToken} from './useHoverIntent.js';
import {depthColorAt, parseDepthStops, readingProgress} from './readingDepth.js';
import styles from './ImmerseReader.module.css';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const CARD_RADIUS = 20;

// clip-path only controls what is visible: the layer itself always covers the
// viewport at its final size, so text never scales or reflows mid-animation.
// The inset is computed from the card's viewport rect so the visible paper
// starts exactly on top of the card.
function insetFromRect(rect) {
  const right = window.innerWidth - rect.right;
  const bottom = window.innerHeight - rect.bottom;
  return `inset(${rect.top}px ${right}px ${bottom}px ${rect.left}px round ${CARD_RADIUS}px)`;
}

const FULL_INSET = 'inset(0px 0px 0px 0px round 0px)';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readToken(element, name, fallback) {
  const value = window.getComputedStyle(element).getPropertyValue(name).trim();
  return value || fallback;
}

// "02 OCT 2026": the return link reads like a distant coordinate.
function coordinateFor(date) {
  if (!(date instanceof Date)) {
    return '';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', {month: 'short', timeZone: 'UTC'}).toUpperCase();
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

// Locks page scroll while reading, compensating for the scrollbar so the card
// underneath doesn't shift sideways (which would make the collapse land off-target).
function lockPageScroll() {
  const root = document.documentElement;
  const scrollbarWidth = window.innerWidth - root.clientWidth;
  const previous = {overflow: root.style.overflow, paddingRight: root.style.paddingRight};
  root.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    root.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    root.style.overflow = previous.overflow;
    root.style.paddingRight = previous.paddingRight;
  };
}

export default function ImmerseReader({entry, originRef, onCloseStart, onClosed}) {
  const layerRef = useRef(null);
  const columnRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const spaceRef = useRef(null);
  const [cosmicReturning, setCosmicReturning] = useState(false);
  const coordinateRef = useRef(null);
  const animationsRef = useRef([]);
  const closingRef = useRef(false);
  const deepens = entry.immerseDepth === 'deepen';
  const singularity = entry.immerseReturn === 'singularity';

  const stopAnimations = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
  }, []);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const column = columnRef.current;
    const origin = originRef.current;
    const unlock = lockPageScroll();

    titleRef.current?.focus({preventScroll: true});
    // Lets other page objects (e.g. the song player) know reading has begun.
    window.dispatchEvent(new CustomEvent('mytide:immerse', {detail: {open: true}}));

    if (prefersReducedMotion() || !origin || typeof layer.animate !== 'function') {
      const duration = readMsToken(layer, '--journal-immerse-reduced', 150);
      animationsRef.current = [
        layer.animate({opacity: [0, 1]}, {duration, easing: 'linear'}),
      ];
    } else {
      const duration = readMsToken(layer, '--journal-immerse-expand', 900);
      animationsRef.current = [
        layer.animate(
          {clipPath: [insetFromRect(origin.getBoundingClientRect()), FULL_INSET]},
          {duration, easing: EASE},
        ),
        // The text arrives after the paper has mostly opened.
        column.animate(
          {opacity: [0, 0, 1]},
          {duration, easing: 'ease-out'},
        ),
      ];

      if (coordinateRef.current) {
        animationsRef.current.push(
          coordinateRef.current.animate({opacity: [0, 0, 1]}, {duration, easing: 'ease-out'}),
        );
      }

      if (deepens) {
        // The opening line surfaces alone; the rest follows a beat later.
        const stagger = readMsToken(layer, '--journal-deep-stagger', 800);
        const paragraphs = Array.from(textRef.current?.querySelectorAll('p') ?? []);
        paragraphs.slice(1).forEach((paragraph) => {
          animationsRef.current.push(
            paragraph.animate(
              {opacity: [0, 1]},
              {duration: 900, delay: duration + stagger, easing: 'ease-out', fill: 'backwards'},
            ),
          );
        });
      }
    }

    return () => {
      stopAnimations();
      unlock();
      window.dispatchEvent(new CustomEvent('mytide:immerse', {detail: {open: false}}));
    };
  }, [deepens, originRef, stopAnimations]);

  // Deeper as You Read: the background follows reading progress. The paper
  // first eases from the card's color into the opening depth, then scroll
  // takes over. Color is not motion, so this also runs under reduced motion.
  useEffect(() => {
    if (!deepens) {
      return undefined;
    }

    const layer = layerRef.current;
    const stops = parseDepthStops(readToken(layer, '--journal-deep-stops', ''));
    const threshold = parseFloat(readToken(layer, '--journal-deep-threshold', '0.412'));
    let frame = null;

    function apply() {
      frame = null;
      if (closingRef.current) {
        return;
      }

      const progress = readingProgress(layer, textRef.current);
      const color = depthColorAt(stops, progress);
      if (color) {
        layer.style.backgroundColor = color;
      }
      layer.dataset.tone = progress >= threshold ? 'dark' : 'light';
    }

    function schedule() {
      if (frame === null) {
        frame = window.requestAnimationFrame(apply);
      }
    }

    const reduced = prefersReducedMotion();
    const enterDelay = reduced ? 0 : readMsToken(layer, '--journal-immerse-expand', 900);
    const enterTimer = window.setTimeout(() => {
      const paper = window.getComputedStyle(layer).backgroundColor;
      apply();
      if (!reduced && !closingRef.current && typeof layer.animate === 'function') {
        const enter = readMsToken(layer, '--journal-deep-enter', 1600);
        layer.animate({backgroundColor: [paper, layer.style.backgroundColor]}, {duration: enter, easing: 'ease-out'});
      }
      layer.addEventListener('scroll', schedule, {passive: true});
      window.addEventListener('resize', schedule);
    }, enterDelay);

    return () => {
      window.clearTimeout(enterTimer);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      layer.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [deepens]);

  const close = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    const layer = layerRef.current;
    const column = columnRef.current;
    const origin = originRef.current;
    onCloseStart();

    // Start from wherever the layer currently is, so closing mid-expand reverses
    // smoothly instead of jumping to fully open first.
    const currentClip = window.getComputedStyle(layer).clipPath;
    const currentOpacity = window.getComputedStyle(column).opacity;
    stopAnimations();

    if (singularity) {
      if (prefersReducedMotion() || typeof layer.animate !== 'function') {
        setCosmicReturning(true);
      } else {
        const duration = readMsToken(layer, '--journal-bang-recede', 400);
        const recede = column.animate(
          {opacity: [currentOpacity, 0], transform: ['scale(1)', 'scale(0.94)']},
          {duration, easing: 'ease-in', fill: 'forwards'},
        );
        animationsRef.current.push(recede);
        recede.finished.then(() => setCosmicReturning(true), () => {});
      }
      return;
    }

    let finished;
    if (prefersReducedMotion() || !origin || typeof layer.animate !== 'function') {
      const duration = readMsToken(layer, '--journal-immerse-reduced', 150);
      finished = layer.animate({opacity: [1, 0]}, {duration, easing: 'linear', fill: 'forwards'});
    } else {
      const duration = readMsToken(layer, '--journal-immerse-collapse', 650);
      const fromClip = currentClip && currentClip !== 'none' ? currentClip : FULL_INSET;
      column.animate(
        {opacity: [currentOpacity, 0, 0]},
        {duration, easing: 'ease-in', fill: 'forwards'},
      );
      if (deepens) {
        // Brighten back to paper first, so a dark card never lands on the timeline.
        layer.animate(
          {backgroundColor: [window.getComputedStyle(layer).backgroundColor, readToken(layer, '--journal-bg-card', '#FAFBFB')]},
          {duration, easing: 'ease-out', fill: 'forwards'},
        );
      }
      // Re-measure: the card stays in place under the layer, but the viewport
      // may have been resized while reading.
      finished = layer.animate(
        {clipPath: [fromClip, insetFromRect(origin.getBoundingClientRect())]},
        {duration, easing: EASE, fill: 'forwards'},
      );
    }

    finished.finished.then(onClosed, onClosed);
  }, [deepens, onCloseStart, onClosed, originRef, singularity, stopAnimations]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  if (cosmicReturning) {
    return <CosmicReturn originRef={originRef} onComplete={onClosed} lockScroll={false}
      closingLine={entry.immerseReturnLine || '你我都來自星塵'} />;
  }

  return createPortal(
    <div className="journal-scope">
      <div
        ref={layerRef}
        className={styles.layer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-immerse-title"
        data-depth={deepens ? 'deepen' : undefined}
        data-tone={deepens ? 'light' : undefined}
      >
        {deepens ? (
          <div ref={spaceRef} className={styles.space} aria-hidden="true">
            <div className={styles.grain} />
          </div>
        ) : null}
        {deepens ? (
          <button
            ref={coordinateRef}
            type="button"
            className={styles.coordinate}
            onClick={close}
            aria-label="返回意識潮"
          >
            <span aria-hidden="true">←</span>
            <span aria-hidden="true">意識潮</span>
            <span className={styles.coordinateDate} aria-hidden="true">{coordinateFor(entry.date)}</span>
          </button>
        ) : null}
        <article ref={columnRef} className={styles.column}>
          {!deepens ? (
            <button type="button" className={styles.backLink} onClick={close}>
              <Icon name="arrow-left" className={styles.backIcon} />
              <span>返回意識潮</span>
            </button>
          ) : null}
          <div className={styles.meta}>
            {entry.formattedDate ? <span>{entry.formattedDate}</span> : null}
            {entry.formattedDate && entry.readingTimeMinutes ? <span className={styles.separator}>·</span> : null}
            {entry.readingTimeMinutes ? <span>{entry.readingTimeMinutes} 分鐘閱讀</span> : null}
          </div>
          <h2 ref={titleRef} id="journal-immerse-title" className={styles.title} tabIndex={-1}>
            {entry.title}
          </h2>
          <div ref={textRef} className={styles.text}>
            <BlogPostProvider content={entry.Content}>
              <div className="markdown">
                <MDXContent>
                  <entry.Content />
                </MDXContent>
              </div>
            </BlogPostProvider>
          </div>
          <button type="button" className={`${styles.backLink} ${styles.backLinkEnd}`} onClick={close}>
            <Icon name="arrow-left" className={styles.backIcon} />
            <span>返回意識潮</span>
          </button>
        </article>
      </div>
    </div>,
    document.body,
  );
}
