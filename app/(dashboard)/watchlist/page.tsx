"use client";

import React from "react";
import Link from "next/link";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useMarketStore } from "@/store/useMarketStore";
import { formatPrice } from "@/lib/market/formatters";
import { PriceChange } from "@/components/ui/PriceChange";
import { Star, Trash, ChartLine, Info } from "@phosphor-icons/react";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Disclaimer } from "@/components/ui/Disclaimer";

export default function WatchlistPage() {
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();
  const { prices } = useMarketStore();

  const handleRemove = async (symbol: string) => {
    await removeFromWatchlist(symbol);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="border border-border-custom bg-surface p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider">Your Watchlist</h2>
          <p className="text-xs text-muted-custom mt-0.5">Assets saved for quick monitoring and analysis</p>
        </div>
        <div className="text-xs font-mono text-muted-custom">
          Items: {watchlist.length}
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="border border-border-custom bg-surface overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border-custom/40">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="py-16 text-center">
            <Star size={32} className="text-muted-custom/30 mx-auto mb-3" />
            <p className="text-xs font-semibold text-foreground/80 mb-1">Watchlist is Empty</p>
            <p className="text-[10px] text-muted-custom max-w-[240px] mx-auto mb-4">
              Go to the Market dashboard and click the star icon next to any asset to add it here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-custom hover:bg-accent-custom/90 text-background text-xs font-bold rounded-sm transition-all"
            >
              Go to Markets
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-custom text-[10px] uppercase tracking-wider text-muted-custom font-semibold">
                  <th className="py-2.5 px-4">Asset</th>
                  <th className="py-2.5 px-4 text-right">Live Price</th>
                  <th className="py-2.5 px-4 text-right">24h Change</th>
                  <th className="py-2.5 px-4 text-right hidden md:table-cell">24h High</th>
                  <th className="py-2.5 px-4 text-right hidden md:table-cell">24h Low</th>
                  <th className="py-2.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/40">
                {watchlist.map((item) => {
                  const liveData = prices[item.symbol];
                  const displaySymbol = item.symbol.replace("USDT", "");
                  
                  return (
                    <tr key={item.id} className="hover:bg-border-custom/10 text-xs">
                      {/* Name & Symbol */}
                      <td className="py-4 px-4 font-sans">
                        <div className="font-semibold text-foreground/90">{displaySymbol}</div>
                        <div className="text-[10px] text-muted-custom font-medium">{item.name}</div>
                      </td>

                      {/* Live Price */}
                      <td className="py-4 px-4 text-right font-mono font-semibold text-foreground">
                        {liveData ? formatPrice(liveData.price) : <span className="text-muted-custom">Loading...</span>}
                      </td>

                      {/* 24h Change */}
                      <td className="py-4 px-4 text-right">
                        {liveData ? (
                          <PriceChange changePercent={liveData.changePercent} />
                        ) : (
                          <span className="text-muted-custom">--</span>
                        )}
                      </td>

                      {/* 24h High */}
                      <td className="py-4 px-4 text-right font-mono text-muted-custom hidden md:table-cell">
                        {liveData ? formatPrice(liveData.high) : "--"}
                      </td>

                      {/* 24h Low */}
                      <td className="py-4 px-4 text-right font-mono text-muted-custom hidden md:table-cell">
                        {liveData ? formatPrice(liveData.low) : "--"}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Link to Chart on Dashboard */}
                          <Link
                            href={`/?symbol=${item.symbol}`}
                            className="p-1.5 border border-border-custom hover:bg-accent-custom/10 hover:text-accent-custom text-muted-custom rounded-sm transition-all"
                            title="View Chart & AI Analysis"
                          >
                            <ChartLine size={14} />
                          </Link>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(item.symbol)}
                            className="p-1.5 border border-border-custom hover:bg-red-500/10 hover:text-bearish text-muted-custom rounded-sm transition-all"
                            title="Remove from Watchlist"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
