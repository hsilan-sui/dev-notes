import React from 'react';
import styles from './WordsPage.module.css';

const groups=[
  {prefix:'mono-',stem:'mono',tone:'prefixMono',meaning:'單一、只有一個',combination:'monotheism',translation:'一神論',hint:'相信唯一的神',examples:[['monotheism','一神論'],['monologue','獨白'],['monopoly','壟斷']]},
  {prefix:'poly-',stem:'poly',tone:'prefixPoly',meaning:'多、許多',combination:'polytheism',translation:'多神論',hint:'相信多位神祇',examples:[['polytheism','多神論'],['polygon','多邊形'],['polyglot','多語者']]},
  {prefix:'a- / an-',stem:'a',tone:'prefixWithout',meaning:'無、沒有、缺乏',combination:'atheism',translation:'無神論',hint:'不相信神的存在',examples:[['atheism','無神論'],['amoral','非道德範疇的'],['anonymous','匿名的']]},
  {prefix:'pan-',stem:'pan',tone:'prefixPan',meaning:'全部、一切',combination:'pantheism',translation:'泛神論',hint:'神與宇宙萬有同一',examples:[['pantheism','泛神論'],['panorama','全景'],['pandemic','大流行']]},
];
export default function PrefixMemory() {
  return <section className={styles.prefixMemory} aria-labelledby="prefix-memory-title">
    <small>WORD BUILDING / 字首延伸</small><h2 id="prefix-memory-title">用組合來記憶</h2>
    <p className={styles.prefixIntro}>換一個字首，同一個 theism，走向不同的信仰觀。</p>
    <div className={styles.prefixGroups}>
      {groups.map(g=><div key={g.prefix} className={`${styles.prefixGroup} ${styles[g.tone]}`}>
        <div className={styles.prefixEquation} aria-label={`${g.prefix} 加 theism，${g.translation}`}>
          <div className={styles.prefixToken}><strong>{g.prefix}</strong><small>{g.meaning}</small></div>
          <span className={styles.prefixConnector} aria-hidden="true">＋</span>
          <div className={styles.theismToken}><strong>theism</strong><small>有神論</small></div>
          <span className={styles.prefixConnector} aria-hidden="true">→</span>
          <div className={styles.prefixResult}><strong>{g.translation}</strong><small>{g.hint}</small></div>
        </div>
        <div className={styles.prefixExamples} aria-label={`${g.prefix} 聯想詞`}>
          {g.examples.map(([word,meaning])=>{const length=word==='anonymous'?2:g.stem.length;return <div key={word}><strong><span>{word.slice(0,length)}</span>{word.slice(length)}</strong><small>{meaning}</small></div>;})}
        </div>
      </div>)}
    </div>
    <p className={styles.anatomyNote}>a- 與 an- 是同一否定字首的形式；此處 an- 見於 anonymous。amoral 指不涉及道德判斷，與 immoral（不道德的）不同。pan- 是「全部」，pantheism 不等於「相信很多神」。</p>
  </section>;
}
