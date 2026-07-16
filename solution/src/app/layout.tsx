import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

// Brand Guidelines 2026 — display/title typeface, not distributed via Google Fonts.
const lustria = localFont({
  src: "../fonts/Lustria-Regular.ttf",
  display: "swap",
  variable: "--font-lustria",
  declarations: [{ prop: "font-family", value: "'Lustria'" }],
});

export const metadata: Metadata = {
  title: "Tellian Capital Solutions",
  description:
    "Unabhängig aus Prinzip — Tellian Capital Solutions verschafft Zugang zu Anlagelösungen auf Aktien, Zinsen, Credit, Währungen, Rohstoffe und Fonds.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${cormorant.variable} ${inter.variable} ${lustria.variable}`}>
      <body>{children}</body>
    </html>
  );
}
