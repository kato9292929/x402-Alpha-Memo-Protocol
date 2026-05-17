import type { Metadata } from "next";
import "./globals.css";
import { WalletProviders } from "@/components/WalletProviders";

export const metadata: Metadata = {
  title: "Alpha Memo Protocol — オンチェーンリサーチ",
  description: "オンチェーンデータから生成されたリサーチレポートを購入・転売する",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
