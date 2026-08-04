export const DESKTOP_WAVE = {
  spacing: 22,
  period: 340,
  ampMin: 6,
  ampMax: 16,
  centerY: 55,
  phase: 0.6,
  leftBuffer: 20,
  rightBuffer: 110,
  sampleStep: 6,
};

export const MOBILE_WAVE = {
  spacing: 16,
  period: 260,
  ampMin: 4,
  ampMax: 11,
  centerY: 45,
  phase: 0.6,
  leftBuffer: 20,
  rightBuffer: 70,
  sampleStep: 6,
};

export function trackWidth(dayCount, opts = DESKTOP_WAVE) {
  if (dayCount <= 0) {
    return opts.leftBuffer + opts.rightBuffer;
  }

  return (dayCount - 1) * opts.spacing + opts.leftBuffer + opts.rightBuffer;
}

export function amplitude(x, width, ampMin, ampMax) {
  if (width <= 0) {
    return ampMin;
  }

  return ampMin + (ampMax - ampMin) * (x / width);
}

export function waveY(x, width, opts = DESKTOP_WAVE, phase = opts.phase) {
  const amp = amplitude(x, width, opts.ampMin, opts.ampMax);
  return opts.centerY + amp * Math.sin((2 * Math.PI * x) / opts.period + phase);
}

export function densityWaveY(x, width, opts = DESKTOP_WAVE, phase = opts.phase, densityAnchors = []) {
  const wavePhase = (2 * Math.PI * x) / opts.period + phase;
  const baseAmp = amplitude(x, width, opts.ampMin, opts.ampMax);
  const densityAmp = densityBoostAtX(x, densityAnchors, opts);

  return opts.centerY + (baseAmp + densityAmp) * Math.sin(wavePhase);
}

export function dayNodePosition(
  index,
  dayCount,
  opts = DESKTOP_WAVE,
  phase = opts.phase,
  densityAnchors = [],
) {
  const width = trackWidth(dayCount, opts);
  const x = opts.leftBuffer + index * opts.spacing;

  return {
    x,
    y: densityWaveY(x, width, opts, phase, densityAnchors),
  };
}

export function buildWavePathD(dayCount, opts = DESKTOP_WAVE, phase = opts.phase, densityAnchors = []) {
  const width = trackWidth(dayCount, opts);
  const step = opts.sampleStep || 6;
  const segments = [];

  for (let x = 0; x <= width; x += step) {
    const command = segments.length === 0 ? 'M' : 'L';
    segments.push(`${command} ${roundPathNumber(x)} ${roundPathNumber(densityWaveY(x, width, opts, phase, densityAnchors))}`);
  }

  if (segments.length === 0 || !segments[segments.length - 1].startsWith(`L ${roundPathNumber(width)} `)) {
    segments.push(`L ${roundPathNumber(width)} ${roundPathNumber(densityWaveY(width, width, opts, phase, densityAnchors))}`);
  }

  return segments.join(' ');
}

export function buildDensityAnchors(days, opts = DESKTOP_WAVE) {
  return days
    .map((day, index) => ({
      x: opts.leftBuffer + index * opts.spacing,
      count: day.entries.length,
    }))
    .filter((anchor) => anchor.count > 1);
}

export function realEntryOpacity(realEntryIndex, totalRealEntries) {
  if (totalRealEntries <= 1) {
    return 1;
  }

  return 0.18 + 0.82 * (realEntryIndex / (totalRealEntries - 1));
}

function roundPathNumber(value) {
  return Number(value.toFixed(3));
}

function densityBoostAtX(x, densityAnchors, opts) {
  if (densityAnchors.length === 0) {
    return 0;
  }

  const spread = opts.spacing * 2.2;
  const maxBoost = opts === MOBILE_WAVE ? 12 : 18;
  const boost = densityAnchors.reduce((total, anchor) => {
    const distance = x - anchor.x;
    const influence = Math.exp(-(distance * distance) / (2 * spread * spread));
    const countBoost = Math.min(anchor.count - 1, 5) * (opts === MOBILE_WAVE ? 3.1 : 4.4);

    return total + countBoost * influence;
  }, 0);

  return Math.min(maxBoost, boost);
}

/*
 * Motion Spec §1 sanity checks for DAYS=60 desktop sample:
 * trackWidth = (60 - 1) * 22 + 20 + 110 = 1428
 * waveY(0) ~= 58.388, waveY(714) ~= 65.361, waveY(1428) ~= 70.351 at PHASE=0.6
 * dayNodePosition(59).x = 20 + 59 * 22 = 1318
 */
