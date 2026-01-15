---
title: "【Web】DNS 👉 網域名稱系統"
sidebar_position: 2
---

## 🟧 開場白

:::tip DNS(Domain Name System) 👉 網域名稱系統：

DNS 是負責把人類可讀的網址，轉換成機器能理解的 IP 位址，讓使用者可以正確連線到後端服務入口。

:::

---

## 🟦 👉 「現實生活地址」來講：

:::info

我家地址、公司地址都必須是唯一的

不然信件會寄錯
:::

---

## 🟦 👉 「網路世界」來講：

:::info

IP 位址 = 網路唯一收件地址

DNS = 查地址的系統
:::

---

## 🟦 DNS 到底在做什麼

### 0️⃣ 我平常在瀏覽器做的事
- 輸入 facebook.com
- 按 Enter

### 1️⃣ Browser 對 => DNS 提問
**Browser 對 DNS 說:我想要這個 domain 的位置**

### 2️⃣ DNS 回答 => Browser

這個 domain 對應到某一組 IP 位址

### 3️⃣ Browser 才能拿著 IP
👉 去真正的伺服器要資料

:::info

DNS 不給內容，只告訴我「去哪裡拿內容」

:::

### 4️⃣ 為什麼一個網站會有很多 IP位址

**以 Facebook 為例：**

- Facebook 不是只有一台伺服器

<Highlight color="#C62828">而是：數十萬 甚至數百萬個 IP 位址</Highlight> !


原因是：
- 全球使用者
- 地理位置不同
- 流量巨大

👉 DNS 的工作不是「只指向一個點」

👉 而是「幫我選一個適合的點」


### 5️⃣ IPv4 與 IPv6

>  DNS 不是自己決定回 IPv4 或 IPv6，而是「照著請求裡面寫的類型回資料」。

:::tip IPv4 是什麼
IPv4 是什麼

格式：數字＋點

位址數量有限
約 4.29 × 10 的 9 次方

👉 當初發明網際網路時： 沒想到會爆成這樣
:::

:::tip 為什麼需要 IPv6
IPv6 可容納的位址數量：
3.4 × 10 的 38 次方

👉 幾乎用不完

👉 所以現在 DNS 必須同時支援：
- IPv4

- IPv6
:::

- 「DNS 回 IPv4 或 IPv6，不是它自己判斷，而是 client 在 DNS query 裡面就已經指定 record type，例如 A 或 AAAA，DNS 只是照規格回傳。」

## 🟥 結尾

**DNS 常見的兩種查詢類型（這就是關鍵）**

### 0️⃣ A Record（IPv4）

:::note
查詢類型：A

意思是：
請給我這個 domain 對應的 IPv4 位址
:::

```
facebook.com → 31.xxx.xxx.xxx
```

### 1️⃣ AAAA Record（IPv6）

:::note
查詢類型：AAAA

意思是：

請給我這個 domain 對應的 IPv6 位址
:::

```
facebook.com → 2a03:xxxx:xxxx::xxxx
```

👉 DNS 只負責：你要什麼，我就回什麼

### 2️⃣  那是誰決定要送 A 還是 AAAA？

<Highlight>Client（發請求的人）</Highlight> !


來源可能是：
- Browser（Chrome / Safari）
- Mobile App
- Server to Server 呼叫
- IoT 裝置

### 3️⃣ Browser 的實際行為（系統設計感在這）

**現代瀏覽器通常是：**
- 先問 AAAA（IPv6）

- 如果：
  - 網路支援 IPv6
  - DNS 有回 IPv6

👉 用 IPv6 連線


- 如果失敗：
  - 再退回問 A（IPv4）

👉 這叫做 fallback 策略


```
Browser / App ｜ 瀏覽器/客戶端
   ↓（A or AAAA query）
DNS  ｜ 域名解析
   ↓（回 IP）
CDN / Load Balancer
   ↓
Web Server ｜網路伺服器

```