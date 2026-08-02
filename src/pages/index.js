import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

const focusAreas = [
  {
    title: '互動式作品入口',
    description:
      '把履歷、專案與 demo 整合成可操作的入口，讓面試官不只看 PDF，而是真的能體驗流程。',
    link: '/docs/job-hunt-portfolio',
    label: '看求職入口',
  },
  {
    title: '非同步系統設計',
    description:
      '用 FastAPI、Queue、Worker 與 Push callback 處理長任務，讓使用者體驗與後端穩定性同時成立。',
    link: '/docs/LINEOA-PORFOLIO/overview',
    label: '看 LINE OA 專案',
  },
  {
    title: '技術筆記資產化',
    description:
      '把 Debug、架構取捨、部署流程與學習紀錄整理成可重用的知識庫，讓作品能持續長出說服力。',
    link: '/docs/intro',
    label: '看技術筆記',
  },
];

const strengths = [
  'Backend API design with Python, FastAPI, Node.js, and Express',
  'Automation workflows with queues, workers, scraping, and messaging platforms',
  'AI-assisted product thinking that connects system design, UX, and delivery',
];

const noteBuckets = [
  {
    title: '作品導向專案',
    body: 'LINE OA 互動作品集、AI 客服微服務、資料與地圖查詢流程，集中展示「做得出來」與「講得清楚」。',
    link: '/docs/LINEOA-PORFOLIO/overview',
  },
  {
    title: '後端與系統設計',
    body: 'Node.js、Database、System Design、CI/CD 與 Linux Sysadmin，補強你在面試裡會被追問的技術深度。',
    link: '/docs/backend/ai-chat-service',
  },
  {
    title: '學習脈絡與成長軌跡',
    body: '把技術筆記做成有敘事感的成長記錄，讓這個站不只是知識整理，也是一份持續更新的工程履歷。',
    link: '/docs/intro',
  },
];

function HomepageHeader() {
  const profileImage = useBaseUrl('/img/me.png');
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={clsx('container', styles.heroLayout)}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>SUI HSILAN · BACKEND / AUTOMATION / AI</p>
          <h1 className={styles.heroTitle}>把複雜流程整理成可被人使用的產品與系統</h1>
          <p className={styles.heroDescription}>
            這個網站正在重新啟用成我的求職主站，整合技術筆記、作品脈絡與可 demo
            的專案入口，幫助面試官快速理解我如何拆需求、設計流程、落地交付。
          </p>
          <div className={styles.heroActions}>
            <Link className={clsx('button button--lg', styles.primaryButton)} to="/docs/job-hunt-portfolio">
              求職入口
            </Link>
            <Link className={clsx('button button--lg', styles.secondaryButton)} to="/docs/LINEOA-PORFOLIO/overview">
              代表專案
            </Link>
          </div>
          <ul className={styles.strengthList}>
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.portraitFrame}>
            <div className={styles.orbit} />
            <img className={styles.portrait} src={profileImage} alt="Sui portrait" />
            <span className={styles.skillTag} style={{ top: '6%', left: '50%' }}>
              FastAPI
            </span>
            <span className={styles.skillTag} style={{ top: '20%', right: '4%' }}>
              Redis Queue
            </span>
            <span className={styles.skillTag} style={{ top: '52%', right: '0%' }}>
              Playwright
            </span>
            <span className={styles.skillTag} style={{ bottom: '12%', right: '12%' }}>
              LINE OA
            </span>
            <span className={styles.skillTag} style={{ bottom: '2%', left: '50%' }}>
              CI/CD
            </span>
            <span className={styles.skillTag} style={{ bottom: '18%', left: '0%' }}>
              PostgreSQL
            </span>
            <span className={styles.skillTag} style={{ top: '30%', left: '0%' }}>
              AI Agent
            </span>
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
      title="Sui Hsilan Portfolio"
      description="Sui 的後端、自動化與 AI 專案整合站"
    >
      <HomepageHeader />
      <main className={styles.mainContent}>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow}>FOCUS</p>
              <h2>這次重新啟用，我先把站點聚焦成求職真正會用到的內容</h2>
            </div>
            <div className={styles.cardGrid}>
              {focusAreas.map((item) => (
                <article key={item.title} className={styles.featureCard}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link className={styles.inlineLink} to={item.link}>
                    {item.label}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.highlightSection)}>
          <div className="container">
            <div className={styles.splitPanel}>
              <div>
                <p className={styles.sectionEyebrow}>FEATURED CASE</p>
                <h2>LINE OA 互動作品集是目前最適合拿來面試展示的代表作</h2>
              </div>
              <p className={styles.highlightCopy}>
                它不是單純的聊天機器人，而是一個把履歷、作品與服務流程串起來的互動入口。
                我把長任務拆成 queue + worker，讓系統穩定性、使用者回饋、以及 demo 體驗都能兼顧。
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow}>CONTENT MAP</p>
              <h2>這個站現在分成三種閱讀路線</h2>
            </div>
            <div className={styles.cardGrid}>
              {noteBuckets.map((item) => (
                <article key={item.title} className={styles.routeCard}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <Link className={styles.inlineLink} to={item.link}>
                    直接前往
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    
    </Layout>
  );
}
