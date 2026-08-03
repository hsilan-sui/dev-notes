import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Icon from '../Icon';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

const chips = ['軟體工程師'];

export default function PortfolioHero() {
  const profileImage = useBaseUrl('/img/me.png');

  return (
    <header className={styles.hero}>
      <div className={sharedStyles.container}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>軟體工程師</p>
            <h1 className={styles.headline}>喜歡拆解繁複的流程，
            把資料、裝置與外部服務整理成容易使用與維護的服務。</h1>
            <p className={styles.intro}>
              <span className={styles.introFull}>
              主要使用 Python 與 Node.js 開發後端服務，處理 API、資料整合、非同步任務與流程自動化。
              曾參與 IoT 機台資料收集系統，負責 MQTT、UART、OTA 更新與後端串接；也將心理諮商查詢與地政圖資服務整合進 LINE Bot，完成從資料處理到使用者入口的實作。。
              </span>
              <span className={styles.introMobile}>
              我喜歡從實際使用情境出發，把原本分散、重複或操作繁瑣的流程，整理成容易使用與維護的服務。
              </span>
            </p>
            <div className={styles.actions} aria-label="主要行動">
              <Link className={styles.primaryButton} to="#selected-projects">
                查看作品
                <Icon name="arrow-right" className={styles.buttonIcon} />
              </Link>
              <Link
                className={styles.ghostButton}
                href="https://github.com/hsilan-sui"
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
            <img className={styles.avatar} src={profileImage} alt="游方箏Sui" />
            <div className={styles.identityText}>
              <p className={styles.name}>游方箏 | Sui</p>
              <p className={styles.role}>Python / Node.js</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
