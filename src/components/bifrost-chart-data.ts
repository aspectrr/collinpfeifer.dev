// ── Types ─────────────────────────────────────────────────────────

export interface BifrostMetricRow {
  provider: string;
  model: string;
  status: string;
  latency_ms: number | null;
  total_cost_usd: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  timestamp: string;
}

export interface ModelSummary {
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  successRequests: number;
  errorRequests: number;
  totalRequests: number;
  cost: number;
  avgLatencyMs: number;
  tokensPerSecond: number;
}

export interface BifrostTimeSeries {
  [model: string]: [number, number][]; // [timestamp_ms, value]
}

export interface BifrostChartData {
  summary: {
    models: ModelSummary[];
    totals: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      successRequests: number;
      errorRequests: number;
      totalRequests: number;
      cost: number;
      models: number;
    };
  };
  series: {
    tokens: BifrostTimeSeries;
    requests: BifrostTimeSeries;
    latency: BifrostTimeSeries;
    cost: BifrostTimeSeries;
  };
  hours: number;
}

// ── Processing ────────────────────────────────────────────────────

function truncateToMinute(ts: string): number {
  const d = new Date(ts);
  d.setSeconds(0, 0);
  return d.getTime();
}

interface MinuteBucket {
  inputTokens: number;
  outputTokens: number;
  requests: number;
  errors: number;
  cost: number;
  latencySum: number;
  latencyCount: number;
}

export function processRows(
  rows: BifrostMetricRow[],
  hours: number,
): BifrostChartData {
  const minuteBuckets = new Map<number, Map<string, MinuteBucket>>();
  const modelAggs = new Map<
    string,
    {
      provider: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      successRequests: number;
      errorRequests: number;
      cost: number;
      latencySum: number;
      latencyCount: number;
      outputForTps: number;
      latencySecForTps: number;
    }
  >();

  for (const row of rows) {
    if (!row.model) continue;

    // Per-model totals
    if (!modelAggs.has(row.model)) {
      modelAggs.set(row.model, {
        provider: row.provider || "unknown",
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        successRequests: 0,
        errorRequests: 0,
        cost: 0,
        latencySum: 0,
        latencyCount: 0,
        outputForTps: 0,
        latencySecForTps: 0,
      });
    }
    const agg = modelAggs.get(row.model)!;
    agg.inputTokens += row.prompt_tokens || 0;
    agg.outputTokens += row.completion_tokens || 0;
    agg.totalTokens += (row.prompt_tokens || 0) + (row.completion_tokens || 0);
    if (row.status === "success") agg.successRequests++;
    else agg.errorRequests++;
    agg.cost += row.total_cost_usd || 0;
    if (row.latency_ms != null && row.latency_ms > 0) {
      agg.latencySum += row.latency_ms;
      agg.latencyCount++;
      agg.outputForTps += row.completion_tokens || 0;
      agg.latencySecForTps += row.latency_ms / 1000;
    }

    // Per-minute bucket
    const minuteTs = truncateToMinute(row.timestamp);
    if (!minuteBuckets.has(minuteTs)) minuteBuckets.set(minuteTs, new Map());
    const minuteMap = minuteBuckets.get(minuteTs)!;
    if (!minuteMap.has(row.model)) {
      minuteMap.set(row.model, {
        inputTokens: 0,
        outputTokens: 0,
        requests: 0,
        errors: 0,
        cost: 0,
        latencySum: 0,
        latencyCount: 0,
      });
    }
    const b = minuteMap.get(row.model)!;
    b.inputTokens += row.prompt_tokens || 0;
    b.outputTokens += row.completion_tokens || 0;
    b.requests++;
    if (row.status !== "success") b.errors++;
    b.cost += row.total_cost_usd || 0;
    if (row.latency_ms != null && row.latency_ms > 0) {
      b.latencySum += row.latency_ms;
      b.latencyCount++;
    }
  }

  // Build time series
  const models = [...modelAggs.keys()];
  const series: BifrostChartData["series"] = {
    tokens: {},
    requests: {},
    latency: {},
    cost: {},
  };

  for (const model of models) {
    series.tokens[model] = [];
    series.requests[model] = [];
    series.latency[model] = [];
    series.cost[model] = [];
  }

  const sortedMinutes = [...minuteBuckets.keys()].sort((a, b) => a - b);

  // Build actual data points per minute/model
  const actualData = new Map<
    string,
    Map<
      number,
      { tokens: number; requests: number; latency: number; cost: number }
    >
  >();
  for (const model of models) actualData.set(model, new Map());

  for (const minuteTs of sortedMinutes) {
    const minuteMap = minuteBuckets.get(minuteTs)!;
    for (const model of models) {
      const b = minuteMap.get(model);
      const entry = {
        tokens: b ? b.inputTokens + b.outputTokens : 0,
        requests: b ? b.requests : 0,
        latency:
          b && b.latencyCount > 0 ? b.latencySum / b.latencyCount : 0,
        cost: b ? b.cost : 0,
      };
      actualData.get(model)!.set(minuteTs, entry);
    }
  }

  // Fill every minute in the range for every model (0s where no data)
  if (sortedMinutes.length > 0) {
    const firstMinute = sortedMinutes[0];
    const lastMinute = sortedMinutes[sortedMinutes.length - 1];

    for (const model of models) {
      const modelData = actualData.get(model)!;
      series.tokens[model] = [];
      series.requests[model] = [];
      series.latency[model] = [];
      series.cost[model] = [];

      for (let t = firstMinute; t <= lastMinute; t += 60_000) {
        const entry = modelData.get(t);
        const tokens = entry?.tokens ?? 0;
        const requests = entry?.requests ?? 0;
        const latency = entry?.latency ?? 0;
        const cost = entry?.cost ?? 0;
        series.tokens[model].push([t, tokens]);
        series.requests[model].push([t, requests]);
        series.latency[model].push([t, latency]);
        series.cost[model].push([t, cost]);
      }
    }
  }

  // Build model summaries
  const modelSummaries = models
    .map((model) => {
      const agg = modelAggs.get(model)!;
      return {
        model,
        provider: agg.provider,
        inputTokens: agg.inputTokens,
        outputTokens: agg.outputTokens,
        totalTokens: agg.totalTokens,
        successRequests: agg.successRequests,
        errorRequests: agg.errorRequests,
        totalRequests: agg.successRequests + agg.errorRequests,
        cost: agg.cost,
        avgLatencyMs:
          agg.latencyCount > 0 ? agg.latencySum / agg.latencyCount : 0,
        tokensPerSecond:
          agg.latencySecForTps > 0
            ? agg.outputForTps / agg.latencySecForTps
            : 0,
      };
    })
    .sort(
      (a, b) =>
        b.inputTokens + b.outputTokens - (a.inputTokens + a.outputTokens),
    );

  const totals = {
    inputTokens: modelSummaries.reduce((s, m) => s + m.inputTokens, 0),
    outputTokens: modelSummaries.reduce((s, m) => s + m.outputTokens, 0),
    totalTokens: modelSummaries.reduce((s, m) => s + m.totalTokens, 0),
    successRequests: modelSummaries.reduce(
      (s, m) => s + m.successRequests,
      0,
    ),
    errorRequests: modelSummaries.reduce((s, m) => s + m.errorRequests, 0),
    totalRequests: modelSummaries.reduce((s, m) => s + m.totalRequests, 0),
    cost: modelSummaries.reduce((s, m) => s + m.cost, 0),
    models: modelSummaries.length,
  };

  return {
    summary: { models: modelSummaries, totals },
    series,
    hours,
  };
}

// ── REST API fetch (works with publishable key) ───────────────────

export async function fetchRows(
  url: string,
  key: string,
  hours: number,
): Promise<BifrostMetricRow[]> {
  const cutoff = new Date(Date.now() - hours * 3600_000).toISOString();
  const allRows: BifrostMetricRow[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const res = await fetch(
      `${url}/rest/v1/bifrost_metrics` +
        `?select=model,provider,status,latency_ms,total_cost_usd,prompt_tokens,completion_tokens,timestamp` +
        `&timestamp=gte.${cutoff}&model=neq.&order=timestamp.asc&limit=${pageSize}&offset=${offset}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return allRows;
}
