"use client";

import { useState } from "react";
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
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface PositionDialogProps {
  instrument: string;
  instrumentType: 'currency' | 'futures';
  onOpenPosition: (position: {
    type: "LONG" | "SHORT";
    orderType: "MARKET" | "LIMIT";
    size: number;
    stopLoss: number;
    takeProfit: number;
    entryPrice?: number;
  }) => void;
}

export function PositionDialog({
  instrument,
  instrumentType,
  onOpenPosition,
}: PositionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [positionType, setPositionType] = useState<"LONG" | "SHORT" | null>(
    null
  );
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [size, setSize] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [entryPrice, setEntryPrice] = useState("");

  const marginCurrency = instrumentType === 'futures' ? 'USDT' : instrument.split('/')[0];
  const userBalance = user?.balances?.find(b => b.symbol === marginCurrency)?.amount || 0;

  const handleOpenPosition = () => {
    if (!positionType || !size || !stopLoss || !takeProfit || (orderType === "LIMIT" && !entryPrice)) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const positionSize = parseFloat(size);
    if (positionSize > userBalance) {
      toast.error(`Недостаточно ${marginCurrency} на балансе (Доступно: ${userBalance})`);
      return;
    }

    const position = {
      type: positionType,
      orderType: orderType,
      size: parseFloat(size),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      entryPrice: orderType === "LIMIT" ? parseFloat(entryPrice) : undefined,
    };

    onOpenPosition(position);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setPositionType(null);
    setOrderType("MARKET");
    setSize("");
    setStopLoss("");
    setTakeProfit("");
    setEntryPrice("");
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex gap-2">
        <DialogTrigger asChild>
          <Button
            onClick={() => setPositionType("LONG")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            LONG
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            onClick={() => setPositionType("SHORT")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            SHORT
          </Button>
        </DialogTrigger>
      </div>

      {positionType && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {positionType === "LONG" ? (
                <>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Open LONG Position</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Open SHORT Position</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {instrument} - {positionType} Position
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Order Type</Label>
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setOrderType("MARKET")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    orderType === "MARKET"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType("LIMIT")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    orderType === "LIMIT"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Position Size *</Label>
              <Input
                id="size"
                type="number"
                placeholder="Enter position size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry">
                {orderType === "MARKET" ? "Market Price (Est.)" : "Limit Price *"}
              </Label>
              <Input
                id="entry"
                type="number"
                disabled={orderType === "MARKET"}
                placeholder={orderType === "MARKET" ? "Current market price will be used" : "Enter entry price"}
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss *</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  placeholder="Stop loss price"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="takeProfit">Take Profit *</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  placeholder="Take profit price"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
              <p className="flex justify-between">
                <strong>Position Type:</strong>{" "}
                <span
                  className={
                    positionType === "LONG"
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {positionType}
                </span>
              </p>
              <p className="flex justify-between text-xs text-muted-foreground">
                <span>Available Balance:</span>
                <span>{userBalance.toFixed(marginCurrency === 'USDT' ? 2 : 6)} {marginCurrency}</span>
              </p>
              {size && (
                <p className="flex justify-between border-t mt-1 pt-1">
                  <strong>Total Size:</strong> 
                  <span className={parseFloat(size) > userBalance ? "text-red-600 font-bold" : ""}>
                    {size} {marginCurrency}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleOpenPosition}
              className={
                positionType === "LONG"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              Open {positionType} Position
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
