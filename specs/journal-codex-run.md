# Journal — Codex 無人值守執行手冊

Status: Ready to run
用途: 讓 OpenAI Codex CLI 依照 `specs/journal-01-prd.md` ~ `specs/journal-11-design-intent.md` 無人值守執行 Journal 頁面改造。本檔案不包含任何實作內容，只負責「怎麼安全地啟動 Codex 去執行那 11 份 Spec」。沿用先前 `specs/portfolio-home-codex-run.md` 已驗證過的安全旗標組合，未重新發明。

---

## 1. 本機版本確認

```text
$ which codex
/Users/suihsilan/.nvm/versions/node/v22.22.0/bin/codex

$ codex --version
codex-cli 0.146.0
```

沿用先前確認過的結論：`codex exec` 本身即非互動子命令，沒有、也不需要 `-a/--ask-for-approval`；本版本沒有 `--full-auto` 別名，改用明確的 `--sandbox workspace-write` 達成相同效果。正確且唯一需要的旗標組合：

```
codex exec --sandbox workspace-write --cd <repo-root> --color never ...
```

## 2. 執行前檢查清單

- [ ] 目前分支：`main`。`git status` 已確認乾淨（`specs/` 已於本次提交，`design/blog-timeline.pen` 已於前一次提交）。
- [ ] `specs/journal-01-prd.md` 到 `specs/journal-11-design-intent.md`（共 11 份）都存在且是已確認版本。
- [ ] 已安裝並登入 `codex`。
- [ ] 這次執行不會被要求推送、部署或建立 commit——Prompt 內已明確禁止，事後仍應用 `git status` 再次確認。

## 3. 一鍵複製執行區塊

```bash
cd /Users/suihsilan/sui-dev-notes

mkdir -p .codex-reports

CODEX_PROMPT=$(cat <<'PROMPT_EOF'
你現在是無人值守的實作 Agent，今晚沒有人會即時回答你的問題。你的唯一任務來源是這 11 個檔案，請先完整讀完全部 11 份，再開始動任何程式碼：

    specs/journal-01-prd.md
    specs/journal-02-ui-spec.md
    specs/journal-03-interaction-spec.md
    specs/journal-04-motion-spec.md
    specs/journal-05-accessibility-spec.md
    specs/journal-06-component-spec.md
    specs/journal-07-design-tokens.md
    specs/journal-08-implementation-plan.md
    specs/journal-09-task-breakdown.md
    specs/journal-10-review-checklist.md
    specs/journal-11-design-intent.md

嚴格規則（優先順序高於你自己的判斷）：

1. 完整讀完上述 11 份文件全文之後，才可以開始修改任何檔案。這份設計已經是「凍結、已核准」的狀態（見 journal-01 開頭），你的角色是 Software Architect / 實作者，不是設計師——不要重新設計版面、間距、字體、色票、或提出新的 UX 想法，任何與 11 份文件衝突的直覺都要讓步給文件本身（journal-02 UI Spec 與 journal-08 Implementation Plan 優先權最高）。
2. 依照 specs/journal-09-task-breakdown.md 的 TASK-00 到 TASK-10，依序執行，不要跳過、不要重新排序、不要合併成一次大改。每完成一個 TASK，做一次該 TASK 指定的驗收與 npm run build / npm run dev 驗證再繼續下一個。
3. 這個專案沒有 lint、沒有 test、沒有 typecheck script（package.json 只有 dev/build/clear/serve/deploy/swizzle/write-translations/write-heading-ids），不要嘗試執行不存在的命令，也不要新增這些 script 或安裝新套件來補上它們。
4. 架構決策已經在 journal-08-implementation-plan.md 第 2 節定案：用 `npm run swizzle @docusaurus/theme-classic BlogListPage -- --eject` 取代 `/blog` 列表頁的渲染，真實資料一律來自 Docusaurus blog plugin 提供的 `items`/`metadata` props，不得另外建立假資料層、不得新增 `src/pages/journal.js` 這種平行路由。
5. 絕對不得虛構內容：不得新增假冒是網站主人真實日記/散文/詩作的部落格文章（journal-08 第 4 節已明確禁止，「雨天的清邁」只是 Pencil 設計稿裡的示意文案，不是要你照抄成真的文章）。若你判斷需要一篇測試用的「同一天多篇」fixture 才能驗證 UI（journal-09 TASK-03a），只能新增「明確標註是 QA 測試用、非真實內容」的單一篇文章，並在最終報告列出檔名。
6. 不得新增任何 npm 套件（package.json/package-lock.json 除了下列例外一律不得變動）。已知兩個缺口與允許的例外處理方式都寫在 journal-08 第 6 節：(a) 圖示用 inline SVG 取代 Lucide 套件；(b) Newsreader 字體如果站上目前沒有載入，允許新增一個窄範圍、有明確記錄的 Google Fonts `<link>`（不是 npm 套件），並在最終報告寫清楚這個決定。
7. 只能新增或修改 journal-08-implementation-plan.md 第 5 節「File boundaries」列出的檔案範圍：
   - 可修改：`src/theme/BlogListPage/index.*`（swizzle --eject 產生後改寫)
   - 可新增：`src/components/Journal/**` 底下的所有檔案；必要時新增一篇 §5 允許的 QA fixture 部落格文章
   - 其餘一律唯讀，包括但不限於：`docusaurus.config.js`（除非有極小範圍、有明確理由、寫進報告的例外）、`sidebars.js`、`package.json`/`package-lock.json`（除上述字體例外)、`src/css/custom.css`、`src/pages/index.js`、`src/components/PortfolioHome/**`、`src/components/HomepageFeatures/**`、`src/components/ui/**`、整個 `docs/`、四篇既有的 stub 部落格文章內容、`design/blog-timeline.pen`（永遠不可寫入設計檔）。
8. Production Build（`npm run build`）失敗時：先判斷是不是這次改動造成的。如果是，修正後重新執行直到成功。如果是本來就存在、與這次改動無關的錯誤，不要嘗試修它，只在最終報告列為 Pre-existing issue 並說明判斷依據。
9. 絕對不要執行以下任何命令：`git commit`、`git push`、任何形式的 deploy、`npm install` 新套件（上述字體例外不算套件）、`npm audit fix`、升級任何 dependency、修改 `docs/` sidebar 結構或刪除 Docusaurus 預設鷹架文件。
10. 完成所有 TASK 之後，執行 `git diff --stat`（或等效的檔案異動列表）逐一核對，確認只有第 7 條允許的檔案被新增/修改。任何超出範圍的檔案異動（不論是你自己不小心改的，或建置過程產生的），必須還原成修改前狀態再繼續收尾。
11. 依照 specs/journal-09-task-breakdown.md TASK-10 的要求，把完整的最終報告寫成一個新檔案 `.codex-reports/journal-final.md`（用你自己的檔案寫入能力建立它，不是靠終端機重導向），內容至少要包含：
    - TASK-00 到 TASK-10 逐項列出狀態：完成 / 部分完成並說明原因
    - 新增、修改、刪除的檔案完整清單（相對路徑）
    - npm run build / npm run dev 等驗證命令的實際結果
    - specs/journal-10-review-checklist.md 每一條的檢查結果（通過 / 不通過並說明原因，不通過的一律列為 Blocker）
    - 目前所有的 Placeholder、substitution（字體/圖示）、QA fixture 部落格文章清單，每一項寫明原因
    - 已知風險（例如：無法在此環境用瀏覽器實際檢視動態效果、只能用程式碼靜態檢查代替視覺確認等）
    - 回退方式（給人類事後手動執行用的 git 指令，你自己不要執行它們）
12. 全程不要問我問題，因為不會有人回答。遇到任何不確定的地方，套用 journal-08 第 0 節精神（其實是 journal 系列文件本身沒有單獨的「第 0 節」，請改用：journal-02 UI Spec 與 journal-08 Implementation Plan 的具體數字優先於你自己的判斷；真的無法決定時，選擇更保守、更安靜、更少改動的那個選項，並在最終報告寫清楚你做了什麼決定、為什麼。

現在開始：先完整讀完 11 份 spec 文件，再依照 specs/journal-09-task-breakdown.md 的 TASK-00 到 TASK-10 依序執行。
PROMPT_EOF
)

set -o pipefail

caffeinate -i codex exec \
  --sandbox workspace-write \
  --cd "$(pwd)" \
  --color never \
  -o .codex-reports/journal-last-message.txt \
  "$CODEX_PROMPT" \
  < /dev/null \
  2>&1 | tee .codex-reports/journal-run.log

CODEX_EXIT_CODE=$?
echo "----" | tee -a .codex-reports/journal-run.log
echo "Codex exec 原始 exit code: ${CODEX_EXIT_CODE}" | tee -a .codex-reports/journal-run.log
exit "${CODEX_EXIT_CODE}"
```

> **已知風險（沿用先前踩坑記錄）**：背景（non-tty）啟動時必須加上 `< /dev/null`，避免 `codex exec` 在偵測到 stdin 是尚未關閉的 pipe 時卡在等待 stdin EOF。上方指令已包含這個修正。

### 這段指令做了什麼、為什麼安全

| 需求 | 對應實作 |
|---|---|
| 非互動模式 | `codex exec`（本身即非互動子命令） |
| Working directory 限制在目前 Repository | `--cd "$(pwd)"`，且指令最前面已 `cd` 鎖定路徑 |
| 不詢問 approval、不使用 danger-full-access | `--sandbox workspace-write`，未使用 `--dangerously-bypass-approvals-and-sandbox` |
| 不污染 log 的顏色碼 | `--color never` |
| 避免背景執行 stdin 卡住 | `< /dev/null` |
| 保留完整記錄 | `tee .codex-reports/journal-run.log` + `-o .codex-reports/journal-last-message.txt` |
| 事後可驗證只改了允許範圍 | Prompt 第 10 條要求 Codex 自己跑 `git diff --stat` 核對並還原越界異動 |

## 4. 執行後（人類 / Claude 收尾檢查）

- 讀 `.codex-reports/journal-final.md`，逐項核對 TASK-00~10 狀態與 Review Checklist 結果。
- `git status` / `git diff --stat` 確認變動檔案落在 journal-08 第 5 節允許範圍內，且**沒有**任何 commit 被建立。
- 實際啟動 `npm run dev`，打開 `/blog`，用瀏覽器（或至少讀取渲染後的 HTML/截圖）核對是否符合 Pencil 設計稿，而不是只信任報告文字。
- 若發現 bug：整理成具體、可重現的問題清單，重新呼叫 Codex 修復（同樣的安全旗標組合），最多重試 2 次；2 次後仍有無法修復的 bug，停止重試，如實回報使用者，不要無限迴圈。
