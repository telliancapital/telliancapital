"use client";

import { useEffect, useRef, useState } from "react";

import { SECTIONS, type SectionDef } from "@/sections";

/* ═══════════════════════════════════════════════════════════
   TON DER BEIDEN BÄNDER

   Kopfzeile und Stationsleiste haben keine eigene Fläche. Ihre
   Schriftfarbe muss sich deshalb nach dem richten, was gerade unter
   ihnen liegt.

   Der Bandinhalt wird mehrfach gezeichnet: einmal in dunkler Schrift,
   einmal in heller, einmal für Bildflächen. Jede Schicht wird auf die
   Bereiche maskiert, in denen ihr Grund liegt. Über hellen Stationen
   steht also die dunkle Fassung, über dunklen die helle — auch mitten
   im Wort. Der Wechsel ist von selbst stetig, weil die Maske mit dem
   Track wandert.

   Gemessen wird an data-Attributen im DOM:
     data-tellian-station="n"   Panel der Station n (Ton aus SECTIONS)
     data-tellian-dunkelzone    dunkle Teilfläche innerhalb einer Station
     data-tellian-bildzone      Foto — helle Schrift plus Scrim/Schatten
   ═══════════════════════════════════════════════════════════ */

export interface Zone {
  /** Linke und rechte Kante im Fenster, in px. */
  von: number;
  bis: number;
  dunkel: boolean;
  /** Der Bereich liegt über einem Foto. */
  bild?: boolean;
}

/** Sichtbare Schicht eines Bandes. */
export type BandSchicht = "hell" | "dunkel" | "bild";

/** Weiche Kante der Maske, damit die Grenze nicht als Treppe liest. */
const FEDER = 1.5;

/** Welches Band misst: Kopfzeile (oben) oder Stationsleiste (unten). */
export type Band = "oben" | "unten";

/** Senkrechter Streifen des Bandes — Teilflächen zählen nur, wenn sie
    ihn überdecken (die Hero-Fotos reichen z. B. nicht bis unten). */
function bandStreifen(band: Band): [number, number] {
  const h = window.innerHeight;
  const css = getComputedStyle(document.documentElement);
  const lesen = (name: string, fallback: number) => {
    const v = parseFloat(css.getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };
  return band === "oben"
    ? [0, lesen("--tellian-kopf-height", 64)]
    : [h - lesen("--tellian-station-height", 56), h];
}

function sichtbareZonen(
  selector: string,
  breite: number,
  streifen: [number, number],
  zone: Omit<Zone, "von" | "bis">,
): Zone[] {
  const aus: Zone[] = [];
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const r = el.getBoundingClientRect();
    /* Nur Flächen, die den Streifen des Bandes wirklich überdecken. */
    if (r.bottom <= streifen[0] + 0.5 || r.top >= streifen[1] - 0.5) return;
    const von = Math.max(0, r.left);
    const bis = Math.min(breite, r.right);
    if (bis - von > 0.5) aus.push({ ...zone, von, bis });
  });
  aus.sort((a, b) => a.von - b.von);
  return aus;
}

/** Schneidet `ueberlagerungen` aus `grund` heraus und hängt sie an. */
function ueberlagern(grund: Zone[], ueberlagerungen: Zone[]): Zone[] {
  if (!ueberlagerungen.length) return grund;
  const geschnitten: Zone[] = [];
  for (const z of grund) {
    let teile: Zone[] = [z];
    for (const b of ueberlagerungen) {
      teile = teile.flatMap((t) => {
        if (b.bis <= t.von || b.von >= t.bis) return [t];
        const raus: Zone[] = [];
        if (b.von > t.von) raus.push({ ...t, bis: b.von });
        if (b.bis < t.bis) raus.push({ ...t, von: b.bis });
        return raus;
      });
    }
    geschnitten.push(...teile.filter((t) => t.bis - t.von > 0.5));
  }
  geschnitten.push(...ueberlagerungen);
  geschnitten.sort((a, b) => a.von - b.von);
  return geschnitten;
}

/**
 * Sichtbare Stationsbereiche im Fenster, links nach rechts.
 * Im schmalen Zweig eine einzige Zone — dort gibt es keinen Track.
 */
export function useBandZonen(
  aktiv: boolean,
  activeIndex: number,
  band: Band = "oben",
  sektionen: readonly SectionDef[] = SECTIONS,
): Zone[] {
  const [zonen, setZonen] = useState<Zone[]>(() => [
    { von: 0, bis: 10000, dunkel: sektionen[0]?.dunkel ?? false },
  ]);
  const letzte = useRef("");

  useEffect(() => {
    if (!aktiv) {
      const z = [{ von: 0, bis: 10000, dunkel: sektionen[activeIndex]?.dunkel ?? false }];
      letzte.current = JSON.stringify(z);
      setZonen(z);
      return;
    }

    let laeuft = true;
    /* Messen kostet Layout-Lesungen über alle Panels. Im Stillstand
       und ohne Fensteränderung bleibt das Ergebnis gleich — dann wird
       der Frame übersprungen. (14.10., Scroll-Performance) */
    let letzteLage = "";
    let frame = 0;

    const messen = () => {
      const track = document.querySelector<HTMLElement>("[data-tellian-track]");
      const lage = `${track ? track.scrollLeft : -1}:${window.innerWidth}:${window.innerHeight}`;
      /* Alle 12 Frames trotzdem messen: Teilflächen können sich auch
         ohne Scroll bewegen (Eintrittsanimationen, Übergänge). */
      frame = (frame + 1) % 12;
      if (track && lage === letzteLage && frame !== 0) return;
      letzteLage = lage;

      const breite = window.innerWidth;
      const panels = document.querySelectorAll<HTMLElement>("[data-tellian-station]");
      if (!panels.length) return;

      let roh: Zone[] = [];
      panels.forEach((el) => {
        const s = sektionen[Number(el.dataset.tellianStation)];
        if (!s) return;
        const r = el.getBoundingClientRect();
        const von = Math.max(0, r.left);
        const bis = Math.min(breite, r.right);
        if (bis - von <= 0.5) return;
        roh.push({ von, bis, dunkel: s.dunkel });
      });
      if (!roh.length) return;
      roh.sort((a, b) => a.von - b.von);

      /* Dunkle Teilflächen und Bildzonen überschreiben den Stationston
         in ihrem Bereich. */
      const streifen = bandStreifen(band);
      roh = ueberlagern(
        roh,
        sichtbareZonen("[data-tellian-dunkelzone]", breite, streifen, { dunkel: true }),
      );
      roh = ueberlagern(
        roh,
        sichtbareZonen("[data-tellian-bildzone]", breite, streifen, { dunkel: true, bild: true }),
      );

      /* Lücken zwischen den Panels (Atemräume zwischen den Sektionen,
         die keine Station sind) zählen als helle Fläche — sonst hätte
         die Maske dort ein Loch und die Schrift verschwände. */
      const gefuellt: Zone[] = [];
      let cursor = 0;
      for (const z of roh) {
        if (z.von - cursor > 0.5) gefuellt.push({ von: cursor, bis: z.von, dunkel: false });
        gefuellt.push(z);
        cursor = Math.max(cursor, z.bis);
      }
      if (breite - cursor > 0.5) gefuellt.push({ von: cursor, bis: breite, dunkel: false });

      /* Nachbarn gleicher Farbe zusammenfassen — sonst entstünde in
         der Maske eine Naht zwischen zwei gleichfarbigen Stationen. */
      const zus: Zone[] = [];
      for (const z of gefuellt) {
        const v = zus[zus.length - 1];
        if (v && v.dunkel === z.dunkel && !!v.bild === !!z.bild && z.von - v.bis < 1.5) {
          v.bis = z.bis;
        } else {
          zus.push({ ...z });
        }
      }
      /* Ränder aufziehen, damit ein Rundungsrest am Fensterrand keine
         unmaskierte Haarlinie stehen lässt. */
      zus[0].von = 0;
      zus[zus.length - 1].bis = breite;

      const schluessel = zus
        .map(
          (z) =>
            `${Math.round(z.von)}:${Math.round(z.bis)}:${z.dunkel ? 1 : 0}:${z.bild ? 1 : 0}`,
        )
        .join("|");
      if (schluessel !== letzte.current) {
        letzte.current = schluessel;
        setZonen(zus);
      }
    };

    const schleife = () => {
      if (!laeuft) return;
      messen();
      requestAnimationFrame(schleife);
    };
    const id = requestAnimationFrame(schleife);
    return () => {
      laeuft = false;
      cancelAnimationFrame(id);
    };
  }, [aktiv, activeIndex, band, sektionen]);

  return zonen;
}

function passt(z: Zone, schicht: BandSchicht): boolean {
  if (schicht === "bild") return !!z.bild;
  if (schicht === "dunkel") return z.dunkel && !z.bild;
  return !z.dunkel;
}

/**
 * Maske für eine der Schichten: sichtbar dort, wo der Grund die
 * gewünschte Färbung hat.
 */
export function zonenMaske(zonen: Zone[], schicht: BandSchicht): string {
  const stopps: string[] = [];
  for (const z of zonen) {
    const farbe = passt(z, schicht) ? "#000" : "transparent";
    stopps.push(`${farbe} ${z.von.toFixed(1)}px`);
    stopps.push(`${farbe} ${Math.max(z.von, z.bis - FEDER).toFixed(1)}px`);
  }
  return `linear-gradient(to right, ${stopps.join(", ")})`;
}

/** Trägt eine der Zonen überhaupt diese Färbung? */
export function hatZone(zonen: Zone[], schicht: BandSchicht): boolean {
  return zonen.some((z) => passt(z, schicht) && z.bis - z.von > 0.5);
}
