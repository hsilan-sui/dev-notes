# My Tide Signal API — Cloudflare Workers + D1

BB Call 匿名訊號的免費正式後端：Cloudflare Workers（API）＋ D1（SQLite）。端點、請求和回應格式都和 `backend/MyTide.Api`（ASP.NET Core 版）相同，網站只要把 `MYTIDE_SIGNAL_API_URL` 指到這裡就好。

- **費用**：Workers Free 方案，不需要信用卡。每天 100,000 次請求、D1 5GB 儲存。超過額度時請求會失敗、隔天恢復，**不會收費**。
- **資料表**：`migrations/0001_signals.sql`，與 .NET 版的 `signals` 表相同，之後要搬到自架主機可以直接匯出、匯入。
- **限流**：每位訪客（`CF-Connecting-IP`）每分鐘 10 次寫入，計數存在 `write_limits` 表。
- **管理**：設定 `ADMIN_TOKEN` secret 後，可以用 `DELETE /api/signals/{id}` 移除不當訊號（連同回應）。

端點說明見 `backend/MyTide.Api/README.md`。

## 本機開發

```sh
cd backend/signal-worker
npm install
npm run migrate:local
npm run dev              # http://localhost:8787
```

## 第一次部署

需要一個免費的 Cloudflare 帳號。

```sh
cd backend/signal-worker
npx wrangler login                          # 開瀏覽器授權（由站主本人操作）
npx wrangler d1 create mytide-signals       # 把輸出的 database_id 填進 wrangler.toml
npm run migrate:remote                      # 在正式 D1 建表
npx wrangler secret put ADMIN_TOKEN         # 選擇性：開啟刪除功能
npm run deploy                              # 得到 https://mytide-signal-api.<子網域>.workers.dev
```

接著讓網站連上它：

```sh
gh variable set MYTIDE_SIGNAL_API_URL --body "https://mytide-signal-api.<子網域>.workers.dev"
gh workflow run "Deploy to GitHub Pages"    # 或推一次 main
```

確認 `https://…workers.dev/api/health` 回 `{"status":"ok"}`，正式站的 BB Call 就會開始保存訊號，也不會再顯示「只留在這次造訪」。

## 管理與備份

```sh
# 刪除一則訊號（連同回應）
curl -X DELETE https://…workers.dev/api/signals/<id> -H "Authorization: Bearer <ADMIN_TOKEN>"

# 匯出整個資料庫（備份或搬家）
npx wrangler d1 export mytide-signals --remote --output backup.sql
```
