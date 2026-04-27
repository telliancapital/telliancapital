export const LEGAL_PATHS = ["/impressum", "/datenschutz", "/kundeninformation"] as const;

export type LegalPath = (typeof LEGAL_PATHS)[number];

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalPageContent {
  title: string;
  updated?: string;
  sections: LegalSection[];
}

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const LOREM_MED =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const LOREM_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

export const LEGAL_PAGES: Record<LegalPath, LegalPageContent> = {
  "/impressum": {
    title: "Impressum",
    updated: "Stand: Platzhalter",
    sections: [
      {
        heading: "Anbieter und verantwortliche Stelle",
        paragraphs: ["Tellian Capital AG", LOREM_SHORT],
      },
      {
        heading: "Anschrift",
        paragraphs: ["Löwenstrasse 1", "CH-8001 Zürich", "Schweiz"],
      },
      {
        heading: "Kontakt",
        paragraphs: ["Telefon: +41 44 224 40 24", "E-Mail: info@telliancapital.ch"],
      },
      {
        heading: "Handelsregister",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Aufsichtsbehörde",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Redaktionelle Verantwortung",
        paragraphs: [LOREM_SHORT],
      },
      {
        heading: "Haftungsausschluss",
        paragraphs: [LOREM_LONG, LOREM_SHORT],
      },
      {
        heading: "Urheberrecht",
        paragraphs: [LOREM_MED],
      },
    ],
  },

  "/datenschutz": {
    title: "Datenschutzerklärung",
    updated: "Stand: Platzhalter",
    sections: [
      {
        heading: "Verantwortliche Stelle",
        paragraphs: [LOREM_SHORT],
      },
      {
        heading: "Erhobene Daten",
        paragraphs: [LOREM_MED],
        list: [
          "Kontaktdaten (Name, E-Mail, Telefon)",
          "Nutzungsdaten beim Besuch der Website",
          "Mandatsbezogene Informationen",
          "Technische Daten (IP-Adresse, Browser-Typ)",
        ],
      },
      {
        heading: "Zweck der Datenverarbeitung",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Cookies und Tracking",
        paragraphs: [LOREM_MED, LOREM_SHORT],
      },
      {
        heading: "Ihre Rechte",
        paragraphs: [LOREM_SHORT],
        list: [
          "Recht auf Auskunft über gespeicherte Daten",
          "Recht auf Berichtigung unrichtiger Daten",
          "Recht auf Löschung",
          "Recht auf Widerspruch gegen die Verarbeitung",
        ],
      },
      {
        heading: "Speicherdauer",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Datensicherheit",
        paragraphs: [LOREM_SHORT],
      },
      {
        heading: "Kontakt für Datenschutzanfragen",
        paragraphs: [LOREM_SHORT],
      },
    ],
  },

  "/kundeninformation": {
    title: "Kundeninformation",
    updated: "Stand: Platzhalter",
    sections: [
      {
        heading: "Über Tellian Capital",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Unsere Dienstleistungen",
        paragraphs: [LOREM_SHORT],
        list: [
          "Vermögensverwaltung auf Mandatsbasis",
          "Anlageberatung",
          "Portfolio-Analyse und Reporting",
        ],
      },
      {
        heading: "Anlagerisiken",
        paragraphs: [LOREM_LONG, LOREM_SHORT],
      },
      {
        heading: "Vergütung und Kosten",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Umgang mit Interessenkonflikten",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Best Execution",
        paragraphs: [LOREM_SHORT],
      },
      {
        heading: "Beschwerdeverfahren",
        paragraphs: [LOREM_MED],
      },
      {
        heading: "Investorenschutz",
        paragraphs: [LOREM_SHORT],
      },
    ],
  },
};

export const LEGAL_LINK_LABELS: Record<LegalPath, string> = {
  "/impressum": "Impressum",
  "/datenschutz": "Datenschutz",
  "/kundeninformation": "Kundeninformation",
};
