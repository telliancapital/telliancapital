import { defineField, defineType } from "sanity";

/**
 * Solutions Homepage schema — single document representing the entire
 * one-page "Tellian Capital Solutions" site (separate Next.js app, deployed
 * at solutions.telliancapital.ch). Supports three languages (DE/EN/FR),
 * unlike the main site's two (DE/EN) — hence the `triLocaleString`/
 * `triLocaleText` field types instead of `localeString`/`localeText`.
 *
 * Tabs (groups) match the on-page sections:
 *   Sidebar → Hero → Dienstleistungen → Team → Kontakt
 */
export const solutionsHomepageType = defineType({
  name: "solutionsHomepage",
  title: "Solutions Homepage",
  type: "document",

  groups: [
    { name: "navigation", title: "Sidebar · Navigation", default: true },
    { name: "hero", title: "1. Start · Hero" },
    { name: "services", title: "2. Dienstleistungen" },
    { name: "team", title: "3. Team" },
    { name: "contact", title: "4. Kontakt" },
  ],

  fieldsets: [
    /* Navigation */
    {
      name: "navItemsSet",
      title: "Nav items (4 sections)",
      options: { collapsible: true, collapsed: false },
    },

    /* Hero */
    {
      name: "heroEyebrowSet",
      title: "Eyebrow (top label)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "heroTaglineSet",
      title: "Tagline (3 lines)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "heroBodySet",
      title: "Lead sentence + closing line",
      options: { collapsible: true, collapsed: false },
    },

    /* Services */
    {
      name: "servicesHeaderSet",
      title: "Eyebrow + Headline",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "servicesIntroSet",
      title: "Intro paragraph",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "servicesColumnsSet",
      title: "Columns (3 — Beratung / Best Execution / Lifecycle Management)",
      options: { collapsible: true, collapsed: false },
    },

    /* Team */
    {
      name: "teamHeaderSet",
      title: "Eyebrow + Headline",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "teamLabelsSet",
      title: "Labels (Send message / CTA)",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "teamMembersSet",
      title: "Team members",
      options: { collapsible: true, collapsed: false },
    },

    /* Contact */
    {
      name: "contactHeaderSet",
      title: "Eyebrow + Headline",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contactBodySet",
      title: "Intro + hours",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contactFormSet",
      title: "Form labels",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contactCompanySet",
      title: "Company / address",
      options: { collapsible: true, collapsed: false },
    },
  ],

  fields: [
    /* ──────────────────────────────────────────────────────────
       SIDEBAR · NAVIGATION
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "navItems",
      title: "Nav items (1 – 4)",
      description:
        "The four items shown in the expanded sidebar panel (desktop) and the full-screen menu (mobile). Order is fixed: 1 Start · 2 Dienstleistungen · 3 Team · 4 Kontakt — keep that order so each entry scrolls to the right section.",
      type: "array",
      validation: (Rule) => Rule.max(4),
      of: [
        {
          type: "object",
          name: "solutionsNavItem",
          title: "Nav item",
          fields: [
            {
              name: "label",
              title: "Label",
              description: 'Example: "Dienstleistungen".',
              type: "triLocaleString",
            },
            {
              name: "sub",
              title: "Sub-label",
              description: 'Small grey line under the label. Example: "Was wir tun".',
              type: "triLocaleString",
            },
          ],
          preview: {
            select: { title: "label.de", subtitle: "sub.de" },
          },
        },
      ],
      group: "navigation",
      fieldset: "navItemsSet",
    }),

    /* ──────────────────────────────────────────────────────────
       1. START · HERO
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "heroEyebrow",
      title: "Eyebrow text",
      description: 'Shown above the tagline. Example: "Tellian Capital Solutions".',
      type: "triLocaleString",
      group: "hero",
      fieldset: "heroEyebrowSet",
    }),
    defineField({
      name: "heroTaglineLine1",
      title: "Tagline — Line 1",
      description: 'Example: "Die richtige Gelegenheit."',
      type: "triLocaleString",
      group: "hero",
      fieldset: "heroTaglineSet",
    }),
    defineField({
      name: "heroTaglineLine2",
      title: "Tagline — Line 2",
      description: 'Example: "Der richtige Emittent."',
      type: "triLocaleString",
      group: "hero",
      fieldset: "heroTaglineSet",
    }),
    defineField({
      name: "heroTaglineLine3",
      title: "Tagline — Line 3",
      description: 'Example: "Der richtige Zeitpunkt."',
      type: "triLocaleString",
      group: "hero",
      fieldset: "heroTaglineSet",
    }),
    defineField({
      name: "heroLeadSentence",
      title: "Lead sentence",
      description: "One sentence under the tagline.",
      type: "triLocaleText",
      group: "hero",
      fieldset: "heroBodySet",
    }),
    defineField({
      name: "heroClosingLine",
      title: "Closing line (italic serif)",
      description: 'Example: "Wir beschaffen Gelegenheiten, keine Produkte."',
      type: "triLocaleText",
      group: "hero",
      fieldset: "heroBodySet",
    }),

    /* ──────────────────────────────────────────────────────────
       2. DIENSTLEISTUNGEN
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "servicesEyebrow",
      title: "Eyebrow text",
      description: 'Example: "Dienstleistungen".',
      type: "triLocaleString",
      group: "services",
      fieldset: "servicesHeaderSet",
    }),
    defineField({
      name: "servicesHeadingLine1",
      title: "Headline — Line 1",
      description: 'Example: "Was wir".',
      type: "triLocaleString",
      group: "services",
      fieldset: "servicesHeaderSet",
    }),
    defineField({
      name: "servicesHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Example: "tun."',
      type: "triLocaleString",
      group: "services",
      fieldset: "servicesHeaderSet",
    }),
    defineField({
      name: "servicesIntro",
      title: "Intro paragraph",
      type: "triLocaleText",
      group: "services",
      fieldset: "servicesIntroSet",
    }),
    defineField({
      name: "servicesColumns",
      title: "Columns (max 3)",
      description:
        "Shown on the purple panel: Beratung / Best Execution / Lifecycle Management. Numbered automatically (01, 02, 03) based on order.",
      type: "array",
      validation: (Rule) => Rule.max(3),
      of: [
        {
          type: "object",
          name: "solutionsServiceColumn",
          title: "Column",
          fields: [
            {
              name: "title",
              title: "Title",
              description: 'Example: "Beratung".',
              type: "triLocaleString",
            },
            {
              name: "body",
              title: "Body",
              type: "triLocaleText",
            },
          ],
          preview: {
            select: { title: "title.de" },
          },
        },
      ],
      group: "services",
      fieldset: "servicesColumnsSet",
    }),

    /* ──────────────────────────────────────────────────────────
       3. TEAM
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "teamEyebrow",
      title: "Eyebrow text",
      description: 'Example: "Team".',
      type: "triLocaleString",
      group: "team",
      fieldset: "teamHeaderSet",
    }),
    defineField({
      name: "teamHeadingLine1",
      title: "Headline — Line 1",
      description: 'Example: "Wer dahinter".',
      type: "triLocaleString",
      group: "team",
      fieldset: "teamHeaderSet",
    }),
    defineField({
      name: "teamHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Example: "steht."',
      type: "triLocaleString",
      group: "team",
      fieldset: "teamHeaderSet",
    }),
    defineField({
      name: "teamSendMessageLabel",
      title: '"Send message" link label',
      description: 'Example: "Nachricht senden".',
      type: "triLocaleString",
      group: "team",
      fieldset: "teamLabelsSet",
    }),
    defineField({
      name: "teamCtaLabel",
      title: "Button label",
      description: 'Example: "Gespräch vereinbaren".',
      type: "triLocaleString",
      group: "team",
      fieldset: "teamLabelsSet",
    }),
    defineField({
      name: "teamMembers",
      title: "Team members",
      description:
        "Add one entry per person. Each card shows: photo, name, role, LinkedIn icon (if set), and a Send-Message link.",
      type: "array",
      group: "team",
      fieldset: "teamMembersSet",
      of: [
        {
          type: "object",
          name: "solutionsTeamMember",
          title: "Team Member",
          fields: [
            {
              name: "name",
              title: "Full name",
              description: 'Shown under the portrait. Example: "Olivier M. Bill".',
              type: "string",
            },
            {
              name: "role",
              title: "Role / Title",
              description: 'Example: "CEO".',
              type: "triLocaleString",
            },
            {
              name: "email",
              title: "Email (for the Send-Message link)",
              type: "string",
            },
            {
              name: "linkedin",
              title: "LinkedIn profile URL",
              description: "Optional. When filled in, a LinkedIn icon appears next to the name.",
              type: "url",
            },
            {
              name: "image",
              title: "Photo (upload)",
              description: "Upload a portrait photo. Recommended ratio 3:4 (portrait).",
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
       4. KONTAKT
       ────────────────────────────────────────────────────────── */
    defineField({
      name: "contactEyebrow",
      title: "Eyebrow text",
      description: 'Example: "Kontakt".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactHeaderSet",
    }),
    defineField({
      name: "contactHeadingLine1",
      title: "Headline — Line 1",
      description: 'Example: "Sprechen".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactHeaderSet",
    }),
    defineField({
      name: "contactHeadingLine2",
      title: "Headline — Line 2 (italic)",
      description: 'Example: "wir."',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactHeaderSet",
    }),
    defineField({
      name: "contactIntro",
      title: "Intro sentence",
      type: "triLocaleText",
      group: "contact",
      fieldset: "contactBodySet",
    }),
    defineField({
      name: "contactHours",
      title: "Opening hours",
      description: 'Example: "Montag bis Freitag, 8 bis 18 Uhr".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactBodySet",
    }),
    defineField({
      name: "contactFormEyebrow",
      title: "Form eyebrow",
      description: 'Example: "Schreiben Sie uns".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFieldFirstName",
      title: "Field label — First name",
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFieldLastName",
      title: "Field label — Last name",
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFieldEmail",
      title: "Field label — Email",
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFieldPhone",
      title: "Field label — Phone",
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactFieldMessage",
      title: "Field label — Message",
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactSubmitLabel",
      title: "Submit button label",
      description: 'Example: "Anfrage senden".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactResponseHint",
      title: "Response-time hint",
      description: 'Example: "Antwort innert 24h".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactPrivacyNotice",
      title: "Privacy notice sentence",
      description:
        'Full sentence including the clickable phrase (e.g. "Datenschutzbestimmungen"). The website code detects and re-links that phrase automatically — keep the same wording as the example if you want the link to stay in the same place. Example: "Mit dem Absenden stimmen Sie unseren Datenschutzbestimmungen zu."',
      type: "triLocaleText",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactMapLink",
      title: '"Show on map" link label',
      description: 'Example: "Auf Karte anzeigen".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactBodySet",
    }),
    defineField({
      name: "contactThankYou",
      title: "Thank-you title (after form submit)",
      description: 'Example: "Vielen Dank."',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactThankYouSub",
      title: "Thank-you sub-line",
      description: 'Example: "Wir melden uns innert 24 Stunden."',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactFormSet",
    }),
    defineField({
      name: "contactPhone",
      title: "Phone number",
      description: 'Click-to-call number. Example: "+41 44 224 40 24".',
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactEmailAddr",
      title: "Email address",
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactCompanyName",
      title: "Company name",
      description: 'Example: "Tellian Capital".',
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactCompanySubtitle",
      title: "Company subtitle",
      description: 'Example: "Vermögensverwaltung Zürich AG (vormals Dr. Blumer & Partner)".',
      type: "string",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
    defineField({
      name: "contactAddressLine",
      title: "Address line",
      description: 'Example: "Löwenstrasse 1, CH-8001 Zürich".',
      type: "triLocaleString",
      group: "contact",
      fieldset: "contactCompanySet",
    }),
  ],

  preview: {
    prepare() {
      return { title: "Solutions Homepage" };
    },
  },
});
