---
title: "【聚合函式 Aggregate Fns】把多筆資料彙總成一個統計結果"
sidebar_position: 1
---

## 本篇觀念要點

資料表裡通常會有很多筆資料，例如員工薪資、顧客發票、訂單金額與考試成績。

<Highlight>聚合函式 Aggregate Functions：把多筆資料放在一起計算，最後產生一個統計結果。</Highlight>

1. [什麼是聚合函式](#what-is-aggregate)
2. [常見聚合函式](#aggregate-functions)
3. [生活例子](#life-example)
4. [COUNT 與 NULL](#count-null)
5. [Cheat Sheet](#cheat-sheet)

:::info 這篇的學習主線

多筆原始資料 → 聚合函式計算 → 一個統計結果

---

## 什麼是聚合函式 {#what-is-aggregate}

假設薪資資料如下：

```text
salary
50000
60000
70000
```

使用聚合函式後：

```text
COUNT → 共有 3 筆
SUM   → 總和是 180000
AVG   → 平均是 60000
MAX   → 最大值是 70000
MIN   → 最小值是 50000
```

例如：

```sql title="計算所有薪資的平均值"
SELECT AVG(salary)
FROM salaries;
```

沒有使用 `GROUP BY`(見下一篇筆記) 時，聚合函式會針對整份查詢結果計算，通常只回傳一列。

---

## 常見聚合函式 {#aggregate-functions}

| Function  | 功能     |
| --------- | ------ |
| `COUNT()` | 計算資料筆數 |
| `SUM()`   | 計算數值總和 |
| `AVG()`   | 計算平均值  |
| `MAX()`   | 找出最大值  |
| `MIN()`   | 找出最小值  |

```sql title="常見聚合函式"
SELECT
    COUNT(*) AS record_count,
    SUM(salary) AS total_salary,
    AVG(salary) AS average_salary,
    MAX(salary) AS highest_salary,
    MIN(salary) AS lowest_salary
FROM salaries;
```

---

## 生活例子 {#life-example}

假設我手上有整箱全台灣顧客的發票。

```text
台北  500 元
台中  300 元
高雄  200 元
台北  400 元
```

只使用：

```sql
SUM(amount)
```

會把所有發票金額加起來，得到：

```text
全台灣總消費額：1400 元
```

這時聚合函式不知道縣市差異，它只負責把全部資料彙總成一個結果。

```text
所有發票
   ↓
SUM 金額
   ↓
全台灣總消費額
```

---

## COUNT 與 NULL {#count-null}

`COUNT(*)` 與 `COUNT(column)` 不完全相同。

假設資料如下：

```text
bonus
1000
NULL
2000
```

```sql
SELECT
    COUNT(*) AS all_rows,
    COUNT(bonus) AS bonus_rows
FROM employees;
```

結果：

```text
COUNT(*)      → 3
COUNT(bonus)  → 2
```

原因：

* `COUNT(*)` 計算所有資料列
* `COUNT(column)` 不計算該欄位為 `NULL` 的資料

:::warning COUNT 的選擇

想計算資料有幾列：

```sql
COUNT(*)
```

想計算某個欄位有值的筆數：

```sql
COUNT(column)
```

:::

---

## Cheat Sheet {#cheat-sheet}

### 計算資料筆數

```sql
SELECT COUNT(*)
FROM table_name;
```

### 計算總和

```sql
SELECT SUM(value_column)
FROM table_name;
```

### 計算平均

```sql
SELECT AVG(value_column)
FROM table_name;
```

### 找出最大值與最小值

```sql
SELECT
    MAX(value_column),
    MIN(value_column)
FROM table_name;
```

---

## 總結：核心觀念整理

* 聚合函式會處理多筆資料
* 聚合後通常只得到一個統計結果
* `COUNT` 計算筆數
* `SUM` 計算總和
* `AVG` 計算平均
* `MAX` 與 `MIN` 找出最大值與最小值
* `COUNT(*)` 會計算所有資料列
* `COUNT(column)` 會忽略該欄位的 `NULL`

<Highlight>聚合函式的工作，就是把很多筆資料濃縮成一個統計答案。</Highlight>

**多筆資料 → Aggregate Function → 一個彙總結果**
:::

