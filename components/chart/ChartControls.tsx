import React from "react";

interface ChartControlsProps {
  interval: string;
  onIntervalChange: (interval: string) => void;
}

export function ChartControls({ interval, onIntervalChange }: ChartControlsProps) {
  const intervals = [
    { value: "1m", label: "1M" },
    { value: "5m", label: "5M" },
    { value: "15m", label: "15M" },
    { value: "1h", label: "1H" },
    { value: "4h", label: "4H" },
    { value: "1d", label: "1D" },
  ];

  return (
    <div className="flex items-center gap-1 bg-background border border-border-custom p-0.5 rounded-sm">
      {intervals.map((int) => {
        const isActive = interval === int.value;
        return (
          <button
            key={int.value}
            onClick={() => onIntervalChange(int.value)}
            className={`px-3 py-1 text-xs font-mono font-semibold transition-all ${
              isActive
                ? "bg-border-custom text-foreground"
                : "text-muted-custom hover:text-foreground hover:bg-border-custom/30"
            }`}
          >
            {int.label}
          </button>
        );
      })}
    </div>
  );
}
