"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  color: string;
}

const BOT_NAMES = ["CryptoWhale", "Bullish_Trader", "MoonBoy99", "SatoshisGhost", "DiamondHands", "PaperHands_Joe", "HODL_Master"];
const BOT_MESSAGES = [
  "BTC looking strong here! 🚀",
  "Anyone buying the dip on ETH?",
  "Market feels a bit shaky today...",
  "Just closed a 50% profit trade, let's go!",
  "When moon? 🌕",
  "Don't forget to set your stop losses guys.",
  "What's the sentiment on Gold futures?",
  "EUR/USD is range bound, boring.",
  "Just liquidated... feels bad man.",
  "TO THE MOON! 🚀🚀🚀",
  "Is it too late to enter long on BTC?",
  "Check out the volume on that last candle!",
];
const COLORS = ["text-blue-500", "text-green-500", "text-orange-500", "text-purple-500", "text-pink-500", "text-yellow-500"];

export function Trollbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial messages
    const initial: Message[] = Array.from({ length: 5 }).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      user: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      text: BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
      time: new Date(Date.now() - (5 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setMessages(initial);

    const interval = setInterval(() => {
      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
        text: BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
      setMessages(prev => [...prev.slice(-19), newMessage]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      user: "Me",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: "text-primary font-bold",
    };
    setMessages(prev => [...prev.slice(-19), msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
      <div className="bg-muted px-3 py-2 font-semibold border-b flex items-center justify-between">
        <span className="text-sm">Trollbox</span>
        <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">1,248 Online</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-muted"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="text-xs leading-relaxed">
            <span className="text-muted-foreground mr-1">[{msg.time}]</span>
            <span className={`font-bold mr-1 ${msg.color}`}>{msg.user}:</span>
            <span className="text-foreground">{msg.text}</span>
          </div>
        ))}
      </div>

      <div className="p-2 border-t flex gap-2">
        <Input 
          className="h-8 text-xs" 
          placeholder="Type a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend}>
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
