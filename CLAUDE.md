@AGENTS.md

## Claude Code 補充

- 意識潮的背景脈絡：@ai_workspace/my-tide-project-context.md
- `design/*.pen` 必須透過 Pencil MCP（`mcp__pencil__*`）讀寫，不能用 Read / Grep。
- 專案有自訂的 skills：`.claude/skills/`（commit、publish、ship）。

## RWD 守則（站主明確要求，不可違反）

站主非常討厭 RWD 破版。任何畫面、任何狀態都要守住：

- **任何寬度都不能出現橫向捲動**：至少檢查 320、375、390、834、1080、1280、1440px。
- **不能有元素被裁切、超出螢幕，或互相重疊、遮蓋**：包括 BB Call、YouTube 播放器、語言選單、站內廣播、文章卡片、訊號光年。
- **不能讓讀者自己左右滑動才看得到內容**：手機上 BB Call、寫訊號的畫面、語氣列都要完整排進可見範圍；空間不夠就縮小、換行或改成精簡版。
- **不要用 `overflow-x: hidden` 掩蓋問題**：找出真正撐破版面的元素並修正。頁面容器用 `overflow-x: clip`，`hidden` 會讓它變成第二個捲動框。
- **手機鍵盤打開時**（iOS visualViewport 變小），輸入框、語氣選擇和必要按鈕都要看得到、點得到。
- **改完要實測**：用 Playwright 在上述寬度跑，檢查 `document.documentElement.scrollWidth <= innerWidth`，並列出超出視窗、且沒有被祖先裁切的元素；手機狀態用 WebKit 測（見 `ai_workspace/handoff.md`）。

