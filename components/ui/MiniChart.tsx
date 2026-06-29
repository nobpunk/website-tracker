import React from "react";

interface MiniChartProps {
  prices: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export function MiniChart({
  prices,
  width = 80,
  height = 24,
  strokeWidth = 1.5,
}: MiniChartProps) {
  if (!prices || prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  // Map prices to SVG points
  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * width;
    // Invert y because SVG 0,0 is top-left
    const y = height - ((price - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathData = `M ${points.join(" L ")}`;
  
  // Determine trend color
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isUp = lastPrice >= firstPrice;
  const strokeColor = isUp ? "var(--bullish)" : "var(--bearish)";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
