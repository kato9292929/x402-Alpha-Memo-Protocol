import { paymentMiddleware } from "x402-next";

export const middleware = paymentMiddleware(
  (process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  {
    "/api/memo/daily": {
      price: "$1.00",
      network: "base",
      config: {
        description: "APAC Daily Memo",
      },
    },
    "/api/memo/weekly": {
      price: "$3.00",
      network: "base",
      config: {
        description: "Weekly Deep Dive Report",
      },
    },
    "/api/memo/custom": {
      price: "$5.00",
      network: "base",
      config: {
        description: "Custom Alpha Report",
      },
    },
    "/api/memo/solana/daily": {
      price: "$1.00",
      network: "solana",
      config: {
        description: "APAC Daily Memo - Solana",
      },
    },
  },
  {
    url: (process.env.FACILITATOR_URL || "https://x402.org/facilitator") as `${string}://${string}`,
  }
);

export const config = {
  matcher: [
    "/api/memo/daily",
    "/api/memo/weekly",
    "/api/memo/custom",
    "/api/memo/solana/daily",
  ],
};
