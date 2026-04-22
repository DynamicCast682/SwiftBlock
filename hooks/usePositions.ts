import { useState, useCallback } from "react";

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

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/positions");
      if (!response.ok) throw new Error("Failed to fetch positions");
      const data = await response.json();
      setPositions(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const openPosition = useCallback(
    async (position: Omit<Position, "id" | "openTime">) => {
      setLoading(true);
      try {
        const response = await fetch("/api/positions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(position),
        });

        if (!response.ok) throw new Error("Failed to open position");
        const data = await response.json();
        setPositions([...positions, data.data]);
        setError(null);
        return data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [positions]
  );

  const closePosition = useCallback(
    async (positionId: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/positions?id=${encodeURIComponent(positionId)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to close position");
        setPositions(positions.filter((p) => p.id !== positionId));
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [positions]
  );

  const updatePosition = useCallback(
    (positionId: string, updates: Partial<Position>) => {
      setPositions(
        positions.map((p) => (p.id === positionId ? { ...p, ...updates } : p))
      );
    },
    [positions]
  );

  return {
    positions,
    loading,
    error,
    fetchPositions,
    openPosition,
    closePosition,
    updatePosition,
  };
}
