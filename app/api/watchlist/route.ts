import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Get user's watchlist
export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const watchlist = await db.watchlist.findMany({
      where: { userId: req.auth.user.id },
      orderBy: { addedAt: "desc" },
    });
    return NextResponse.json(watchlist);
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// Add to watchlist
export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { symbol, name } = await req.json();
    if (!symbol || !name) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Upsert or create to prevent duplicates
    const item = await db.watchlist.upsert({
      where: {
        userId_symbol: {
          userId: req.auth.user.id,
          symbol,
        },
      },
      update: {},
      create: {
        userId: req.auth.user.id,
        symbol,
        name,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});

// Remove from watchlist
export const DELETE = auth(async function DELETE(req) {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    await db.watchlist.delete({
      where: {
        userId_symbol: {
          userId: req.auth.user.id,
          symbol,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist delete error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});
