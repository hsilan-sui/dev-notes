import React, {useEffect, useState} from 'react';
import styles from './WordsPage.module.css';

export function ArchiveWord({word, parts}) {
  if (!parts) return <span>{word}</span>;
  const tones = {blue:styles.sourceBlue, amber:styles.sourceAmber, affix:styles.sourceAffix};
  return <span aria-label={word}>{parts.map(([text,tone],index)=><span key={index} className={tones[tone]}>{text}</span>)}</span>;
}

// Same source-above / word-below layout and selection behavior as archives 001/002.
export default function CompactFamily({nodes, edges, source, legend, label, height=460, memoryTop=30}) {
  const [selected, select] = useState(source);
  useEffect(()=>select(source),[source]);
  return <div className={styles.family} role="group" aria-label={label}>
    <div className={`${styles.network} ${styles.compactNetwork}`} style={{'--family-height':`${height}px`}}>
      <span className={styles.sourceLabel}>語源與構詞來源</span>
      <span className={styles.memoryLabel} style={{top:`${memoryTop}%`}}>記住這些單字</span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([from,to,type='source'])=>{
          const a=nodes.find(node=>node.id===from), b=nodes.find(node=>node.id===to);
          return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`${styles[type]} ${selected===from||selected===to?styles.activeEdge:''}`}/>;
        })}
      </svg>
      {nodes.map(node=><button key={node.id} style={{left:`${node.x}%`,top:`${node.y}%`}} onClick={()=>select(node.id)} aria-pressed={selected===node.id}
        className={`${styles.wordNode} ${node.source?styles.sourceNode:styles.memoryNode}`}>
        <ArchiveWord word={node.word} parts={node.parts}/><small>{node.meaning}</small>
      </button>)}
    </div>
    <p className={styles.legend}>{legend}<br/>··· 歷史語源　─ 直接衍生　– – 共享構詞</p>
  </div>;
}
