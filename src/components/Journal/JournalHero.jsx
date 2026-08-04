import JournalNumeral from './JournalNumeral.jsx';
import WaveTimeline from './WaveTimeline.jsx';
import styles from './JournalHero.module.css';

export default function JournalHero({currentDay, mostRecentDayKey, days, onSelectDay}) {
  return (
    <section className={styles.hero} aria-label="Journal timeline">
      <JournalNumeral date={currentDay.date} isMostRecent={currentDay.dayKey === mostRecentDayKey} />
      <WaveTimeline
        days={days}
        currentDayKey={currentDay.dayKey}
        mostRecentDayKey={mostRecentDayKey}
        onSelectDay={onSelectDay}
      />
    </section>
  );
}
