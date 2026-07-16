import { defineField, defineType } from "sanity";

/**
 * Standalone FAQ document.
 *
 * Each FAQ is its own document so editors can manage them independently of
 * page content. The `page` enum decides where the FAQ surfaces on the public
 * site:
 *   - "general"            → /faq only (and any future FAQ block)
 *   - "home"               → /faq + /, /de, /en hero/contact sections later
 *   - "vermoegensverwaltung"   → /faq grouping (the overlay page itself still
 *                            uses the inline `methodFaqItems` on `homepage`)
 *   - "anlagestrategien"   → /faq grouping (overlay uses inline `strategyFaqItems`)
 *   - "kontakt"            → /faq + future contact-page block
 *
 * `order` is a stable sort key inside each page bucket. Lower = first.
 * `isPublished` is a soft kill-switch so drafts can stay in Studio without
 * appearing on the public site or in JSON-LD.
 */
export const PAGE_OPTIONS = [
  { title: "General  ·  Allgemein", value: "general" },
  { title: "Homepage", value: "home" },
  { title: "Vermögensverwaltung", value: "vermoegensverwaltung" },
  { title: "Anlagestrategien", value: "anlagestrategien" },
  { title: "Kontakt", value: "kontakt" },
] as const;

export type FaqPage = (typeof PAGE_OPTIONS)[number]["value"];

export const faqType = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",

  fieldsets: [
    {
      name: "content",
      title: "Question & answer",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "settings",
      title: "Placement & visibility",
      options: { collapsible: true, collapsed: false },
    },
  ],

  fields: [
    defineField({
      name: "question",
      title: "Question",
      description:
        'Localized in DE + EN. Should match how a user would phrase the question (e.g. "Wie hoch ist das Mindestvermögen?"). Keep concise — Google truncates around 150 characters in rich results.',
      type: "localeString",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const v = value as { de?: string; en?: string } | undefined;
          if (!v || (!v.de?.trim() && !v.en?.trim())) {
            return "Provide at least one language (DE or EN).";
          }
          return true;
        }),
      fieldset: "content",
    }),

    defineField({
      name: "answer",
      title: "Answer",
      description:
        "Localized in DE + EN. Keep answers short, factual, and compliant — financial-services context, no advice language. ~1–3 sentences works best for rich results.",
      type: "localeText",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const v = value as { de?: string; en?: string } | undefined;
          if (!v || (!v.de?.trim() && !v.en?.trim())) {
            return "Provide at least one language (DE or EN).";
          }
          return true;
        }),
      fieldset: "content",
    }),

    defineField({
      name: "page",
      title: "Page",
      description:
        'Which page bucket this FAQ belongs to. The dedicated /faq page groups by this value. "General" appears on /faq only.',
      type: "string",
      options: {
        list: [...PAGE_OPTIONS],
        layout: "dropdown",
      },
      initialValue: "general",
      validation: (Rule) => Rule.required(),
      fieldset: "settings",
    }),

    defineField({
      name: "order",
      title: "Sort order",
      description: "Lower numbers appear first within the same page bucket. Default 0.",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.integer(),
      fieldset: "settings",
    }),

    defineField({
      name: "isPublished",
      title: "Published",
      description:
        "When off, the FAQ stays in Studio but is hidden from the public site and from FAQ JSON-LD.",
      type: "boolean",
      initialValue: true,
      fieldset: "settings",
    }),
  ],

  orderings: [
    {
      title: "Page, then order",
      name: "pageOrder",
      by: [
        { field: "page", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],

  preview: {
    select: {
      questionDe: "question.de",
      questionEn: "question.en",
      page: "page",
      order: "order",
      isPublished: "isPublished",
    },
    prepare({ questionDe, questionEn, page, order, isPublished }) {
      const question = questionDe || questionEn || "(no question)";
      const status = isPublished === false ? " · hidden" : "";
      return {
        title: question,
        subtitle: `${page ?? "general"} · #${order ?? 0}${status}`,
      };
    },
  },
});
