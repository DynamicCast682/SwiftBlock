"use client";

import { useState, useEffect } from "react";

interface Trade {
  id: string;
  price: number;
  amount: number;
  time: string;
  side: "buy" | "sell";
}

interface MarketTradesProps {
  currentPrice: number;
  symbol: string;
}

export function MarketTrades({ currentPrice, symbol }: MarketTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Initial trades
    const initialTrades: Trade[] = [];
    for (let i = 0; i < 20; i++) {
      initialTrades.push({
        id: Math.random().toString(36).substr(2, 9),
        price: currentPrice * (1 + (Math.random() - 0.5) * 0.001),
        amount: Math.random() * (symbol === "BTC" ? 0.5 : 500),
        time: new Date(Date.now() - i * 5000).toLocaleTimeString([], { hour12: false }),
        side: Math.random() > 0.5 ? "buy" : "sell",
      });
    }
    setTrades(initialTrades);

    const interval = setInterval(() => {
      const newTrade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        price: currentPrice * (1 + (Math.random() - 0.5) * 0.0005),
        amount: Math.random() * (symbol === "BTC" ? 0.2 : 200),
        time: new Date().toLocaleTimeString([], { hour12: false }),
        side: Math.random() > 0.5 ? "buy" : "sell",
      };
      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice, symbol]);

  const decimals = currentPrice < 10 ? 4 : 2;

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden text-[11px] tabular-nums">
      <div className="bg-muted px-2 py-1 font-semibold border-b">Market Trades</div>
      <div className="flex-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-muted-foreground border-b bg-muted/20">
              <th className="font-medium text-left px-2 py-1">Price</th>
              <th className="font-medium text-right px-2 py-1">Amount</th>
              <th className="font-medium text-right px-2 py-1">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-muted/30 transition-colors">
                <td className={`px-2 py-0.5 ${trade.side === "buy" ? "text-green-500" : "text-red-500"}`}>
                  {trade.price.toFixed(decimals)}
                </td>
                <td className="px-2 py-0.5 text-right text-muted-foreground">
                  {trade.amount.toFixed(decimals === 4 ? 2 : 4)}
                </td>
                <td className="px-2 py-0.5 text-right text-muted-foreground">
                  {trade.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
