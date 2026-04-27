import { defineLocations, defineDocuments } from "sanity/presentation";

export const resolve = {
  mainDocuments: defineDocuments([
    {
      route: "/",
      filter: `_type == "homepage"`,
    },
  ]),
  locations: {
    // Map 'homepage' documents to the root path
    homepage: defineLocations({
      select: {
        title: "title",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: "Homepage",
            href: "/",
          },
        ],
      }),
    }),
    // Example for future slug-based routes
    /*
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: `/blog/${doc?.slug}`,
          },
        ],
      }),
    }),
    */
  },
};
