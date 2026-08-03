import Icon from '../Icon';
import SectionHeading from '../SectionHeading';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

const capabilities = [
  {icon: 'workflow', title: '非同步系統設計', description: '以 Queue、Worker 與 Webhook 拆解長流程，確保任務可重試、可追蹤、不阻塞主流程。', evidence: '地政圖資小幫手'},
  {icon: 'refresh-cw', title: '資料與流程自動化', description: '將網頁查詢、資料擷取與整理串成自動化管線，取代人工重複操作。', evidence: '地政圖資小幫手 / 心理諮商地圖'},
  {icon: 'map-pin', title: '地圖與公共資料產品化', description: '把公共資料整理成地圖、距離排序與條件查詢，做成可直接使用的資源入口。', evidence: '心理諮商地圖'},
  {icon: 'scan-face', title: 'AI 與影像辨識應用', description: '將影像辨識流程整合進實際專案，產出可觀看、可驗證的辨識成果。', evidence: '公仔辨識系統'},
  {icon: 'package', title: '產品化後端', description: '把 API 服務、對話流程與系統整合，交付成使用者真正會用的產品，而不只是技術 Demo。', evidence: 'LINE OA 互動作品集'},
];

function CapabilityItem({icon, title, description, evidence}) {
  return (
    <article className={styles.item}>
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon name={icon} className={styles.icon} />
      </span>
      <div className={styles.itemCopy}>
        <h3 className={styles.itemTitle}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <p className={styles.evidence}>對應作品：{evidence}</p>
      </div>
    </article>
  );
}

export default function EngineeringCapabilities() {
  return (
    <section className={styles.section}>
      <div className={sharedStyles.container}>
        <div className={styles.stack}>
          <SectionHeading
            eyebrow="Engineering Capabilities"
            title="Engineering Capabilities"
            description="能力不是抽象條列，而是對應到實際做過、可以被追問細節的作品。"
          />
          <div className={styles.grid}>
            {capabilities.map((item) => (
              <CapabilityItem key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
