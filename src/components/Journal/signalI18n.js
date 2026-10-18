// BB Call's own words in the reader's chosen language. Signals themselves are
// never translated: a friend abroad writes in their language and everyone
// reads it as it was sent. The choice lasts for this browser session only;
// every new visit starts in Chinese.
import {createContext, createElement, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const LANGUAGES = [
  {code: 'zh-Hant', label: '中文'},
  {code: 'en', label: 'English'},
  {code: 'ja', label: '日本語'},
  {code: 'ko', label: '한국어'},
  {code: 'es', label: 'Español'},
  {code: 'vi', label: 'Tiếng Việt'},
];
const DEFAULT_LANG = 'zh-Hant';
const STORAGE_KEY = 'mytide.signal.lang';

// The five ready-made tones, stored in Chinese and shown in the reader's language.
export const PRESET_TONES = ['說', '想', '覺得', '希望', '問'];

const STRINGS = {
  'zh-Hant': {
    language: '語言',
    tones: {說: '說', 想: '想', 覺得: '覺得', 希望: '希望', 問: '問'},
    lcd: {
      searching: '收訊中', ok: 'OK', unsigned: '未署名', pressRead: '▸ 按「讀」展開', read: '已收下',
      sent: '訊號已出發', delivered: '已抵達對岸', offline: '儲存未連線', notSent: '訊號尚未送出',
      idle: '收訊中', echo: '↻', empty: '還沒有訊號', newPage: '1 NEW PAGE',
    },
    pager: {
      placeholder: '不需要寫給誰', writeLabel: '寫一則訊號', open: '展開訊號', close: '收起訊號',
      read: '讀', write: '寫訊號', release: '放出', fold: '收起', emoji: '表情符號', chooseEmoji: '選擇表情符號',
      insert: e => `插入 ${e}`, previous: '上一則', next: '下一則', writeFrom: m => `從 ${m} 寫訊號`,
      departedNow: '剛剛出發 · 今天抵達', departedOn: (m, d) => `${m}/${d} 出發 · 今天抵達`,
      source: t => `出自〈${t}〉 ›`, unsigned: '未署名', leaveWord: '留一句話', reply: '回一句',
      replyCue: '↑ 從這台回一句', imeHint: '用你的鍵盤和輸入法寫，任何語言都可以',
      space: '空白', spaceIme: '空白／選字', backspace: '刪除', layerZh: '中', layerEn: '英',
      tone: '語氣', customTone: '自訂語氣', customPlaceholder: '自訂', toneMax: '最多 5 個字', useTone: '用這個',
    },
    river: {
      connecting: '訊號連線中…', offline: '訊號暫時送不出去，請稍後再放一次。',
      local: '訊號只留在這次造訪，重新整理後不會保存。', arrived: '收到一則訊號', delivered: '訊號已抵達對岸',
    },
    years: {
      title: '訊號光年', trigger: n => `訊號光年 · ${n}`, unread: '有新訊號',
      summary: (s, r) => `無名 · 本次相遇 · ${s} 則訊號 · ${r} 句回應`, back: '← 折返',
      empty: '還沒有訊號抵達。光還在走，留一句話也可以。', replies: n => `${n} 句回應`,
      replyFrom: m => `用 BB Call 回一句（從 ${m}）`, now: '現在 ▸', drag: '‹ 拖曳時間河，往過去走',
      today: '今天', timeline: '訊號時間河', expand: '展開回應', collapse: '收起回應', river: '時間河',
    },
    deleteOwn: s => `收回這則訊號（還有 ${s} 秒）`, deleteTitle: '收回這則訊號',
    counter: {online: '在線人次', visits: '造訪人次', views: '瀏覽人次', today: '今日', total: '累計'},
  },
  en: {
    language: 'Language',
    tones: {說: 'says', 想: 'thinks', 覺得: 'feels', 希望: 'hopes', 問: 'asks'},
    lcd: {
      searching: 'SEARCHING', ok: 'OK', unsigned: 'UNSIGNED', pressRead: '▸ PRESS READ', read: 'RECEIVED',
      sent: 'SIGNAL SENT', delivered: 'DELIVERED', offline: 'NO STORAGE', notSent: 'NOT SENT YET',
      idle: 'LISTENING', echo: '↻', empty: 'NO SIGNALS YET', newPage: '1 NEW PAGE',
    },
    pager: {
      placeholder: 'No need to write to anyone', writeLabel: 'Write a signal', open: 'Open signal', close: 'Close signal',
      read: 'Read', write: 'Write', release: 'Send', fold: 'Close', emoji: 'Emoji', chooseEmoji: 'Choose an emoji',
      insert: e => `Insert ${e}`, previous: 'Previous', next: 'Next', writeFrom: m => `Write from ${m}`,
      departedNow: 'Just left · arrived today', departedOn: (m, d) => `Left ${m}/${d} · arrived today`,
      source: t => `from 〈${t}〉 ›`, unsigned: 'Unsigned', leaveWord: 'Leave a line', reply: 'Reply',
      replyCue: '↑ Reply from this one', imeHint: 'Type with your own keyboard, in any language',
      space: 'Space', spaceIme: 'Space', backspace: 'Delete', layerZh: '中', layerEn: 'EN',
      tone: 'Tone', customTone: 'Your own tone', customPlaceholder: 'Your own', toneMax: 'Up to 5 characters', useTone: 'Use',
    },
    river: {
      connecting: 'Connecting…', offline: 'Signals can’t be sent right now. Please try again later.',
      local: 'Signals stay in this visit only and are not kept after reloading.', arrived: 'A signal arrived', delivered: 'Your signal reached the other bank',
    },
    years: {
      title: 'Signal Light-years', trigger: n => `Light-years · ${n}`, unread: 'New signals',
      summary: (s, r) => `Nameless · this encounter · ${s} signals · ${r} replies`, back: '← Back',
      empty: 'No signals have arrived yet. The light is still travelling — you can leave a line.', replies: n => `${n} ${n === 1 ? 'reply' : 'replies'}`,
      replyFrom: m => `Reply with the BB Call (from ${m})`, now: 'Now ▸', drag: '‹ Drag the river back in time',
      today: 'Today', timeline: 'Signal river', expand: 'Show replies', collapse: 'Hide replies', river: 'Time river',
    },
    deleteOwn: s => `Take back this signal (${s}s left)`, deleteTitle: 'Take back this signal',
    counter: {online: 'Online', visits: 'Visits', views: 'Views', today: 'today', total: 'total'},
  },
  ja: {
    language: '言語',
    tones: {說: '言う', 想: '思う', 覺得: '感じる', 希望: '願う', 問: '聞く'},
    lcd: {
      searching: '受信中', ok: 'OK', unsigned: '無署名', pressRead: '▸「読む」で開く', read: '受け取った',
      sent: '送信しました', delivered: '向こう岸に届いた', offline: '保存できません', notSent: 'まだ送れていません',
      idle: '受信中', echo: '↻', empty: 'まだ信号なし', newPage: '1 NEW PAGE',
    },
    pager: {
      placeholder: '誰に宛てなくてもいい', writeLabel: '信号を書く', open: '信号を開く', close: '信号を閉じる',
      read: '読む', write: '書く', release: '送る', fold: '閉じる', emoji: '絵文字', chooseEmoji: '絵文字を選ぶ',
      insert: e => `${e} を入れる`, previous: '前へ', next: '次へ', writeFrom: m => `${m} から書く`,
      departedNow: 'いま出発 · 今日着', departedOn: (m, d) => `${m}/${d} 出発 · 今日着`,
      source: t => `〈${t}〉より ›`, unsigned: '無署名', leaveWord: 'ひとこと残す', reply: '返す',
      replyCue: '↑ この端末から返す', imeHint: '自分のキーボードで、どの言語でも',
      space: 'スペース', spaceIme: 'スペース／変換', backspace: '削除', layerZh: '中', layerEn: '英',
      tone: '語気', customTone: '自分の語気', customPlaceholder: '自由に', toneMax: '5文字まで', useTone: '使う',
    },
    river: {
      connecting: '接続中…', offline: 'いまは送れません。少し後でもう一度。',
      local: '信号はこの訪問のあいだだけ。再読み込みすると消えます。', arrived: '信号がひとつ届いた', delivered: '向こう岸に届いた',
    },
    years: {
      title: '信号光年', trigger: n => `信号光年 · ${n}`, unread: '新しい信号',
      summary: (s, r) => `無名 · 今回の出会い · ${s} 件の信号 · ${r} 件の返事`, back: '← 戻る',
      empty: 'まだ信号は届いていません。光はまだ旅の途中。ひとこと残してもいい。', replies: n => `${n} 件の返事`,
      replyFrom: m => `BB Call で返す（${m} から）`, now: 'いま ▸', drag: '‹ 時間の川をたどって過去へ',
      today: '今日', timeline: '信号の川', expand: '返事を開く', collapse: '返事を閉じる', river: '時間の川',
    },
    deleteOwn: s => `この信号を取り消す（あと ${s} 秒）`, deleteTitle: 'この信号を取り消す',
    counter: {online: 'オンライン', visits: '訪問', views: '閲覧', today: '今日', total: '累計'},
  },
  ko: {
    language: '언어',
    tones: {說: '말해', 想: '생각해', 覺得: '느껴', 希望: '바라', 問: '물어'},
    lcd: {
      searching: '수신 중', ok: 'OK', unsigned: '무서명', pressRead: '▸ 「읽기」로 열기', read: '받았어요',
      sent: '신호 출발', delivered: '건너편 도착', offline: '저장 안 됨', notSent: '아직 못 보냄',
      idle: '수신 중', echo: '↻', empty: '아직 신호 없음', newPage: '1 NEW PAGE',
    },
    pager: {
      placeholder: '누구에게 쓰지 않아도 돼요', writeLabel: '신호 쓰기', open: '신호 열기', close: '신호 닫기',
      read: '읽기', write: '쓰기', release: '보내기', fold: '닫기', emoji: '이모지', chooseEmoji: '이모지 고르기',
      insert: e => `${e} 넣기`, previous: '이전', next: '다음', writeFrom: m => `${m}에서 쓰기`,
      departedNow: '방금 출발 · 오늘 도착', departedOn: (m, d) => `${m}/${d} 출발 · 오늘 도착`,
      source: t => `〈${t}〉에서 ›`, unsigned: '무서명', leaveWord: '한마디 남기기', reply: '답하기',
      replyCue: '↑ 이 기기에서 답하기', imeHint: '내 키보드로, 어떤 언어든 괜찮아요',
      space: '스페이스', spaceIme: '스페이스', backspace: '지우기', layerZh: '中', layerEn: '영',
      tone: '말투', customTone: '나만의 말투', customPlaceholder: '직접 쓰기', toneMax: '5자까지', useTone: '쓰기',
    },
    river: {
      connecting: '연결 중…', offline: '지금은 신호를 보낼 수 없어요. 잠시 후 다시 해 주세요.',
      local: '신호는 이번 방문에만 남고, 새로고침하면 사라져요.', arrived: '신호가 하나 도착했어요', delivered: '신호가 건너편에 도착했어요',
    },
    years: {
      title: '신호 광년', trigger: n => `신호 광년 · ${n}`, unread: '새 신호',
      summary: (s, r) => `무명 · 이번 만남 · 신호 ${s}개 · 답장 ${r}개`, back: '← 돌아가기',
      empty: '아직 도착한 신호가 없어요. 빛은 아직 오는 중이에요. 한마디 남겨도 좋아요.', replies: n => `답장 ${n}개`,
      replyFrom: m => `BB Call로 답하기 (${m}에서)`, now: '지금 ▸', drag: '‹ 시간의 강을 끌어 과거로',
      today: '오늘', timeline: '신호의 강', expand: '답장 열기', collapse: '답장 닫기', river: '시간의 강',
    },
    deleteOwn: s => `이 신호 거두기 (${s}초 남음)`, deleteTitle: '이 신호 거두기',
    counter: {online: '접속', visits: '방문', views: '조회', today: '오늘', total: '누적'},
  },
  es: {
    language: 'Idioma',
    tones: {說: 'dice', 想: 'piensa', 覺得: 'siente', 希望: 'espera', 問: 'pregunta'},
    lcd: {
      searching: 'BUSCANDO', ok: 'OK', unsigned: 'SIN FIRMA', pressRead: '▸ PULSA LEER', read: 'RECIBIDO',
      sent: 'SEÑAL ENVIADA', delivered: 'LLEGÓ', offline: 'SIN GUARDAR', notSent: 'AÚN NO ENVIADA',
      idle: 'ESCUCHANDO', echo: '↻', empty: 'AÚN SIN SEÑALES', newPage: '1 NEW PAGE',
    },
    pager: {
      placeholder: 'No hace falta escribirle a nadie', writeLabel: 'Escribe una señal', open: 'Abrir señal', close: 'Cerrar señal',
      read: 'Leer', write: 'Escribir', release: 'Enviar', fold: 'Cerrar', emoji: 'Emoji', chooseEmoji: 'Elegir emoji',
      insert: e => `Insertar ${e}`, previous: 'Anterior', next: 'Siguiente', writeFrom: m => `Escribir desde ${m}`,
      departedNow: 'Salió ahora · llegó hoy', departedOn: (m, d) => `Salió el ${d}/${m} · llegó hoy`,
      source: t => `de 〈${t}〉 ›`, unsigned: 'Sin firma', leaveWord: 'Deja una línea', reply: 'Responder',
      replyCue: '↑ Responde desde aquí', imeHint: 'Escribe con tu propio teclado, en cualquier idioma',
      space: 'Espacio', spaceIme: 'Espacio', backspace: 'Borrar', layerZh: '中', layerEn: 'EN',
      tone: 'Tono', customTone: 'Tu propio tono', customPlaceholder: 'Tu tono', toneMax: 'Hasta 5 caracteres', useTone: 'Usar',
    },
    river: {
      connecting: 'Conectando…', offline: 'Ahora no se pueden enviar señales. Inténtalo más tarde.',
      local: 'Las señales solo quedan en esta visita y se pierden al recargar.', arrived: 'Llegó una señal', delivered: 'Tu señal llegó a la otra orilla',
    },
    years: {
      title: 'Años luz de señales', trigger: n => `Años luz · ${n}`, unread: 'Señales nuevas',
      summary: (s, r) => `Sin nombre · este encuentro · ${s} señales · ${r} respuestas`, back: '← Volver',
      empty: 'Aún no ha llegado ninguna señal. La luz sigue viajando; puedes dejar una línea.', replies: n => `${n} ${n === 1 ? 'respuesta' : 'respuestas'}`,
      replyFrom: m => `Responder con el BB Call (desde ${m})`, now: 'Ahora ▸', drag: '‹ Arrastra el río hacia el pasado',
      today: 'Hoy', timeline: 'Río de señales', expand: 'Ver respuestas', collapse: 'Ocultar respuestas', river: 'Río del tiempo',
    },
    deleteOwn: s => `Retirar esta señal (quedan ${s} s)`, deleteTitle: 'Retirar esta señal',
    counter: {online: 'En línea', visits: 'Visitas', views: 'Vistas', today: 'hoy', total: 'total'},
  },
  vi: {
    language: 'Ngôn ngữ',
    tones: {說: 'nói', 想: 'nghĩ', 覺得: 'thấy', 希望: 'mong', 問: 'hỏi'},
    lcd: {
      searching: 'ĐANG TÌM', ok: 'OK', unsigned: 'KHÔNG KÝ TÊN', pressRead: '▸ BẤM ĐỌC', read: 'ĐÃ NHẬN',
      sent: 'ĐÃ GỬI', delivered: 'ĐÃ ĐẾN NƠI', offline: 'CHƯA LƯU ĐƯỢC', notSent: 'CHƯA GỬI',
      idle: 'ĐANG NGHE', echo: '↻', empty: 'CHƯA CÓ TÍN HIỆU', newPage: '1 NEW PAGE',
    },
    pager: {
      placeholder: 'Không cần viết cho ai cả', writeLabel: 'Viết một tín hiệu', open: 'Mở tín hiệu', close: 'Đóng tín hiệu',
      read: 'Đọc', write: 'Viết', release: 'Gửi', fold: 'Đóng', emoji: 'Biểu tượng cảm xúc', chooseEmoji: 'Chọn biểu tượng',
      insert: e => `Chèn ${e}`, previous: 'Trước', next: 'Sau', writeFrom: m => `Viết từ ${m}`,
      departedNow: 'Vừa đi · đến hôm nay', departedOn: (m, d) => `Đi ngày ${d}/${m} · đến hôm nay`,
      source: t => `từ 〈${t}〉 ›`, unsigned: 'Không ký tên', leaveWord: 'Để lại một dòng', reply: 'Trả lời',
      replyCue: '↑ Trả lời từ máy này', imeHint: 'Gõ bằng bàn phím của bạn, ngôn ngữ nào cũng được',
      space: 'Dấu cách', spaceIme: 'Dấu cách', backspace: 'Xóa', layerZh: '中', layerEn: 'EN',
      tone: 'Giọng', customTone: 'Giọng của riêng bạn', customPlaceholder: 'Tự viết', toneMax: 'Tối đa 5 ký tự', useTone: 'Dùng',
    },
    river: {
      connecting: 'Đang kết nối…', offline: 'Hiện chưa gửi được tín hiệu. Vui lòng thử lại sau.',
      local: 'Tín hiệu chỉ ở lại trong lần ghé này, tải lại trang sẽ mất.', arrived: 'Có một tín hiệu vừa đến', delivered: 'Tín hiệu đã đến bờ bên kia',
    },
    years: {
      title: 'Năm ánh sáng tín hiệu', trigger: n => `Năm ánh sáng · ${n}`, unread: 'Tín hiệu mới',
      summary: (s, r) => `Vô danh · lần gặp này · ${s} tín hiệu · ${r} lời đáp`, back: '← Quay lại',
      empty: 'Chưa có tín hiệu nào đến. Ánh sáng vẫn đang đi; bạn có thể để lại một dòng.', replies: n => `${n} lời đáp`,
      replyFrom: m => `Trả lời bằng BB Call (từ ${m})`, now: 'Bây giờ ▸', drag: '‹ Kéo dòng sông về quá khứ',
      today: 'Hôm nay', timeline: 'Dòng sông tín hiệu', expand: 'Xem lời đáp', collapse: 'Ẩn lời đáp', river: 'Dòng sông thời gian',
    },
    deleteOwn: s => `Thu hồi tín hiệu này (còn ${s} giây)`, deleteTitle: 'Thu hồi tín hiệu này',
    counter: {online: 'Trực tuyến', visits: 'Lượt ghé', views: 'Lượt xem', today: 'hôm nay', total: 'tổng'},
  },
};

const LangContext = createContext({lang: DEFAULT_LANG, t: STRINGS[DEFAULT_LANG], setLang: () => {}});

export function SignalLangProvider({children}) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved && STRINGS[saved]) setLangState(saved);
    } catch {
      // Storage blocked: stay in Chinese.
    }
  }, []);

  const setLang = useCallback((next) => {
    if (!STRINGS[next]) return;
    setLangState(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice simply lasts until reload.
    }
  }, []);

  const value = useMemo(() => ({lang, t: STRINGS[lang], setLang}), [lang, setLang]);
  return createElement(LangContext.Provider, {value}, children);
}

export const useSignalLang = () => useContext(LangContext);

// A preset tone in the reader's language; a visitor's own tone stays as written.
export const toneLabel = (t, tone) => t.tones[tone || '說'] || tone;
