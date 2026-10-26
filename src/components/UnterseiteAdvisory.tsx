"use client";

import { SubpageMandatAdvisory } from "./SubpageMandatAdvisory";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

/* UNTERSEITE — ADVISORY (nur Inhalt). Inhalte aus Sanity (homepage →
   «3a. Unterseiten» → advisory*), Rückfall = Wortlaut des Redesigns. */

interface Inhalt {
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  schritte: readonly { titel: string; zeile: string }[];
}

const INHALT: Readonly<Record<"DE" | "EN", Inhalt>> = {
  DE: {
    titel: ["Sie entscheiden.", "Wir liefern die Grundlage."],
    lead: [
      "Advisory ist die Alternative zum Mandat. Sie erteilen keine Verwaltungsvollmacht, die finale Entscheidung über jede Anlage liegt bei Ihnen. Tellian Capital arbeitet als unabhängiger Partner: Wir analysieren, wir empfehlen, wir helfen beim Feinschliff Ihres Portfolios. Ausgeführt wird nichts ohne Ihre Zustimmung.",
    ],
    knopf: "Gespräch vereinbaren",
    schritte: [
      { titel: "Analyse", zeile: "Wir analysieren Ihr Portfolio im Kontext Ihrer Ziele, Ihres Risikoprofils und des aktuellen Marktumfelds." },
      { titel: "Empfehlung", zeile: "Auf dieser Grundlage entwickeln wir konkrete Anlageempfehlungen und erläutern Ihnen Chancen, Risiken und Auswirkungen auf Ihr Portfolio." },
      { titel: "Ihre Entscheidung", zeile: "Sie entscheiden über jede einzelne Anlage. Umgesetzt wird ausschliesslich, was Sie freigeben." },
    ],
  },
  EN: {
    titel: ["You decide.", "We provide the foundation."],
    lead: [
      "Advisory is the alternative to a discretionary mandate. You retain full control, with the final decision on every investment remaining with you. Tellian Capital acts as your independent investment partner: we analyse, advise and help you refine your portfolio. Nothing is implemented without your approval.",
    ],
    knopf: "Arrange a meeting",
    schritte: [
      { titel: "Analysis", zeile: "We assess your portfolio in the context of your objectives, risk profile and the current market environment." },
      { titel: "Recommendation", zeile: "Based on this analysis, we provide specific investment recommendations and explain the opportunities, risks and potential impact on your portfolio." },
      { titel: "Your Decision", zeile: "You remain in control of every investment decision. We only proceed with transactions that you have explicitly approved." },
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

export function UnterseiteAdvisory({ isMobile = false, aktiv = true, sprache = "DE", homepage, onContactClick, onAndereSeite }: Props) {
  const { t } = useLanguage();
  const basis = INHALT[sprache];
  const cmsLead: string[] = (homepage?.advisoryLead ?? [])
    .map((a: LocaleValue) => t(a, ""))
    .filter((a: string) => a.trim().length > 0);
  const cmsSchritte = (homepage?.advisorySteps ?? [])
    .map((st: { title?: LocaleValue; text?: LocaleValue }) => ({ titel: t(st?.title, ""), zeile: t(st?.text, "") }))
    .filter((st: { titel: string }) => st.titel.trim().length > 0);
  const inhalt: Inhalt = {
    titel: [t(homepage?.advisoryHeadingLine1, basis.titel[0]), t(homepage?.advisoryHeadingLine2, basis.titel[1])],
    lead: cmsLead.length > 0 ? cmsLead : basis.lead,
    knopf: t(homepage?.advisoryCtaLabel, basis.knopf),
    schritte: cmsSchritte.length > 0 ? cmsSchritte : basis.schritte,
  };
  /* Im Redesign hat Advisory keinen Vorgehens-Titel; nur wenn das CMS einen liefert. */
  const vorgehenTitel = t(homepage?.advisoryProcessTitle, "") || undefined;
  return (
    <SubpageMandatAdvisory
      seite="advisory"
      titel={inhalt.titel}
      lead={inhalt.lead}
      knopf={inhalt.knopf}
      vorgehenTitel={vorgehenTitel}
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
