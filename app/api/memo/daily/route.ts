import { NextResponse } from "next/server";
import { getApacDailyData } from "@/lib/nansen";
import { generateDailyMemo } from "@/lib/claude";
import { getMemo, setMemo, getDailyKey, getTodayString, generateMemoId } from "@/lib/kv";

export async function GET() {
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
