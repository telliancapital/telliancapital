"use client";

import { useState, useRef, useEffect } from "react";

import { sans } from "@/tokens";
import { SECTIONS, sectionOrdinal, type SectionDef } from "@/sections";
import { EASE } from "@/styles/motion";
import { zonenMaske, hatZone, type Zone, type BandSchicht } from "./useBandTon";

/* ═══════════════════════════════════════════════════════════
   STATIONSLEISTE (unten)

   Sechs nummerierte Stationsnamen über die ganze Breite, keine
   eigene Fläche, keine Trennlinie. Klick springt zur Station.
   Die Schriftfarbe folgt dem Grund — drei Schichten wie in der
   Kopfzeile (siehe useBandTon).

   Namen kommen aus der Registry, mit Sanity-Labels aufgelöst.
   ═══════════════════════════════════════════════════════════ */

/** Dauer eines befohlenen Sprungs (Farbwechsel des aktiven Namens). */
const JUMP_MS = 600;

interface DotNavigationProps {
  /** Aktive Sektion, direkt aus der Registry. */
  activeIndex: number;
  onNavigate: (index: number) => void;
  /** Sichtbare Stationsbereiche — siehe useBandZonen. */
  zonen: Zone[];
  /** Eigene Einträge (mit CMS-Labels). Ohne Angabe: Registry. */
  sektionen?: readonly SectionDef[];
  ariaLabel?: string;
}

export function DotNavigation({
  activeIndex,
  onNavigate,
  zonen,
  sektionen = SECTIONS,
  ariaLabel = "Sektion-Navigation",
}: DotNavigationProps) {
  /* KURZNAMEN STATT KLEINERER SCHRIFT
     Wird die Leiste zu eng, werden die Namen gekürzt — gemessen wird
     der tatsächliche Platzbedarf. */
  const [kurz, setKurz] = useState(false);
  const durationMs = JUMP_MS;
  const navRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  /* Passen die vollen Namen noch nebeneinander? */
  useEffect(() => {
    const pruefen = () => {
      const nav = navRef.current;
      const knoepfe = buttonsRef.current.filter(Boolean) as HTMLButtonElement[];
      if (!nav || knoepfe.length !== sektionen.length) return;
      const stil = getComputedStyle(nav);
      const platz = nav.clientWidth - parseFloat(stil.paddingLeft) - parseFloat(stil.paddingRight);
      const luecke = parseFloat(stil.columnGap || "0") * (knoepfe.length - 1);
      const gebraucht = knoepfe.reduce((a, b) => a + b.scrollWidth, 0) + luecke;
      /* Hysterese gegen Flackern an der Grenze. */
      setKurz((vorher) => (vorher ? gebraucht > platz - 24 : gebraucht > platz));
    };
    pruefen();
    const beobachter = new ResizeObserver(pruefen);
    if (navRef.current) beobachter.observe(navRef.current);
    window.addEventListener("resize", pruefen);
    return () => {
      beobachter.disconnect();
      window.removeEventListener("resize", pruefen);
    };
  }, [kurz, sektionen]);

  type Schicht = "hell" | "dunkel" | "bild" | "griff";

  const reihe = (schicht: Schicht) => {
    const griff = schicht === "griff";
    const aufDunkel = schicht === "dunkel" || schicht === "bild";
    const ziffer = griff
      ? "transparent"
      : schicht === "bild"
        ? "var(--tellian-band-dim-bild)"
        : aufDunkel
          ? "var(--tellian-band-dim-dunkel)"
          : "var(--tellian-station-numeral)";
    const aktivFarbe = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-ink-dunkel)"
        : "var(--tellian-station-label)";
    const ruheFarbe = griff
      ? "transparent"
      : schicht === "bild"
        ? "var(--tellian-band-dim-bild)"
        : aufDunkel
          ? "var(--tellian-band-dim-dunkel)"
          : "var(--tellian-station-inactive)";

    return sektionen.map((section, i) => {
      const isActive = activeIndex === i;
      return (
        <button
          key={section.key}
          ref={
            griff
              ? (el) => {
                  buttonsRef.current[i] = el;
                }
              : undefined
          }
          onClick={() => griff && onNavigate(i)}
          aria-current={griff && isActive ? "page" : undefined}
          aria-hidden={!griff}
          tabIndex={griff ? undefined : -1}
          className="tellian-station-ziel"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: griff ? "pointer" : "default",
            outline: "none",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {/* Ziffer — Mushroom, auch im aktiven Zustand. */}
          <span
            aria-hidden
            style={{
              fontFamily: sans,
              fontSize: "var(--tellian-station-size)",
              color: ziffer,
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {sectionOrdinal(i)}
          </span>

          <span
            style={{
              fontFamily: sans,
              fontSize: "var(--tellian-station-size)",
              letterSpacing: "0.01em",
              lineHeight: 1.2,
              userSelect: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: isActive ? aktivFarbe : ruheFarbe,
              transition: `color ${durationMs}ms ${EASE.standard}`,
            }}
          >
            {kurz ? section.labelKurz : section.label}
          </span>
        </button>
      );
    });
  };

  const schichtStil = (schicht: Schicht): React.CSSProperties => {
    const maske = schicht === "griff" ? undefined : zonenMaske(zonen, schicht as BandSchicht);
    return {
      position: "absolute",
      inset: 0,
      paddingLeft: "var(--tellian-band-pad-x)",
      paddingRight: "var(--tellian-band-pad-x)",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "clamp(12px, 2vw, 32px)",
      pointerEvents: schicht === "griff" ? "auto" : "none",
      ...(maske ? { WebkitMaskImage: maske, maskImage: maske } : null),
    };
  };

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className="tellian-stationsleiste"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        height: "var(--tellian-station-height)",
        /* Keine eigene Fläche, keine Trennlinie. */
        background: "transparent",
        border: "none",
        pointerEvents: "none",
      }}
    >
      {(["hell", "dunkel", "bild"] as const).map((schicht) =>
        hatZone(zonen, schicht) ? (
          <div key={schicht} aria-hidden style={schichtStil(schicht)}>
            {reihe(schicht)}
          </div>
        ) : null,
      )}
      <div style={schichtStil("griff")}>{reihe("griff")}</div>

      <style>{`
        .tellian-station-ziel:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-stationsleiste, .tellian-stationsleiste * { transition: none !important; }
        }
      `}</style>
    </nav>
  );
}
