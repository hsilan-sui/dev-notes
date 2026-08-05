---

name: commit
description: Review the current Git changes and create one local commit. Run manually when the user wants to save completed project changes without pushing them.
argument-hint: "[commit message]"
disable-model-invocation: true
allowed-tools:

* Read
* Bash

---

# Goal

檢查目前專案的 Git 變更，建立一個範圍明確的本機 commit。

這個 Skill 只負責 commit，不執行 push。

# Inputs

使用者可以直接執行：

`/commit`

也可以提供 commit message：

`/commit update portfolio homepage`

使用者提供的 `$ARGUMENTS` 作為 commit message 參考，但訊息必須符合實際 staged changes。

# Workflow

## 1. Check

執行：

* `git status --short`
* `git diff`
* `git diff --staged`

確認：

* 目前有尚未提交的變更
* 沒有 merge conflict
* 沒有 `.env`、密碼、Token 或其他敏感資訊
* 沒有 `.claude/settings.local.json` 等本機專用設定

如果沒有變更，停止並告知使用者。

如果存在不同目的的修改，先確認本次 commit 的範圍，不要直接全部提交。

## 2. Stage

將本次修改相關的檔案加入 staging。

優先使用明確的檔案路徑：

`git add <file-path>`

只有確認所有變更都屬於同一項工作時，才使用：

`git add -A`

Stage 完成後執行：

* `git diff --staged --stat`
* `git diff --staged`

確認即將提交的內容正確。

## 3. Commit

如果使用者提供 `$ARGUMENTS`，確認訊息符合 staged diff。

如果沒有提供，根據 staged diff 產生簡短清楚的 commit message。

執行：

`git commit -m "<commit message>"`

Commit 失敗時停止。

## 4. Report

執行：

* `git log -1 --oneline`
* `git status --short`

回報：

* Commit hash
* Commit message
* 提交的檔案
* 剩餘未提交變更

# Guardrails

* 不提交敏感資訊
* 不提交本機專用設定
* 不刪除或還原使用者修改
* 不使用 `git reset --hard`
* 不使用 `git clean`
* 不使用 `--no-verify`
* 不建立 empty commit
* 不執行 push

# Done When

* 已檢查目前 Git 變更
* 已確認 commit 範圍
* 已建立一個本機 commit
* 已回報 commit 結果
* 未執行 push
