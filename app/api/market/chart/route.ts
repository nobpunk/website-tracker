import { NextResponse } from "next/server";
import { getHistoricalCandles } from "@/lib/market/binance";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "BTCUSDT";
    const interval = searchParams.get("interval") || "1h";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    
    const candles = await getHistoricalCandles(symbol, interval, limit);
    return NextResponse.json(candles);
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
