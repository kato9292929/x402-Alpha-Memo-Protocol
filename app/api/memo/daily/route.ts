import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getApacDailyData } from "@/lib/nansen";
import { generateDailyMemo } from "@/lib/claude";
import { getMemo, setMemo, getDailyKey, getTodayString, generateMemoId } from "@/lib/kv";
import { x402Server, WALLET_BASE, WALLET_SOLANA, BASE_NETWORK, SOLANA_NETWORK, CORS_HEADERS } from "@/lib/x402";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function handler(_req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const today = getTodayString();
    const cacheKey = getDailyKey(today);

    const cached = await getMemo(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: CORS_HEADERS });
    }

    const nansenData = await getApacDailyData();
    const content = await generateDailyMemo(nansenData, today);

    const memo = {
      memoId: generateMemoId(),
      title: `${today} APACオンチェーンデイリーメモ`,
      content,
      generatedAt: new Date().toISOString(),
      resaleEnabled: true,
      type: "daily" as const,
      originalPrice: 1.0,
    };

    await setMemo(cacheKey, memo, 86400);

    return NextResponse.json(memo, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Daily memo error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily memo", detail: String(error) },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}

export const GET = withX402(
  handler,
  {
    accepts: [
      { scheme: "exact", price: "$1.00", network: BASE_NETWORK, payTo: WALLET_BASE },
      { scheme: "exact", price: "$1.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
    ],
    description: "APAC Daily Onchain Memo",
    mimeType: "application/json",
  },
  x402Server,
);
