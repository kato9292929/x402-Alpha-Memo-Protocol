"use client";

import { useState } from "react";

interface ResellModalProps {
  memoId: string;
  minPrice: number;
  onClose: () => void;
}

export function ResellModal({ memoId, minPrice, onClose }: ResellModalProps) {
  const [price, setPrice] = useState(minPrice.toFixed(2));
  const [wallet, setWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit() {
    const priceNum = parseFloat(price);
    if (priceNum < minPrice) return;
    if (!wallet) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/memo/resell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoId,
          resellPriceUsd: priceNum,
          sellerWallet: wallet,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          success: true,
          message: `転売リスティング完了。販売価格: $${priceNum.toFixed(2)} · あなたの収益: $${data.sellerReceives} · プロトコル手数料: $${data.protocolReceives}`,
        });
      } else {
        setResult({ success: false, message: data.error || "エラーが発生しました" });
      }
    } catch {
      setResult({ success: false, message: "ネットワークエラー" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const priceNum = parseFloat(price) || 0;
  const sellerReceives = (priceNum * 0.8).toFixed(2);
  const protocolReceives = (priceNum * 0.2).toFixed(2);

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/50 flex items-center justify-center z-50">
      <div className="bg-[#fafaf7] border border-[#1a1a1a]/20 p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-[#1a1a1a]">レポートを転売する</h2>
          <button onClick={onClose} className="text-[#1a1a1a]/50 hover:text-[#1a1a1a] font-mono">
            ✕
          </button>
        </div>

        {result ? (
          <div
            className={`p-4 border ${
              result.success
                ? "border-[#2d5a3d] bg-[#2d5a3d]/10"
                : "border-[#8b2020] bg-[#8b2020]/10"
            }`}
          >
            <p className="text-sm font-mono text-[#1a1a1a]">{result.message}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-[#1a1a1a] text-[#fafaf7] font-mono text-sm"
            >
              閉じる
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#1a1a1a]/50 block mb-2">
                販売価格 (USD) — 最低 ${minPrice.toFixed(2)}
              </label>
              <input
                type="number"
                min={minPrice}
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-[#1a1a1a]/20 bg-transparent px-3 py-2 font-mono text-[#1a1a1a] focus:outline-none focus:border-[#c8a96e]"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#1a1a1a]/50 block mb-2">
                受取ウォレットアドレス
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x... または Solana アドレス"
                className="w-full border border-[#1a1a1a]/20 bg-transparent px-3 py-2 font-mono text-[#1a1a1a] text-sm focus:outline-none focus:border-[#c8a96e]"
              />
            </div>

            {priceNum >= minPrice && (
              <div className="border border-[#1a1a1a]/10 p-3 bg-[#1a1a1a]/5">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-[#1a1a1a]/60">あなたの収益 (80%)</span>
                  <span className="text-[#2d5a3d] font-bold">${sellerReceives}</span>
                </div>
                <div className="flex justify-between text-sm font-mono mt-1">
                  <span className="text-[#1a1a1a]/60">プロトコル手数料 (20%)</span>
                  <span className="text-[#1a1a1a]/60">${protocolReceives}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || priceNum < minPrice || !wallet}
              className="w-full py-3 bg-[#c8a96e] text-[#1a1a1a] font-mono uppercase tracking-widest text-sm hover:bg-[#c8a96e]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "処理中..." : "転売リスティングを作成"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
