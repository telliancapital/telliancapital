import { defineLocations, defineDocuments } from "sanity/presentation";

/**
 * The homepage now lives under `/[lang]` (`/de` is the default). The Studio
 * Presentation tool renders the preview inside an iframe, and chained server
 * redirects ( `/` → `/de` ) intermittently leave that iframe on a 404 — so
 * the resolver maps the homepage document directly to `/de` to avoid the hop.
 *
 * Switching the previewed language is done from the sidebar inside the page
 * itself; the URL stays in sync via `history.replaceState` (no Next.js
 * navigation, no redirect).
 */
export const resolve = {
  mainDocuments: defineDocuments([
    {
      route: "/de",
      filter: `_type == "homepage"`,
    },
    {
      route: "/en",
      filter: `_type == "homepage"`,
    },
  ]),
  locations: {
    homepage: defineLocations({
      select: { title: "title" },
      resolve: () => ({
        locations: [
          { title: "Homepage (Deutsch)", href: "/de" },
          { title: "Homepage (English)", href: "/en" },
        ],
      }),
    }),
  },
};
