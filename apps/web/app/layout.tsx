import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'flag-icons/css/flag-icons.min.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AfricaImpactLab",
    template: "%s | AfricaImpactLab",
  },
  description:
    "Daily AI briefs, verified partners, and actionable data insights on Africa — grounded in UN, World Bank, WHO, ACLED, IMF and UNHCR data.",
  keywords: ["Africa", "impact", "SDG", "humanitarian", "data", "AI briefs", "AfricaImpactLab"],
  authors: [{ name: "AfricaImpactLab" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AfricaImpactLab",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AfricaImpactLab",
    title: "AfricaImpactLab — Africa Data & Impact Intelligence",
    description:
      "Daily AI briefs, verified partners, and actionable insights — grounded in live data from UN, World Bank, WHO, ACLED and more.",
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
