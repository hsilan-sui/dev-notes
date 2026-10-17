import JournalMark from './JournalMark.jsx';
import JournalNumeral from './JournalNumeral.jsx';
import SignalRiver from './SignalRiver.jsx';
import TodaySong from './TodaySong.jsx';
import WaveTimeline from './WaveTimeline.jsx';
import styles from './JournalHero.module.css';
import useTaipeiToday from './useTaipeiToday';

export default function JournalHero({currentDay, mostRecentDayKey, days, onSelectDay}) {
  const todayKey = useTaipeiToday();
  const today = todayKey ? new Date(`${todayKey}T00:00:00Z`) : null;
  return (
    <section className={styles.hero} aria-label="意識潮時間軸">
      <div className={styles.numeralRow}>
        <div className={styles.markColumn}>
          <JournalMark />
          <TodaySong />
        </div>
        <JournalNumeral
          date={today}
          isToday
        />
      </div>
      <WaveTimeline
        days={days}
        todayKey={todayKey}
        currentDayKey={currentDay.dayKey}
        mostRecentDayKey={mostRecentDayKey}
        onSelectDay={onSelectDay}
      />
      <SignalRiver onSelectDay={onSelectDay} />
    </section>
  );
}
