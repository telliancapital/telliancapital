import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";

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
