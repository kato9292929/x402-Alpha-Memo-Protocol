import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getMemo, generateMemoId } from "@/lib/kv";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memoId, resellPriceUsd, sellerWallet } = body as {
      memoId: string;
      resellPriceUsd: number;
      sellerWallet: string;
    };

    if (!memoId || !resellPriceUsd || !sellerWallet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find memo by memoId
    const memoKey = `memo:id:${memoId}`;
    const memo = await kv.get<{
      content: string;
      resaleEnabled: boolean;
      originalPrice: number;
      title: string;
    }>(memoKey);

    if (!memo) {
      return NextResponse.json({ error: "Memo not found" }, { status: 404 });
    }

    if (!memo.resaleEnabled) {
      return NextResponse.json({ error: "This memo is not resale-enabled" }, { status: 403 });
    }

    if (resellPriceUsd < memo.originalPrice + 0.5) {
      return NextResponse.json(
        { error: `Minimum resell price is $${(memo.originalPrice + 0.5).toFixed(2)}` },
        { status: 400 }
      );
    }

    // Record resale listing
    const resaleId = generateMemoId();
    await kv.set(`resale:${resaleId}`, {
      memoId,
      resellPriceUsd,
      sellerWallet,
      protocolWallet: process.env.PROTOCOL_WALLET,
      protocolFeePercent: 20,
      sellerPercent: 80,
      listedAt: new Date().toISOString(),
      title: memo.title,
    }, { ex: 604800 }); // 7 days

    return NextResponse.json({
      success: true,
      resaleId,
      resellPriceUsd,
      sellerReceives: (resellPriceUsd * 0.8).toFixed(2),
      protocolReceives: (resellPriceUsd * 0.2).toFixed(2),
      buyerGets: memo.content,
    });
  } catch (error) {
    console.error("Resell error:", error);
    return NextResponse.json({ error: "Failed to process resale" }, { status: 500 });
  }
}
