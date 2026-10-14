import type { LocaleValue } from "@/i18n/types";
import { mainSiteUrl } from "@/sanity/env";

/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL SOLUTIONS — Stationen (Redesign, /solutions der
   Vorlage): vier Stationen im Hell/Dunkel-Rhythmus der Hauptseite.
   Struktur (Reihenfolge, Ziele, IDs) steht im Code; die Namen der
   Leiste kommen aus Sanity (solutionsHomepage.navItems[]), Rückfall
   je Sprache.
   ═══════════════════════════════════════════════════════════ */

export const SECTION_WIDTH = "94vw";
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

export const SECTIONS: readonly SectionDef[] = [
  { key: "einstieg", anker: "einstieg", label: "Einstieg", labelKurz: "Einstieg", dunkel: false, domId: "solutions-einstieg", progress: 0, threshold: 0 },
  { key: "was-wir-tun", anker: "was-wir-tun", label: "Was wir tun", labelKurz: "Was wir tun", dunkel: true, domId: "solutions-was-wir-tun", progress: 1 / 3, threshold: 1 / 6 },
  { key: "team", anker: "team", label: "Team", labelKurz: "Team", dunkel: false, domId: "solutions-team", progress: 2 / 3, threshold: 0.5 },
  { key: "kontakt", anker: "kontakt", label: "Kontakt", labelKurz: "Kontakt", dunkel: true, domId: "solutions-kontakt", progress: 1, threshold: 5 / 6 },
];

export const SECTION_COUNT = SECTIONS.length;

export interface LeisteName {
  label: string;
  labelKurz: string;
}

export type Sprache = "DE" | "EN" | "FR";

/* Microcopy der Stationsleiste (Vorlage, solutions/inhalt.ts). */
export const LEISTE: Readonly<Record<Sprache, readonly LeisteName[]>> = {
  DE: SECTIONS.map((s) => ({ label: s.label, labelKurz: s.labelKurz })),
  EN: ["Introduction", "What we do", "Team", "Contact"].map((l) => ({ label: l, labelKurz: l })),
  FR: ["Introduction", "Ce que nous faisons", "Team", "Contact"].map((l) => ({ label: l, labelKurz: l })),
};

/** CMS-Eintrag aus solutionsHomepage.navItems[] (Sanity). */
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
    const cmsLabel = t(cmsItems?.[i]?.label, "").trim();
    return {
      ...s,
      label: cmsLabel || fallback.label,
      labelKurz: cmsLabel || fallback.labelKurz,
    };
  });
}

/** Laufende Nummer für die Anzeige — "01" … "04". */
export function sectionOrdinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** Index zu einem Schlüssel oder Anker, -1 wenn unbekannt. */
export function indexOfSection(key: string | null | undefined): number {
  if (!key) return -1;
  return SECTIONS.findIndex((s) => s.key === key || s.anker === key);
}

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
  extern?: boolean;
  legal?: boolean;
}

/* Nebenverweise des mobilen Menüs und der Kontakt-Fusszeile. Der
   Verweis «Solutions» der Hauptseite zeigt auf diese Seite selbst und
   entfällt; stattdessen führt «Tellian Capital» zurück zur Hauptseite. */
export const NEBEN_VERWEISE: readonly NebenVerweis[] = [
  { text: "Tellian Capital", href: mainSiteUrl, extern: true },
  {
    text: "LinkedIn",
    href: "https://www.linkedin.com/company/dr-blumer-partner-verm%C3%B6gensverwaltung-z%C3%BCrich-ag/",
    extern: true,
  },
  { text: "Datenschutz", href: "/datenschutz", legal: true },
  { text: "Kundeninformation", href: "/kundeninformation", legal: true },
];
