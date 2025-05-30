// src/components/Highlight.jsx
//用來「高亮」某段文字

// 引入 React，因為這是一個 React 元件
import React from "react";

//// 定義並導出一個叫 Highlight 的元件，接受兩個 props：children（包在元件裡的文字）與 color（自訂顏色）
//children 是 React 的特殊屬性，用來顯示元件內的內容
//color
export default function Highlight({ children, color = "#25c2a0" }) {
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: "10px",
        color: "#fff",
        padding: "4px 8px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {children}
    </span>
  );
}
