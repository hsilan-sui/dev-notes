import Link from '@docusaurus/Link';
import Icon from '../Icon';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

export default function FinalCallToAction() {
  return (
    <section className={styles.section}>
      <div className={sharedStyles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>想看更多細節，或聊聊機會？</h2>
          <div className={styles.actions} aria-label="結尾行動">
            <Link className={styles.primaryButton} to="#selected-projects">
              查看完整作品集
              <Icon name="arrow-right" className={styles.buttonIcon} />
            </Link>
            <Link className={styles.secondaryButton} to="/docs/job-hunt-portfolio">
              查看履歷
            </Link>
            <Link
              className={styles.ghostButton}
              href="https://github.com/hsilan-sui/sui-dev-notes"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="github" className={styles.buttonIcon} />
              GitHub
            </Link>
            {/* TODO: 尚無公開 Email，取得後改成 mailto: 連結 */}
            <span
              className={styles.disabledButton}
              title="尚未提供，補齊素材後再串接"
              aria-disabled="true"
            >
              <Icon name="mail" className={styles.buttonIcon} />
              Email
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
