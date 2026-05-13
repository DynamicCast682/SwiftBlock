export type TradeRecord = {
  id: string;
  instrument: string;
  type: "LONG" | "SHORT";
  openTime: string;
  closeTime: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  commission: number;
  status: "win" | "loss";
};

export type DailyStats = {
  date: string;
  pnl: number;
  commission: number;
  trades: number;
  equity: number;
};

// Seeded pseudo-random to keep values stable
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Generate 90 days of trading history
function generateHistory(): { trades: TradeRecord[]; daily: DailyStats[] } {
  const instruments = [
    { symbol: "EUR/USD", basePrice: 1.0856, commRate: 0.00005 },
    { symbol: "BTC",     basePrice: 68432,  commRate: 0.0004  },
    { symbol: "GC",      basePrice: 2034,   commRate: 0.0003  },
    { symbol: "NQ",      basePrice: 18234,  commRate: 0.0002  },
    { symbol: "GBP/USD", basePrice: 1.2634, commRate: 0.00005 },
    { symbol: "ETH",     basePrice: 3456,   commRate: 0.0004  },
    { symbol: "CL",      basePrice: 82.45,  commRate: 0.0003  },
    { symbol: "ES",      basePrice: 5234,   commRate: 0.0002  },
  ];

  const trades: TradeRecord[] = [];
  const daily: DailyStats[] = [];

  const now = new Date("2026-05-13T18:00:00Z");
  let equity = 10000;
  let tradeIdx = 0;

  for (let d = 89; d >= 0; d--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - d);
    const dateStr = dayDate.toISOString().slice(0, 10);

    // Skip weekends
    const dow = dayDate.getDay();
    if (dow === 0 || dow === 6) continue;

    const tradesCount = 2 + Math.floor(sr(d * 3) * 4); // 2-5 trades per day
    let dayPnl = 0;
    let dayCommission = 0;

    for (let t = 0; t < tradesCount; t++) {
      const inst = instruments[Math.floor(sr(d * 7 + t * 13) * instruments.length)];
      const type: "LONG" | "SHORT" = sr(d * 5 + t * 11) > 0.5 ? "LONG" : "SHORT";
      const size = Math.round(1 + sr(d * 9 + t * 7) * 4); // 1-5 lots

      // Slightly positive bias for realistic equity curve
      const bias = 0.015;
      const raw = (sr(d * 11 + t * 17) - 0.5 + bias);
      const movePct = raw * 0.03; // ±1.5% move per trade

      const entryPrice = inst.basePrice * (0.98 + sr(d * 13 + t * 19) * 0.04);
      const exitPrice = type === "LONG"
        ? entryPrice * (1 + movePct)
        : entryPrice * (1 - movePct);

      const rawPnl = type === "LONG"
        ? (exitPrice - entryPrice) * size
        : (entryPrice - exitPrice) * size;

      const commission = entryPrice * size * inst.commRate * 2; // open + close
      const pnl = rawPnl - commission;

      const openHour = 9 + Math.floor(sr(d * 3 + t) * 8);
      const closeHour = openHour + 1 + Math.floor(sr(d * 2 + t) * 3);
      const openTime = new Date(dayDate);
      openTime.setHours(openHour, Math.floor(sr(d + t * 3) * 60), 0);
      const closeTime = new Date(dayDate);
      closeTime.setHours(Math.min(closeHour, 23), Math.floor(sr(d * 2 + t * 5) * 60), 0);

      trades.push({
        id: `trade-${++tradeIdx}`,
        instrument: inst.symbol,
        type,
        openTime: openTime.toISOString(),
        closeTime: closeTime.toISOString(),
        entryPrice,
        exitPrice,
        size,
        pnl,
        commission,
        status: pnl >= 0 ? "win" : "loss",
      });

      dayPnl += pnl;
      dayCommission += commission;
    }

    equity += dayPnl;

    daily.push({
      date: dateStr,
      pnl: dayPnl,
      commission: dayCommission,
      trades: tradesCount,
      equity,
    });
  }

  return { trades, daily };
}

const { trades, daily } = generateHistory();

export const mockTrades = trades;
export const mockDailyStats = daily;

// Aggregated stats
export const mockStats = (() => {
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalCommission = trades.reduce((s, t) => s + t.commission, 0);
  const wins = trades.filter((t) => t.status === "win");
  const losses = trades.filter((t) => t.status === "loss");
  const winRate = (wins.length / trades.length) * 100;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
  const profitFactor = losses.length
    ? wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
    : Infinity;

  // Best / worst day
  const bestDay = [...daily].sort((a, b) => b.pnl - a.pnl)[0];
  const worstDay = [...daily].sort((a, b) => a.pnl - b.pnl)[0];

  // Max drawdown
  let peak = daily[0]?.equity ?? 10000;
  let maxDrawdown = 0;
  for (const d of daily) {
    if (d.equity > peak) peak = d.equity;
    const dd = ((peak - d.equity) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // By instrument
  const byInstrument: Record<string, { pnl: number; trades: number; commission: number; wins: number }> = {};
  for (const t of trades) {
    if (!byInstrument[t.instrument]) {
      byInstrument[t.instrument] = { pnl: 0, trades: 0, commission: 0, wins: 0 };
    }
    byInstrument[t.instrument].pnl += t.pnl;
    byInstrument[t.instrument].trades += 1;
    byInstrument[t.instrument].commission += t.commission;
    if (t.status === "win") byInstrument[t.instrument].wins += 1;
  }

  const startEquity = 10000;
  const endEquity = daily[daily.length - 1]?.equity ?? startEquity;

  return {
    totalPnl,
    totalCommission,
    netPnl: totalPnl,
    grossPnl: totalPnl + totalCommission,
    winRate,
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    avgWin,
    avgLoss,
    profitFactor,
    bestDay,
    worstDay,
    maxDrawdown,
    byInstrument,
    startEquity,
    endEquity,
    returnPct: ((endEquity - startEquity) / startEquity) * 100,
  };
})();
