"use client";

import React, { useState } from "react";
import { Brain, Sparkle, Clock } from "@phosphor-icons/react";
import { useAIAnalysis, AnalysisHistoryItem } from "@/hooks/useAIAnalysis";
import { SignalBadge } from "./SignalBadge";
import { Skeleton } from "@/components/ui/Skeleton";

interface AIPanelProps {
  symbol: string;
  interval: string;
}

// Simple custom markdown formatter to avoid external dependencies
function FormattedAnalysis({ text }: { text: string }) {
  const lines = text.split("\n");
  
  return (
    <div className="space-y-3 text-xs leading-relaxed text-foreground/80 font-sans">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-sm font-bold text-foreground mt-4 first:mt-0">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("#### ")) {
          return <h4 key={i} className="text-xs font-bold text-accent-custom tracking-wider uppercase mt-3">{line.replace("#### ", "")}</h4>;
        }
        
        // Bullet points
        if (line.startsWith("- ")) {
          const content = line.replace("- ", "");
          return (
            <div key={i} className="flex items-start gap-1.5 pl-2">
              <span className="text-accent-custom shrink-0 mt-1">•</span>
              <span>{renderInlineStyles(content)}</span>
            </div>
          );
        }

        // Horizontal Rule
        if (line.trim() === "---") {
          return <hr key={i} className="border-border-custom my-4" />;
        }

        // Disclaimer italicized
        if (line.startsWith("*Disclaimer:")) {
          return <p key={i} className="text-[10px] italic text-muted-custom mt-4">{line.replace(/\*/g, "")}</p>;
        }

        // Standard Paragraph
        if (line.trim() === "") return null;
        return <p key={i}>{renderInlineStyles(line)}</p>;
      })}
    </div>
  );
}

// Helper to render **bold** and `code`
function renderInlineStyles(text: string) {
  // Regex split to capture **bold** and `code`
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

export function AIPanel({ symbol, interval }: AIPanelProps) {
  const { runAnalysis, analyzing } = useAIAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    try {
      const result = await runAnalysis(symbol, `Analyze the current market condition of ${symbol} on the ${interval} interval.`);
      setCurrentAnalysis(result);
    } catch (e: any) {
      setError(e.message || "Failed to generate analysis");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border-custom w-[340px] shrink-0">
      {/* Header */}
      <div className="h-16 border-b border-border-custom flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-accent-custom" weight="bold" />
          <span className="font-bold text-xs uppercase tracking-wider">AI Copilot Analysis</span>
        </div>
        {currentAnalysis && (
          <SignalBadge signal={currentAnalysis.signal} />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {analyzing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="border border-red-500/20 bg-red-500/5 p-3 rounded-sm text-xs text-bearish">
            <p className="font-bold mb-1">Analysis Failed</p>
            <p>{error}</p>
          </div>
        ) : currentAnalysis ? (
          <div className="space-y-4">
            {/* Metadata Info */}
            <div className="flex items-center gap-4 text-[10px] text-muted-custom border-b border-border-custom/50 pb-3">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>
                  {new Date(currentAnalysis.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkle size={12} className="text-accent-custom" />
                <span>Model: GPT-4o-mini</span>
              </div>
            </div>
            {/* Markdown Output */}
            <FormattedAnalysis text={currentAnalysis.response} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] text-center p-4">
            <Brain size={48} className="text-muted-custom/30 mb-3 animate-pulse" />
            <p className="text-xs font-semibold mb-1 text-foreground/80">Ready for Analysis</p>
            <p className="text-[10px] text-muted-custom max-w-[200px] mb-4">
              Trigger the AI Co-pilot to run technical analysis on the current chart data.
            </p>
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-2 px-4 py-2 bg-accent-custom hover:bg-accent-custom/90 text-background text-xs font-bold rounded-sm transition-all active:scale-[0.98]"
            >
              <Sparkle size={14} weight="fill" />
              Analyze {symbol.replace("USDT", "")}
            </button>
          </div>
        )}
      </div>

      {/* Footer trigger (if analysis exists, allow re-analyzing) */}
      {currentAnalysis && !analyzing && (
        <div className="p-3 border-t border-border-custom bg-background/30 shrink-0">
          <button
            onClick={handleAnalyze}
            className="flex items-center justify-center gap-2 w-full py-2 bg-accent-custom hover:bg-accent-custom/90 text-background text-xs font-bold rounded-sm transition-all active:scale-[0.98]"
          >
            <Sparkle size={14} weight="fill" />
            Re-Analyze Asset
          </button>
        </div>
      )}
    </div>
  );
}
