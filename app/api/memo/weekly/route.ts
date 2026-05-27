import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getWeeklyData } from "@/lib/nansen";
import { generateWeeklyMemo } from "@/lib/claude";
import { getMemo, setMemo, getWeeklyKey, getTodayString, generateMemoId } from "@/lib/kv";
import { x402Server, WALLET_BASE, WALLET_SOLANA, BASE_NETWORK, SOLANA_NETWORK, CORS_HEADERS } from "@/lib/x402";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function handler(_req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const today = getTodayString();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const dateRange = `${weekStartStr}〜${today}`;
    const cacheKey = getWeeklyKey(today);

    const cached = await getMemo(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: CORS_HEADERS });
    }

    const nansenData = await getWeeklyData();
    const content = await generateWeeklyMemo(nansenData, dateRange);

    const memo = {
      memoId: generateMemoId(),
      title: `${dateRange} 週次スマートマネー行動分析レポート`,
      content,
      generatedAt: new Date().toISOString(),
      resaleEnabled: true,
      type: "weekly" as const,
      originalPrice: 3.0,
    };

    await setMemo(cacheKey, memo, 86400);

    return NextResponse.json(memo, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Weekly memo error:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly memo", detail: String(error) },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}

export const GET = withX402(
  handler,
  {
    accepts: [
      { scheme: "exact", price: "$3.00", network: BASE_NETWORK, payTo: WALLET_BASE },
      { scheme: "exact", price: "$3.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
    ],
    description: "Weekly Smart Money Deep Dive Report",
    mimeType: "application/json",
  },
  x402Server,
);
