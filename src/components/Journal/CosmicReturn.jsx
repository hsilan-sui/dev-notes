import {useLayoutEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import styles from './CosmicReturn.module.css';

// The timeline card is already back under this layer. The expanding opening
// reveals that real card, rather than swapping pages at the end of a video.
export default function CosmicReturn({originRef, onComplete, lockScroll = true, closingLine = '你我都來自星塵'}) {
  const layer = useRef(null);
  const line = useRef(null);
  const point = useRef(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useLayoutEffect(() => {
    const node = layer.current;
    const root = document.documentElement;
    const oldOverflow = root.style.overflow;
    if (lockScroll) root.style.overflow = 'hidden';
    node.focus({preventScroll: true});
    const tokens = getComputedStyle(node);
    const ms = name => parseFloat(tokens.getPropertyValue(name));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animations = [];
    let active = true;
    const animate = (element, frames, options) => {
      const animation = element.animate(frames, {...options, fill: options.fill ?? 'both'});
      animations.push(animation);
      return animation;
    };
    const rect = originRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
    node.style.setProperty('--journal-bang-x', `${x}px`);
    node.style.setProperty('--journal-bang-y', `${y}px`);
    point.current.style.left = `${x}px`;
    point.current.style.top = `${y}px`;
    let finished;
    if (reduced || typeof node.animate !== 'function') {
      // Keep the closing words, without the fall or radial expansion.
      line.current.style.opacity = '1';
      point.current.style.opacity = '1';
      if (typeof node.animate === 'function') {
        finished = animate(node, {opacity: [1, 0]}, {
          delay: ms('--journal-cosmic-hold'), duration: ms('--journal-immerse-reduced'),
        }).finished;
      } else {
        finished = new Promise(resolve => {
          const timer = window.setTimeout(resolve, ms('--journal-cosmic-hold'));
          animations.push({cancel: () => window.clearTimeout(timer)});
        });
      }
    } else {
      const fall = ms('--journal-cosmic-fall');
      const words = ms('--journal-cosmic-words');
      const hold = ms('--journal-cosmic-hold');
      const expand = ms('--journal-bang-expand');
      const burstAt = fall + words + hold;
      const radius = Math.ceil(Math.max(
        Math.hypot(x, y), Math.hypot(innerWidth - x, y),
        Math.hypot(x, innerHeight - y), Math.hypot(innerWidth - x, innerHeight - y),
      )) + 24;
      // One distant star appears and breathes before the closing words arrive.
      animate(point.current, {opacity: [0, 1]}, {
        duration: fall * 0.45, easing: 'ease-out',
      });
      animate(line.current, {opacity: [0, 1]}, {
        delay: fall, duration: words, easing: 'ease-out',
      });
      animate(line.current, {opacity: [1, 0]}, {delay: burstAt, duration: expand * 0.35, fill: 'forwards'});
      if (tokens.getPropertyValue('--journal-bang-r').trim()) {
        finished = animate(node, {'--journal-bang-r': ['0px', `${radius}px`]}, {
          delay: burstAt, duration: expand, easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
        }).finished;
      } else {
        finished = animate(node, {opacity: [1, 0]}, {delay: burstAt, duration: expand}).finished;
      }
    }
    finished.then(() => { if (active) complete.current(); }, () => {});
    return () => {
      active = false;
      animations.forEach(animation => animation.cancel());
      if (lockScroll) root.style.overflow = oldOverflow;
    };
  }, [originRef, lockScroll]);

  return createPortal(
    <div className="journal-scope">
      <div ref={layer} className={styles.layer} role="dialog" aria-modal="true" aria-label={closingLine} tabIndex={-1}
        onKeyDown={event => {
          if (event.key === 'Tab') event.preventDefault();
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); complete.current(); }
        }}>
        <p ref={line} className={styles.line}>{closingLine}</p>
        <span ref={point} className={styles.point} aria-hidden="true"><span className={styles.starlight} /></span>
      </div>
    </div>, document.body,
  );
}
