import React, {useState} from 'react';
import {wordTopics} from './topicData';
import styles from './WordsPage.module.css';

function TopicFamily({topic}) {
  const [selected, setSelected] = useState(topic.root);
  const selectedNode = topic.nodes.find(node => node.id === selected);
  return <>
    <div className={styles.topicNetwork} role="group" aria-label={`${topic.title} 詞族關係圖`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {topic.edges.map(([from, to, type]) => {
          const a = topic.nodes.find(node => node.id === from);
          const b = topic.nodes.find(node => node.id === to);
          return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            className={`${styles[type === 'history' ? 'historyEdge' : 'formationEdge']} ${selected === from || selected === to ? styles.selectedTopicEdge : ''}`}/>;
        })}
      </svg>
      {topic.nodes.map(node => <button key={node.id} type="button"
        className={`${styles.topicNode} ${node.source ? styles.topicSource : styles.topicWord}`}
        style={{left:`${node.x}%`, top:`${node.y}%`}} aria-pressed={selected === node.id}
        aria-controls="topic-node-detail" onClick={() => setSelected(node.id)}>
        <strong>{node.word}</strong><small>{node.label}</small>
      </button>)}
    </div>
    <p className={styles.topicLegend}>··· 歷史來源（可經中間借詞）　─ 現代構詞<br/>由上往下讀；點選節點，查看路徑與說明。</p>
    <div id="topic-node-detail" className={styles.topicDetail} aria-live="polite" aria-atomic="true">
      <strong>{selectedNode.word}</strong><p>{selectedNode.route}</p><p>{selectedNode.note}</p>
    </div>
  </>;
}

export default function TopicArchive({word, onOpen, onClose}) {
  const topic = wordTopics[word];
  const other = word === 'humble' ? 'humidity' : 'humble';
  return <article className={`${styles.topicArticle} ${styles[topic.tone]}`}>
    <header className={styles.archiveHero}>
      <small>Word Archive {topic.archive}｜意識潮</small>
      <div className={styles.topicEmblem} aria-hidden="true">{word === 'humble'
        ? <span className={styles.soilEmblem}><i/><i/><i/></span>
        : <span className={styles.waterEmblem}><i/><i/><i/></span>}</div>
      <h1 id="archive-title">{topic.title}</h1><p>{topic.meaning}</p>
      <h2>{topic.subtitle}</h2><p>{topic.introduction}</p>
    </header>
    <section aria-labelledby="topic-origin-title"><small>01 / WORD ORIGIN · 歷史來源</small>
      <h2 id="topic-origin-title">{word === 'humble' ? '從土地，走向人的姿態。' : '從濕潤，走向潮濕的狀態。'}</h2>
      <ol className={styles.originSteps}>{topic.origin.map(([language, form, meaning]) => <li key={form}>
        <small>{language}</small><strong>{form}</strong><span>{meaning}</span>
      </li>)}</ol>
      <p className={styles.anatomyNote}>{topic.originNote}</p>
    </section>
    <section aria-labelledby="topic-family-title"><small>02 / WORD FAMILY · 詞族星圖</small>
      <h2 id="topic-family-title">{word === 'humble' ? '土地之下，分出不同的路。' : '濕潤、加濕，與加濕的器具。'}</h2>
      <TopicFamily topic={topic}/>
    </section>
    <section><small>03 / THE STORY · 詞源故事</small><h2>{topic.storyTitle}</h2>
      {topic.story.map(p => <p key={p}>{p}</p>)}
    </section>
    <section><small>04 / WORD CONNECTIONS · 比較與記憶</small><h2>{topic.comparison.title}</h2>
      <div className={styles.comparisonRoutes}>{topic.comparison.routes.map(([route, meaning]) => <div key={route}><strong>{route}</strong><span>{meaning}</span></div>)}</div>
      <p>{topic.comparison.text}</p>
      {topic.comparison.example && <div className={styles.topicExample}><p lang="en">{topic.comparison.example[0]}</p><p>{topic.comparison.example[1]}</p></div>}
    </section>
    <section><small>05 / IN EVERYDAY WORDS · 日常用法</small><h2>把單字放回生活。</h2>
      {topic.examples.map(([en, zh]) => <div key={en} className={styles.topicExample}><p lang="en">{en}</p><p>{zh}</p></div>)}
      <aside>例句為本展間編寫。</aside>
    </section>
    <section className={styles.confusable} aria-labelledby="confusable-title"><small>LOOK ALIKE · 易混淆詞</small>
      <h2 id="confusable-title">humility ≠ humidity</h2>
      <div className={styles.confusablePair}><div><strong>humi<span>l</span>ity</strong><span>謙卑 · humilis 詞族</span></div><div><strong>humi<span>d</span>ity</strong><span>濕度 · humidus 詞族</span></div></div>
      <p>只差一個字母，卻是兩條語源。這條提示表示拼寫相似，不表示同源。</p>
      <button type="button" className={styles.topicAction} onClick={() => onOpen(other)}>探索 {other === 'humble' ? 'Humble · 謙卑' : 'Humidity · 濕度'} ↗</button>
    </section>
    <section><small>06 / FURTHER READING · 延伸閱讀</small><h2>{topic.extension.title}</h2><p>{topic.extension.text}</p></section>
    <section className={styles.references}><details><summary>資料來源與閱讀註記 ＋</summary>
      <p>詞源與詞義依下列資料整理。連線不表示首次出現的年代順序；故事中的提問與跨文化對照為敘事詮釋。</p>
      {topic.sources.map(([title, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{title} ↗</a>)}
    </details></section>
    <section className={styles.topicEnding}><small>MY TIDE ECHO · 讀完之後</small><h2>{topic.question}</h2><button type="button" className={styles.topicAction} onClick={onClose}>返回詞語星圖 ↗</button></section>
  </article>;
}
