"use client";

import { useSelectedInstrument } from "@/lib/selected-instrument-context";
import { ChartPanel } from "./chart-panel";
import { StatsPanel } from "./stats-panel";
import { Trollbox } from "./trollbox";
import { Leaderboard } from "./leaderboard";
import { MarketNews } from "./market-news";

export function DashboardContent() {
  const { selectedInstrument, activeView } = useSelectedInstrument();

  if (activeView === "stats") {
    return <StatsPanel />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
      {/* Trading Area (Left 3/4) */}
      <div className="xl:col-span-3 space-y-6">
        {!selectedInstrument ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border rounded-lg bg-card">
            <h2 className="text-2xl font-bold tracking-tight">Welcome to SwiftBlock</h2>
            <p className="text-muted-foreground mt-2">
              Select an instrument from the sidebar to view its chart.
            </p>
          </div>
        ) : (
          <ChartPanel instrument={selectedInstrument} />
        )}
      </div>

      {/* Social & News Area (Right 1/4) */}
      <div className="xl:col-span-1 space-y-6 flex flex-col h-full">
        <div className="h-[350px]">
          <Trollbox />
        </div>
        <div className="h-[250px]">
          <Leaderboard />
        </div>
        <div className="flex-1 min-h-[300px]">
          <MarketNews />
        </div>
      </div>
    </div>
  );
}
