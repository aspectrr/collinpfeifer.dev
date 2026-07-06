// ── Poker log (markdown in repo) ──────────────────────────────────
// File: src/content/poker/log.md
// One `## <date>` heading per session. First body line is the result
// (needs a `$` or a leading +/-, e.g. `+$120`, `-$40`, `$25`).
// Optional extra lines become the note; `4 hr` / `2.5 hours` anywhere
// is parsed as session length.
//
//   ## 2026-07-05
//   +$120
//   4 hr · $1/$3 NLHE at Horseshoe
//
//   ## 2026-07-03
//   -$40
//   home game

export interface PokerSession {
	played_at: string; // ISO timestamp
	result: number; // net USD for the session (can be negative)
	note?: string;
	hours?: number | null;
	bb?: number | null; // big-blind size in USD (default 0.20)
}

export interface PokerPoint {
	t: number; // ms timestamp
	result: number; // this session's net
	cumulative: number; // running total up to and including this session
}

export interface PokerChartData {
	points: PokerPoint[];
	totals: {
		net: number;
		sessions: number;
		wins: number;
		losses: number;
		biggestWin: number;
		biggestLoss: number;
		hours: number;
		bbPerHour: number;
	};
}

export function parseLog(md: string): PokerSession[] {
	const sessions: PokerSession[] = [];
	// split on level-2 headings; first chunk is preamble (title etc.)
	const blocks = md.split(/^##\s+/m);

	for (let i = 1; i < blocks.length; i++) {
		const block = blocks[i].trim();
		if (!block) continue;
		const lines = block.split(/\r?\n/);
		const date = parseDate(lines[0].trim());
		if (!date) continue;

		const body = lines.slice(1).map((l) => l.trim()).filter(Boolean);
		const amount = body.length > 0 ? parseAmount(body[0]) : null;
		if (amount === null) continue; // not a session without a result

		const text = body.join(" ");
		const h = text.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/i);
		sessions.push({
			played_at: date.toISOString(),
			result: amount,
			note: body.slice(1).join(" ") || undefined,
			hours: h ? parseFloat(h[1]) : null,
		bb: parseBlind(text),
		});
	}
	return sessions;
}

function parseDate(s: string): Date | null {
	// ponytail: rely on the JS Date parser. Requires a full date
	// (YYYY-MM-DD or "July 5, 2026"). Bare "July 5" → null → skipped.
	const d = new Date(s);
	return isNaN(d.getTime()) ? null : d;
}

function parseAmount(line: string): number | null {
	// require an explicit sign OR a $ so we don't swallow "4 hours" as +$4
	const signed = line.match(/([+-])\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/);
	if (signed && (signed[1] === "+" || signed[1] === "-")) {
		const sign = signed[1] === "-" ? -1 : 1;
		return sign * parseFloat(signed[2].replace(/,/g, ""));
	}
	const dollared = line.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
	if (dollared) return parseFloat(dollared[1].replace(/,/g, ""));
	return null;
}

const DEFAULT_BB = 0.20;

// ponytail: per-session big-blind override. Matches "$0.20 BB", "$0.20 blind",
// "bb $0.20", "bb=0.20". Falls back to DEFAULT_BB when absent so existing
// sessions keep working without edits. Upgrade path: add a blind line to a session.
function parseBlind(text: string): number {
	const m = text.match(
		/(?:\$([\d.]+)\s*(?:bb|blind))|(?:(?:bb|blind)\s*[=:]?\s*\$?([\d.]+))/i,
	);
	if (m) return parseFloat(m[1] ?? m[2]);
	return DEFAULT_BB;
}

export function processSessions(sessions: PokerSession[]): PokerChartData {
	const sorted = [...sessions]
		.filter((s) => s && s.played_at != null && typeof s.result === "number")
		.sort(
			(a, b) =>
				new Date(a.played_at).getTime() - new Date(b.played_at).getTime(),
		);

	let cum = 0;
	let wins = 0;
	let losses = 0;
	let biggestWin = 0;
	let biggestLoss = 0;
	let hours = 0;
	let totalBB = 0; // Σ result/bb across sessions (varies if stakes differ)
	const points: PokerPoint[] = [];

	for (const s of sorted) {
		cum += s.result;
		points.push({
			t: new Date(s.played_at).getTime(),
			result: s.result,
			cumulative: cum,
		});
		if (s.result > 0) wins++;
		else if (s.result < 0) losses++;
		if (s.result > biggestWin) biggestWin = s.result;
		if (s.result < biggestLoss) biggestLoss = s.result;
		hours += s.hours ?? 0;
		totalBB += s.result / (s.bb ?? DEFAULT_BB);
	}

	return {
		points,
		totals: {
			net: cum,
			sessions: sorted.length,
			wins,
			losses,
			biggestWin,
			biggestLoss,
			hours,
			bbPerHour: hours > 0 ? totalBB / hours : 0,
		},
	};
}

export function emptyChartData(): PokerChartData {
	return {
		points: [],
		totals: {
			net: 0,
			sessions: 0,
			wins: 0,
			losses: 0,
			biggestWin: 0,
			biggestLoss: 0,
			hours: 0,
			bbPerHour: 0,
		},
	};
}
