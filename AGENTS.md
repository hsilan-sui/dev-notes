# AGENTS.md

給 AI Coding Agents（Codex CLI、Claude Code 等）的專案指引。

## 這個 Repository 是什麼

一個 Docusaurus 3 網站，部署在 GitHub Pages，`baseUrl` 是 `/dev-notes/`。裡面有三塊內容：

| 區塊 | 路由 | 來源 |
|---|---|---|
| 作品集首頁 | `/dev-notes/` | `src/pages/index.js` → `src/components/PortfolioHome/` |
| 技術筆記 | `/dev-notes/docs/...` | `docs/` |
| **意識潮 My Tide** | `/dev-notes/my-tide` | `blog/`（Docusaurus blog plugin，`routeBasePath: "my-tide"`） |

**意識潮**是一件持續生長的數位互動文學作品，不是一般的部落格。
修改意識潮相關程式碼之前，先讀過 `ai_workspace/my-tide-project-context.md`。

## 指令

```bash
npm run dev     # 開發伺服器 → http://localhost:3003/dev-notes/
npm run build   # 正式版建置，輸出到 build/
npm run serve   # 預覽 build/ 的結果
```

推送到 `main` 之後，`.github/workflows/deploy.yml` 會自動建置並部署到 `gh-pages`。

## 意識潮目前的實作

- `src/theme/BlogListPage/index.js`：swizzle 過的 blog 列表頁，改為渲染 `JournalPage`
- `src/components/Journal/`：時間軸的 UI
  - `JournalPage.jsx`：管理狀態（目前是哪一天、當天第幾篇、是否展開）
  - `JournalHero.jsx`：包含 `JournalMark`（MY 意識 / 潮 TIDE 標誌）、`JournalNumeral`（大號日期）、`WaveTimeline`（波浪時間軸）
  - `JournalContentArea.jsx`、`StoryCard.jsx`、`NavButton.jsx`：中央卡片，以及前一天 / 下一天、同一天上一篇 / 下一篇的切換
  - `useJournalTimeline.js`、`waveMath.js`：把 blog items 整理成以日期為單位的時間軸資料
  - `tokens.css`：設計 tokens，全部放在 `.journal-scope` 底下
- 內容來源：`blog/` 裡的 Markdown / MDX 檔，目前大多還是 Docusaurus 範例文章
- 規格文件：`specs/journal-*.md`（PRD、UI、互動、動態、無障礙、元件、tokens 等）
- 設計稿：`design/*.pen`（Pencil 檔案，只能透過 Pencil MCP 讀寫，不要直接讀檔）

意識潮的導覽列連結在 `docusaurus.config.js` 中被註解掉了，這是刻意的，因為內容還不夠。

## 協作原則

背景文件的第 6 節（Architecture Principles）和第 8 節（Collaboration Guidelines）是完整版，以下是重點。

- **先理解再動手**：先讀背景文件和既有程式碼，分清楚哪些已經實作、哪些還只是規劃。目前已有的後端只有 `backend/MyTide.Api`：BB Call 匿名訊號用的 ASP.NET Core minimal API + SQLite（架構與部署見該資料夾的 README）。背景文件提到的 SQL Server、`MyTide.Web` 與更完整的 API 仍是**目標架構**，還沒有實作。
- **不要過度設計**：不要因為這是互動文學，就主動引入 Three.js、狀態機、microservices 或複雜的抽象。Narrative Runtime 列出的技術（p5.js、Three.js、Web Audio 等）都只是候選，要依作品需求來選，Three.js 不是必要依賴。
- **保留創作意圖**：不要把意識潮改成 dashboard、一般社群 feed 或標準部落格首頁，也不要要求每篇作品都套用同一種閱讀模板。互動要為敘事服務。
- **區分決策與構想**：分清楚哪些是已確立的決策、哪些是候選技術、哪些是還在構思的創作概念（例如潮記、潮語、浮光、留聲、潮境都還是暫定的名稱）。
- **不實作推測性功能**：沒有被明確指定要開發的功能，只能當作討論背景，不得直接實作。
- **說明技術決策**：涉及架構調整時，要說明 Do what（要完成什麼）、How to do（打算怎麼做）、Why（為什麼採用這個方案）。
- **保留既有成果**：創作需求優先於技術選型。不要隨意重寫既有的網站和作品；要繼續用 Docusaurus，還是改用 Vite 或 Next.js，目前還沒決定，不要自行更換框架。
- **可以迷路，但要能返回**：讀者可以在意義上迷路，但在操作上一定要能返回。任何新的互動都要保留清楚的退路，例如現有的「折返」和「返回意識潮」。
- **沿用既有風格**：顏色、間距、動態一律使用 `tokens.css` 裡的變數；CSS 用 CSS Modules；顯示給讀者的文字用繁體中文。
- **尊重 reduced motion**：任何動畫都要處理 `prefers-reduced-motion`，可以參考 `JournalMark.jsx` 的做法。
