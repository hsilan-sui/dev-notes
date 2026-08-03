/**
 * @typedef {Object} ProjectLink
 * @property {string} label
 * @property {string=} to
 * @property {string=} href
 * @property {boolean=} disabled
 * @property {string=} todo
 *
 * @typedef {Object} ProjectMediaData
 * @property {'screenshot'|'result'|'video'|'youtube'} type
 * @property {string} typeLabel
 * @property {string} placeholderNote
 * @property {string=} caption
 * @property {string=} durationLabel
 *
 * @typedef {Object} ProjectData
 * @property {string} id
 * @property {'selected'|'more'} tier
 * @property {string} name
 * @property {string} problem
 * @property {string} solution
 * @property {string[]} tags
 * @property {ProjectMediaData} media
 * @property {ProjectLink[]} links
 */

/** @type {ProjectData[]} */
export const projects = [
  {
    id: 'counseling-map',
    tier: 'selected',
    name: '心理諮商地圖',
    problem: '問題：公共心理諮商資源分散、難以依地區與條件查詢。',
    solution: '解法：整理公共資料，做成可用地圖瀏覽、依距離排序與條件篩選的資源查詢入口。',
    tags: ['Next.js', 'Leaflet', '資料清理', '地理資訊', '公共資料產品化'],
    media: {
      type: 'screenshot',
      typeLabel: 'PRODUCT SCREENSHOT',
      placeholderNote: '建議補入畫面：地圖主畫面（篩選條件 + 資源列表 + 標記點）',
    },
    links: [
      // TODO: 心理諮商地圖尚無獨立案例頁，取得真實路由後改為 to。
      {label: '查看案例', disabled: true, todo: '尚無獨立案例頁，待補'},
      // TODO: 心理諮商地圖尚無公開 Demo 網址，取得真實 URL 後改為 href。
      {label: '開啟地圖 Demo', disabled: true, todo: '尚無公開 Demo 網址，待補'},
      // TODO: 心理諮商地圖尚無確認的專案 Repo 連結，取得真實 URL 後改為 href。
      {label: 'GitHub', disabled: true, todo: '尚無確認的專案 Repo 連結，待補'},
      {label: '透過 LINE 體驗', href: 'https://line.me/R/ti/p/@998enzsc'},
    ],
  },
  {
    id: 'landinfo-helper',
    tier: 'selected',
    name: '地政圖資小幫手',
    problem: '問題：地號圖資查詢分散在政府網站，手動截圖存檔耗時。',
    solution: '解法：串接地號輸入、網頁查詢、圖資擷取與 LINE 回傳，整條流程自動化。',
    tags: ['Playwright', 'BullMQ', 'Queue / Worker', 'Cloud Storage', 'LINE Push'],
    media: {
      type: 'result',
      typeLabel: 'RESULT PREVIEW',
      placeholderNote: '建議補入畫面：地號查詢結果、LINE 回傳畫面、自動化流程示意圖',
    },
    links: [
      {label: '查看案例', to: '/docs/LINEOA-PORFOLIO/landinfo-project'},
      {label: '查看流程', to: '/docs/LINEOA-PORFOLIO/landinfo-project'},
      // TODO: 地政圖資小幫手尚無確認的專案 Repo 連結，取得真實 URL 後改為 href。
      {label: 'GitHub', disabled: true, todo: '尚無確認的專案 Repo 連結，待補'},
    ],
  },
  {
    id: 'line-oa-portfolio',
    tier: 'selected',
    name: 'LINE OA 互動作品集',
    problem: '問題：履歷與作品分散在多個連結，面試官難以快速瀏覽。',
    solution: '解法：把履歷、作品導覽與可操作 Demo 整合進 LINE 對話入口，直接互動查看。',
    tags: ['FastAPI', 'LINE Messaging API', 'Webhook', 'Redis', 'Queue / Worker'],
    media: {
      type: 'video',
      typeLabel: 'VIDEO PREVIEW',
      placeholderNote: 'LINE 對話畫面',
      caption: '點擊播放 30 秒操作展示 · 首頁不自動播放',
      durationLabel: '0:30',
    },
    links: [
      {label: '查看案例', to: '/docs/LINEOA-PORFOLIO/overview'},
      // TODO: LINE OA 互動作品集尚無影片檔，取得真實素材後改為開啟播放器或 Modal。
      {label: '播放 30 秒展示', disabled: true, todo: '尚無影片檔，待補後改為開啟播放器/Modal'},
      {label: '立即體驗', href: 'https://line.me/R/ti/p/@998enzsc'},
    ],
  },
  {
    id: 'figurine-recognition',
    tier: 'more',
    name: '公仔辨識系統',
    problem: '',
    solution: '使用影像辨識流程識別公仔，是 AIoT 訓練期間完成的真實成果，可完整觀看專案影片與原始碼。',
    tags: ['影像辨識', 'AIoT', 'Python'],
    media: {
      type: 'youtube',
      typeLabel: 'YOUTUBE',
      placeholderNote: 'YouTube 展示影片縮圖',
    },
    links: [
      // TODO: 公仔辨識系統尚無 YouTube 連結，取得真實 URL 後改為 href。
      {label: '觀看專案影片', disabled: true, todo: '尚無 YouTube 連結，待補'},
      // TODO: 公仔辨識系統尚無確認的專案 Repo 連結，取得真實 URL 後改為 href。
      {label: 'GitHub', disabled: true, todo: '尚無確認的專案 Repo 連結，待補'},
    ],
  },
];
