"use client";

import { SubpageMandatAdvisory } from "./SubpageMandatAdvisory";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

/* UNTERSEITE — MANDAT (nur Inhalt). Inhalte aus Sanity (homepage →
   «3a. Unterseiten» → mandat*), Rückfall = Wortlaut des Redesigns. */

interface Inhalt {
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  vorgehenTitel: string;
  schritte: readonly { titel: string; zeile: string }[];
}

const INHALT: Readonly<Record<"DE" | "EN", Inhalt>> = {
  DE: {
    titel: ["Sie geben den Rahmen.", "Wir übernehmen die Verantwortung."],
    lead: [
      "Mit einem Vermögensverwaltungsmandat übertragen Sie Tellian Capital die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Sie erteilen uns eine Verwaltungsvollmacht, wir treffen die Anlageentscheide und setzen diese für Sie um.",
      "Ihre persönlichen Ziele, Ihre Risikobereitschaft und Ihre finanzielle Situation bilden dabei den verbindlichen Rahmen.",
    ],
    knopf: "Gespräch vereinbaren",
    vorgehenTitel: "Mit Methode gemeinsam zum Ziel.",
    schritte: [
      { titel: "Ziele", zeile: "Wir definieren Ihre Anlageziele, Bedürfnisse und den passenden Anlagehorizont." },
      { titel: "Risikoprofil", zeile: "Wir bestimmen Ihr Risikoprofil als Grundlage für Ihre persönliche Anlagestrategie." },
      { titel: "Selektion", zeile: "Unser Anlageausschuss identifiziert auf Basis hauseigener Anlagemodelle gezielte Investmentmöglichkeiten an den globalen Kapitalmärkten." },
      { titel: "Allokation", zeile: "Wir strukturieren Ihr Portfolio nach Risikoprofil und Anlageausrichtung und passen es laufend an." },
      { titel: "Verwaltung", zeile: "Wir überwachen und steuern Ihr Portfolio kontinuierlich und informieren Sie transparent über die Entwicklung." },
    ],
  },
  EN: {
    titel: ["You set the framework.", "We take responsibility."],
    lead: [
      "With a discretionary wealth management mandate, you entrust Tellian Capital with the management of your portfolio within the investment strategy we define together. You grant us discretionary authority to make and implement investment decisions on your behalf.",
      "Your personal objectives, risk tolerance and financial situation provide the clear framework for every decision we make.",
    ],
    knopf: "Arrange a meeting",
    vorgehenTitel: "A structured approach. A shared goal.",
    schritte: [
      { titel: "Objectives", zeile: "We define your investment objectives, individual needs and appropriate investment horizon." },
      { titel: "Risk Profile", zeile: "We establish your risk profile as the foundation for your individual investment strategy." },
      { titel: "Selection", zeile: "Our investment committee identifies targeted investment opportunities in global capital markets based on proprietary investment models." },
      { titel: "Allocation", zeile: "We structure your portfolio in line with your risk profile and investment strategy and adjust it as markets evolve." },
      { titel: "Management", zeile: "We continuously monitor and manage your portfolio and keep you transparently informed of its development." },
    ],
  },
};

interface Props {
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  homepage?: any;
  onContactClick?: () => void;
  onAndereSeite?: () => void;
}

export function UnterseiteMandat({ isMobile = false, aktiv = true, sprache = "DE", homepage, onContactClick, onAndereSeite }: Props) {
  const { t } = useLanguage();
  const basis = INHALT[sprache];
  const cmsLead: string[] = (homepage?.mandatLead ?? [])
    .map((a: LocaleValue) => t(a, ""))
    .filter((a: string) => a.trim().length > 0);
  const cmsSchritte = (homepage?.mandatSteps ?? [])
    .map((st: { title?: LocaleValue; text?: LocaleValue }) => ({ titel: t(st?.title, ""), zeile: t(st?.text, "") }))
    .filter((st: { titel: string }) => st.titel.trim().length > 0);
  const inhalt: Inhalt = {
    titel: [t(homepage?.mandatHeadingLine1, basis.titel[0]), t(homepage?.mandatHeadingLine2, basis.titel[1])],
    lead: cmsLead.length > 0 ? cmsLead : basis.lead,
    knopf: t(homepage?.mandatCtaLabel, basis.knopf),
    vorgehenTitel: t(homepage?.mandatProcessTitle, basis.vorgehenTitel),
    schritte: cmsSchritte.length > 0 ? cmsSchritte : basis.schritte,
  };
  return (
    <SubpageMandatAdvisory
      seite="mandat"
      titel={inhalt.titel}
      lead={inhalt.lead}
      knopf={inhalt.knopf}
      vorgehenTitel={inhalt.vorgehenTitel}
      schritte={inhalt.schritte}
      isMobile={isMobile}
      aktiv={aktiv}
      sprache={sprache}
      homepage={homepage}
      onContactClick={onContactClick}
      onAndereSeite={onAndereSeite}
    />
  );
}
