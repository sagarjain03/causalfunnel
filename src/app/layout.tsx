import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

// Onest instead of General Sans: General Sans' license (ITF FFL §02) forbids putting the font files in a public repo.
const onest = Onest({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CausalFunnel Analytics",
  description: "Session tracking and click heatmaps",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${onest.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
