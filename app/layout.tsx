import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "열 이동 배달 추적소",
  description: "온도표를 따라 열이 간 방향을 찾아요.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
