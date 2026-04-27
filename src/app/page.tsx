import HomeClient from "./HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";

export default async function Page() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
