import React from "react";
import { ArrowCircleUp, ArrowCircleDown, MinusCircle } from "@phosphor-icons/react";

interface SignalBadgeProps {
  signal: "bullish" | "bearish" | "neutral";
  className?: string;
}

export function SignalBadge({ signal, className = "" }: SignalBadgeProps) {
  let bg = "bg-muted-custom/10 border-muted-custom/20 text-muted-custom";
  let Icon = MinusCircle;
  let label = "NEUTRAL";

  if (signal === "bullish") {
    bg = "bg-bullish/10 border-bullish/20 text-bullish";
    Icon = ArrowCircleUp;
    label = "BULLISH";
  } else if (signal === "bearish") {
    bg = "bg-bearish/10 border-bearish/20 text-bearish";
    Icon = ArrowCircleDown;
    label = "BEARISH";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-mono font-bold tracking-wider ${bg} ${className}`}>
      <Icon size={14} weight="bold" />
      {label}
    </span>
  );
}
