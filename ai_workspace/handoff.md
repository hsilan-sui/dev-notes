# 意識潮 My Tide — 交接文件

> 最後更新：2026-10-18（Claude Code）
> 給下一位接手的人或 AI Agent（Claude Code、Codex）。開始前先讀 `AGENTS.md` 和 `ai_workspace/my-tide-project-context.md`。
> 每一輪的完整對話紀錄在 Obsidian：`/Users/suihsilan/dev_note_obsidian/04-Projects/意識潮 My Tide/`。

## 1. 現在的狀態（一句話）

意識潮已正式上線：https://hsilan-sui.github.io/dev-notes/my-tide 。BB Call 的無名訊號（含語氣）和右下角的計數器都存在 Cloudflare Workers + D1；訊號光年是噗浪式的時間河，BB Call 有六種介面語言。

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
    ├─ SignalLangProvider（signalI18n.js）：BB Call 的顯示語言，整頁共用
    ├─ SiteBroadcast：頁面最上方的「站內廣播」，點開是站主的全文（siteStatement.js，中／英）
    ├─ JournalHero：JournalMark、送給『今天』的歌（TodaySong，YouTube 小電視）、日期、時間之河（WaveTimeline）
    │    └─ SignalRiver：語言下拉、兩台 BB Call（過去岸 MT01 / 今天岸 MT02）＋ 訊號光年（SignalLightYears）
    │         └─ fetch → Cloudflare Worker → D1
    ├─ JournalContentArea：故事卡（StoryCard）→ 閱讀層（ImmerseReader）／專屬閱讀頁（src/components/MyTide/*）
    └─ SiteCounter：右下角的無名小站式計數器（POST /api/counter）

backend/
  signal-worker/   ← 正式使用中：Cloudflare Workers + D1（免費）
  MyTide.Api/      ← 同一套 API 的 ASP.NET Core + SQLite 版，保留給之後自架主機（GCP／VPS）
```

兩個後端的端點、請求與回應格式完全相同（詳見 `backend/MyTide.Api/README.md`）：

- `GET /api/health`
- `GET /api/signals`：最近 100 則原始訊號（由舊到新），每則附回應
- `POST /api/signals`：`{text, from: "past"|"today", tone?, id?, threadId?, deleteKey?}`；201 新增、200 重送、400 驗證失敗、409 id 衝突、429 寫太快。`tone` 是語氣（預設「說」，最多 5 個字，不能有空白、角括號、網址），回傳的每則訊號都帶 `tone`
- `POST /api/counter`（只有 Worker 版）：`{session, visit?, view?}` → `{online, visits:{today,total}, views:{today,total}}`。`session` 是每個分頁一個隨機 id（不存 IP）；90 秒內有回報才算在線；日期以台北時間計。表：`site_counts`、`presence`（migration 0003）
- `DELETE /api/signals/{id}`：站主刪除（連同回應），需 `Authorization: Bearer <ADMIN_TOKEN>`

規則：每則最多 40 字（以使用者看到的字計，前端也用 `Intl.Segmenter` 同樣計算，所以泰文、國旗 emoji 不會被提早截斷）、回應只能接在原始訊號上（一句、一回）、每位訪客每分鐘最多寫 10 次、清除控制字元與雙向覆寫字元。

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
| 〈一本本無法被翻開的書〉／失落文字博物館 | 2026-10-25 新增（Codex） | `blog/2026-10-25-lost-words/index.mdx`，首頁維持文字卡片與「繼續閱讀」，閱讀時間指定 3 分鐘，摘要以「想像你手上有一本書，卻無法翻開任何一頁。」開頭，保留分行與中段縮排（卡片文案於 2026-10-25 更新，末句「不打開書，也能讀懂嗎？」）；`readingUrl` 連至 `static/失落文字博物館/index.html` 的獨立互動展覽（Claude 製作）。展覽圖片路徑兼容有／無尾端斜線，返回按鈕連回意識潮。 |
| 送給『今天』的歌 | 上線 | `TodaySong.jsx`、`todaySongs.js`（依日期收錄站主選曲，用 YouTube 嵌入；「歌單 ▾」在播放條前面；2026-10-26 改為頁面內可捲動清單（最高 220px／40vh、13px 歌曲文字、44px 點選高度，支援選曲後直接開啟播放並收起、點外側與 Escape 關閉；Safari 使用 focusin 判定焦點移出，避免失焦時提早關閉而吃掉點歌事件），Chrome 與 WebKit 七種寬度驗證通過。目前：10/26〈全世界失眠〉Eason（站主指定的 Kou 頻道影片 E6A_cwM7PWY，已確認上線）、10/25〈diminished〉Enno、10/23〈光〉陳粒（站主指定影片 w87JelvIevo）、10/21〈應該〉楊乃文（官方 Topic 音源）、10/18〈快高長大〉及〈再見莫妮卡〉彭席彥 / Franky弗蘭奇（站主指定的 Dreamer Music 歌詞影片）、10/17〈五月之戀〉Enno 宅錄 demo。同一天可有多首，預設選取當天或之前最新日期的第一首；10/26 起為〈全世界失眠〉（已確認上線，歌曲提交 9c2c5e2）。打開任何文章或影片時，歌會停止、YouTube 視窗會關閉） |
| YouTube 播放器 | 上線 | `TodaySong.jsx`：1180px 以下（平板、手機）在播放條正下方「嵌入」頁面、不浮動；1180px 以上是角落小電視（可拖曳，位置存在 localStorage `mytide.tv.corner`），會自動換到不蓋住 BB Call／語言選單／站內廣播的角落，z-index 1250 壓在面板上面。**沒有縮小功能、不用 CSS 藏 iframe**（YouTube 規定播放中必須看得見、至少 200×200） |
| BB Call 兩岸、紅點傳送、回訊提示 | 上線，**訊號已保存在 D1** | `SignalRiver.jsx`、`SignalPager.jsx`：260px（窄平板 0.82、手機 0.66，用 CSS `zoom`；寫訊號的 sheet 不縮放）、兩行點陣螢幕（DotGothic16）、◀ ▶ 翻閱記憶、待機時每 40～90 秒隨機「回音」重播最後收到的訊息、收到時輕微震動（Android 實際震動）、表情符號 120 個 |
| 回覆的對應 | 上線 | 每台 BB Call 的 ◀ ▶ 記憶只放「對岸傳來的」訊息，所以讀了再回，一定回到對岸；訊號光年的回覆由 `replyBankFor` 決定（串裡最後一個聲音的對岸）。桌機在訊號光年按「回一句」時，回覆的那台會浮到面板前（`data-floating`），送出後回覆直接出現在串裡 |
| 網址安全檢查 | 上線 | Worker `checkLinks`：https、真實網域、非 IP、非 punycode、經 Cloudflare 防惡意 DNS（security.cloudflare-dns.com）查詢不被擋 → 安全，可點＋✅；否則純文字＋⚠️。網址算 10 個字、整則上限 400 字、最多 3 個網址（migration 0004 `links` 欄位；舊訊息載入時補查一次）。前端 `SignalText.jsx`。.NET 版尚未實作 |
| 語氣標籤 | 上線 | 預設說／想／覺得／希望／問，讀者可自訂（最多 5 字，存在自己的 localStorage `mytide.signal.tones`）；顏色在 `SignalPager.module.css` 與 `SignalLightYears.jsx` |
| BB Call 語言 | 上線 | `signalI18n.js`：中文（預設）、English、日本語、한국어、Español、Tiếng Việt；選擇存在 sessionStorage，只在這次瀏覽有效。訊息內容不翻譯。桌機鍵盤跟著換：注音／假名／兩班式韓文／英文（西文多 ñ） |
| 站內廣播 | 上線 | `SiteBroadcast.jsx`、`siteStatement.js`（跑馬燈＋點「站內廣播」或 more » 看全文，有中英切換） |
| 計數器 | 上線，記在 D1 | `SiteCounter.jsx`（在線／造訪／瀏覽，今日與累計）。2026-10-18 部署時從 0 開始 |
| 網站圖示與分享預覽 | 上線 | 分頁小圖示是 `static/img/icon-tide-round.svg`（站主設計的意識潮圖示）；Safari／iOS／Android 用由它產生的 PNG（`favicon-32.png`、`icon-tide-192/512.png`、`apple-touch-icon.png`，在 `docusaurus.config.js` 的 `headTags`）。分享預覽圖是 `mytide-card.png`，不用站主照片 |
| 文章卡片 | 上線 | 霧灰藍紙（tokens `--journal-card-*`）、仙人掌明體（`--journal-font-article`），手機內距縮小；左右「回到過去／未來之來」未動 |
| 三分鐘內收回自己的訊號 | 上線 | `SignalDeleteButton.jsx`、`signalRiver.js`。放出時產生一次性金鑰存在 localStorage（`mytide.signal.own`），伺服器只存 SHA-256（`delete_key_hash`，migration 0002）；`DELETE` 帶 `X-Delete-Key` |
| 手機閱讀 | 上線 | 波浪 `touch-action: pan-x pan-y`（之前 `pan-x` 擋住往下滑）、「往下讀」按鈕（往下之後變成「往上 BB Call 留言」）、文章卡片左右邊緣的前一天／下一天箭頭 |
| 訊號光年（噗浪感） | 上線 | `SignalLightYears.jsx`、`signalSky.js`、`Starfield.jsx`：桌機／平板是橫向時間河（卡片在原地展開、回應多時卡片內捲動），手機是由新到舊的列表；背景依每則訊息的時刻上色（玫瑰色清晨→7:30 起藍天＋飄動的白雲→琥珀黃昏→深藍星空）；星星用 canvas 畫，各自閃爍，偶爾有流星（減少動態時靜止）；未讀是紅框（第一次造訪不標）；「無名」；「出自」接在句尾 |

設計稿：
- 今天的正式版面與草圖在 Claude 畫布 https://claude.ai/artifact/L1wczcE7izmXxGBVdeUFp8 （頁面「正式版面」「元件」「草圖與討論」）。
- 較早的稿在 `design/component.pen`（v2～v7），只能透過 Pencil MCP 讀寫。「訊號摺子 v7」已由噗浪感的訊號光年取代。

## 6. 已知問題與技術債

- **展品操作位置（2026-10-25）**：火山模型的上一刻／下一刻／播放放在模型正上方；「看看今天的現場」仍在下方。模型全程固定側面視角，不再隨階段切換鏡頭或拖曳旋轉；深度標示為「掩埋深度約 20 公尺」。製紙第 3 步的「切成直條／剝成薄片」持續顯示在工作台內，上方有「？」可展開操作及兩種切法的說明；切換切法會重置本步切條進度，選薄片時動作按鈕顯示「剝下一片」。測試腳本 `scripts/check-exhibit-controls.cjs`。

- **Step 8 微調（2026-10-25）**：`static/失落文字博物館/papyrus-finale.js` 與 `papyrus-finale.css` 是獨立展覽最後一步的可編輯來源，由 HTML 載入，沿用其 React、SVG 筆跡與設計 tokens。新增書寫完成、收捲／展開與完成書寫後的提示；原 Step 1–7 未改。狀態為 ready／writing／written／rolling／rolled／unrolling，筆跡只在 Erase 或 Make another 時清除。Through Time 暫沿用既有 `workshop.closing`，因需求貼文的 B「Ink & Fiber」、C 文案與部分狀態條款缺漏，待補。驗收腳本 `scripts/check-papyrus-finale.cjs` 需外部 playwright-core；此 Mac 使用 1.55.1 與 webkit-2203。Chrome 的既有隱藏輔助表格會撐大展覽 scrollWidth，但 Step 8 與展覽可見元素在指定七種寬度沒有溢出。

1. **列表頁只拿得到截斷版 MDX**：〈大爆炸〉靠把 `<!-- truncate -->` 放在全文最後繞過。長期需要讓時間軸取得全文的正式管道。
2. **YouTube 嵌入的限制**：播放中的播放器必須看得見、至少 200×200，不能被蓋住或調成透明。閱讀時會自動暫停、讓閱讀層蓋住，回來再繼續播。如果要「看不到影片、只有聲音」，必須改用有授權的音檔（`todaySongs.js` 的 `src`）。
3. **Safari／iOS**：還沒用 iPhone 實機測過。曾經發生過的問題：半徑 0 的 radial-gradient mask（`transparent -6px, #000 0px`）在 WebKit 會被畫成全透明，導致「你我都來自星塵」在 iPhone 上完全看不到（`042e003` 已修）。本機可以用 WebKit 測：這台 Mac 是 macOS 14，Playwright 1.62 的 WebKit 跑不起來，要用 `playwright-core@1.55.1`，搭配已安裝的 `webkit-2203`。
4. **匿名內容的管理**：目前只有站主手動刪除，沒有自動審核或檢舉功能。
5. **動態 emoji** 還沒做：決定只用 Google Noto Animated Emoji（CC BY 4.0），下載圖檔前要先徵得站主同意並標註出處。
6. **多個 Agent 同時改檔**：之前 Claude Code 與 Codex 同時修改同一批檔案，差點互相覆蓋。請一次只讓一個 Agent 負責一個區塊，交接時更新本文件。
7. **頁面容器用 `overflow-x: clip`**（`JournalPage.module.css`），不要改回 `hidden`：`hidden` 會讓 main 變成自己的捲動框，多一條捲軸並吃掉滑鼠滾輪。
8. **手機表單元件字級至少 16px**（寫訊號的輸入框、自訂語氣、語言選單；歌單已改為按鈕清單，不受輸入欄位縮放限制）：小於 16px 時 iOS Safari 會放大整頁，讀者就得左右滑。
9. **BB Call 在手機的縮放比例**（`SignalPager.module.css`，用 `zoom`）：390–596px 0.66、360–389px 0.6、359px 以下 0.52，確保兩台並排不重疊。寫訊號的 sheet 不縮放：浮在可見畫面上方、寬度 ≤ 340px；鍵盤打開或正在輸入自訂語氣時進入精簡模式（`data-compact`）。
10. **RWD 守則寫在 `CLAUDE.md`**：改版面後要在 320／375／390／834／1080／1280／1440px 檢查，Chrome 和 WebKit 都要。
11. **計數器沒有擋機器人**：爬蟲也會被算進瀏覽人次（每個 IP 每分鐘最多 20 次）。

## 7. 下一步建議

- **站主授權（2026-10-21）**：往後新增「送給今天的歌」，完成歌曲資料與建置檢查後直接提交、推送 main 並確認部署，無須另問是否上線。
- 用 iPhone Safari 實機走一遍：首頁、BB Call 寫訊號（原生鍵盤）、〈大爆炸〉閱讀與返回。
- 用 iPhone 實機看：BB Call 縮小（`zoom`）、寫訊號 sheet、YouTube 底部播放列、訊號光年列表的星空。
- 外國朋友看看各語言的用詞（`signalI18n.js`），以及站內廣播英文版（`siteStatement.js`）。
- 和站主討論 BB Call 跑馬燈的進一步優化（站主提過想再改，但還沒說方向）。
- 新增每日一首歌：在 `todaySongs.js` 加一筆 `{date, title, artist, youtubeId}`，影片要來自官方頻道（用 `https://www.youtube.com/oembed?url=…` 確認 author）。
- 視流量決定是否需要移到自架主機：`backend/MyTide.Api` 和 Dockerfile 已經準備好；改用 GCP 時，要先設 NT$300 的預算提醒（提醒只會通知、不會自動停止扣款）。

- **歌單點歌修正（2026-10-26）**：點選任一首會開啟對應 YouTube 播放器，重選同首會送出 playVideo。`scripts/check-song-picker.cjs` 以 Chrome／WebKit 觸控驗證七種寬度、歌曲 ID 切換、同首續播指令及捲動；測試替換第三方 iframe，不代表實際音訊輸出驗證。

- **YouTube 播放退路（2026-10-26）**：實際嵌入測試時，站主指定的〈全世界失眠〉回覆「無法播放這部影片」；保留指定影片，不更換版本。播放器下方提供「在 YouTube 聽這首歌」直接連結；iframe 標題改稱 YouTube 播放器，不將非官方上傳標為官方音源。
