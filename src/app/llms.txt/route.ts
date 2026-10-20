import { BUSINESS, SITE_URL } from "@/lib/seo";

/* /llms.txt (https://llmstxt.org): a plain-text map of the site for AI
   assistants — who the firm is and which pages answer what. The pages
   themselves render their text server-side (app/_site/SeoOutline.tsx),
   so the linked URLs are readable without JavaScript. */

export const dynamic = "force-static";

const PAGES: readonly { title: string; path: string; description: string }[] = [
  {
    title: "Startseite (Deutsch)",
    path: "/de",
    description: "Überblick: Anlagephilosophie, Anlageprozess, Anlagestrategien, Team und Kontakt.",
  },
  {
    title: "Homepage (English)",
    path: "/en",
    description: "Overview: investment philosophy, investment process, strategies, team and contact.",
  },
  {
    title: "Vermögensverwaltung — Anlageprozess",
    path: "/vermoegensverwaltung",
    description: "Wie Tellian Capital Vermögen verwaltet: Schritte des Anlageprozesses, Rollen von Kunde, Tellian und Depotbank, FAQ.",
  },
  {
    title: "Anlagestrategien",
    path: "/anlagestrategien",
    description: "Top-down- und Bottom-up-Analyse, Anlagekomitee, Core/Satelliten-Struktur, FAQ.",
  },
  {
    title: "Portfolio Management",
    path: "/portfolio-management",
    description: "Anlageprozess, Anlagekomitee, Strategieprofile mit Zielen und Volatilität, Anlageuniversum.",
  },
  {
    title: "Häufige Fragen",
    path: "/faq",
    description: "Antworten zu Vermögensverwaltung, Anlagestrategien und Zusammenarbeit.",
  },
  {
    title: "FAQ (English)",
    path: "/en/faq",
    description: "Answers about wealth management, investment strategies and working with Tellian Capital.",
  },
  {
    title: "Tellian Capital Solutions",
    path: "/solutions/de",
    description:
      "Unabhängige Anlagelösungen (Aktien, Zinsen, Credit, Währungen, Rohstoffe, Fonds) für Privatbanken, Family Offices und Vermögensverwalter. Auch auf Englisch (/solutions/en) und Französisch (/solutions/fr).",
  },
  {
    title: "Kundeninformation",
    path: "/kundeninformation",
    description: "Gesetzlich vorgeschriebene Kundeninformation gemäss FINIG und FIDLEG.",
  },
  {
    title: "Datenschutz",
    path: "/datenschutz",
    description: "Datenschutzerklärung.",
  },
];

export function GET() {
  const body = [
    `# ${BUSINESS.name}`,
    "",
    `> ${BUSINESS.legalName} ist eine unabhängige Vermögensverwaltung in ${BUSINESS.city}, Schweiz, gegründet ${BUSINESS.foundingYear}. Independent wealth manager in Zurich, Switzerland, since ${BUSINESS.foundingYear}.`,
    "",
    "Tellian Capital betreut Privatpersonen, Unternehmerfamilien und Stiftungen persönlich, mit individuellen Portfoliolösungen in einer Core/Satelliten-Struktur und einem strukturierten Anlageprozess. Sprachen: Deutsch, Englisch.",
    "",
    `- Adresse: ${BUSINESS.legalName}, ${BUSINESS.street}, ${BUSINESS.postalCode} ${BUSINESS.city}, Schweiz`,
    `- Telefon: ${BUSINESS.phone}`,
    `- E-Mail: ${BUSINESS.email}`,
    "- Erreichbar: Montag–Freitag, 08:00–18:00",
    "",
    "## Seiten",
    "",
    ...PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.description}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
