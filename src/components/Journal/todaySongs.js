// 送給『今天』的歌 — one song per day, chosen by the site owner; visitors can
// only choose to listen, and can look back at other days' songs.
//
// Each song plays from one legal source:
// - `youtubeId`: an official upload, played through YouTube's embedded player,
//   which stays visible under the strip as YouTube's terms require; or
// - `src`: a file under static/audio/ the site owner is licensed to publish
//   (e.g. '/audio/song.mp3'). Never upload commercial recordings without permission.
const todaySongs = [
  {
    date: '2026-10-17',
    title: '快高長大',
    artist: '陳奕迅',
    // Official audio from the "Eason Chan - Topic" channel.
    youtubeId: 'RT13ASRl67A',
    src: '',
  },
];

export default todaySongs;
