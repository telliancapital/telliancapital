"use client";

import { useEffect, useState } from "react";

import { C, sans, serif } from "@/tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { SubpageZeitstrahl, type Schritt } from "./SubpageZeitstrahl";
import { SubpageVergleich } from "./SubpageVergleich";
import type { Pfad } from "@/data/mandatAdvisory";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITEN MANDAT UND ADVISORY — gemeinsame Hülle
     1  Hero — Überschrift, Einleitung, Weg ins Gespräch.
     2  Vorgehen — Zeitstrahl.
     3  Einordnung — die gemeinsame Vergleichstabelle.
   ═══════════════════════════════════════════════════════════ */

const RAND_BREIT = "clamp(40px, 5.6vw, 96px)";
const RAND_SCHMAL = "24px";

const TRENNER: React.CSSProperties = {
  borderTop: "1px solid rgba(184, 174, 163, 0.5)",
  marginTop: "clamp(40px, 6.5vh, 76px)",
  paddingTop: "clamp(26px, 4vh, 44px)",
};

const STUFE_MS = 90;
const DAUER_MS = 520;

interface Props {
  seite: Pfad;
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  vorgehenTitel?: string;
  schritte: readonly Schritt[];
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  /** CMS-Dokument (homepage) für die Vergleichstabelle. */
  homepage?: any;
  onContactClick?: () => void;
  onAndereSeite?: () => void;
}

export function SubpageMandatAdvisory({
  seite,
  homepage,
  titel,
  lead,
  knopf,
  vorgehenTitel,
  schritte,
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
  onAndereSeite,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [eingetreten, setEingetreten] = useState(false);
  useEffect(() => {
    if (!aktiv) {
      setEingetreten(false);
      return;
    }
    const id = window.setTimeout(() => setEingetreten(true), 40);
    return () => window.clearTimeout(id);
  }, [aktiv]);

  const stufe = (i: number): React.CSSProperties =>
    reduced
      ? {}
      : {
          opacity: eingetreten ? 1 : 0,
          transform: eingetreten ? "translateY(0)" : "translateY(10px)",
          transition: `opacity ${DAUER_MS}ms ease-out ${i * STUFE_MS}ms, transform ${DAUER_MS}ms ease-out ${i * STUFE_MS}ms`,
        };

  const rand = isMobile ? RAND_SCHMAL : RAND_BREIT;

  return (
    <div
      style={
        {
          "--tellian-subpage-rand": rand,
          backgroundColor: C.bg,
          paddingLeft: rand,
          paddingRight: rand,
          paddingTop: isMobile ? "clamp(26px, 4vh, 40px)" : "clamp(30px, 4.6vh, 56px)",
          paddingBottom: "clamp(48px, 8vh, 96px)",
          boxSizing: "border-box",
        } as React.CSSProperties
      }
    >
      <section>
        <div style={stufe(0)}>
          <h1
            style={{
              margin: 0,
              fontFamily: serif,
              fontSize: isMobile ? "clamp(30px, 8.4vw, 38px)" : "clamp(34px, 3.4vw, 50px)",
              fontWeight: 400,
              lineHeight: 1.16,
              color: C.ink,
            }}
          >
            {titel[0]}
            <br />
            <em style={{ fontStyle: "italic", color: C.purple }}>{titel[1]}</em>
          </h1>
          <div style={{ marginTop: "clamp(18px, 2.6vh, 28px)", maxWidth: "58ch" }}>
            {lead.map((absatz, i) => (
              <p
                key={absatz.slice(0, 24)}
                style={{
                  margin: i === 0 ? 0 : "1em 0 0",
                  fontFamily: sans,
                  fontSize: isMobile ? "15px" : "14px",
                  lineHeight: 1.65,
                  color: C.accent,
                }}
              >
                {absatz}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onContactClick?.()}
            className="tellian-cta-primaer tellian-subpage-knopf"
            style={{
              marginTop: "clamp(20px, 3vh, 32px)",
              border: "none",
              borderRadius: 0,
              padding: "14px 26px",
              minHeight: "var(--tellian-tippziel)",
              fontFamily: sans,
              fontSize: "13px",
              letterSpacing: "var(--tellian-ls-cta-klein)",
              cursor: "pointer",
            }}
          >
            {knopf}
          </button>
        </div>
      </section>

      <div style={{ ...TRENNER, ...stufe(1) }}>
        <SubpageZeitstrahl titel={vorgehenTitel} schritte={schritte} isMobile={isMobile} />
      </div>

      <div style={{ ...TRENNER, ...stufe(2) }}>
        <SubpageVergleich seite={seite} sprache={sprache} isMobile={isMobile} homepage={homepage} onAndereSeite={onAndereSeite} />
      </div>

      <style>{`
        .tellian-subpage-knopf:focus-visible {
          outline: 2px solid var(--tellian-accent);
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}
