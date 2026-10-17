// "Deeper as You Read" (Experiment 001): the reading space darkens with
// progress through the text. Stops live in tokens.css so the palette stays
// tunable without touching JS.

function hexToRgb(hex) {
  const value = hex.trim().replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
}

// `--journal-deep-stops: 0 #EEF2F4, 0.2 #E8EDF0, ...` → [[0, [r,g,b]], ...]
export function parseDepthStops(value) {
  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/))
    .filter(([position, color]) => position && color)
    .map(([position, color]) => [parseFloat(position), hexToRgb(color)])
    .sort((a, b) => a[0] - b[0]);
}

export function depthColorAt(stops, progress) {
  if (stops.length === 0) {
    return null;
  }

  const p = Math.min(1, Math.max(0, progress));
  let index = stops.findIndex(([position]) => position >= p);
  if (index <= 0) {
    index = index === -1 ? stops.length - 1 : 0;
    return `rgb(${stops[index][1].join(',')})`;
  }

  const [p0, c0] = stops[index - 1];
  const [p1, c1] = stops[index];
  const t = p1 === p0 ? 1 : (p - p0) / (p1 - p0);
  const rgb = c0.map((channel, i) => Math.round(channel + (c1[i] - channel) * t));
  return `rgb(${rgb.join(',')})`;
}

// Progress = how far the middle of the viewport has travelled through the
// text block. Paragraph heights follow their length, so this tracks the
// essay's structure without hard-coding any paragraph positions.
export function readingProgress(scroller, textElement) {
  if (!scroller || !textElement) {
    return 0;
  }

  const rect = textElement.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  const anchor = scrollerRect.top + scroller.clientHeight * 0.5;
  return Math.min(1, Math.max(0, (anchor - rect.top) / Math.max(1, rect.height)));
}
