import Link from '@docusaurus/Link';
import Icon from '../Icon';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

// TODO: replace with per-category doc routes once the author confirms final file paths under docs/LINEOA-PORFOLIO/ (some candidates currently have " copy" in their filename and are not confirmed canonical)
const noteCategories = [
  '非同步任務設計筆記',
  'LINE Webhook 除錯紀錄',
  '地圖資料清理與地理資訊筆記',
  '部署與環境設定紀錄',
];

export default function TechnicalNotes() {
  return (
    <section className={styles.section}>
      <div className={sharedStyles.container}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Technical Notes</p>
            <h2 className={styles.title}>把解題過程整理成可追溯的技術筆記。</h2>
            <p className={styles.description}>
              技術筆記補足作品背後的設計取捨、除錯紀錄與部署脈絡，讓每個專案不只停在結果，也能被追問實作細節。
            </p>
            <Link className={styles.ctaLink} to="/docs/intro">
              前往技術筆記
              <Icon name="arrow-right" className={styles.linkIcon} />
            </Link>
          </div>
          <ul className={styles.noteList}>
            {noteCategories.map((label) => (
              <li key={label}>
                <Link className={styles.noteLink} to="/docs/intro">
                  <Icon name="file-search" className={styles.noteIcon} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
