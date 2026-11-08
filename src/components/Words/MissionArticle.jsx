import React, {useState} from 'react';
import {missionGroups, missionWords, missionSources} from './missionData';
import CompactFamily, {ArchiveWord} from './CompactFamily';
import styles from './WordsPage.module.css';

const titleParts=[['miss','amber'],['ion','affix']];
function familyFor(group) {
  const rows=Math.ceil(group.words.length/2);
  const nodes=[
    {id:'mit',word:'mit- / mitt-',meaning:'動詞詞幹 · 送出',source:true,x:24,y:9,parts:[['mit- / mitt-','blue']]},
    {id:'miss',word:'miss-',meaning:'missus 的歷史詞幹',source:true,x:76,y:9,parts:[['miss-','amber']]},
    ...group.words.map((word,index)=>{
      const entry=missionWords.find(item=>item.word===word),stem=word.includes('miss')?'miss':'mit',at=word.indexOf(stem);
      return {id:word,word,meaning:`${entry.pos} ${entry.meaning}`,x:index%2?76:24,y:rows===1?65:43+Math.floor(index/2)*(48/(rows-1)),parts:[[word.slice(0,at),''],[stem,stem==='mit'?'blue':'amber'],[word.slice(at+stem.length),'affix']]};
    }),
  ];
  const edges=group.words.map(word=>word==='commitment'?['commit','commitment','derived']:[word.includes('miss')?'miss':'mit',word,'source']);
  return {nodes,edges};
}

export default function MissionArticle() {
  const [source,selectSource]=useState('miss');
  return <article>
    <header className={styles.archiveHero}><small>Word Archive 005｜意識潮</small><h1 id="archive-title"><ArchiveWord word="mission" parts={titleParts}/></h1><h2>從送出，到願意承擔的事。</h2><p>一個關於派遣、任務與 mit／miss 詞族的故事</p></header>
    <section className={styles.anatomy} aria-labelledby="mission-anatomy-title"><small>WORD ANATOMY / 語源與構詞</small><h2 id="mission-anatomy-title">送出，留下兩種詞幹。</h2>
      <div className={styles.anatomyDiagram}><div className={styles.anatomyParts}>
        <a className={styles.nostPart} href="#mission-family" onClick={()=>selectSource('mit')}><strong>mit- / mitt-</strong><b>送出、派遣</b><span>拉丁語 mittere</span><small>動詞詞幹來源 ↗</small></a>
        <a className={styles.algiaPart} href="#mission-family" onClick={()=>selectSource('miss')}><strong>miss-</strong><b>送出的歷史詞幹</b><span>過去分詞 missus</span><small>名詞分支的詞幹來源 ↗</small></a>
      </div><div className={styles.anatomyResult}><span aria-hidden="true">↓</span><p>mittere → missus → missio</p><strong><ArchiveWord word="mission" parts={titleParts}/></strong><p>派遣、送出 → 使命、任務</p></div></div>
      <p className={styles.anatomyNote}>mit／miss 是同一拉丁語動詞不同形式留下的詞幹。英文 mission 承接 missio／mission- 的歷史，不是其餘單字的英文母詞。</p>
    </section>
    <section id="mission-family"><small>WORD FAMILY / 詞根延伸</small><h2>Mittere，送出。</h2>
      <div className={styles.missionFamilies}>{missionGroups.map(group=>{const family=familyFor(group);return <details key={group.id} open={group.id==='purpose'} className={styles.familyChapter}>
        <summary><span>{group.title}</span><small>{group.words.length} 個詞</small><span className={styles.expandHint}>展開 ＋</span></summary>
        <CompactFamily {...family} source={source} label={`${group.title} 詞族關係圖`} legend="藍：mit-　琥珀：miss-　薄荷：詞尾" height={group.words.length>4?520:420} memoryTop={28}/>
      </details>;})}</div>
      <p className={styles.anatomyNote}>共 21 個詞；展開各組，點選高亮關聯。分組依現代意義，歷史線可經中間借詞；missionary 經 missionarius，dismissal 經 dismiss + -al。</p>
    </section>
    <section><small>THE STORY / 詞源故事</small><h2>原本，是某個人被派去做一件事。</h2>
      <p>拉丁語 mittere 是送出、派遣、放開，missio 是派遣的行為。宗教、外交與受託任務，都延續了「被派去完成某件事」的意象。</p>
      <p>後來，mission 也能指向一個人願意長久承擔的方向。同族的其他分支，則讓「送」走向不同處境：接納、提交、傳遞，或放開。</p>
      <p>「誰派遣了你？」是字源留下的提問；「誰決定你的使命？」則是哲學延伸。沙特讓我們思考選擇如何塑造自己；法蘭克關注意義與具體處境，也不把人生意義只限於工作。</p>
      <p className={styles.emphasis}>如果沒有人替我們下令，我們想把自己交付給什麼？</p>
    </section>
    <section className={styles.prefixMemory}><small>WORD BUILDING / 構詞記憶</small><h2>從 mit，認出 miss。</h2>
      <div className={styles.comparisonRoutes}>{[['transmit ↔ transmission','傳輸 → 傳輸行為'],['submit ↔ submission','提交、屈服'],['permit ↔ permission','允許 → 許可'],['omit ↔ omission','省略 → 遺漏']].map(([pair,meaning])=><div key={pair}><strong>{pair}</strong><span>{meaning}</span></div>)}</div>
      <p className={styles.anatomyNote}>這是詞族對照，不是每個英文動詞直接加 -ion。前綴提供記憶線索，不能逐字相加推算所有詞義；「想念你」的 miss 另經古英語 missan 而來。</p>
    </section>
    <section className={styles.references}><details><summary>資料來源與閱讀註記 ＋</summary><p>歷史詞幹、現代構詞與語義分組分別處理。哲學段落是閱讀延伸。</p>{missionSources.map(([title,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{title} ↗</a>)}<details><summary>21 個單字的語源索引 ＋</summary>{missionWords.map(item=><a key={item.word} href={`https://www.etymonline.com/word/${item.word}`} target="_blank" rel="noreferrer">{item.word}｜Etymonline ↗</a>)}</details></details></section>
  </article>;
}
