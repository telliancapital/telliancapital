// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { client } from './client'

import { readToken } from "../env";

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    // Live content requires useCdn: false
    useCdn: false,
  }),
  // Required for draft content in production
  serverToken: readToken,
  browserToken: readToken,
});
