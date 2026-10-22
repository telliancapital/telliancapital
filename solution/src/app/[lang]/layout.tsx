import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import { DraftVisualEditing } from "@/components/DraftVisualEditing";
import { draftMode } from "next/headers";
import { preload } from "react-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { ZweiZeilen } from "@/components/ZweiZeilen";
import { publicSiteUrl } from "@/sanity/env";
import type { Locale } from "@/i18n/types";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
  /* Only used below the fold — don't compete with the hero fonts. */
  preload: false,
});

/* Above-the-fold faces (src/styles/fonts.css): body Inter, Lustria headings
   and its italic (the hero accent words). Preloading lets them download in
   parallel with the CSS instead of after it. */
const FONT_PRELOADS = [
  "/solutions/fonts/inter-latin.5ce82690.woff2",
  "/solutions/fonts/lustria-latin.95760a39.woff2",
  "/solutions/fonts/cormorant-garamond-italic-latin.b0fa095e.woff2",
];


/* Lustria (mit echter Kursive) und Inter-Variable laufen über
   @font-face in src/styles/fonts.css — 1:1 wie die Hauptseite. */

/* Root layout sits under [lang] so the server-rendered <html lang> matches
   /solutions/de|en|fr. Other languages 404 (app/global-not-found.tsx). */
const LANGS = ["de", "en", "fr"] as const satisfies readonly Locale[];

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const COPY: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  de: {
    title: "Tellian Capital Solutions | Unabhängige Anlagelösungen",
    description:
      "Unabhängig aus Prinzip — Tellian Capital Solutions verschafft Zugang zu Anlagelösungen auf Aktien, Zinsen, Credit, Währungen, Rohstoffe und Fonds.",
    ogLocale: "de_CH",
  },
  en: {
    title: "Tellian Capital Solutions | Independent Investment Solutions",
    description:
      "Independent by principle — Tellian Capital Solutions provides access to investment solutions in equities, fixed income, credit, currencies, commodities and funds.",
    ogLocale: "en_US",
  },
  fr: {
    title: "Tellian Capital Solutions | Solutions d’investissement indépendantes",
    description:
      "Indépendants par principe — Tellian Capital Solutions donne accès à des solutions d’investissement en actions, taux, crédit, devises, matières premières et fonds.",
    ogLocale: "fr_CH",
  },
};

/* Public URLs: this zone is served on telliancapital.ch under /solutions. */
const pageUrl = (lang: Locale) => `${publicSiteUrl}/solutions/${lang}`;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (LANGS as readonly string[]).includes(raw) ? (raw as Locale) : "de";
  const { title, description, ogLocale } = COPY[lang];
  const image = `${publicSiteUrl}/og-image.png`;
  return {
    metadataBase: new URL(publicSiteUrl),
    title,
    description,
    alternates: {
      canonical: pageUrl(lang),
      languages: { "de-CH": pageUrl("de"), "en-US": pageUrl("en"), "fr-CH": pageUrl("fr") },
    },
    openGraph: {
      title,
      description,
      url: pageUrl(lang),
      siteName: "Tellian Capital Solutions",
      locale: ogLocale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "Tellian Capital Solutions" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    icons: { icon: { url: "/solutions/tellian-monogramm-dunkel.svg", type: "image/svg+xml" } },
    /* Same geo tags as the main site (Löwenstrasse 1, Zürich). */
    other: {
      "geo.region": "CH-ZH",
      "geo.placename": "Zürich",
      "geo.position": "47.3769;8.5387",
      ICBM: "47.3769, 8.5387",
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const { isEnabled } = await draftMode();
  const showVisualEditing = isEnabled || process.env.NODE_ENV === "development";
  for (const href of FONT_PRELOADS) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={lang} className={`h-full ${cormorant.variable}`}>
      <body className="h-full">
        <LanguageProvider>{children}</LanguageProvider>
        <ZweiZeilen />
        {showVisualEditing && <DraftVisualEditing />}
      </body>
    </html>
  );
}
