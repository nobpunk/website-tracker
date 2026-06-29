"use client";

import React, { useState } from "react";
import { useAIAnalysis, AnalysisHistoryItem } from "@/hooks/useAIAnalysis";
import { SignalBadge } from "@/components/ai/SignalBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Brain, Calendar, CaretDown, CaretUp, Link as LinkIcon } from "@phosphor-icons/react";
import Link from "next/link";

// Custom markdown formatter (matching AIPanel)
function FormattedAnalysis({ text }: { text: string }) {
  const lines = text.split("\n");
  
  return (
    <div className="space-y-2 text-xs leading-relaxed text-foreground/80 font-sans">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-xs font-bold text-foreground mt-3 first:mt-0">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("#### ")) {
          return <h4 key={i} className="text-[10px] font-bold text-accent-custom tracking-wider uppercase mt-2">{line.replace("#### ", "")}</h4>;
        }
        if (line.startsWith("- ")) {
          const content = line.replace("- ", "");
          return (
            <div key={i} className="flex items-start gap-1.5 pl-2">
              <span className="text-accent-custom shrink-0 mt-1">•</span>
              <span>{renderInlineStyles(content)}</span>
            </div>
          );
        }
        if (line.trim() === "---") {
          return <hr key={i} className="border-border-custom my-3" />;
        }
        if (line.startsWith("*Disclaimer:")) {
          return <p key={i} className="text-[9px] italic text-muted-custom mt-3">{line.replace(/\*/g, "")}</p>;
        }
        if (line.trim() === "") return null;
        return <p key={i}>{renderInlineStyles(line)}</p>;
      })}
    </div>
  );
}

function renderInlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="font-mono bg-background border border-border-custom px-1 py-0.5 text-[10px] text-accent-custom">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function AIAnalysisPage() {
  const { history, loadingHistory } = useAIAnalysis();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border border-border-custom bg-surface p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider">AI Analysis History</h2>
          <p className="text-xs text-muted-custom mt-0.5">Review your past market reports and signals</p>
        </div>
        <div className="text-xs font-mono text-muted-custom">
          Reports: {history.length}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {loadingHistory ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : history.length === 0 ? (
          <div className="border border-border-custom bg-surface py-16 text-center">
            <Brain size={32} className="text-muted-custom/30 mx-auto mb-3" />
            <p className="text-xs font-semibold text-foreground/80 mb-1">No Reports Found</p>
            <p className="text-[10px] text-muted-custom max-w-[240px] mx-auto mb-4">
              You haven't run any AI analyses yet. Go to the Market dashboard and trigger the AI Co-pilot.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-custom hover:bg-accent-custom/90 text-background text-xs font-bold rounded-sm transition-all"
            >
              Go to Markets
            </Link>
          </div>
        ) : (
          history.map((item) => {
            const isExpanded = expandedId === item.id;
            const displaySymbol = item.symbol.replace("USDT", "");
            
            return (
              <div
                key={item.id}
                className="border border-border-custom bg-surface overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-border-custom/10 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground/90">{displaySymbol} / USDT</span>
                        <SignalBadge signal={item.signal} />
                      </div>
                      <p className="text-[10px] text-muted-custom mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString()} at{" "}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border-custom/30 pt-2.5 sm:pt-0">
                    <span className="text-[10px] font-mono text-muted-custom max-w-[200px] truncate">
                      Query: {item.prompt}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/?symbol=${item.symbol}`}
                        className="p-1 border border-border-custom/50 hover:bg-accent-custom/10 hover:text-accent-custom text-muted-custom rounded-sm transition-all"
                        title="View Live Chart"
                        onClick={(e) => e.stopPropagation()} // Stop expand toggle
                      >
                        <LinkIcon size={12} />
                      </Link>
                      <button className="text-muted-custom">
                        {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border-custom/40 bg-background/25">
                    <FormattedAnalysis text={item.response} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
