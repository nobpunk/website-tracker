import { useEffect, useRef, useState } from "react";
import { useMarketStore, LivePrice } from "@/store/useMarketStore";
import { SUPPORTED_SYMBOLS } from "@/lib/market/binance";

const WS_URL = "wss://stream.binance.com:9443/ws/!ticker@arr";

export function useMarketData() {
  const { prices, setPrice, setPrices } = useMarketStore();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch initial prices via REST API
  useEffect(() => {
    async function fetchInitialPrices() {
      try {
        const res = await fetch("/api/market/prices");
        if (!res.ok) throw new Error("Failed to fetch initial prices");
        const data = await res.json();
        
        const initialPrices: LivePrice[] = data.map((t: any) => ({
          symbol: t.symbol,
          price: parseFloat(t.lastPrice || t.price),
          changePercent: parseFloat(t.priceChangePercent),
          high: parseFloat(t.highPrice),
          low: parseFloat(t.lowPrice),
          volume: parseFloat(t.volume),
          quoteVolume: parseFloat(t.quoteVolume),
        }));
        
        setPrices(initialPrices);
      } catch (error) {
        console.error("Error fetching initial prices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialPrices();
  }, [setPrices]);

  // 2. Connect to Binance WebSocket
  useEffect(() => {
    const supportedSymbolsList = SUPPORTED_SYMBOLS.map(s => s.symbol);

    function connect() {
      if (wsRef.current) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log("Binance WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            // Filter and update supported tickers
            data.forEach((ticker: any) => {
              if (supportedSymbolsList.includes(ticker.s)) {
                setPrice(ticker.s, {
                  symbol: ticker.s,
                  price: parseFloat(ticker.c), // Current close price
                  changePercent: parseFloat(ticker.P), // 24h price change percent
                  high: parseFloat(ticker.h),
                  low: parseFloat(ticker.l),
                  volume: parseFloat(ticker.v),
                  quoteVolume: parseFloat(ticker.q),
                });
              }
            });
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      ws.onerror = (error) => {
        console.error("Binance WebSocket error:", error);
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        console.log("Binance WebSocket disconnected, attempting reconnect...");
        
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setPrice]);

  return { prices, loading, connected };
}
