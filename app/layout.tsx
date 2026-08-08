import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "真车主里程城市排行榜｜活动运营后台",
  description: "配置城市里程排行榜活动，查看司机里程与奖品发放结果。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
