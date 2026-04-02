import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Africa Intelligence Platform",
    template: "%s | Africa Intelligence Platform",
  },
  description:
    "AI-powered platform tracking governance, economy, health, and humanitarian signals across Africa. Daily briefs, verified partners, and actionable insights.",
  keywords: ["Africa", "intelligence", "SDG", "humanitarian", "data", "AI briefs"],
  authors: [{ name: "Africa Intelligence Platform" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Africa Intel",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Africa Intelligence Platform",
    title: "Africa Intelligence Platform",
    description:
      "Daily AI briefs, verified partners, and actionable insights for Africa.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1629",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
