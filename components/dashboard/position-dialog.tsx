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

interface PositionDialogProps {
  instrument: string;
  onOpenPosition: (position: {
    type: "LONG" | "SHORT";
    size: number;
    stopLoss: number;
    takeProfit: number;
    entryPrice?: number;
  }) => void;
}

export function PositionDialog({
  instrument,
  onOpenPosition,
}: PositionDialogProps) {
  const [open, setOpen] = useState(false);
  const [positionType, setPositionType] = useState<"LONG" | "SHORT" | null>(
    null
  );
  const [size, setSize] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [entryPrice, setEntryPrice] = useState("");

  const handleOpenPosition = () => {
    if (!positionType || !size || !stopLoss || !takeProfit) {
      alert("Please fill all required fields");
      return;
    }

    const position = {
      type: positionType,
      size: parseFloat(size),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
    };

    onOpenPosition(position);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setPositionType(null);
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
              <Label htmlFor="entry">Entry Price (Optional)</Label>
              <Input
                id="entry"
                type="number"
                placeholder="Current market price will be used"
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

            <div className="bg-gray-100 p-3 rounded text-sm">
              <p>
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
              {size && (
                <p>
                  <strong>Size:</strong> {size}
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
