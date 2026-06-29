"use client";

import React from "react";
import { Warning } from "@phosphor-icons/react";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-3 border border-border-custom bg-surface p-3 text-xs text-muted-custom">
      <Warning size={16} className="text-yellow-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-foreground/80 mb-0.5">Risk Warning & Disclaimer</p>
        <p>
          All AI-generated analyses, signals, and technical indicators are for educational and informational purposes only. They do not constitute financial, investment, or trading advice. Trading cryptocurrencies and financial instruments involves high risk. Never trade with capital you cannot afford to lose. Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  );
}
