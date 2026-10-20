import type { Metadata } from "next";
import HomeClient from "@/app/HomeClient";
import { SeoOutline } from "@/app/_site/SeoOutline";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { resolveSeoMetadata, jsonLdScript, metadataText, pageJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.datenschutz,
    fallback: {
      title: "Datenschutz",
      description:
        "Datenschutzerklärung der Tellian Capital Vermögensverwaltung Zürich AG. Informationen zur Erhebung, Verarbeitung und Speicherung personenbezogener Daten.",
    },
    path: "/datenschutz",
    lang: "de",
  });
}

/**
 * Deep-link route for the Datenschutz legal page.
 * `useLegalRoute` reads the URL on mount and opens the matching overlay.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  const page = pageJsonLd({
    path: "/datenschutz",
    ...metadataText(await generateMetadata()),
    trail: [{ name: "Datenschutz", path: "/datenschutz" }],
  });
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdScript(page) }}
      />
      <HomeClient homepage={homepage} outline={<SeoOutline route="datenschutz" homepage={homepage} />} />
    </>
  );
}
