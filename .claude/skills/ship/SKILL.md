---

name: ship
description: Commit the current project changes, push the current branch to GitHub, and watch the GitHub Actions runs triggered by that commit. Run manually when the user wants to publish completed changes in one workflow.
argument-hint: "[commit message]"
disable-model-invocation: true
allowed-tools:

* Read
* Bash

---

# Goal

一次完成：

`commit → push → watch workflow`

先將目前修改建立成一個本機 commit，再 push 目前分支，並等待該 commit 觸發的 GitHub Actions 完成。

任一步驟失敗時停止，不繼續後面的操作。

# Inputs

使用者可以直接執行：

`/ship`

也可以提供 commit message：

`/ship update portfolio homepage`

使用者提供的 `$ARGUMENTS` 作為 commit message 參考，但必須符合實際 staged changes。

# Workflow

## 1. Check

執行：

* `git status --short`
* `git diff`
* `git diff --staged`
* `git branch --show-current`
* `git remote get-url origin`
* `gh auth status`

確認：

* 目前有需要提交的修改
* 沒有 merge conflict
* GitHub CLI 已登入
* Repository 有 `origin` remote
* 沒有 `.env`、密碼、Token 或其他敏感資訊
* 沒有 `.claude/settings.local.json` 等本機專用設定

如果沒有變更，停止並告知使用者。

如果存在不同目的的修改，先確認本次 commit 的範圍。

## 2. Commit

將本次工作相關的檔案加入 staging。

優先使用明確檔案路徑，不要在範圍不清楚時直接使用 `git add -A`。

執行：

* `git diff --staged --stat`
* `git diff --staged`

確認 staged changes 正確。

Commit message 的來源：

1. 使用者提供的 `$ARGUMENTS`
2. 沒有提供時，根據 staged diff 產生簡短訊息

執行：

`git commit -m "<commit message>"`

Commit 失敗時停止，不得 push。

## 3. Push

取得目前 branch 與 commit SHA：

* `git branch --show-current`
* `git rev-parse HEAD`

Push 目前分支：

`git push origin "$(git branch --show-current)"`

Push 失敗時停止。

## 4. Watch CI

使用剛建立的 commit SHA 尋找 GitHub Actions：

`gh run list --commit "<commit-sha>" --limit 10 --json databaseId,name,status,conclusion,url`

如果 workflow 尚未出現，短暫等待後重試幾次。

如果沒有 workflow 被觸發，回報 push 成功，但目前 branch 沒有對應的 GitHub Actions。

如果找到 workflow，逐一等待執行完成：

`gh run watch "<run-id>" --compact --exit-status`

如果 workflow 失敗，顯示失敗 log：

`gh run view "<run-id>" --log-failed`

只回報失敗原因，不自行修改程式或重新部署。

## 5. Report

回報：

* Commit hash
* Commit message
* Push branch
* Workflow 名稱
* Workflow 成功或失敗
* Workflow URL
* 是否仍有未提交變更

# Guardrails

* 不提交敏感資訊
* 不提交本機專用設定
* 不使用 force push
* 不自動切換或合併 branch
* 不略過 Git hooks
* 不自行修改 GitHub Actions
* Commit 失敗後不得 push
* Push 失敗後不得檢查部署
* Workflow 失敗時不得宣告發布成功

# Done When

* 已建立正確的本機 commit
* Commit 成功後才執行 push
* 已成功 push 目前分支
* 已確認該 commit 是否觸發 GitHub Actions
* 已等待觸發的 workflow 完成
* 已向使用者回報完整結果
