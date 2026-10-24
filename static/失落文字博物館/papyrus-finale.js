/* Step 8 only. The standalone exhibit supplies its existing React instance. */
window.MyTidePapyrus = {
  createFinale(React) {
    const {createElement: h, useState, useRef, useEffect, useId} = React;
    return function YourPapyrus({w, english, reducedMotion, strokes, setStrokes, onRestart}) {
      const [phase, setPhase] = useState(strokes.length ? 'written' : 'ready');
      const [light, setLight] = useState(false);
      const [completion, setCompletion] = useState(0);
      const [showTime, setShowTime] = useState(false);
      const svg = useRef(null);
      const pointer = useRef(null);
      const clipId = 'papyrus-' + useId().replace(/[^a-zA-Z0-9-]/g, '');
      const rolling = phase === 'rolling' || phase === 'rolled';
      const writing = phase === 'writing';
      const flat = phase === 'ready' || phase === 'written';
      const text = english ? {
        title: 'Your Papyrus', description: 'Every scroll begins with a mark.',
        rolledTitle: 'A Message Across Time', rolledDescription: 'Your words are now part of the scroll.',
        putDown: 'Put it down', roll: 'Roll it up', unroll: 'Unroll',
        time: 'Through Time', paper: 'Your papyrus. Write on the sheet with a finger or mouse.',
        scroll: 'Your rolled papyrus. Unroll it to see your words again.',
      } : {
        title: '你的紙莎草紙', description: '每一卷書，都從一道筆跡開始。',
        rolledTitle: '一封穿越時間的訊息', rolledDescription: '你的文字，如今成了書卷的一部分。',
        putDown: '放下筆', roll: '捲成書卷', unroll: '展開書卷',
        time: '穿越時間', paper: '你的紙莎草紙。用手指或滑鼠在紙上書寫。',
        scroll: '已收捲的紙莎草紙。展開後可以再次看見你的筆跡。',
      };

      // CSS animates the same sheet and ink; only the visible area changes.
      // Reversing direction cancels this completion timer immediately.
      useEffect(() => {
        if (phase !== 'rolling' && phase !== 'unrolling') return;
        const finish = () => setPhase(phase === 'rolling' ? 'rolled' : 'written');
        if (reducedMotion) { finish(); return; }
        const timer = setTimeout(finish, 1400);
        return () => clearTimeout(timer);
      }, [phase, reducedMotion]);

      function point(event) {
        const matrix = svg.current?.getScreenCTM();
        if (!matrix) return null;
        const p = svg.current.createSVGPoint();
        p.x = event.clientX;
        p.y = event.clientY;
        return p.matrixTransform(matrix.inverse());
      }
      function down(event) {
        if (!writing || pointer.current !== null || !event.isPrimary || event.button !== 0) return;
        const p = point(event);
        if (!p || p.x < 84 || p.x > 276 || p.y < 36 || p.y > 204) return;
        event.preventDefault();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        setStrokes(previous => [...previous, [{x: p.x, y: p.y}]]);
      }
      function move(event) {
        if (!writing || pointer.current !== event.pointerId) return;
        const p = point(event);
        if (!p) return;
        const next = {x: Math.max(84, Math.min(276, p.x)), y: Math.max(36, Math.min(204, p.y))};
        setStrokes(previous => previous.map((stroke, i) => i === previous.length - 1 ? [...stroke, next] : stroke));
      }
      function up(event) {
        if (pointer.current !== event.pointerId) return;
        pointer.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }
      function finishWriting() {
        pointer.current = null;
        setPhase(strokes.length ? 'written' : 'ready');
        if (strokes.length) {
          setCompletion(value => value + 1);
          setShowTime(true);
        }
      }
      function erase() {
        setStrokes([]);
        setPhase('writing');
        setShowTime(false);
        pointer.current = null;
      }
      function startWriting() {
        setLight(false);
        setPhase('writing');
        // Bring the sheet clear of the sticky museum bar on small screens.
        svg.current?.scrollIntoView({block: 'center', behavior: 'auto'});
      }
      const button = (label, onClick, options = {}) => h('button', {
        type: 'button', className: 'LostWords_ghostButton', onClick, ...options,
      }, label);
      const fibers = [];
      for (let i = 0; i < 24; i++) fibers.push(h('line', {
        key: 'h' + i, x1: 84, x2: 276, y1: 39 + i * 7, y2: 39 + i * 7 + i % 3 * .6,
        className: 'LostWords_wFiber',
      }));
      for (let i = 0; i < 28; i++) fibers.push(h('line', {
        key: 'v' + i, y1: 36, y2: 204, x1: 87 + i * 6.8, x2: 87 + i * 6.8 + i % 4 * .5,
        className: 'LostWords_wFiberSoft',
      }));
      return h('div', {
        className: 'LostWords_papyrusFinale', 'data-phase': phase,
        'data-reduced-motion': reducedMotion ? 'true' : 'false',
      },
        h('div', {className: 'LostWords_unrollStageWrap LostWords_workStage'},
          h('svg', {
            ref: svg, viewBox: '0 0 360 240', className: 'LostWords_workSvg',
            role: 'img', 'aria-label': rolling ? text.scroll : text.paper,
            style: {touchAction: writing ? 'none' : 'pan-y', cursor: writing ? 'crosshair' : 'auto'},
            onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up,
          },
            h('defs', null,
              h('clipPath', {id: clipId}, h('rect', {
                x: 84, y: 36, width: 192, height: 168, className: 'LostWords_papyrusReveal',
              })),
              h('linearGradient', {id: clipId + '-roll', x1: 0, x2: 1},
                h('stop', {offset: '0', stopColor: 'var(--journal-museum-papyrus-deep)'}),
                h('stop', {offset: '.45', stopColor: 'var(--journal-museum-papyrus)'}),
                h('stop', {offset: '1', stopColor: 'var(--journal-museum-papyrus-deep)'}))),
            h('rect', {width: 360, height: 240, className: light ? 'LostWords_wLightBox' : 'LostWords_wTable'}),
            h('g', {clipPath: `url(#${clipId})`, className: light ? 'LostWords_wSheetLit' : undefined},
              h('rect', {x: 84, y: 36, width: 192, height: 168, fill: 'var(--journal-museum-papyrus)'}),
              ...fibers,
              ...strokes.map((stroke, i) => stroke.length === 1 ? h('circle', {
                key: 'ink' + i, cx: stroke[0].x, cy: stroke[0].y, r: 1.2,
                fill: 'var(--journal-museum-glyph)', 'data-ink': true,
              }) : h('polyline', {
                key: 'ink' + i, points: stroke.map(p => `${p.x},${p.y}`).join(' '),
                className: 'LostWords_wInk', 'data-ink': true,
              }))),
            h('g', {className: 'LostWords_papyrusRoll', 'aria-hidden': true},
              h('rect', {x: 264, y: 33, width: 24, height: 174, rx: 10, fill: `url(#${clipId}-roll)`}),
              h('ellipse', {cx: 276, cy: 35, rx: 12, ry: 4, fill: 'var(--journal-museum-papyrus-deep)'}),
              h('ellipse', {cx: 276, cy: 35, rx: 7, ry: 2, fill: 'var(--journal-museum-glyph)'})),
            h('text', {x: 10, y: 232, className: 'LostWords_uTag'}, w.tag))),
        h('div', {className: 'LostWords_stageCard', 'aria-live': 'polite'},
          h('p', {className: 'LostWords_stageTime'}, w.stepOf(8, 8)),
          h('p', {className: 'LostWords_stageTitle'}, phase === 'rolled' ? text.rolledTitle : text.title),
          h('p', null, phase === 'rolled' ? text.rolledDescription : text.description),
          writing ? h('p', {className: 'LostWords_stageNote'}, w.writingHint) : null),
        h('div', {className: 'LostWords_unrollButtons LostWords_workButtons'},
          writing ? button(text.putDown, finishWriting, {className: 'LostWords_enterButton'}) : null,
          flat ? button(w.write, startWriting) : null,
          phase === 'written' || phase === 'unrolling' ? button(text.roll, () => {
            setLight(false); setPhase('rolling');
          }, {className: 'LostWords_enterButton'}) : null,
          rolling ? button(text.unroll, () => setPhase('unrolling'), {className: 'LostWords_enterButton'}) : null,
          flat ? button(light ? w.lightOff : w.light, () => setLight(value => !value), {'aria-pressed': light}) : null,
          strokes.length && !rolling && phase !== 'unrolling' ? button(w.clear, erase) : null,
          button(w.again, onRestart)),
        showTime ? h('aside', {
          key: completion, className: 'LostWords_throughTime', role: 'status',
        }, h('p', {className: 'LostWords_kicker'}, text.time), h('p', null, w.closing)) : null,
        h('p', {className: 'LostWords_stageNote'}, w.steps[7].fact));
    };
  },
};
