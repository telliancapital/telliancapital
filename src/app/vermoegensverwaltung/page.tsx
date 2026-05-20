import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { faqJsonLd, resolveSeoMetadata } from "@/lib/seo";
import { pickLocale, type LocaleValue } from "@/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.vermoegensverwaltung,
    fallback: {
      title: "Vermögensverwaltung — Anlageprozess",
      description:
        "Der Anlageprozess von Tellian Capital: persönliche Beratung, individuelle Portfoliolösungen und transparente Core/Satelliten-Struktur für Privatkunden in Zürich.",
    },
    path: "/vermoegensverwaltung",
    lang: "de",
  });
}

/**
 * Deep-link route for the Vermögensverwaltung (Anlageprozess) detail overlay.
 *
 * The overlay itself lives inside <HomeClient />. The URL `/vermoegensverwaltung`
 * is pushed to the address bar by `useSubpageMode("/vermoegensverwaltung")` when
 * the user clicks "Mehr zur Vermögensverwaltung". Visiting the URL directly (or
 * having the Studio preview iframe reload at it) must therefore render the
 * homepage so the hook can detect the path and open the overlay client-side.
 */
type CmsFaq = { question?: LocaleValue; answer?: LocaleValue };

export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });

  /* Build FAQPage JSON-LD from the inline `methodFaqItems` so the Anlageprozess
     overlay ships its structured data in the initial HTML (Google reads it
     without executing JS). */
  const faqSchema = faqJsonLd(
    (homepage?.methodFaqItems ?? []).map((f: CmsFaq) => ({
      question: pickLocale(f?.question, "de"),
      answer: pickLocale(f?.answer, "de"),
    })),
  );

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <HomeClient homepage={homepage} />
    </>
  );
}
