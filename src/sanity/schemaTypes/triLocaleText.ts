import { defineType } from "sanity";

/**
 * Same shape as `localeText` but with a third `fr` field — used only by
 * the Solutions site (solutionsHomepage), which supports German/English/French.
 */
export const triLocaleText = defineType({
  name: "triLocaleText",
  title: "Localized Text (DE/EN/FR)",
  type: "object",
  fields: [
    {
      name: "de",
      title: "German",
      type: "text",
      rows: 4,
    },
    {
      name: "en",
      title: "English",
      type: "text",
      rows: 4,
    },
    {
      name: "fr",
      title: "French",
      type: "text",
      rows: 4,
    },
  ],
});
