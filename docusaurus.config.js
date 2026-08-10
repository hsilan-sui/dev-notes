// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const mobileNotesDropdownItems = [
  { type: 'html', value: '<span class="mobile-notes-dropdown-heading">MySQL</span>' },
  { to: '/docs/MySQL/aggre-fns', label: '【聚合函式 Aggregate Fns】把多筆資料彙總成一個統計結果' },
  { to: '/docs/MySQL/groupby', label: '【GROUP BY 分組】先分類，再對每組分別統計' },
  { to: '/docs/MySQL/gruopby-combine', label: '【GROUP BY 觀念釐清】分組 → 計算 → 組合結果' },
  { to: '/docs/MySQL/gruopby-limit', label: '【GROUP BY 侷限】分組之後，為什麼不能想拿什麼欄位就拿什麼？' },
  { to: '/docs/MySQL/union', label: '【UNION / UNION ALL】把多個查詢結果上下拼接' },
  { to: '/docs/MySQL/groupsets', label: '【GROUPING SETS】一次完成多種分組統計' },
  { to: '/docs/MySQL/having', label: '【SQL觀念筆記_HAVING】分組之後再篩選資料' },
  { to: '/docs/MySQL/functions', label: '【SQL Functions】我到底是在算「一列」還是「一群資料」？' },
  { to: '/docs/MySQL/sqlbolt10', label: '【SQL 聚合查詢】參考：SQLBolt Lesson 10(解題練習)' },
  { to: '/docs/MySQL/sqlbolt11', label: '【SQL 聚合查詢】參考：SQLBolt Lesson 11(解題練習)' },
  { to: '/docs/MySQL/sqlbolttest', label: '【SQL 聚合查詢】情境題：區分何時用HAVING？' },
  { to: '/docs/MySQL/sqlbolttestwhere', label: '【SQL 聚合查詢】情境題：組合WHERE,GROUP BY, HAVING' },
  { to: '/docs/MySQL/sqbl13', label: '【SQL 聚合查詢】觀念複習：SQL的執行順序' },
  { type: 'html', value: '<span class="mobile-notes-dropdown-heading">GoogleCloud 學程</span>' },
  { to: '/docs/GoogleCloud學程/intro', label: '【雲端運算基礎】課程導覽' },
  { to: '/docs/GoogleCloud學程/module', label: '【雲端運算基礎】什麼是 Cloud Computing 雲端運算' },
  { to: '/docs/GoogleCloud學程/module02', label: '【雲端運算基礎】從實體架構到雲端架構' },
  { to: '/docs/GoogleCloud學程/module03', label: '【雲端運算基礎】IaaS、PaaS、SaaS 與 Serverless' },
  { to: '/docs/GoogleCloud學程/module04', label: '【雲端運算基礎】Google Cloud 三層架構' },
  { to: '/docs/GoogleCloud學程/module05', label: '【雲端運算基礎】Region、Zone 與 Multi-region' },
  { to: '/docs/GoogleCloud學程/module06', label: '【雲端運算基礎】總結' },
  { to: '/docs/GoogleCloud學程/module01', label: '【雲端運算基礎】總結' },
  { type: 'html', value: '<span class="mobile-notes-dropdown-heading">JavaScript</span>' },
  { to: '/docs/JavaScript/status-code', label: '【HTTP】Status Code' },
  { to: '/docs/JavaScript/ajaxhistory', label: '【AJAX】AJAX非同步寫法的演進' },
  { to: '/docs/JavaScript/ajaxXhr copy', label: '【AJAX_ES5】使用(XHR)XMLHttpReques發送 Ajax Call' },
  { to: '/docs/JavaScript/promise', label: '【AJAX_ES6】Promise' },
  { to: '/docs/JavaScript/scope', label: '【Scope】JS三種Scope作用域' },
  { to: '/docs/JavaScript/scope-lexical', label: '【Scope】JS是語法作用域(Lexical scope)' },
  { to: '/docs/JavaScript/hoisting', label: '【Hoisting和TDZ】提升 和 暫時性死區' },
  { to: '/docs/JavaScript/hoisting-total', label: '【Hoisting】提升總結' },
  { to: '/docs/JavaScript/intro-arrays', label: '【JS觀念筆記_Array】陣列基礎 7 個核心觀念' },
  { to: '/docs/JavaScript/arrays-methods', label: '【JS觀念筆記_Array】陣列操作的基本方法' },
  { to: '/docs/JavaScript/intro-loop', label: '【JS觀念筆記_Loop】For Loop 6 個核心觀念' },
  { to: '/docs/JavaScript/loop-arrays', label: '【JS觀念筆記_Loop】使用 For Loop 遍歷 Array' },
  { to: '/docs/JavaScript/arr-review', label: '【JS觀念筆記】Array基礎與常用方法' },
  { to: '/docs/JavaScript/loop-review', label: '【JS 觀念筆記】for 迴圈與 Array 遍歷' },
  { to: '/docs/JavaScript/intro-object', label: '【JS觀念筆記_Object】物件取值：點記法與中括號記法' },
  { to: '/docs/JavaScript/object-method', label: '【JS觀念筆記_Object】物件方法與 this' },
  { to: '/docs/JavaScript/for-of', label: '【JS觀念筆記_Loop】for...of 與 Array entries' },
  { to: '/docs/JavaScript/arr-methods', label: '【JS觀念筆記_Array】擷取|修改|反轉|合併|轉字串' },
  { to: '/docs/JavaScript/arr-methods-foreach', label: '【JS觀念筆記_Array資料處理】forEach | 遍歷（Iteration）' },
  { to: '/docs/JavaScript/arr-method-map', label: '【JS觀念筆記_Array資料處理】map 與 filter | 轉換（Transformation）' },
  { to: '/docs/JavaScript/arr-method-filter', label: '【JS觀念筆記_Array資料處理】find、some 與 every | 搜尋（Searching）' },
  { to: '/docs/JavaScript/arr-method-reduce', label: '【JS觀念筆記_Array資料處理】reduce | 資料聚合（Aggregation）' },
  { to: '/docs/JavaScript/arr-method-sort', label: '【JS觀念筆記_Array資料處理】sort 與 toSorted | 排序' },
  { to: '/docs/JavaScript/arr-method-flat', label: '【JS觀念筆記_Array資料處理】flat 與 flatMap ｜ 展平巢狀資料' },
  { to: '/docs/JavaScript/arr-method-fill', label: '【JS觀念筆記_Array資料處理】Array.from 與 fill ｜建立初始資料' },
  { to: '/docs/JavaScript/arr-method-with', label: '【JS觀念筆記_Array資料處理】ES2023 不可變 Array 方法' },
  { to: '/docs/JavaScript/arr-method-total', label: '【JS觀念筆記_Array資料處理】資料處理方法總結' },
  { to: '/docs/JavaScript/deploy-your-site', label: 'Deploy your site' },
  { to: '/docs/JavaScript/js-02-fundamental', label: '【JS_核心】Call Stack and Memory Heap' },
  { to: '/docs/JavaScript/js-03-fundamental-gc', label: '【JS_核心】Garbage Collection/垃圾回收機制 與 Memory Leaks' },
  { to: '/docs/JavaScript/js-fundamental-I', label: 'JavaScript 基礎(上)' },
  { to: '/docs/JavaScript/js-fundamental-II', label: 'JavaScript 基礎(下)' },
  { to: '/docs/JavaScript/markdown-features', label: '【筆記_副標籤】筆記結構' },
  { type: 'html', value: '<span class="mobile-notes-dropdown-heading">Claude</span>' },
  { to: '/docs/claude/intro', label: '【Claude Code 101】Daily Workflow' },
];

const mobileNotesBaseUrl = '/dev-notes';

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const mobileNotesDropdownMenu = [
  {
    type: 'html',
    value: `<div class="mobile-notes-menu">${mobileNotesDropdownItems.reduce(
      (html, item) => {
        if (item.type === 'html') {
          const heading = item.value.match(/>([^<]+)</)?.[1] ?? '';
          const previousClosed = html.endsWith('</div></details>') || html === '';
          return `${html}${previousClosed ? '' : '</div></details>'}<details class="mobile-notes-topic"><summary class="mobile-notes-topic-trigger">${escapeHtml(heading)}</summary><div class="mobile-notes-topic-links">`;
        }

        const href = encodeURI(`${mobileNotesBaseUrl}${item.to}`);
        return `${html}<a class="mobile-notes-article-link" href="${href}">${escapeHtml(item.label)}</a>`;
      },
      '',
    )}</div></details></div>`,
  },
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  /**
   * 第一區：網站基本資訊與部署設定
   */
  title: "關於我", //網站標題（會出現在 <title>）
  tagline: "把技術筆記、作品脈絡與可 demo 專案整合成求職主站", //副標，出現在首頁
  favicon: "img/icon-tide-round.svg", // 網站小圖示 icon（建議 32x32）
  stylesheets: [
    "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,500&family=Noto+Serif+TC:wght@500&display=swap",
  ],

  // Set the production url of your site here
  url: "https://hsilan-sui.github.io", // 網站的網域（部署後的網址）
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  //url: 'https://your-docusaurus-site.example.com',  // 網站的網域（部署後的網址）
  baseUrl: "/dev-notes/", //子路徑（如 GitHub Pages 通常是 '/專案名/'）

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  //你部署在 GitHub Pages 的話，url 要設成 https://你的帳號.github.io，baseUrl 要設成 /你的 repo 名稱/
  organizationName: "hsilan-sui", // GitHub 使用者或組織名稱
  projectName: "dev-notes", //GitHub 專案名稱（會用來部署 GitHub Pages）
  deploymentBranch: "gh-pages",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  trailingSlash: false,
  /**
   * 第二區：功能與外掛設定
   */
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh-Hant",
    locales: ["zh-Hant"],
  },
  themes: ["@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },

  /**
   *  第三區：內容模組設定（Classic Preset）
   */

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js", //// 控制 Docs 左側導覽欄
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //// 顯示「編輯本頁」連結
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          routeBasePath: "my-tide",
          blogTitle: "意識潮 | My Tide",
          blogDescription: "詩、散文、旅行、生活與時間的潮汐片段",
          showReadingTime: true, // 顯示閱讀時間
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          // 可以自訂 CSS 樣式
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  /**
   * 第四區：網站外觀與 UI 設定
   */

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/me.png",
      navbar: {
        title: "關於我", //導覽列左上角標題
        logo: {
          alt: "Sui 意識潮 TIDE",
          src: "img/icon-tide-round.svg", // Logo 圖檔
          width: 56,
          height: 46,
        },
        items: [
          //導覽列按鈕
          { to: '/docs/claude/intro', label: 'PLAYBOOK', position: 'left' },
          {
            type: 'dropdown',
            label: '筆記分類',
            position: 'left',
            className: 'mobile-notes-dropdown',
            items: mobileNotesDropdownMenu,
          },
          // 意識潮尚未寫夠內容，先隱藏這個導覽列連結，準備好之後把下面這行取消註解即可
          // { to: '/my-tide', label: '意識潮 | My Tide', position: 'left' },
          {
            href: "https://github.com/hsilan-sui",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        // Link columns hidden for now; re-add when ready to show them again.
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} Sui Hsilan. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        showLineNumbers: true, //開啟行號
      },
    }),
};

export default config;
