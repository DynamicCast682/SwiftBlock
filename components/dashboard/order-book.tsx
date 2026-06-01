"use client";

import { useState, useEffect, useMemo } from "react";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {
  currentPrice: number;
  symbol: string;
}

export function OrderBook({ currentPrice, symbol }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);

  useEffect(() => {
    const generateOrders = (basePrice: number, side: "bid" | "ask") => {
      const orders: OrderBookEntry[] = [];
      let runningTotal = 0;
      const step = basePrice * 0.0001; // 0.01% step

      for (let i = 0; i < 10; i++) {
        const price = side === "bid" 
          ? basePrice - (i + 1) * step 
          : basePrice + (i + 1) * step;
        const amount = Math.random() * (symbol === "BTC" ? 2 : 1000);
        runningTotal += amount;
        orders.push({ price, amount, total: runningTotal });
      }
      return side === "ask" ? orders.reverse() : orders;
    };

    setAsks(generateOrders(currentPrice, "ask"));
    setBids(generateOrders(currentPrice, "bid"));

    const interval = setInterval(() => {
      const updateOrders = (prev: OrderBookEntry[]) => {
        return prev.map(o => ({
          ...o,
          amount: Math.max(0.1, o.amount + (Math.random() - 0.5) * (o.amount * 0.1))
        }));
      };
      setAsks(prev => updateOrders(prev));
      setBids(prev => updateOrders(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice, symbol]);

  const maxTotal = useMemo(() => {
    const all = [...asks, ...bids];
    return Math.max(...all.map(o => o.total), 1);
  }, [asks, bids]);

  const decimals = currentPrice < 10 ? 4 : 2;

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden text-[11px] tabular-nums">
      <div className="bg-muted px-2 py-1 font-semibold border-b">Order Book</div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Asks (Sell orders) */}
        <div className="flex-1 flex flex-col justify-end">
          {asks.map((order, i) => (
            <div key={`ask-${i}`} className="relative flex justify-between px-2 py-0.5 group hover:bg-red-500/5">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all duration-300" 
                style={{ width: `${(order.total / maxTotal) * 100}%` }}
              />
              <span className="text-red-500 z-10">{order.price.toFixed(decimals)}</span>
              <span className="text-muted-foreground z-10">{order.amount.toFixed(decimals === 4 ? 2 : 4)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="bg-muted/50 px-2 py-1 text-center font-bold border-y">
          <span className={asks[asks.length-1]?.price > bids[0]?.price ? "text-green-500" : "text-red-500"}>
            ${currentPrice.toFixed(decimals)}
          </span>
        </div>

        {/* Bids (Buy orders) */}
        <div className="flex-1 overflow-hidden">
          {bids.map((order, i) => (
            <div key={`bid-${i}`} className="relative flex justify-between px-2 py-0.5 group hover:bg-green-500/5">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-green-500/10 transition-all duration-300" 
                style={{ width: `${(order.total / maxTotal) * 100}%` }}
              />
              <span className="text-green-500 z-10">{order.price.toFixed(decimals)}</span>
              <span className="text-muted-foreground z-10">{order.amount.toFixed(decimals === 4 ? 2 : 4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
