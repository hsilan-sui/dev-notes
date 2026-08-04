import {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import JournalContentArea from './JournalContentArea.jsx';
import JournalHero from './JournalHero.jsx';
import useJournalTimeline from './useJournalTimeline.js';
import './tokens.css';
import styles from './JournalPage.module.css';

export default function JournalPage({items = [], metadata}) {
  const timeline = useJournalTimeline(items);
  const [currentDayKey, setCurrentDayKey] = useState(timeline.mostRecentDayKey);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [currentDayKey, currentEntryIndex]);

  useEffect(() => {
    if (timeline.mostRecentDayKey) {
      setCurrentDayKey(timeline.mostRecentDayKey);
      setCurrentEntryIndex(0);
    }
  }, [timeline.mostRecentDayKey]);

  const currentDay = useMemo(() => {
    if (!currentDayKey) {
      return null;
    }

    return timeline.days.find((day) => day.dayKey === currentDayKey) || null;
  }, [currentDayKey, timeline.days]);

  const currentEntry = currentDay?.entries[currentEntryIndex] || currentDay?.entries[0] || null;

  useEffect(() => {
    if (currentEntry) {
      setAnnouncement(`現在顯示：${currentEntry.title}`);
    }
  }, [currentEntry]);

  if (!currentDay || !currentEntry) {
    return (
      <main className={clsx('journal-scope', styles.page)} />
    );
  }

  const previousDayKey = timeline.getPrevDayWithEntry(currentDay.dayKey);
  const nextDayKey = timeline.getNextDayWithEntry(currentDay.dayKey);
  const previousDay = previousDayKey
    ? timeline.days.find((candidate) => candidate.dayKey === previousDayKey)
    : null;
  const nextDay = nextDayKey
    ? timeline.days.find((candidate) => candidate.dayKey === nextDayKey)
    : null;

  function selectDay(dayKey) {
    const day = timeline.days.find((candidate) => candidate.dayKey === dayKey);
    if (!day || day.entries.length === 0) {
      return;
    }

    setCurrentDayKey(dayKey);
    setCurrentEntryIndex(0);
  }

  function handlePreviousDay() {
    if (previousDayKey) {
      selectDay(previousDayKey);
    }
  }

  function handleNextDay() {
    if (nextDayKey) {
      selectDay(nextDayKey);
    }
  }

  function handlePreviousEntry() {
    setCurrentEntryIndex((index) => Math.max(0, index - 1));
  }

  function handleNextEntry() {
    setCurrentEntryIndex((index) => Math.min(currentDay.entries.length - 1, index + 1));
  }

  function handleCardRowKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePreviousDay();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNextDay();
    }
  }

  return (
    <main className={clsx('journal-scope', styles.page)}>
      <Link className={styles.backHomeLink} to="/" aria-label="折返首頁">
        <span className={styles.backHomeText} aria-hidden="true">折返</span>
        <span className={styles.backHomeTextHover} aria-hidden="true">返折</span>
      </Link>
      <JournalHero
        currentDay={currentDay}
        mostRecentDayKey={timeline.mostRecentDayKey}
        days={timeline.days}
        onSelectDay={selectDay}
      />
      <JournalContentArea
        currentDay={currentDay}
        currentEntry={currentEntry}
        currentEntryIndex={currentEntryIndex}
        previousDayKey={previousDayKey}
        nextDayKey={nextDayKey}
        previousEntryPreview={previousDay?.entries[0] || null}
        nextEntryPreview={nextDay?.entries[0] || null}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onPreviousEntry={handlePreviousEntry}
        onNextEntry={handleNextEntry}
        onCardRowKeyDown={handleCardRowKeyDown}
        isExpanded={isExpanded}
        onExpand={() => setIsExpanded(true)}
        onCollapse={() => setIsExpanded(false)}
      />
      <div className={styles.liveRegion} aria-live="polite" aria-atomic="true">{announcement}</div>
    </main>
  );
}
