"use client";

import React, { useEffect, useRef } from "react";
import { 
  createChart, 
  IChartApi, 
  ISeriesApi,
  ColorType,
  CandlestickSeries,
  HistogramSeries
} from "lightweight-charts";
import { CandleData } from "@/lib/market/binance";

interface TradingChartProps {
  data: CandleData[];
  symbol: string;
}

export function TradingChart({ data, symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#111215" }, // Matching oklch(0.12 0.006 240)
        textColor: "#9ca3af",
        fontFamily: "var(--font-mono)",
      },
      grid: {
        vertLines: { color: "#22242a" }, // Matching oklch(0.22 0.008 240)
        horzLines: { color: "#22242a" },
      },
      crosshair: {
        mode: 0, // Normal crosshair
        vertLine: {
          color: "#4ade80",
          width: 1,
          style: 3, // Dashed
        },
        horzLine: {
          color: "#4ade80",
          width: 1,
          style: 3,
        },
      },
      timeScale: {
        borderColor: "#22242a",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#22242a",
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    chartRef.current = chart;

    // Add Candlestick Series using v5 unified API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981", // var(--bullish)
      downColor: "#ef4444", // var(--bearish)
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add Volume Series (Histogram) at the bottom using v5 unified API
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // Overlay on the main pane
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Volume occupies bottom 20%
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data when data prop changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) return;

    // Map candles to series format
    const chartCandles = data.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const chartVolume = data.map(c => ({
      time: c.time as any,
      value: c.volume || 0,
      color: c.close >= c.open ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
    }));

    candlestickSeriesRef.current.setData(chartCandles);
    volumeSeriesRef.current.setData(chartVolume);
    
    // Fit content
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="relative border border-border-custom bg-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold font-mono text-muted-custom uppercase">{symbol} Price Chart</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-bullish"></span>
          <span className="text-[10px] font-mono text-muted-custom">Interval: Realtime</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}
