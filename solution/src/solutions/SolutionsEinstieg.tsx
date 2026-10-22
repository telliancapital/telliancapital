"use client";

import { HeroEditorial } from "@/components/HeroEditorial";
import { useLanguage } from "@/i18n/LanguageContext";
import { urlFor } from "@/sanity/lib/image";
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

/* Stufen fürs CMS-Bild (heroImage): das Panel zeigt das Bild auf
   Panelhöhe × 1.84, auf dichten Bildschirmen also bis rund 3300px. */
const CMS_STUFEN = [828, 1080, 1600, 2160, 2560, 3200, 3840] as const;

/* Zuschnitt der Vorlage (scripts/optimize-images.mjs, hero-solutions):
   links oben angeschlagen, 98.9 % der Breite im Verhältnis 1.84 —
   gilt, solange im Studio kein eigener Crop gesetzt ist. */
const VORLAGE_BREITE = 0.989;
const VORLAGE_VERHAELTNIS = 1.84;

function cmsHeroBild(image: any): { src: string; srcSet: string; fokus?: string } | null {
  if (!image?.asset?._id && !image?.asset?.url) return null;
  const masse = String(image.asset._id ?? image.asset.url).match(/-(\d+)x(\d+)(?:-|\.)/);
  const rect =
    masse && !image.crop
      ? (() => {
          const w = Math.round(Number(masse[1]) * VORLAGE_BREITE);
          return { w, h: Math.min(Number(masse[2]), Math.round(w / VORLAGE_VERHAELTNIS)) };
        })()
      : null;
  const stufe = (w: number) => {
    let b = urlFor(image).width(w).fit("max").auto("format").quality(75);
    if (rect) b = b.rect(0, 0, rect.w, rect.h);
    return b.url();
  };
  const hs = image.hotspot;
  return {
    src: stufe(1600),
    srcSet: CMS_STUFEN.map((w) => `${stufe(w)} ${w}w`).join(", "),
    fokus: hs ? `${Math.round(hs.x * 100)}% ${Math.round(hs.y * 100)}%` : undefined,
  };
}

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
  /* Bild aus Sanity (heroImage, Studio: «Right-side hero image»). */
  const cms = cmsHeroBild(homepage?.heroImage);

  return (
    <HeroEditorial
      eyebrow={eyebrow}
      titel={titel}
      absaetze={[text]}
      haelften
      hairline={false}
      imageSrc={cms?.src}
      imageSrcSet={cms?.srcSet}
      /* Zuschnitt 46/25 = 1.84. */
      bildVerhaeltnis={1.84}
      imageAlt={t(homepage?.heroImageAlt, "Zürich an der Limmat")}
      /* Fokus Skyline/Kirchtürme. */
      fokus={cms?.fokus ?? "center 52%"}
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
