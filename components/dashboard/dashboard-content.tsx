"use client";

import { useSelectedInstrument } from "@/lib/selected-instrument-context";
import { ChartPanel } from "./chart-panel";
import { StatsPanel } from "./stats-panel";

export function DashboardContent() {
  const { selectedInstrument, activeView } = useSelectedInstrument();

  if (activeView === "stats") {
    return <StatsPanel />;
  }

  if (!selectedInstrument) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to SwiftBlock</h2>
        <p className="text-muted-foreground mt-2">
          Select an instrument from the sidebar to view its chart.
        </p>
      </div>
    );
  }

  return <ChartPanel instrument={selectedInstrument} />;
}
