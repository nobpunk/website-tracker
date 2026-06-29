"use client";

import React, { useEffect, useState } from "react";
import { Star } from "@phosphor-icons/react";
import { SUPPORTED_SYMBOLS } from "@/lib/market/binance";
import { useMarketStore } from "@/store/useMarketStore";
import { formatPrice } from "@/lib/market/formatters";
import { PriceChange } from "@/components/ui/PriceChange";
import { MiniChart } from "@/components/ui/MiniChart";
import { useWatchlist } from "@/hooks/useWatchlist";

interface MarketOverviewProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export function MarketOverview({ selectedSymbol, onSelectSymbol }: MarketOverviewProps) {
  const { prices } = useMarketStore();
  const { inWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [historicalData, setHistoricalData] = useState<Record<string, number[]>>({});

  // Fetch small historical data for sparklines
  useEffect(() => {
    async function fetchSparklineData() {
      const data: Record<string, number[]> = {};
      await Promise.all(
        SUPPORTED_SYMBOLS.map(async (item) => {
          try {
            const res = await fetch(`/api/market/chart?symbol=${item.symbol}&interval=1h&limit=24`);
            if (res.ok) {
              const candles = await res.json();
              data[item.symbol] = candles.map((c: any) => c.close);
            }
          } catch (e) {
            console.error(`Failed to fetch sparkline for ${item.symbol}`, e);
          }
        })
      );
      setHistoricalData(data);
    }
    fetchSparklineData();
  }, []);

  const handleWatchlistToggle = async (e: React.MouseEvent, symbol: string, name: string) => {
    e.stopPropagation(); // Prevent row selection
    if (inWatchlist(symbol)) {
      await removeFromWatchlist(symbol);
    } else {
      await addToWatchlist(symbol, name);
    }
  };

  return (
    <div className="border border-border-custom bg-surface flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-border-custom flex items-center px-4 justify-between bg-background/40 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-custom">Markets</span>
        <span className="text-[10px] font-mono text-muted-custom">Pair: USDT</span>
      </div>

      {/* Asset List Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-custom text-[10px] uppercase tracking-wider text-muted-custom font-semibold">
              <th className="py-2.5 px-4 w-8"></th>
              <th className="py-2.5 px-2">Asset</th>
              <th className="py-2.5 px-2 text-right">Price</th>
              <th className="py-2.5 px-2 text-right">24h%</th>
              <th className="py-2.5 px-4 text-center hidden xl:table-cell">Trend (24h)</th>
            </tr>
          </thead>
          <tbody>
            {SUPPORTED_SYMBOLS.map((item) => {
              const liveData = prices[item.symbol];
              const isSelected = selectedSymbol === item.symbol;
              const isFav = inWatchlist(item.symbol);
              
              // Sparkline prices
              const sparklinePrices = historicalData[item.symbol] || [];
              
              // Determine price flash color class
              let flashClass = "";
              if (liveData && liveData.prevPrice !== undefined) {
                if (liveData.price > liveData.prevPrice) {
                  flashClass = "flash-up";
                } else if (liveData.price < liveData.prevPrice) {
                  flashClass = "flash-down";
                }
              }

              const displaySymbol = item.symbol.replace("USDT", "");

              return (
                <tr
                  key={item.symbol}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className={`border-b border-border-custom/40 text-xs cursor-pointer transition-colors ${
                    isSelected 
                      ? "bg-border-custom/50 hover:bg-border-custom/60" 
                      : "hover:bg-border-custom/20"
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => handleWatchlistToggle(e, item.symbol, item.name)}
                      className={`transition-colors ${
                        isFav ? "text-yellow-500" : "text-muted-custom hover:text-yellow-500/80"
                      }`}
                      title={isFav ? "Remove from Watchlist" : "Add to Watchlist"}
                      aria-label={isFav ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                      <Star size={14} weight={isFav ? "fill" : "regular"} />
                    </button>
                  </td>
                  
                  {/* Name & Symbol */}
                  <td className="py-3 px-2 font-sans">
                    <div className="font-semibold text-foreground/90">{displaySymbol}</div>
                    <div className="text-[10px] text-muted-custom font-medium">{item.name}</div>
                  </td>

                  {/* Price with flash animation */}
                  <td className={`py-3 px-2 text-right font-mono font-semibold transition-all ${flashClass}`}>
                    {liveData ? formatPrice(liveData.price) : <span className="text-muted-custom">Loading...</span>}
                  </td>

                  {/* 24h Change */}
                  <td className="py-3 px-2 text-right">
                    {liveData ? (
                      <PriceChange changePercent={liveData.changePercent} showIcon={false} />
                    ) : (
                      <span className="text-muted-custom">--</span>
                    )}
                  </td>

                  {/* Sparkline Trend */}
                  <td className="py-3 px-4 text-center hidden xl:table-cell">
                    <div className="flex justify-center">
                      {sparklinePrices.length > 0 ? (
                        <MiniChart prices={sparklinePrices} width={70} height={20} />
                      ) : (
                        <div className="h-4 w-16 bg-border-custom/20 animate-pulse rounded-sm"></div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
