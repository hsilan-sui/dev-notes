import styles from './JournalNumeral.module.css';

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

export default function JournalNumeral({date, isToday}) {
  const day = date ? String(date.getUTCDate()).padStart(2, '0') : '—';
  const month = date ? monthFormatter.format(date).toUpperCase() : '—';
  const year = date ? String(date.getUTCFullYear()) : '—';

  return (
    <div className={styles.numeral} aria-label={date ? `今天 ${year} ${month} ${day}` : '正在取得今天的日期'}>
      <div className={styles.dateGroup}>
        <span className={styles.day}>{day}</span>
        <span className={styles.monthColumn}>
          <span className={styles.month}>{month}</span>
          <span className={styles.year}>{year}</span>
          {isToday ? <span className={styles.pill}>今天</span> : null}
        </span>
      </div>
    </div>
  );
}
