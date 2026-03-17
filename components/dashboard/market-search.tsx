"use client";

import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTradingInstruments, type TradingInstrument } from "@/lib/mock-data";

export function MarketSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "currency" | "futures">("all");

  const filteredInstruments = useMemo(() => {
    let results = mockTradingInstruments;

    if (filterType !== "all") {
      results = results.filter((inst) => inst.type === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (inst) =>
          inst.symbol.toLowerCase().includes(query) ||
          inst.name.toLowerCase().includes(query)
      );
    }

    return results;
  }, [searchQuery, filterType]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search markets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as "all" | "currency" | "futures")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="currency">Currency Pairs</SelectItem>
            <SelectItem value="futures">Futures</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto">
        {filteredInstruments.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No instruments found
          </div>
        ) : (
          filteredInstruments.map((instrument) => (
            <InstrumentItem key={instrument.id} instrument={instrument} />
          ))
        )}
      </div>
    </div>
  );
}

function InstrumentItem({ instrument }: { instrument: TradingInstrument }) {
  const isPositive = instrument.change24h >= 0;

  return (
    <button
      className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors text-left"
      onClick={() => {
        console.log("Selected instrument:", instrument.symbol);
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="font-medium text-sm truncate">{instrument.symbol}</div>
        <div className="text-xs text-muted-foreground truncate">{instrument.name}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5 ml-2">
        <div className="text-sm font-medium">
          {instrument.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div
          className={`flex items-center gap-0.5 text-xs ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}
          {instrument.change24h.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}
