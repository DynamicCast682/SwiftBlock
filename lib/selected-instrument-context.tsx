"use client";

import { createContext, useContext, useState } from "react";
import { type TradingInstrument } from "./mock-data";

type SelectedInstrumentContextType = {
  selectedInstrument: TradingInstrument | null;
  setSelectedInstrument: (instrument: TradingInstrument) => void;
};

const SelectedInstrumentContext = createContext<SelectedInstrumentContextType>({
  selectedInstrument: null,
  setSelectedInstrument: () => {},
});

export function SelectedInstrumentProvider({ children }: { children: React.ReactNode }) {
  const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument | null>(null);
  return (
    <SelectedInstrumentContext.Provider value={{ selectedInstrument, setSelectedInstrument }}>
      {children}
    </SelectedInstrumentContext.Provider>
  );
}

export function useSelectedInstrument() {
  return useContext(SelectedInstrumentContext);
}
