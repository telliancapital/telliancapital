import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { LanguageProvider } from "@/context/LanguageContext";
import { ZweiZeilen } from "@/components/ZweiZeilen";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

/* Lustria (mit echter Kursive) und Inter-Variable laufen über
   @font-face in src/styles/fonts.css — 1:1 wie die Hauptseite. */

export const metadata: Metadata = {
  title: "Tellian Capital Solutions",
  description:
    "Unabhängig aus Prinzip — Tellian Capital Solutions verschafft Zugang zu Anlagelösungen auf Aktien, Zinsen, Credit, Währungen, Rohstoffe und Fonds.",
  icons: { icon: "/solutions/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode();
  const showVisualEditing = isEnabled || process.env.NODE_ENV === "development";

  return (
    <html lang="de" className={`h-full ${cormorant.variable}`}>
      <body className="h-full">
        <LanguageProvider>{children}</LanguageProvider>
        <ZweiZeilen />
        {showVisualEditing && <VisualEditing />}
      </body>
    </html>
  );
}
