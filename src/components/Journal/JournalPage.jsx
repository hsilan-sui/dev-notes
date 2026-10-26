import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import JournalContentArea from './JournalContentArea.jsx';
import JournalHero from './JournalHero.jsx';
import CosmicReturn from './CosmicReturn';
import ImmerseReader from './ImmerseReader.jsx';
import SiteBroadcast from './SiteBroadcast.jsx';
import SiteCounter from './SiteCounter.jsx';
import {SignalLangProvider} from './signalI18n.js';
import useCountEntryOpen from './useCountEntryOpen.js';
import useHoverIntent from './useHoverIntent.js';
import useJournalTimeline from './useJournalTimeline.js';
import './tokens.css';
import styles from './JournalPage.module.css';

// The BB Call language (and the words that follow it) is shared by the whole page.
export default function JournalPage(props) {
  return (
    <SignalLangProvider>
      <JournalPageContent {...props} />
    </SignalLangProvider>
  );
}

function JournalPageContent({items = [], metadata}) {
  const timeline = useJournalTimeline(items);
  const contentRef = useRef(null);
  const [currentDayKey, setCurrentDayKey] = useState(timeline.mostRecentDayKey);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  // Hover to Immerse (Experiment 001): null → 'approach' → 'open' → 'closing' → null.
  const [immersePhase, setImmersePhase] = useState(null);
  const immerseCardRef = useRef(null);

  const handleApproachChange = useCallback((isApproaching) => {
    setImmersePhase((phase) => {
      if (phase === 'open' || phase === 'closing') {
        return phase;
      }
      return isApproaching ? 'approach' : null;
    });
  }, []);
  const handleImmerseOpen = useCallback(() => setImmersePhase('open'), []);
  const {onPointerEnter, onPointerLeave, cancel: cancelHoverIntent, rearmAfterClose} = useHoverIntent({
    onApproachChange: handleApproachChange,
    onIntent: handleImmerseOpen,
  });
  const handleImmerseCloseStart = useCallback(() => setImmersePhase('closing'), []);
  const handleImmerseClosed = useCallback(() => {
    setImmersePhase(null);
    rearmAfterClose(immerseCardRef.current);
    immerseCardRef.current?.focus({preventScroll: true});
  }, [rearmAfterClose]);
  const isImmersed = immersePhase === 'open' || immersePhase === 'closing';

  useEffect(() => {
    setIsExpanded(false);
  }, [currentDayKey, currentEntryIndex]);

  // An expanded card is reading too: let the song player stop and close.
  useEffect(() => {
    if (isExpanded) {
      window.dispatchEvent(new CustomEvent('mytide:immerse', {detail: {open: true}}));
    }
  }, [isExpanded]);

  // The phone cue flips once the reader has gone down: 「往上 BB Call 留言」.
  const [cueUp, setCueUp] = useState(false);
  useEffect(() => {
    if (!cueUp) {
      return undefined;
    }
    // Back near the top by any means (after having left it): offer the way down again.
    let leftTop = window.scrollY >= 24;
    const onScroll = () => {
      if (window.scrollY >= 24) {
        leftTop = true;
      } else if (leftTop) {
        setCueUp(false);
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [cueUp]);

  useEffect(() => {
    if (timeline.mostRecentDayKey) {
      setCurrentDayKey(timeline.mostRecentDayKey);
      setCurrentEntryIndex(0);
    }
  }, [timeline.mostRecentDayKey]);

  // `/my-tide#lost-words` opens straight onto that entry's card; an unknown hash
  // leaves the page on the most recent day. `?return=stardust` (coming back from
  // a reading page such as the museum) arrives through the stardust instead.
  const [scrollToEntry, setScrollToEntry] = useState(false);
  const [stardustArrival, setStardustArrival] = useState(false);
  // The card right after the content anchor, looked up when the stardust starts.
  const arrivalOriginRef = useMemo(() => ({
    get current() {
      return contentRef.current?.nextElementSibling?.querySelector('article') || null;
    },
  }), []);
  useEffect(() => {
    function openEntryFromHash() {
      const slug = decodeHash(window.location.hash);
      if (!slug) {
        return;
      }
      for (const day of timeline.days) {
        const index = day.entries.findIndex((entry) => entry.slug === slug);
        if (index !== -1) {
          setCurrentDayKey(day.dayKey);
          setCurrentEntryIndex(index);
          const params = new URLSearchParams(window.location.search);
          if (params.get('return') === 'stardust') {
            // Only once: a reload or a shared link opens plainly.
            params.delete('return');
            const query = params.toString();
            window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
            setStardustArrival(true);
          } else {
            setScrollToEntry(true);
          }
          return;
        }
      }
    }
    openEntryFromHash();
    window.addEventListener('hashchange', openEntryFromHash);
    return () => window.removeEventListener('hashchange', openEntryFromHash);
  }, [timeline.days]);

  useEffect(() => {
    if (!scrollToEntry) {
      return;
    }
    setScrollToEntry(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    contentRef.current?.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
    // Already down at the story: the phone cue offers the way back up.
    setCueUp(true);
  }, [scrollToEntry]);

  const currentDay = useMemo(() => {
    if (!currentDayKey) {
      return null;
    }

    return timeline.days.find((day) => day.dayKey === currentDayKey) || null;
  }, [currentDayKey, timeline.days]);

  const currentEntry = currentDay?.entries[currentEntryIndex] || currentDay?.entries[0] || null;

  // Expanded in place or immersed: the reader opened this entry.
  const countEntryOpen = useCountEntryOpen();
  const openedSlug = isExpanded || immersePhase === 'open' ? currentEntry?.slug : null;
  useEffect(() => {
    countEntryOpen(openedSlug);
  }, [countEntryOpen, openedSlug]);

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
    <main
      className={clsx('journal-scope', styles.page)}
      data-immerse={immersePhase || undefined}
      inert={immersePhase === 'open' ? true : undefined}
    >
      <SiteBroadcast />
      <JournalHero
        currentDay={currentDay}
        mostRecentDayKey={timeline.mostRecentDayKey}
        days={timeline.days}
        onSelectDay={selectDay}
      />
      {/* Phones: the banner is tall, so offer a gentle way down to the story,
          and once there, a way back up to the BB Calls. */}
      <button
        type="button"
        className={styles.scrollCue}
        onClick={() => {
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const behavior = reduced ? 'auto' : 'smooth';
          if (cueUp) {
            document.querySelector('[data-phase]')?.scrollIntoView({behavior, block: 'center'});
          } else {
            contentRef.current?.scrollIntoView({behavior, block: 'start'});
          }
          setCueUp(!cueUp);
        }}
      >
        <span>{cueUp ? '往上 BB Call 留言' : '往下讀'}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d={cueUp ? 'M3 7.5 6 4.5 9 7.5' : 'M3 4.5 6 7.5 9 4.5'} />
        </svg>
      </button>
      <div ref={contentRef} className={styles.contentAnchor} />
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
        immerse={{
          cardRef: immerseCardRef,
          approaching: immersePhase === 'approach',
          onPointerEnter,
          onPointerLeave,
          onOpen: () => {
            cancelHoverIntent();
            handleImmerseOpen();
          },
        }}
      />
      {isImmersed ? (
        <ImmerseReader
          entry={currentEntry}
          originRef={immerseCardRef}
          onCloseStart={handleImmerseCloseStart}
          onClosed={handleImmerseClosed}
        />
      ) : null}
      {stardustArrival ? (
        <CosmicReturn
          originRef={arrivalOriginRef}
          onComplete={() => {
            setStardustArrival(false);
            setCueUp(true);
          }}
        />
      ) : null}
      <SiteCounter />
      <div className={styles.liveRegion} aria-live="polite" aria-atomic="true">{announcement}</div>
    </main>
  );
}

function decodeHash(hash) {
  const raw = hash.replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
