# My Tide Signal API

BB Call（收訊）的匿名訊號後端：ASP.NET Core minimal API + SQLite。網站本身仍是 GitHub Pages 上的靜態 Docusaurus；這個 API 另外部署在一台有永久磁碟的主機上。

## 架構

```
瀏覽器（GitHub Pages 靜態網站）
  └─ src/components/Journal/SignalRiver.jsx
       ├─ GET  /api/signals   開機後載入、每 12 秒與回到分頁時輪詢
       └─ POST /api/signals   放出一則訊號或回一句
            │  (CORS: AllowedOrigins)
            ▼
MyTide.Api（本專案）
  Program.cs                設定、CORS、轉送標頭、每位訪客的寫入限流
  Signals/
    SignalContracts.cs      請求／回應的資料形狀
    SignalValidator.cs      驗證與清理（40 字、去除控制字元與雙向覆寫字元）
    SignalStore.cs          所有 SQLite 存取（建表、讀最近的串、寫入、刪除）
    SignalEndpoints.cs      HTTP 端點
            │
            ▼
SQLite：$DataDirectory/mytide-signals.db（WAL 模式）
```

前端在建置時從 `MYTIDE_SIGNAL_API_URL` 讀到 API 位址（`docusaurus.config.js` 的 `customFields.signalApiBaseUrl`）。

- **沒有設定 API**（例如現在的正式站）：BB Call 照常可以寫、放出、在兩岸之間傳遞，但只留在這次造訪；頁面明確寫「訊號只留在這次造訪，重新整理後不會保存」。
- **有設定但連不上**：放出失敗時保留輸入內容，顯示「訊號暫時送不出去」，不會假裝已送出。
- **連上**：訊號存進 SQLite，重新整理或其他訪客都看得到。

## 資料模型

一張 `signals` 表。原始訊號 `thread_id` 為 NULL；回應的 `thread_id` 指向原始訊號。回應只能接在原始訊號上（一句、一回，不巢狀）。

| 欄位 | 說明 |
|---|---|
| `id` | 32 個小寫十六進位字元（GUID "N" 格式），可由前端產生，讓重送不會重複存 |
| `thread_id` | 回應所屬的原始訊號，或 NULL |
| `text` | 清理後的訊號，最多 40 個字（以使用者看到的字計，emoji 組合算一個） |
| `from_bank` | `past`（MT01）或 `today`（MT02） |
| `created_at` | 伺服器寫入時間，Unix 毫秒 |
| `departed`, `source_title`, `source_day_key` | 保留給作者文章句子等來源資訊 |

## 端點

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/api/health` | 資料庫可讀時回 `{"status":"ok"}`，否則 503 |
| GET | `/api/signals` | 最近 100 則原始訊號（由舊到新），每則附上全部回應 |
| POST | `/api/signals` | 寫入訊號或回應，見下表 |
| DELETE | `/api/signals/{id}` | 站主刪除訊號（連同回應）。需 `Authorization: Bearer <AdminToken>`；沒設定 `AdminToken` 時此端點不存在 |

POST 本文：`{"text": "...", "from": "past" | "today", "id"?: "<32 hex>", "threadId"?: "<32 hex>"}`

| 回應 | 情況 |
|---|---|
| 201 `{id, createdAt}` | 新寫入 |
| 200 `{id, createdAt}` | 同一個 `id`、同樣內容的重送，已經存過 |
| 400 `{error}` | 驗證失敗、找不到要回的訊號、想回覆一則回應 |
| 409 `{error}` | `id` 已被另一則內容不同的訊號使用 |
| 429 | 同一位訪客一分鐘超過 10 次寫入 |

## 設定

| 設定 | 預設 | 說明 |
|---|---|---|
| `DataDirectory` | `<專案>/data` | SQLite 所在目錄；正式環境必須是永久磁碟 |
| `AllowedOrigins` | `https://hsilan-sui.github.io,http://localhost:3003,http://127.0.0.1:3003` | 允許呼叫 API 的網站來源，逗號分隔 |
| `AdminToken` | （無） | 設定後才開放刪除端點；請用長的隨機字串，不要放進 Git |

## 安全與營運

- **限流**：寫入以訪客 IP 分區，每人每分鐘 10 次；一個人洗版不會讓其他人送不出去。
- **轉送標頭**：API 信任 `X-Forwarded-For`，因為主機通常在 TLS proxy 後面。若 API 直接暴露在網路上（沒有 proxy），訪客可以偽造這個標頭繞過限流，請改成只信任主機 proxy 的位址。
- **內容**：去除控制字元、換行和雙向覆寫字元（例如 U+202E，會讓文字反過來顯示）。前端用 React 顯示純文字，不會執行 HTML。
- **管理**：匿名內容難免有不當訊息，用 `DELETE /api/signals/{id}` 移除。
- **備份**：SQLite 是單一檔案（加上 `-wal`、`-shm`）。定期複製 `DataDirectory`，或使用主機的磁碟快照。

## 本機執行

```sh
dotnet run --project backend/MyTide.Api   # http://localhost:5080
npm run dev                               # 開發模式自動連到 http://localhost:5080
```

資料寫在 `backend/MyTide.Api/data/`（已加入 .gitignore）。

## 部署

需要一台能常駐執行容器、並掛載永久磁碟的主機（例如 Fly.io、Railway、Render 的付費方案，或自己的 VPS）。GitHub Pages 只能放靜態檔，不能跑這個 API。

```sh
docker build -t mytide-signal-api backend/MyTide.Api
docker run -d -p 8080:8080 -v mytide-signals:/data \
  -e AllowedOrigins=https://hsilan-sui.github.io \
  -e AdminToken=<長的隨機字串> \
  mytide-signal-api
```

Dockerfile 是多階段建置（不需要先手動 publish），以非 root 的 `app` 使用者執行，資料在 `/data`。

部署好之後：

1. 確認 `https://<API 網域>/api/health` 回 `{"status":"ok"}`。
2. 在 GitHub repository 的 **Settings → Secrets and variables → Actions → Variables** 新增 `MYTIDE_SIGNAL_API_URL` = `https://<API 網域>`（不加結尾斜線）。
3. 重新執行部署 workflow（或推一次 `main`），正式站就會開始保存訊號。
