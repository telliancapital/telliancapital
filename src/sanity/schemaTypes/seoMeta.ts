import { defineField, defineType } from "sanity";

/**
 * Reusable SEO metadata object used per-page.
 *
 * Title/description support DE/EN via `localeString`. Keywords are a flat
 * array of strings (Google ignores keywords meta but it's kept for editorial
 * record). OG image is optional; when empty the global default is used.
 */
export const seoMeta = defineType({
  name: "seoMeta",
  title: "SEO Metadata",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      description:
        "Shown in browser tabs, search results, and social shares. Recommended ~50–60 characters.",
      type: "localeString",
    }),
    defineField({
      name: "description",
      title: "Meta description",
      description:
        "Shown under the title in search results and social shares. Recommended ~150–160 characters.",
      type: "localeText",
    }),
    defineField({
      name: "keywords",
      title: "Meta keywords",
      description:
        "Comma-separated list of keywords for this page. Not used by Google, kept for editorial record and other engines.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      description:
        "Used for Open Graph / Twitter cards. Recommended size 1200×630 px. Falls back to the site logo when empty.",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
