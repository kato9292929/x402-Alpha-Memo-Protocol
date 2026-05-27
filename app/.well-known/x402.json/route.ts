import { NextResponse } from "next/server";
import { WALLET_BASE, WALLET_SOLANA, BASE_NETWORK, SOLANA_NETWORK, CORS_HEADERS } from "@/lib/x402";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const endpoints = [
    {
      path: "/api/memo/daily",
      method: "GET",
      description: "APAC Daily Onchain Memo — Base + Solana chains, 24h cached",
      accepts: [
        { scheme: "exact", price: "$1.00", network: BASE_NETWORK, payTo: WALLET_BASE },
        { scheme: "exact", price: "$1.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
      ],
    },
    {
      path: "/api/memo/weekly",
      method: "GET",
      description: "Weekly Smart Money Deep Dive Report (~3,000 chars)",
      accepts: [
        { scheme: "exact", price: "$3.00", network: BASE_NETWORK, payTo: WALLET_BASE },
        { scheme: "exact", price: "$3.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
      ],
    },
    {
      path: "/api/memo/custom",
      method: "POST",
      description: "Custom Token/Wallet Analysis — specify target address + chain",
      accepts: [
        { scheme: "exact", price: "$5.00", network: BASE_NETWORK, payTo: WALLET_BASE },
        { scheme: "exact", price: "$5.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
      ],
    },
    {
      path: "/api/memo/solana/daily",
      method: "GET",
      description: "APAC Daily Onchain Memo — Solana-focused data",
      accepts: [
        { scheme: "exact", price: "$1.00", network: BASE_NETWORK, payTo: WALLET_BASE },
        { scheme: "exact", price: "$1.00", network: SOLANA_NETWORK, payTo: WALLET_SOLANA },
      ],
    },
  ];

  return NextResponse.json(
    { x402Version: 2, endpoints },
    { headers: CORS_HEADERS }
  );
}
