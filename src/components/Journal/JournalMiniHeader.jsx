import styles from './JournalMiniHeader.module.css';

export default function JournalMiniHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>
        <span className={styles.eyebrow}>JOURNAL</span>
        <span className={styles.tagline}>· 時間留下的字</span>
      </div>
      <p className={styles.caption}>詩 · 散文 · 旅行 · 生活</p>
    </header>
  );
}
