import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { LanguageProvider } from "@/i18n/LanguageContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tellian Capital | Unabhängige Vermögensverwaltung Zürich",
  description:
    "Unabhängige Vermögensverwaltung in Zürich seit 1996. Spezialisiert auf individuelle Portfoliolösungen mit Core/Satelliten-Struktur.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();
  const showVisualEditing = isEnabled || process.env.NODE_ENV === "development";

  return (
    <html lang="de" className={`h-full ${cormorant.variable} ${inter.variable}`}>
      <body className="h-full">
        <LanguageProvider>{children}</LanguageProvider>
        {showVisualEditing && <VisualEditing />}
      </body>
    </html>
  );
}
