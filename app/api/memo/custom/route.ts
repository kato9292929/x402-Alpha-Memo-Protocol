import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { getCustomData } from "@/lib/nansen";
import { generateCustomMemo } from "@/lib/claude";
import { getMemo, setMemo, getCustomKey, generateMemoId } from "@/lib/kv";

const WALLET = (process.env.WALLET_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

async function handler(req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const body = await req.json();
    const { target, chain, focusArea } = body as {
      target: string;
      chain: "base" | "polygon" | "solana";
      focusArea: string;
    };

    if (!target || !chain || !focusArea) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cacheKey = getCustomKey(target, chain);
    const cached = await getMemo(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const nansenData = await getCustomData(target, chain);
    const content = await generateCustomMemo(nansenData, target, chain, focusArea);

    const memo = {
      memoId: generateMemoId(),
      title: `カスタム分析: ${target.slice(0, 20)}... (${chain})`,
      content,
      generatedAt: new Date().toISOString(),
      resaleEnabled: true,
      type: "custom" as const,
      originalPrice: 5.0,
    };

    await setMemo(cacheKey, memo, 3600);

    return NextResponse.json(memo);
  } catch (error) {
    console.error("Custom memo error:", error);
    return NextResponse.json({ error: "Failed to generate custom memo" }, { status: 500 });
  }
}

export const POST = withX402(handler, WALLET, {
  price: "$5.00",
  network: "base",
  config: { description: "Custom Alpha Report" },
});
