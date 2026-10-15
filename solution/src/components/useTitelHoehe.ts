"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   TITELHÖHE DER NACHBARSTATION

   Stationen mit zentrierter Textspalte setzen ihren Titel oben in
   der Spalte. Wer nur seinen eigenen Titel zentriert, landet auf
   Höhe des Fliesstextes. Die Spaltenhöhe hängt am Textumbruch und
   ist in CSS nicht ausdrückbar — deshalb wird sie gemessen.
   ═══════════════════════════════════════════════════════════ */

function obenIn(el: HTMLElement, wurzel: HTMLElement): number | null {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== wurzel) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return n === wurzel ? y : null;
}

function imFluss(el: HTMLElement, wurzel: HTMLElement): boolean {
  let n: HTMLElement | null = el;
  while (n && n !== wurzel) {
    if (getComputedStyle(n).position === "absolute") return false;
    n = n.parentElement;
  }
  return true;
}

export function useTitelHoehe(aktiv: boolean) {
  const wurzelRef = useRef<HTMLDivElement | null>(null);
  const [oben, setOben] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!aktiv) return;

    const referenz = () => {
      let n = wurzelRef.current?.previousElementSibling as HTMLElement | null;
      while (n) {
        const h2 = n.querySelector("h2") as HTMLElement | null;
        if (h2 && imFluss(h2, n)) return { station: n, h2 };
        n = n.previousElementSibling as HTMLElement | null;
      }
      return null;
    };

    const messen = () => {
      const r = referenz();
      if (!r) return;
      const y = obenIn(r.h2, r.station);
      if (y !== null) setOben(y);
    };

    messen();

    const beobachter = new ResizeObserver(messen);
    const r = referenz();
    if (r) {
      const spalte = r.h2.closest("div")?.parentElement ?? null;
      for (const ziel of [r.h2, spalte, r.station]) if (ziel) beobachter.observe(ziel);
    }
    document.fonts?.ready.then(messen).catch(() => {});
    window.addEventListener("resize", messen);

    return () => {
      beobachter.disconnect();
      window.removeEventListener("resize", messen);
    };
  }, [aktiv]);

  return { wurzelRef, oben };
}
