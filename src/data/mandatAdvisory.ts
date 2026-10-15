/* ═══════════════════════════════════════════════════════════
   MANDAT UND ADVISORY — gemeinsame Vergleichstabelle

   Steht auf BEIDEN Unterseiten (Mandat links, Advisory rechts).
   Wortlaut aus dem Redesign — im CMS gibt es dafür keine Felder.
   ═══════════════════════════════════════════════════════════ */

export type Pfad = "mandat" | "advisory";

export interface VergleichZeile {
  label: string;
  mandat: string;
  advisory: string;
}

export interface VergleichInhalt {
  titel: string;
  spalten: Readonly<Record<Pfad, string>>;
  wege: Readonly<Record<Pfad, string>>;
  zeilen: readonly VergleichZeile[];
}

export const VERGLEICH: Readonly<Record<"DE" | "EN", VergleichInhalt>> = {
  DE: {
    titel: "Mandat und Advisory im Vergleich",
    spalten: { mandat: "Mandat", advisory: "Advisory" },
    wege: { mandat: "Mehr zum Mandat", advisory: "Mehr zu Advisory" },
    zeilen: [
      {
        label: "Verwaltungsvollmacht",
        mandat: "Sie erteilen Tellian Capital eine Verwaltungsvollmacht.",
        advisory: "Sie erteilen keine Verwaltungsvollmacht.",
      },
      {
        label: "Anlageentscheid",
        mandat: "Wir treffen die Anlageentscheide innerhalb des vereinbarten Rahmens.",
        advisory: "Die finale Entscheidung über jede Anlage liegt bei Ihnen.",
      },
      {
        label: "Umsetzung",
        mandat: "Wir setzen die Anlageentscheide für Sie um.",
        advisory: "Umgesetzt wird ausschliesslich, was Sie freigeben.",
      },
      {
        label: "Für wen gedacht",
        mandat:
          "Für Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten und Wert auf eine professionelle, kontinuierliche Betreuung ihres Vermögens legen.",
        advisory:
          "Für Anleger, die aktiv bleiben und die Verantwortung für ihre Anlageentscheide behalten möchten.",
      },
    ],
  },
  EN: {
    titel: "Mandate and Advisory compared",
    spalten: { mandat: "Discretionary Mandate", advisory: "Advisory" },
    wege: { mandat: "Learn more about our mandate", advisory: "Learn more about Advisory" },
    zeilen: [
      {
        label: "Discretionary authority",
        mandat: "You grant Tellian Capital discretionary authority.",
        advisory: "You grant no discretionary authority.",
      },
      {
        label: "Investment decision",
        mandat: "We make the investment decisions within the agreed framework.",
        advisory: "The final decision on every investment remains with you.",
      },
      {
        label: "Implementation",
        mandat: "We implement the investment decisions for you.",
        advisory: "Nothing is implemented without your approval.",
      },
      {
        label: "Who it is for",
        mandat:
          "For investors who prefer to entrust day-to-day investment decisions to experienced professionals while benefiting from continuous and professional portfolio management.",
        advisory:
          "For investors who want to remain actively involved and retain control over their investment decisions.",
      },
    ],
  },
};
