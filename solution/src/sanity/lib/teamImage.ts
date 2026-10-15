import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "./image";

/* ═══════════════════════════════════════════════════════════
   TEAM-PORTRÄTS ÜBER DAS SANITY-BILD-CDN

   Die Vorlage (DesignTellian, scripts/optimize-images.mjs) liefert
   je Person zwei Sätze: eine KACHEL im Verhältnis 0.9 (Augenlinie
   auf 22 % der Ausschnitthöhe) in den Stufen 340·620·960·1000 und
   das UNGESCHNITTENE Porträt (480·760·1020) für die Detailansicht.

   Hier übernimmt das Sanity-CDN diese Arbeit aus dem Original
   (4672×7008): Ausschnitt, Stufen und Format (auto=format → AVIF/
   WebP). Der Browser lädt damit die passende Stufe statt der
   rohen Datei — die war bisher die Ursache für weiche, flaue Kacheln,
   weil er 7008 Bildpunkte selbst auf 257 herunterrechnen musste.

   AUSSCHNITT: Ist im Studio ein Hotspot gesetzt, gilt die Regel der
   Vorlage — der Hotspot (die Augen) liegt auf 22 % der Kachelhöhe.
   Ohne Hotspot greift die Augenlinie, die die Vorlage für die
   bekannten Porträts abgenommen hat (AUGENLINIEN, nach Nachnamen);
   für unbekannte Personen bleibt der Ausschnitt oben angeschlagen,
   der Kopf wird nie beschnitten.

   FARBE: Die Vorlage zeigt retuschierte Fassungen derselben Aufnahmen
   (gemessen ~10 % heller, leicht gesättigter); im CMS liegen die
   unbearbeiteten Originale. TEAM_BILD_FILTER gleicht das mild an.
   Sobald die retuschierten Fotos im CMS liegen
   (scripts/upload-team-photos.mjs), den Filter auf "none" setzen.
   ═══════════════════════════════════════════════════════════ */

/** CSS-Filter für alle Teamporträts (Kachel, Detail, Vollansicht). */
export const TEAM_BILD_FILTER = "brightness(1.08) saturate(1.08)";

/* Augenlinie als Anteil der Quellhöhe, aus den Kachelzuschnitten der
   Vorlage (scripts/optimize-images.mjs: oben + 0.22 × 0.738; Pons:
   3:4-Quelle, oben + 0.22 × 0.830). Schlüssel = Nachname, klein, ohne
   Diakritika. */
const AUGENLINIEN: Readonly<Record<string, number>> = {
  bill: 0.309,
  ludescher: 0.355,
  schneider: 0.215,
  honegger: 0.171,
  truempler: 0.21,
  trumpler: 0.21,
  rukavina: 0.215,
  pons: 0.314,
};

const augenlinieAusName = (name: string | undefined): number | null => {
  if (!name) return null;
  const woerter = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z]+/);
  for (const w of woerter) if (w in AUGENLINIEN) return AUGENLINIEN[w];
  return null;
};

/** Kachel-Verhältnis der Übersicht (Breite / Höhe), wie in der Vorlage. */
export const TEAM_TILE_RATIO = 0.9;
/** Augenlinie der Vorlage: 22 % der Ausschnitthöhe. */
const AUGENLINIE = 0.22;

const TILE_WIDTHS = [340, 620, 960, 1000] as const;
const FULL_WIDTHS = [480, 760, 1020] as const;
const QUALITY = 82;

export interface SanityTeamImage {
  asset?: { _ref?: string; url?: string } | null;
  hotspot?: { x: number; y: number; width?: number; height?: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
}

export interface TeamBild {
  /** Rückfall für Browser ohne srcset. */
  src: string;
  srcSet: string;
}

/** Masse aus dem Asset-Verweis (`image-<id>-<w>x<h>-<ext>`). */
function masseAusRef(ref: string | undefined): { w: number; h: number } | null {
  const m = ref?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
}

/**
 * Pixelrechteck der Kachel im Original: volle Breite, Höhe nach dem
 * Kachelverhältnis, Oberkante so, dass der Hotspot auf der Augenlinie
 * liegt (ohne Hotspot: oben).
 */
function kachelRechteck(
  image: SanityTeamImage,
  name?: string,
): { left: number; top: number; width: number; height: number } | null {
  const masse = masseAusRef(image.asset?._ref);
  if (!masse) return null;
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const left = Math.round(masse.w * crop.left);
  const right = Math.round(masse.w * (1 - crop.right));
  const oben = Math.round(masse.h * crop.top);
  const unten = Math.round(masse.h * (1 - crop.bottom));
  const width = right - left;
  const height = Math.min(unten - oben, Math.round(width / TEAM_TILE_RATIO));
  if (width <= 0 || height <= 0) return null;
  let top = oben;
  const augenAnteil = image.hotspot?.y ?? augenlinieAusName(name);
  if (augenAnteil !== null && augenAnteil !== undefined) {
    const augen = masse.h * augenAnteil;
    top = Math.round(augen - AUGENLINIE * height);
  }
  top = Math.max(oben, Math.min(top, unten - height));
  return { left, top, width, height };
}

const hatAsset = (image: SanityTeamImage | null | undefined): image is SanityTeamImage =>
  !!image?.asset && (!!image.asset._ref || !!image.asset.url);

/** Kachel der Übersicht (Verhältnis 0.9) in den Stufen der Vorlage. */
export function teamKachel(image: SanityTeamImage | null | undefined, name?: string): TeamBild | null {
  if (!hatAsset(image)) return null;
  const rect = kachelRechteck(image, name);
  const stufe = (w: number) => {
    const h = Math.round(w / TEAM_TILE_RATIO);
    let b = urlFor(image as SanityImageSource).width(w).height(h).fit("crop").auto("format").quality(QUALITY);
    b = rect ? b.rect(rect.left, rect.top, rect.width, rect.height) : b.crop("top");
    return b.url();
  };
  const srcSet = TILE_WIDTHS.map((w) => `${stufe(w)} ${w}w`).join(", ");
  return { src: stufe(TILE_WIDTHS[1]), srcSet };
}

/** Ungeschnittenes Porträt für die Detailansicht und die Vollansicht. */
export function teamPortraet(image: SanityTeamImage | null | undefined): TeamBild | null {
  if (!hatAsset(image)) return null;
  const stufe = (w: number) =>
    urlFor(image as SanityImageSource).width(w).fit("max").auto("format").quality(QUALITY).url();
  const srcSet = FULL_WIDTHS.map((w) => `${stufe(w)} ${w}w`).join(", ");
  return { src: stufe(FULL_WIDTHS[1]), srcSet };
}
