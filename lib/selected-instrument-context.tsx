"use client";

import { createContext, useContext, useState } from "react";
import { type TradingInstrument } from "./mock-data";

export type ActiveView = "chart" | "stats";

type SelectedInstrumentContextType = {
  selectedInstrument: TradingInstrument | null;
  setSelectedInstrument: (instrument: TradingInstrument) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
};

const SelectedInstrumentContext = createContext<SelectedInstrumentContextType>({
  selectedInstrument: null,
  setSelectedInstrument: () => {},
  activeView: "chart",
  setActiveView: () => {},
});

export function SelectedInstrumentProvider({ children }: { children: React.ReactNode }) {
  const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("chart");
  return (
    <SelectedInstrumentContext.Provider
      value={{ selectedInstrument, setSelectedInstrument, activeView, setActiveView }}
    >
      {children}
    </SelectedInstrumentContext.Provider>
  );
}

export function useSelectedInstrument() {
  return useContext(SelectedInstrumentContext);
}
