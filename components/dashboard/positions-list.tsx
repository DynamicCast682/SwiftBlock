"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface Position {
  id: string;
  type: "LONG" | "SHORT";
  instrument: string;
  size: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
  openTime: string;
}

interface PositionsListProps {
  positions: Position[];
  onClosePosition: (positionId: string) => void;
  currentPrices?: { [key: string]: number };
}

export function PositionsList({
  positions,
  onClosePosition,
  currentPrices = {},
}: PositionsListProps) {
  const [updatedPositions, setUpdatedPositions] = useState<Position[]>(
    positions
  );

  useEffect(() => {
    const updated = positions.map((position) => {
      const currentPrice = currentPrices[position.instrument] || position.currentPrice;
      const priceDiff =
        position.type === "LONG"
          ? currentPrice - position.entryPrice
          : position.entryPrice - currentPrice;
      const profitLoss = priceDiff * position.size;
      const profitLossPercent = (priceDiff / position.entryPrice) * 100;

      return {
        ...position,
        currentPrice,
        profitLoss,
        profitLossPercent,
      };
    });
    setUpdatedPositions(updated);
  }, [positions, currentPrices]);

  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No open positions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {updatedPositions.map((position) => (
        <div
          key={position.id}
          className={`border rounded-lg p-4 ${
            position.type === "LONG"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {position.type === "LONG" ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className="font-bold text-lg">{position.instrument}</span>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    position.type === "LONG"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {position.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Entry Price</p>
                  <p className="font-semibold">${position.entryPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Price</p>
                  <p className="font-semibold">${position.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Size</p>
                  <p className="font-semibold">{position.size}</p>
                </div>
                <div>
                  <p className="text-gray-600">Stop Loss / TP</p>
                  <p className="font-semibold">
                    ${position.stopLoss.toFixed(2)} / ${position.takeProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right ml-4">
              <div
                className={`text-2xl font-bold ${
                  position.profitLoss >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${position.profitLoss.toFixed(2)}
              </div>
              <div
                className={`text-sm font-semibold ${
                  position.profitLossPercent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {position.profitLossPercent >= 0 ? "+" : ""}
                {position.profitLossPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onClosePosition(position.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Close Position
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
