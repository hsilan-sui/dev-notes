---
id: 如何使用react-router
title: 如何使用react-router
sidebar_label: 如何使用react-router
---

# React Router

[ReactRouter 官網](https://reactrouter.com/home)

我初學 React，專案開發環境是以 vite 來做安裝，所以此次透過官網提供的`Declarative`提供的方式來理解 ReactRouter 提供的基本用法：

## 如何在 React 專案中導入 React Router:

0️⃣ 我使用 npm 安裝 React Router

```bash
npm i react-router
```

---

1️⃣ 加入 BrowserRouter 「路由容器」

BrowserRouter 是 React Router 的「路由容器」，讓你的應用可以根據網址不同渲染不同畫面，實現單頁式應用（SPA）的核心功能

```jsx title="main.jsx" showLineNumbers {8,16-18}
//引入 React 的嚴格模式（開發時會提示潛在問題）
import { StrictMode } from "react";

//React 18+ 的新入口方法（取代 ReactDOM.render）
import { createRoot } from "react-dom/client";

//匯入 BrowserRouter，讓 App 擁有前端路由功能
import { BrowserRouter } from "react-router";

//匯入主元件
import App from "./App.jsx";

//渲染整個應用，將 App 包在 BrowserRouter 裡
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

---

2️⃣ 準備元件

---

3️⃣ 撰寫 Routes

---

4️⃣ 加入連結

## 使用 React Router Outlet

0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣
