"use client";

import React from "react";
import { useMarketStore } from "@/store/useMarketStore";
import { formatPrice } from "@/lib/market/formatters";
import { PriceChange } from "@/components/ui/PriceChange";
import { Broadcast, Warning } from "@phosphor-icons/react";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { prices } = useMarketStore();
  
  // Ticker assets
  const tickerSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];
  const isWsConnected = Object.keys(prices).length > 0; // Simple connection heuristic

  return (
    <header className="h-16 border-b border-border-custom bg-surface flex items-center justify-between px-6 shrink-0 z-10">
      {/* Page Title & Connection Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-bold uppercase tracking-wider">{title}</h1>
        
        {/* WS Status Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-border-custom">
          {isWsConnected ? (
            <>
              <Broadcast size={12} className="text-bullish animate-pulse" />
              <span className="text-[10px] font-mono text-bullish font-medium">LIVE</span>
            </>
          ) : (
            <>
              <Warning size={12} className="text-bearish" />
              <span className="text-[10px] font-mono text-bearish font-medium">OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {/* Live Ticker Tape (Static Row) */}
      <div className="hidden md:flex items-center gap-6 overflow-x-auto py-1 max-w-[60%] scrollbar-none">
        {tickerSymbols.map((symbol) => {
          const item = prices[symbol];
          if (!item) return null;

          const displaySymbol = symbol.replace("USDT", "");
          
          return (
            <div 
              key={symbol} 
              className="flex items-center gap-2 text-xs border-r border-border-custom/50 pr-6 last:border-0 last:pr-0 shrink-0"
            >
              <span className="font-semibold text-foreground/80">{displaySymbol}</span>
              <span className="font-mono font-medium">{formatPrice(item.price)}</span>
              <PriceChange changePercent={item.changePercent} showIcon={false} />
            </div>
          );
        })}
      </div>
    </header>
  );
}
