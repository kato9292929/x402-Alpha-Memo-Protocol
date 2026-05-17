"use client";

import { useState } from "react";
import { PaymentSelector } from "./PaymentSelector";

interface ReportCardProps {
  tier: "daily" | "weekly" | "custom";
  title: string;
  subtitle: string;
  priceUsd: number;
  priceJpyc: number;
  tags: string[];
  preview: string;
  wordCount?: string;
  onPurchase: (chain: string, method: string, extra?: Record<string, string>) => Promise<void>;
}

export function ReportCard({
  tier,
  title,
  subtitle,
  priceUsd,
  priceJpyc,
  tags,
  preview,
  wordCount,
  onPurchase,
}: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedChain, setSelectedChain] = useState("base");
  const [selectedMethod, setSelectedMethod] = useState("USDC");
  const [customTarget, setCustomTarget] = useState("");
  const [customFocus, setCustomFocus] = useState("");

  async function handlePurchase() {
    setIsPurchasing(true);
    try {
      const extra =
        tier === "custom"
          ? { target: customTarget, focusArea: customFocus }
          : undefined;
      await onPurchase(selectedChain, selectedMethod, extra);
    } finally {
      setIsPurchasing(false);
    }
  }

  const tierLabel = {
    daily: "Daily Memo",
    weekly: "Weekly Deep Dive",
    custom: "Custom Alpha",
  }[tier];

  const tierColor = {
    daily: "text-[#2d5a3d]",
    weekly: "text-[#c8a96e]",
    custom: "text-[#8b2020]",
  }[tier];

  return (
    <article className="border border-[#1a1a1a]/15 bg-[#fafaf7] relative overflow-hidden paper-texture">
      {/* Tier badge */}
      <div className="border-b border-[#1a1a1a]/10 px-6 py-3 flex items-center justify-between">
        <span className={`text-xs font-mono uppercase tracking-widest ${tierColor}`}>
          {tierLabel}
        </span>
        {wordCount && (
          <span className="text-xs font-mono text-[#1a1a1a]/50 border border-[#1a1a1a]/20 px-2 py-0.5">
            {wordCount}
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Title */}
        <h2 className="font-serif text-xl text-[#1a1a1a] mb-1 leading-tight">{title}</h2>
        <p className="text-sm text-[#1a1a1a]/60 mb-4 font-mono">{subtitle}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="text-xs font-mono text-[#c8a96e] bg-[#c8a96e]/10 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        {/* Preview */}
        <div className="mb-4 relative">
          <p className="text-sm text-[#1a1a1a]/80 leading-relaxed">{preview}</p>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#fafaf7] to-transparent" />
        </div>

        {/* Custom input */}
        {tier === "custom" && (
          <div className="mb-4 space-y-2">
            <input
              type="text"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="トークンアドレスまたはウォレットアドレスを入力"
              className="w-full border border-[#1a1a1a]/20 bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#c8a96e]"
            />
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="分析フォーカス（例: ホルダー分布、スマートマネー動向）"
              className="w-full border border-[#1a1a1a]/20 bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#c8a96e]"
            />
          </div>
        )}

        {/* Price */}
        <div className="border-t border-b border-[#1a1a1a]/10 py-3 mb-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-serif font-bold text-[#1a1a1a]">
              ${priceUsd.toFixed(2)}
            </span>
            <span className="text-sm font-mono text-[#1a1a1a]/50">USDC</span>
            <span className="text-sm font-mono text-[#1a1a1a]/40">または</span>
            <span className="text-sm font-mono text-[#1a1a1a]/60">
              ¥{priceJpyc.toLocaleString("ja-JP")} JPYC
            </span>
          </div>
          <p className="text-xs font-mono text-[#1a1a1a]/40 mt-1">
            Base · Polygon · Solana対応
          </p>
        </div>

        {/* Payment selector */}
        {isExpanded && (
          <div className="mb-4">
            <PaymentSelector
              onSelect={(chain, method) => {
                setSelectedChain(chain);
                setSelectedMethod(method);
              }}
              disabled={isPurchasing}
            />
          </div>
        )}

        {/* CTA button */}
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-3 bg-[#1a1a1a] text-[#fafaf7] font-mono uppercase tracking-widest text-sm hover:bg-[#1a1a1a]/80 transition-colors"
          >
            購入する
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={isPurchasing || (tier === "custom" && (!customTarget || !customFocus))}
            className="w-full py-3 bg-[#c8a96e] text-[#1a1a1a] font-mono uppercase tracking-widest text-sm hover:bg-[#c8a96e]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPurchasing ? "処理中..." : `${selectedMethod}で決済 ($${priceUsd.toFixed(2)})`}
          </button>
        )}
      </div>
    </article>
  );
}
