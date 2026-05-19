import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, polygon } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "x402 Alpha Memo Protocol",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
  chains: [base, polygon],
  ssr: true,
});
