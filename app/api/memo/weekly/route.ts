import { NextResponse } from "next/server";
import { getWeeklyData } from "@/lib/nansen";
import { generateWeeklyMemo } from "@/lib/claude";
import { getMemo, setMemo, getWeeklyKey, getTodayString, generateMemoId } from "@/lib/kv";

export async function GET() {
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
