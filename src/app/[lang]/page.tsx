import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { localBusinessJsonLd, resolveSeoMetadata } from "@/lib/seo";

const SUPPORTED_LANGS = ["de", "en"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

const COPY: Record<Lang, { title: string; description: string }> = {
  de: {
    title: "Tellian Capital | Unabhängige Vermögensverwaltung Zürich",
    description:
      "Unabhängige Vermögensverwaltung in Zürich seit 1996. Persönliche Betreuung und individuelle Portfoliolösungen mit Core/Satelliten-Struktur.",
  },
  en: {
    title: "Tellian Capital | Independent Wealth Management Zurich",
    description:
      "Independent wealth management in Zurich since 1996. Personal advisory and bespoke portfolio solutions with a core/satellite structure.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang: Lang = (SUPPORTED_LANGS as readonly string[]).includes(lang)
    ? (lang as Lang)
    : "de";
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.home,
    fallback: COPY[safeLang],
    path: `/${safeLang}`,
    lang: safeLang,
    alternates: { de: "/de", en: "/en" },
  });
}

export default async function LocalizedHomepage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as Lang)) notFound();

  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <HomeClient homepage={homepage} />
    </>
  );
}
