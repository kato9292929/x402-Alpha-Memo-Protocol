import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getCustomData } from "@/lib/nansen";
import { generateCustomMemo } from "@/lib/claude";
import { getMemo, setMemo, getCustomKey, generateMemoId } from "@/lib/kv";
import { x402Server, WALLET_BASE, WALLET_SOLANA, BASE_NETWORK, SOLANA_NETWORK, CORS_HEADERS } from "@/lib/x402";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function handler(req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const body = await req.json();
    const { target, chain, focusArea } = body as {
      target: string;
      chain: "base" | "polygon" | "solana";
      focusArea: string;
    };

    if (!target || !chain || !focusArea) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cacheKey = getCustomKey(target, chain);
    const cached = await getMemo(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: CORS_HEADERS });
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

    return NextResponse.json(memo, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Custom memo error:", error);
    return NextResponse.json(
      { error: "Failed to generate custom memo", detail: String(error) },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}

export const POST = withX402(
  handler,
  {
    accepts: [
      { scheme: "exact", price: "$5.00", network: BASE_NETWORK, payTo: WALLET_BASE },
      { scheme: "exact", price: "$5.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
    ],
    description: "Custom Token/Wallet Alpha Report",
    mimeType: "application/json",
  },
  x402Server,
);
