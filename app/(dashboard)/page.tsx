"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { TradingChart } from "@/components/chart/TradingChart";
import { ChartControls } from "@/components/chart/ChartControls";
import { AIPanel } from "@/components/ai/AIPanel";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { CandleData } from "@/lib/market/binance";
import { useMarketStore } from "@/store/useMarketStore";
import { formatPrice } from "@/lib/market/formatters";
import { PriceChange } from "@/components/ui/PriceChange";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChartLine } from "@phosphor-icons/react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const querySymbol = searchParams.get("symbol");

  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const { prices } = useMarketStore();

  // Handle symbol from query parameters on load
  useEffect(() => {
    if (querySymbol) {
      setSelectedSymbol(querySymbol);
    }
  }, [querySymbol]);

  const currentPriceData = prices[selectedSymbol];
  const displayName = selectedSymbol.replace("USDT", "");

  // Fetch chart data on symbol/interval change
  useEffect(() => {
    async function fetchChartData() {
      setLoadingChart(true);
      try {
        const res = await fetch(`/api/market/chart?symbol=${selectedSymbol}&interval=${interval}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          setCandles(data);
        }
      } catch (e) {
        console.error("Failed to fetch chart data", e);
      } finally {
        setLoadingChart(false);
      }
    }
    fetchChartData();
  }, [selectedSymbol, interval]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel: Market Asset Table */}
      <div className="w-80 lg:w-96 border-r border-border-custom h-full shrink-0">
        <MarketOverview
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
        />
      </div>

      {/* Center Panel: Chart & Stats */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto p-4 space-y-4">
        {/* Asset Header Info */}
        <div className="flex items-center justify-between border border-border-custom bg-surface p-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">{displayName} / USDT</h2>
              <span className="text-[10px] font-mono bg-background border border-border-custom px-1.5 py-0.5 text-muted-custom">
                Binance Realtime
              </span>
            </div>
            <p className="text-xs text-muted-custom mt-0.5">Spot Trading Market</p>
          </div>

          <div className="text-right">
            <div className="text-lg font-mono font-bold text-foreground">
              {currentPriceData ? formatPrice(currentPriceData.price) : "$0.00"}
            </div>
            <div className="mt-0.5">
              {currentPriceData ? (
                <PriceChange changePercent={currentPriceData.changePercent} />
              ) : (
                <span className="text-xs text-muted-custom">--</span>
              )}
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-custom font-semibold">
              <ChartLine size={16} />
              <span>INTERACTIVE CHART</span>
            </div>
            <ChartControls
              interval={interval}
              onIntervalChange={setInterval}
            />
          </div>
          
          {loadingChart ? (
            <div className="border border-border-custom bg-surface p-4 h-[440px] flex flex-col justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-72 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ) : (
            <TradingChart data={candles} symbol={selectedSymbol} />
          )}
        </div>

        {/* 24h Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border border-border-custom bg-surface p-3 font-mono">
            <span className="text-[10px] uppercase text-muted-custom block mb-1">24h High</span>
            <span className="text-xs font-semibold text-foreground">
              {currentPriceData ? formatPrice(currentPriceData.high) : "--"}
            </span>
          </div>
          <div className="border border-border-custom bg-surface p-3 font-mono">
            <span className="text-[10px] uppercase text-muted-custom block mb-1">24h Low</span>
            <span className="text-xs font-semibold text-foreground">
              {currentPriceData ? formatPrice(currentPriceData.low) : "--"}
            </span>
          </div>
          <div className="border border-border-custom bg-surface p-3 font-mono">
            <span className="text-[10px] uppercase text-muted-custom block mb-1">24h Volume ({displayName})</span>
            <span className="text-xs font-semibold text-foreground">
              {currentPriceData ? currentPriceData.volume.toLocaleString([], { maximumFractionDigits: 0 }) : "--"}
            </span>
          </div>
          <div className="border border-border-custom bg-surface p-3 font-mono">
            <span className="text-[10px] uppercase text-muted-custom block mb-1">24h Turnover (USDT)</span>
            <span className="text-xs font-semibold text-foreground">
              {currentPriceData ? formatPrice(currentPriceData.quoteVolume) : "--"}
            </span>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <Disclaimer />
      </div>

      {/* Right Panel: AI Co-Pilot */}
      <AIPanel symbol={selectedSymbol} interval={interval} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-xs font-mono text-muted-custom animate-pulse">Loading Terminal...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
