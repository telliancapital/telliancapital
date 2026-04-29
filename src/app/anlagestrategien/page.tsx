import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";

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
