import { defineType } from "sanity";

/**
 * Same shape as `localeString` but with a third `fr` field — used only by
 * the Solutions site (solutionsHomepage), which supports German/English/French.
 * Kept separate from `localeString` so the main site's schema/UI (40+ fields)
 * is not affected by adding a language it doesn't use.
 */
export const triLocaleString = defineType({
  name: "triLocaleString",
  title: "Localized String (DE/EN/FR)",
  type: "object",
  fields: [
    {
      name: "de",
      title: "German",
      type: "string",
    },
    {
      name: "en",
      title: "English",
      type: "string",
    },
    {
      name: "fr",
      title: "French",
      type: "string",
    },
  ],
});
