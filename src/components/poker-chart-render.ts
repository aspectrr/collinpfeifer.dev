// Shared, environment-agnostic chart drawing. Used by:
//   - PokerChart.astro <script> (browser canvas)
//   - scripts/gen-og.ts (Node canvas via @napi-rs/canvas)
// No DOM or Node imports here — callers pass a Canvas 2D-like context.

import type { PokerChartData } from "./poker-chart-data";

export const GREEN = "#34d399";
export const RED = "#f87171";
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface ChartGradient {
  addColorStop(offset: number, color: string): void;
}

// Structural slice of CanvasRenderingContext2D that both the DOM context and
// @napi-rs/canvas's SKRSContext2D satisfy. Keeps this module dependency-free.
// Style props accept a color string, a gradient, or an opaque pattern object
// (CanvasGradient/CanvasPattern differ between DOM and @napi-rs/canvas; `object`
// covers both without coupling this module to either).
export interface ChartCtx {
  fillStyle: string | ChartGradient | object;
  strokeStyle: string | ChartGradient | object;
  font: string;
  textAlign: string;
  textBaseline: string;
  lineWidth: number;
  lineJoin: string;
  lineCap: string;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  stroke(): void;
  fill(): void;
  fillText(text: string, x: number, y: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y2: number): ChartGradient;
}

export interface RenderState {
  pad: { top: number; right: number; bottom: number; left: number };
  minTime: number;
  maxTime: number;
  yMin: number;
  yMax: number;
  points: { t: number; cumulative: number; result: number }[];
  chartW: number;
  chartH: number;
  includeYear: boolean;
}

export interface DrawChartOpts {
  fontFamily: string;
  scale?: number; // multiplies font sizes + padding; 1 = on-page defaults
}

const DEFAULT_PAD = { top: 24, right: 16, bottom: 32, left: 64 };

export function fmtMoney(n: number): string {
  const sign = n < 0 ? "-$" : "$";
  const abs = Math.abs(n);
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + "k";
  // keep cents on fractional small-stakes amounts; axis ticks are whole so they stay clean
  if (!Number.isInteger(abs) && abs > 0) return sign + abs.toFixed(2);
  return sign + Math.round(abs);
}

export function fmtSigned(n: number): string {
  return (n > 0 ? "+" : n < 0 ? "-" : "") + fmtMoney(Math.abs(n));
}

export function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else {
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else nice = 10;
  }
  return nice * Math.pow(10, exp);
}

export function signedScale(minVal: number, maxVal: number, maxTicks = 6): number[] {
  if (minVal === 0 && maxVal === 0) return [-1, 0, 1];
  if (minVal > 0) minVal = 0;
  if (maxVal < 0) maxVal = 0;
  const span = niceNum(maxVal - minVal, false) || 1;
  const step = niceNum(span / (maxTicks - 1), true);
  const niceMin = Math.floor(minVal / step) * step;
  const niceMax = Math.ceil(maxVal / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step)
    ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

export function dateTicks(minT: number, maxT: number, count = 6): number[] {
  const span = maxT - minT;
  if (span <= 0) return [minT];
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) ticks.push(minT + (span * i) / count);
  return ticks;
}

export function fmtDate(ts: number, includeYear: boolean): string {
  const d = new Date(ts);
  const base = MONTHS[d.getMonth()] + " " + d.getDate();
  return includeYear ? base + " '" + String(d.getFullYear()).slice(-2) : base;
}

export function fmtFullDate(ts: number): string {
  const d = new Date(ts);
  return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

// Draws the chart into the current coordinate space. Caller is responsible for
// sizing the canvas and (in the browser) applying devicePixelRatio scaling +
// clearing. Returns render state for hover hit-testing, or null if no points.
export function drawChart(
  ctx: ChartCtx,
  data: PokerChartData,
  width: number,
  height: number,
  opts: DrawChartOpts,
): RenderState | null {
  const scale = opts.scale ?? 1;
  const pad = {
    top: DEFAULT_PAD.top * scale,
    right: DEFAULT_PAD.right * scale,
    bottom: DEFAULT_PAD.bottom * scale,
    left: DEFAULT_PAD.left * scale,
  };
  const points = data.points;
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  if (points.length === 0) return null;

  let minTime = Infinity;
  let maxTime = -Infinity;
  let yMin = 0;
  let yMax = 0;
  for (const p of points) {
    if (p.t < minTime) minTime = p.t;
    if (p.t > maxTime) maxTime = p.t;
    if (p.cumulative < yMin) yMin = p.cumulative;
    if (p.cumulative > yMax) yMax = p.cumulative;
  }
  const yTicks = signedScale(yMin, yMax, 6);
  const yLo = yTicks[0];
  const yHi = yTicks[yTicks.length - 1];
  const yRange = yHi - yLo || 1;
  const timeRange = maxTime - minTime || 86400000;
  const xTicks = dateTicks(minTime, maxTime, 6);
  const includeYear = timeRange > 800 * 86400000;

  const toX = (t: number) => pad.left + ((t - minTime) / timeRange) * chartW;
  const toY = (v: number) => pad.top + chartH - ((v - yLo) / yRange) * chartH;
  const zeroY = toY(0);

  const labelFont = `${10 * scale}px ${opts.fontFamily}`;

  // horizontal grid + y labels
  ctx.font = labelFont;
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const tick of yTicks) {
    const y = Math.round(toY(tick)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = "#525252";
    ctx.fillText(fmtMoney(tick), pad.left - 8 * scale, toY(tick));
  }

  // vertical grid + x labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const tick of xTicks) {
    const x = toX(tick);
    if (x >= pad.left - 5 && x <= pad.left + chartW + 5) {
      ctx.strokeStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, pad.top);
      ctx.lineTo(Math.round(x) + 0.5, pad.top + chartH);
      ctx.stroke();
      ctx.fillStyle = "#525252";
      ctx.fillText(fmtDate(tick, includeYear), x, pad.top + chartH + 8 * scale);
    }
  }

  // zero baseline
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, Math.round(zeroY) + 0.5);
  ctx.lineTo(pad.left + chartW, Math.round(zeroY) + 0.5);
  ctx.stroke();

  // area fill per step (green above zero, red below)
  for (let i = 0; i < points.length - 1; i++) {
    const x0 = toX(points[i].t);
    const x1 = toX(points[i + 1].t);
    const y = toY(points[i].cumulative);
    const color = points[i].cumulative >= 0 ? GREEN : RED;
    const grad = ctx.createLinearGradient(0, Math.min(y, zeroY), 0, Math.max(y, zeroY));
    grad.addColorStop(0, color + "30");
    grad.addColorStop(1, color + "05");
    ctx.fillStyle = grad;
    ctx.fillRect(x0, Math.min(y, zeroY), x1 - x0, Math.abs(zeroY - y));
  }

  // step-after line
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 1.75 * scale;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const x = toX(points[i].t);
    const y = toY(points[i].cumulative);
    if (i === 0) ctx.moveTo(x, y);
    else {
      ctx.lineTo(x, toY(points[i - 1].cumulative));
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // session dots
  for (let i = 0; i < points.length; i++) {
    const x = toX(points[i].t);
    const y = toY(points[i].cumulative);
    ctx.fillStyle = points[i].result >= 0 ? GREEN : RED;
    ctx.beginPath();
    ctx.arc(x, y, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    pad, minTime, maxTime, yMin: yLo, yMax: yHi, points, chartW, chartH, includeYear,
  };
}
