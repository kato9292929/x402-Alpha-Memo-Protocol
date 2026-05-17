"use client";

import { useState } from "react";

type Chain = "base" | "polygon" | "solana";
type PaymentMethod = "USDC" | "JPYC";

const CHAIN_PAYMENT_OPTIONS: Record<Chain, PaymentMethod[]> = {
  base: ["USDC", "JPYC"],
  polygon: ["USDC", "JPYC"],
  solana: ["USDC"],
};

interface PaymentSelectorProps {
  onSelect: (chain: Chain, method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentSelector({ onSelect, disabled }: PaymentSelectorProps) {
  const [selectedChain, setSelectedChain] = useState<Chain>("base");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("USDC");
  const [showSolanaBanner, setShowSolanaBanner] = useState(false);

  function onChainSelect(chain: Chain) {
    setSelectedChain(chain);
    if (chain === "solana") {
      setSelectedMethod("USDC");
      setShowSolanaBanner(true);
    } else {
      setShowSolanaBanner(false);
    }
    onSelect(chain, chain === "solana" ? "USDC" : selectedMethod);
  }

  function onMethodSelect(method: PaymentMethod) {
    if (selectedChain === "solana" && method === "JPYC") return;
    setSelectedMethod(method);
    onSelect(selectedChain, method);
  }

  const chains: Chain[] = ["base", "polygon", "solana"];
  const methods: PaymentMethod[] = ["USDC", "JPYC"];

  return (
    <div className="space-y-3">
      {/* Chain selector */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#1a1a1a]/50 mb-2 font-mono">
          ネットワーク選択
        </p>
        <div className="flex gap-2">
          {chains.map((chain) => (
            <button
              key={chain}
              onClick={() => onChainSelect(chain)}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-mono uppercase border transition-colors ${
                selectedChain === chain
                  ? "bg-[#1a1a1a] text-[#fafaf7] border-[#1a1a1a]"
                  : "bg-transparent text-[#1a1a1a] border-[#1a1a1a]/30 hover:border-[#1a1a1a]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>

      {/* Payment method selector */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#1a1a1a]/50 mb-2 font-mono">
          決済通貨
        </p>
        <div className="flex gap-2">
          {methods.map((method) => {
            const isDisabled =
              disabled ||
              (selectedChain === "solana" && method === "JPYC");
            return (
              <button
                key={method}
                onClick={() => onMethodSelect(method)}
                disabled={isDisabled}
                title={
                  selectedChain === "solana" && method === "JPYC"
                    ? "JPYCはSolanaネットワークでは使用できません"
                    : undefined
                }
                className={`px-4 py-2 text-sm font-mono uppercase border transition-colors ${
                  selectedMethod === method && !isDisabled
                    ? "bg-[#c8a96e] text-[#1a1a1a] border-[#c8a96e]"
                    : isDisabled
                    ? "bg-transparent text-[#1a1a1a]/30 border-[#1a1a1a]/15 cursor-not-allowed"
                    : "bg-transparent text-[#1a1a1a] border-[#1a1a1a]/30 hover:border-[#c8a96e]"
                }`}
              >
                {method}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#1a1a1a]/40 mt-1 font-mono">
          jpycはpolygonネットワーク上で決済されます
        </p>
      </div>

      {/* Solana banner */}
      {showSolanaBanner && (
        <div className="border border-[#c8a96e]/50 bg-[#c8a96e]/10 p-3">
          <p className="text-xs font-mono text-[#1a1a1a]/70">
            ⚠ SolanaネットワークではUSDC決済のみご利用いただけます
          </p>
        </div>
      )}
    </div>
  );
}
