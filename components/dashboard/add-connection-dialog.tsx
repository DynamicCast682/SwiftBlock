"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type Connection = {
  id: string;
  broker: "Alor" | "Tinkoff";
  apiKey: string;
};

type AddConnectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (connection: Connection) => void;
};

export function AddConnectionDialog({
  open,
  onOpenChange,
  onAdd,
}: AddConnectionDialogProps) {
  const [broker, setBroker] = useState<"Alor" | "Tinkoff" | "">("");
  const [apiKey, setApiKey] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!broker || !apiKey.trim()) return;

    onAdd({
      id: crypto.randomUUID(),
      broker,
      apiKey: apiKey.trim(),
    });

    setBroker("");
    setApiKey("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Connection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="broker">Broker</Label>
            <Select
              value={broker}
              onValueChange={(v) => setBroker(v as "Alor" | "Tinkoff")}
            >
              <SelectTrigger id="broker" className="w-full">
                <SelectValue placeholder="Select broker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alor">Alor</SelectItem>
                <SelectItem value="Tinkoff">Tinkoff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!broker || !apiKey.trim()}>
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
