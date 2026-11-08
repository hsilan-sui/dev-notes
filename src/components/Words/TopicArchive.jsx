import React, {useState} from 'react';
import {wordTopics} from './topicData';
import CompactFamily, {ArchiveWord} from './CompactFamily';
import styles from './WordsPage.module.css';

export default function TopicArchive({word}) {
  const topic=wordTopics[word];
  const [source,selectSource]=useState(topic.source);
  return <article>
    <header className={styles.archiveHero}><small>Word Archive {topic.archive}｜意識潮</small><h1 id="archive-title"><ArchiveWord word={topic.title} parts={topic.titleParts}/></h1><h2>{topic.subtitle}</h2><p>{topic.description}</p></header>
    <section className={styles.anatomy} aria-labelledby="topic-anatomy-title">
      <small>WORD ANATOMY / 語源與構詞</small><h2 id="topic-anatomy-title">{topic.anatomyTitle}</h2>
      <div className={styles.anatomyDiagram}>
        <div className={styles.anatomyParts}>{topic.anatomy.map(part=><a key={part.id} className={styles[part.tone]} href="#topic-family" onClick={()=>selectSource(part.id)}><strong>{part.word}</strong><b>{part.meaning}</b><span>{part.original}</span><small>查看詞源家族 ↗</small></a>)}</div>
        <div className={styles.anatomyResult}><span aria-hidden="true">↓</span><p>{topic.equation}</p><strong><ArchiveWord word={topic.title} parts={topic.titleParts}/></strong><p>{topic.result}</p></div>
      </div>
      <p className={styles.anatomyNote}>{topic.note}</p>
    </section>
    <section id="topic-family"><small>WORD FAMILY / 詞根延伸</small><h2>{topic.familyTitle}</h2>
      <CompactFamily nodes={topic.nodes} edges={topic.edges} source={source} label={`${word} 詞族關係圖`} legend={topic.legend} height={topic.height} memoryTop={topic.memoryTop}/>
      <p className={styles.anatomyNote}>{topic.familyNote}</p>
    </section>
    <section><small>THE STORY / 詞源故事</small><h2>{topic.storyTitle}</h2>{topic.story.map(p=><p key={p}>{p}</p>)}{topic.emphasis&&<p className={styles.emphasis}>{topic.emphasis}</p>}</section>
    <section className={styles.prefixMemory}><small>WORD BUILDING / 構詞記憶</small><h2>{topic.memoryTitle}</h2>
      <div className={styles.comparisonRoutes}>{topic.memory.map(([route,meaning])=><div key={route}><strong>{route}</strong><span>{meaning}</span></div>)}</div><p className={styles.anatomyNote}>{topic.memoryNote}</p>
    </section>
    <section className={styles.references}><details><summary>資料來源與閱讀註記 ＋</summary><p>語源、詞義與歷史依下列資料整理；故事中的提問是敘事詮釋。</p>{topic.sources.map(([title,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{title} ↗</a>)}</details></section>
  </article>;
}
