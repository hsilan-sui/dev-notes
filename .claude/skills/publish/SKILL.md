---

name: publish
description: Push the current branch to GitHub and watch the GitHub Actions runs triggered by the pushed commit. Run manually when committed changes are ready to publish.
disable-model-invocation: true
allowed-tools:

* Read
* Bash

---

# Goal

將目前分支已完成的 commit push 到 GitHub，並等待該 commit 觸發的 GitHub Actions 完成。

這個 Skill 不建立 commit，也不修改 workflow。

# Inputs

使用者直接執行：

`/publish`

目前分支與最新 commit 會由 Git 自動取得，不需要額外參數。

# Workflow

## 1. Check

執行：

* `git status --short`
* `git branch --show-current`
* `git remote get-url origin`
* `gh auth status`

確認：

* Working tree 沒有未提交變更
* 目前位於有效 branch
* Repository 有 `origin` remote
* GitHub CLI 已登入

如果還有未提交變更，停止並提醒使用者先執行 `/commit`。

## 2. Push

取得目前 branch 與 commit SHA：

* `git branch --show-current`
* `git rev-parse HEAD`

Push 目前分支：

`git push origin "$(git branch --show-current)"`

Push 失敗時停止。

## 3. Watch CI

使用剛才的 commit SHA 尋找 GitHub Actions：

`gh run list --commit "<commit-sha>" --limit 10 --json databaseId,name,status,conclusion,url`

如果 workflow 尚未出現，短暫等待後重試幾次。

如果沒有 workflow 被觸發，回報：

`Push completed, but no GitHub Actions workflow was triggered for this branch.`

如果找到 workflow，逐一等待執行完成：

`gh run watch "<run-id>" --compact --exit-status`

如果 workflow 失敗，顯示失敗 log：

`gh run view "<run-id>" --log-failed`

只回報錯誤，不自行修改程式或重新部署。

## 4. Report

回報：

* Push branch
* Commit SHA
* Workflow 名稱
* Workflow 成功或失敗
* Workflow URL

# Guardrails

* 不建立 commit
* 不使用 force push
* 不自動切換 branch
* 不自動 merge
* 不修改 GitHub Actions
* 不忽略 workflow 失敗
* Working tree 不乾淨時不得 push
* Push 失敗時不得宣告發布成功

# Done When

* 已確認 working tree 乾淨
* 已成功 push 目前分支
* 已確認該 commit 是否觸發 GitHub Actions
* 已等待觸發的 workflow 完成
* 已回報發布結果
