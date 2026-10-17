import {useEffect, useRef, useState} from 'react';
import {BlogPostProvider} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
import clsx from 'clsx';
import Icon from './Icon.jsx';
import CosmicReturn from './CosmicReturn';
import styles from './StoryCard.module.css';
import {RiderExperience} from '../MyTide/PandaRider/PandaRider';

export default function StoryCard({entry, expanded, onExpand, onCollapse, immerse}) {
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

  // This work has its own departure, pacing and return. It does not use the
  // prose article shell: closing the ride returns directly to its timeline card.
  if (expanded && entry.readingExperience === 'panda-rider') {
    return <RiderExperience intro onClose={() => {
      returningFromRide.current = true;
      setCosmicReturning(true);
      onCollapse();
    }} />;
  }

  if (expanded) {
    return (
      <article className={`${styles.card} ${styles.expanded}`}>
        {entry.imageUrl ? <img className={styles.image} src={entry.imageUrl} alt="" loading="lazy" /> : null}
        <div className={`${styles.body} ${styles.expandedBody}`}>
          <button type="button" className={styles.backLink} onClick={onCollapse}>
            <Icon name="arrow-left" className={styles.ctaIcon} />
            <span>返回意識潮</span>
          </button>
          <div className={styles.meta}>
            {entry.formattedDate ? <span>{entry.formattedDate}</span> : null}
            {entry.formattedDate && entry.readingTimeMinutes ? <span className={styles.separator}>·</span> : null}
            {entry.readingTimeMinutes ? <span>{entry.readingTimeMinutes} 分鐘閱讀</span> : null}
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

  // `immerse: hover` entries open by resting on the whole card (or tap / Enter /
  // Space), so they carry no "繼續閱讀" link — see interaction spec §8.
  const isImmersive = entry.immerse === 'hover' && immerse;

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
        onPointerEnter: immerse.onPointerEnter,
        onPointerLeave: immerse.onPointerLeave,
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
      {entry.imageUrl ? (
        <img className={styles.image} src={entry.imageUrl} alt="" loading="lazy" />
      ) : null}
      <div className={styles.body}>
        <div className={styles.meta}>
          {entry.formattedDate ? <span>{entry.formattedDate}</span> : null}
          {entry.formattedDate && entry.readingTimeMinutes ? <span className={styles.separator}>·</span> : null}
          {entry.readingTimeMinutes ? <span>{entry.readingTimeMinutes} 分鐘閱讀</span> : null}
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
          <button ref={departureButton} type="button" className={styles.cta} onClick={onExpand}>
            <span>{entry.readingExperience === 'panda-rider' ? '接單出發' : '繼續閱讀'}</span>
            <Icon name="arrow-right" className={styles.ctaIcon} />
          </button>
        ) : null}
      </div>
    </article>
    {cosmicReturning ? <CosmicReturn originRef={cardOrigin} onComplete={() => setCosmicReturning(false)} /> : null}
    </>
  );
}
