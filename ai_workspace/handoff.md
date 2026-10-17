# 意識潮 My Tide — 交接文件

> 最後更新：2026-10-18（Claude Code）
> 給下一位接手的人或 AI Agent（Claude Code、Codex）。開始前先讀 `AGENTS.md` 和 `ai_workspace/my-tide-project-context.md`。
> 每一輪的完整對話紀錄在 Obsidian：`/Users/suihsilan/dev_note_obsidian/04-Projects/意識潮 My Tide/`。

## 1. 現在的狀態（一句話）

意識潮已正式上線：https://hsilan-sui.github.io/dev-notes/my-tide 。BB Call 的匿名訊號已經接上 Cloudflare Workers + D1，會永久保存（像 Plurk 一樣），重新整理或其他訪客都看得到。

## 2. 線上服務

| 服務 | 位置 | 說明 |
|---|---|---|
| 網站 | GitHub Pages `hsilan-sui/dev-notes`，`main` 推送後由 `.github/workflows/deploy.yml` 自動部署 | 靜態 Docusaurus，`baseUrl` 為 `/dev-notes/` |
| 訊號 API | https://mytide-signal-api.yufangcheng1101.workers.dev | Cloudflare Workers，原始碼 `backend/signal-worker/` |
| 資料庫 | Cloudflare D1 `mytide-signals`（id `7305ef77-74f5-4a9f-9819-9a1b470f2cac`，APAC） | SQLite，表結構 `backend/signal-worker/migrations/` |
| 網站連 API | GitHub Actions 變數 `MYTIDE_SIGNAL_API_URL` | 建置時寫進 `docusaurus.config.js` 的 `customFields.signalApiBaseUrl` |

**帳號與憑證（不在 Git 裡）**

- Cloudflare 帳號：站主本人的 email；CLI 用 `npx wrangler login` 登入（OAuth）。
- 管理用 `ADMIN_TOKEN`：Worker secret；本機副本在 `~/.config/mytide/admin-token`（權限 600）。不要貼到對話或提交到 Git。
- 費用：Cloudflare Workers Free 方案，未綁卡；超過額度只會讓請求失敗，不會收費。

## 3. 架構

```
GitHub Pages（Docusaurus 靜態站）
  /my-tide → src/theme/BlogListPage → src/components/Journal/JournalPage
    ├─ JournalHero：JournalMark、送給『今天』的歌（TodaySong）、日期、時間之河（WaveTimeline）
    │    └─ SignalRiver：兩台 BB Call（過去岸 MT01 / 今天岸 MT02）＋ 訊號光年（SignalLightYears）
    │         └─ fetch → Cloudflare Worker → D1
    └─ JournalContentArea：故事卡（StoryCard）→ 閱讀層（ImmerseReader）／專屬閱讀頁（src/components/MyTide/*）

backend/
  signal-worker/   ← 正式使用中：Cloudflare Workers + D1（免費）
  MyTide.Api/      ← 同一套 API 的 ASP.NET Core + SQLite 版，保留給之後自架主機（GCP／VPS）
```

兩個後端的端點、請求與回應格式完全相同（詳見 `backend/MyTide.Api/README.md`）：

- `GET /api/health`
- `GET /api/signals`：最近 100 則原始訊號（由舊到新），每則附回應
- `POST /api/signals`：`{text, from: "past"|"today", id?, threadId?}`；201 新增、200 重送、400 驗證失敗、409 id 衝突、429 寫太快
- `DELETE /api/signals/{id}`：站主刪除（連同回應），需 `Authorization: Bearer <ADMIN_TOKEN>`

規則：每則最多 40 字（以使用者看到的字計）、回應只能接在原始訊號上（一句、一回）、每位訪客每分鐘最多寫 10 次、清除控制字元與雙向覆寫字元。

前端行為：

- 有 API：開機後載入，每 12 秒輪詢，回到分頁時也會更新。
- 沒設定 API（例如本機 build 沒給變數）：照常可以寫、可以傳，但頁面寫「訊號只留在這次造訪」。
- 有設定但連不上：保留輸入內容，顯示「訊號暫時送不出去」。

## 4. 常用操作

```sh
# 本機開發
npm run dev                                   # 網站 http://localhost:3003/dev-notes/
cd backend/signal-worker && npm run dev       # Worker http://localhost:8787（本機 D1）

# 部署 API（改了 backend/signal-worker 之後）
cd backend/signal-worker && npx wrangler deploy
npx wrangler d1 migrations apply mytide-signals --remote   # 有新的 migration 時

# 刪除一則不當訊號
curl -X DELETE https://mytide-signal-api.yufangcheng1101.workers.dev/api/signals/<id> \
  -H "Authorization: Bearer $(cat ~/.config/mytide/admin-token)"

# 備份資料庫
cd backend/signal-worker && npx wrangler d1 export mytide-signals --remote --output backup.sql

# 發布網站：推送 main 即可
```

## 5. 作品與功能一覽

| 功能 | 狀態 | 主要檔案／規格 |
|---|---|---|
| 時間之河首頁 | 上線 | `JournalPage`、`WaveTimeline`、`specs/journal-0*.md` |
| 〈大爆炸〉Hover to Immerse | 上線 | `ImmerseReader`、`specs/journal-03-interaction-spec.md` §8 |
| 越讀越深（依閱讀進度變深） | 上線 | `readingDepth.js`、tokens `--journal-deep-*` |
| 返回大爆炸 | 上線（Codex 改成 `CosmicReturn`） | `CosmicReturn.jsx` |
| 〈一個週五下班的日常〉、熊貓騎士 | 上線（Codex） | `src/components/MyTide/*`、`specs/journal-friday-film-*`、`journal-panda-rider-*` |
| 送給『今天』的歌 | 上線 | `TodaySong.jsx`、`todaySongs.js`（每天一首，用官方 YouTube 嵌入；「歌單 ▾」可選其他天的歌。目前：10/18〈快高長大〉、10/17〈五月之戀〉Enno 宅錄 demo；手機上「歌單 ▾」在播放條旁邊。打開任何文章或影片時，歌會停止、YouTube 視窗會關閉） |
| BB Call 兩岸、紅點傳送、回訊提示 | 上線，**訊號已保存在 D1** | `SignalRiver.jsx`、`SignalPager.jsx`（表情符號 80 個，鍵盤一次顯示 4 排、可捲動） |
| 三分鐘內收回自己的訊號 | 上線 | `SignalDeleteButton.jsx`、`signalRiver.js`。放出時產生一次性金鑰存在 localStorage（`mytide.signal.own`），伺服器只存 SHA-256（`delete_key_hash`，migration 0002）；`DELETE` 帶 `X-Delete-Key` |
| 手機閱讀 | 上線 | 波浪 `touch-action: pan-x pan-y`（之前 `pan-x` 擋住往下滑）、「往下讀」按鈕（往下之後變成「往上 BB Call 留言」）、文章卡片左右邊緣的前一天／下一天箭頭 |
| 訊號光年（訊號時間線） | 上線（Codex） | `SignalLightYears.jsx`、`specs/journal-signal-lightyears.md` |
| 訊號摺子（奏摺式 Plurk 時間線） | **只有 Pencil 設計稿（v7），未實作** | `design/component.pen` v7 |

設計稿都在 `design/component.pen`（v2～v7），只能透過 Pencil MCP 讀寫。

## 6. 已知問題與技術債

1. **列表頁只拿得到截斷版 MDX**：〈大爆炸〉靠把 `<!-- truncate -->` 放在全文最後繞過。長期需要讓時間軸取得全文的正式管道。
2. **YouTube 嵌入的限制**：播放中的播放器必須看得見、至少 200×200，不能被蓋住或調成透明。閱讀時會自動暫停、讓閱讀層蓋住，回來再繼續播。如果要「看不到影片、只有聲音」，必須改用有授權的音檔（`todaySongs.js` 的 `src`）。
3. **Safari／iOS**：還沒用 iPhone 實機測過。曾經發生過的問題：半徑 0 的 radial-gradient mask（`transparent -6px, #000 0px`）在 WebKit 會被畫成全透明，導致「你我都來自星塵」在 iPhone 上完全看不到（`042e003` 已修）。本機可以用 WebKit 測：這台 Mac 是 macOS 14，Playwright 1.62 的 WebKit 跑不起來，要用 `playwright-core@1.55.1`，搭配已安裝的 `webkit-2203`。
4. **匿名內容的管理**：目前只有站主手動刪除，沒有自動審核或檢舉功能。
5. **訊號摺子 v7** 尚未實作；Codex 做的是「訊號光年」，兩者概念相近，實作前要先決定要合併還是取代。
6. **多個 Agent 同時改檔**：之前 Claude Code 與 Codex 同時修改同一批檔案，差點互相覆蓋。請一次只讓一個 Agent 負責一個區塊，交接時更新本文件。

## 7. 下一步建議

- 用 iPhone Safari 實機走一遍：首頁、BB Call 寫訊號（原生鍵盤）、〈大爆炸〉閱讀與返回。
- 決定「訊號摺子」和「訊號光年」的關係，再實作。
- 新增每日一首歌：在 `todaySongs.js` 加一筆 `{date, title, artist, youtubeId}`，影片要來自官方頻道（用 `https://www.youtube.com/oembed?url=…` 確認 author）。
- 視流量決定是否需要移到自架主機：`backend/MyTide.Api` 和 Dockerfile 已經準備好；改用 GCP 時，要先設 NT$300 的預算提醒（提醒只會通知、不會自動停止扣款）。
