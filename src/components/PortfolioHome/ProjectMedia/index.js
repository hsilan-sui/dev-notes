import clsx from 'clsx';
import Icon from '../Icon';
import styles from './styles.module.css';

const iconByType = {
  screenshot: 'map',
  result: 'file-search',
  video: 'message-circle',
  youtube: 'scan-face',
};

function PlaceholderContent({icon, note, className}) {
  return (
    <div className={clsx(styles.placeholderContent, className)}>
      <Icon name={icon} className={styles.placeholderIcon} />
      <span>{note}</span>
    </div>
  );
}

function TypeLabel({children}) {
  return <span className={styles.typeLabel}>{children}</span>;
}

export default function ProjectMedia({media, projectId}) {
  if (media.type === 'video') {
    return (
      <div className={clsx(styles.mediaBlock, styles.videoMedia, styles[projectId])}>
        <div className={styles.videoOuter}>
          <TypeLabel>{media.typeLabel}</TypeLabel>
          <div className={styles.phoneFrame}>
            <PlaceholderContent icon={iconByType.video} note={media.placeholderNote} />
          </div>
          {/* TODO: wire onClick to open a modal / <video> once a real recording exists */}
          <span className={styles.playButton} aria-hidden="true">
            <Icon name="play" className={styles.playIcon} />
          </span>
          {media.durationLabel ? <span className={styles.durationBadge}>{media.durationLabel}</span> : null}
        </div>
        {media.caption ? <p className={styles.caption}>{media.caption}</p> : null}
      </div>
    );
  }

  if (media.type === 'youtube') {
    return (
      <div className={clsx(styles.mediaBlock, styles.youtubeMedia, styles[projectId])}>
        <div className={styles.mediaBox}>
          <TypeLabel>{media.typeLabel}</TypeLabel>
          <PlaceholderContent icon={iconByType.youtube} note={media.placeholderNote} />
          <span className={styles.playButton} aria-hidden="true">
            <Icon name="play" className={styles.playIcon} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.mediaBlock, styles[`${media.type}Media`], styles[projectId])}>
      <div className={styles.mediaBox}>
        <TypeLabel>{media.typeLabel}</TypeLabel>
        <PlaceholderContent icon={iconByType[media.type]} note={media.placeholderNote} />
      </div>
    </div>
  );
}
