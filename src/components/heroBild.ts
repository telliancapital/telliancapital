import { responsiveImage } from "@/sanity/lib/image";

/* Hero-Motiv der Station 01 — geteilt von Station1Einstieg (Client) und
   der Server-Seite (app/_site/home.tsx), die das Bild im <head> vorlädt.
   Ohne Vorladen entdeckte der Browser es erst nach der Hydrierung, weil
   die Stationen nur im Client gerendert werden — auf Mobil war es das
   LCP-Element und kam entsprechend spät. Beide Seiten müssen dieselbe
   srcSet/sizes-Kombination nutzen, sonst lädt der Browser zwei Dateien. */

/* Bündel-Rückfall fürs Hero-Motiv (Opernhaus Zürich) — greift nur,
   wenn im CMS kein Bild hinterlegt ist. */
const HERO_FALLBACK = "/img/hero-tellian/hero-tellian-1536.jpg";
const HERO_FALLBACK_SRCSET = [432, 768, 1080, 1536]
  .map((w) => `/img/hero-tellian/hero-tellian-${w}.jpg ${w}w`)
  .join(", ");

/** Seitenverhältnis des Motivs (Breite/Höhe), steuert sizes in HeroEditorial. */
export const HERO_BILD_VERHAELTNIS = 1.5;

/* Muss den sizes-Werten in HeroEditorial entsprechen (haelften = true):
   schmal `max(100vw, verhältnis·55vh)`, breit `max(50vw, verhältnis·100vh)`;
   «breit» beginnt wie useBreakpoint bei 1024 px. */
export const HERO_SIZES_SCHMAL = `max(100vw, ${Math.round(HERO_BILD_VERHAELTNIS * 55)}vh)`;
export const HERO_SIZES_BREIT = `max(50vw, ${Math.round(HERO_BILD_VERHAELTNIS * 100)}vh)`;
export const HERO_SIZES_MEDIA = `(min-width: 1024px) ${HERO_SIZES_BREIT}, ${HERO_SIZES_SCHMAL}`;

/* Breitenstufen des Hero-Motivs — dieselben wie in der Vorlage
   (public/img/hero-tellian: 432 … 4320). Die allgemeine Stufenliste
   endet bei 1920 px und q=65; auf einem Retina-Desktop braucht das
   halbseitige, höhenfüllende Motiv aber rund 2700–3000 Gerätepunkte
   Breite — die 1920er-Datei wurde hochskaliert und wirkte weich. */
const HERO_STUFEN = [432, 768, 1080, 1536, 2160, 2496, 3111, 3456, 4320] as const;
const HERO_QUALITAET = 80;

export function heroBild(homepage: any): { src: string; srcSet: string | undefined } {
  const cmsBild: string | undefined = homepage?.startImageAsset?.url || homepage?.startImageUrl;
  if (!cmsBild) return { src: HERO_FALLBACK, srcSet: HERO_FALLBACK_SRCSET };
  const { src, srcSet } = responsiveImage(cmsBild, HERO_STUFEN, HERO_QUALITAET);
  return { src, srcSet };
}
