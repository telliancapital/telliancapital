import { defineField, defineType } from "sanity";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "start", title: "01 — Start (Hero)" },
    { name: "philosophy", title: "02 — Haltung (Anlagephilosophie)" },
    { name: "method", title: "03 — Methode (Vermögensverwaltung)" },
    { name: "strategy", title: "04 — Strategie (Anlagestrategien)" },
    { name: "team", title: "05 — Team (Über uns)" },
    { name: "contact", title: "06 — Kontakt" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "Tellian Capital AG",
    }),

    /* ──────────────────────────────────────────────────────────
       01 — START / HERO
       Heading: "Vermögen / mit Methode" (italic line 2)
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "startEyebrow",
      title: "Eyebrow Label",
      description: 'Top-left eyebrow, e.g. "Unabhängige Vermögensverwaltung · Zürich · Seit 1996"',
      type: "localeString",
      group: "start",
    }),
    defineField({
      name: "startHeadingLine1",
      title: "Headline — Line 1",
      description: 'e.g. "Vermögen"',
      type: "localeString",
      group: "start",
    }),
    defineField({
      name: "startHeadingLine2",
      title: "Headline — Line 2 (Italic)",
      description: 'e.g. "mit Methode"',
      type: "localeString",
      group: "start",
    }),
    defineField({
      name: "startCtaLabel",
      title: "CTA Button Label",
      description: 'e.g. "Gespräch vereinbaren"',
      type: "localeString",
      group: "start",
    }),
    defineField({
      name: "startBottomLabel",
      title: "Bottom Label",
      description: 'e.g. "FINMA-LIZENZIERT · ZÜRICH"',
      type: "localeString",
      group: "start",
    }),

    /* ──────────────────────────────────────────────────────────
       02 — HALTUNG / ANLAGEPHILOSOPHIE
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "philosophyEyebrow",
      title: "Eyebrow",
      type: "localeString",
      group: "philosophy",
    }),
    defineField({
      name: "philosophyHeadingLine1",
      title: "Headline — Line 1",
      type: "localeString",
      group: "philosophy",
    }),
    defineField({
      name: "philosophyHeadingLine2",
      title: "Headline — Line 2 (Italic)",
      type: "localeString",
      group: "philosophy",
    }),
    defineField({
      name: "philosophyQuote",
      title: "Quote (centered overlay)",
      type: "localeText",
      group: "philosophy",
    }),
    defineField({
      name: "philosophyParagraphs",
      title: "Body Paragraphs",
      type: "array",
      of: [{ type: "localeText" }],
      group: "philosophy",
    }),

    /* ──────────────────────────────────────────────────────────
       03 — METHODE / VERMÖGENSVERWALTUNG
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "methodEyebrow",
      title: "Eyebrow",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodHeadingLine1",
      title: "Headline — Line 1",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodHeadingLine2",
      title: "Headline — Line 2",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodHeadingLine3",
      title: "Headline — Line 3 (Italic)",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodParagraphs",
      title: "Body Paragraphs",
      type: "array",
      of: [{ type: "localeText" }],
      group: "method",
    }),
    defineField({
      name: "methodCtaLabel",
      title: "CTA Button Label",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodDetailEyebrow",
      title: "Detail Page — Eyebrow",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodDetailHeadingLine1",
      title: "Detail Page — Heading Line 1",
      type: "localeString",
      group: "method",
    }),
    defineField({
      name: "methodDetailHeadingLine2",
      title: "Detail Page — Heading Line 2 (Italic)",
      type: "localeString",
      group: "method",
    }),

    /* ──────────────────────────────────────────────────────────
       04 — STRATEGIE / ANLAGESTRATEGIEN
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "strategyEyebrow",
      title: "Eyebrow",
      type: "localeString",
      group: "strategy",
    }),
    defineField({
      name: "strategyHeadingLine1",
      title: "Headline — Line 1",
      type: "localeString",
      group: "strategy",
    }),
    defineField({
      name: "strategyHeadingLine2",
      title: "Headline — Line 2 (Italic)",
      type: "localeString",
      group: "strategy",
    }),
    defineField({
      name: "strategyParagraphs",
      title: "Body Paragraphs",
      type: "array",
      of: [{ type: "localeText" }],
      group: "strategy",
    }),
    defineField({
      name: "strategyCtaLabel",
      title: "CTA Button Label",
      type: "localeString",
      group: "strategy",
    }),
    defineField({
      name: "strategyDetailEyebrow",
      title: "Detail Page — Eyebrow",
      type: "localeString",
      group: "strategy",
    }),
    defineField({
      name: "strategyDetailHeadingLine1",
      title: "Detail Page — Heading Line 1",
      type: "localeString",
      group: "strategy",
    }),
    defineField({
      name: "strategyDetailHeadingLine2",
      title: "Detail Page — Heading Line 2 (Italic)",
      type: "localeString",
      group: "strategy",
    }),

    /* ──────────────────────────────────────────────────────────
       05 — TEAM / ÜBER TELLIAN
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "teamEyebrow",
      title: "Eyebrow",
      type: "localeString",
      group: "team",
    }),
    defineField({
      name: "teamHeadingLine1",
      title: "Headline — Line 1",
      type: "localeString",
      group: "team",
    }),
    defineField({
      name: "teamHeadingLine2",
      title: "Headline — Line 2 (Italic)",
      type: "localeString",
      group: "team",
    }),
    defineField({
      name: "teamParagraphs",
      title: "About Paragraphs",
      type: "array",
      of: [{ type: "localeText" }],
      group: "team",
    }),
    defineField({
      name: "teamCtaLabel",
      title: "CTA Button Label",
      type: "localeString",
      group: "team",
    }),
    defineField({
      name: "teamMembers",
      title: "Team Members",
      type: "array",
      group: "team",
      of: [
        {
          type: "object",
          name: "teamMember",
          title: "Team Member",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "role", title: "Role", type: "localeString" },
            { name: "bio", title: "Bio", type: "localeText" },
            {
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "imageUrl",
              title: "External Photo URL (fallback)",
              type: "url",
              description: "Used when no photo is uploaded.",
            },
          ],
          preview: {
            select: { title: "name", subtitle: "role.de", media: "image" },
          },
        },
      ],
    }),

    /* ──────────────────────────────────────────────────────────
       06 — KONTAKT
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "contactSubheading",
      title: "Subheading (Eyebrow)",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactHeading",
      title: "Heading",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactDescription",
      title: "Description",
      type: "localeText",
      group: "contact",
    }),
    defineField({
      name: "contactFormHeading",
      title: "Form Heading",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormFirstName",
      title: "Form — First Name placeholder",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormLastName",
      title: "Form — Last Name placeholder",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormEmail",
      title: "Form — Email placeholder",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormPhone",
      title: "Form — Phone placeholder",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormMessage",
      title: "Form — Message placeholder",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormSubmit",
      title: "Form — Submit Label",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormResponseTime",
      title: "Form — Response Time Note",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormThanksTitle",
      title: "Form — Thank You Title",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFormThanksBody",
      title: "Form — Thank You Body",
      type: "localeText",
      group: "contact",
    }),
    defineField({
      name: "contactCompanyName",
      title: "Company Name",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactCompanyTagline",
      title: "Company Tagline",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactAddress",
      title: "Address",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactPhone",
      title: "Phone",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactEmail",
      title: "Email",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactMapLinkLabel",
      title: "Map Link Label",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "contactFooterTagline",
      title: "Footer Tagline",
      type: "localeString",
      group: "contact",
    }),
  ],
});
