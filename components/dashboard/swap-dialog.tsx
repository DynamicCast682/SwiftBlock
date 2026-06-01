"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp, RefreshCcw, Loader2 } from "lucide-react";
import { usePrices } from "@/lib/prices-context";
import { useAuth } from "@/lib/auth-context";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { toast } from "sonner";

export function SwapDialog() {
  const [open, setOpen] = useState(false);
  const [fromSymbol, setFromSymbol] = useState("BTC");
  const [toSymbol, setToSymbol] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { prices, instruments } = usePrices();
  const { user, refreshUser } = useAuth();

  const fromPrice = prices[fromSymbol] || 0;
  const toPrice = prices[toSymbol] || 0;
  
  const exchangeRate = fromPrice && toPrice ? fromPrice / toPrice : 0;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * exchangeRate).toFixed(6) : "0";

  const userBalance = user?.balances?.find(b => b.symbol === fromSymbol)?.amount || 0;

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    if (parseFloat(fromAmount) > userBalance) {
      toast.error("Недостаточно средств на балансе");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromSymbol,
          toSymbol,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount),
        }),
      });

      if (res.ok) {
        await refreshUser();
        toast.success(`Успешный обмен: ${fromAmount} ${fromSymbol} на ${toAmount} ${toSymbol}`);
        setOpen(false);
        setFromAmount("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Ошибка при обмене");
      }
    } catch (error) {
      toast.error("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
    setFromAmount("");
  };

  const selectableInstruments = instruments.filter(i => i.type === 'futures' || i.symbol === 'BTC' || i.symbol === 'ETH');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Быстрый обмен активов">
          <ArrowDownUp className="w-4 h-4" />
          <span>Своп (Обмен)</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Instant Swap</DialogTitle>
          <DialogDescription>
            Exchange assets instantly with zero fees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>From</Label>
              <span className="text-xs text-muted-foreground">Balance: {userBalance} {fromSymbol}</span>
            </div>
            <div className="flex gap-2">
              <select 
                className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={fromSymbol}
                onChange={(e) => setFromSymbol(e.target.value)}
              >
                {selectableInstruments.map(i => (
                  <option key={i.id} value={i.symbol}>{i.symbol}</option>
                ))}
              </select>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleFlip}>
              <RefreshCcw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To (Estimated)</Label>
            <div className="flex gap-2">
              <select 
                className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={toSymbol}
                onChange={(e) => setToSymbol(e.target.value)}
              >
                {selectableInstruments.map(i => (
                  <option key={i.id} value={i.symbol}>{i.symbol}</option>
                ))}
              </select>
              <Input 
                type="text" 
                readOnly 
                value={toAmount}
                className="bg-muted"
              />
            </div>
          </div>

          {exchangeRate > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              1 {fromSymbol} ≈ {exchangeRate.toFixed(6)} {toSymbol}
            </div>
          )}
        </div>

        <Button 
          className="w-full" 
          disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
          onClick={handleSwap}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {parseFloat(fromAmount) > userBalance ? "Insufficient Balance" : "Confirm Swap"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
