import {forwardRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import clsx from 'clsx';
import lockJournalScroll from './lockJournalScroll';
import {SIGNAL_MAX_LENGTH} from './signalRiver.js';
import styles from './SignalPager.module.css';

const hasCjk = (text) => /[^\x00-\x7F]/.test(text);

// Desktop keyboard layers. `code` mirrors KeyboardEvent.code so physical key
// presses light the matching key; the system IME does the actual typing.
const ZHUYIN = {
  KeyQ: 'ㄆ', KeyW: 'ㄊ', KeyE: 'ㄍ', KeyR: 'ㄐ', KeyT: 'ㄔ', KeyY: 'ㄗ', KeyU: 'ㄧ', KeyI: 'ㄛ', KeyO: 'ㄟ', KeyP: 'ㄣ',
  KeyA: 'ㄇ', KeyS: 'ㄋ', KeyD: 'ㄎ', KeyF: 'ㄑ', KeyG: 'ㄕ', KeyH: 'ㄘ', KeyJ: 'ㄨ', KeyK: 'ㄜ', KeyL: 'ㄠ', Semicolon: 'ㄤ',
  KeyZ: 'ㄈ', KeyX: 'ㄌ', KeyC: 'ㄏ', KeyV: 'ㄒ', KeyB: 'ㄖ', KeyN: 'ㄙ', KeyM: 'ㄩ', Comma: 'ㄝ', Period: 'ㄡ', Slash: 'ㄥ',
  Digit1: 'ㄅ', Digit2: 'ㄉ', Digit3: 'ˇ', Digit4: 'ˋ', Digit5: 'ㄓ', Digit6: 'ˊ', Digit7: '˙', Digit8: 'ㄚ', Digit9: 'ㄞ', Digit0: 'ㄢ', Minus: 'ㄦ',
};
const EMOJI = ['😊', '🥹', '🙂', '😂', '🤍', '❤️', '✨', '🌟', '🌙', '🌊', '📟', '💬', '🚆', '🏠', '☕', '🌃', '🌅', '🌧️', '🌸', '🍃', '🎵', '💭', '🙏', '👋'];
const letterRow = (letters) => [...letters].map((ch) => ({label: ch, code: `Key${ch}`}));
const digitRow = [...'1234567890'].map((ch) => ({label: ch, code: `Digit${ch}`}));
const LAYERS = {
  emoji: Array.from({length: 4}, (_, index) => EMOJI.slice(index * 6, index * 6 + 6).map(label => ({label}))),
  zh: [
    [...digitRow, {label: '-', code: 'Minus'}],
    letterRow('QWERTYUIOP'),
    [...letterRow('ASDFGHJKL'), {label: ';', code: 'Semicolon'}],
    [...letterRow('ZXCVBNM'), {label: ',', code: 'Comma'}, {label: '.', code: 'Period'}, {label: '/', code: 'Slash'}],
  ],
  en: [digitRow, letterRow('QWERTYUIOP'), letterRow('ASDFGHJKL'), letterRow('ZXCVBNM')],
  num: [
    digitRow,
    [...'，。？！、：；'].map((label) => ({label})).concat({label: '……'}),
    [...'「」『』（）—～'].map((label) => ({label})),
    [...'·♪♡☆'].map((label) => ({label})),
  ],
};

function Bars({count}) {
  return (
    <span className={styles.bars} aria-hidden="true">
      {Array.from({length: 5}, (_, i) => (
        <span key={i} className={clsx(styles.bar, i < count && styles.barOn)} />
      ))}
    </span>
  );
}

function formatDeparted(dayKey) {
  if (dayKey === 'today') {
    return '剛剛出發 · 今天抵達';
  }
  const [, month, day] = dayKey.split('-');
  return `${month}/${day} 出發 · 今天抵達`;
}

const SignalPager = forwardRef(function SignalPager(
  {
    model,
    gray,
    small,
    lcd,
    led,
    phase,
    signal,
    writeHint,
    replyHint,
    coarse,
    busy,
    onRead,
    onCloseSlip,
    onWrite,
    onCancel,
    onRelease,
    onPreviewEnd,
    onSource,
  },
  ref,
) {
  const inputRef = useRef(null);
  const writeRef = useRef(null);
  const sheetRef = useRef(null);
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);
  const [composition, setComposition] = useState('');
  const [layer, setLayer] = useState('zh');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [shift, setShift] = useState(false);
  const [litKey, setLitKey] = useState(null);
  const isComposeMode = phase === 'compose';
  const sheet = isComposeMode && coarse;
  const count = Array.from(text).length;
  // While the IME is composing, unconfirmed 注音 is not counted yet.
  const [committedCount, setCommittedCount] = useState(0);

  useEffect(() => {
    if (!composing) {
      setCommittedCount(count);
    }
  }, [composing, count]);

  useLayoutEffect(() => {
    if (sheet) return lockJournalScroll();
    return undefined;
  }, [sheet]);

  // Keep the visible sheet above the on-screen keyboard (mobile).
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!sheet || !viewport) {
      return undefined;
    }

    function sync() {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      sheetRef.current?.style.setProperty('--signal-keyboard-inset', `${inset}px`);
    }

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
    };
  }, [sheet]);

  function startWriting(reply = false) {
    // Focus inside the same click so mobile browsers open the system keyboard.
    flushSync(() => onWrite(reply));
    inputRef.current?.focus({preventScroll: true});
  }

  async function finishWriting(send) {
    if (send && busy) return;
    const message = text.trim();
    if (send && !message) {
      inputRef.current?.focus();
      return;
    }

    if (send) {
      let saved = false;
      try {
        saved = await onRelease(message);
      } catch {
        saved = false;
      }
      if (!saved) {
        inputRef.current?.focus({preventScroll: true});
        return;
      }
    }

    setText('');
    setComposition('');
    setEmojiOpen(false);
    inputRef.current?.blur();
    if (!send) flushSync(onCancel);
    writeRef.current?.focus({preventScroll: true});
  }

  function lightKey(code) {
    setLitKey(code);
    window.setTimeout(() => setLitKey((current) => (current === code ? null : current)), 160);
  }

  function insert(value) {
    const input = inputRef.current;
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const next = Array.from(text.slice(0, start) + value + text.slice(end)).slice(0, SIGNAL_MAX_LENGTH).join('');
    setText(next);
    input.focus();
    window.requestAnimationFrame(() => {
      const caret = Math.min(next.length, start + value.length);
      input.setSelectionRange(caret, caret);
    });
  }

  function pressKey(key) {
    lightKey(key.code ?? key.label);
    if (layer === 'zh') {
      // 注音 composition belongs to the visitor's own input method.
      inputRef.current?.focus();
      return;
    }

    insert(layer === 'en' && !shift ? key.label.toLowerCase() : key.label);
    setShift(false);
  }

  function backspace() {
    const input = inputRef.current;
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    if (start === end && start === 0) {
      input.focus();
      return;
    }

    const previousCharacter = Array.from(text.slice(0, start)).at(-1) || '';
    const from = start === end ? start - previousCharacter.length : start;
    setText(text.slice(0, from) + text.slice(end));
    input.focus();
    window.requestAnimationFrame(() => input.setSelectionRange(from, from));
  }

  function handleKeyDown(event) {
    if (isComposeMode) event.stopPropagation();
    if (sheet && event.key === 'Tab') {
      const fields = Array.from(sheetRef.current.querySelectorAll('input:not([readonly]), button:not(:disabled)'));
      const first = fields[0], last = fields.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (isComposeMode) {
        finishWriting(false);
      } else if (phase === 'reading') {
        onCloseSlip();
      }
      return;
    }

    if (!isComposeMode || event.target !== inputRef.current) {
      return;
    }

    lightKey(event.code === 'Space' ? 'Space' : event.code);
    if (event.key === 'Enter' && !composing && !event.nativeEvent.isComposing) {
      event.preventDefault();
      finishWriting(true);
    }
  }

  const lcdIsCjk = hasCjk(lcd.main || '');

  return (
    <div
      ref={ref}
      className={clsx(
        styles.pager,
        gray && styles.gray,
        small && styles.small,
        sheet && styles.sheetMode,
        replyHint && styles.replyReady,
      )}
      onKeyDown={handleKeyDown}
      data-phase={phase}
    >
      {sheet ? <div className={styles.sheetBackdrop} onClick={event => { event.stopPropagation(); finishWriting(false); }} aria-hidden="true" /> : null}
      <div ref={sheetRef} className={styles.body} role={sheet ? 'dialog' : undefined}
        aria-modal={sheet ? true : undefined} aria-label={sheet ? `從 ${model} 寫訊號` : undefined}>
        <div className={styles.bezel}>
          <div className={clsx(styles.lcd, lcd.off && styles.lcdOff)}>
            <div className={clsx(styles.lcdMain, lcdIsCjk && styles.lcdCjk)}>
              <input
                ref={inputRef}
                className={clsx(styles.lcdInput, !isComposeMode && styles.lcdInputIdle)}
                type="text"
                value={text}
                placeholder="不需要寫給誰"
                enterKeyHint="send"
                inputMode="text"
                autoComplete="off"
                aria-label="寫一則訊號"
                aria-hidden={isComposeMode ? undefined : true}
                tabIndex={isComposeMode ? 0 : -1}
                readOnly={!isComposeMode}
                onChange={event => setText(composing ? event.target.value : Array.from(event.target.value).slice(0, SIGNAL_MAX_LENGTH).join(''))}
                onCompositionStart={() => setComposing(true)}
                onCompositionUpdate={(event) => setComposition(event.data)}
                onCompositionEnd={event => {
                  setText(Array.from(event.currentTarget.value).slice(0, SIGNAL_MAX_LENGTH).join(''));
                  setComposing(false);
                  setComposition('');
                }}
              />
              {!isComposeMode ? (
                lcd.marquee ? (
                  <span
                    className={styles.lcdMarquee}
                    style={{animationDuration: `${Math.max(4, Array.from(lcd.marquee).length * 0.34)}s`}}
                    onAnimationEnd={onPreviewEnd}
                  >
                    {lcd.marquee}
                  </span>
                ) : (
                  <span className={styles.lcdText}>{lcd.main}</span>
                )
              ) : null}
            </div>
            <div className={styles.lcdSub}>
              <Bars count={lcd.bars ?? 5} />
              <span className={clsx(hasCjk(lcd.sub || '') && styles.subCjk)}>
                {isComposeMode ? `${committedCount}/${SIGNAL_MAX_LENGTH}` : lcd.sub}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.labelRow} aria-hidden="true">
          <span className={styles.engrave}>MY TIDE · SIGNAL</span>
          <span className={styles.model}>{model}</span>
        </div>
        <div className={styles.controls}>
          {/* The two keys sit in a recessed well, like molded keys on a real pager. */}
          <span className={styles.keyWell}>
            <button
              type="button"
              className={clsx(styles.pill, styles.readButton, phase === 'reading' && styles.pillOn)}
              onClick={phase === 'reading' ? onCloseSlip : onRead}
              disabled={!signal}
              aria-label={phase === 'reading' ? '收起訊號' : '展開訊號'}
              aria-expanded={phase === 'reading'}
            >
              <svg className={styles.keyIcon} viewBox="0 0 10 10" aria-hidden="true">
                <path d="M3 7 7 3M4 3h3v3" />
              </svg>
              <span aria-hidden="true">讀</span>
            </button>
            <button
              ref={writeRef}
              type="button"
              className={clsx(styles.pill, styles.writeButton, writeHint && styles.pillHint, isComposeMode && styles.pillOn)}
              onClick={isComposeMode ? () => finishWriting(false) : () => startWriting(false)}
              aria-expanded={isComposeMode}
            >
              <svg className={styles.keyIcon} viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 8l.6-2.2L7 1.4 8.6 3 4.2 7.4z" />
              </svg>
              寫訊號
            </button>
          </span>
          <span className={styles.spacer} />
          <span className={clsx(styles.round, led && styles.roundLit)} aria-hidden="true">
            <span className={styles.led} />
          </span>
        </div>
        {sheet && emojiOpen ? <div className={styles.emojiPalette} role="group" aria-label="表情符號">
          {EMOJI.map(emoji => <button type="button" key={emoji} disabled={composing}
            onMouseDown={event => event.preventDefault()} onClick={() => insert(emoji)} aria-label={`插入 ${emoji}`}>{emoji}</button>)}
        </div> : null}
        {sheet ? (
          <div className={styles.sheetActions}>
            <button type="button" className={styles.sheetClose} onClick={() => finishWriting(false)}>收起</button>
            <button type="button" className={styles.sheetClose} aria-label="選擇表情符號" aria-expanded={emojiOpen}
              onMouseDown={event => event.preventDefault()} onClick={() => setEmojiOpen(value => !value)}>😊</button>
            <button
              type="button"
              className={styles.release}
              onClick={() => finishWriting(true)}
              disabled={!text.trim() || composing || busy}
            >
              放出
            </button>
          </div>
        ) : null}
      </div>
      <span className={styles.grips} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>

      {replyHint && phase !== 'reading' ? (
        <p className={styles.replyCue}>↑ 從這台回一句</p>
      ) : null}

      {phase === 'reading' && signal ? (
        <div className={styles.slip} role="region" aria-label="收到的訊號">
          <p className={styles.slipTimes}>{formatDeparted(signal.departed)}</p>
          <p className={styles.slipText}>{signal.text}</p>
          {signal.source ? (
            <button type="button" className={styles.slipSource} onClick={() => onSource(signal.source)}>
              —— 出自〈{signal.source.title}〉 ›
            </button>
          ) : (
            <p className={styles.slipSource}>—— 未署名</p>
          )}
          <div className={styles.slipActions}>
            <button type="button" className={clsx(replyHint && styles.replyButton)} onClick={() => startWriting(true)}>
              {signal.source ? '留一句話' : '回一句'}
            </button>
            <button type="button" className={styles.slipClose} onClick={onCloseSlip}>收起</button>
          </div>
        </div>
      ) : null}

      {isComposeMode && !coarse ? (
        <div className={styles.keyboard}>
          {layer === 'zh' ? (
            <div className={styles.candidates} aria-live="polite">
              {composition ? <span className={styles.composition}>{composition}</span> : '注音請用鍵盤輸入，選字交給你的輸入法'}
            </div>
          ) : null}
          {LAYERS[layer].map((row, rowIndex) => (
            <div className={styles.keyRow} key={`${layer}-${rowIndex}`}>
              {rowIndex === 3 && (layer === 'zh' || layer === 'en') ? (
                <button
                  type="button"
                  tabIndex={-1}
                  className={clsx(styles.key, styles.keyWide, shift && styles.keyOn)}
                  onClick={() => setShift((value) => !value)}
                  aria-label="Shift"
                >
                  ⇧
                </button>
              ) : null}
              {row.map((key) => (
                <button
                  type="button"
                  tabIndex={-1}
                  key={key.label}
                  className={clsx(styles.key, litKey === (key.code ?? key.label) && styles.keyLit)}
                  onClick={() => pressKey(key)}
                >
                  {layer === 'zh' && key.code ? (
                    <>
                      <span className={styles.keySub}>{key.label}</span>
                      <span>{ZHUYIN[key.code]}</span>
                    </>
                  ) : layer === 'en' && !shift ? key.label.toLowerCase() : key.label}
                </button>
              ))}
              {rowIndex === 3 ? (
                <button
                  type="button"
                  tabIndex={-1}
                  className={clsx(styles.key, styles.keyWide, litKey === 'Backspace' && styles.keyLit)}
                  onClick={backspace}
                  aria-label="刪除"
                >
                  ⌫
                </button>
              ) : null}
            </div>
          ))}
          <div className={styles.keyRow}>
            <button type="button" className={clsx(styles.key, styles.keyMode, layer === 'emoji' && styles.keyOn)}
              aria-label="切換表情符號鍵盤" aria-pressed={layer === 'emoji'} onClick={() => setLayer(value => value === 'emoji' ? 'zh' : 'emoji')}>😊</button>
            <button
              type="button"
              tabIndex={-1}
              className={clsx(styles.key, styles.keyMode, (layer === 'zh' || layer === 'en') && styles.keyOn)}
              onClick={() => setLayer(layer === 'zh' ? 'en' : 'zh')}
            >
              {layer === 'en' ? '英' : '中'}
            </button>
            <button
              type="button"
              tabIndex={-1}
              className={clsx(styles.key, styles.keyMode, layer === 'num' && styles.keyOn)}
              onClick={() => setLayer(layer === 'num' ? 'zh' : 'num')}
            >
              123
            </button>
            <button
              type="button"
              tabIndex={-1}
              className={clsx(styles.key, styles.keySpace, litKey === 'Space' && styles.keyLit)}
              onClick={() => (layer === 'zh' ? inputRef.current?.focus() : insert(' '))}
            >
              {layer === 'zh' ? '空白／選字' : '空白'}
            </button>
            <button type="button" className={clsx(styles.key, styles.keyMode)} onClick={() => finishWriting(false)}>
              收起
            </button>
            <button
              type="button"
              className={clsx(styles.key, styles.keyRelease)}
              onClick={() => finishWriting(true)}
              disabled={!text.trim() || composing || busy}
            >
              放出
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default SignalPager;
