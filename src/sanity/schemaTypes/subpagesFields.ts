import { defineField, type FieldDefinition } from "sanity";

/**
 * Field definitions of the Mandat / Advisory subpages and their shared
 * comparison table — used twice:
 *   • by the own document `subpages` (the place to edit them), and
 *   • by `homepage`, marked as deprecated, until the editors have copied
 *     their content over and cleared the homepage copies.
 *
 * Why two places: Sanity allows at most 1000 distinct attribute paths per
 * document and the homepage document is at that limit (checked 27.10.2026).
 * Field values the editors entered on the homepage stay there until they
 * clear them; the site reads the `subpages` document first and falls back
 * to the homepage field of the same name (see HOMEPAGE_QUERY).
 */

export type SubpageSection = "mandat" | "advisory" | "compare";

interface Placement {
  group: (section: SubpageSection) => string;
  fieldset?: (section: SubpageSection) => string;
  deprecated?: { reason: string };
}

export function subpageFields({ group, fieldset, deprecated }: Placement): FieldDefinition[] {
  const place = (section: SubpageSection) => ({
    group: group(section),
    ...(fieldset ? { fieldset: fieldset(section) } : {}),
    ...(deprecated ? { deprecated } : {}),
  });

  const steps = (name: string, section: SubpageSection, example: string) =>
    defineField({
      name,
      title: "Process steps",
      description: `The numbered timeline. One entry per step, order is preserved. Example: ${example}.`,
      type: "array",
      of: [
        {
          type: "object",
          name: "subpageStep",
          title: "Step",
          fields: [
            { name: "title", title: "Step title", type: "localeString" },
            { name: "text", title: "Step text", type: "localeText" },
          ],
          preview: {
            select: { title: "title.de", subtitle: "text.de" },
            prepare({ title, subtitle }) {
              return { title: title || "Step (untitled)", subtitle: subtitle ? String(subtitle).slice(0, 80) : "—" };
            },
          },
        },
      ],
      ...place(section),
    });

  const lead = (name: string, section: SubpageSection) =>
    defineField({
      name,
      title: "Lead paragraphs",
      description: "One entry per paragraph under the headline. Order is preserved.",
      type: "array",
      of: [{ type: "localeText" }],
      ...place(section),
    });

  const str = (name: string, title: string, description: string, section: SubpageSection) =>
    defineField({ name, title, description, type: "localeString", ...place(section) });

  return [
    /* Mandat */
    str("mandatHeadingLine1", "Headline — line 1", 'Example: "Sie geben den Rahmen."', "mandat"),
    str("mandatHeadingLine2", "Headline — line 2", 'Example: "Wir übernehmen die Verantwortung."', "mandat"),
    lead("mandatLead", "mandat"),
    str("mandatCtaLabel", "Button label", 'Example: "Gespräch vereinbaren". Scrolls to the contact section.', "mandat"),
    str("mandatProcessTitle", "Process title", 'Heading above the steps. Example: "Mit Methode gemeinsam zum Ziel."', "mandat"),
    steps("mandatSteps", "mandat", "Ziele · Risikoprofil · Selektion · Allokation · Verwaltung"),

    /* Advisory */
    str("advisoryHeadingLine1", "Headline — line 1", 'Example: "Sie entscheiden."', "advisory"),
    str("advisoryHeadingLine2", "Headline — line 2", 'Example: "Wir liefern die Grundlage."', "advisory"),
    lead("advisoryLead", "advisory"),
    str("advisoryCtaLabel", "Button label", 'Example: "Gespräch vereinbaren". Scrolls to the contact section.', "advisory"),
    str(
      "advisoryProcessTitle",
      "Process title (optional)",
      "Heading above the steps. The design shows none on the Advisory page — leave empty to keep it that way.",
      "advisory",
    ),
    steps("advisorySteps", "advisory", "Analyse · Empfehlung · Ihre Entscheidung"),

    /* Comparison table (both subpages) */
    str("compareTitle", "Table title", 'Example: "Mandat und Advisory im Vergleich".', "compare"),
    str("compareColumnMandat", "Column header — Mandat", 'Example: "Mandat".', "compare"),
    str("compareColumnAdvisory", "Column header — Advisory", 'Example: "Advisory".', "compare"),
    str(
      "compareLinkMandat",
      "Link text to the Mandat page",
      'Visible link TEXT shown on the Advisory page (not a URL — the page switch is handled in code). Example: "Mehr zum Mandat".',
      "compare",
    ),
    str(
      "compareLinkAdvisory",
      "Link text to the Advisory page",
      'Visible link TEXT shown on the Mandat page (not a URL). Example: "Mehr zu Advisory".',
      "compare",
    ),
    defineField({
      name: "compareRows",
      title: "Table rows",
      description:
        "One row per aspect, with the Mandat and Advisory cells. Example rows: Verwaltungsvollmacht · Anlageentscheid · Umsetzung · Für wen gedacht.",
      type: "array",
      of: [
        {
          type: "object",
          name: "compareRow",
          title: "Row",
          fields: [
            { name: "label", title: "Row label", type: "localeString" },
            { name: "mandat", title: "Mandat cell", type: "localeText" },
            { name: "advisory", title: "Advisory cell", type: "localeText" },
          ],
          preview: {
            select: { title: "label.de", subtitle: "mandat.de" },
            prepare({ title, subtitle }) {
              return { title: title || "Row (untitled)", subtitle: subtitle ? String(subtitle).slice(0, 80) : "—" };
            },
          },
        },
      ],
      ...place("compare"),
    }),
  ];
}
