import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { getApacDailyData } from "@/lib/nansen";
import { generateDailyMemo } from "@/lib/claude";
import { getMemo, setMemo, getDailyKey, getTodayString, generateMemoId } from "@/lib/kv";

const WALLET = (process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

async function handler(_req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const today = getTodayString();
    const cacheKey = getDailyKey(today);

    const cached = await getMemo(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
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

    return NextResponse.json(memo);
  } catch (error) {
    console.error("Daily memo error:", error);
    return NextResponse.json({ error: "Failed to generate daily memo" }, { status: 500 });
  }
}

export const GET = withX402(handler, WALLET, {
  price: "$1.00",
  network: "base",
  config: { description: "APAC Daily Memo" },
});
