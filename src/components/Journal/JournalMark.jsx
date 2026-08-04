import {useEffect, useId, useState} from 'react';
import styles from './JournalMark.module.css';

export default function JournalMark() {
  const pathId = useId();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const sync = () => setReducedMotion(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return (
    <div className={styles.mark} aria-hidden="true">
      <div className={styles.lockup}>
        <span className={styles.group}>
          <span className={styles.tag}>MY</span>
          <span className={styles.cjk}>意識</span>
        </span>
        <span className={styles.group}>
          <span className={styles.cjk}>潮</span>
          <span className={styles.tag}>TIDE</span>
        </span>
      </div>
      <svg className={styles.wave} viewBox="0 0 96 14" width="96" height="14" focusable="false">
        <path
          id={pathId}
          className={styles.waveLine}
          d="M0 8 C 14 2, 26 12, 42 7 C 58 2, 68 11, 84 6 C 88 5, 92 6, 96 5"
        />
        <circle
          className={styles.waveNode}
          cx="0"
          cy="0"
          r="4"
          style={reducedMotion ? {transform: 'translate(41px, 7.2px)'} : undefined}
        >
          {!reducedMotion ? (
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              keyPoints="0;1;0"
              keyTimes="0;0.5;1"
              calcMode="linear"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          ) : null}
        </circle>
      </svg>
    </div>
  );
}
