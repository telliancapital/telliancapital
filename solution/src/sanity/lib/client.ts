import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, mainSiteStudioUrl } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  stega: {
    enabled: true,
    // This app has no Studio of its own — the Solutions Homepage document
    // is edited from the main site's Studio, so stega click-to-edit links
    // must point there instead of a local "/studio".
    studioUrl: mainSiteStudioUrl,
  },
});
