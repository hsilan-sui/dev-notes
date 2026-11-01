import React, {useState} from 'react';
import {enthusiasm} from './enthusiasmData';
import styles from './WordsPage.module.css';
import PrefixMemory from './PrefixMemory';

import TheosFamily, {EnthusiasmColour} from './TheosFamily';
export {EnthusiasmColour} from './TheosFamily';

export default function EnthusiasmArticle() {
  const [selected,setSelected]=useState('theos');
  return <article>
    <header className={`${styles.archiveHero} ${styles.enthusiasmHero}`}><small>Word Archive 002｜意識潮</small><h1 id="archive-title"><EnthusiasmColour/></h1><h2>當神住進人的心裡</h2><p>一個關於熱情、神靈與靈感的詞源故事</p></header>
    <section className={styles.anatomy} aria-labelledby="enthusiasm-anatomy">
      <small>WORD ANATOMY / 神在裡面</small><h2 id="enthusiasm-anatomy">在裡面 ＋ 神</h2>
      <div className={styles.anatomyDiagram}>
        <div className={styles.anatomyParts}>
          <a className={styles.nostPart} href="#theos-family" onClick={()=>setSelected('en')}><strong>en</strong><b>在裡面</b><span>ἐν · en</span><small>希臘語構詞來源 ↗</small></a>
          <a className={styles.algiaPart} href="#theos-family" onClick={()=>setSelected('theos')}><strong>theos</strong><b>神</b><span>θεός · theos</span><small>希臘語名詞來源 ↗</small></a>
        </div>
        <div className={styles.nominalisation}><strong>-asmos <span>／ 名詞化</span></strong><small>希臘語尾部形式 · 動作、狀態</small></div>
        <div className={styles.anatomyResult}><span aria-hidden="true">↓</span><p><span>en</span> + <span>theos</span> → entheos</p><strong><EnthusiasmColour/></strong><p>一個人的內在，彷彿有神靈進駐。</p></div>
      </div>
      <p className={styles.anatomyNote}>entheos → enthousiazein（受神感召）→ enthousiasmos → enthusiasm。-asmos 是此處希臘語動詞名詞化的尾部形式：可理解為動作或狀態；更細的分析涉及 -mos，不是現代英文可自由拼接的 -asmos。</p>
    </section>
    <section id="theos-family"><small>WORD FAMILY / 詞根延伸</small><h2>Theos，神</h2>
      <TheosFamily source={selected}/>
      <p className={styles.anatomyNote}>共享 theos 不代表彼此直接衍生。-ism、-logy、-ic 是構詞提示；字母配色協助辨識，不省略借詞與歷史變化。</p>
    </section>
    <section><small>THE STORY / 詞源故事</small><h2>從神的感召，到自己的熱情。</h2>
      {enthusiasm.story.map((p,i)=><p key={i}>{p}</p>)}
      <blockquote>Success is going from failure to failure without losing enthusiasm.</blockquote>
      <p>成功，是經歷一次又一次失敗，仍不失去熱情。</p>
      <aside>這句話常被歸給邱吉爾，但缺乏可靠原始出處；不作為他的確證引言。</aside>
      <p>古老的 enthusiasm 描述神聖力量進入人的內在；這句現代格言，則把它放在失敗之後——事情沒有照預期發生，我們卻仍願意再試一次。</p>
      <p>從神聖感召，到日常熱愛，一個單字留下了人類理解自身力量的變化。</p>
      <p className={styles.emphasis}>以前，人們問：是什麼力量進入了我？<br/>如今，我們也問：經歷挫折以後，我還想為什麼留下來？</p>
    </section>
    <PrefixMemory/>
    <section className={styles.references}><details><summary>資料來源與閱讀註記 ＋</summary><p>正文綜合創作者文案整理；字首組合為記憶提示，不代表每個借詞都在現代英文中直接拼造。</p><a href="https://www.etymonline.com/search?q=enthusiasm" target="_blank" rel="noreferrer">Enthusiasm 與希臘語源｜Etymonline ↗</a><a href="https://classics.mit.edu/Plato/ion.html" target="_blank" rel="noreferrer">Plato《Ion》｜MIT Internet Classics Archive ↗</a><a href="https://winstonchurchill.org/resources/quotes/quotes-falsely-attributed/" target="_blank" rel="noreferrer">引言查核｜International Churchill Society ↗</a><a href="https://www.merriam-webster.com/dictionary/animism" target="_blank" rel="noreferrer">Animism 的拉丁語來源｜Merriam-Webster ↗</a><a href="https://en.wiktionary.org/wiki/ἐνθουσιασμός" target="_blank" rel="noreferrer">Enthousiasmos 名詞化分析｜Wiktionary ↗</a><a href="https://www.etymonline.com/word/-ism" target="_blank" rel="noreferrer">-ism 構詞｜Etymonline ↗</a><a href="https://www.etymonline.com/word/-logy" target="_blank" rel="noreferrer">-logy 構詞｜Etymonline ↗</a><a href="https://www.etymonline.com/word/-ic" target="_blank" rel="noreferrer">-ic 構詞｜Etymonline ↗</a><a href="https://pressbooks.bccampus.ca/greeklatinroots2/chapter/%C2%A7131-an-approach-to-greek-prefixes/" target="_blank" rel="noreferrer">希臘語字首與 a-／an-｜Greek and Latin Roots ↗</a><a href="https://www.etymonline.com/word/theo-" target="_blank" rel="noreferrer">Theos 語源家族｜Etymonline ↗</a></details></section>
  </article>;
}
