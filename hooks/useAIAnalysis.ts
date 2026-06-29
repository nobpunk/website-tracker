import { useState, useEffect, useCallback } from "react";

export interface AnalysisHistoryItem {
  id: string;
  symbol: string;
  prompt: string;
  response: string;
  signal: "bullish" | "bearish" | "neutral";
  createdAt: string;
}

export function useAIAnalysis() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/analyze");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch analysis history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const runAnalysis = async (symbol: string, prompt?: string) => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, prompt }),
      });
      
      if (res.ok) {
        const newAnalysis = await res.json();
        setHistory((prev) => [newAnalysis, ...prev]);
        return newAnalysis as AnalysisHistoryItem;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate analysis");
      }
    } catch (e) {
      console.error("Analysis execution failed:", e);
      throw e;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    history,
    loadingHistory,
    analyzing,
    runAnalysis,
    refetchHistory: fetchHistory,
  };
}
