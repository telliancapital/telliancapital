"use client";

import { useEffect, useState } from "react";

import { sans, serif } from "@/tokens";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { Aufgang, Kapitelmarke } from "./MobilSektion";

/* ═══════════════════════════════════════════════════════════
   HERO «EDITORIAL A2»

   Zweispalter 50/50: links Textzone auf Archive White, rechts das
   Bildpanel RANDLOS an Ober-, Unter- und rechter Stationskante,
   volle Stationshöhe, object-fit cover mit Fokuspunkt.
   Das Bildpanel trägt data-tellian-bildzone: Kopfzeile und
   Stationsleiste zeichnen darüber ihre ON-IMAGE-Schicht.
   MOBILE: Textgruppe zuerst, darunter das Bild volle Breite.

   Das Bild selbst kommt als URL (Sanity-Asset oder Bundle) — die
   Formatstufen der Vorlage übernimmt bei Bedarf `imageSrcSet`.
   ═══════════════════════════════════════════════════════════ */

const ARCHIVE_WHITE = "#F4F4F0";

/* Staffelung: Titel sofort, Text nach 260ms, Bild nach 120ms. */
const STEP = { titel: 0, text: 260, bild: 120 } as const;

interface Props {
  eyebrow?: string;
  /** Der Titel kommt fertig gesetzt (Umbruch/Kursiv beim Aufrufer). */
  titel: React.ReactNode;
  absaetze: readonly string[];
  /** 50/50 statt 42/58. */
  haelften?: boolean;
  imageSrc: string;
  imageSrcSet?: string;
  imageAlt: string;
  /** Breite/Höhe der BILDDATEI (für sizes). */
  bildVerhaeltnis?: number;
  /** object-position des Panels, z. B. "center 42%". */
  fokus?: string;
  hairline?: boolean;
  /** Sprachcode für die Silbentrennung des Fliesstexts. */
  lang?: string;
  isVertical?: boolean;
  /** Schmal: erst nach der Lade-Animation eintreten. */
  bereit?: boolean;
  domId?: string;
  /** Kapitelmarke des schmalen Zweigs. */
  marke?: { nr: string; name: string };
  /** Deckung des oberen Kontrast-Scrims am obersten Stop. */
  scrimOben?: number;
}

export function HeroEditorial({
  eyebrow,
  titel,
  absaetze,
  haelften = false,
  imageSrc,
  imageSrcSet,
  imageAlt,
  bildVerhaeltnis = 1.5,
  fokus = "center 50%",
  hairline = true,
  lang,
  isVertical = false,
  bereit = true,
  domId,
  marke,
  scrimOben = 0.62,
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();

  const [gestartet, setGestartet] = useState(false);
  useEffect(() => {
    if (!isVertical || !bereit) {
      setGestartet(false);
      return;
    }
    let zweiter = 0;
    const erster = requestAnimationFrame(() => {
      zweiter = requestAnimationFrame(() => setGestartet(true));
    });
    return () => {
      cancelAnimationFrame(erster);
      cancelAnimationFrame(zweiter);
    };
  }, [isVertical, bereit]);

  const shown = reducedMotion || (isVertical ? gestartet : entered);
  const enter = (delay: number, distance = 18): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity 700ms ease-out ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  const eyebrowEl = eyebrow ? (
    <p
      style={{
        margin: "0 0 18px",
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "var(--tellian-ls-marker)",
        textTransform: "uppercase",
        color: "var(--tellian-purple)",
        ...enter(STEP.titel),
      }}
    >
      {eyebrow}
    </p>
  ) : null;

  const titelEl = (
    <h1
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: isVertical
          ? "clamp(38px, 10.8vw, 54px)"
          : haelften
            ? "var(--tellian-hero-titel-size-halb)"
            : "var(--tellian-hero-titel-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-titel-lh)" as unknown as number,
        letterSpacing: "var(--tellian-titel-ls)",
        color: "var(--tellian-ink)",
        ...enter(STEP.titel, 24),
      }}
    >
      {titel}
    </h1>
  );

  const hairlineEl = hairline ? (
    <span
      aria-hidden
      style={{
        display: "block",
        marginTop: isVertical ? "clamp(16px, 2.4vh, 26px)" : "clamp(24px, 4.9vh, 44px)",
        marginBottom: isVertical ? "clamp(14px, 2vh, 22px)" : "clamp(20px, 4vh, 36px)",
        width: "100%",
        height: "1px",
        backgroundColor: "rgba(184, 174, 163, 0.5)",
        ...enter(STEP.text, 0),
      }}
    />
  ) : (
    <span
      aria-hidden
      style={{
        display: "block",
        height:
          haelften && !isVertical
            ? "calc(var(--tellian-abstand-titel) + var(--tellian-abstand-absatz))"
            : "var(--tellian-abstand-titel)",
      }}
    />
  );

  const textEl = (breit: boolean) => (
    <div
      lang={lang}
      style={{
        display: "block",
        maxWidth: breit && haelften ? "52ch" : undefined,
        ...enter(STEP.text),
      }}
    >
      {absaetze.map((a, i) => (
        <p
          key={a.slice(0, 24) + i}
          style={{
            margin: i === 0 ? 0 : breit && haelften ? "22px 0 0" : "1em 0 0",
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-ink)",
            ...(breit && haelften ? ({ textWrap: "pretty" } as React.CSSProperties) : null),
          }}
        >
          {a}
        </p>
      ))}
    </div>
  );

  const bild = (sizes: string, stil: React.CSSProperties) => (
    <img
      src={imageSrc}
      srcSet={imageSrcSet}
      sizes={imageSrcSet ? sizes : undefined}
      alt={imageAlt}
      decoding="async"
      loading="eager"
      fetchPriority="high"
      style={{ objectFit: "cover", objectPosition: fokus, ...stil }}
    />
  );

  /* ── SCHMAL: Text zuerst, Bild darunter volle Breite ── */
  if (isVertical) {
    return (
      <section id={domId} className="tellian-hero-schmal" style={{ backgroundColor: ARCHIVE_WHITE }}>
        <div
          style={{
            flexShrink: 0,
            paddingTop: "calc(var(--tellian-kopfzeile-schmal) + clamp(16px, 2.4vh, 28px))",
            paddingBottom: "clamp(18px, 2.6vh, 32px)",
            paddingLeft: "var(--tellian-rand-schmal)",
            paddingRight: "var(--tellian-rand-schmal)",
          }}
        >
          {marke && (
            <div style={{ marginBottom: "clamp(18px, 2.6vh, 32px)" }}>
              <Kapitelmarke nr={marke.nr} name={marke.name} />
            </div>
          )}
          <Aufgang>
            {eyebrowEl}
            {titelEl}
            {hairlineEl}
            {textEl(false)}
          </Aufgang>
        </div>
        <div
          style={{
            flex: "1 1 auto",
            minHeight: "200px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {bild(`max(100vw, ${Math.round(bildVerhaeltnis * 55)}vh)`, {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          })}
        </div>
      </section>
    );
  }

  /* ── BREIT: 50/50, Bild randlos an drei Kanten ── */
  return (
    <div
      id={domId}
      className="flex-shrink-0 h-screen relative"
      style={{ width: "100vw", backgroundColor: ARCHIVE_WHITE }}
      data-tellian-station="0"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: haelften ? "50fr 50fr" : "42fr 58fr",
          height: "100%",
        }}
      >
        {/* ══ Textzone — Gruppe vertikal zentriert ══ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "clamp(48px, 6.7vw, 96px)",
            paddingRight: "clamp(40px, 5.6vw, 80px)",
            paddingTop: "var(--tellian-kopf-height)",
            paddingBottom: "var(--tellian-station-height)",
            boxSizing: "border-box",
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0, width: "100%" }}>
            {eyebrowEl}
            {titelEl}
            {hairlineEl}
            {textEl(true)}
          </div>
        </div>

        {/* ══ Bildpanel — randlos oben, unten, rechts ══ */}
        <div
          data-tellian-bildzone
          style={{ position: "relative", height: "100%", overflow: "hidden", ...enter(STEP.bild, 0) }}
        >
          {bild(`max(${haelften ? 50 : 58}vw, ${Math.round(bildVerhaeltnis * 100)}vh)`, {
            display: "block",
            width: "100%",
            height: "100%",
          })}
          {/* Lesbarkeits-Scrims nur in den Bandhöhen */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "130px",
              background:
                `linear-gradient(to bottom, rgba(40, 31, 51, ${scrimOben}) 0%,` +
                ` rgba(40, 31, 51, ${(scrimOben * 0.45).toFixed(3)}) 45%,` +
                " rgba(40, 31, 51, 0) 100%)",
              pointerEvents: "none",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "calc(var(--tellian-station-height) + 88px)",
              background:
                "linear-gradient(to top, rgba(40, 31, 51, 0.94) 0%," +
                " rgba(40, 31, 51, 0.82) 38%, rgba(40, 31, 51, 0) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
