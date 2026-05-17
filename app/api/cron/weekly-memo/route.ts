import { NextResponse } from "next/server";
import { getWeeklyData } from "@/lib/nansen";
import { generateWeeklyMemo } from "@/lib/claude";
import { setMemo, getWeeklyKey, getTodayString, generateMemoId } from "@/lib/kv";

export async function GET() {
  try {
    const today = getTodayString();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const dateRange = `${weekStartStr}〜${today}`;

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

    await setMemo(getWeeklyKey(today), memo, 86400);

    return NextResponse.json({ success: true, generated: ["weekly"] });
  } catch (error) {
    console.error("Cron weekly memo error:", error);
    return NextResponse.json({ error: "Weekly cron job failed" }, { status: 500 });
  }
}
