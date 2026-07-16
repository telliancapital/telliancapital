import { defineLocations, defineDocuments } from "sanity/presentation";

/**
 * The Solutions app (Tellian Capital Solutions) is a *separate* Next.js
 * project/deployment — its preview locations below use an absolute URL
 * (a different origin than this Studio), which is how the Presentation
 * tool supports previewing more than one frontend from a single Studio.
 * Locally this defaults to the Solutions app's own dev server port; in
 * production it should be set to the real solutions.telliancapital.ch URL.
 */
const SOLUTIONS_URL = process.env.NEXT_PUBLIC_SOLUTIONS_URL || "http://localhost:3100";

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
    {
      route: `${SOLUTIONS_URL}/de`,
      filter: `_type == "solutionsHomepage"`,
    },
    {
      route: `${SOLUTIONS_URL}/en`,
      filter: `_type == "solutionsHomepage"`,
    },
    {
      route: `${SOLUTIONS_URL}/fr`,
      filter: `_type == "solutionsHomepage"`,
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
    solutionsHomepage: defineLocations({
      select: { title: "_id" },
      resolve: () => ({
        locations: [
          { title: "Solutions Homepage (Deutsch)", href: `${SOLUTIONS_URL}/de` },
          { title: "Solutions Homepage (English)", href: `${SOLUTIONS_URL}/en` },
          { title: "Solutions Homepage (Français)", href: `${SOLUTIONS_URL}/fr` },
        ],
      }),
    }),
  },
};
