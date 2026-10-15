"use client";

import { C, sans, serif } from "@/tokens";

/* ═══════════════════════════════════════════════════════════
   VORGEHEN — Prozessschritte als Zeitstrahl (Mandat 5, Advisory 3).
   BREIT: Ziffernkreise auf EINER Linie. SCHMAL: senkrecht.
   ═══════════════════════════════════════════════════════════ */

export interface Schritt {
  titel: string;
  zeile: string;
}

const KREIS = 34;
const HAARLINIE = "rgba(184, 174, 163, 0.5)";

interface Props {
  titel?: string;
  schritte: readonly Schritt[];
  isMobile?: boolean;
}

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

export function SubpageZeitstrahl({ titel, schritte, isMobile = false }: Props) {
  const letzter = schritte.length - 1;

  const titelStil: React.CSSProperties = {
    margin: 0,
    fontFamily: serif,
    fontSize: isMobile ? "26px" : "clamp(28px, 2.6vw, 38px)",
    fontWeight: 400,
    lineHeight: 1.18,
    color: C.ink,
  };
  const schrittTitel: React.CSSProperties = {
    margin: 0,
    fontFamily: serif,
    fontSize: isMobile ? "19px" : "clamp(18px, 1.6vw, 22px)",
    fontWeight: 400,
    color: C.ink,
  };
  const schrittText: React.CSSProperties = {
    margin: "8px 0 0",
    fontFamily: sans,
    fontSize: isMobile ? "14px" : "13px",
    lineHeight: 1.6,
    color: C.accent,
  };

  const kreis = (i: number) => (
    <span
      aria-hidden
      style={{
        position: "relative",
        zIndex: 1,
        flexShrink: 0,
        width: `${KREIS}px`,
        height: `${KREIS}px`,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        border: `1px solid ${i === letzter ? C.purple : HAARLINIE}`,
        backgroundColor: i === letzter ? C.purple : C.bg,
        fontFamily: serif,
        fontSize: "12px",
        color: i === letzter ? C.bg : C.accent,
      }}
    >
      {ziffer(i)}
    </span>
  );

  if (isMobile) {
    return (
      <section>
        {titel && <h2 style={titelStil}>{titel}</h2>}
        <ol style={{ listStyle: "none", margin: titel ? "clamp(24px, 4vh, 36px) 0 0" : 0, padding: 0, position: "relative" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: `${KREIS / 2}px`,
              top: `${KREIS / 2}px`,
              bottom: `${KREIS / 2}px`,
              width: "1px",
              backgroundColor: HAARLINIE,
            }}
          />
          {schritte.map((s, i) => (
            <li key={s.titel} style={{ display: "flex", gap: "16px", paddingBottom: i === letzter ? 0 : "clamp(22px, 3.4vh, 32px)" }}>
              {kreis(i)}
              <div style={{ paddingTop: "4px" }}>
                <h3 style={schrittTitel}>{s.titel}</h3>
                <p style={schrittText}>{s.zeile}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section>
      {titel && <h2 style={titelStil}>{titel}</h2>}
      <ol
        style={{
          listStyle: "none",
          margin: titel ? "clamp(28px, 4.4vh, 52px) 0 0" : 0,
          padding: 0,
          position: "relative",
          display: "grid",
          gridTemplateColumns: `repeat(${schritte.length}, minmax(0, 1fr))`,
          columnGap: "clamp(20px, 2.4vw, 40px)",
        }}
      >
        <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: `${KREIS / 2}px`, height: "1px", backgroundColor: HAARLINIE }} />
        {schritte.map((s, i) => (
          <li key={s.titel} style={{ position: "relative" }}>
            {kreis(i)}
            <h3 style={{ ...schrittTitel, marginTop: "clamp(16px, 2.2vh, 26px)" }}>{s.titel}</h3>
            <p style={schrittText}>{s.zeile}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
