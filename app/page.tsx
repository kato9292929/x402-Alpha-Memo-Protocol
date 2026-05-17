"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ReportCard } from "@/components/ReportCard";
import { ReportViewer } from "@/components/ReportViewer";

interface MemoRecord {
  memoId: string;
  title: string;
  content: string;
  generatedAt: string;
  resaleEnabled: boolean;
  originalPrice: number;
}

export default function Home() {
  const [volNumber, setVolNumber] = useState(1);
  const [currentReport, setCurrentReport] = useState<MemoRecord | null>(null);
  const [jpycPrices, setJpycPrices] = useState({ daily: 150, weekly: 450, custom: 750 });

  useEffect(() => {
    // Calculate vol number from epoch
    const startEpoch = new Date("2025-01-01").getTime();
    const vol = Math.floor((Date.now() - startEpoch) / (1000 * 60 * 60 * 24));
    setVolNumber(vol);

    // Fetch JPYC prices
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=jpyc&vs_currencies=usd")
      .then((r) => r.json())
      .then((data) => {
        if (data?.jpyc?.usd) {
          const rate = 1 / data.jpyc.usd;
          setJpycPrices({
            daily: Math.ceil(1.0 * rate),
            weekly: Math.ceil(3.0 * rate),
            custom: Math.ceil(5.0 * rate),
          });
        }
      })
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  async function handlePurchase(
    tier: "daily" | "weekly" | "custom",
    chain: string,
    method: string,
    extra?: Record<string, string>
  ) {
    const endpoint =
      tier === "daily"
        ? chain === "solana"
          ? "/api/memo/solana/daily"
          : "/api/memo/daily"
        : tier === "weekly"
        ? "/api/memo/weekly"
        : "/api/memo/custom";

    const options: RequestInit =
      tier === "custom"
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target: extra?.target,
              chain,
              focusArea: extra?.focusArea,
            }),
          }
        : { method: "GET" };

    try {
      const res = await fetch(endpoint, options);
      if (res.ok) {
        const data = await res.json();
        setCurrentReport(data);
      } else if (res.status === 402) {
        // x402 payment required — in production, wallet triggers here
        alert(
          "お支払いが必要です。ウォレットを接続してx402プロトコルで決済してください。\n（本番環境ではウォレットが自動で起動します）"
        );
      } else {
        const err = await res.json();
        alert(`エラー: ${err.error || "不明なエラー"}`);
      }
    } catch (e) {
      console.error(e);
      alert("ネットワークエラーが発生しました");
    }
  }

  if (currentReport) {
    return (
      <div className="min-h-screen bg-[#fafaf7] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentReport(null)}
            className="mb-8 text-xs font-mono uppercase tracking-widest text-[#1a1a1a]/50 hover:text-[#1a1a1a] flex items-center gap-2"
          >
            ← 一覧に戻る
          </button>
          <ReportViewer
            memoId={currentReport.memoId}
            title={currentReport.title}
            content={currentReport.content}
            generatedAt={currentReport.generatedAt}
            originalPrice={currentReport.originalPrice}
            resaleEnabled={currentReport.resaleEnabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Masthead */}
      <header className="border-b-2 border-[#1a1a1a] px-6 py-8 max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a]/20 pb-4">
          <div className="flex items-center gap-6">
            <span className="text-xs font-mono text-[#1a1a1a]/50 uppercase tracking-widest">
              {today}
            </span>
            <span className="text-xs font-mono text-[#1a1a1a]/30">|</span>
            <span className="text-xs font-mono text-[#1a1a1a]/50 uppercase tracking-widest">
              Vol. {volNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 no-print">
            <ConnectButton chainStatus="icon" showBalance={false} />
            <WalletMultiButton
              style={{
                background: "#1a1a1a",
                borderRadius: 0,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "12px",
                height: "40px",
                letterSpacing: "0.1em",
              }}
            />
          </div>
        </div>

        {/* Title block */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex-1 h-px bg-[#1a1a1a]/20" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#c8a96e]">
              x402 Protocol
            </span>
            <div className="flex-1 h-px bg-[#1a1a1a]/20" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-black text-[#1a1a1a] leading-none tracking-tight mb-2">
            <span className="alpha-badge">ALPHA</span>
            {" "}MEMO
          </h1>
          <h1 className="font-serif text-5xl md:text-7xl font-black text-[#1a1a1a] leading-none tracking-tight mb-4">
            PROTOCOL
          </h1>

          <p className="font-mono text-sm text-[#1a1a1a]/60 max-w-xl mx-auto leading-relaxed">
            オンチェーンデータから生成されたリサーチレポートを購入・転売する
          </p>
        </div>

        {/* Payment notice */}
        <div className="mt-6 pt-4 border-t border-[#1a1a1a]/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-[#1a1a1a]/50">
            <span>⬡ SolanaネットワークではUSDC決済のみ</span>
            <span className="hidden sm:block text-[#1a1a1a]/20">|</span>
            <span>⬡ Base・PolygonではUSDCまたはJPYCでお支払い可能</span>
          </div>
        </div>
      </header>

      {/* Resale banner */}
      <div className="bg-[#1a1a1a] text-[#fafaf7] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[#c8a96e] font-serif text-lg font-bold">転売可能</span>
            <span className="text-[#fafaf7]/60 font-mono text-xs">
              購入したレポートは転売可能です
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-[#fafaf7]/60">
            <span>転売時に販売額の<span className="text-[#c8a96e] font-bold">20%</span>がプロトコルへ還元</span>
            <span>差額はあなたの収益に</span>
          </div>
        </div>
      </div>

      {/* Report listings */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Memo */}
          <ReportCard
            tier="daily"
            title="APACデイリーオンチェーンサマリー"
            subtitle="Base + Solana チェーンの日次データ分析"
            priceUsd={1.0}
            priceJpyc={jpycPrices.daily}
            tags={["#SmartMoney", "#APAC", "#Daily"]}
            preview="本日のAPACオンチェーン市場において、スマートマネーウォレットが注目すべき動きを見せています。BaseおよびSolanaチェーン上での資金フローを詳細に分析し..."
            onPurchase={(chain, method) => handlePurchase("daily", chain, method)}
          />

          {/* Weekly Deep Dive */}
          <ReportCard
            tier="weekly"
            title="週次スマートマネー行動分析レポート"
            subtitle="7日間のオンチェーンデータ深掘り分析"
            priceUsd={3.0}
            priceJpyc={jpycPrices.weekly}
            tags={["#WeeklyAlpha", "#NansenData", "#SmartMoney"]}
            preview="過去7日間のスマートマネー動向を包括的に分析します。Base/EVMおよびSolanaエコシステムにおける主要ウォレットの行動パターン、注目トークンへの資金流入..."
            wordCount="約3,000字"
            onPurchase={(chain, method) => handlePurchase("weekly", chain, method)}
          />

          {/* Custom Alpha */}
          <ReportCard
            tier="custom"
            title="カスタムトークン・ウォレット分析"
            subtitle="指定アドレスのオンチェーンデータをAIが詳細分析"
            priceUsd={5.0}
            priceJpyc={jpycPrices.custom}
            tags={["#CustomAlpha", "#Bespoke", "#OnDemand"]}
            preview="トークンアドレスまたはウォレットアドレスを指定すると、Nansenのオンチェーンデータを基にClaudeが専用の分析レポートを生成します..."
            onPurchase={(chain, method, extra) => handlePurchase("custom", chain, method, extra)}
          />
        </div>

        {/* How it works section */}
        <div className="mt-16 border-t border-[#1a1a1a]/10 pt-12">
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "ウォレット接続", desc: "EVMはRainbowKit、SolanaはPhantom/Backpackで接続" },
              { num: "02", title: "レポート選択", desc: "Daily/Weekly/Customから用途に合わせて選択" },
              { num: "03", title: "x402決済", desc: "USDC/JPYCでシームレスなマイクロペイメント" },
              { num: "04", title: "転売で収益化", desc: "購入レポートを転売し差額を収益として獲得" },
            ].map((step) => (
              <div key={step.num} className="border border-[#1a1a1a]/10 p-5">
                <span className="text-xs font-mono text-[#c8a96e] block mb-3">{step.num}</span>
                <h3 className="font-serif text-base text-[#1a1a1a] mb-2">{step.title}</h3>
                <p className="text-xs font-mono text-[#1a1a1a]/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* x402scan marketplace links */}
        <div className="mt-12 border border-[#c8a96e]/30 bg-[#c8a96e]/5 p-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#c8a96e] mb-4">
            x402scan Marketplace
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { path: "/api/memo/daily", price: "$1.00", network: "Base", desc: "APAC Daily" },
              { path: "/api/memo/weekly", price: "$3.00", network: "Base", desc: "Weekly Deep Dive" },
              { path: "/api/memo/custom", price: "$5.00", network: "Base", desc: "Custom Alpha" },
              { path: "/api/memo/solana/daily", price: "$1.00", network: "Solana", desc: "Solana Daily" },
            ].map((endpoint) => (
              <div key={endpoint.path} className="border border-[#1a1a1a]/10 p-3 bg-[#fafaf7]">
                <p className="font-mono text-xs text-[#c8a96e] font-bold">{endpoint.price}</p>
                <p className="font-mono text-xs text-[#1a1a1a] mt-1">{endpoint.desc}</p>
                <p className="font-mono text-xs text-[#1a1a1a]/40 mt-1">{endpoint.network}</p>
                <p className="font-mono text-xs text-[#1a1a1a]/30 mt-1 truncate">{endpoint.path}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a]/10 px-6 py-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-[#1a1a1a]/40">
            Alpha Memo Protocol — Powered by x402 · Nansen · Claude AI
          </p>
          <p className="font-mono text-xs text-[#1a1a1a]/30">
            本サービスは投資助言を提供しません。事実ベースの分析のみです。
          </p>
        </div>
      </footer>
    </div>
  );
}
