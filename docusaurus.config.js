// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  /**
   * 第一區：網站基本資訊與部署設定
   */
  title: "Sui｜Backend × Automation × AI", //網站標題（會出現在 <title>）
  tagline: "把技術筆記、作品脈絡與可 demo 專案整合成求職主站", //副標，出現在首頁
  favicon: "img/favicon.ico", // 網站小圖示 icon（建議 32x32）

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
        title: "Sui Works", //導覽列左上角標題
        logo: {
          alt: "Sui Works",
          src: "img/logo.png", // Logo 圖檔
        },
        items: [
          //導覽列按鈕
          {
            to: '/docs/job-hunt-portfolio',
            label: '求職入口',
            position: 'left',
          },
          {
            to: '/docs/LINEOA-PORFOLIO/overview',
            label: '代表專案',
            position: 'left',
          },
          { to: '/docs/intro', label: '技術筆記', position: 'left' },
          {
            href: "https://github.com/hsilan-sui/sui-dev-notes",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Portfolio",
            items: [
              {
                label: "求職入口",
                to: "/docs/job-hunt-portfolio",
              },
              {
                label: "LINE OA 互動作品集",
                to: "/docs/LINEOA-PORFOLIO/overview",
              },
            ],
          },
          {
            title: "Notes",
            items: [
              {
                label: "筆記總覽",
                to: "/docs/intro",
              },
              {
                label: "AI 客服微服務",
                to: "/docs/backend/ai-chat-service",
              },
            ],
          },
          {
            title: "Contact",
            items: [
              {
                label: "GitHub Repository",
                href: "https://github.com/hsilan-sui/sui-dev-notes",
              },
              {
                label: "LINE OA",
                href: "https://line.me/R/ti/p/@998enzsc",
              },
            ],
          },
        ],
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
