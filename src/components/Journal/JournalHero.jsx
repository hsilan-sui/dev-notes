import JournalMark from './JournalMark.jsx';
import JournalNumeral from './JournalNumeral.jsx';
import WaveTimeline from './WaveTimeline.jsx';
import styles from './JournalHero.module.css';

export default function JournalHero({currentDay, mostRecentDayKey, days, onSelectDay}) {
  return (
    <section className={styles.hero} aria-label="意識潮時間軸">
      <div className={styles.numeralRow}>
        <JournalMark />
        <JournalNumeral
          date={currentDay.date}
          isMostRecent={currentDay.dayKey === mostRecentDayKey}
        />
      </div>
      <WaveTimeline
        days={days}
        currentDayKey={currentDay.dayKey}
        mostRecentDayKey={mostRecentDayKey}
        onSelectDay={onSelectDay}
      />
    </section>
  );
}
