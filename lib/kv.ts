import { kv } from "@vercel/kv";

export interface MemoRecord {
  memoId: string;
  title: string;
  content: string;
  generatedAt: string;
  resaleEnabled: boolean;
  type: "daily" | "weekly" | "custom" | "solana-daily";
  resalePrice?: number;
  originalPrice: number;
  sellerWallet?: string;
}

export async function getMemo(key: string): Promise<MemoRecord | null> {
  try {
    return await kv.get<MemoRecord>(key);
  } catch {
    return null;
  }
}

export async function setMemo(key: string, memo: MemoRecord, ttlSeconds = 86400): Promise<void> {
  try {
    await kv.set(key, memo, { ex: ttlSeconds });
  } catch (err) {
    console.error("KV set error:", err);
  }
}

export function getDailyKey(date: string): string {
  return `memo:daily:${date}`;
}

export function getWeeklyKey(date: string): string {
  return `memo:weekly:${date}`;
}

export function getSolanaDailyKey(date: string): string {
  return `memo:solana:daily:${date}`;
}

export function getCustomKey(target: string, chain: string): string {
  return `memo:custom:${chain}:${target.slice(0, 20)}`;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function generateMemoId(): string {
  return `memo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
