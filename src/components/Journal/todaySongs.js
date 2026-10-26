// 送給『今天』的歌 — songs chosen by the site owner; visitors can
// only choose to listen, and can look back at other days' songs.
//
// Each song plays from one legal source:
// - `youtubeId`: a site-owner-selected upload, played through YouTube's embedded player,
//   which stays visible under the strip as YouTube's terms require; or
// - `src`: a file under static/audio/ the site owner is licensed to publish
//   (e.g. '/audio/song.mp3'). Never upload commercial recordings without permission.
const todaySongs = [
  {
    date: '2026-10-26',
    title: '全世界失眠',
    artist: 'Eason',
    // Site-owner-selected upload from the "Kou" channel (@kou19).
    youtubeId: 'E6A_cwM7PWY',
    src: '',
  },
  {
    date: '2026-10-25',
    title: 'diminished',
    artist: 'Enno',
    // Official music video from Enno Cheng's own channel (@enno_cheng).
    youtubeId: 'H3pplvE-DO4',
    src: '',
  },
  {
    date: '2026-10-23',
    title: '光',
    artist: '陳粒',
    // Site-owner-selected upload from the "Release - Topic" channel.
    youtubeId: 'w87JelvIevo',
    src: '',
  },
  {
    date: '2026-10-21',
    title: '應該',
    artist: '楊乃文',
    // Official audio from the "楊乃文 - Topic" channel.
    youtubeId: 'ORObi9p1QnE',
    src: '',
  },
  {
    date: '2026-10-18',
    title: '再見莫妮卡',
    artist: '彭席彥 / Franky弗蘭奇',
    // Site-owner-selected lyric video from Dreamer Music.
    youtubeId: '2GcrsVIrYck',
    src: '',
  },
  {
    date: '2026-10-18',
    title: '快高長大',
    artist: '陳奕迅',
    // Official audio from the "Eason Chan - Topic" channel.
    youtubeId: 'RT13ASRl67A',
    src: '',
  },
  {
    date: '2026-10-17',
    title: '五月之戀',
    artist: 'Enno',
    // Home-recorded demo, uploaded to Enno Cheng's own official channel (@enno_cheng).
    youtubeId: '_5dZ38uLEBY',
    src: '',
  },
];

export default todaySongs;
