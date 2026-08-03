import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
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
  const imageSrc = useBaseUrl(media.imageSrc || '');
  const videoSrc = useBaseUrl(media.videoSrc || '');

  if (media.type === 'video') {
    return (
      <div className={clsx(styles.mediaBlock, styles.videoMedia, styles[projectId])}>
        <div className={styles.videoBox} style={{aspectRatio: media.videoAspectRatio || '884 / 1400'}}>
          <TypeLabel>{media.typeLabel}</TypeLabel>
          {media.videoSrc ? (
            <video
              className={styles.phoneVideo}
              src={videoSrc}
              aria-label={media.imageAlt || media.placeholderNote}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <PlaceholderContent icon={iconByType.video} note={media.placeholderNote} />
          )}
          {/* TODO: wire onClick to open a full-size modal player for the real recording */}
          {!media.videoSrc && (
            <span className={styles.playButton} aria-hidden="true">
              <Icon name="play" className={styles.playIcon} />
            </span>
          )}
          {!media.videoSrc && media.durationLabel ? (
            <span className={styles.durationBadge}>{media.durationLabel}</span>
          ) : null}
        </div>
        {media.caption ? <p className={styles.caption}>{media.caption}</p> : null}
      </div>
    );
  }

  if (media.type === 'youtube') {
    const thumbnailSrc = media.youtubeId
      ? `https://i.ytimg.com/vi/${media.youtubeId}/hqdefault.jpg`
      : null;

    return (
      <div className={clsx(styles.mediaBlock, styles.youtubeMedia, styles[projectId])}>
        {media.youtubeUrl ? (
          <a
            className={styles.mediaBox}
            href={media.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={media.imageAlt || `在 YouTube 開啟：${media.placeholderNote}`}
          >
            <TypeLabel>{media.typeLabel}</TypeLabel>
            {thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={media.imageAlt || media.placeholderNote}
                className={styles.mediaImage}
                loading="lazy"
              />
            ) : (
              <PlaceholderContent icon={iconByType.youtube} note={media.placeholderNote} />
            )}
            <span className={styles.playButton} aria-hidden="true">
              <Icon name="play" className={styles.playIcon} />
            </span>
          </a>
        ) : (
          <div className={styles.mediaBox}>
            <TypeLabel>{media.typeLabel}</TypeLabel>
            <PlaceholderContent icon={iconByType.youtube} note={media.placeholderNote} />
            <span className={styles.playButton} aria-hidden="true">
              <Icon name="play" className={styles.playIcon} />
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={clsx(styles.mediaBlock, styles[`${media.type}Media`], styles[projectId])}>
      <div className={styles.mediaBox}>
        <TypeLabel>{media.typeLabel}</TypeLabel>
        {media.imageSrc ? (
          <img
            src={imageSrc}
            alt={media.imageAlt || media.placeholderNote}
            className={styles.mediaImage}
            loading="lazy"
          />
        ) : (
          <PlaceholderContent icon={iconByType[media.type]} note={media.placeholderNote} />
        )}
      </div>
    </div>
  );
}
