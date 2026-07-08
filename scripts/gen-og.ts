// Generates public/og/poker.png — a 1200x630 snapshot of the poker graph for
// OpenGraph / Apple Notes rich link previews. Runs at build (see package.json
// "build") and can be invoked directly: `bun run gen:og`.
//
// Reuses the same data layer + drawChart as the live page, so the preview
// matches what's on collinpfeifer.dev/poker.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import {
  parseLog,
  processSessions,
  emptyChartData,
  type PokerChartData,
} from "../src/components/poker-chart-data";
import {
  drawChart,
  fmtSigned,
  GREEN,
  RED,
  type ChartCtx,
} from "../src/components/poker-chart-render";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const logPath = join(repoRoot, "src/content/poker/log.md");
const fontsDir = join(repoRoot, "public/fonts");
const outPath = join(repoRoot, "public/og/poker.png");

const WIDTH = 1200;
const HEIGHT = 630;

const FAMILY = "NeueMachina";
const FAMILY_BOLD = "NeueMachina Ultrabold";
const FAMILY_LIGHT = "NeueMachina Light";

function registerFonts() {
  // @napi-rs/canvas maps each file to a family name; weights become separate
  // families since it doesn't parse weight from the OTF.
  GlobalFonts.registerFromPath(join(fontsDir, "NeueMachina-Regular.otf"), FAMILY);
  GlobalFonts.registerFromPath(join(fontsDir, "NeueMachina-Ultrabold.otf"), FAMILY_BOLD);
  GlobalFonts.registerFromPath(join(fontsDir, "NeueMachina-Light.otf"), FAMILY_LIGHT);
}

function roundRect(
  ctx: ChartCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

interface Stat {
  value: string;
  label: string;
}

function buildStats(data: PokerChartData): Stat[] {
  const t = data.totals;
  return [
    { value: t.sessions.toString(), label: "sessions" },
    {
      value: t.sessions > 0 ? Math.round((t.wins / t.sessions) * 100) + "%" : "—",
      label: "win %",
    },
    {
      value:
        t.hours > 0
          ? (t.bbPerHour >= 0 ? "+" : "") + t.bbPerHour.toFixed(1)
          : "—",
      label: "bb/hr",
    },
    {
      value: t.biggestWin > 0 ? fmtSigned(t.biggestWin) : "—",
      label: "biggest win",
    },
  ];
}

export function generatePokerOg(): Buffer {
  const md = readFileSync(logPath, "utf8");
  const sessions = parseLog(md);
  const data = sessions.length ? processSessions(sessions) : emptyChartData();

  registerFonts();

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const t = data.totals;

  // header: label (left) + net (right)
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#737373";
  ctx.font = `22px ${FAMILY_BOLD}`;
  ctx.fillText("POKER GRAPH", 60, 58);

  ctx.textAlign = "right";
  ctx.fillStyle = t.net > 0 ? GREEN : t.net < 0 ? RED : "#a3a3a3";
  ctx.font = `68px ${FAMILY_BOLD}`;
  ctx.fillText(fmtSigned(t.net), WIDTH - 60, 44);

  // stats row
  const stats = buildStats(data);
  ctx.textAlign = "left";
  let sx = 60;
  for (const s of stats) {
    ctx.fillStyle = "#d4d4d4";
    ctx.font = `26px ${FAMILY}`;
    ctx.fillText(s.value, sx, 138);
    ctx.fillStyle = "#525252";
    ctx.font = `13px ${FAMILY}`;
    ctx.fillText(s.label.toUpperCase(), sx, 172);
    sx += 260;
  }

  // chart panel
  const panelX = 40;
  const panelY = 206;
  const panelW = WIDTH - 80;
  const panelH = HEIGHT - panelY - 30;
  ctx.fillStyle = "rgba(23, 23, 23, 0.5)";
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.fill();
  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.stroke();

  // chart on its own canvas, then stamp onto the card
  const chartPad = 16;
  const chartW = panelW - chartPad * 2;
  const chartH = panelH - chartPad * 2;
  const chartCanvas = createCanvas(chartW, chartH);
  const chartCtx = chartCanvas.getContext("2d");

  if (data.points.length > 0) {
    drawChart(chartCtx, data, chartW, chartH, { fontFamily: FAMILY, scale: 1.7 });
  } else {
    chartCtx.fillStyle = "#525252";
    chartCtx.font = `16px ${FAMILY}`;
    chartCtx.textAlign = "center";
    chartCtx.textBaseline = "middle";
    chartCtx.fillText("No sessions logged yet", chartW / 2, chartH / 2);
  }

  // @napi-rs/canvas drawImage accepts a canvas source
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).drawImage(chartCanvas, panelX + chartPad, panelY + chartPad);

  return canvas.toBuffer("image/png");
}

function main() {
  const buf = generatePokerOg();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  console.log(`wrote ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

main();
