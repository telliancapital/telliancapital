import type { Metadata } from "next";

/* Production domain — canonical, hreflang, sitemap, robots, OG and JSON-LD
   URLs all derive from it. Override with NEXT_PUBLIC_SITE_URL (no trailing
   slash) only for a staging domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://telliancapital.ch").replace(/\/+$/, "");

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

/* 1200×630 share card (logo on Imperial Purple) and a square logo that
   reads on white, as Google requires for Organization logos. */
const DEFAULT_IMAGE = "/og-image.png";
const LOGO = "/logo.png";

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
    /* Titles that already name the brand skip the layout's
       "%s | Tellian Capital" template, which would repeat it. */
    title: title.includes(BUSINESS.name) ? { absolute: title } : title,
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

/**
 * Build a schema.org FAQPage JSON-LD object from a list of FAQ items.
 *
 * Always emit server-side (in a `<script type="application/ld+json">` in the
 * page's RSC output) so Google sees the structured data on the first crawl
 * without executing JavaScript. Empty/blank items are filtered out — the
 * spec requires `name` and `acceptedAnswer.text` to both be present.
 *
 * Returns `null` when no usable items remain, so callers can conditionally
 * render the script tag.
 */
export interface FaqJsonLdItem {
  question: string;
  answer: string;
}

export function faqJsonLd(items: readonly FaqJsonLdItem[]): Record<string, unknown> | null {
  const cleaned = items
    .map(({ question, answer }) => ({
      question: question?.trim() ?? "",
      answer: answer?.trim() ?? "",
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0);

  if (cleaned.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cleaned.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/**
 * Serialize JSON-LD for a `<script type="application/ld+json">`. CMS text
 * containing "</script>" would otherwise close the tag early, so `<` is
 * escaped (Next.js JSON-LD guide).
 */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const ORG_DESCRIPTION: Record<Lang, string> = {
  de: "Unabhängige Vermögensverwaltung in Zürich seit 1996: persönliche Betreuung, individuelle Portfoliolösungen mit Core/Satelliten-Struktur und ein strukturierter Anlageprozess für Privatpersonen, Unternehmerfamilien und Stiftungen.",
  en: "Independent wealth management in Zurich since 1996: personal advisory, bespoke portfolio solutions with a core/satellite structure and a structured investment process for private clients, entrepreneurial families and foundations.",
};

/** Team member as stored in the homepage document (name + localized role). */
export interface JsonLdTeamMember {
  name: string;
  role?: string;
}

/**
 * Homepage JSON-LD graph: the firm (FinancialService, a LocalBusiness
 * subtype) and the WebSite. Descriptive fields matter for AI assistants
 * (GEO) as much as for Google: what the firm does, where, in which
 * languages, and who works there.
 */
export function localBusinessJsonLd(lang: Lang = "de", team: readonly JsonLdTeamMember[] = []): Record<string, unknown> {
  const address = `${BUSINESS.street}, ${BUSINESS.postalCode} ${BUSINESS.city}`;
  const organization = {
    "@type": "FinancialService",
    "@id": ORG_ID,
    name: BUSINESS.legalName,
    alternateName: BUSINESS.name,
    description: ORG_DESCRIPTION[lang],
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}${LOGO}`, width: 512, height: 512 },
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
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${BUSINESS.legalName}, ${address}`)}`,
    areaServed: { "@type": "Country", name: "Switzerland" },
    knowsLanguage: ["de", "en"],
    knowsAbout:
      lang === "de"
        ? ["Vermögensverwaltung", "Anlagestrategien", "Portfolio Management", "Anlageberatung"]
        : ["Wealth management", "Investment strategies", "Portfolio management", "Investment advisory"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: BUSINESS.phone,
      email: BUSINESS.email,
      availableLanguage: ["German", "English"],
      areaServed: "CH",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    employee: team
      .filter((m) => m.name.trim())
      .map((m) => ({ "@type": "Person", name: m.name.trim(), jobTitle: m.role?.trim() || undefined, worksFor: { "@id": ORG_ID } })),
    sameAs: BUSINESS.sameAs,
  };
  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: BUSINESS.name,
    inLanguage: ["de-CH", "en"],
    publisher: { "@id": ORG_ID },
  };
  return { "@context": "https://schema.org", "@graph": [organization, website] };
}

/**
 * WebPage + BreadcrumbList for a subpage, tied to the homepage graph by
 * @id. `trail` excludes the home crumb, which is added here.
 */
export function pageJsonLd({
  path,
  title,
  description,
  lang = "de",
  trail,
}: {
  path: string;
  title: string;
  description: string;
  lang?: Lang;
  trail: readonly { name: string; path: string }[];
}): Record<string, unknown> {
  const url = `${SITE_URL}${path}`;
  const crumbs = [{ name: BUSINESS.name, path: lang === "en" ? "/en" : "/de" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: lang === "en" ? "en" : "de-CH",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${SITE_URL}${c.path}`,
        })),
      },
    ],
  };
}

/** Title/description strings out of a resolved Metadata object (as built by buildMetadata). */
export function metadataText(meta: Metadata): { title: string; description: string } {
  const t = meta.title;
  const title = typeof t === "string" ? t : t && "absolute" in t ? t.absolute : t && "default" in t ? t.default : "";
  const full = !title ? BUSINESS.name : title.includes(BUSINESS.name) ? title : `${title} | ${BUSINESS.name}`;
  return { title: full, description: meta.description ?? "" };
}
