---
title: 快速搭建一個Express後端之ai文案生成[2]
sidebar_position: 2
---

import Highlight from '@site/src/components/ui/Highlight.jsx';

<!-- export const Highlight = ({ children, color }) => (
<span
style={{
      backgroundColor: color,
      borderRadius: "20px",
      color: "#fff",
      padding: "10px",
      cursor: "pointer",
    }}
onClick={() => {
alert(`You clicked the color ${color} with label ${children}`);
}}

>

    {children}

  </span>
); -->

# 快速搭建一個 Express 後端 [1]

:::note
此篇目的只是想讓自己能夠把 nodejs express 後端搭建出類似，開啟前端的應用伺服器會出現"hello world"一樣的脈絡，我想讓這兩個月學習的後端技能也變成一個儀式感！
並且透過此次所學習的 openai 套件
:::

---

## 0️⃣ 開場

學習需要『儀式感』，這陣子了解自己的動能起伏，那個起伏是有一陣很熱血沸騰，有一陣很凍僵，但透過了解自己的特質是恆毅力滿強的，那就從儀式感(前置 5 分鐘)帶入：

> - <Highlight color="#f97316">泡好一杯咖啡 ☕</Highlight>

> - <Highlight color="#fda4af">打開 VS Code</Highlight>

> - <Highlight color="#60a5fa">新增一個 md 筆記</Highlight>

---

## 1️⃣ 建立資料夾並初始化專案

:::success
package.json 是 Node.js 專案的說明書，記錄了你的專案名稱、版本、依賴套件與啟動方式
:::

```js
//拿一本資料夾命名
mkdir my-openai-app
//打開這個資料夾
cd my-openai-app

//npm init =>全部都yes
npm init -y
```

其實我常常執行`npm init`但都忘記這在幹嘛！
其實就是這個指令很貼心的，包含了一系列的問題：

```bash
# 你這個資料夾要叫？
name: (my-folder)
# 版本是？
version: (1.0.0)
# 寫一些描述吧？
description:
# 資料夾的進入點（入口/登山口＠＠）
entry point: (index.js)
test command:
git repository:
keywords:
author:
license: (ISC)
```

因為我現在的需求是，我想要這些上述問題都全 yes，直接幫我快速建立專案說明書(對 就是快速通道的意思！！)
==> 「全部都用預設的 yes，不用問了！YES!!!」

就會建立`package.json`:

```js
{
  "name": "my-folder",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

稍後我手動更改編輯`package.json`:

```json title="package.json"
{
  "name": "test_imgfn",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "axios": "^1.9.0",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "openai": "^5.0.2"
  }
}
```

## 2️⃣ 施工階段:安裝套件

搭建好`package.json`說明書，那我現在安裝此次練習的基本工具：

### 套件 1 => express

安裝

```bash
npm install express
```

> Express 是 Node.js 非常流行的後端框架，就像是在 JavaScript 世界裡開一台小貨車（server），幫我載 API、資料和請求，並且可以快速建立 Web API、網站伺服器或後端邏輯

如果我用 Node.js 原生來寫一個 API 伺服器，會需要處理很多繁雜的事情：

- 路由（哪個網址該做什麼事？）
- 解析 request body
- 處理錯誤、格式、CORS、安全性...

而 Express 幫我把這些都包好了，我只要專心寫 「功能」 就好

- 運行伺服器：

```js
const express = require("express");
const app = express();

app.use(express.json()); // 處理 JSON 請求

// 路由：GET / 回傳 hello
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// 啟動伺服器
app.listen(3000, () => {
  console.log("🚀 Server is running on http://localhost:3000");
});
```

### 套件 2 => dotenv

安裝

```bash
npm install dotenv
```

> dotenv

> 因為我不想把秘密告訴別人，所以會需要安裝`dotenv`這個套件，協助我取用我的密鑰，那我會把我的密鑰都存放在`.env`這個檔案裡，所以我要在專案層先建立`.env`：

```js title=".env"
PORT = 3000;
OPENAI_API_KEY = sk - xxxxxxx;
```

那我要怎麼在其他程式檔案中使用我的密鑰？
=> `先認識 process 物件`

:::info
process 是 Node.js 提供的一個全域物件
它代表整個 Node.js 執行中的「行程（Process）」
其中的 process.env 是一個物件，裡面包含所有環境變數
`console.log(process.env.PORT);`
這就會讀取我在.env 中設定的 PORT=3000
:::

我又要怎麼在例如：app.js 中透過 dotenv 這個套件來取用我存放在.env 中的密鑰呢？

```js title=" app.js"
//1.引入剛剛安裝好的dotenv
const dotenv = require("dotenv");

//2.透過dotenv把我的密鑰檔案.env中變數都讀進來process.env中
dotenv.config();

//3.接下來就可以透過process.env點記法來取用.env裡面的變數了
const port = process.env.PORT;
const apiKey = process.env.OPENAI_API_KEY;
```

> 備註前端使用.env 變數需要注意：

:::danger
❗ 前端不能用 process.env(因為 process 是 node 提供的全域物件)

- process.env 是 Node.js 執行時的變數，瀏覽器無法存取
- 我在 React / Next.js 要用環境變數，得經過「編譯階段注入」
- 像是 NEXT 作為前綴變數名使用，以 next 來說需要使用 `NEXT_PUBLIC`:
  `NEXT_PUBLIC_API_URL=https://api.example.com`
- 前端才能取用
  `const apiUrl = process.env.NEXT_PUBLIC_API_URL;`

- 若用 Vite 開發前端，不同於 Node.js 的 process.env
  使用 `.env` => `VITE_API_URL=https://your-api.com`

- 在前端讀環境變數`console.log(import.meta.env.VITE_API_URL);`

  :::

### 套件 3 => axios

安裝

```bash
npm install axios
```

> axios 就像是快遞員，可以幫我送資料、收資料、處理錯誤

- 直接發請求：

```js
const response = await axios.get("https://jsonplaceholder.typicode.com/posts");
console.log(response.data); // 回傳一堆文章
```

### 套件 4 => openai

安裝

```bash
npm install openai
```

> 這就是 OpenAI 官方提供的 Node.js SDK(軟體套件)，用簡單語法呼叫 GPT-4、ChatGPT、DALL·E、Moderation 等 API 功能

使用

```js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

就可以在程式中使用 openai.chat.completions.create(...) 方法

## 3️⃣ 目標：總和上述的套件運行後端伺服器，顯示`HELLO SUI`

剛剛都大致上講解了用途，現在就一次安裝，組合運行 app.js 吧！

```bash
npm install express dotenv axios openai
```

創建`app.js`並寫入：

```js title="app.js"
const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

// 初始化 Express 應用程式
const app = express();
const PORT = process.env.PORT || 3000;

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("HELLO Sui !歡迎使用 OpenAI API 敏感詞測試應用程式");
});

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
});
```

直接在我的專案層中執行終端機：`node app.js`就會出現：

![llm_test](./img/llm_test.png)
