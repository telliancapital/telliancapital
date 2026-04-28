import { defineField, defineType } from "sanity";

/**
 * Homepage schema — single document representing the entire one-page site.
 *
 * Tabs (groups) match the on-page sections you see in the sidebar:
 *   01 Start  →  02 Haltung  →  03 Methode  →  04 Strategie  →  05 Team  →  06 Kontakt
 *
 * Inside each tab the fields are grouped (fieldsets) by their visual role
 * on the page (Eyebrow, Headline, Body, Call-to-Action, …) so editors
 * always know which Studio field maps to which on-page text.
 */
export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",

  /* Tabs across the top of the document editor */
  groups: [
    { name: "start", title: "1. Start  ·  Hero", default: true },
    { name: "philosophy", title: "2. Haltung  ·  Anlagephilosophie" },
    { name: "method", title: "3. Methode  ·  Vermögensverwaltung" },
    { name: "strategy", title: "4. Strategie  ·  Anlagestrategien" },
    { name: "team", title: "5. Team  ·  Über uns" },
    { name: "contact", title: "6. Kontakt" },
  ],

  /* Collapsible groupings within each tab.
     A fieldset visually labels related fields ("Headline", "Body Copy", …). */
  fieldsets: [
    /* Start */
    {
      name: "startEyebrowSet",
      title: "Eyebrow (top label)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "startHeadlineSet",
      title: "Main Headline",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "startCtaSet",
      title: "Call-to-Action Button",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "startFooterSet",
      title: "Bottom Label",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "startImageSet",
      title: "Right-side hero image",
      options: { collapsible: true, collapsed: false },
    },

    /* Philosophy */
    {
      name: "philosophyHeaderSet",
      title: "Header (Eyebrow + Headline)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "philosophyImageSet",
      title: "Right-side image (with centered quote on top)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "philosophyQuoteSet",
      title: "Centered Quote (over image)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "philosophyBodySet",
      title: "Body Paragraphs",
      options: { collapsible: true, collapsed: false },
    },

    /* Method */
    {
      name: "methodHeaderSet",
      title: "Header (Eyebrow + Headline)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodBodySet",
      title: "Body Paragraphs",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodCtaSet",
      title: "Call-to-Action Button",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodDetailSet",
      title: "Detail Page (Anlageprozess overlay)",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "methodTimelineSet",
      title: "Right-side timeline (5 numbered steps)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodDetailStepsSet",
      title: "Detail Page — Step sections (01 – 05)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodDetailFaqSet",
      title: "Detail Page — FAQ",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodDetailCtaSet",
      title: "Detail Page — Final CTA",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "methodDetailFooterSet",
      title: "Detail Page — Footer",
      options: { collapsible: true, collapsed: false },
    },

    /* Strategy */
    {
      name: "strategyHeaderSet",
      title: "Header (Eyebrow + Headline)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "strategyBodySet",
      title: "Body Paragraphs",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "strategyCtaSet",
      title: "Call-to-Action Button",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "strategyDetailSet",
      title: "Detail Page (Anlagestrategien overlay)",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "strategyTopDownSet",
      title: "Card 1 — Top-Down (dark card, top half)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "strategyDecisionSet",
      title: "Middle accent bar (between the two cards)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "strategyBottomUpSet",
      title: "Card 2 — Bottom-Up (light card, bottom half)",
      options: { collapsible: true, collapsed: false },
    },

    /* Team */
    {
      name: "teamHeaderSet",
      title: "Header (Eyebrow + Headline)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "teamBodySet",
      title: "About Paragraphs",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "teamCtaSet",
      title: "Call-to-Action Button",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "teamMembersSet",
      title: "Team Members",
      options: { collapsible: true, collapsed: false },
    },

    /* Contact */
    {
      name: "contactHeaderSet",
      title: "Header (Editorial column)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contactFormSet",
      title: "Form Labels",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contactCompanySet",
      title: "Company / Address",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contactFooterSet",
      title: "Footer / Map Link",
      options: { collapsible: true, collapsed: false },
    },
  ],

  fields: [
    defineField({
      name: "title",
      title: "Internal Page Title",
      description:
        "Used internally for browser tabs and admin lists — not shown on the page itself.",
      type: "string",
      initialValue: "Tellian Capital AG",
    }),

    /* ──────────────────────────────────────────────────────────
       01 — START · HERO
       On the page: full-screen first slide with “Vermögen / mit Methode”.
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "startEyebrow",
      title: "Eyebrow text",
      description:
        'Small uppercase label above the headline (top-left of the hero). Example: "Unabhängige Vermögensverwaltung · Zürich · Seit 1996".',
      type: "localeString",
      group: "start",
      fieldset: "startEyebrowSet",
    }),
    defineField({
      name: "startHeadingLine1",
      title: "Headline — Line 1 (regular)",
      description: 'First (non-italic) line of the big headline. Example: "Vermögen".',
      type: "localeString",
      group: "start",
      fieldset: "startHeadlineSet",
    }),
    defineField({
      name: "startHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Second line of the headline, rendered in italic. Example: "mit Methode".',
      type: "localeString",
      group: "start",
      fieldset: "startHeadlineSet",
    }),
    defineField({
      name: "startCtaLabel",
      title: "Button label",
      description:
        'Text on the dark CTA button below the headline. Example: "Gespräch vereinbaren".',
      type: "localeString",
      group: "start",
      fieldset: "startCtaSet",
    }),
    defineField({
      name: "startBottomLabel",
      title: "Bottom label",
      description: 'Tiny uppercase label under the CTA. Example: "FINMA-LIZENZIERT · ZÜRICH".',
      type: "localeString",
      group: "start",
      fieldset: "startFooterSet",
    }),

    /* ─── Right-side hero image (desktop) / top hero image (mobile) ─── */
    defineField({
      name: "startImage",
      title: "Photo (upload)",
      description:
        "Hero image. Desktop: appears on the right of the hero — its left edge expands as the user scrolls. Mobile/Tablet: appears at the very top of the page. Recommended: tall portrait orientation (≈3:4 to 4:5), warm tonality.",
      type: "image",
      options: { hotspot: true },
      group: "start",
      fieldset: "startImageSet",
    }),
    defineField({
      name: "startImageUrl",
      title: "Photo URL (fallback)",
      description: "Used only when no photo is uploaded above. Paste a direct image URL.",
      type: "url",
      group: "start",
      fieldset: "startImageSet",
    }),
    defineField({
      name: "startImageAlt",
      title: "Photo alt text",
      description:
        'Short description for screen readers and SEO. Example: "Reflective lake at dawn in the Swiss alps".',
      type: "localeString",
      group: "start",
      fieldset: "startImageSet",
    }),

    /* ──────────────────────────────────────────────────────────
       02 — HALTUNG · ANLAGEPHILOSOPHIE
       Image with a centered italic quote, plus a text column.
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "philosophyEyebrow",
      title: "Eyebrow text",
      description: 'Small uppercase label above the headline. Example: "Anlagephilosophie".',
      type: "localeString",
      group: "philosophy",
      fieldset: "philosophyHeaderSet",
    }),
    defineField({
      name: "philosophyHeadingLine1",
      title: "Headline — Line 1 (regular)",
      description: 'Example: "Analyse entscheidet."',
      type: "localeString",
      group: "philosophy",
      fieldset: "philosophyHeaderSet",
    }),
    defineField({
      name: "philosophyHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Example: "Nicht Stimmung."',
      type: "localeString",
      group: "philosophy",
      fieldset: "philosophyHeaderSet",
    }),
    /* ─── Right-side image ─── */
    defineField({
      name: "philosophyImage",
      title: "Photo (upload)",
      description:
        "Background image shown on the right side of section 02 (the centered quote sits on top of it). Recommended: a calm landscape / minimal photo. Wide aspect, ~16:9 or larger.",
      type: "image",
      options: { hotspot: true },
      group: "philosophy",
      fieldset: "philosophyImageSet",
    }),
    defineField({
      name: "philosophyImageUrl",
      title: "Photo URL (fallback)",
      description: "Used only when no photo is uploaded above. Paste a direct image URL.",
      type: "url",
      group: "philosophy",
      fieldset: "philosophyImageSet",
    }),
    defineField({
      name: "philosophyImageAlt",
      title: "Photo alt text",
      description:
        'Short description for screen readers and SEO. Example: "Misty Swiss alps at dawn".',
      type: "localeString",
      group: "philosophy",
      fieldset: "philosophyImageSet",
    }),

    defineField({
      name: "philosophyQuote",
      title: "Quote text (centered over the image)",
      description:
        "The italic quote shown on top of the photograph. Quotation marks « » are added automatically — write only the sentence.",
      type: "localeText",
      group: "philosophy",
      fieldset: "philosophyQuoteSet",
    }),
    defineField({
      name: "philosophyParagraphs",
      title: "Body paragraphs",
      description:
        "Add one entry per paragraph in the order they should appear in the left text column. Each paragraph is shown as a separate block.",
      type: "array",
      of: [{ type: "localeText" }],
      group: "philosophy",
      fieldset: "philosophyBodySet",
    }),

    /* ──────────────────────────────────────────────────────────
       03 — METHODE · VERMÖGENSVERWALTUNG
       Section + a separate detail overlay (“Anlageprozess”).
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "methodEyebrow",
      title: "Eyebrow text",
      description: 'Example: "Vermögensverwaltung".',
      type: "localeString",
      group: "method",
      fieldset: "methodHeaderSet",
    }),
    defineField({
      name: "methodHeadingLine1",
      title: "Headline — Line 1",
      description: 'Example: "Ihr Vermögen."',
      type: "localeString",
      group: "method",
      fieldset: "methodHeaderSet",
    }),
    defineField({
      name: "methodHeadingLine2",
      title: "Headline — Line 2",
      description: 'Example: "Ihr Konto."',
      type: "localeString",
      group: "method",
      fieldset: "methodHeaderSet",
    }),
    defineField({
      name: "methodHeadingLine3",
      title: "Headline — Line 3 (italic)",
      description: 'Example: "Unsere Verantwortung."',
      type: "localeString",
      group: "method",
      fieldset: "methodHeaderSet",
    }),
    defineField({
      name: "methodParagraphs",
      title: "Body paragraphs",
      description: "One entry per paragraph in the text column. Order is preserved.",
      type: "array",
      of: [{ type: "localeText" }],
      group: "method",
      fieldset: "methodBodySet",
    }),
    defineField({
      name: "methodCtaLabel",
      title: "Button label",
      description:
        'Label of the CTA that opens the detail overlay. Example: "Mehr zur Vermögensverwaltung".',
      type: "localeString",
      group: "method",
      fieldset: "methodCtaSet",
    }),
    defineField({
      name: "methodDetailEyebrow",
      title: "Detail — Eyebrow",
      description: 'Eyebrow inside the full-screen detail overlay. Example: "Anlageprozess".',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailSet",
    }),
    defineField({
      name: "methodDetailHeadingLine1",
      title: "Detail — Headline Line 1",
      description: 'Example: "Die Methode hinter".',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailSet",
    }),
    defineField({
      name: "methodDetailHeadingLine2",
      title: "Detail — Headline Line 2 (italic)",
      description: 'Example: "jedem Entscheid."',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailSet",
    }),

    /* ─── Right-side timeline (5 numbered steps) ─── */
    defineField({
      name: "methodTimelineSteps",
      title: "Steps 01 – 05",
      description:
        "The five numbered points on the right side of section 03. Add up to 5 entries — only the first 5 are used. Numbering (01, 02, …) is automatic; just write the title and short description.",
      type: "array",
      validation: (Rule) => Rule.max(5),
      of: [
        {
          type: "object",
          name: "timelineStep",
          title: "Step",
          fields: [
            {
              name: "title",
              title: "Title",
              description: 'Bigger serif title for this step. Example: "Ihre Ziele definieren".',
              type: "localeString",
            },
            {
              name: "description",
              title: "Short description",
              description:
                'Small grey line under the title. Example: "Anlageziele, Zeithorizont und Erwartungen klären".',
              type: "localeString",
            },
          ],
          preview: {
            select: { title: "title.de", subtitle: "description.de" },
            prepare({ title, subtitle }) {
              return {
                title: title || "Step (untitled)",
                subtitle: subtitle || "—",
              };
            },
          },
        },
      ],
      group: "method",
      fieldset: "methodTimelineSet",
    }),
    defineField({
      name: "methodTimelineDividerLabel",
      title: "Divider label (between step 02 and 03)",
      description:
        'Uppercase line that visually splits the 5 steps into two phases. Example: "Tellian Capital übernimmt".',
      type: "localeString",
      group: "method",
      fieldset: "methodTimelineSet",
    }),
    defineField({
      name: "methodTimelineFooterLabel",
      title: "Footer hint (under step 05)",
      description:
        'Italic line shown at the bottom of the timeline next to a small loop icon. Example: "Vierteljährliches Reporting an den Kunden".',
      type: "localeString",
      group: "method",
      fieldset: "methodTimelineSet",
    }),

    /* ─── Detail page — Step sections (the 5 detailed sections that appear
           when the user clicks "Mehr zur Vermögensverwaltung") ─── */
    defineField({
      name: "methodDetailSteps",
      title: "Detail page — Step sections",
      description:
        'These are the 5 detailed sections shown on the detail page (one per timeline step, in the same order). Each entry produces one full block: eyebrow ("Schritt 01") · big headline ("Ihre Ziele definieren") · grey subline · body paragraphs · em-dash bullets · optional closing paragraph. Numbering (01, 02, …) is automatic.',
      type: "array",
      validation: (Rule) => Rule.max(5),
      of: [
        {
          type: "object",
          name: "detailStep",
          title: "Detail step",
          fields: [
            {
              name: "shortLabel",
              title: "Stepper label (top of detail page)",
              description:
                'Single-word label shown in the horizontal stepper at the top of the detail page. Example: "Ziele" / "Risiko" / "Universum" / "Allokation" / "Portfolio".',
              type: "localeString",
            },
            {
              name: "eyebrow",
              title: "Eyebrow",
              description:
                'Tiny uppercase line above the section\'s headline. Example: "Schritt 01" or "Schritt 03 — Tellian Capital übernimmt".',
              type: "localeString",
            },
            {
              name: "headline",
              title: "Headline",
              description: 'Big serif H2 of this section. Example: "Ihre Ziele definieren".',
              type: "localeString",
            },
            {
              name: "subline",
              title: "Subline",
              description:
                'Small grey line directly under the headline. Example: "Anlageziele, Zeithorizont und Erwartungen klären".',
              type: "localeString",
            },
            {
              name: "body",
              title: "Body paragraphs",
              description:
                "One entry per paragraph (in order). Each entry appears as its own paragraph block on the detail page.",
              type: "array",
              of: [{ type: "localeText" }],
            },
            {
              name: "bullets",
              title: "Bullets (em-dash list)",
              description:
                'Each entry is rendered as one list item on the detail page, prefixed with an em-dash ("— text").',
              type: "array",
              of: [{ type: "localeText" }],
            },
            {
              name: "closing",
              title: "Closing paragraph (optional)",
              description:
                "Final paragraph of this section, shown after the bullets. Leave empty to omit.",
              type: "localeText",
            },
          ],
          preview: {
            select: { title: "headline.de", subtitle: "eyebrow.de" },
            prepare({ title, subtitle }) {
              return {
                title: title || "Detail step (untitled)",
                subtitle: subtitle || "—",
              };
            },
          },
        },
      ],
      group: "method",
      fieldset: "methodDetailStepsSet",
    }),

    /* ─── Detail page — FAQ ─── */
    defineField({
      name: "methodFaqItems",
      title: "FAQ items",
      description:
        "Questions & answers shown at the bottom of the detail page. Add as many as you like; each becomes a collapsible accordion row.",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          title: "FAQ item",
          fields: [
            {
              name: "question",
              title: "Question",
              description: 'Example: "Wie funktioniert die Vermögensverwaltung auf Mandatsbasis?".',
              type: "localeString",
            },
            {
              name: "answer",
              title: "Answer",
              description: "The expanded answer when the row is opened.",
              type: "localeText",
            },
          ],
          preview: {
            select: { title: "question.de", subtitle: "answer.de" },
            prepare({ title, subtitle }) {
              return {
                title: title || "Question (untitled)",
                subtitle: subtitle || "—",
              };
            },
          },
        },
      ],
      group: "method",
      fieldset: "methodDetailFaqSet",
    }),

    /* ─── Detail page — Final CTA block ─── */
    defineField({
      name: "methodDetailCtaEyebrow",
      title: "CTA — Eyebrow",
      description: 'Tiny uppercase label above the final CTA. Example: "Nächster Schritt".',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailCtaSet",
    }),
    defineField({
      name: "methodDetailCtaHeadingLine1",
      title: "CTA — Heading Line 1 (regular)",
      description: 'Example: "Ein Gespräch ist".',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailCtaSet",
    }),
    defineField({
      name: "methodDetailCtaHeadingLine2",
      title: "CTA — Heading Line 2 (italic)",
      description: 'Example: "der Anfang."',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailCtaSet",
    }),
    defineField({
      name: "methodDetailCtaDescription",
      title: "CTA — Description",
      description:
        'Body sentence under the CTA heading. Example: "Wenn Sie unseren Prozess bis hierher verfolgt haben — sprechen wir über Ihren. …".',
      type: "localeText",
      group: "method",
      fieldset: "methodDetailCtaSet",
    }),
    defineField({
      name: "methodDetailCtaButtonLabel",
      title: "CTA — Button label",
      description: 'Label on the dark button. Example: "Gespräch vereinbaren".',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailCtaSet",
    }),

    /* ─── Detail page — Footer tagline ─── */
    defineField({
      name: "methodDetailFooterTagline",
      title: "Footer tagline",
      description:
        'Tiny uppercase line at the very bottom of the detail page. Example: "Tellian Capital AG — Est. 1996 — Zürich".',
      type: "localeString",
      group: "method",
      fieldset: "methodDetailFooterSet",
    }),

    /* ──────────────────────────────────────────────────────────
       04 — STRATEGIE · ANLAGESTRATEGIEN
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "strategyEyebrow",
      title: "Eyebrow text",
      description: 'Example: "Anlagestrategien".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyHeaderSet",
    }),
    defineField({
      name: "strategyHeadingLine1",
      title: "Headline — Line 1",
      description: 'Example: "Zwei Perspektiven."',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyHeaderSet",
    }),
    defineField({
      name: "strategyHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Example: "Ein Portfolio."',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyHeaderSet",
    }),
    defineField({
      name: "strategyParagraphs",
      title: "Body paragraphs",
      description: "One entry per paragraph in the text column. Order is preserved.",
      type: "array",
      of: [{ type: "localeText" }],
      group: "strategy",
      fieldset: "strategyBodySet",
    }),
    defineField({
      name: "strategyCtaLabel",
      title: "Button label",
      description: 'Example: "Mehr zu den Strategien".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyCtaSet",
    }),
    defineField({
      name: "strategyDetailEyebrow",
      title: "Detail — Eyebrow",
      description: "Eyebrow inside the full-screen Anlagestrategien detail overlay.",
      type: "localeString",
      group: "strategy",
      fieldset: "strategyDetailSet",
    }),
    defineField({
      name: "strategyDetailHeadingLine1",
      title: "Detail — Headline Line 1",
      type: "localeString",
      group: "strategy",
      fieldset: "strategyDetailSet",
    }),
    defineField({
      name: "strategyDetailHeadingLine2",
      title: "Detail — Headline Line 2 (italic)",
      type: "localeString",
      group: "strategy",
      fieldset: "strategyDetailSet",
    }),

    /* ─── Top-Down card (dark, upper half of the visual) ─── */
    defineField({
      name: "strategyTopDownEyebrow",
      title: "Eyebrow",
      description: 'Tiny uppercase label above the title. Example: "Globale Perspektive".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyTopDownSet",
    }),
    defineField({
      name: "strategyTopDownTitle",
      title: "Title",
      description: 'Large serif title shown on the dark card. Example: "Top-Down".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyTopDownSet",
    }),
    defineField({
      name: "strategyTopDownBullets",
      title: "Bullets (max 3)",
      description:
        "Add up to three short lines, each shown next to a small accent line. The first three entries are used.",
      type: "array",
      of: [{ type: "localeString" }],
      validation: (Rule) => Rule.max(3),
      group: "strategy",
      fieldset: "strategyTopDownSet",
    }),

    /* ─── Middle accent bar (between the two cards) ─── */
    defineField({
      name: "strategyDecisionLabel",
      title: "Center label (italic serif)",
      description: 'Italic word/phrase in the middle gold bar. Example: "Anlageentscheid".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyDecisionSet",
    }),
    defineField({
      name: "strategyCommitteeLabel",
      title: "Right label (uppercase)",
      description: 'Tiny uppercase label on the right of the gold bar. Example: "Anlagekomitee".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyDecisionSet",
    }),

    /* ─── Bottom-Up card (light, lower half of the visual) ─── */
    defineField({
      name: "strategyBottomUpTitle",
      title: "Title",
      description: 'Large serif title on the light card. Example: "Bottom-Up".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyBottomUpSet",
    }),
    defineField({
      name: "strategyBottomUpEyebrow",
      title: "Eyebrow",
      description: 'Tiny uppercase label below the title. Example: "Einzeltitel-Perspektive".',
      type: "localeString",
      group: "strategy",
      fieldset: "strategyBottomUpSet",
    }),
    defineField({
      name: "strategyBottomUpBullets",
      title: "Bullets (max 3)",
      description:
        "Add up to three short lines, each shown next to a small accent line. The first three entries are used.",
      type: "array",
      of: [{ type: "localeString" }],
      validation: (Rule) => Rule.max(3),
      group: "strategy",
      fieldset: "strategyBottomUpSet",
    }),

    /* ──────────────────────────────────────────────────────────
       05 — TEAM · ÜBER TELLIAN
       Text column on the left, portrait filmstrip on the right.
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "teamEyebrow",
      title: "Eyebrow text",
      description: 'Example: "Über Tellian Capital".',
      type: "localeString",
      group: "team",
      fieldset: "teamHeaderSet",
    }),
    defineField({
      name: "teamHeadingLine1",
      title: "Headline — Line 1",
      description: 'Example: "Wer hinter den".',
      type: "localeString",
      group: "team",
      fieldset: "teamHeaderSet",
    }),
    defineField({
      name: "teamHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Example: "Entscheiden steht".',
      type: "localeString",
      group: "team",
      fieldset: "teamHeaderSet",
    }),
    defineField({
      name: "teamParagraphs",
      title: "About paragraphs",
      description: "One entry per paragraph for the “About Tellian Capital” column.",
      type: "array",
      of: [{ type: "localeText" }],
      group: "team",
      fieldset: "teamBodySet",
    }),
    defineField({
      name: "teamCtaLabel",
      title: "Button label",
      description: 'Example: "Gespräch vereinbaren".',
      type: "localeString",
      group: "team",
      fieldset: "teamCtaSet",
    }),
    defineField({
      name: "teamMembers",
      title: "Team members",
      description:
        "Add one entry per person. Each card shows: photo, name, role, and a Send-Message link (uses email derived from the name).",
      type: "array",
      group: "team",
      fieldset: "teamMembersSet",
      of: [
        {
          type: "object",
          name: "teamMember",
          title: "Team Member",
          fields: [
            {
              name: "name",
              title: "Full name",
              description: 'Shown under the portrait. Example: "Dr. Thomas Keller".',
              type: "string",
            },
            {
              name: "role",
              title: "Role / Title",
              description: 'Job title shown under the name. Example: "Geschäftsleitung & Gründer".',
              type: "localeString",
            },
            {
              name: "bio",
              title: "Short bio",
              description:
                "Optional one-sentence bio. Currently not displayed in the website but kept for future use.",
              type: "localeText",
            },
            {
              name: "image",
              title: "Photo (upload)",
              description: "Upload a portrait photo. Recommended ratio 4:5 (portrait).",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "imageUrl",
              title: "Photo URL (fallback)",
              description: "Used only when no photo is uploaded above.",
              type: "url",
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
       Editorial column + form column with map overlay.
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "contactSubheading",
      title: "Eyebrow text",
      description: 'Small uppercase label above the headline. Example: "Kontakt".',
      type: "localeString",
      group: "contact",
      fieldset: "contactHeaderSet",
    }),
    defineField({
      name: "contactHeading",
      title: "Headline",
      description: 'Main headline of the contact section. Example: "Ein Gespräch ist der Anfang.".',
      type: "localeString",
      group: "contact",
      fieldset: "contactHeaderSet",
    }),
    defineField({
      name: "contactDescription",
      title: "Description paragraph",
      description: "The introductory paragraph below the headline.",
      type: "localeText",
      group: "contact",
      fieldset: "contactHeaderSet",
    }),
    defineField({
      name: "contactFormHeading",
      title: "Form heading",
      description: 'Small uppercase label above the form fields. Example: "Schreiben Sie uns".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormFirstName",
      title: "Placeholder — First name",
      description: 'Placeholder shown inside the empty field. Example: "Vorname".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormLastName",
      title: "Placeholder — Last name",
      description: 'Example: "Nachname".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormEmail",
      title: "Placeholder — Email",
      description: 'Example: "E-Mail".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormPhone",
      title: "Placeholder — Phone",
      description: 'Example: "Telefon".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormMessage",
      title: "Placeholder — Message",
      description: 'Example: "Nachricht".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormSubmit",
      title: "Submit button label",
      description: 'Example: "Anfrage senden →".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormResponseTime",
      title: "Response-time note",
      description: 'Caption next to the submit button. Example: "Antwort innert 24h".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormThanksTitle",
      title: "Thank-you title (after submit)",
      description: 'Example: "Vielen Dank.".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFormThanksBody",
      title: "Thank-you body (after submit)",
      description: "The follow-up sentence shown after a successful submit.",
      type: "localeText",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactCompanyName",
      title: "Company name",
      description: 'Top line in the address block. Example: "Tellian Capital".',
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactCompanyTagline",
      title: "Company tagline",
      description: 'Smaller line under the company name. Example: "Vermögensverwaltung Zürich AG".',
      type: "localeString",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactAddress",
      title: "Address",
      description: 'Single line. Example: "Löwenstrasse 1, CH-8001 Zürich".',
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactPhone",
      title: "Phone",
      description: "Click-to-call number. Use international format.",
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactEmail",
      title: "Email",
      description: "Click-to-mail address.",
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactMapLinkLabel",
      title: "Map link label",
      description:
        'Label of the small button that opens the map overlay. Example: "Auf Karte anzeigen".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFooterSet",
    }),
    defineField({
      name: "contactFooterTagline",
      title: "Footer tagline",
      description:
        'Tiny uppercase line at the very bottom. Example: "Tellian Capital AG — Est. 1996 — Zürich".',
      type: "localeString",
      group: "contact",
      fieldset: "contactFooterSet",
    }),
  ],

  /* List preview so the document is always recognisable in the document list */
  preview: {
    select: {
      title: "title",
      subtitle: "startHeadingLine1.de",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Homepage",
        subtitle: subtitle ? `Hero: ${subtitle}` : "Edit homepage content",
      };
    },
  },
});
