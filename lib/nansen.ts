const NANSEN_BASE_URL = "https://api.nansen.ai/v2";

async function nansenFetch(path: string) {
  const res = await fetch(`${NANSEN_BASE_URL}${path}`, {
    headers: {
      "x-api-key": process.env.NANSEN_API_KEY!,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Nansen API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getApacDailyData() {
  const [baseFlows, solanaFlows, topWallets] = await Promise.allSettled([
    nansenFetch("/smart-money/token-flows?chain=base&period=1d"),
    nansenFetch("/smart-money/token-flows?chain=solana&period=1d"),
    nansenFetch("/smart-money/wallets?chain=base&limit=10"),
  ]);

  return {
    baseFlows: baseFlows.status === "fulfilled" ? baseFlows.value : null,
    solanaFlows: solanaFlows.status === "fulfilled" ? solanaFlows.value : null,
    topWallets: topWallets.status === "fulfilled" ? topWallets.value : null,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getWeeklyData() {
  const [baseFlows, solanaFlows, topTokens, topWallets] = await Promise.allSettled([
    nansenFetch("/smart-money/token-flows?chain=base&period=7d"),
    nansenFetch("/smart-money/token-flows?chain=solana&period=7d"),
    nansenFetch("/smart-money/tokens?chain=base&period=7d&limit=20"),
    nansenFetch("/smart-money/wallets?chain=base&limit=20&period=7d"),
  ]);

  return {
    baseFlows: baseFlows.status === "fulfilled" ? baseFlows.value : null,
    solanaFlows: solanaFlows.status === "fulfilled" ? solanaFlows.value : null,
    topTokens: topTokens.status === "fulfilled" ? topTokens.value : null,
    topWallets: topWallets.status === "fulfilled" ? topWallets.value : null,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getCustomData(
  target: string,
  chain: "base" | "polygon" | "solana"
) {
  const isWallet = target.length > 30;
  const [primary, secondary] = await Promise.allSettled([
    isWallet
      ? nansenFetch(`/wallet/${target}/transactions?chain=${chain}&limit=50`)
      : nansenFetch(`/token/${target}/holders?chain=${chain}&limit=50`),
    isWallet
      ? nansenFetch(`/wallet/${target}/portfolio?chain=${chain}`)
      : nansenFetch(`/token/${target}/smart-money?chain=${chain}`),
  ]);

  return {
    primary: primary.status === "fulfilled" ? primary.value : null,
    secondary: secondary.status === "fulfilled" ? secondary.value : null,
    target,
    chain,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getSolanaDailyData() {
  const [flows, topWallets, trending] = await Promise.allSettled([
    nansenFetch("/smart-money/token-flows?chain=solana&period=1d"),
    nansenFetch("/smart-money/wallets?chain=solana&limit=10"),
    nansenFetch("/smart-money/tokens?chain=solana&period=1d&limit=10"),
  ]);

  return {
    flows: flows.status === "fulfilled" ? flows.value : null,
    topWallets: topWallets.status === "fulfilled" ? topWallets.value : null,
    trending: trending.status === "fulfilled" ? trending.value : null,
    fetchedAt: new Date().toISOString(),
  };
}
