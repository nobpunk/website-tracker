import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: string;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const isGuest = status === "unauthenticated";

  const fetchWatchlist = useCallback(async () => {
    if (status === "loading") return;

    if (isGuest) {
      // Load from localStorage for guests
      try {
        const local = localStorage.getItem("watchlist");
        if (local) {
          setWatchlist(JSON.parse(local));
        } else {
          setWatchlist([]);
        }
      } catch (e) {
        console.error("Failed to load local watchlist:", e);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      } else if (res.status === 401) {
        // Fallback to local storage if API unauthorized
        const local = localStorage.getItem("watchlist");
        setWatchlist(local ? JSON.parse(local) : []);
      }
    } catch (e) {
      console.error("Failed to fetch watchlist:", e);
    } finally {
      setLoading(false);
    }
  }, [isGuest, status]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (symbol: string, name: string) => {
    if (isGuest) {
      const newItem: WatchlistItem = {
        id: `local_${symbol}`,
        symbol,
        name,
        addedAt: new Date().toISOString(),
      };
      const nextList = [newItem, ...watchlist.filter(item => item.symbol !== symbol)];
      setWatchlist(nextList);
      localStorage.setItem("watchlist", JSON.stringify(nextList));
      return true;
    }

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
    if (isGuest) {
      const nextList = watchlist.filter((item) => item.symbol !== symbol);
      setWatchlist(nextList);
      localStorage.setItem("watchlist", JSON.stringify(nextList));
      return true;
    }

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
