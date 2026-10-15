"use client";

import { createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════════════
   EINTRITTS-LATCH

   Sagt dem Inhalt einer Sektion, ob sie in dieser Sitzung schon
   betreten wurde. Einmal true, bleibt true — Eintrittsanimationen
   laufen genau einmal und nie rückwärts.
   ═══════════════════════════════════════════════════════════ */

const SectionEnteredContext = createContext(false);

export const SectionEnteredProvider = SectionEnteredContext.Provider;

/** true, sobald die umgebende Sektion einmal betreten wurde. */
export function useSectionEntered(): boolean {
  return useContext(SectionEnteredContext);
}
