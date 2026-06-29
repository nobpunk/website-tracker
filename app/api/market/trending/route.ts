import { NextResponse } from "next/server";
import { getGlobalMarketStats, getTrendingCoins } from "@/lib/market/coingecko";

export async function GET() {
  try {
    const [stats, trending] = await Promise.all([
      getGlobalMarketStats(),
      getTrendingCoins()
    ]);
    
    return NextResponse.json({ stats, trending });
  } catch (error) {
    console.error("Failed to fetch trending market data:", error);
    return NextResponse.json({ error: "Failed to fetch trending market data" }, { status: 500 });
  }
}
