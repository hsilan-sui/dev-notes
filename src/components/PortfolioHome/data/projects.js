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
 * @property {string=} imageSrc   // real asset path under /static, e.g. '/img/portfolio/...'; falls back to the placeholder box when omitted
 * @property {string=} imageAlt
 * @property {string=} videoSrc   // real asset path under /static, e.g. '/video/...'; renders an autoplay/loop/muted <video> in the pillarboxed phone frame when set
 * @property {string=} videoAspectRatio   // CSS aspect-ratio value matching the real recording, e.g. '886 / 1920'; defaults to '884 / 1400'
 * @property {string=} caption
 * @property {string=} durationLabel
 * @property {string=} youtubeId    // YouTube video id; renders the real https://i.ytimg.com thumbnail when set
 * @property {string=} youtubeUrl   // full https://www.youtube.com/watch?v=... URL (may include a &t= timestamp), used as the thumbnail's click target
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
    name: '全台心理諮商合作機構查詢地圖',
    problem:
      '需求：衛福部提供 15 至 45 歲民眾每人 3 次免費心理諮商，但合作機構資料藏在多層頁面與查詢表單中，不容易快速比較地點、名額與服務資訊。(有什麼公共資源 → 查找時我遇到什麼困難？ → 我為什麼做這個專案。)',
    solution:
      '我怎麼做：整理衛福部合作機構公開資料，轉換成地圖與清單介面，讓使用者依縣市、名額狀態與距離篩選合作機構。',
    tags: [
      'Next.js',
      'Leaflet',
      '資料清理',
      '地理資訊',
      'OPEN_DATA資料',
    ],
    media: {
      type: 'screenshot',
      typeLabel: 'PRODUCT SCREENSHOT',
      placeholderNote:
        '地圖主畫面：縣市與名額篩選、合作機構列表及地圖標記',
      imageSrc: '/img/portfolio/counseling-map.png',
      imageAlt: '全台心理諮商地圖的篩選條件、合作機構列表與地圖標記',
    },
    links: [
      // TODO: 尚未建立獨立案例頁，完成後改為實際路由。
      // {
      //   label: '查看案例',
      //   disabled: true,
      //   todo: '尚無獨立案例頁，待補',
      // },
      {
        label: '開啟地圖 Demo',
        href: 'https://counseling-map.vercel.app/',
      },
      {
        label: 'GitHub',
        href: 'https://github.com/hsilan-sui/counseling-map',
      },
      {
        label: '透過 LINE_OA 互動體驗',
        href: 'https://line.me/R/ti/p/@998enzsc',
      },
    ],
  },
  {
    id: 'landinfo-helper',
    tier: 'selected',
    name: '地政圖資小幫手',
    problem:
      '需求：林業現場臨時接到林地主需求時，常需要先查詢段名、地號與周邊圖資；傳統流程必須回到電腦操作政府網站，步驟繁瑣，也不利於現場快速評估。',
    solution:
      '我怎麼做：將地號輸入、背景派工、政府網站查詢、圖資擷取與 LINE 推播串成自動化流程，讓使用者能在山林現場先取得初步資料，再決定是否攜帶定位設備進場勘查。',
    tags: [
      'Playwright',
      'BullMQ',
      'Queue / Worker',
      'Cloud Storage',
      'LINE Push',
    ],
    media: {
      type: 'video',
      typeLabel: 'RESULT PREVIEW',
      placeholderNote:
        '段名地號輸入、背景查詢與 LINE 圖資回傳流程',
      videoSrc: '/video/land_info.mp4',
      videoAspectRatio: '884 / 1638',
      imageAlt: '透過 LINE 輸入段名地號並接收地政圖資查詢結果',
      caption: '自動循環播放（靜音展示）',
    },
    links: [    
      // {
      //     label: '查看案例',
      //     disabled: true,
      //     todo: '/docs/LINEOA-PORFOLIO/landinfo-project',
      //   },
      {
        label: 'GitHub',
        to: 'https://github.com/hsilan-sui/landinfo_api',
      },
    ],
  },
  {
    id: 'line-oa-portfolio',
    tier: 'selected',
    name: 'LINE OA 互動作品集',
    problem: '需求：專案分散在多個連結，整合之前的流程，以LINE BOT作為快速看專案測試的小窗口。',
    solution: '我怎麼做：把專案導覽與可操作 Demo 整合進 LINE 對話入口，可以直接互動查看。',
    tags: ['FastAPI', 'LINE Messaging API', 'Webhook', 'Redis', 'Queue / Worker'],
    media: {
      type: 'video',
      typeLabel: 'VIDEO PREVIEW',
      placeholderNote: 'LINE 對話畫面',
      videoSrc: '/video/line_oa_demo.mp4',
      videoAspectRatio: '884 / 1400',
      imageAlt: 'LINE OA 互動作品集操作展示（自動循環播放）',
      caption: '自動循環播放（靜音展示）',
    },
    links: [
      // {label: '查看案例', to: '/docs/LINEOA-PORFOLIO/overview'},
      {
        label: 'GitHub',
        to: 'https://github.com/hsilan-sui/line_resume_fastapi',
      },
      {label: '立即體驗', href: 'https://line.me/R/ti/p/@998enzsc'},
    ],
  },
  {
    id: 'figurine-recognition',
    tier: 'more',
    name: '公仔商品辨識結帳系統',
    problem:
      '需求：將 AI 模型訓練與 IoT 裝置整合，驗證實體商品能否由邊緣裝置完成辨識並帶入結帳流程。',
    solution:
      '我怎麼做：從建立公仔影像資料集、訓練物件辨識模型，到將模型部署在 AMB82 邊緣裝置，並串接 Flask 後端與購物車介面，完成一套可實際操作的商品辨識結帳 Demo。',
    tags: [
      'YOLOv4-tiny',
      'Computer Vision',
      'AMB82',
      'Edge AI',
      'Flask',
      'AIoT',
    ],
    media: {
      type: 'youtube',
      typeLabel: 'PROJECT DEMO',
      placeholderNote: '公仔辨識、商品加入購物車與結帳流程實際演示',
      youtubeId: 'b0CbNcgBwGQ',
      youtubeUrl: 'https://www.youtube.com/watch?v=b0CbNcgBwGQ&t=41s',
    },
    links: [
      {
        label: '觀看專案影片',
        href: 'https://www.youtube.com/watch?v=b0CbNcgBwGQ&t=41s',
      },
      {
        label: 'GitHub',
        href: 'https://github.com/hsilan-sui/ToyVisionPay_project',
      },
    ],
  },
];
