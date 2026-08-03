import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Icon from '../Icon';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

const chips = ['Backend API', 'Queue / Worker', '自動化整合', '地圖 / 公共資料'];

export default function PortfolioHero() {
  const profileImage = useBaseUrl('/img/me.png');

  return (
    <header className={styles.hero}>
      <div className={sharedStyles.container}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Backend / Automation / AI Engineer</p>
            <h1 className={styles.headline}>把複雜流程整理成可被使用、維護與持續迭代的產品與系統。</h1>
            <p className={styles.intro}>
              <span className={styles.introFull}>
                專注 Backend、自動化與 AI 應用的實作。把資料擷取、非同步任務、外部系統整合與地理資訊查詢，整理成可以真正被使用、被維護的產品。從需求釐清、架構設計到部署上線，我負責把整條路徑走完。
              </span>
              <span className={styles.introMobile}>
                專注 Backend、自動化與 AI 應用的實作。把資料擷取、非同步任務、外部系統整合與地理資訊查詢，整理成可以真正被使用、被維護的產品。
              </span>
            </p>
            <div className={styles.actions} aria-label="主要行動">
              <Link className={styles.primaryButton} to="#selected-projects">
                查看作品
                <Icon name="arrow-right" className={styles.buttonIcon} />
              </Link>
              <Link className={styles.secondaryButton} to="/docs/job-hunt-portfolio">
                查看履歷 / 求職摘要
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
            </div>
            <ul className={styles.chips} aria-label="核心能力">
              {chips.map((chip) => (
                <li className={styles.chip} key={chip}>
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.identity}>
            <img className={styles.avatar} src={profileImage} alt="于方成 Yu Fang-Cheng" />
            <div className={styles.identityText}>
              <p className={styles.name}>于方成 Yu Fang-Cheng</p>
              <p className={styles.role}>Backend / Automation / AI</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
