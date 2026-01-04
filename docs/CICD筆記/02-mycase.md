---
title: "如何應用CI/CD在我的專案上"
sidebar_position: 2
---


## 我如何把 CI/CD 落地在自己的專案中

我在學 CI/CD 的過程中，最大的體悟是：

> **只有從自己的實際需求出發，  
> 技術才會真的變成可以長期使用的能力。**

這一章，我會用我實際運作中的公益專案，說明我是如何理解並應用 CI/CD，
以及我在過程中踩過的坑與後來的設計調整。

---

## 專案背景與實際需求

### 專案背景

我目前維護一個心理諮商地圖的公益專案，資料來源為衛福部合作心理諮商機構：

- 以年為單位的政府方案
- 每一家合作機構有不同的免費名額
- 名額狀態會隨時變動（有名額 / 無名額）

因此，資料的「即時性與可信度」對使用者來說非常重要。

---

### 系統角色拆分

#### 資料來源 Repo（資料生產者）

- 爬取衛福部合作心理諮商機構資料
- 整理各機構名額狀態
- 補齊每家機構的經緯度
- 產出全台心理諮商機構 JSON

責任非常單純：  
**確保資料正確、完整、可被使用。**

---

#### 展示網站 Repo（資料消費者）

- 使用 Next.js
- 搭配 OSM 顯示地圖
- 直接讀取 JSON 呈現目前狀態

責任同樣清楚：  
**不處理資料來源，只專注於展示。**

---

### 我的核心需求

> **只要政府資料變了 → JSON 更新 → 展示網站自動更新與部署  
> 不需要人手動同步或操作。**

---

## 初版流程設計（CI/CD 的理想狀態）

我一開始用流程圖來確認整體資料流與自動化邊界：

```mermaid
flowchart TD
    A[政府心理諮商資料來源] --> B[爬蟲更新資料]
    B --> C[產生最新資料檔案]
    C --> D[資料儲存庫更新]

    D --> E[自動資料檢查]
    E --> F[資料通過驗證]

    F --> G[展示網站取得最新資料]
    G --> H[網站自動建置]
    H --> I[網站自動部署完成]

    classDef source fill:#E3F2FD,stroke:#2196F3
    classDef data fill:#E8F5E9,stroke:#4CAF50
    classDef ci fill:#FFF3E0,stroke:#FB8C00
    classDef deploy fill:#FCE4EC,stroke:#E91E63

    class A source
    class B,C,D data
    class E,F ci
    class G,H,I deploy
````

這張圖對我來說代表：

* **CI**：資料更新後的自動檢查與驗證
* **CD**：展示網站在資料變更後自動建置與部署

---

## 我實際踩過的坑：把爬蟲直接放進 CI/CD

一開始，我嘗試將「爬蟲」直接放進 CI/CD pipeline 中，
希望做到全自動資料抓取。

結果是幾乎每次都失敗。

### 為什麼在 CI/CD 裡直接爬蟲容易失敗

CI/CD 環境本身有明顯限制：

1. 缺乏完整瀏覽器環境，政府網站容易阻擋 headless 行為
2. CI 平台 IP 容易被封鎖
3. 行為驗證與防爬蟲機制
4. 更本質的問題：

   * CI 的角色是 **驗證產物**
   * 不是 **產生資料**

這讓我意識到：
**這不是工具問題，而是角色分工錯誤。**

---

## 調整後的設計：Producer 觸發 + CI/CD 驗證

在實作自己的互動式履歷 LINE Bot 與其他專案後，
我逐漸理解了 **Producer / Worker** 的角色分工概念。

我後來調整成以下流程：

* 由外部 Producer（如 FastAPI Job Trigger）負責觸發爬蟲
* 爬蟲在本地或可控環境執行
* 資料更新後自動 commit 並 push 至資料 repo
* 由 repo 變更觸發 CI/CD，負責驗證與部署

```mermaid
flowchart TD
    A[外部觸發請求] --> B[本地觸發服務]
    B --> C[本地爬蟲執行]
    C --> D[產生最新資料檔案]

    D --> E[資料儲存庫提交更新]
    E --> F[自動資料驗證流程]

    F --> G[展示網站同步資料]
    G --> H[網站自動建置]
    H --> I[網站自動部署完成]

    classDef trigger fill:#E3F2FD,stroke:#2196F3
    classDef local fill:#E8F5E9,stroke:#4CAF50
    classDef repo fill:#FFF3E0,stroke:#FB8C00
    classDef deploy fill:#FCE4EC,stroke:#E91E63

    class A,B trigger
    class C,D local
    class E,F repo
    class G,H,I deploy
```

---

## 自我回饋！

這個專案讓我真正理解到：

* CI/CD 不是什麼都往 pipeline 塞
* 而是清楚知道「什麼該自動、什麼不該」
* 把不穩定性隔離在流程邊界之外

對我來說，CI/CD 不只是工程流程，
而是讓公益專案能夠 **長期可維護、可相信、可持續運作** 的關鍵。


