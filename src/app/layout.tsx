import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { SITE_URL, BUSINESS } from "@/lib/seo";

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

// Brand Guidelines 2026 — display/title typeface, not distributed via Google Fonts.
const lustria = localFont({
  src: "../fonts/Lustria-Regular.ttf",
  display: "swap",
  variable: "--font-lustria",
  declarations: [{ prop: "font-family", value: "'Lustria'" }],
});

const DEFAULT_TITLE = "Tellian Capital | Unabhängige Vermögensverwaltung Zürich";
const DEFAULT_DESCRIPTION =
  "Unabhängige Vermögensverwaltung in Zürich seit 1996. Spezialisiert auf individuelle Portfoliolösungen mit Core/Satelliten-Struktur.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | Tellian Capital" },
  description: DEFAULT_DESCRIPTION,
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.legalName, url: SITE_URL }],
  keywords: [
    "Vermögensverwaltung",
    "Vermögensverwaltung Zürich",
    "Unabhängige Vermögensverwaltung",
    "Anlagestrategien",
    "Finanzberatung Zürich",
    "Wealth Management",
    "Wealth Management Zurich",
    "Asset Management Switzerland",
    "Tellian Capital",
  ],
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: BUSINESS.name,
    images: [{ url: "/TellianCapital-Logo.png", width: 1200, height: 630, alt: BUSINESS.name }],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/TellianCapital-Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  /* Paste real tokens here or via env. The literal placeholders that were here
     before would have made Search Console reject the site, so they're removed. */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  icons: { icon: "/TellianCapital-Logo.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();
  const showVisualEditing = isEnabled || process.env.NODE_ENV === "development";

  return (
    <html lang="de" className={`h-full ${cormorant.variable} ${inter.variable} ${lustria.variable}`}>
      <body className="h-full">
        <LanguageProvider>{children}</LanguageProvider>
        {showVisualEditing && <VisualEditing />}
      </body>
    </html>
  );
}
