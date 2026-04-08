"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type TradingInstrument } from "@/lib/mock-data";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateMockPrices(basePrice: number, symbol: string, count = 60) {
  const seed = symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const prices: number[] = [basePrice * (0.95 + seededRandom(seed) * 0.1)];

  for (let i = 1; i < count - 1; i++) {
    const rand = seededRandom(seed + i * 7);
    const change = (rand - 0.48) * basePrice * 0.004;
    prices.push(Math.max(prices[i - 1] + change, basePrice * 0.85));
  }

  prices.push(basePrice);
  return prices;
}

export function ChartPanel({ instrument }: { instrument: TradingInstrument }) {
  const prices = useMemo(
    () => generateMockPrices(instrument.price, instrument.symbol),
    [instrument.symbol, instrument.price]
  );

  const minVal = Math.min(...prices) * 0.999;
  const maxVal = Math.max(...prices) * 1.001;
  const range = maxVal - minVal;

  const W = 600;
  const H = 220;
  const pad = { top: 12, right: 12, bottom: 24, left: 60 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = prices.map((price, i) => ({
    x: (i / (prices.length - 1)) * cw + pad.left,
    y: ((maxVal - price) / range) * ch + pad.top,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fillD = [
    `M ${pts[0].x},${pad.top + ch}`,
    ...pts.map((p) => `L ${p.x},${p.y}`),
    `L ${pts[pts.length - 1].x},${pad.top + ch}`,
    "Z",
  ].join(" ");

  const isPositive = instrument.change24h >= 0;
  const color = isPositive ? "#16a34a" : "#dc2626";
  const decimals = instrument.price < 10 ? 4 : 2;

  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const t = i / 4;
    return {
      y: pad.top + (1 - t) * ch,
      value: (minVal + t * range).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    };
  });

  const gradientId = `fill-${instrument.id}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{instrument.symbol}</h2>
          <p className="text-sm text-muted-foreground">{instrument.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-2xl font-bold tabular-nums">
            {instrument.price.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {isPositive ? "+" : ""}
            {instrument.change24h.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={pad.left}
                y1={label.y}
                x2={pad.left + cw}
                y2={label.y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
              <text
                x={pad.left - 6}
                y={label.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="currentColor"
                fillOpacity="0.5"
              >
                {label.value}
              </text>
            </g>
          ))}

          <path d={fillD} fill={`url(#${gradientId})`} />

          <polyline
            points={polyline}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="3.5"
            fill={color}
          />
        </svg>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Mock data — for display purposes only
      </p>
    </div>
  );
}
