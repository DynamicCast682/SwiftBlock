"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { mockTradingInstruments, type TradingInstrument } from "./mock-data";

type PricesContextType = {
  prices: Record<string, number>;
  instruments: TradingInstrument[];
};

const PricesContext = createContext<PricesContextType>({
  prices: {},
  instruments: mockTradingInstruments,
});

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [instruments, setInstruments] = useState<TradingInstrument[]>(mockTradingInstruments);
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initialPrices: Record<string, number> = {};
    mockTradingInstruments.forEach((inst) => {
      initialPrices[inst.symbol] = inst.price;
    });
    return initialPrices;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prevPrices) => {
        const newPrices = { ...prevPrices };
        Object.keys(newPrices).forEach((symbol) => {
          const currentPrice = newPrices[symbol];
          // Random walk: +/- 0.05%
          const volatility = 0.0005;
          const change = currentPrice * (Math.random() - 0.5) * 2 * volatility;
          newPrices[symbol] = currentPrice + change;
        });
        return newPrices;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update instruments list with new prices for components that rely on the full object
  const updatedInstruments = instruments.map((inst) => ({
    ...inst,
    price: prices[inst.symbol] || inst.price,
  }));

  return (
    <PricesContext.Provider value={{ prices, instruments: updatedInstruments }}>
      {children}
    </PricesContext.Provider>
  );
}

export function usePrices() {
  return useContext(PricesContext);
}
