import { NextResponse } from "next/server";
import { getApacDailyData, getSolanaDailyData } from "@/lib/nansen";
import { generateDailyMemo } from "@/lib/claude";
import { setMemo, getDailyKey, getSolanaDailyKey, getTodayString, generateMemoId } from "@/lib/kv";

export async function GET() {
  try {
    const today = getTodayString();

    const [evmData, solanaData] = await Promise.all([
      getApacDailyData(),
      getSolanaDailyData(),
    ]);

    const [evmContent, solanaContent] = await Promise.all([
      generateDailyMemo(evmData, today),
      generateDailyMemo(solanaData, today),
    ]);

    const evmMemo = {
      memoId: generateMemoId(),
      title: `${today} APACオンチェーンデイリーメモ`,
      content: evmContent,
      generatedAt: new Date().toISOString(),
      resaleEnabled: true,
      type: "daily" as const,
      originalPrice: 1.0,
    };

    const solanaMemo = {
      memoId: generateMemoId(),
      title: `${today} Solana APACオンチェーンデイリーメモ`,
      content: solanaContent,
      generatedAt: new Date().toISOString(),
      resaleEnabled: true,
      type: "solana-daily" as const,
      originalPrice: 1.0,
    };

    await Promise.all([
      setMemo(getDailyKey(today), evmMemo, 86400),
      setMemo(getSolanaDailyKey(today), solanaMemo, 86400),
    ]);

    return NextResponse.json({ success: true, generated: ["daily", "solana-daily"] });
  } catch (error) {
    console.error("Cron daily memo error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
