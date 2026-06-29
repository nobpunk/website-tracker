import React from "react";
import { TrendUp, TrendDown } from "@phosphor-icons/react";
import { formatPercent } from "@/lib/market/formatters";

interface PriceChangeProps {
  changePercent: number;
  className?: string;
  showIcon?: boolean;
}

export function PriceChange({ changePercent, className = "", showIcon = true }: PriceChangeProps) {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;
  
  let colorClass = "text-muted-custom";
  let Icon = null;
  
  if (isPositive) {
    colorClass = "text-bullish";
    Icon = TrendUp;
  } else if (isNegative) {
    colorClass = "text-bearish";
    Icon = TrendDown;
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-medium ${colorClass} ${className}`}>
      {showIcon && Icon && <Icon size={14} weight="bold" />}
      {formatPercent(changePercent)}
    </span>
  );
}
