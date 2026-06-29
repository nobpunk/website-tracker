import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getHistoricalCandles } from "@/lib/market/binance";
import { generateAIAnalysis } from "@/lib/ai/market-analyst";
import { NextResponse } from "next/server";

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { symbol, interval = "1h", prompt } = await req.json();

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    // 1. Fetch historical candles for indicators
    const candles = await getHistoricalCandles(symbol, interval, 100);
    if (candles.length === 0) {
      return NextResponse.json({ error: "Failed to fetch market data for analysis" }, { status: 500 });
    }

    // 2. Generate AI Analysis
    const result = await generateAIAnalysis(symbol, candles, prompt);

    // 3. Save to database for history
    const savedAnalysis = await db.analysis.create({
      data: {
        userId: req.auth.user.id,
        symbol,
        prompt: prompt || "Default Technical Analysis",
        response: result.analysis,
        signal: result.signal,
      },
    });

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// GET user's analysis history
export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await db.analysis.findMany({
      where: { userId: req.auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to last 20 analyses
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch analysis history:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});
