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
  noindex = false,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogLocale = lang === "en" ? "en_US" : "de_CH";

  return {
    title,
    description,
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
      images: [{ url: image, width: 1200, height: 630, alt: BUSINESS.name }],
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
