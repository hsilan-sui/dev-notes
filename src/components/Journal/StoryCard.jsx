import {BlogPostProvider} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
import Icon from './Icon.jsx';
import styles from './StoryCard.module.css';

export default function StoryCard({entry, expanded, onExpand, onCollapse}) {
  if (!entry) {
    return null;
  }

  if (expanded) {
    return (
      <article className={`${styles.card} ${styles.expanded}`}>
        {entry.imageUrl ? <img className={styles.image} src={entry.imageUrl} alt="" loading="lazy" /> : null}
        <div className={`${styles.body} ${styles.expandedBody}`}>
          <button type="button" className={styles.backLink} onClick={onCollapse}>
            <Icon name="arrow-left" className={styles.ctaIcon} />
            <span>返回 Journal</span>
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
            <span>返回 Journal</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
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
        <button type="button" className={styles.cta} onClick={onExpand}>
          <span>繼續閱讀</span>
          <Icon name="arrow-right" className={styles.ctaIcon} />
        </button>
      </div>
    </article>
  );
}
