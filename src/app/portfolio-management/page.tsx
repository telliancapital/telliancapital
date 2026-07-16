import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { resolveSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.portfolioManagement,
    fallback: {
      title: "Portfolio Management — Tellian Capital",
      description:
        "Wie Tellian Capital Portfolios führt: Anlageprozess, Anlagekomitee, Anlagestrategien und Anlageuniversum im Überblick.",
    },
    path: "/portfolio-management",
    lang: "de",
  });
}

/**
 * Deep-link route for the Portfolio Management detail overlay.
 *
 * The overlay itself lives inside <HomeClient />. The URL `/portfolio-management`
 * is pushed to the address bar by `useSubpageMode("/portfolio-management")` when
 * the user clicks "Mehr zum Anlageprozess". Visiting the URL directly (or having
 * the Studio preview iframe reload at it) must therefore render the homepage so
 * the hook can detect the path and open the overlay client-side.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
