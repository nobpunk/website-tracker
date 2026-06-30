/**
 * Binance API client for fetching market data.
 */

const BINANCE_BASE_URL = "https://data-api.binance.vision/api/v3";

export interface CandleData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TickerData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
}

// Supported symbols in our app
export const SUPPORTED_SYMBOLS = [
  { symbol: "BTCUSDT", name: "Bitcoin", coinGeckoId: "bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum", coinGeckoId: "ethereum" },
  { symbol: "SOLUSDT", name: "Solana", coinGeckoId: "solana" },
  { symbol: "BNBUSDT", name: "BNB", coinGeckoId: "binancecoin" },
  { symbol: "ADAUSDT", name: "Cardano", coinGeckoId: "cardano" },
  { symbol: "XRPUSDT", name: "Ripple", coinGeckoId: "ripple" },
  { symbol: "DOTUSDT", name: "Polkadot", coinGeckoId: "polkadot" },
  { symbol: "DOGEUSDT", name: "Dogecoin", coinGeckoId: "dogecoin" },
  { symbol: "LINKUSDT", name: "Chainlink", coinGeckoId: "chainlink" },
  { symbol: "AVAXUSDT", name: "Avalanche", coinGeckoId: "avalanche-2" },
];

export const getSymbolName = (symbol: string): string => {
  const found = SUPPORTED_SYMBOLS.find(s => s.symbol === symbol);
  return found ? found.name : symbol.replace("USDT", "");
};

/**
 * Fetch historical candlestick data (OHLCV)
 * @param symbol e.g., "BTCUSDT"
 * @param interval e.g., "1m", "5m", "15m", "1h", "4h", "1d"
 * @param limit max 1000
 */
export async function getHistoricalCandles(
  symbol: string = "BTCUSDT",
  interval: string = "1h",
  limit: number = 100
): Promise<CandleData[]> {
  try {
    const url = `${BINANCE_BASE_URL}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 30 } }); // cache for 30s
    
    if (!res.ok) {
      throw new Error(`Binance API error: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Binance kline format:
    // [
    //   [
    //     1499040000000,      // Kline open time (ms)
    //     "0.01634790",       // Open price
    //     "0.80000000",       // High price
    //     "0.01575800",       // Low price
    //     "0.01577100",       // Close price
    //     "148976.11427815",  // Volume
    //     ...
    //   ]
    // ]
    return data.map((d: any) => ({
      time: Math.floor(d[0] / 1000), // Convert ms to seconds for lightweight-charts
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));
  } catch (error) {
    console.error("Error in getHistoricalCandles:", error);
    return [];
  }
}

/**
 * Fetch 24h ticker price statistics for all supported symbols or a single symbol
 */
export async function get24hTickers(symbol?: string): Promise<TickerData[]> {
  try {
    if (symbol) {
      const url = `${BINANCE_BASE_URL}/ticker/24hr?symbol=${symbol.toUpperCase()}`;
      const res = await fetch(url, { next: { revalidate: 2 } }); // cache for 2s
      if (!res.ok) throw new Error(`Binance API error: ${res.statusText}`);
      const data = await res.json();
      return [data];
    } else {
      const url = `${BINANCE_BASE_URL}/ticker/24hr`;
      const res = await fetch(url, { next: { revalidate: 5 } }); // cache for 5s
      if (!res.ok) throw new Error(`Binance API error: ${res.statusText}`);
      const data = await res.json();
      
      // Filter only supported symbols
      const supportedSymbolsList = SUPPORTED_SYMBOLS.map(s => s.symbol);
      return data.filter((ticker: any) => supportedSymbolsList.includes(ticker.symbol));
    }
  } catch (error) {
    console.error("Error in get24hTickers:", error);
    return [];
  }
}
