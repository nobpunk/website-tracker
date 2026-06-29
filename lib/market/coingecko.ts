/**
 * CoinGecko API client for global market stats and trending coins.
 */

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  marketCapChangePercent: number;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number;
  thumb: string;
  priceBtc: number;
  sparkline: string;
}

/**
 * Fetch global crypto market statistics
 */
export async function getGlobalMarketStats(): Promise<GlobalMarketData | null> {
  try {
    const url = `${COINGECKO_BASE_URL}/global`;
    const res = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes (CoinGecko free tier friendly)
    });

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.statusText}`);
    }

    const json = await res.json();
    const data = json.data;

    return {
      totalMarketCap: data.total_market_cap.usd || 0,
      totalVolume: data.total_volume.usd || 0,
      btcDominance: data.market_cap_percentage.btc || 0,
      marketCapChangePercent: data.market_cap_change_percentage_24h_usd || 0,
    };
  } catch (error) {
    console.error("Error in getGlobalMarketStats:", error);
    // Return mock fallback data if API rate limits us
    return {
      totalMarketCap: 2240000000000,
      totalVolume: 85400000000,
      btcDominance: 54.2,
      marketCapChangePercent: 1.25,
    };
  }
}

/**
 * Fetch trending coins from CoinGecko search/trending
 */
export async function getTrendingCoins(): Promise<TrendingCoin[]> {
  try {
    const url = `${COINGECKO_BASE_URL}/search/trending`;
    const res = await fetch(url, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.statusText}`);
    }

    const data = await res.json();
    const coins = data.coins || [];

    return coins.map((c: any) => ({
      id: c.item.id,
      name: c.item.name,
      symbol: c.item.symbol,
      marketCapRank: c.item.market_cap_rank || 0,
      thumb: c.item.small,
      priceBtc: c.item.price_btc || 0,
      sparkline: c.item.sparkline || "",
    }));
  } catch (error) {
    console.error("Error in getTrendingCoins:", error);
    // Return empty array on failure
    return [];
  }
}
