import { NextResponse } from "next/server";
import { get24hTickers } from "@/lib/market/binance";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || undefined;
    
    const tickers = await get24hTickers(symbol);
    return NextResponse.json(tickers);
  } catch (error) {
    console.error("Failed to fetch market prices:", error);
    return NextResponse.json({ error: "Failed to fetch market prices" }, { status: 500 });
  }
}
