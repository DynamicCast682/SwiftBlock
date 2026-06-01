"use client";

import { Trophy, ArrowUp, ArrowDown } from "lucide-react";

const TOP_TRADERS = [
  { name: "CryptoZar", pnl: 45230, roi: 124.5, trades: 142 },
  { name: "AlphaPrime", pnl: 28400, roi: 89.2, trades: 86 },
  { name: "BullRun_X", pnl: 21150, roi: 76.8, trades: 210 },
  { name: "MavenTrader", pnl: 15600, roi: 64.1, trades: 54 },
  { name: "Satoshi_N", pnl: 12200, roi: 45.3, trades: 32 },
];

export function Leaderboard() {
  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
      <div className="bg-muted px-3 py-2 font-semibold border-b flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="text-sm">Leaderboard (24h)</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b bg-muted/20">
              <th className="font-medium text-left px-3 py-2">Rank</th>
              <th className="font-medium text-left px-3 py-2">Trader</th>
              <th className="font-medium text-right px-3 py-2">ROI</th>
              <th className="font-medium text-right px-3 py-2">P&L</th>
            </tr>
          </thead>
          <tbody>
            {TOP_TRADERS.map((trader, i) => (
              <tr key={trader.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-bold text-muted-foreground">#{i + 1}</td>
                <td className="px-3 py-2 font-semibold">{trader.name}</td>
                <td className="px-3 py-2 text-right text-green-500">+{trader.roi}%</td>
                <td className="px-3 py-2 text-right tabular-nums text-green-600 font-medium">
                  +${trader.pnl.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 border-t text-[10px] text-center text-muted-foreground italic">
        Updated every 5 minutes
      </div>
    </div>
  );
}
