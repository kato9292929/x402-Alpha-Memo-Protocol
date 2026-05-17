import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { getWeeklyData } from "@/lib/nansen";
import { generateWeeklyMemo } from "@/lib/claude";
import { getMemo, setMemo, getWeeklyKey, getTodayString, generateMemoId } from "@/lib/kv";

const WALLET = (process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

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
      return NextResponse.json(cached);
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

    return NextResponse.json(memo);
  } catch (error) {
    console.error("Weekly memo error:", error);
    return NextResponse.json({ error: "Failed to generate weekly memo" }, { status: 500 });
  }
}

export const GET = withX402(handler, WALLET, {
  price: "$3.00",
  network: "base",
  config: { description: "Weekly Deep Dive Report" },
});
