"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  Target,
  Activity,
  Award,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { mockStats, mockDailyStats, mockTrades } from "@/lib/stats-mock-data";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${fmt(n)}%`;
}
function fmtMoney(n: number) {
  return `${n >= 0 ? "+" : "-"}$${fmt(Math.abs(n))}`;
}
function shortDate(iso: string) {
  return iso.slice(5); // MM-DD
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div
        className={`text-2xl font-bold tabular-nums ${
          positive === undefined
            ? ""
            : positive
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ─── Equity curve SVG ─────────────────────────────────────────────────────────
function EquityCurve() {
  const data = mockDailyStats;
  const equities = data.map((d) => d.equity);
  const minE = Math.min(...equities) * 0.998;
  const maxE = Math.max(...equities) * 1.002;
  const range = maxE - minE;

  const W = 800;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 28, left: 64 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * cw + pad.left,
    y: ((maxE - d.equity) / range) * ch + pad.top,
    date: d.date,
    equity: d.equity,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fillD = [
    `M ${pts[0].x},${pad.top + ch}`,
    ...pts.map((p) => `L ${p.x},${p.y}`),
    `L ${pts[pts.length - 1].x},${pad.top + ch}`,
    "Z",
  ].join(" ");

  const isUp = equities[equities.length - 1] >= equities[0];
  const color = isUp ? "#16a34a" : "#dc2626";

  // Y labels
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const t = i / 4;
    return {
      y: pad.top + (1 - t) * ch,
      value: `$${((minE + t * range) / 1000).toFixed(1)}k`,
    };
  });

  // X labels — show every ~15 days
  const xLabels = pts.filter((_, i) => i % 10 === 0 || i === pts.length - 1);

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-semibold mb-3">Equity Curve</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yLabels.map((l, i) => (
          <g key={i}>
            <line
              x1={pad.left} y1={l.y} x2={pad.left + cw} y2={l.y}
              stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"
            />
            <text x={pad.left - 6} y={l.y} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="currentColor" fillOpacity="0.5">{l.value}</text>
          </g>
        ))}
        {xLabels.map((l, i) => (
          <text key={i} x={l.x} y={H - 4} textAnchor="middle"
            fontSize="9" fill="currentColor" fillOpacity="0.45">{shortDate(l.date)}</text>
        ))}
        <path d={fillD} fill="url(#eq-fill)" />
        <polyline points={polyline} fill="none" stroke={color}
          strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y}
          r="4" fill={color} />
      </svg>
    </div>
  );
}

// ─── Daily P&L bar chart ───────────────────────────────────────────────────────
function DailyPnlChart() {
  const data = mockDailyStats.slice(-30); // last 30 trading days
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.pnl))) * 1.05;

  const W = 800;
  const H = 160;
  const pad = { top: 12, right: 16, bottom: 28, left: 64 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;
  const barW = cw / data.length - 2;
  const midY = pad.top + ch / 2;

  const yLabels = [-1, -0.5, 0, 0.5, 1].map((t) => ({
    y: pad.top + ((1 - t) / 2) * ch,
    value: `${t >= 0 ? "+" : ""}$${(t * maxAbs).toFixed(0)}`,
  }));

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-semibold mb-3">Daily P&L (last 30 days)</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {yLabels.map((l, i) => (
          <g key={i}>
            <line x1={pad.left} y1={l.y} x2={pad.left + cw} y2={l.y}
              stroke="currentColor" strokeOpacity={l.value === "+$0" ? 0.25 : 0.07} strokeWidth="1" />
            <text x={pad.left - 6} y={l.y} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="currentColor" fillOpacity="0.5">{l.value}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.left + i * (cw / data.length) + 1;
          const barH = (Math.abs(d.pnl) / maxAbs) * (ch / 2);
          const barY = d.pnl >= 0 ? midY - barH : midY;
          const color = d.pnl >= 0 ? "#16a34a" : "#dc2626";
          return (
            <rect key={i} x={x} y={barY} width={barW} height={barH}
              fill={color} fillOpacity="0.8" rx="1" />
          );
        })}
        {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((d, i, arr) => {
          const origIdx = data.findIndex(x => x.date === d.date);
          const x = pad.left + origIdx * (cw / data.length) + barW / 2;
          return (
            <text key={i} x={x} y={H - 4} textAnchor="middle"
              fontSize="9" fill="currentColor" fillOpacity="0.45">{shortDate(d.date)}</text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Commission breakdown ──────────────────────────────────────────────────────
function CommissionBreakdown() {
  const byInst = mockStats.byInstrument;
  const entries = Object.entries(byInst)
    .sort((a, b) => b[1].commission - a[1].commission);
  const maxComm = entries[0]?.[1].commission ?? 1;

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">Commission by Instrument</p>
      <div className="flex flex-col gap-2">
        {entries.map(([symbol, stats]) => (
          <div key={symbol} className="flex flex-col gap-0.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{symbol}</span>
              <span className="text-muted-foreground tabular-nums">
                ${fmt(stats.commission)} · {stats.trades} trades
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-400"
                style={{ width: `${(stats.commission / maxComm) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 flex justify-between text-xs font-semibold">
        <span>Total commission paid</span>
        <span className="text-orange-600">${fmt(mockStats.totalCommission)}</span>
      </div>
    </div>
  );
}

// ─── P&L by instrument ────────────────────────────────────────────────────────
function PnlByInstrument() {
  const entries = Object.entries(mockStats.byInstrument)
    .sort((a, b) => b[1].pnl - a[1].pnl);
  const maxAbs = Math.max(...entries.map(([, s]) => Math.abs(s.pnl)));

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">Net P&L by Instrument</p>
      <div className="flex flex-col gap-2">
        {entries.map(([symbol, stats]) => {
          const pct = (stats.wins / stats.trades) * 100;
          return (
            <div key={symbol} className="flex flex-col gap-0.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{symbol}</span>
                <span
                  className={`tabular-nums font-semibold ${
                    stats.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {fmtMoney(stats.pnl)}
                  <span className="text-muted-foreground font-normal ml-2">
                    WR {pct.toFixed(0)}%
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${stats.pnl >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${(Math.abs(stats.pnl) / maxAbs) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent trades table ───────────────────────────────────────────────────────
function RecentTrades() {
  const [show, setShow] = useState(10);
  const trades = useMemo(
    () => [...mockTrades].sort((a, b) => b.closeTime.localeCompare(a.closeTime)),
    []
  );
  const visible = trades.slice(0, show);

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">Trade History</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="pb-2 pr-3 font-medium">Instrument</th>
              <th className="pb-2 pr-3 font-medium">Side</th>
              <th className="pb-2 pr-3 font-medium">Size</th>
              <th className="pb-2 pr-3 font-medium">Entry</th>
              <th className="pb-2 pr-3 font-medium">Exit</th>
              <th className="pb-2 pr-3 font-medium text-right">P&L</th>
              <th className="pb-2 font-medium text-right">Commission</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                <td className="py-1.5 pr-3 font-medium">{t.instrument}</td>
                <td className="py-1.5 pr-3">
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      t.type === "LONG"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="py-1.5 pr-3 tabular-nums">{t.size}</td>
                <td className="py-1.5 pr-3 tabular-nums">${fmt(t.entryPrice)}</td>
                <td className="py-1.5 pr-3 tabular-nums">${fmt(t.exitPrice)}</td>
                <td
                  className={`py-1.5 pr-3 tabular-nums text-right font-semibold ${
                    t.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {fmtMoney(t.pnl)}
                </td>
                <td className="py-1.5 tabular-nums text-right text-orange-600">
                  ${fmt(t.commission)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show < trades.length && (
        <button
          onClick={() => setShow((s) => s + 20)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
        >
          Show more ({trades.length - show} remaining)
        </button>
      )}
    </div>
  );
}

// ─── Win/Loss donut (pure SVG) ─────────────────────────────────────────────────
function WinLossDonut() {
  const { wins, losses, totalTrades } = mockStats;
  const R = 40;
  const cx = 60;
  const cy = 60;
  const winAngle = (wins / totalTrades) * 2 * Math.PI;

  function arc(r: number, startAngle: number, endAngle: number) {
    const x1 = cx + r * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + r * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + r * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + r * Math.sin(endAngle - Math.PI / 2);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
      <p className="text-sm font-semibold">Win / Loss Ratio</p>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
          {/* loss arc */}
          <path
            d={arc(R, winAngle, 2 * Math.PI)}
            fill="none" stroke="#dc2626" strokeWidth="14" strokeLinecap="round"
          />
          {/* win arc */}
          <path
            d={arc(R, 0, winAngle)}
            fill="none" stroke="#16a34a" strokeWidth="14" strokeLinecap="round"
          />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
            {mockStats.winRate.toFixed(0)}%
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.55">
            win rate
          </text>
        </svg>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span>{wins} wins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span>{losses} losses</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg win: <span className="text-green-600 font-semibold">${fmt(mockStats.avgWin)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Avg loss: <span className="text-red-600 font-semibold">${fmt(mockStats.avgLoss)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function StatsPanel() {
  const s = mockStats;
  const isProfit = s.totalPnl >= 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="text-sm text-muted-foreground">Last 90 trading days · Mock data</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {fmtPct(s.returnPct)} return
          </span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Net P&L"
          value={fmtMoney(s.totalPnl)}
          sub={`Gross: ${fmtMoney(s.grossPnl)}`}
          positive={s.totalPnl >= 0}
          icon={DollarSign}
        />
        <KpiCard
          label="Commission Paid"
          value={`$${fmt(s.totalCommission)}`}
          sub={`${((s.totalCommission / s.grossPnl) * 100).toFixed(1)}% of gross P&L`}
          icon={Layers}
        />
        <KpiCard
          label="Win Rate"
          value={`${s.winRate.toFixed(1)}%`}
          sub={`${s.wins}W / ${s.losses}L of ${s.totalTrades} trades`}
          positive={s.winRate >= 50}
          icon={Target}
        />
        <KpiCard
          label="Profit Factor"
          value={s.profitFactor.toFixed(2)}
          sub="Gross profit / Gross loss"
          positive={s.profitFactor >= 1}
          icon={BarChart2}
        />
        <KpiCard
          label="Avg Win"
          value={`$${fmt(s.avgWin)}`}
          sub={`Avg Loss: $${fmt(Math.abs(s.avgLoss))}`}
          positive={true}
          icon={TrendingUp}
        />
        <KpiCard
          label="Max Drawdown"
          value={`${s.maxDrawdown.toFixed(1)}%`}
          sub="Peak to trough"
          positive={false}
          icon={AlertTriangle}
        />
        <KpiCard
          label="Best Day"
          value={fmtMoney(s.bestDay?.pnl ?? 0)}
          sub={s.bestDay?.date}
          positive={true}
          icon={Award}
        />
        <KpiCard
          label="Worst Day"
          value={fmtMoney(s.worstDay?.pnl ?? 0)}
          sub={s.worstDay?.date}
          positive={false}
          icon={Activity}
        />
      </div>

      {/* Equity curve */}
      <EquityCurve />

      {/* Daily P&L */}
      <DailyPnlChart />

      {/* Two column: donut + commission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <WinLossDonut />
        <CommissionBreakdown />
      </div>

      {/* P&L by instrument */}
      <PnlByInstrument />

      {/* Trade history */}
      <RecentTrades />
    </div>
  );
}
