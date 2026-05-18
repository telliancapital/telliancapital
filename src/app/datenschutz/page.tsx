import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Datenschutz",
  description:
    "Datenschutzerklärung der Tellian Capital Vermögensverwaltung Zürich AG. Informationen zur Erhebung, Verarbeitung und Speicherung personenbezogener Daten.",
  path: "/datenschutz",
  lang: "de",
});

/**
 * Deep-link route for the Datenschutz legal page.
 * `useLegalRoute` reads the URL on mount and opens the matching overlay.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
