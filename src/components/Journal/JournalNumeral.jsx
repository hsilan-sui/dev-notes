import styles from './JournalNumeral.module.css';

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

export default function JournalNumeral({date, isMostRecent}) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = monthFormatter.format(date).toUpperCase();
  const year = String(date.getUTCFullYear());

  return (
    <div className={styles.numeral} aria-label={`${year} ${month} ${day}`}>
      <span className={styles.day}>{day}</span>
      <span className={styles.monthColumn}>
        <span className={styles.month}>{month}</span>
        <span className={styles.year}>{year}</span>
        {isMostRecent ? <span className={styles.pill}>今天</span> : null}
      </span>
    </div>
  );
}
