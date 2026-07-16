import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { resolveSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.kundeninformation,
    fallback: {
      title: "Kundeninformation",
      description:
        "Gesetzlich vorgeschriebene Kundeninformation der Tellian Capital Vermögensverwaltung Zürich AG gemäss FINIG und FIDLEG.",
    },
    path: "/kundeninformation",
    lang: "de",
  });
}

/**
 * Deep-link route for the Kundeninformation legal page.
 * `useLegalRoute` reads the URL on mount and opens the matching overlay.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
