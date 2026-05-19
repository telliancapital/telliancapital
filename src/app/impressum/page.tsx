import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { resolveSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.impressum,
    fallback: {
      title: "Impressum",
      description:
        "Impressum und gesetzliche Angaben zur Tellian Capital Vermögensverwaltung Zürich AG, Löwenstrasse 1, 8001 Zürich.",
    },
    path: "/impressum",
    lang: "de",
  });
}

/**
 * Deep-link route for the Impressum legal page.
 *
 * The page itself lives inside <HomeClient />: `useLegalRoute` reads the
 * URL on mount and renders the matching legal overlay. Visiting this URL
 * directly (or having the Studio preview iframe reload at it) must therefore
 * render the homepage so the hook can detect the path and open the overlay.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
