import {useEffect, useRef, useState} from 'react';
import {BlogPostProvider} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {FridayFilmExperience} from '../MyTide/FridayFilm/FridayFilm';
import Icon from './Icon.jsx';
import CosmicReturn from './CosmicReturn';
import styles from './StoryCard.module.css';
import {RiderExperience} from '../MyTide/PandaRider/PandaRider';

export default function StoryCard({entry, expanded, onExpand, onCollapse, immerse}) {
  const imageUrl = useBaseUrl(entry?.imageUrl || '/');
  const readingUrl = useBaseUrl(entry?.readingUrl || '/');
  const isFilm = entry?.readingExperience === 'friday-film';
  const departureButton = useRef(null);
  const cardOrigin = useRef(null);
  const [cosmicReturning, setCosmicReturning] = useState(false);
  const returningFromRide = useRef(false);
  useEffect(() => {
    if (!expanded && !cosmicReturning && returningFromRide.current) {
      departureButton.current?.focus({preventScroll: true});
      returningFromRide.current = false;
    }
  }, [expanded, cosmicReturning]);

  if (!entry) {
    return null;
  }

  function returnFromExperience() {
    returningFromRide.current = true;
    setCosmicReturning(true);
    onCollapse();
  }

  if (expanded && isFilm) return <FridayFilmExperience onClose={returnFromExperience} />;
  if (expanded && entry.readingExperience === 'panda-rider') {
    return <RiderExperience intro onClose={returnFromExperience} />;
  }

  if (expanded) {
    return (
      <article className={`${styles.card} ${styles.expanded}`}>
        {entry.imageUrl ? <img className={styles.image} src={imageUrl} alt="" loading="lazy" /> : null}
        <div className={`${styles.body} ${styles.expandedBody}`}>
          <button type="button" className={styles.backLink} onClick={onCollapse}>
            <Icon name="arrow-left" className={styles.ctaIcon} />
            <span>返回意識潮</span>
          </button>
          <div className={styles.meta}>
            {entry.formattedDate ? <span>{entry.formattedDate}</span> : null}
            {entry.formattedDate && (isFilm || entry.readingTimeMinutes) ? <span className={styles.separator}>·</span> : null}
            {isFilm ? <span>2 分 45 秒</span> : entry.readingTimeMinutes ? <span>{entry.readingTimeMinutes} 分鐘閱讀</span> : null}
          </div>
          <h2 className={styles.title}>{entry.title}</h2>
          {entry.tags.length > 0 ? (
            <div className={styles.tags} aria-label="Tags">
              {entry.tags.map((tag, index) => (
                <span className={styles.tagItem} key={tag}>
                  {index > 0 ? <span className={styles.tagSeparator}>·</span> : null}
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          ) : null}
          {entry.Content ? (
            <div className={styles.fullContent}>
              <BlogPostProvider content={entry.Content}>
                <div className="markdown">
                  <MDXContent>
                    <entry.Content />
                  </MDXContent>
                </div>
              </BlogPostProvider>
            </div>
          ) : null}
          <button type="button" className={styles.backLink} onClick={onCollapse}>
            <Icon name="arrow-left" className={styles.ctaIcon} />
            <span>返回意識潮</span>
          </button>
        </div>
      </article>
    );
  }

  // Immersive cards open on click / tap / Enter / Space. Hover intent is
  // opt-in only; 〈大爆炸〉 uses `immerse: click` to avoid accidental openings.
  const isImmersive = ['click', 'hover'].includes(entry.immerse) && immerse;

  function handleImmersiveKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      immerse.onOpen();
    }
  }

  const immersiveProps = isImmersive
    ? {
        ref: immerse.cardRef,
        role: 'button',
        tabIndex: 0,
        'aria-label': `閱讀〈${entry.title}〉`,
        'aria-haspopup': 'dialog',
        onPointerEnter: entry.immerse === 'hover' ? immerse.onPointerEnter : undefined,
        onPointerLeave: entry.immerse === 'hover' ? immerse.onPointerLeave : undefined,
        onClick: immerse.onOpen,
        onKeyDown: handleImmersiveKeyDown,
      }
    : {};

  return (
    <>
    <article
      ref={cardOrigin}
      className={clsx(styles.card, isImmersive && styles.immersive, isImmersive && immerse.approaching && styles.approaching)}
      {...immersiveProps}
    >
      <div className={styles.body}>
        <div className={styles.meta}>
          {entry.formattedDate ? <span>{entry.formattedDate}</span> : null}
          {entry.formattedDate && (isFilm || entry.readingTimeMinutes) ? <span className={styles.separator}>·</span> : null}
          {isFilm ? <span>2 分 45 秒</span> : entry.readingTimeMinutes ? <span>{entry.readingTimeMinutes} 分鐘閱讀</span> : null}
        </div>
        <h2 className={styles.title}>{entry.title}</h2>
        {entry.previewText ? <p className={styles.preview}>{entry.previewText}</p> : null}
        {entry.tags.length > 0 ? (
          <div className={styles.tags} aria-label="Tags">
            {entry.tags.map((tag, index) => (
              <span className={styles.tagItem} key={tag}>
                {index > 0 ? <span className={styles.tagSeparator}>·</span> : null}
                <span>{tag}</span>
              </span>
            ))}
          </div>
        ) : null}
        {!isImmersive ? (
          entry.readingUrl ? (
          <a className={styles.cta} href={readingUrl}>
            <span>繼續閱讀</span>
            <Icon name="arrow-right" className={styles.ctaIcon} />
          </a>
          ) : (
          <button ref={departureButton} type="button" className={styles.cta} onClick={onExpand}>
            <span>{isFilm ? '坐一會' : entry.readingExperience === 'panda-rider' ? '接單出發' : '繼續閱讀'}</span>
            <Icon name="arrow-right" className={styles.ctaIcon} />
          </button>
          )
        ) : null}
      </div>
    </article>
    {cosmicReturning ? <CosmicReturn originRef={cardOrigin} onComplete={() => setCosmicReturning(false)} /> : null}
    </>
  );
}
