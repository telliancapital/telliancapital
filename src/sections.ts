/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL — SEKTIONS-REGISTRY (Redesign)
   Single source of truth für Reihenfolge, Anker, DOM-IDs, Breite und
   die Scroll-Ziele der sechs Stationen. Kopfzeile, Stationsleiste und
   mobiles Menü lesen alle aus derselben Liste.

   Die BESCHRIFTUNGEN kommen aus Sanity (homepage.navItems[] — dieselben
   Felder wie bisher in der Sidebar); die Werte hier sind der Rückfall.
   ═══════════════════════════════════════════════════════════ */

import type { LocaleValue } from "@/i18n/types";
import { solutionsSiteUrl } from "@/sanity/env";

/** Breite der Stationen: bei 94vw bleiben 6vw der Folgestation sichtbar. */
export const SECTION_WIDTH = "94vw";
/** Die letzte Station (Kontakt) schliesst den Track in voller Breite ab. */
export const SECTION_WIDTH_LAST = "100vw";

export interface SectionDef {
  key: string;
  anker: string;
  label: string;
  labelKurz: string;
  /** true, wenn die Station GANZ dunkel ist (Bandfarbe). */
  dunkel: boolean;
  /** id des Abschnitts (vertikal: scrollIntoView). */
  domId: string;
  /** Scroll-Ziel (0–1) auf dem horizontalen Desktop-Track. */
  progress: number;
  /** Ab diesem Fortschritt gilt die Station als aktiv. */
  threshold: number;
}

/* Track: 5 × 94vw + 100vw = 570vw, Scrollweg 470vw → Station i liegt
   bei 94·i / 470 = i / 5. Schwellen in der Mitte zwischen den Zielen. */
export const SECTIONS: readonly SectionDef[] = [
  { key: "hero", anker: "einstieg", label: "Einstieg", labelKurz: "Einstieg", dunkel: false, domId: "section-hero", progress: 0.0, threshold: 0.0 },
  { key: "vermoegen", anker: "vermoegensverwaltung", label: "Vermögensverwaltung", labelKurz: "Vermögen", dunkel: true, domId: "section-vermoegensverwaltung", progress: 0.2, threshold: 0.1 },
  { key: "strategien", anker: "vorteile", label: "Ihre Vorteile", labelKurz: "Vorteile", dunkel: false, domId: "section-anlagestrategien", progress: 0.4, threshold: 0.3 },
  { key: "philosophie", anker: "geschaeftsbeziehungen", label: "Geschäftsbeziehungen", labelKurz: "Beziehungen", dunkel: true, domId: "section-anlagephilosophie", progress: 0.6, threshold: 0.5 },
  { key: "ueber-uns", anker: "team", label: "Team", labelKurz: "Team", dunkel: false, domId: "section-ueber-uns", progress: 0.8, threshold: 0.7 },
  { key: "kontakt", anker: "kontakt", label: "Kontakt", labelKurz: "Kontakt", dunkel: true, domId: "section-kontakt", progress: 1.0, threshold: 0.9 },
];

export const SECTION_COUNT = SECTIONS.length;

export interface LeisteName {
  label: string;
  labelKurz: string;
}

export const LEISTE: Readonly<Record<"DE" | "EN", readonly LeisteName[]>> = {
  DE: SECTIONS.map((s) => ({ label: s.label, labelKurz: s.labelKurz })),
  EN: [
    { label: "Introduction", labelKurz: "Introduction" },
    { label: "Wealth Management", labelKurz: "Wealth" },
    { label: "Your Advantages", labelKurz: "Advantages" },
    { label: "Banking Relationships", labelKurz: "Relationships" },
    { label: "Team", labelKurz: "Team" },
    { label: "Contact", labelKurz: "Contact" },
  ],
};

export type Sprache = "DE" | "EN";

/** CMS-Eintrag aus homepage.navItems[] (Sanity). */
export interface CmsNavItem {
  label?: LocaleValue;
  sub?: LocaleValue;
}

/**
 * Sektionsliste mit aufgelösten Namen — für Leiste, Menü und
 * Kapitelmarken. Reihenfolge: CMS-Label (Sanity) → Rückfall je Sprache.
 */
export function leisteSektionen(
  sprache: Sprache,
  cmsItems: readonly CmsNavItem[] | undefined,
  t: (value: LocaleValue, fallback?: string) => string,
): readonly SectionDef[] {
  const namen = LEISTE[sprache];
  return SECTIONS.map((s, i) => {
    const fallback = namen[i] ?? { label: s.label, labelKurz: s.labelKurz };
    const cmsLabel = t(cmsItems?.[i]?.label, "");
    return {
      ...s,
      label: cmsLabel || fallback.label,
      labelKurz: cmsLabel || fallback.labelKurz,
    };
  });
}

/** Laufende Nummer für die Anzeige — "01" … "06". */
export function sectionOrdinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** Index zu einem Schlüssel oder Anker, -1 wenn unbekannt. */
export function indexOfSection(key: string | null | undefined): number {
  if (!key) return -1;
  return SECTIONS.findIndex((s) => s.key === key || s.anker === key);
}

/** Aktive Sektion aus dem Scroll-Fortschritt (Desktop). */
export function activeIndexFromProgress(progress: number): number {
  let active = 0;
  for (let i = 1; i < SECTIONS.length; i++) {
    if (progress >= SECTIONS[i].threshold) active = i;
  }
  return active;
}

export interface NebenVerweis {
  text: string;
  href: string;
  legal?: boolean;
  extern?: boolean;
}

/** Verweise AUSSERHALB der Stationsleiste: Fussband und mobiles Menü. */
export const NEBEN_VERWEISE: readonly NebenVerweis[] = [
  { text: "Solutions", href: solutionsSiteUrl, extern: true },
  {
    text: "LinkedIn",
    href: "https://www.linkedin.com/company/dr-blumer-partner-verm%C3%B6gensverwaltung-z%C3%BCrich-ag/",
    extern: true,
  },
  { text: "FAQ", href: "/faq" },
  { text: "Datenschutz", href: "/datenschutz", legal: true },
  { text: "Kundeninformation", href: "/kundeninformation", legal: true },
];
