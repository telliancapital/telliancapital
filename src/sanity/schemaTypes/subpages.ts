import { defineType } from "sanity";

import { subpageFields } from "./subpagesFields";

/**
 * Unterseiten Mandat / Advisory — own document (singleton, id "subpages").
 *
 * Why not on `homepage`: Sanity allows at most 1000 distinct attribute
 * paths per document and the homepage document reached that limit on
 * 2026-10-27 while the comparison table was being filled in. The site reads
 * these fields from here first (HOMEPAGE_QUERY, coalesce) and falls back to
 * the same-named homepage fields until the editors have moved their content.
 */
export const subpagesType = defineType({
  name: "subpages",
  title: "Unterseiten  ·  Mandat / Advisory",
  type: "document",
  groups: [
    { name: "mandat", title: "Mandat subpage", default: true },
    { name: "advisory", title: "Advisory subpage" },
    { name: "compare", title: "Comparison table (both subpages)" },
  ],
  fields: subpageFields({ group: (s) => s }),
  preview: {
    prepare() {
      return { title: "Unterseiten  ·  Mandat / Advisory" };
    },
  },
});
