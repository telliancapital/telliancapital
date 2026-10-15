"use client";

import { HeroEditorial } from "@/components/HeroEditorial";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import type { Sprache } from "@/sections";
import { SOLUTIONS_INHALT } from "./inhalt";

/* ═══════════════════════════════════════════════════════════
   SOLUTIONS S1 — EINSTIEG (Editorial A2, hell)

   Dünner Träger um die geteilte HeroEditorial-Komponente: Eyebrow
   «TELLIAN CAPITAL SOLUTIONS», Titel einzeilig ohne Kursivzeile,
   Fliesstext einspaltig; rechts das Zürich-Panorama.

   INHALTE aus Sanity (solutionsHomepage): heroEyebrow, der Titel aus
   heroTaglineLine1–3 (im Studio «Headline», mit Leerzeichen zu EINER
   Überschrift verbunden; die Zwei-Zeilen-Regel bricht sie um),
   heroLeadSentence (Fliesstext). Rückfall für den Titel: das alte Feld
   heroClosingLine, dann der Wortlaut der Vorlage.
   ═══════════════════════════════════════════════════════════ */

const HERO_FALLBACK = "/img/hero-solutions/hero-solutions-1058.jpg";
const HERO_FALLBACK_SRCSET = [414, 782, 1058]
  .map((w) => `/img/hero-solutions/hero-solutions-${w}.jpg ${w}w`)
  .join(", ");

interface Props {
  isVertical?: boolean;
  bereit?: boolean;
  sprache: Sprache;
  homepage?: any;
  marke?: { nr: string; name: string };
}

export function SolutionsEinstieg({ isVertical = false, bereit = true, sprache, homepage, marke }: Props) {
  const { t, lang } = useLanguage();
  const inhalt = SOLUTIONS_INHALT[sprache].einstieg;

  const eyebrow = t(homepage?.heroEyebrow, inhalt.eyebrow);
  /* Die Zeilen STRENG in der aktiven Sprache lesen — ohne den
     Sprach-Rückfall von t(): eine nur auf FR ausgefüllte dritte Zeile
     hing sonst als «produits.» hinter der deutschen Überschrift. */
  const streng = (v: LocaleValue): string =>
    typeof v === "string" ? v.trim() : ((v && v[lang]) ?? "").trim();
  const titelZeilen = [homepage?.heroTaglineLine1, homepage?.heroTaglineLine2, homepage?.heroTaglineLine3]
    .map(streng)
    .filter(Boolean)
    .join(" ");
  const titel = titelZeilen || t(homepage?.heroClosingLine, inhalt.titel);
  const text = t(homepage?.heroLeadSentence, inhalt.text);

  return (
    <HeroEditorial
      eyebrow={eyebrow}
      titel={titel}
      absaetze={[text]}
      haelften
      hairline={false}
      imageSrc={HERO_FALLBACK}
      imageSrcSet={HERO_FALLBACK_SRCSET}
      /* Zuschnitt 46/25 = 1.84. */
      bildVerhaeltnis={1.84}
      imageAlt="Zürich an der Limmat"
      /* Fokus Skyline/Kirchtürme. */
      fokus="center 52%"
      lang={sprache === "EN" ? "en" : sprache === "FR" ? "fr" : "de"}
      isVertical={isVertical}
      bereit={bereit}
      domId="solutions-einstieg"
      /* Helles Tagespanorama — eine Stufe kräftiger als der Standard. */
      scrimOben={0.72}
      marke={marke}
    />
  );
}
