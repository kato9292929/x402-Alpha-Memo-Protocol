import { NextResponse } from "next/server";
import { getSolanaDailyData } from "@/lib/nansen";
import { generateDailyMemo } from "@/lib/claude";
import { getMemo, setMemo, getSolanaDailyKey, getTodayString, generateMemoId } from "@/lib/kv";

export async function GET() {
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
