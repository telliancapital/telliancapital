"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { C, sans, serif } from "@/tokens";
import { LinkedInGlyph, MailGlyph } from "./KontaktGlyphen";
import { TEAM_BILD_FILTER, type TeamBild } from "@/sanity/lib/teamImage";
import type { Sprache } from "@/sections";

/* ═══════════════════════════════════════════════════════════
   TEAM — PERSONEN-DETAILANSICHT

   BREIT: links das Foto, gross und stehend; rechts Name, Rolle und
   der Text. SCHMAL: randloses Bildband oben, darunter Rolle, Name,
   Haarlinie, Abschnittsmarke und Fliesstext als EINE Scrollfläche.
   Schliessen über Knopf, Escape und den abgedunkelten Grund.
   ═══════════════════════════════════════════════════════════ */

const UI = {
  DE: {
    mail: "E-Mail",
    linkedin: "LinkedIn",
    schliessen: "Schliessen",
    vergroessern: "Porträt vergrössern",
    zurueck: "Zurück",
    biografie: "Biografie",
    nachOben: "Nach oben",
  },
  EN: {
    mail: "E-mail",
    linkedin: "LinkedIn",
    schliessen: "Close",
    vergroessern: "Enlarge portrait",
    zurueck: "Back",
    biografie: "Biography",
    nachOben: "Back to top",
  },
} as const;

interface Props {
  offen: boolean;
  name: string;
  rolle: string;
  /** Ungeschnittenes Porträt (Sanity-CDN, Stufen 480–1020). */
  bild?: TeamBild;
  /** Fertiger mailto-Verweis; fehlt bei Personen ohne Adresse. */
  mail?: string;
  linkedin?: string;
  /** Absätze — Struktur wie geliefert. */
  absaetze: readonly string[];
  sprache?: Sprache;
  isMobile?: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function TeamDetail({
  offen,
  name,
  rolle,
  bild,
  mail,
  linkedin,
  absaetze,
  sprache = "DE",
  isMobile = false,
  onClose,
  returnFocusRef,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const wurzelRef = useRef<HTMLDivElement | null>(null);
  const schliessenRef = useRef<HTMLButtonElement | null>(null);
  const [bildGross, setBildGross] = useState(false);

  useEffect(() => {
    if (!offen) return;
    setBildGross(false);
    panelRef.current?.scrollTo({ top: 0 });
  }, [offen, name]);

  useEffect(() => {
    if (!offen) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = vorher;
    };
  }, [offen]);

  useEffect(() => {
    if (!offen) return;
    const auf = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (bildGross) setBildGross(false);
        else onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const wurzel = wurzelRef.current;
      if (!wurzel) return;
      const ziele = wurzel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!ziele.length) return;
      const erster = ziele[0];
      const letzter = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erster) {
        e.preventDefault();
        letzter.focus();
      } else if (!e.shiftKey && document.activeElement === letzter) {
        e.preventDefault();
        erster.focus();
      }
    };
    document.addEventListener("keydown", auf, true);
    return () => document.removeEventListener("keydown", auf, true);
  }, [offen, onClose, bildGross]);

  const warOffen = useRef(false);
  useEffect(() => {
    if (offen) {
      warOffen.current = true;
      const id = window.setTimeout(() => schliessenRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    if (warOffen.current) {
      warOffen.current = false;
      returnFocusRef?.current?.focus({ preventScroll: true });
    }
  }, [offen, returnFocusRef]);

  if (!offen || typeof document === "undefined") return null;

  const schliessenKnopf = (
    <button
      ref={schliessenRef}
      type="button"
      onClick={onClose}
      aria-label={UI[sprache].schliessen}
      title={UI[sprache].schliessen}
      className="tellian-team-schliessen"
      style={{
        position: "absolute",
        top: isMobile ? "calc(13px + env(safe-area-inset-top, 0px))" : "20px",
        right: isMobile ? "13px" : "20px",
        zIndex: 3,
        display: isMobile && bildGross ? "none" : "inline-flex",
        ...(isMobile
          ? { padding: "7px", background: "none", border: "none", borderRadius: "999px" }
          : {
              width: "44px",
              height: "44px",
              padding: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(249, 249, 247, 0.85)",
              border: `1px solid ${C.line}`,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }),
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: C.ink,
      }}
    >
      {isMobile ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            height: "30px",
            padding: "0 11px",
            borderRadius: "999px",
            fontFamily: sans,
            fontSize: "12px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            backgroundColor: C.bg,
            border: `1px solid ${C.line}`,
          }}
        >
          {UI[sprache].zurueck}
          <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden focusable="false">
            <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden focusable="false">
          <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );

  const initiale = (
    <span
      aria-hidden
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: serif,
        fontSize: "clamp(56px, 7vw, 104px)",
        letterSpacing: "0.06em",
        color: "var(--tellian-t5-placeholder-ink)",
      }}
    >
      {name.trim().charAt(0)}
    </span>
  );

  const kontakt =
    mail || linkedin ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(18px, 2vw, 28px)",
          fontFamily: sans,
          fontSize: "12px",
          lineHeight: 1.3,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {mail && (
          <a
            href={mail}
            className="tellian-team-kontakt"
            aria-label={sprache === "EN" ? `Write an e-mail to ${name}` : `${name} eine E-Mail schreiben`}
          >
            <MailGlyph farbe="currentColor" />
            {UI[sprache].mail}
          </a>
        )}
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="tellian-team-kontakt"
            aria-label={sprache === "EN" ? `${name} on LinkedIn` : `${name} auf LinkedIn`}
          >
            <LinkedInGlyph farbe="currentColor" />
            {UI[sprache].linkedin}
          </a>
        )}
      </div>
    ) : null;

  const bildEl = (stil: React.CSSProperties) =>
    bild ? (
      <img
        src={bild.src}
        srcSet={bild.srcSet || undefined}
        sizes={bild.srcSet ? (isMobile ? "100vw" : "38vw") : undefined}
        alt=""
        decoding="async"
        style={{ objectFit: "cover", objectPosition: "50% 0%", filter: TEAM_BILD_FILTER, ...stil }}
      />
    ) : (
      initiale
    );

  const textSpalte = (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "clamp(32px, 3.2vw, 44px) clamp(32px, 3.6vw, 60px)",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          margin: 0,
          paddingRight: "72px",
          fontFamily: serif,
          fontSize: "clamp(28px, 2.8vw, 42px)",
          fontWeight: 400,
          lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
          color: C.ink,
        }}
      >
        {name}
      </h2>
      <p style={{ margin: "10px 0 0", fontFamily: sans, fontSize: "14px", letterSpacing: "0.04em", color: C.accent }}>
        {rolle}
      </p>
      {kontakt && <div style={{ marginTop: "18px" }}>{kontakt}</div>}
      <div
        style={{
          marginTop: "clamp(20px, 3vh, 32px)",
          display: "flex",
          flexDirection: "column",
          gap: "0.8em",
          maxWidth: "60ch",
        }}
      >
        {absaetze.map((absatz, i) => (
          <p
            key={absatz.slice(0, 24) + i}
            style={{ margin: 0, fontFamily: sans, fontSize: "var(--tellian-lauf-size)", lineHeight: 1.62, color: C.accent }}
          >
            {absatz}
          </p>
        ))}
      </div>
    </div>
  );

  const bildFlaeche = (
    <div
      style={{
        flex: "0 0 38%",
        height: "100%",
        flexShrink: 0,
        overflow: "hidden",
        backgroundColor: "var(--tellian-t5-placeholder-bg)",
      }}
      className="tellian-t5-bild"
    >
      {bildEl({ display: "block", width: "100%", height: "100%" })}
    </div>
  );

  const inhaltSchmal = (
    <div>
      <button
        type="button"
        onClick={() => setBildGross(true)}
        aria-label={UI[sprache].vergroessern}
        style={{ display: "block", width: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
      >
        <span
          className="tellian-t5-bild"
          style={{
            display: "block",
            width: "100%",
            aspectRatio: "0.87",
            maxHeight: "56vh",
            overflow: "hidden",
            backgroundColor: "var(--tellian-t5-placeholder-bg)",
          }}
        >
          {bildEl({ display: "block", width: "100%", height: "100%" })}
        </span>
      </button>

      <div
        style={{
          padding:
            "clamp(18px, 5.1vw, 26px) clamp(20px, 5.1vw, 28px) calc(clamp(40px, 9vw, 56px) + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
        }}
      >
        {rolle !== "" && (
          <p
            style={{
              margin: 0,
              fontFamily: sans,
              fontSize: "12px",
              lineHeight: 1.3,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            {rolle}
          </p>
        )}
        <h2
          style={{
            margin: "clamp(10px, 2.4vw, 14px) 0 0",
            fontFamily: serif,
            fontSize: "clamp(30px, 8.6vw, 38px)",
            fontWeight: 400,
            lineHeight: 1.02,
            color: C.ink,
            textWrap: "pretty" as React.CSSProperties["textWrap"],
          }}
        >
          {name}
        </h2>

        {kontakt && <div style={{ marginTop: "clamp(18px, 2.4vw, 24px)" }}>{kontakt}</div>}

        <hr style={{ margin: "clamp(34px, 8vw, 48px) 0 0", border: "none", borderTop: `1px solid ${C.line}` }} />
        <p
          style={{
            margin: "clamp(20px, 5vw, 28px) 0 0",
            fontFamily: sans,
            fontSize: "12px",
            lineHeight: 1.3,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.accent,
          }}
        >
          {UI[sprache].biografie}
        </p>
        <div style={{ marginTop: "clamp(18px, 4.4vw, 26px)", display: "flex", flexDirection: "column", gap: "0.9em" }}>
          {absaetze.map((absatz, i) => (
            <p
              key={absatz.slice(0, 24) + i}
              style={{ margin: 0, fontFamily: sans, fontSize: "clamp(17px, 4.9vw, 19px)", lineHeight: 1.38, color: C.ink }}
            >
              {absatz}
            </p>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "clamp(30px, 7vw, 44px)" }}>
          <button
            type="button"
            onClick={() => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={UI[sprache].nachOben}
            title={UI[sprache].nachOben}
            className="tellian-team-schliessen"
            style={{
              width: "44px",
              height: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              borderRadius: "50%",
              cursor: "pointer",
              color: C.ink,
              backgroundColor: "transparent",
              border: `1px solid ${C.line}`,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden focusable="false">
              <path d="M7 12.5 V2 M2.5 6.5 7 2 11.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const bildVollansicht = (
    <div
      onClick={() => setBildGross(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        backgroundColor: "rgba(26, 23, 32, 0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px)",
      }}
    >
      <button
        type="button"
        onClick={() => setBildGross(false)}
        aria-label={UI[sprache].schliessen}
        title={UI[sprache].schliessen}
        className="tellian-team-schliessen"
        style={{
          position: "absolute",
          top: "calc(12px + env(safe-area-inset-top, 0px))",
          right: "12px",
          zIndex: 1,
          width: "44px",
          height: "44px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          borderRadius: "50%",
          cursor: "pointer",
          color: "#F9F9F7",
          backgroundColor: "rgba(26, 23, 32, 0.44)",
          border: "1px solid rgba(249, 249, 247, 0.30)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden focusable="false">
          <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {bild && (
        <img
          src={bild.src}
          srcSet={bild.srcSet || undefined}
          sizes={bild.srcSet ? "100vw" : undefined}
          alt={name}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", filter: TEAM_BILD_FILTER }}
        />
      )}
    </div>
  );

  return createPortal(
    <div
      ref={wurzelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — ${rolle}`}
      style={{ position: "fixed", inset: 0, zIndex: 220 }}
    >
      <div onClick={onClose} aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "rgba(40, 31, 51, 0.62)" }} />
      <div
        ref={panelRef}
        style={{
          position: "absolute",
          ...(isMobile
            ? {
                inset: 0,
                overflowY: "auto" as const,
                WebkitOverflowScrolling: "touch" as const,
                overscrollBehavior: "contain" as const,
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(1100px, calc(100vw - 64px))",
                height: "min(712px, calc(100vh - 96px))",
                display: "flex",
              }),
          backgroundColor: C.bg,
          boxShadow: "0 24px 80px rgba(25, 23, 24, 0.35)",
          ...(isMobile ? null : { overflow: "hidden" }),
        }}
      >
        {isMobile ? (
          inhaltSchmal
        ) : (
          <>
            {schliessenKnopf}
            {bildFlaeche}
            {textSpalte}
          </>
        )}
      </div>
      {isMobile && schliessenKnopf}
      {isMobile && bildGross && bildVollansicht}

      <style>{`
        .tellian-team-schliessen {
          transition: border-color 200ms ease, background-color 200ms ease, transform 200ms ease;
        }
        .tellian-team-schliessen svg { transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1); }
        .tellian-team-schliessen:hover { border-color: ${C.accent}; transform: scale(1.06); }
        .tellian-team-schliessen:hover svg { transform: rotate(90deg); }
        .tellian-team-schliessen:active { transform: scale(0.96); }
        .tellian-team-kontakt {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${C.accent};
          text-decoration: none;
          padding: 9px 4px;
          margin: -9px -4px;
          transition: color 180ms ease;
        }
        .tellian-team-kontakt:hover { color: ${C.ink}; text-decoration: underline; text-underline-offset: 4px; }
        .tellian-team-kontakt:focus-visible,
        .tellian-team-schliessen:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-team-schliessen, .tellian-team-schliessen svg { transition: none; }
          .tellian-team-schliessen:hover svg { transform: none; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
