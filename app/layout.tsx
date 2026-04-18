import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic TTS Studio",
  description: "Chat-first local TTS studio powered by Next.js, LangChain, and local models.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
