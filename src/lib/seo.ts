import type { Metadata } from "next";

export const SITE_URL = "https://telliancapital.vercel.app";

export const BUSINESS = {
  name: "Tellian Capital",
  legalName: "Tellian Capital Vermögensverwaltung Zürich AG",
  phone: "+41 44 224 40 24",
  email: "info@telliancapital.ch",
  street: "Löwenstrasse 1",
  postalCode: "8001",
  city: "Zürich",
  region: "ZH",
  country: "CH",
  /* Approximate coords of Löwenstrasse 1, Zürich — used by LocalBusiness JSON-LD. */
  geo: { latitude: 47.3769, longitude: 8.5387 },
  hours: "Mo-Fr 08:00-18:00",
  foundingYear: 1996,
  sameAs: [] as string[],
} as const;

type Lang = "de" | "en";

interface PageMetaInput {
  title: string;
  description: string;
  /** Path beginning with "/", e.g. "/de" or "/impressum". Used for canonical + OG url. */
  path: string;
  lang?: Lang;
  /** Map of lang → path, used for hreflang. Omit for pages not localized via `/[lang]`. */
  alternates?: Partial<Record<Lang, string>>;
  /** Override the OG image; defaults to the site logo. */
  image?: string;
  /** Keywords meta tag content. Empty/undefined omits the tag. */
  keywords?: string[];
  /** Block indexing for legal/preview/draft pages. */
  noindex?: boolean;
}

const DEFAULT_IMAGE = "/TellianCapital-Logo.png";

export function buildMetadata({
  title,
  description,
  path,
  lang = "de",
  alternates,
  image = DEFAULT_IMAGE,
  keywords,
  noindex = false,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogLocale = lang === "en" ? "en_US" : "de_CH";
  const isAbsoluteImage = /^https?:\/\//i.test(image);
  const ogImage = isAbsoluteImage
    ? { url: image, alt: BUSINESS.name }
    : { url: image, width: 1200, height: 630, alt: BUSINESS.name };

  return {
    title,
    description,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
      languages: alternates
        ? Object.fromEntries(
            Object.entries(alternates).map(([l, p]) => [
              l === "de" ? "de-CH" : "en-US",
              `${SITE_URL}${p}`,
            ]),
          )
        : undefined,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS.name,
      locale: ogLocale,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
  };
}

/**
 * Shape of one per-page SEO block fetched from Sanity via `SEO_QUERY`.
 * Title/description are localized ({ de, en }), keywords are flat, and
 * `ogImageUrl` is the resolved CDN URL of the uploaded image (if any).
 */
export interface SanitySeoBlock {
  title?: { de?: string | null; en?: string | null } | null;
  description?: { de?: string | null; en?: string | null } | null;
  keywords?: string[] | null;
  ogImageUrl?: string | null;
}

interface ResolveSeoInput {
  seo?: SanitySeoBlock | null;
  /** Fallback values used when the corresponding Sanity field is empty. */
  fallback: {
    title: string;
    description: string;
  };
  path: string;
  lang?: Lang;
  alternates?: Partial<Record<Lang, string>>;
  noindex?: boolean;
}

/**
 * Merge a Sanity SEO block with a static fallback and return a Next.js
 * `Metadata` object. Empty Sanity values fall back to the static defaults
 * so partial CMS data still produces valid head tags.
 */
export function resolveSeoMetadata({
  seo,
  fallback,
  path,
  lang = "de",
  alternates,
  noindex,
}: ResolveSeoInput): Metadata {
  const localeKey: Lang = lang === "en" ? "en" : "de";
  const title = seo?.title?.[localeKey]?.trim() || fallback.title;
  const description = seo?.description?.[localeKey]?.trim() || fallback.description;
  const keywords = seo?.keywords?.filter((k): k is string => typeof k === "string" && k.length > 0);
  const image = seo?.ogImageUrl?.trim() || undefined;

  return buildMetadata({
    title,
    description,
    path,
    lang,
    alternates,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    image,
    noindex,
  });
}

/** LocalBusiness / FinancialService JSON-LD for the homepage. */
export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS.legalName,
    alternateName: BUSINESS.name,
    url: SITE_URL,
    logo: `${SITE_URL}${DEFAULT_IMAGE}`,
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    foundingDate: String(BUSINESS.foundingYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      postalCode: BUSINESS.postalCode,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    areaServed: { "@type": "Country", name: "Switzerland" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    sameAs: BUSINESS.sameAs,
  };
}
