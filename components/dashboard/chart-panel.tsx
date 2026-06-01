"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { type TradingInstrument } from "@/lib/mock-data";
import { PositionDialog } from "./position-dialog";
import { PositionsList } from "./positions-list";
import { OrderBook } from "./order-book";
import { MarketTrades } from "./market-trades";
import { usePrices } from "@/lib/prices-context";
import { usePositions } from "@/hooks/usePositions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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

export function ChartPanel({ instrument: initialInstrument }: { instrument: TradingInstrument }) {
  const { prices } = usePrices();
  const { user, refreshUser } = useAuth();
  const { positions, openPosition, closePosition, fetchPositions, loading } = usePositions();
  const currentPrice = prices[initialInstrument.symbol] || initialInstrument.price;
  
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  useEffect(() => {
    if (currentPrice !== prevPriceRef.current) {
      setPriceFlash(currentPrice > prevPriceRef.current ? "up" : "down");
      prevPriceRef.current = currentPrice;
      const t = setTimeout(() => setPriceFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [currentPrice]);

  const chartPrices = useMemo(
    () => generateMockPrices(currentPrice, initialInstrument.symbol),
    [initialInstrument.symbol, currentPrice]
  );

  const minVal = Math.min(...chartPrices) * 0.999;
  const maxVal = Math.max(...chartPrices) * 1.001;
  const range = maxVal - minVal;

  const W = 600;
  const H = 220;
  const pad = { top: 12, right: 12, bottom: 24, left: 60 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = chartPrices.map((price, i) => ({
    x: (i / (chartPrices.length - 1)) * cw + pad.left,
    y: ((maxVal - price) / range) * ch + pad.top,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fillD = [
    `M ${pts[0].x},${pad.top + ch}`,
    ...pts.map((p) => `L ${p.x},${p.y}`),
    `L ${pts[pts.length - 1].x},${pad.top + ch}`,
    "Z",
  ].join(" ");

  const isPositive = initialInstrument.change24h >= 0;
  const color = isPositive ? "#16a34a" : "#dc2626";
  const decimals = currentPrice < 10 ? 4 : 2;

  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const t = i / 4;
    return {
      y: pad.top + (1 - t) * ch,
      value: (minVal + t * range).toFixed(decimals),
    };
  });

  const gradientId = `fill-${initialInstrument.id}`;
  
  const instrumentPositions = positions.filter(p => p.instrument === initialInstrument.symbol);
  
  const totalPnL = instrumentPositions.reduce((sum, p) => {
    const priceDiff = p.type === "LONG"
      ? currentPrice - p.entryPrice
      : p.entryPrice - currentPrice;
    return sum + priceDiff * p.size;
  }, 0);

  const instrumentBadge = initialInstrument.type === "currency" ? "FX" : "Futures";

  const handleOpenPosition = async (newPos: {
    type: "LONG" | "SHORT";
    orderType: "MARKET" | "LIMIT";
    size: number;
    stopLoss: number;
    takeProfit: number;
    entryPrice?: number;
  }) => {
    try {
      await openPosition({
        ...newPos,
        instrument: initialInstrument.symbol,
        entryPrice: newPos.entryPrice || currentPrice,
        currentPrice: currentPrice,
        profitLoss: 0,
        profitLossPercent: 0,
      });
      await refreshUser();
      toast.success(`Позиция ${newPos.type} по ${initialInstrument.symbol} открыта`);
    } catch (err) {
      toast.error("Не удалось открыть позицию");
      console.error("Failed to open position:", err);
    }
  };

  const onHandleClosePosition = async (id: string) => {
    try {
      await closePosition(id);
      await refreshUser();
      toast.info("Позиция закрыта");
    } catch (err) {
      toast.error("Не удалось закрыть позицию");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{initialInstrument.symbol}</h2>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              initialInstrument.type === "currency"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {instrumentBadge}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{initialInstrument.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`text-2xl font-bold tabular-nums transition-colors duration-300 ${
              priceFlash === "up"
                ? "text-green-500"
                : priceFlash === "down"
                ? "text-red-500"
                : ""
            }`}
          >
            ${currentPrice.toFixed(decimals)}
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
            {initialInstrument.change24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Main Content: Chart + Sidebar Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Side: Chart (3/4 width) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-lg border bg-card p-4 relative overflow-hidden">
            <svg
              width="100%"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
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
            Real-time market activity simulation
          </p>
        </div>

        {/* Right Side: Order Book (1/4 width) */}
        <div className="lg:col-span-1 h-[280px]">
          <OrderBook currentPrice={currentPrice} symbol={initialInstrument.symbol} />
        </div>
      </div>

      {/* Bottom Content: Market Trades + Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 border-t pt-6">
        <div className="lg:col-span-1 h-[400px]">
          <MarketTrades currentPrice={currentPrice} symbol={initialInstrument.symbol} />
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Open Positions</h3>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              {instrumentPositions.length > 0 && (
                <span className={`text-sm font-bold tabular-nums ${
                  totalPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </span>
              )}
            </div>
            <PositionDialog
              instrument={initialInstrument.symbol}
              instrumentType={initialInstrument.type}
              onOpenPosition={handleOpenPosition}
            />

          </div>
          <div className="max-h-[350px] overflow-y-auto pr-2">
            <PositionsList
              positions={instrumentPositions}
              onClosePosition={onHandleClosePosition}
              currentPrices={prices}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
