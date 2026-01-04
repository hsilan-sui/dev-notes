import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Mermaid from '@theme/Mermaid';

import Heading from '@theme/Heading';
import styles from './index.module.css';


//Hero區
function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "3rem",
    }}
  >
    {/* 左側：文字 */}
    <div style={{ flex: 1 }}>
  <p style={{ letterSpacing: "0.2em", opacity: 0.7 }}>
    HELLO，
  </p>
  <h1 style={{ fontSize: "3rem", margin: "0.5rem 0" }}>
    I'm Sui ｜ 游方箏.
  </h1>
  <h1 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>
    Backend × Automation × AI Agent
  </h1>

  <p
  style={{
    maxWidth: "420px",
    margin: "0 auto",        // 🔑 關鍵
    opacity: 0.8,
    textAlign: "center",
  }}
>
  把複雜流程，做成能被使用者使用的系統
</p>
  
  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center"  }}>
  <a
  href="https://line.me/R/ti/p/@998enzsc"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    textAlign: "center",
    display: "inline-block",
    textDecoration: "none",
    color: "inherit",
    marginTop: "2rem",
  }}
>
  <img
    src={useBaseUrl('/img/line-oa-qr.png')}
    alt="LINE OA QR Code"
    style={{
      width: "320px",
      borderRadius: "16px",
      background: "#fff",
      padding: "8px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
  />
</a>


      {/* <Link className="button button--secondary button--lg" href="https://github.com/hsilan-sui">
        My Github
      </Link> */}
  </div>


</div>


    {/* 右側：視覺佔位 「漂浮技能」都會掛在這個 div position: "relative"裡面 */}
    <div style={{ flex: 1, position: "relative", height: "420px" }}>
  
  {/* 圓環背景 */}
  <div
    style={{
      position: "absolute",
      inset: "0",
      margin: "auto",
      width: "360px",
      height: "360px",
      borderRadius: "50%",
      border: "8px solid rgba(255,100,80,0.8)",
      zIndex: 1,
    }}
  />

  {/* 你的照片 */}
  <img
  src={useBaseUrl('/img/me.png')}
  alt="Sui"
  style={{
    position: "absolute",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
    inset: 0,
    margin: "auto",
    width: "350px",
    height: "350px",
    borderRadius: "50%",   // 🔑 關鍵
    objectFit: "cover",   // 🔑 防止變形
    zIndex: 2,
  }}
/>
{/* 技能漂浮層 */}
{/* 技能漂浮層 */}
<div className={styles.skillFloat}>

  {/* ⭐ 主技能 */}
  <span
    className={`${styles.skillTag} ${styles.skillMain}`}
    style={{ top: "4%", left: "50%", transform: "translateX(-50%)" }}
  >
    Python × FastAPI
  </span>

  {/* 後端 */}
  <span
    className={styles.skillTag}
    style={{ top: "16%", left: "4%" }}
  >
    Node.js × Express
  </span>

  {/* 資料庫 */}
  <span
    className={styles.skillTag}
    style={{ top: "16%", right: "4%" }}
  >
    PostgreSQL
  </span>

  <span
    className={styles.skillTag}
    style={{ bottom: "16%", right: "4%" }}
  >
    Redis
  </span>

  {/* DevOps */}
  <span
    className={styles.skillTag}
    style={{ bottom: "8%", left: "8%" }}
  >
    Docker
  </span>

  <span
    className={styles.skillTag}
    style={{ bottom: "4%", left: "50%", transform: "translateX(-50%)" }}
  >
    CI/CD
  </span>

  {/* 應用層（專案特色） */}
  <span
    className={styles.skillTag}
    style={{ top: "38%", left: "2%" }}
  >
    AI Agent
  </span>

  <span
    className={styles.skillTag}
    style={{ top: "54%", left: "2%" }}
  >
    Automation
  </span>

  <span
    className={styles.skillTag}
    style={{ top: "38%", right: "2%" }}
  >
    LINE Bot
  </span>

  <span
    className={styles.skillTag}
    style={{ top: "54%", right: "2%" }}
  >
    Playwright
  </span>

  {/* 前端地圖 */}
  <span
    className={styles.skillTag}
    style={{ bottom: "28%", right: "10%" }}
  >
    Next.js × OSM
  </span>

</div>




</div>
</div>
</div>

    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main />
      <section style={{ padding: "4rem 2rem" }}>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "2rem",
      maxWidth: "960px",
      margin: "0 auto",
    }}
  >
    <div style={{ border: "1px solid #e5e7eb", padding: "1.5rem" }}>
      <h3>自動化資料流程</h3>
      <p>
        把查詢、整理、更新這些重複工作，變成可重用的資料流程。
      </p>
      <Link to="/docs">查看相關筆記 →</Link>
    </div>

    <div style={{ border: "1px solid #e5e7eb", padding: "1.5rem" }}>
      <h3>系統與流程設計</h3>
      <p>
        面對多狀態、多角色的需求，設計不會失控的後端結構。
      </p>
      <Link to="/docs">查看相關筆記 →</Link>
    </div>

    <div style={{ border: "1px solid #e5e7eb", padding: "1.5rem" }}>
      <h3>互動式服務入口</h3>
      <p>
        把後端能力包成一般人也能操作的互動服務。
      </p>
      <Link to="/docs">查看相關筆記 →</Link>
    </div>
  </div>
</section>

    </Layout>
  );
}
