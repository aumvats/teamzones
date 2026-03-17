import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TeamZones — See your remote team at a glance",
  description:
    "Real-time dashboard showing your remote team's local times, weather, and upcoming public holidays. Find meeting overlaps across timezones instantly.",
  keywords: [
    "timezone dashboard",
    "remote team",
    "meeting overlap finder",
    "public holidays",
    "distributed team",
    "timezone converter",
    "team awareness",
  ],
  openGraph: {
    title: "TeamZones",
    description: "See your remote team at a glance — live clocks, weather, and holidays in one dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeamZones",
    description: "See your remote team at a glance — live clocks, weather, and holidays in one dashboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${inter.variable} font-body antialiased bg-bg text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
