"use client";

import { HeroEditorial } from "./HeroEditorial";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import type { Sprache } from "@/sections";

/* ═══════════════════════════════════════════════════════════
   STATION 1 — EINSTIEG (Editorial A2)

   Dünner Träger um die geteilte HeroEditorial-Komponente.
   INHALTE: Titelzeilen, Lead und Bild kommen aus Sanity
   (startHeadingLine1/2, startParagraphs[], startImage). Der Wortlaut
   aus dem Redesign-Briefing steht hier nur als Rückfall, solange das
   CMS-Feld leer ist.
   ═══════════════════════════════════════════════════════════ */

interface HeroInhalt {
  titel: readonly [string, string];
  lead: readonly string[];
}

const INHALT: Readonly<Record<Sprache, HeroInhalt>> = {
  DE: {
    titel: ["Weiterdenken", "mit Erfahrung"],
    lead: [
      "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Wir sind seit 1996 in Zürich verwurzelt, unabhängig und FINMA-lizenziert.",
      "Wir verbinden über 30 Jahre fundierte Markterfahrung mit einer zukunftsorientierten Ausrichtung. Wir stehen für eine moderne und transparente Vermögensverwaltung, die Tradition und neue Impulse nahtlos miteinander vereint.",
    ],
  },
  EN: {
    titel: ["Looking Ahead.", "Built on Experience."],
    lead: [
      "Tellian Capital AG provides independent wealth management for private clients, entrepreneurial families and foundations. With deep roots in Zurich since 1996, we are an independent, FINMA-licensed asset manager.",
      "With over 30 years of investment experience, we support our clients in preserving, developing and successfully positioning their wealth for the long term. Our approach combines proven investment principles with a forward-looking perspective on markets and opportunities. Personal service, transparency and sound decision-making are at the heart of everything we do.",
    ],
  },
};

/* Bündel-Rückfall fürs Hero-Motiv (Opernhaus Zürich) — greift nur,
   wenn im CMS kein Bild hinterlegt ist. */
const HERO_FALLBACK = "/img/hero-tellian/hero-tellian-1536.jpg";
const HERO_FALLBACK_SRCSET = [432, 768, 1080, 1536]
  .map((w) => `/img/hero-tellian/hero-tellian-${w}.jpg ${w}w`)
  .join(", ");

interface Props {
  isVertical?: boolean;
  /** Schmal: erst wenn der Ladebildschirm weg ist, läuft der Eintritt. */
  bereit?: boolean;
  sprache?: Sprache;
  /** Sanity-Dokument (homepage). */
  homepage?: any;
  /** Kapitelmarke des schmalen Zweigs. */
  marke?: { nr: string; name: string };
}

export function Station1Einstieg({
  isVertical = false,
  bereit = true,
  sprache = "DE",
  homepage,
  marke,
}: Props) {
  const { t } = useLanguage();
  const inhalt = INHALT[sprache];

  const zeile1 = t(homepage?.startHeadingLine1, inhalt.titel[0]);
  const zeile2 = t(homepage?.startHeadingLine2, inhalt.titel[1]);
  /* Lead aus dem CMS (startParagraphs, ein Eintrag je Absatz);
     leer → Wortlaut aus dem Redesign-Briefing. */
  const cmsLead: string[] = ((homepage?.startParagraphs ?? []) as LocaleValue[])
    .map((p) => t(p, ""))
    .filter((p) => p.length > 0);
  const lead: readonly string[] = cmsLead.length > 0 ? cmsLead : inhalt.lead;

  const cmsBild: string | undefined = homepage?.startImageAsset?.url || homepage?.startImageUrl;
  const imageSrc = cmsBild || HERO_FALLBACK;
  const imageSrcSet = cmsBild ? undefined : HERO_FALLBACK_SRCSET;
  const imageAlt = t(homepage?.startImageAlt, "Opernhaus Zürich zur blauen Stunde");

  const titel = (
    <>
      <span className="tellian-hero-zeile1">{zeile1}</span>
      <br />
      <em
        style={{
          fontStyle: "italic",
          fontWeight: "inherit",
          whiteSpace: sprache === "EN" ? undefined : "nowrap",
        }}
        className="tellian-hero-zeile2"
      >
        {zeile2}
      </em>
      <style>{`
        .tellian-hero-zeile1 { white-space: nowrap; }
        @media (max-width: 359px) {
          .tellian-hero-zeile1, .tellian-hero-zeile2 {
            white-space: normal !important;
          }
        }
      `}</style>
    </>
  );

  return (
    <HeroEditorial
      titel={titel}
      absaetze={lead}
      haelften
      hairline={false}
      imageSrc={imageSrc}
      imageSrcSet={imageSrcSet}
      bildVerhaeltnis={1.5}
      imageAlt={imageAlt}
      fokus="center 42%"
      lang={sprache === "EN" ? "en" : "de"}
      isVertical={isVertical}
      bereit={bereit}
      domId="section-hero"
      marke={marke}
    />
  );
}
