import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .child(S.document().schemaType("homepage").documentId("homepage")),
      S.listItem()
        .title("Unterseiten  ·  Mandat / Advisory")
        .id("subpages")
        .child(S.document().schemaType("subpages").documentId("subpages")),
      S.listItem()
        .title("Solutions Homepage")
        .id("solutionsHomepage")
        .child(S.document().schemaType("solutionsHomepage").documentId("solutionsHomepage")),
      S.listItem()
        .title("FAQs")
        .id("faqs")
        .child(
          S.documentTypeList("faq")
            .title("FAQs")
            .defaultOrdering([
              { field: "page", direction: "asc" },
              { field: "order", direction: "asc" },
            ]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !["homepage", "subpages", "solutionsHomepage", "faq"].includes(listItem.getId() || ""),
      ),
    ]);
