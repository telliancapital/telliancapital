import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import { DraftVisualEditing } from "@/components/DraftVisualEditing";
import { draftMode } from "next/headers";
import { preload } from "react-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/types";
import { SITE_URL, BUSINESS } from "@/lib/seo";

/* Two root layouts share this shell — app/(de)/layout.tsx and
   app/(en)/layout.tsx — so the server-rendered <html lang> matches the
   page language (crawlers don't run the client-side lang sync in
   LanguageProvider). Navigating between the two groups is a full page
   load; the in-page language switch uses history.replaceState and stays
   in whichever layout it started in. */

/* Schriften (1:1 zum Redesign, DesignTellian/src/styles/fonts.css):
   Lustria (plus echte Kursive aus Cormorant Garamond Italic) und die
   Inter-Variable laufen über @font-face in src/styles/fonts.css.
   Cormorant Garamond bezieht die Vorlage per Google-Import; Next.js
   streift externe @import-Regeln aus dem CSS, deshalb liefert next/font
   dieselben Schnitte selbst gehostet — registriert unter dem echten
   Familiennamen, den die Inline-Stile (tokens.ts) verwenden. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
  /* Only used below the fold (values, contact) — don't compete with the
     hero fonts for early bandwidth. */
  preload: false,
});

/* Above-the-fold faces (src/styles/fonts.css): body Inter, Lustria headings
   and its italic (the hero accent words). Preloading lets them download in
   parallel with the CSS instead of after it. */
const FONT_PRELOADS = [
  "/fonts/inter-latin.5ce82690.woff2",
  "/fonts/lustria-latin.95760a39.woff2",
  "/fonts/cormorant-garamond-italic-latin.b0fa095e.woff2",
];


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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: BUSINESS.name }],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
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
  icons: { icon: { url: "/tellian-monogramm-dunkel.svg", type: "image/svg+xml" } },
  /* Geo tags — location signal for regional search and AI assistants; the
     JSON-LD on the homepage carries the same data. */
  other: {
    "geo.region": `${BUSINESS.country}-${BUSINESS.region}`,
    "geo.placename": BUSINESS.city,
    "geo.position": `${BUSINESS.geo.latitude};${BUSINESS.geo.longitude}`,
    ICBM: `${BUSINESS.geo.latitude}, ${BUSINESS.geo.longitude}`,
  },
};

export async function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const { isEnabled } = await draftMode();
  const showVisualEditing = isEnabled || process.env.NODE_ENV === "development";
  for (const href of FONT_PRELOADS) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={lang} className={`h-full ${cormorant.variable}`}>
      <body className="h-full">
        <LanguageProvider>{children}</LanguageProvider>
        {showVisualEditing && <DraftVisualEditing />}
      </body>
    </html>
  );
}
