import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import { createFacilitatorConfig } from "@coinbase/x402";

function buildFacilitatorConfig() {
  if (process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET) {
    return createFacilitatorConfig(
      process.env.CDP_API_KEY_ID,
      process.env.CDP_API_KEY_SECRET
    );
  }
  const url =
    process.env.FACILITATOR_URL ??
    "https://api.cdp.coinbase.com/platform/v2/x402";
  return { url: url as `${string}://${string}` };
}

const facilitatorClient = new HTTPFacilitatorClient(buildFacilitatorConfig());

export const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);
registerExactSvmScheme(x402Server);

export const WALLET_BASE = (
  process.env.WALLET_ADDRESS_BASE ??
  process.env.WALLET_ADDRESS ??
  "0xC67d94504696960bA0f2e7C3FeE703950734c00A"
) as `0x${string}`;

export const WALLET_SOLANA =
  process.env.WALLET_ADDRESS_SOLANA ??
  "4s8XQC2WzRfgH8Xiep7ybnCW11VKRCMwxQF6jknx3VPf";

export const BASE_NETWORK = "eip155:8453" as const;
export const SOLANA_NETWORK =
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT, X-PAYMENT-RESPONSE",
} as const;
