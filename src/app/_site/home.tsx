import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { jsonLdScript, localBusinessJsonLd, resolveSeoMetadata } from "@/lib/seo";
import { pickLocale, type Lang, type LocaleValue } from "@/i18n/types";
import { stegaClean } from "@sanity/client/stega";
import { SeoOutline } from "./SeoOutline";
import { preload } from "react-dom";
import { HERO_SIZES_MEDIA, heroBild } from "@/components/heroBild";

/* Shared by app/(de)/de/page.tsx and app/(en)/en/page.tsx — each language
   lives in its own root layout so <html lang> is correct server-side. */

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

export async function homeMetadata(lang: Lang): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.home,
    fallback: COPY[lang],
    path: `/${lang}`,
    lang,
    alternates: { de: "/de", en: "/en" },
  });
}

export async function LocalizedHomepage({ lang }: { lang: Lang }) {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  /* The hero only renders after hydration; preloading lets the browser fetch
     it alongside the JS instead of after it (it is the mobile LCP image). */
  const team = ((homepage?.teamMembers ?? []) as { name?: string; role?: LocaleValue }[]).map((m) => ({
    name: stegaClean(m?.name ?? ""),
    role: stegaClean(pickLocale(m?.role, lang)),
  }));
  const hero = heroBild(homepage);
  preload(hero.src, { as: "image", imageSrcSet: hero.srcSet, imageSizes: hero.srcSet ? HERO_SIZES_MEDIA : undefined, fetchPriority: "high" });
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdScript(localBusinessJsonLd(lang, team)) }}
      />
      <HomeClient homepage={homepage} outline={<SeoOutline route="home" homepage={homepage} lang={lang} />} />
    </>
  );
}
