"use client";

import { Newspaper, Clock, ExternalLink } from "lucide-react";

const MOCK_NEWS = [
  {
    title: "Fed Interest Rate Decision Expected to Hold Steady",
    source: "Bloomberg",
    time: "5m ago",
    impact: "high"
  },
  {
    title: "Bitcoin ETF Inflows Surge to Record Highs this Week",
    source: "CoinDesk",
    time: "15m ago",
    impact: "medium"
  },
  {
    title: "Major Exchange Announces Listing of New DeFi Tokens",
    source: "Reuters",
    time: "32m ago",
    impact: "low"
  },
  {
    title: "Gold Prices Hit Support Level Amid Dollar Strength",
    source: "MarketWatch",
    time: "45m ago",
    impact: "medium"
  },
  {
    title: "European Markets Open Mixed as Earnings Season Begins",
    source: "CNBC",
    time: "1h ago",
    impact: "low"
  }
];

export function MarketNews() {
  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
      <div className="bg-muted px-3 py-2 font-semibold border-b flex items-center gap-2">
        <Newspaper className="h-4 w-4" />
        <span className="text-sm">Market News</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {MOCK_NEWS.map((news, i) => (
          <div key={i} className="space-y-1.5 group cursor-pointer">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {news.time} · {news.source}
              </span>
              <span className={`px-1.5 rounded-full font-bold uppercase ${
                news.impact === 'high' ? 'bg-red-100 text-red-600' : 
                news.impact === 'medium' ? 'bg-orange-100 text-orange-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                {news.impact} impact
              </span>
            </div>
            <h4 className="text-xs font-semibold leading-snug group-hover:text-primary transition-colors">
              {news.title}
            </h4>
          </div>
        ))}
      </div>
      <div className="p-2 border-t text-[10px] text-center text-primary font-medium hover:underline cursor-pointer flex items-center justify-center gap-1">
        View all news <ExternalLink className="w-3 h-3" />
      </div>
    </div>
  );
}
