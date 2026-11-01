import React, {useEffect,useState} from 'react';
import {enthusiasm} from './enthusiasmData';
import styles from './WordsPage.module.css';

export function EnthusiasmColour({word='enthusiasm'}) {
  const parts={enthusiasm:[['en','blue'],['thus','amber'],['iasm','']],enthusiastic:[['en','blue'],['thus','amber'],['iast',''],['ic','affix']],theology:[['theo','amber'],['logy','affix']],theism:[['the','amber'],['ism','affix']],atheism:[['a','without'],['the','amber'],['ism','affix']],monotheism:[['mono','mono'],['the','amber'],['ism','affix']],polytheism:[['poly','poly'],['the','amber'],['ism','affix']],pantheism:[['pan','pan'],['the','amber'],['ism','affix']],animism:[['anim','latin'],['ism','affix']]};
  const tones={blue:styles.sourceBlue,amber:styles.sourceAmber,affix:styles.sourceAffix,latin:styles.sourceLatin,mono:styles.sourceMono,poly:styles.sourcePoly,without:styles.sourceWithout,pan:styles.sourcePan};
  return <span aria-label={word}>{parts[word].map(([text,tone],i)=><span key={i} className={tones[tone]}>{text}</span>)}</span>;
}
const sources=[{key:'en',word:'en',meaning:'在裡面 · 希臘語來源',position:[24,7],tone:'sourceBlue'}, {key:'theos',word:'theos',meaning:'神 · 希臘語來源',position:[76,7],tone:'sourceAmber'}, {key:'ism',word:'-ism',meaning:'信仰、體系 · 名詞',position:[18,26],tone:'sourceAffix'}, {key:'logy',word:'-logy',meaning:'研究、學問',position:[50,26],tone:'sourceAffix'}, {key:'ic',word:'-ic',meaning:'⋯的 · 形容詞',position:[82,26],tone:'sourceAffix'}];
const wordPositions=[[24,48],[76,48],[24,63],[76,63],[24,78],[76,78],[24,93],[76,93]];
const related=(source,word)=>source==='theos'||source==='en'&&word.startsWith('enthu')||source==='ism'&&word.endsWith('theism')||source==='logy'&&word==='theology'||source==='ic'&&word==='enthusiastic';
export default function TheosFamily({source='theos'}) {
  const [selected,select]=useState(source);
  useEffect(()=>select(source),[source]);
  return <>
    <div className={`${styles.family} ${styles.theosFamily}`}>
      <div className={styles.theosNetwork}>
        <span className={styles.sourceLabel}>語源與構詞來源</span><span className={styles.theosMemoryLabel}>記住這些單字</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{sources.flatMap(s=>enthusiasm.family.map(([word],i)=>related(s.key,word)&&<line key={`${s.key}-${word}`} x1={s.position[0]} y1={s.position[1]} x2={wordPositions[i][0]} y2={wordPositions[i][1]} className={`${s.key==='en'||s.key==='theos'?styles.source:styles.shared} ${selected===s.key||selected===word?styles.activeEdge:''}`}/>))}</svg>
        {sources.map(s=><button key={s.key} className={`${styles.wordNode} ${styles.sourceNode} ${styles[s.tone]}`} style={{left:`${s.position[0]}%`,top:`${s.position[1]}%`}} onClick={()=>select(s.key)} aria-pressed={selected===s.key}><span>{s.word}</span><small>{s.meaning}</small></button>)}
        {enthusiasm.family.map(([word,meaning],i)=><button key={word} className={`${styles.wordNode} ${styles.memoryNode}`} style={{left:`${wordPositions[i][0]}%`,top:`${wordPositions[i][1]}%`}} onClick={()=>select(word)} aria-pressed={selected===word}><EnthusiasmColour word={word}/><small>{meaning}</small></button>)}
      </div>
      <p className={styles.legend}>藍：在裡面　琥珀：神　薄荷：詞尾<br/>··· 歷史語源　– – 共享構詞；點選高亮關聯</p>
    </div>
    <div className={styles.animismBranch}>
      <small>另一條語源 / 透過 -ism 延伸記憶</small>
      <div className={styles.animismSources}><span className={styles.sourceLatin}>anima<small>拉丁語 · 靈魂、生命</small></span><span className={styles.sourceAffix}>-ism<small>信仰、體系</small></span></div>
      <div className={styles.branchLines} aria-hidden="true">╲　╱<br/>↓</div>
      <strong><EnthusiasmColour word="animism"/></strong><p>萬靈信仰（泛靈論）</p>
      <small>自然事物也具有靈性或生命的觀念。與 theos 不同源；和 theism 等詞共享 -ism 構詞成分。</small>
    </div>
  </>;
}
