import React, { useEffect, useRef, useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Starfield from '../Journal/Starfield';
import '../Journal/tokens.css';
import { archive, details, primaryWords } from './archiveData';
import { initialCamera, zoomAt } from './camera.mjs';
import styles from './WordsPage.module.css';
import EnthusiasmArticle, {EnthusiasmColour} from './EnthusiasmArticle';
import TopicArchive from './TopicArchive';
import MissionArticle from './MissionArticle';
import {wordTopics} from './topicData';
const keys = ['nostos', 'algos', 'nostalgia', 'nostalgic', 'algia', 'neuralgia', 'myalgia'];
const positions = [[23, 10], [76, 10], [23, 62], [23, 90], [76, 32], [76, 62], [76, 90]];
const edges = [[0, 2, 'source'], [1, 2, 'source'], [2, 3, 'derived'], [1, 4, 'source'], [4, 2, 'shared'], [4, 5, 'shared'], [4, 6, 'shared']];
function WordColour({word}) {
  const pieces = {
    nostalgia: [['nost','blue'],['algia','amber']],
    nostalgic: [['nost','blue'],['alg','amber'],['ic','']],
    neuralgia: [['neur',''],['algia','amber']],
    myalgia: [['my',''],['algia','amber']],
    nostos: [['nostos','blue']], algos: [['algos','amber']], algia: [['-algia','amber']],
  };
  return <span aria-label={word==='algia'?'-algia':word}>{pieces[word].map(([text,tone],i)=><span key={i} className={tone==='blue'?styles.sourceBlue:tone==='amber'?styles.sourceAmber:undefined}>{text}</span>)}</span>;
}
function Family({source='nostalgia'}) {
  const [selected, select] = useState(source);
  useEffect(()=>select(source),[source]);
  return <div className={styles.family}>
    <div className={styles.network}>
      <span className={styles.sourceLabel}>語源與構詞來源</span>
      <span className={styles.memoryLabel}>記住這些單字</span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([a,b,type])=><line key={`${a}-${b}`} x1={positions[a][0]} y1={positions[a][1]} x2={positions[b][0]} y2={positions[b][1]} className={`${styles[type]} ${keys[a]===selected||keys[b]===selected?styles.activeEdge:''}`}/>)}
      </svg>
      {keys.map((key,i)=><button key={key} style={{left:`${positions[i][0]}%`,top:`${positions[i][1]}%`}} onClick={()=>select(key)} aria-pressed={selected===key} className={`${styles.wordNode} ${['nostos','algos','algia'].includes(key)?styles.sourceNode:styles.memoryNode}`}>
        <WordColour word={key}/><small>{key==='nostos'?'νόστος · 返鄉':key==='algos'?'ἄλγος · 痛苦':key==='algia'?'疼痛構詞成分':details[key].meaning.split(' · ').at(-1)}</small>
      </button>)}
    </div>
    <p className={styles.legend}>藍：返鄉來源　琥珀：痛苦來源<br/>··· 歷史語源　 ─ 直接衍生　 – – 共享構詞</p>
  </div>;
}
function Archive({
  onClose, onOpen, word='nostalgia'
}) {
  const [source, selectSource] = useState('nostalgia');
  const dialog = useRef(null);
  useEffect(() => {
    const keydown = e => {if(e.key==='Escape'){e.preventDefault();onClose();}};
    document.addEventListener('keydown',keydown);
    return ()=>document.removeEventListener('keydown',keydown);
  },[onClose]);
  return <div className={styles.backdrop}>
    <section ref={dialog} className={styles.dialog} role="dialog" aria-modal="false" aria-labelledby="archive-title">
      <header className={styles.dialogBar}><span>WORD ARCHIVE {primaryWords.find(item => item.word === word)?.archive} · 向下捲動閱讀</span><button onClick={onClose} aria-label="關閉展間，返回詞語星圖">收起 ×</button></header>
      <div className={styles.reader} tabIndex="0" aria-label={`${word} 詞源展間內容`}>
        {word === 'mission' ? <MissionArticle onClose={onClose}/> : wordTopics[word] ? <TopicArchive word={word} onOpen={onOpen} onClose={onClose}/> : word==='enthusiasm'?<EnthusiasmArticle/>:<article>
          <header className={styles.archiveHero}><small>Word Archive 001｜意識潮</small><h1 id="archive-title"><WordColour word="nostalgia"/></h1><p>思鄉 · 懷舊 · 對過去的眷戀</p><h2>從一種疾病，<br />到一門販賣過去的生意。</h2></header>
          <section className={styles.anatomy} aria-labelledby="anatomy-title">
            <small>01 / WORD ANATOMY</small>
            <h2 id="anatomy-title">把思鄉，拆成兩種感覺。</h2>
            <div className={styles.anatomyDiagram}>
              <div className={styles.anatomyParts}>
                <a className={styles.nostPart} href="#word-family" onClick={() => selectSource('nostos')}>
                  <strong>nost-</strong><b>返鄉</b><span>νόστος · nostos</span><small>古希臘語 · 歷史詞幹來源 ↗</small>
                </a>
                <a className={styles.algiaPart} href="#word-family" onClick={() => selectSource('algia')}>
                  <strong>-algia</strong><b>痛苦</b><span>ἄλγος · algos</span><small>古希臘語 · 疼痛構詞來源 ↗</small>
                </a>
              </div>
              <div className={styles.anatomyResult}>
                <span aria-hidden="true">↓</span>
                <p><span>返鄉</span> + <span>痛苦</span></p>
                <strong aria-label="nostalgia"><span className={styles.sourceBlue}>nost</span><span className={styles.sourceAmber}>algia</span></strong>
                <p>因渴望回到故鄉而產生的痛苦。</p>
              </div>
            </div>
            <p className={styles.anatomyNote}>1688 年，以 nostos 與 algos 造詞。顏色對應語源；nost- 為歷史詞幹，-algia 為疼痛相關構詞成分。</p>
          </section>
          <section id="word-family"><small>02 / WORD FAMILY</small><h2>從語源，記住單字。</h2><Family source={source}/></section>
          <section className={styles.history}><small>03 / ETYMOLOGY TIMELINE</small><h2>從疾病，到記憶。</h2>
            <div className={styles.timeline}>{archive.timeline.map(item => <details key={item.year} className={styles.historyChapter}>
              <summary><span className={styles.year}>{item.year}</span><span>{item.century.split('｜')[1]}</span><span className={styles.expandHint}>展開 ＋</span></summary>
              <small>{item.en}</small>{item.paragraphs.map(p => <p key={p}>{p}</p>)}<p className={styles.emphasis}>{item.last}</p><aside>{item.note}</aside>
            </details>)}</div>
          </section>
          <section className={styles.references}><details><summary>資料來源與閱讀註記 ＋</summary><p>詞源與歷史依據見下列資料；各時期的轉折句與結尾提問為敘事詮釋，不是學術定義。</p>{archive.sources.map(([title, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{title} ↗</a>)}</details></section>
          <section className={styles.echo}><small>04 / MY TIDE ECHO · 創作者敘事</small><h2>我們如何理解過去？</h2>{archive.echo.map((p, i) => <p key={i}>{p}</p>)}<h2>{archive.ending}</h2><button onClick={onClose}>返回詞語星圖 ↗</button></section>
        </article>}
      </div>
    </section>
  </div>;
}
export default function WordsPage({
  initialArchive = false
}) {
  const home = useBaseUrl('/my-tide');
  const mainUrl = useBaseUrl('/my-tide/words');
  const archiveUrl = useBaseUrl('/my-tide/words/nostalgia');
  const [opened, setOpened] = useState(initialArchive===true?'nostalgia':initialArchive||null);
  const [preview, setPreview] = useState(null);
  const [camera, setCamera] = useState(initialCamera);
  const [size, setSize] = useState({
    width: 1440,
    height: 650
  });
  const viewport = useRef(null);
  const pointers = useRef(new Map());
  const moved = useRef(false);
  const starts = useRef(new Map());
  const hoverTimer = useRef(null);
  const small = size.width <= 700;
  const closeArchive = React.useCallback(() => {
    setOpened(false);
    setPreview(null);
    clearTimeout(hoverTimer.current);
  }, [mainUrl]);
  const openArchive = word => {
    clearTimeout(hoverTimer.current);
    setPreview(null);
    setOpened(word);

  };
  useEffect(() => {
    const pop = () => {const slug=window.location.pathname.replace(/\/$/, '').split('/').at(-1);setOpened(primaryWords.some(item => item.word === slug)?slug:null);};
    window.addEventListener('popstate', pop);
    const resize = new ResizeObserver(([entry]) => setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height
    }));
    resize.observe(viewport.current);
    const wheel = e => {
      e.preventDefault();
      const r = viewport.current.getBoundingClientRect();
      setCamera(c => zoomAt(c, c.scale * Math.exp(-e.deltaY * .0015), {
        x: e.clientX - r.left,
        y: e.clientY - r.top
      }));
      setPreview(null);
    };
    const el = viewport.current;
    el.addEventListener('wheel', wheel, {
      passive: false
    });
    return () => {
      resize.disconnect();
      el.removeEventListener('wheel', wheel);
      window.removeEventListener('popstate', pop);
      clearTimeout(hoverTimer.current);
    };
  }, [archiveUrl]);
  function point(e) {
    const r = viewport.current.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top
    };
  }
  function down(e) {
    if (e.button !== 0) return;
    clearTimeout(hoverTimer.current);
    if (!pointers.current.size) moved.current = false;
    pointers.current.set(e.pointerId, point(e));
    starts.current.set(e.pointerId, point(e));
    if (!e.target.closest('button')) viewport.current.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (!pointers.current.has(e.pointerId)) return;
    const before = [...pointers.current.values()];
    const old = pointers.current.get(e.pointerId),
      next = point(e);
    const start = starts.current.get(e.pointerId);
    if (pointers.current.size > 1 || Math.hypot(next.x - start.x, next.y - start.y) > 5) moved.current = true;
    if (moved.current && !viewport.current.hasPointerCapture(e.pointerId)) viewport.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, next);
    const after = [...pointers.current.values()];
    if (before.length === 2) {
      const distance = p => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const center = p => ({
        x: (p[0].x + p[1].x) / 2,
        y: (p[0].y + p[1].y) / 2
      });
      const a = center(before),
        b = center(after);
      setCamera(c => {
        const z = zoomAt(c, c.scale * distance(after) / Math.max(1, distance(before)), a);
        return {
          ...z,
          x: z.x + b.x - a.x,
          y: z.y + b.y - a.y
        };
      });
    } else setCamera(c => ({
      ...c,
      x: c.x + next.x - old.x,
      y: c.y + next.y - old.y
    }));
    if (moved.current) setPreview(null);
  }
  function up(e) {
    pointers.current.delete(e.pointerId);
    starts.current.delete(e.pointerId);
    if (viewport.current.hasPointerCapture(e.pointerId)) viewport.current.releasePointerCapture(e.pointerId);
  }
  const zoom = factor => setCamera(c => zoomAt(c, c.scale * factor, {
    x: size.width / 2,
    y: size.height / 2
  }));
  return <main className={`journal-scope ${styles.page}`} onPointerDown={e=>{if((opened||preview)&&!e.target.closest('[role="dialog"]')&&!e.target.closest('button'))closeArchive();}}>
    <Head><title>詞語星圖｜意識潮 My Tide</title><meta name="description" content="每個詞，都有來處。探索詞源、詞根與詞綴的宇宙。" /></Head>
    <Starfield className={styles.stars} meteors={false} />
    <nav className={styles.nav}><Link to={home}>← 返回意識潮</Link><span>MY TIDE / WORDS</span></nav>
    <header className={styles.intro}><small>SPATIAL ETYMOLOGY GRAPH</small><div className={styles.titleLine}>
      <span className={styles.originWorld} aria-hidden="true">
        <span className={styles.originOrbitBack} /><span className={styles.originAura} />
        <span className={styles.originSphere}><i className={styles.originContinentOne} /><i className={styles.originContinentTwo} /><i className={styles.originLatitude} /></span>
        <span className={styles.originOrbitFront}><i /></span>
      </span>
      <h1>詞語星圖</h1><span className={styles.currentTheme}>詞源星域 · 人生與日常</span>
    </div><p>每個詞，都有來處。</p></header>
    <div ref={viewport} className={styles.viewport} tabIndex="0" onKeyDown={e => {
      if (e.target !== e.currentTarget) return;
      const directions = {
        ArrowLeft: [40, 0],
        ArrowRight: [-40, 0],
        ArrowUp: [0, 40],
        ArrowDown: [0, -40]
      };
      if (directions[e.key]) {
        e.preventDefault();
        const [x, y] = directions[e.key];
        setCamera(c => ({
          ...c,
          x: c.x + x,
          y: c.y + y
        }));
      }
    }} aria-label="可平移縮放的主詞彙星圖" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className={styles.world} style={{
        transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`
      }}>
        {primaryWords.map(p => <button key={p.word} className={`${styles.planet} ${p.word === 'enthusiasm' ? styles.nextPlanet : ''} ${p.word === 'humble' ? styles.earthPlanet : p.word === 'humidity' ? styles.waterPlanet : p.word === 'mission' ? styles.missionPlanet : ''}`} style={{
          '--planet-x': `${p.desktop[0] * 100}%`,
          '--planet-y': `${p.desktop[1]}px`,
          '--planet-mobile-x': `${p.mobile[0] * 100}%`,
          '--planet-mobile-y': `${p.mobile[1]}px`
        }} aria-label={`${p.word}，${p.status}`} onPointerEnter={e => {
          if (e.pointerType === 'mouse' && !pointers.current.size) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = setTimeout(() => {setOpened(null);setPreview(p.word);}, 200);
          }
        }} onPointerLeave={e => {
          if (e.pointerType === 'mouse') {
            clearTimeout(hoverTimer.current);
            // Keep the reading panel available while moving from planet to text.
          }
        }} onFocus={() => {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(() => {setOpened(null);setPreview(p.word);}, 250);
        }} onClick={event => {
          if (moved.current && event.detail !== 0) return;
          openArchive(p.word);
        }}>
          <span className={styles.orbit} aria-hidden="true" /><span className={styles.sphere} aria-hidden="true" /><span className={styles.orbitFront} aria-hidden="true" />
          <span className={styles.planetText} style={{
            transform: `scale(${1 / Math.max(.65, camera.scale)})`
          }}>{camera.scale > .65 && <small>WORD ARCHIVE {p.archive}</small>}<strong>{p.word==='nostalgia'?<WordColour word="nostalgia"/>:p.word==='enthusiasm'?<EnthusiasmColour/>:p.word}</strong>{camera.scale > .65 && <small>{p.status}</small>}</span>
        </button>)}
      </div>
    </div>
    <footer className={styles.footer}><div><p>詞源 · 詞根 · 詞綴</p><small>{small ? '拖曳移動 · 雙指縮放 · 點選詞彙' : '拖曳平移 · 滾輪縮放 · 懸停探索 · 點擊閱讀'}</small></div><div className={styles.controls}><button onClick={() => zoom(1 / 1.2)} aria-label="縮小星圖">−</button><output aria-live="polite">{Math.round(camera.scale * 100)}%</output><button onClick={() => zoom(1.2)} aria-label="放大星圖">＋</button><button onClick={() => {
          setCamera(initialCamera());
          setPreview(null);
        }}>重置視角</button></div></footer>
    {(opened || preview) && <Archive key={opened||preview} word={opened||preview} onClose={closeArchive} onOpen={openArchive} />}
  </main>;
}
