import {forwardRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import clsx from 'clsx';
import lockJournalScroll from './lockJournalScroll';
import {SIGNAL_MAX_LENGTH, SIGNAL_RAW_MAX, TONE_MAX_LENGTH, clampGraphemes, loadOwnTones, saveOwnTone, signalLength, splitGraphemes} from './signalRiver.js';
import SignalText from './SignalText.jsx';
import {PRESET_TONES, toneLabel, useSignalLang} from './signalI18n.js';
import SignalDeleteButton from './SignalDeleteButton.jsx';
import styles from './SignalPager.module.css';

const hasWide = (text) => /[^\x00-\x7F]/.test(text);
const MODEL = {past: 'MT01', today: 'MT02'};
const pad2 = value => String(value).padStart(2, '0');
const clockOf = value => {
  const date = new Date(value);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};
const dayOf = value => {
  const date = new Date(value);
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
};
// Idle pagers now and then light up and replay the last page they got.
const ECHO_MIN_MS = 40_000;
const ECHO_SPREAD_MS = 50_000;
const BROWSE_IDLE_MS = 9000;

// Desktop keyboard layers. `code` mirrors KeyboardEvent.code so physical key
// presses light the matching key; the system IME does the actual typing.
const ZHUYIN = {
  KeyQ: 'ㄆ', KeyW: 'ㄊ', KeyE: 'ㄍ', KeyR: 'ㄐ', KeyT: 'ㄔ', KeyY: 'ㄗ', KeyU: 'ㄧ', KeyI: 'ㄛ', KeyO: 'ㄟ', KeyP: 'ㄣ',
  KeyA: 'ㄇ', KeyS: 'ㄋ', KeyD: 'ㄎ', KeyF: 'ㄑ', KeyG: 'ㄕ', KeyH: 'ㄘ', KeyJ: 'ㄨ', KeyK: 'ㄜ', KeyL: 'ㄠ', Semicolon: 'ㄤ',
  KeyZ: 'ㄈ', KeyX: 'ㄌ', KeyC: 'ㄏ', KeyV: 'ㄒ', KeyB: 'ㄖ', KeyN: 'ㄙ', KeyM: 'ㄩ', Comma: 'ㄝ', Period: 'ㄡ', Slash: 'ㄥ',
  Digit1: 'ㄅ', Digit2: 'ㄉ', Digit3: 'ˇ', Digit4: 'ˋ', Digit5: 'ㄓ', Digit6: 'ˊ', Digit7: '˙', Digit8: 'ㄚ', Digit9: 'ㄞ', Digit0: 'ㄢ', Minus: 'ㄦ',
};
// 日本語: JIS kana layout. 한국어: 두벌식 (2-set) jamo. Both are typed by the
// visitor's own input method; the keys only show where things are.
const KANA = {
  KeyQ: 'た', KeyW: 'て', KeyE: 'い', KeyR: 'す', KeyT: 'か', KeyY: 'ん', KeyU: 'な', KeyI: 'に', KeyO: 'ら', KeyP: 'せ',
  KeyA: 'ち', KeyS: 'と', KeyD: 'し', KeyF: 'は', KeyG: 'き', KeyH: 'く', KeyJ: 'ま', KeyK: 'の', KeyL: 'り', Semicolon: 'れ',
  KeyZ: 'つ', KeyX: 'さ', KeyC: 'そ', KeyV: 'ひ', KeyB: 'こ', KeyN: 'み', KeyM: 'も', Comma: 'ね', Period: 'る', Slash: 'め',
  Digit1: 'ぬ', Digit2: 'ふ', Digit3: 'あ', Digit4: 'う', Digit5: 'え', Digit6: 'お', Digit7: 'や', Digit8: 'ゆ', Digit9: 'よ', Digit0: 'わ', Minus: 'ほ',
};
const HANGUL = {
  KeyQ: 'ㅂ', KeyW: 'ㅈ', KeyE: 'ㄷ', KeyR: 'ㄱ', KeyT: 'ㅅ', KeyY: 'ㅛ', KeyU: 'ㅕ', KeyI: 'ㅑ', KeyO: 'ㅐ', KeyP: 'ㅔ',
  KeyA: 'ㅁ', KeyS: 'ㄴ', KeyD: 'ㅇ', KeyF: 'ㄹ', KeyG: 'ㅎ', KeyH: 'ㅗ', KeyJ: 'ㅓ', KeyK: 'ㅏ', KeyL: 'ㅣ',
  KeyZ: 'ㅋ', KeyX: 'ㅌ', KeyC: 'ㅊ', KeyV: 'ㅍ', KeyB: 'ㅠ', KeyN: 'ㅜ', KeyM: 'ㅡ',
};
// Layers whose letters come from the visitor's input method.
const IME_KEYS = {zh: ZHUYIN, ja: KANA, ko: HANGUL};
// Each BB Call language opens on its own keyboard.
const NATIVE_LAYER = {'zh-Hant': 'zh', ja: 'ja', ko: 'ko', en: 'en', es: 'en', vi: 'en'};
const IME_TOGGLE = {zh: '中', ja: 'あ', ko: '한'};

// Grouped by feeling, so a row reads like one mood: faces, hearts, sky and sea,
// seasons, the city at night, small things in a day, music and hands, little
// signals, then people of every skin tone, creatures, food and the wide world.
const EMOJI = [
  '😊', '🥹', '🙂', '😂', '🥲', '😌', '😴', '🥺', '😮‍💨', '🫠',
  '🤍', '❤️', '🩵', '💙', '🩶', '💛', '🧡', '💜', '💔', '❤️‍🩹',
  '✨', '🌟', '⭐', '🌙', '🌕', '🌌', '☁️', '🌧️', '⛈️', '🌈',
  '🌊', '🐚', '🫧', '🌅', '🌄', '🌸', '🍃', '🍂', '❄️', '🌻',
  '🌃', '🏙️', '🚆', '🚌', '🛵', '🏠', '🪟', '🕯️', '💡', '🛏️',
  '☕', '🍵', '🍜', '🍰', '🍺', '📟', '💬', '✉️', '📷', '📖',
  '🎵', '🎧', '🎸', '🎹', '💭', '🫶', '🙏', '👋', '🤝', '🫂',
  '🔔', '⏳', '🕰️', '🗝️', '🧭', '🎈', '🪐', '🌠', '🐈', '🐕',
  '👋🏻', '👋🏽', '👋🏿', '🫶🏻', '🫶🏽', '🫶🏿', '🙏🏻', '🙏🏽', '🙏🏿', '🤞🏼',
  '🐢', '🐋', '🦋', '🐦', '🦊', '🐼', '🐧', '🦉', '🐌', '🌵',
  '🍙', '🥟', '🍣', '🥐', '🌮', '🍕', '🧋', '🍓', '🍊', '🍉',
  '🌍', '🌏', '🗺️', '✈️', '🧳', '🏔️', '🏝️', '🎐', '🪁', '🧸',
];
const letterRow = (letters) => [...letters].map((ch) => ({label: ch, code: `Key${ch}`}));
const digitRow = [...'1234567890'].map((ch) => ({label: ch, code: `Digit${ch}`}));
const qwertyIme = [
  [...digitRow, {label: '-', code: 'Minus'}],
  letterRow('QWERTYUIOP'),
  [...letterRow('ASDFGHJKL'), {label: ';', code: 'Semicolon'}],
  [...letterRow('ZXCVBNM'), {label: ',', code: 'Comma'}, {label: '.', code: 'Period'}, {label: '/', code: 'Slash'}],
];
const LAYERS = {
  emoji: Array.from({length: EMOJI.length / 10}, (_, index) => EMOJI.slice(index * 10, index * 10 + 10).map(label => ({label}))),
  zh: qwertyIme,
  ja: qwertyIme,
  ko: qwertyIme,
  en: [digitRow, letterRow('QWERTYUIOP'), letterRow('ASDFGHJKL'), letterRow('ZXCVBNM')],
  // Español: the same letters plus ñ.
  es: [digitRow, letterRow('QWERTYUIOP'), [...letterRow('ASDFGHJKL'), {label: 'Ñ'}], letterRow('ZXCVBNM')],
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

// A signal as one LCD line: who, in what tone, then the words.
const pageLine = (t, signal) => `${MODEL[signal.from] || ''} ${toneLabel(t, signal.tone)}：${signal.text}`;

const SignalPager = forwardRef(function SignalPager(
  {
    model,
    gray,
    small,
    lcd,
    led,
    phase,
    signal,
    memory = [],
    echoSignal,
    writeHint,
    replyHint,
    coarse,
    floating,
    busy,
    onRead,
    onCloseSlip,
    onWrite,
    onCancel,
    onRelease,
    onPreviewEnd,
    onSource,
    ownSignal,
    onDeleteOwn,
  },
  ref,
) {
  const {lang, t} = useSignalLang();
  const inputRef = useRef(null);
  const writeRef = useRef(null);
  const sheetRef = useRef(null);
  const browseTimer = useRef(null);
  const buzzTimer = useRef(null);
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);
  const [composition, setComposition] = useState('');
  const nativeLayer = NATIVE_LAYER[lang] || 'zh';
  // Spanish shows its ñ on the letter layer.
  const letterLayer = lang === 'es' ? 'es' : 'en';
  const [layer, setLayer] = useState(nativeLayer);
  const imeLayer = Boolean(IME_KEYS[layer]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [shift, setShift] = useState(false);
  const [litKey, setLitKey] = useState(null);
  const [tone, setTone] = useState('說');
  const [ownTones, setOwnTones] = useState([]);
  const [customTone, setCustomTone] = useState('');
  const [browse, setBrowse] = useState(null);
  const [echo, setEcho] = useState(false);
  const [buzz, setBuzz] = useState(false);
  const isComposeMode = phase === 'compose';
  const sheet = isComposeMode && coarse;
  // A link counts as ten characters, so pasting one never eats the message.
  const count = signalLength(text);
  const tooLong = count > SIGNAL_MAX_LENGTH;
  // While the IME is composing, unconfirmed 注音 is not counted yet.
  const [committedCount, setCommittedCount] = useState(0);

  useEffect(() => setOwnTones(loadOwnTones()), []);
  // Switching the BB Call language switches the keyboard with it.
  useEffect(() => setLayer(nativeLayer === 'en' ? letterLayer : nativeLayer), [nativeLayer, letterLayer]);

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

    // The sheet rests near the top of what is visible: on iOS the keyboard
    // shrinks the visual viewport and may scroll it, so follow its top edge.
    function sync() {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      sheetRef.current?.style.setProperty('--signal-keyboard-inset', `${inset}px`);
      sheetRef.current?.style.setProperty('--signal-viewport-top', `${viewport.offsetTop}px`);
      sheetRef.current?.style.setProperty('--signal-viewport-height', `${viewport.height}px`);
    }

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
    };
  }, [sheet]);

  // A new page makes the whole pager buzz for a moment (and, where phones
  // allow it after a tap, really vibrate).
  // Its timer belongs to the buzz, not to the phase: the page moves on to
  // its preview before the buzz ends, and must not leave it switched on (or
  // the next arrival could not start it again).
  useEffect(() => {
    if (phase !== 'incoming') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.clearTimeout(buzzTimer.current);
    setBuzz(false);
    window.requestAnimationFrame(() => setBuzz(true));
    if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.([90, 60, 90]);
    buzzTimer.current = window.setTimeout(() => setBuzz(false), 1400);
  }, [phase, signal?.id]);
  useEffect(() => () => window.clearTimeout(buzzTimer.current), []);

  // The occasional echo: only while idle, never for reduced motion.
  useEffect(() => {
    if (phase !== 'idle' || !echoSignal || browse !== null) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setTimeout(() => setEcho(true), ECHO_MIN_MS + Math.random() * ECHO_SPREAD_MS);
    return () => window.clearTimeout(timer);
  }, [phase, echoSignal, browse, echo]);
  useEffect(() => { if (phase !== 'idle') setEcho(false); }, [phase]);

  useEffect(() => () => window.clearTimeout(browseTimer.current), []);

  function step(direction) {
    if (!memory.length) return;
    setEcho(false);
    setBrowse(current => {
      if (current === null) return memory.length - 1;
      return Math.min(memory.length - 1, Math.max(0, current + direction));
    });
    window.clearTimeout(browseTimer.current);
    browseTimer.current = window.setTimeout(() => setBrowse(null), BROWSE_IDLE_MS);
  }

  const browsed = browse !== null ? memory[browse] : null;
  const browsing = Boolean(browsed) && !isComposeMode && phase !== 'reading';
  const echoing = echo && !browsing && phase === 'idle' && echoSignal;

  let display = lcd;
  if (browsing) {
    display = {status: `MSG ${browse + 1}/${memory.length}`, clock: clockOf(browsed.writtenAt), marquee: pageLine(t, browsed), loop: true, bars: 5};
  } else if (echoing) {
    display = {status: `${t.lcd.echo} ${dayOf(echoSignal.writtenAt)}`, clock: clockOf(echoSignal.writtenAt), marquee: pageLine(t, echoSignal), bars: 5};
  }
  const lit = browsing || echoing || isComposeMode
    || ['incoming', 'preview', 'waiting', 'reading', 'sent', 'delivered'].includes(phase);

  function startWriting(reply = false) {
    // Focus inside the same click so mobile browsers open the system keyboard.
    flushSync(() => onWrite(reply));
    inputRef.current?.focus({preventScroll: true});
  }

  async function finishWriting(send) {
    if (send && (busy || tooLong)) return;
    const message = text.trim();
    if (send && !message) {
      inputRef.current?.focus();
      return;
    }

    if (send) {
      let saved = false;
      try {
        saved = await onRelease(message, tone);
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
    if (floating) {
      // Back to 訊號光年, which is still open in front of this pager's home.
      window.dispatchEvent(new CustomEvent('mytide:floating-done'));
    } else {
      writeRef.current?.focus({preventScroll: true});
    }
  }

  function lightKey(code) {
    setLitKey(code);
    window.setTimeout(() => setLitKey((current) => (current === code ? null : current)), 160);
  }

  function insert(value) {
    const input = inputRef.current;
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const next = clampGraphemes(text.slice(0, start) + value + text.slice(end), SIGNAL_RAW_MAX);
    setText(next);
    input.focus();
    window.requestAnimationFrame(() => {
      const caret = Math.min(next.length, start + value.length);
      input.setSelectionRange(caret, caret);
    });
  }

  function pressKey(key) {
    lightKey(key.code ?? key.label);
    if (imeLayer) {
      // Typing in any language belongs to the visitor's own input method.
      inputRef.current?.focus();
      return;
    }

    insert((layer === 'en' || layer === 'es') && !shift ? key.label.toLowerCase() : key.label);
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

    const previousCharacter = splitGraphemes(text.slice(0, start)).at(-1) || '';
    const from = start === end ? start - previousCharacter.length : start;
    setText(text.slice(0, from) + text.slice(end));
    input.focus();
    window.requestAnimationFrame(() => input.setSelectionRange(from, from));
  }

  function useCustomTone() {
    const value = clampGraphemes(customTone.replace(/\s+/g, ''), TONE_MAX_LENGTH);
    if (!value) return;
    setOwnTones(current => saveOwnTone(value, current));
    setTone(value);
    setCustomTone('');
    inputRef.current?.focus({preventScroll: true});
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
      } else if (browse !== null) {
        setBrowse(null);
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

  // Where 😊 and 123 return to: the language's own keyboard.
  const home = nativeLayer === 'en' ? letterLayer : nativeLayer;
  const mainIsWide = hasWide(display.main || '');
  const toneChips = [...PRESET_TONES, ...ownTones.filter(own => !PRESET_TONES.includes(own))];
  const tonePicker = (
    <div className={styles.tones} role="group" aria-label={t.pager.tone}>
      <span className={styles.toneLabel}>{t.pager.tone}</span>
      {toneChips.map(item => (
        <button type="button" key={item} className={styles.toneChip} aria-pressed={tone === item}
          data-custom={PRESET_TONES.includes(item) ? undefined : ''} data-tone={item}
          onMouseDown={event => event.preventDefault()} onClick={() => setTone(item)}>
          {toneLabel(t, item)}
        </button>
      ))}
      <span className={styles.toneCustom}>
        <input
          type="text"
          value={customTone}
          placeholder={`＋ ${t.pager.customPlaceholder}`}
          aria-label={`${t.pager.customTone}（${t.pager.toneMax}）`}
          onChange={event => setCustomTone(clampGraphemes(event.target.value.replace(/\s+/g, ''), TONE_MAX_LENGTH))}
          onKeyDown={event => {
            event.stopPropagation();
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); useCustomTone(); }
          }}
        />
        {customTone ? <button type="button" className={styles.toneUse} onClick={useCustomTone}>{t.pager.useTone}</button> : null}
      </span>
    </div>
  );

  return (
    <div
      ref={ref}
      className={clsx(
        styles.pager,
        gray && styles.gray,
        small && styles.small,
        sheet && styles.sheetMode,
        replyHint && styles.replyReady,
        buzz && styles.buzz,
        floating && styles.floating,
      )}
      onKeyDown={handleKeyDown}
      data-phase={phase}
    >
      {sheet ? <div className={styles.sheetBackdrop} onClick={event => { event.stopPropagation(); finishWriting(false); }} aria-hidden="true" /> : null}
      <div ref={sheetRef} className={styles.body} role={sheet ? 'dialog' : undefined}
        aria-modal={sheet ? true : undefined} aria-label={sheet ? t.pager.writeFrom(model) : undefined}>
        <div className={styles.bezel}>
          <div className={clsx(styles.lcd, display.off && styles.lcdOff, lit && styles.lcdLit)}>
            <div className={styles.lcdSub}>
              <Bars count={display.bars ?? 5} />
              <span className={clsx(styles.status, hasWide(display.status || '') && styles.statusWide)}>
                {isComposeMode ? `${tooLong ? '! ' : ''}${committedCount}/${SIGNAL_MAX_LENGTH}` : display.status}
              </span>
              <span className={styles.clock}>{isComposeMode ? '' : display.clock}</span>
              <span className={styles.battery} aria-hidden="true" />
            </div>
            <div className={clsx(styles.lcdMain, mainIsWide && styles.lcdWide, display.big && styles.lcdBig)}>
              <input
                ref={inputRef}
                className={clsx(styles.lcdInput, !isComposeMode && styles.lcdInputIdle)}
                type="text"
                value={text}
                placeholder={t.pager.placeholder}
                enterKeyHint="send"
                inputMode="text"
                autoComplete="off"
                dir="auto"
                aria-label={t.pager.writeLabel}
                aria-hidden={isComposeMode ? undefined : true}
                tabIndex={isComposeMode ? 0 : -1}
                readOnly={!isComposeMode}
                onChange={event => setText(composing ? event.target.value : clampGraphemes(event.target.value, SIGNAL_RAW_MAX))}
                onCompositionStart={() => setComposing(true)}
                onCompositionUpdate={(event) => setComposition(event.data)}
                onCompositionEnd={event => {
                  setText(clampGraphemes(event.currentTarget.value, SIGNAL_RAW_MAX));
                  setComposing(false);
                  setComposition('');
                }}
              />
              {!isComposeMode ? (
                display.marquee ? (
                  <span
                    key={`${display.status}-${display.marquee}`}
                    className={clsx(styles.lcdMarquee, display.loop && styles.lcdMarqueeLoop)}
                    style={{animationDuration: `${Math.max(5, splitGraphemes(display.marquee).length * 0.36)}s`}}
                    onAnimationEnd={() => {
                      if (echoing) setEcho(false);
                      else if (!browsing) onPreviewEnd();
                    }}
                  >
                    {display.marquee}
                  </span>
                ) : (
                  <span className={styles.lcdText}>{display.main}</span>
                )
              ) : null}
            </div>
          </div>
        </div>
        <div className={styles.labelRow} aria-hidden="true">
          <span className={styles.engrave}>MY TIDE · SIGNAL</span>
          <span className={styles.model}>{model}</span>
        </div>
        <div className={styles.controls}>
          {/* The keys sit in a recessed well, like molded keys on a real pager. */}
          <span className={styles.keyWell}>
            <button type="button" className={clsx(styles.pill, styles.arrow)} onClick={() => step(-1)}
              disabled={!memory.length || isComposeMode} aria-label={t.pager.previous}>◀</button>
            <button type="button" className={clsx(styles.pill, styles.arrow)} onClick={() => step(1)}
              disabled={!memory.length || isComposeMode} aria-label={t.pager.next}>▶</button>
            <button
              type="button"
              className={clsx(styles.pill, styles.readButton, phase === 'reading' && styles.pillOn)}
              onClick={() => {
                if (phase === 'reading') { onCloseSlip(); return; }
                const target = browsing ? browsed : null;
                setBrowse(null);
                onRead(target);
              }}
              disabled={!signal && !browsing}
              aria-label={phase === 'reading' ? t.pager.close : t.pager.open}
              aria-expanded={phase === 'reading'}
            >
              <span aria-hidden="true">{t.pager.read}</span>
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
              {t.pager.write}
            </button>
          </span>
          <span className={styles.spacer} />
          <span className={clsx(styles.round, led && styles.roundLit)} aria-hidden="true">
            <span className={styles.led} />
          </span>
        </div>
        {sheet ? tonePicker : null}
        {sheet && emojiOpen ? <div className={styles.emojiPalette} role="group" aria-label={t.pager.emoji}>
          {EMOJI.map(emoji => <button type="button" key={emoji} disabled={composing}
            onMouseDown={event => event.preventDefault()} onClick={() => insert(emoji)} aria-label={t.pager.insert(emoji)}>{emoji}</button>)}
        </div> : null}
        {sheet ? (
          <div className={styles.sheetActions}>
            <button type="button" className={styles.sheetClose} onClick={() => finishWriting(false)}>{t.pager.fold}</button>
            <button type="button" className={styles.sheetClose} aria-label={t.pager.chooseEmoji} aria-expanded={emojiOpen}
              onMouseDown={event => event.preventDefault()} onClick={() => setEmojiOpen(value => !value)}>😊</button>
            <button
              type="button"
              className={styles.release}
              onClick={() => finishWriting(true)}
              disabled={!text.trim() || composing || busy || tooLong}
            >
              {t.pager.release}
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
        <p className={styles.replyCue}>{t.pager.replyCue}</p>
      ) : null}

      {phase === 'reading' && signal ? (
        <div className={styles.slip} role="region" aria-label={t.pager.open}>
          <div className={styles.slipHead}>
            <p className={styles.slipTimes}>
              <span className={styles.slipModel} data-bank={signal.from}>{MODEL[signal.from]}</span>
              {' '}{toneLabel(t, signal.tone)} · {signal.departed === 'today'
                ? t.pager.departedNow
                : t.pager.departedOn(...String(signal.departed).split('-').slice(1))}
            </p>
            {ownSignal ? <SignalDeleteButton writtenAt={ownSignal.writtenAt} onDelete={onDeleteOwn} /> : null}
          </div>
          <p className={styles.slipText} dir="auto">
            <SignalText text={signal.text} links={signal.links} />
            {/* 「出自」 follows the sentence wherever it ends. */}
            {signal.source ? (
              <button type="button" className={styles.slipSource} onClick={() => onSource(signal.source)}>
                —— {t.pager.source(signal.source.title)}
              </button>
            ) : <span className={styles.slipSource}>—— {t.pager.unsigned}</span>}
          </p>
          <div className={styles.slipActions}>
            <button type="button" className={clsx(replyHint && styles.replyButton)} onClick={() => startWriting(true)}>
              {signal.source ? t.pager.leaveWord : t.pager.reply}
            </button>
            <button type="button" className={styles.slipClose} onClick={onCloseSlip}>{t.pager.fold}</button>
          </div>
        </div>
      ) : null}

      {isComposeMode && !coarse ? (
        <div className={styles.keyboard}>
          {tonePicker}
          {imeLayer || lang === 'vi' ? (
            <div className={styles.candidates} aria-live="polite">
              {composition ? <span className={styles.composition}>{composition}</span> : t.pager.imeHint}
            </div>
          ) : null}
          {layer === 'emoji' ? (
            <div className={styles.keyRow}>
              <div className={styles.emojiRows} role="group" aria-label={t.pager.emoji}>
                {LAYERS.emoji.map((row, rowIndex) => (
                  <div className={styles.keyRow} key={`emoji-${rowIndex}`}>
                    {row.map((key) => (
                      <button
                        type="button"
                        tabIndex={-1}
                        key={key.label}
                        className={clsx(styles.key, styles.keyEmoji, litKey === key.label && styles.keyLit)}
                        onClick={() => pressKey(key)}
                      >
                        {key.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <button
                type="button"
                tabIndex={-1}
                className={clsx(styles.key, styles.keyWide, styles.keyTall, litKey === 'Backspace' && styles.keyLit)}
                onClick={backspace}
                aria-label={t.pager.backspace}
              >
                ⌫
              </button>
            </div>
          ) : LAYERS[layer].map((row, rowIndex) => (
            <div className={styles.keyRow} key={`${layer}-${rowIndex}`}>
              {rowIndex === 3 && layer !== 'num' ? (
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
                  {imeLayer && key.code ? (
                    <>
                      <span className={styles.keySub}>{key.label}</span>
                      <span>{IME_KEYS[layer][key.code] || key.label}</span>
                    </>
                  ) : (layer === 'en' || layer === 'es') && !shift ? key.label.toLowerCase() : key.label}
                </button>
              ))}
              {rowIndex === 3 ? (
                <button
                  type="button"
                  tabIndex={-1}
                  className={clsx(styles.key, styles.keyWide, litKey === 'Backspace' && styles.keyLit)}
                  onClick={backspace}
                  aria-label={t.pager.backspace}
                >
                  ⌫
                </button>
              ) : null}
            </div>
          ))}
          <div className={styles.keyRow}>
            <button type="button" className={clsx(styles.key, styles.keyMode, layer === 'emoji' && styles.keyOn)}
              aria-label={t.pager.chooseEmoji} aria-pressed={layer === 'emoji'} onClick={() => setLayer(value => value === 'emoji' ? home : 'emoji')}>😊</button>
            {IME_KEYS[nativeLayer] ? (
              <button
                type="button"
                tabIndex={-1}
                className={clsx(styles.key, styles.keyMode, (layer === nativeLayer || layer === letterLayer) && styles.keyOn)}
                onClick={() => setLayer(layer === nativeLayer ? letterLayer : nativeLayer)}
              >
                {layer === nativeLayer ? IME_TOGGLE[nativeLayer] : 'EN'}
              </button>
            ) : null}
            <button
              type="button"
              tabIndex={-1}
              className={clsx(styles.key, styles.keyMode, layer === 'num' && styles.keyOn)}
              onClick={() => setLayer(layer === 'num' ? home : 'num')}
            >
              123
            </button>
            <button
              type="button"
              tabIndex={-1}
              className={clsx(styles.key, styles.keySpace, litKey === 'Space' && styles.keyLit)}
              onClick={() => (imeLayer ? inputRef.current?.focus() : insert(' '))}
            >
              {imeLayer ? t.pager.spaceIme : t.pager.space}
            </button>
            <button type="button" className={clsx(styles.key, styles.keyMode)} onClick={() => finishWriting(false)}>
              {t.pager.fold}
            </button>
            <button
              type="button"
              className={clsx(styles.key, styles.keyRelease)}
              onClick={() => finishWriting(true)}
              disabled={!text.trim() || composing || busy || tooLong}
            >
              {t.pager.release}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default SignalPager;
