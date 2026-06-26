import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ModeProvider } from "@/components/ModeProvider";
import { PostHogProvider } from "@/lib/analytics";

const bricolageGrotesque = Bricolage_Grotesque({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "TEME | P2P Dev & Idea Roulette",
  description: "A volatile, anonymous 1-on-1 network for developers and idea pitchers. Find co-founders, pair program, or just vibe with verified peers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolageGrotesque.variable} ${ibmPlexMono.variable}`}>
        <ModeProvider />
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
