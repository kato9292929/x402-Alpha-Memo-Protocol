import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateDailyMemo(nansenData: object, date: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `あなたは暗号資産リサーチアナリストです。以下のオンチェーンデータを元に、
日本語で約800字のデイリーリサーチメモを作成してください。

形式（必ず守ること）:
# ${date} APACオンチェーンデイリーメモ
## 今日のサマリー（200字以内）
## スマートマネーの動き
## 注目すべきウォレット動向
## 明日への示唆

データ: ${JSON.stringify(nansenData, null, 2)}

注意: 投資を推奨する表現は使わないこと。事実ベースの分析のみ。`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export async function generateWeeklyMemo(nansenData: object, dateRange: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    messages: [
      {
        role: "user",
        content: `あなたは暗号資産リサーチアナリストです。以下の7日間のオンチェーンデータを元に、
日本語で約3,000字の週次ディープダイブレポートを作成してください。

形式（必ず守ること）:
# ${dateRange} 週次スマートマネー行動分析レポート
## エグゼクティブサマリー（300字以内）
## 週次マクロトレンド
## スマートマネーの主要動向
### Base/EVM動向
### Solana動向
## 注目トークン分析（上位3-5銘柄）
## ウォレット行動パターン分析
## リスクファクターと注意点
## 来週への示唆

データ: ${JSON.stringify(nansenData, null, 2)}

注意: 投資を推奨する表現は使わないこと。事実ベースの分析のみ。`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export async function generateCustomMemo(
  nansenData: object,
  target: string,
  chain: string,
  focusArea: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `あなたは暗号資産リサーチアナリストです。以下のオンチェーンデータを元に、
指定されたターゲットについて日本語で約1,500字のカスタム分析レポートを作成してください。

ターゲット: ${target}
チェーン: ${chain}
フォーカスエリア: ${focusArea}

形式（必ず守ること）:
# カスタム分析レポート: ${target.slice(0, 10)}...
## ターゲット概要
## オンチェーン活動分析
## スマートマネーとの関連性
## ${focusArea}に関する詳細分析
## 総合評価

データ: ${JSON.stringify(nansenData, null, 2)}

注意: 投資を推奨する表現は使わないこと。事実ベースの分析のみ。`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
