import { NextRequest, NextResponse } from "next/server";
import { withX402, SolanaAddress } from "x402-next";
import { getSolanaDailyData } from "@/lib/nansen";
import { generateDailyMemo } from "@/lib/claude";
import { getMemo, setMemo, getSolanaDailyKey, getTodayString, generateMemoId } from "@/lib/kv";

const SOLANA_WALLET = (process.env.SOLANA_WALLET_ADDRESS || "11111111111111111111111111111111") as SolanaAddress;

async function handler(_req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const today = getTodayString();
    const cacheKey = getSolanaDailyKey(today);

    const cached = await getMemo(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const nansenData = await getSolanaDailyData();
    const content = await generateDailyMemo(nansenData, today);

    const memo = {
      memoId: generateMemoId(),
      title: `${today} Solana APACオンチェーンデイリーメモ`,
      content,
      generatedAt: new Date().toISOString(),
      resaleEnabled: true,
      type: "solana-daily" as const,
      originalPrice: 1.0,
    };

    await setMemo(cacheKey, memo, 86400);

    return NextResponse.json(memo);
  } catch (error) {
    console.error("Solana daily memo error:", error);
    return NextResponse.json({ error: "Failed to generate Solana daily memo" }, { status: 500 });
  }
}

export const GET = withX402(handler, SOLANA_WALLET, {
  price: "$1.00",
  network: "solana",
  config: { description: "APAC Daily Memo - Solana" },
});
