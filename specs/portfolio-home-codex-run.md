# Portfolio Home — Codex 無人值守執行手冊

Status: Ready to run
用途: 讓 OpenAI Codex CLI 依照 `specs/portfolio-home-implementation.md` 無人值守執行 Portfolio Home 首頁改造，本檔案本身**不包含**任何實作內容，只負責「怎麼安全地啟動 Codex 去執行那份 Spec」。

本輪只新增本檔案，未修改 Implementation Spec 或任何正式程式碼。

---

## 1. 本機版本確認（唯讀命令，已實際執行）

```text
$ which codex
/Users/suihsilan/.nvm/versions/node/v22.22.0/bin/codex

$ codex --version
codex-cli 0.146.0
```

`codex --help` 確認 `exec` 是非互動子命令；`codex exec --help` 確認本版本 `exec` 實際支援的相關參數：

| 參數 | 用途 | 本次是否使用 |
|---|---|---|
| `-s, --sandbox <read-only\|workspace-write\|danger-full-access>` | 選擇沙盒政策 | ✅ 使用 `workspace-write` |
| `-C, --cd <DIR>` | 指定工作根目錄 | ✅ 指向本 Repository 根目錄 |
| `--add-dir <DIR>` | 額外可寫入目錄 | 不需要（`.codex-reports` 與 `specs` 都在 `--cd` 指定的 workspace 內，`workspace-write` 預設即可寫入） |
| `--dangerously-bypass-approvals-and-sandbox` | 完全跳過沙盒與確認 | ❌ 明確禁止使用 |
| `--skip-git-repo-check` | 允許在非 git repo 執行 | 不需要（本專案已是 git repo，`git rev-parse --is-inside-work-tree` 回傳 `true`） |
| `-o, --output-last-message <FILE>` | 把 Codex 最後一則訊息存檔 | ✅ 額外備份用（非必要，但保留） |
| `--color <auto\|always\|never>` | 輸出顏色控制 | ✅ 設為 `never`，避免 ANSI 色碼污染 log 檔 |
| `-a, --ask-for-approval` | 執行前詢問核准 | **`codex exec --help` 的參數清單中並不存在此選項**（該選項只出現在頂層互動式 `codex --help`）。`exec` 子命令本身就是非互動模式，不會中途詢問核准，因此不需要、也無法傳入此參數。 |
| `--full-auto` | 一鍵全自動別名 | **本版本 `codex exec --help` 沒有列出這個別名**，因此不使用；改用明確的 `--sandbox workspace-write` 達成相同效果，行為更透明可稽核。 |

結論：本機版本要達成「非互動、限制在 repo 內、workspace-write、不詢問 approval、不使用 yolo/danger-full-access」，正確且唯一需要的旗標組合是：

```
codex exec --sandbox workspace-write --cd <repo-root> --color never ...
```

不需要、也不存在可以額外「解除 sandbox」或「跳過核准」的旗標被誤用的風險，因為 `exec` 子命令本來就不支援互動核准機制。

---

## 2. 執行前檢查清單

- [ ] 目前分支：`main`（或你要跑這次無人值守任務的分支）。**建議先確認 `git status` 是乾淨的，或至少確認目前的未提交變更是你認得、願意保留的**，因為 Codex 會直接在這個工作目錄上寫檔案。
- [ ] `specs/portfolio-home-implementation.md` 存在且是你已確認過的版本。
- [ ] 已安裝並登入 `codex`（`codex login` 狀態正常，`codex --version` 能跑）。
- [ ] 電腦接電源、不會因為蓋上螢幕而中斷（`caffeinate` 只防止系統睡眠，不會阻止你手動關機/登出）。
- [ ] 這次執行不會被要求推送、部署或建立 commit——Prompt 內已明確禁止，但你仍應在隔天驗收時再次用 `git status` 確認沒有意外的 commit。

---

## 3. 一鍵複製執行區塊

在 Repository 根目錄（`/Users/suihsilan/sui-dev-notes`）開一個你晚上可以放著不管的終端機視窗，整段貼上執行：

```bash
cd /Users/suihsilan/sui-dev-notes

mkdir -p .codex-reports

CODEX_PROMPT=$(cat <<'PROMPT_EOF'
你現在是無人值守的實作 Agent，今晚沒有人會即時回答你的問題。你的唯一任務來源是這個檔案，請先完整讀完它，再開始動任何程式碼：

    specs/portfolio-home-implementation.md

嚴格規則（優先順序高於你自己的判斷）：

1. 完整讀完 specs/portfolio-home-implementation.md 全文之後，才可以開始修改任何檔案。不要只讀部分章節就動手。
2. 嚴格依照該 Spec 的 TASK-01 到 TASK-12，依序執行，不要跳過、不要重新排序、不要合併成一次大改。每完成一個 TASK，做一次該 TASK 指定的驗收與驗證命令再繼續下一個。
3. 只執行 Spec 第 11 節列出的、package.json 裡實際存在的命令（npm run dev / npm run build / npm run clear / npm run serve）。這個專案沒有 lint、沒有 test、沒有 typecheck，不要嘗試執行，也不要新增這些 script。
4. Pencil 已確認設計稿的內容（Hero 文案、三個 Selected Projects、More Project、Engineering Capabilities、Technical Notes、Final CTA 的文字與結構）必須依 Spec 原文逐字實作，不要改寫文案、不要調整版面決策、不要自行「優化」設計稿已經定案的內容。
5. Spec 第 2.5 節與第 7 節已經明確列出哪些 URL、GitHub repo、YouTube 連結、Email、影片檔案是「目前不存在、不得虛構」的。這些欄位一律使用 null 或省略該欄位，並依 Spec 第 4.4 節的規則渲染成明確的安全 Placeholder（disabled/aria-disabled、非 <a href="#">、附上顯示用的 TODO 註解），絕對不可以編造網址、Email、成效數字或不存在的素材。
6. 不得因為缺素材、缺連結、缺圖片而卡住整個任務。缺什麼就照上一條做成安全 Placeholder，繼續往下做，並把每一個 Placeholder 記錄到最終報告的 Blocker 清單。
7. 只能新增或修改 Spec 第 0 節「Hard file boundary」列出的檔案範圍：
   - 可修改：src/pages/index.js、src/pages/index.module.css
   - 可新增：src/components/PortfolioHome/** 底下的檔案
   - 其餘一律唯讀，包括但不限於：design/portfolio-home.pen、docusaurus.config.js、sidebars.js、package.json、package-lock.json、src/css/custom.css、src/components/HomepageFeatures/**、src/components/ui/**、src/theme/**、docs/**、static/**（除非 Spec 內文明確允許的極少數例外）。
8. Production Build（npm run build）失敗時：先判斷是不是這次改動造成的。如果是這次改動造成的，修正後重新執行 npm run build，直到成功為止。如果是本來就存在、與這次改動無關的錯誤，不要嘗試修它，只在最終報告中列為 Pre-existing issue，並清楚說明為什麼判斷它與本次改動無關。
9. 絕對不要執行以下任何命令：git commit、git push、任何形式的 deploy、npm install 新套件、npm audit fix、升級任何 dependency、修改 docs 的 sidebar 結構或刪除 Docusaurus 預設鷹架文件。
10. 完成所有 TASK 之後，在收尾前執行 git diff --stat（或等效的檔案異動列表）逐一核對，確認只有第 7 條允許的檔案被新增/修改。如果發現任何超出範圍的檔案被動到（不論是你自己不小心改的，或是建置過程產生的），必須把那些超出範圍的檔案還原成修改前的狀態（例如 git checkout -- <file>，或刪除你不該建立的檔案），再繼續收尾，不能把越界的修改留在工作目錄裡。
11. 最後，把完整的最終報告寫成一個新檔案 .codex-reports/portfolio-home-final.md（用你自己的檔案寫入能力建立它，不是靠終端機重導向），內容至少要包含：
    - 完成了哪些 TASK（TASK-01 到 TASK-12 逐項列出狀態：完成 / 部分完成並說明原因）
    - 新增、修改、刪除的檔案完整清單（相對路徑）
    - npm run build 等驗證命令的實際結果（成功/失敗，失敗要附錯誤重點）
    - 目前所有的 Placeholder / disabled 連結清單，每一項寫明缺的是什麼真實資料
    - 已知風險（例如：無法在此環境用瀏覽器實際檢視 RWD、只能用程式碼靜態檢查代替視覺確認等）
    - 回退方式（給人類事後手動執行用的 git 指令，你自己不要執行它們）
12. 全程不要問我問題，因為不會有人回答。遇到任何不確定的地方，套用 specs/portfolio-home-implementation.md 第 0 節的優先順序規則自己做安全的決定，並在最終報告寫清楚你做了什麼決定、為什麼。

現在開始：先完整讀完 specs/portfolio-home-implementation.md，再依序執行 TASK-01 到 TASK-12。
PROMPT_EOF
)

set -o pipefail

caffeinate -i codex exec \
  --sandbox workspace-write \
  --cd "$(pwd)" \
  --color never \
  -o .codex-reports/portfolio-home-last-message.txt \
  "$CODEX_PROMPT" \
  2>&1 | tee .codex-reports/portfolio-home-run.log

CODEX_EXIT_CODE=$?
echo "----" | tee -a .codex-reports/portfolio-home-run.log
echo "Codex exec 原始 exit code: ${CODEX_EXIT_CODE}" | tee -a .codex-reports/portfolio-home-run.log
exit "${CODEX_EXIT_CODE}"
```

### 這段指令做了什麼、為什麼安全

| 需求 | 對應實作 |
|---|---|
| 非互動模式 | `codex exec`（本身即非互動子命令，本版本無互動核准選項） |
| Working directory 限制在目前 Repository | `--cd "$(pwd)"`，且在指令最前面 `cd /Users/suihsilan/sui-dev-notes` 已鎖定路徑 |
| Sandbox 使用 workspace-write | `--sandbox workspace-write` |
| 不停下來詢問 approval | `exec` 子命令本身不支援互動核准，天生符合 |
| 不使用 yolo / danger-full-access / 解除 sandbox | 指令中沒有 `--dangerously-bypass-approvals-and-sandbox`，也沒有 `-s danger-full-access` |
| 完整閱讀 Spec 後才修改 | Prompt 規則 1 明文要求 |
| 依 TASK-01 到 TASK-12 順序執行 | Prompt 規則 2 明文要求 |
| 執行 Spec 中實際存在的驗證命令 | Prompt 規則 3，明列 `npm run dev/build/clear/serve`，並禁止假裝有 lint/test |
| Build 失敗時修正本次引入的問題並重跑 | Prompt 規則 8 |
| 不部署、不 Push、不 Commit | Prompt 規則 9 |
| 完整執行紀錄寫入 log | `2>&1 \| tee .codex-reports/portfolio-home-run.log`（stdout/stderr 都進去，且畫面上同時看得到） |
| 最終報告寫入指定檔案 | Prompt 規則 11，要求 Codex 自己用檔案寫入建立 `.codex-reports/portfolio-home-final.md`（不是靠 shell 重導向湊出來的，內容由 Codex 自己組織） |
| caffeinate 避免閒置睡眠 | `caffeinate -i codex exec ...` 包住整個長時間執行的命令 |
| Shell pipeline 保留 Codex 原始 exit code | `set -o pipefail` + 執行後立刻讀 `$?` 並用 `exit "${CODEX_EXIT_CODE}"` 回傳，避免被 `tee` 蓋掉 |
| Pencil Demo Copy 依 Spec 原文實作 | Prompt 規則 4 |
| 缺素材用 null + 安全 Placeholder，不虛構 | Prompt 規則 5、6 |
| 不修改 Scope 外檔案 | Prompt 規則 7 |
| 最後檢查 git diff，越界必須還原 | Prompt 規則 10 |
| 最終報告涵蓋完成 Task / 檔案 / 驗證 / Placeholder / 風險 / 回退 | Prompt 規則 11 的六個必列項目 |

`.codex-reports/` 資料夾不在 Implementation Spec 允許修改的 `src/` 範圍內，但它是本次任務自己的執行紀錄輸出目錄，不算「正式網站程式碼」，且明確被本檔案（本輪唯一新增的檔案）授權使用；Codex 在收尾的 `git diff` 自檢時看到 `.codex-reports/**` 屬於預期產物，不需要也不應該把它還原掉。

---

## 4. 執行中你會看到什麼

- 終端機會即時捲動 Codex 的完整思考/工具呼叫紀錄（因為 `tee` 同時輸出到畫面與檔案），可以放著不管，也可以隨時看進度。
- 全部結束後，終端機最後會印出：
  ```
  ----
  Codex exec 原始 exit code: 0
  ```
  （或非 0，代表 Codex 這次執行本身失敗，見下方第 6 節）
- 執行期間電腦不會因為閒置而自動睡眠（`caffeinate -i`），但螢幕仍可能依系統設定變暗/上鎖，這不影響背景執行。

---

## 5. 明早驗收指令

不要只看 exit code 就當作完成，請照順序做以下確認：

```bash
cd /Users/suihsilan/sui-dev-notes

# 1) 看 Codex 自己寫的最終報告
cat .codex-reports/portfolio-home-final.md

# 2) 看完整執行紀錄（如果報告有可疑之處，回去查對應段落）
less .codex-reports/portfolio-home-run.log

# 3) 確認實際改了哪些檔案，人工核對是否都在允許範圍內
git status --short
git diff --stat

# 4) 確認範圍：只應該看到這些前綴的變更
#    src/pages/index.js
#    src/pages/index.module.css
#    src/components/PortfolioHome/**
#    .codex-reports/** （本次執行紀錄，非正式程式碼）
# 如果看到範圍外的檔案被改動，先不要相信報告寫「沒有越界」，實際比對 git diff --stat 的結果為準。

# 5) 親自重新跑一次 build，不要只信任 log 裡的結果
npm run build

# 6) 本機啟動，人工用瀏覽器檢查三個尺寸（Codex 在無頭環境下很可能無法真的開瀏覽器，
#    RWD 的視覺驗收本來就需要你這一步親自看過，不能省略）
npm run dev
# 打開 http://localhost:3003/dev-notes/，用瀏覽器 devtools 切到 1440 / 768 / 390 寬度分別檢查：
#   - 沒有橫向捲動
#   - 三個 Selected Projects、公仔辨識 YouTube 卡片版面正常
#   - LINE OA 影片預覽是 16:9、手機畫面沒有被拉寬變形
#   - 切換 Dark Mode 文字仍然可讀
```

若第 3、4 步發現任何越界檔案，且 Codex 自己沒有在收尾時還原，用第 6 節的回退指令處理，不要手動零星修補。

---

## 6. 安全回退指令

以下指令**不會**被 Codex 自動執行（Prompt 規則 11 明文要求 Codex 只能「寫出」回退方式，不能自己跑），需要你判斷後手動執行。

### 6.1 只想retract這次的程式碼變更，保留 Codex 的執行紀錄

```bash
cd /Users/suihsilan/sui-dev-notes
git checkout -- src/pages/index.js src/pages/index.module.css
git clean -fd src/components/PortfolioHome
```

### 6.2 連同執行紀錄一起清掉，完全回到跑之前的狀態

```bash
cd /Users/suihsilan/sui-dev-notes
git checkout -- src/pages/index.js src/pages/index.module.css
git clean -fd src/components/PortfolioHome
rm -rf .codex-reports
```

### 6.3 如果發現有越界檔案被改到、但你想保留 PortfolioHome 的成果只還原越界部分

```bash
cd /Users/suihsilan/sui-dev-notes
# 先看清楚到底哪些檔案在允許清單之外被改了
git status --short

# 針對每一個越界、且是「已追蹤檔案被修改」的情況：
git checkout -- <越界的檔案路徑>

# 針對每一個越界、且是「新建立的未追蹤檔案」的情況：
rm -f <越界的新檔案路徑>
```

### 6.4 這次執行完全不採用，且已經想清楚要整批丟棄所有未提交變更（危險，會連你自己在其他地方的未提交工作一起清掉）

**不建議直接使用**——會影響本次任務範圍以外、你自己手上的其他未提交工作。若真的需要，先確認 `git status` 裡沒有任何你想保留的東西，再執行：

```bash
git reset --hard HEAD
git clean -fd
```

本手冊不會替你決定要不要用這個選項；只有在你自己確認過工作目錄裡沒有其他要保留的東西時才用。

---

## 附錄：本輪執行邊界確認

本次任務（建立本檔案）只新增了：

```
specs/portfolio-home-codex-run.md
```

未修改 `specs/portfolio-home-implementation.md`、未讀取 Pencil、未修改任何 `src/`、`docs/`、`static/`、`package.json`、`docusaurus.config.js`。
