---
id: dev-dockerfile
title: 開發用 Dockerfile（Node.js + nodemon）
sidebar_label: 開發用 Dockerfile
---

## 📦 開發環境用 Dockerfile 說明

這份 Dockerfile 是為 Node.js 專案設計的「**開發階段專用映像檔（Image）建構腳本**」，支援 `nodemon` 自動重啟與本地 volume 掛載，搭配 `docker-compose` 使用效果最佳。

---

## 🔧 Dockerfile 說明

✅ Why（為什麼要寫 Dockerfile？）

- Dockerfile 是「如何建立容器映像」的配方
- 定義 Docker Image 的內容
- 這是一份 Dockerfile，它會被 docker build 拿來
- 「製作 image」，而不是直接啟動 container
- Dockerfile 負責告訴 Docker：
- 「我要從哪個基礎映像開始、要安裝哪些依賴、複製哪些檔案、執行什麼啟動指令。」

> 可以把它想成：就像料理食譜：先備料（COPY）、再煮（RUN）、最後上桌（CMD）

👉 沒有 Dockerfile，Docker 不知道怎麼「從原料變出一個能跑的應用」

```dockerfile
# 使用特定 Node.js 版本
FROM node:20.11.1

# 設定工作目錄
WORKDIR /app

# 複製 package 檔案並安裝依賴
COPY package*.json ./
RUN npm install

# 全域安裝 nodemon（若你沒在專案中裝）
RUN npm install -g nodemon

# 複製專案其他檔案
COPY . .

# 設定開發使用的啟動指令（自動重啟）
CMD ["nodemon", "bin/www.js"]

# 開放對應 port（可搭配 docker-compose 使用）
EXPOSE 5000
```
