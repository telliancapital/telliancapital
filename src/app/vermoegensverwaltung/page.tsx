import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";

/**
 * Deep-link route for the Vermögensverwaltung (Anlageprozess) detail overlay.
 *
 * The overlay itself lives inside <HomeClient />. The URL `/vermoegensverwaltung`
 * is pushed to the address bar by `useSubpageMode("/vermoegensverwaltung")` when
 * the user clicks "Mehr zur Vermögensverwaltung". Visiting the URL directly (or
 * having the Studio preview iframe reload at it) must therefore render the
 * homepage so the hook can detect the path and open the overlay client-side.
 */
export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
