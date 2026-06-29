import { useState, useEffect, useCallback } from "react";

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: string;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (e) {
      console.error("Failed to fetch watchlist:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (symbol: string, name: string) => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, name }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setWatchlist((prev) => [newItem, ...prev]);
        return true;
      }
    } catch (e) {
      console.error("Failed to add to watchlist:", e);
    }
    return false;
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const res = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
        return true;
      }
    } catch (e) {
      console.error("Failed to remove from watchlist:", e);
    }
    return false;
  };

  const inWatchlist = useCallback(
    (symbol: string) => {
      return watchlist.some((item) => item.symbol === symbol);
    },
    [watchlist]
  );

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    inWatchlist,
    refetch: fetchWatchlist,
  };
}
