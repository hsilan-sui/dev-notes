---
title: "【Web】Browsers瀏覽器 / client 客戶端"
sidebar_position: 1
---


## 🟧 開場白

> 在開始談系統設計細節之前，先建立「Web 系統是由哪些基本元件組成」的共同理解，並從使用者最熟悉的瀏覽器與 Client 開始。

:::tip 先搞清楚：

我到底在設計什麼樣的系統、這個系統又活在哪個環境？

:::

### 0️⃣ 概覽系統設計元件的「全景地圖」：

![系統設計全景圖](/img/designsys_01.png)

圖片引用來自[ZTM - Master the Coding Interview: System Design + Architecture](https://academy.zerotomastery.io/courses/system-design/lectures/44070483)

---

## 🟦 browser瀏覽器 / client客戶端

:::info

Browser瀏覽器 是「通用的入口工具」=> 「我現在想上網，不管是什麼網站。」

Client客戶端 是「為單一服務量身打造的入口」=> 我就是要用 Facebook / LINE

:::

### 0️⃣ 對照差異

| 面向       | Browser（瀏覽器）          | Client（原生或專用 App）     |
| -------- | --------------------- | --------------------- |
| 本質       | 通用型應用程式               | 專用型應用程式               |
| 是否為某服務而生 | ❌ 否                   | ✅ 是                   |
| 主要用途     | 存取各種 Web Application  | 直接存取某一個服務             |
| 使用方式     | 輸入網址                  | 直接打開 App              |
| 是否需要網址   | 通常需要                  | 不一定                   |
| 常見例子     | Chrome、Safari、Firefox | Facebook App、LINE App |
| 更新方式     | 瀏覽器本身更新               | App 需個別更新             |
| 控制程度     | 受瀏覽器與 Web 標準限制        | 可深度控制裝置能力             |

![系統設計全景圖](/img/designsys_02.png)
- 圖片引用來自 [ZTM - Master the Coding Interview: System Design + Architecture](https://academy.zerotomastery.io/courses/system-design/lectures/44070483)


### 1️⃣ **用「我每天的行為」來理解：**

> <Highlight>Browser 在做的事 => 「我現在想上網，不管是什麼網站。」</Highlight> 

- 開 Chrome
- 輸入網址
- Browser 幫你：
  - 發送 request
  - 接收 response
  - 組合 HTML / CSS / JS
  - 顯示畫面

👉 Browser = Web 的萬用遙控器

> <Highlight>Client 在做的事 => 「我就是要用 Facebook / LINE。」</Highlight> 

- 點開 App
- App 直接呼叫後端 API
- 拿資料、顯示畫面

👉 Client = 為某個服務量身打造的入口

### 2️⃣ 系統設計角度

| 重點   | Browser       | Client                  |
| ---- | ------------- | ----------------------- |
| 請求格式 | HTTP + Web 標準 | HTTP / WebSocket / gRPC |
| 身分管理 | Cookie 為主     | Token / App Key         |
| 能做的事 | 有安全沙盒         | 幾乎可控制裝置                 |
| 穩定度  | 瀏覽器版本影響       | 可控版本                    |


一個很關鍵但常被忽略的觀念:

> Browser 是一種特殊的 Client。

也就是說：系統設計圖裡
Browser client、Mobile client、Desktop client
👉 都站在同一層

只是：
- Browser 是「通用 client」
- App 是「專用 client」

**可以這樣說：**

:::tip

「Browser 是讓使用者存取各種 Web 服務的通用工具；

Client 則是針對某一服務設計的專用應用。

在後端系統設計中，它們本質上都只是 request 的來源，只是能力與限制不同。」

:::