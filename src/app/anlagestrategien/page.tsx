import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { resolveSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.anlagestrategien,
    fallback: {
      title: "Anlagestrategien — Tellian Capital",
      description:
        "Die Anlagestrategien von Tellian Capital: massgeschneiderte Portfoliolösungen mit klarer Core/Satelliten-Struktur, abgestimmt auf Risikoprofil und Ziele.",
    },
    path: "/anlagestrategien",
    lang: "de",
  });
}

/**
 * Deep-link route for the Anlagestrategien detail overlay.
 *
 * The overlay itself lives inside <HomeClient />. The URL `/anlagestrategien`
 * is pushed to the address bar by `useSubpageMode("/anlagestrategien")` when
 * the user clicks "Mehr zu den Strategien". Visiting the URL directly (or
 * having the Studio preview iframe reload at it) must therefore render the
 * homepage so the hook can detect the path and open the overlay client-side.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
