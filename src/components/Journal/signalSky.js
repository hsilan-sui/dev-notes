// The sky behind 訊號光年: each signal sits on the colour of the hour it was
// sent — a rose dawn, blue sky from half past seven, an amber-to-rose dusk,
// and a deep blue night with stars. Hours are the reader's local time.
const STOPS = [
  [0, '#161C36'],
  [3.6, '#1E2645'],
  [4.6, '#3A4270'],
  [5.3, '#8E87A8'],
  [5.9, '#D9B8B4'],
  [6.8, '#CFD6E6'],
  [7.5, '#BFD9EE'],
  [10, '#A9CDEB'],
  [12.5, '#9FC7EA'],
  [15.5, '#ABCDE8'],
  [16.7, '#C4D3E2'],
  [17.4, '#E9CDB0'],
  [17.9, '#ECB487'],
  [18.3, '#DE9A86'],
  [18.8, '#B2899A'],
  [19.4, '#6E6A8E'],
  [20, '#3A4270'],
  [21, '#232B52'],
  [22.5, '#181F3D'],
  [24, '#161C36'],
];

const rgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));

export function hourOf(time) {
  const date = new Date(time);
  return date.getHours() + date.getMinutes() / 60;
}

export function skyAt(time) {
  const hour = hourOf(time);
  const next = STOPS.findIndex(([at]) => at >= hour);
  const [toAt, toHex] = STOPS[Math.max(1, next)];
  const [fromAt, fromHex] = STOPS[Math.max(1, next) - 1];
  const t = toAt === fromAt ? 0 : (hour - fromAt) / (toAt - fromAt);
  const [r, g, b] = rgb(fromHex).map((value, index) => Math.round(value + (rgb(toHex)[index] - value) * t));
  return `rgb(${r}, ${g}, ${b})`;
}

// 0 in daylight, 1 in deep night: how much of the starfield shows.
export function nightness(time) {
  const [r, g, b] = skyAt(time).match(/\d+/g).map(Number);
  const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return Math.min(1, Math.max(0, (0.62 - light) / 0.4));
}
