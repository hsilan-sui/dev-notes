import NavButton from './NavButton.jsx';
import StoryCard from './StoryCard.jsx';
import styles from './JournalContentArea.module.css';

const sameDayCaptionId = 'journal-same-day-caption';

export default function JournalContentArea({
  currentDay,
  currentEntry,
  currentEntryIndex,
  previousDayKey,
  nextDayKey,
  previousEntryPreview,
  nextEntryPreview,
  onPreviousDay,
  onNextDay,
  onPreviousEntry,
  onNextEntry,
  onCardRowKeyDown,
  isExpanded,
  onExpand,
  onCollapse,
}) {
  const hasMultipleEntries = currentDay.entries.length > 1;
  const otherEntriesCount = Math.max(0, currentDay.entries.length - 1);
  const isFirstEntry = currentEntryIndex === 0;
  const isLastEntry = currentEntryIndex === currentDay.entries.length - 1;

  function handleSameDayKeyDown(event) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onPreviousEntry();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onNextEntry();
    }
  }

  return (
    <section className={styles.content} aria-label="Journal entry">
      {!isExpanded && hasMultipleEntries ? (
        <div className={styles.sameDayControl} onKeyDown={handleSameDayKeyDown}>
          <NavButton
            direction="up"
            size="vertical"
            disabled={isFirstEntry}
            onClick={onPreviousEntry}
            describedBy={sameDayCaptionId}
          />
          <p className={styles.sameDayCaption} id={sameDayCaptionId}>同一天，還有 {otherEntriesCount} 篇</p>
        </div>
      ) : null}

      <div className={styles.cardRow} onKeyDown={isExpanded ? undefined : onCardRowKeyDown}>
        {!isExpanded ? (
          <NavButton direction="prev" size="horizontal" disabled={!previousDayKey} onClick={onPreviousDay} />
        ) : null}
        <div className={styles.carouselStage}>
          {!isExpanded && previousEntryPreview ? (
            <button
              type="button"
              className={`${styles.previewPanel} ${styles.previewPanelPrevious}`}
              aria-label={`上一篇：${previousEntryPreview.title}`}
              onClick={onPreviousDay}
            >
              <span className={styles.previewKicker}>上一篇</span>
              <span className={styles.previewTitle}>{previousEntryPreview.title}</span>
            </button>
          ) : null}
          {!isExpanded && nextEntryPreview ? (
            <button
              type="button"
              className={`${styles.previewPanel} ${styles.previewPanelNext}`}
              aria-label={`下一篇：${nextEntryPreview.title}`}
              onClick={onNextDay}
            >
              <span className={styles.previewKicker}>下一篇</span>
              <span className={styles.previewTitle}>{nextEntryPreview.title}</span>
            </button>
          ) : null}
          <div className={styles.cardShell} key={currentEntry.permalink}>
            <StoryCard entry={currentEntry} expanded={isExpanded} onExpand={onExpand} onCollapse={onCollapse} />
          </div>
        </div>
        {!isExpanded ? (
          <NavButton direction="next" size="horizontal" disabled={!nextDayKey} onClick={onNextDay} />
        ) : null}
      </div>

      {!isExpanded && hasMultipleEntries ? (
        <div className={styles.sameDayControl} onKeyDown={handleSameDayKeyDown}>
          <NavButton direction="down" size="vertical" disabled={isLastEntry} onClick={onNextEntry} />
        </div>
      ) : null}

      {!isExpanded ? (
        <p className={styles.navCaption}>沿著時間軸往前，翻閱更早以前寫下的字。</p>
      ) : null}
    </section>
  );
}
