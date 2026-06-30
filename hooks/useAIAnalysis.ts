import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const isGuest = status === "unauthenticated";

  const fetchHistory = useCallback(async () => {
    if (status === "loading") return;

    if (isGuest) {
      try {
        const local = localStorage.getItem("analysis_history");
        if (local) {
          setHistory(JSON.parse(local));
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.error("Failed to load local analysis history:", e);
      } finally {
        setLoadingHistory(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/ai/analyze");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else if (res.status === 401) {
        const local = localStorage.getItem("analysis_history");
        setHistory(local ? JSON.parse(local) : []);
      }
    } catch (e) {
      console.error("Failed to fetch analysis history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [isGuest, status]);

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
        
        // If guest, save the returned analysis in local storage history
        if (isGuest) {
          const itemWithId = {
            ...newAnalysis,
            id: newAnalysis.id || `local_analysis_${Date.now()}`,
          };
          const nextHistory = [itemWithId, ...history];
          setHistory(nextHistory);
          localStorage.setItem("analysis_history", JSON.stringify(nextHistory));
          return itemWithId as AnalysisHistoryItem;
        }

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
