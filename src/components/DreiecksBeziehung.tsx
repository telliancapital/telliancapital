"use client";

import { useEffect, useRef, useState } from "react";

import { C, sans, serif } from "@/tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import type { Sprache } from "@/sections";
import publikumIcon from "@/assets/publikum.png";
import bankgebaeudeIcon from "@/assets/bankgebaude.png";
import monogramm from "@/assets/logo/tellian-monogramm-hell.svg";

/* ═══════════════════════════════════════════════════════════
   DREIECKSBEZIEHUNG — Sie · Tellian Capital · Depotbank

   Drei Knoten, drei Linien, drei Verbindungswörter in einem festen
   Koordinatensystem (640×560). Die Linien zeichnen sich am Scroll.
   Die Beschriftungen und Erklärtexte kommen als `inhalt` herein —
   die Station löst sie aus Sanity auf (methodParty- und methodEdge-Felder).
   ═══════════════════════════════════════════════════════════ */

export interface DreieckInhalt {
  sie: string;
  tellian: string;
  bank: string;
  /** Sie↔Tellian · Sie↔Depotbank · Tellian↔Depotbank */
  kanten: readonly [string, string, string];
  /** Zeilenfassung der Kantenwörter für die Grafik. */
  kantenZeilen: readonly [readonly string[], readonly string[], readonly string[]];
  prosa: Readonly<Record<"sie" | "tellian" | "bank", string>>;
}

export const DREIECK_INHALT: Readonly<Record<Sprache, DreieckInhalt>> = {
  DE: {
    sie: "Sie",
    tellian: "Tellian Capital",
    bank: "Depotbank",
    kanten: ["Vermögensverwaltungsauftrag", "Depot- / Kontobeziehung", "Vermögensverwaltungsvollmacht"],
    kantenZeilen: [
      ["Vermögens-", "verwaltungsauftrag"],
      ["Depot- /", "Kontobeziehung"],
      ["Vermögens-", "verwaltungsvollmacht"],
    ],
    prosa: {
      sie: "Sie haben einen persönlichen Ansprechpartner und jederzeit vollständige Transparenz. Ihr Portfolio wird laufend überwacht, und Sie werden regelmässig darüber informiert.",
      tellian: "Unsere Leistungen für Sie →",
      bank: "Ihr Vermögen liegt bei ausgewählten Kooperationsbanken in der Schweiz und in Liechtenstein.",
    },
  },
  EN: {
    sie: "You",
    tellian: "Tellian Capital",
    bank: "Custodian Bank",
    kanten: ["Asset management mandate", "Custody/account relationship", "Asset management authority"],
    kantenZeilen: [
      ["Asset management", "mandate"],
      ["Custody/account", "relationship"],
      ["Asset management", "authority"],
    ],
    prosa: {
      sie: "You have a personal point of contact and full transparency at all times. Your portfolio is continuously monitored, and you are kept regularly informed.",
      tellian: "Our services for you →",
      bank: "Your assets are held at selected partner banks in Switzerland and Liechtenstein.",
    },
  },
};

/** Bricht ein langes Kantenwort für die Grafik in zwei Zeilen. */
export function kantenZeilen(wort: string): readonly string[] {
  if (wort.length <= 18) return [wort];
  const schraeg = wort.indexOf("/");
  if (schraeg > 0 && schraeg < wort.length - 1) {
    return [wort.slice(0, schraeg + 1).trim(), wort.slice(schraeg + 1).trim()];
  }
  const bindestrich = wort.indexOf("-");
  if (bindestrich > 3 && bindestrich < wort.length - 3) {
    return [wort.slice(0, bindestrich + 1).trim(), wort.slice(bindestrich + 1).trim()];
  }
  const mitte = wort.lastIndexOf(" ", Math.ceil(wort.length / 2) + 4);
  if (mitte > 0) return [wort.slice(0, mitte), wort.slice(mitte + 1)];
  return [wort];
}

const R = 78;
const KANTENSCHLUSS = 0.5;

const kante = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const laenge = Math.hypot(dx, dy) || 1;
  const ux = dx / laenge;
  const uy = dy / laenge;
  const r = R - KANTENSCHLUSS;
  return { x1: a.x + ux * r, y1: a.y + uy * r, x2: b.x - ux * r, y2: b.y - uy * r };
};

const GEDIMMT = 0.25;
const SILBER = "rgba(249, 249, 247, 0.78)";
const SILBER_DIM = "rgba(249, 249, 247, 0.6)";
const KONTUR_HELL = "rgba(249, 249, 247, 0.4)";

const mischen = (vorn: string, hinten: string, deckung: number) => {
  const kanal = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = kanal(vorn);
  const [r2, g2, b2] = kanal(hinten);
  const m = (a: number, b: number) => Math.round(a * deckung + b * (1 - deckung));
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
};

const pz = (v: number, ganz: number) => `${((v / ganz) * 100).toFixed(2)}%`;

const rasterMotiv = (quelle: string, breite: string, farbe: string): React.CSSProperties => ({
  width: breite,
  aspectRatio: "1",
  display: "block",
  backgroundColor: farbe,
  WebkitMaskImage: `url(${quelle})`,
  maskImage: `url(${quelle})`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

interface Props {
  sprache?: Sprache;
  inhalt?: DreieckInhalt;
  /** Klick/Enter auf den Tellian-Knoten führt zur Mandat-Unterseite. */
  onMandat?: () => void;
  /** Vertikales Layout (<1024px). */
  kompakt?: boolean;
}

type KnotenId = "sie" | "tellian" | "bank";

export function DreiecksBeziehung({ sprache = "DE", inhalt: inhaltProp, onMandat, kompakt = false }: Props) {
  const inhalt = inhaltProp ?? DREIECK_INHALT[sprache];
  const K = kompakt
    ? ({ sie: { x: 320, y: 118 }, tellian: { x: 150, y: 460 }, bank: { x: 490, y: 460 } } as const)
    : ({ sie: { x: 320, y: 128 }, tellian: { x: 124, y: 420 }, bank: { x: 516, y: 420 } } as const);
  const VH = kompakt ? 700 : 560;
  const [aktiv, setAktiv] = useState<KnotenId | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const linienSvgRef = useRef<SVGSVGElement | null>(null);
  const linienRefs = useRef<(SVGLineElement | null)[]>([]);
  const linienRafRef = useRef(0);
  const linienPRef = useRef(-1);

  useEffect(() => {
    if (kompakt) return;
    const svg = linienSvgRef.current;
    if (!svg) return;

    const laengen = linienRefs.current.map((el) => (el ? el.getTotalLength() : 0));
    linienRefs.current.forEach((el, i) => {
      if (el) el.style.strokeDasharray = String(laengen[i]);
    });

    const schreibe = (P: number) => {
      if (Math.abs(P - linienPRef.current) < 0.0005) return;
      linienPRef.current = P;
      const folge: Array<[number, boolean]> = [[0, false], [2, false], [1, true]];
      folge.forEach(([index, rueckwaerts], k) => {
        const el = linienRefs.current[index];
        if (!el) return;
        const p = Math.max(0, Math.min(1, P * 3 - k));
        const rest = (1 - p) * laengen[index];
        el.style.strokeDashoffset = String(rueckwaerts ? -rest : rest);
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      linienRefs.current.forEach((el) => {
        if (el) el.style.strokeDasharray = "none";
      });
      return;
    }

    linienPRef.current = -1;
    schreibe(0);
    linienPRef.current = -1;

    let laeuft = false;
    let anzeigeP = 0;
    let letzteZeit = 0;
    const ZUG_PRO_S = 0.7;
    const tick = () => {
      if (!laeuft) return;
      const jetzt = performance.now();
      const dt = letzteZeit ? Math.min(0.1, (jetzt - letzteZeit) / 1000) : 0;
      letzteZeit = jetzt;
      const r = svg.getBoundingClientRect();
      const sichtbar = window.innerWidth - r.left;
      const zielP = Math.max(0, Math.min(1, (sichtbar - r.width * 0.45) / (r.width * 0.55)));
      const delta = zielP - anzeigeP;
      const schritt = Math.max(-ZUG_PRO_S * dt, Math.min(ZUG_PRO_S * dt, delta));
      anzeigeP += schritt;
      schreibe(anzeigeP);
      linienRafRef.current = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (eintraege) => {
        const nah = eintraege.some((e) => e.isIntersecting);
        if (nah && !laeuft) {
          laeuft = true;
          letzteZeit = 0;
          linienRafRef.current = requestAnimationFrame(tick);
        } else if (!nah && laeuft) {
          laeuft = false;
          cancelAnimationFrame(linienRafRef.current);
          anzeigeP = 0;
          linienPRef.current = -1;
          schreibe(0);
          linienPRef.current = -1;
        }
      },
      { rootMargin: "0px 50% 0px 50%" },
    );
    io.observe(svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(linienRafRef.current);
      laeuft = false;
    };
  }, [kompakt]);

  const entlang = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  const NORMAL_1 = { x: -0.83, y: -0.557 };
  const NORMAL_2 = { x: 0.83, y: -0.557 };
  const m1roh = entlang(K.sie, K.tellian, 0.5);
  const m2roh = entlang(K.sie, K.bank, kompakt ? 0.64 : 0.5);
  const m1 = kompakt ? m1roh : { x: m1roh.x + 17 * NORMAL_1.x, y: m1roh.y + 17 * NORMAL_1.y };
  const m2 = kompakt ? m2roh : { x: m2roh.x + 17 * NORMAL_2.x, y: m2roh.y + 17 * NORMAL_2.y };
  const m3 = kompakt ? { x: 320, y: K.tellian.y + R + 68 } : { x: 320, y: K.tellian.y + 12 };

  const knoten = (
    id: KnotenId,
    zentrum: { x: number; y: number },
    fuellung: string,
    kontur: string | null,
    kind: React.ReactNode,
    beschriftung: string,
  ) => {
    const istCta = id === "tellian";
    const gedimmt = !kompakt && aktiv !== null && aktiv !== id;
    const hervor = !kompakt && aktiv === id;
    const uebergang = reducedMotion
      ? undefined
      : "opacity 260ms cubic-bezier(0.22,0.61,0.36,1), transform 260ms cubic-bezier(0.22,0.61,0.36,1)";
    const istPassiv = kompakt && !istCta;
    const kreisStil: React.CSSProperties = {
      position: "absolute",
      left: pz(zentrum.x, 640),
      top: pz(zentrum.y, VH),
      width: pz(2 * R, 640),
      aspectRatio: "1",
      borderRadius: "50%",
      border: kontur ? `1.5px solid ${kontur}` : "none",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      backgroundColor: gedimmt ? mischen(fuellung, C.purple, GEDIMMT) : fuellung,
      transform: `translate(-50%, -50%) scale(${hervor ? 1.03 : 1})`,
      transition: uebergang ? `${uebergang}, background-color 260ms cubic-bezier(0.22,0.61,0.36,1)` : undefined,
      zIndex: hervor ? 2 : 1,
    };
    const inhaltHuelle = (
      <span
        aria-hidden
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          opacity: gedimmt ? GEDIMMT : 1,
          transition: uebergang,
        }}
      >
        {kind}
      </span>
    );
    return (
      <>
        {istPassiv ? (
          <div aria-hidden style={kreisStil}>
            {inhaltHuelle}
          </div>
        ) : (
          <button
            type="button"
            onMouseEnter={kompakt ? undefined : () => setAktiv(id)}
            onMouseLeave={kompakt ? undefined : () => setAktiv((a) => (a === id ? null : a))}
            onFocus={kompakt ? undefined : () => setAktiv(id)}
            onBlur={kompakt ? undefined : () => setAktiv((a) => (a === id ? null : a))}
            onClick={() => {
              if (kompakt) {
                onMandat?.();
                return;
              }
              if (istCta && aktiv === id) {
                onMandat?.();
                return;
              }
              setAktiv(id);
            }}
            aria-label={
              istCta
                ? `${beschriftung} — ${inhalt.prosa.tellian.replace(" →", "")}`
                : `${beschriftung} — ${inhalt.prosa[id as "sie" | "bank"]}`
            }
            className="tellian-dreieck-knoten"
            style={{ ...kreisStil, cursor: "pointer", font: "inherit" }}
          >
            {inhaltHuelle}
          </button>
        )}
        <span
          style={{
            position: "absolute",
            left: pz(zentrum.x, 640),
            top: pz(zentrum.y + (id === "sie" ? -(R + 26) : R + (kompakt ? 20 : 26)), VH),
            transform: "translate(-50%, -50%)",
            fontFamily: sans,
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            color: C.bg,
            opacity: gedimmt ? GEDIMMT : 1,
            transition: uebergang,
          }}
        >
          {beschriftung}
        </span>
      </>
    );
  };

  const wort = (
    zentrum: { x: number; y: number },
    text: string,
    anker: "oben" | "mitte" | "links" | "rechts",
    teller = false,
    zeilen?: readonly string[],
  ) => (
    <span
      style={{
        position: "absolute",
        left: pz(zentrum.x, 640),
        top: pz(zentrum.y, VH),
        transform:
          anker === "oben"
            ? "translate(-50%, 0)"
            : anker === "links"
              ? "translate(0, -50%)"
              : anker === "rechts"
                ? "translate(-100%, -50%)"
                : "translate(-50%, -50%)",
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
        textAlign: "center",
        color: SILBER,
        ...(teller ? { backgroundColor: "var(--tellian-s2-bg, #281F33)", padding: "2px 10px" } : null),
      }}
    >
      {(zeilen ?? [text]).map((z) => (
        <span key={z} style={{ display: "block" }}>
          {z}
        </span>
      ))}
    </span>
  );

  /* ── KOMPAKT: Dreieck mit Ziffern-Legende ── */
  if (kompakt) {
    const KD = { sie: { x: 320, y: 128 }, tellian: { x: 124, y: 420 }, bank: { x: 516, y: 420 } } as const;
    const VHD = 560;
    const mitte = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    });
    const zf = (n: number) => `0${n}`;
    const kanteMitZiffer: Array<[{ x: number; y: number }, { x: number; y: number }, number]> = [
      [KD.sie, KD.tellian, 1],
      [KD.sie, KD.bank, 2],
      [KD.tellian, KD.bank, 3],
    ];
    const kreisKompakt = (zentrum: { x: number; y: number }, fuellung: string, kind: React.ReactNode, kontur?: string) => (
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          top: pz(zentrum.y, VHD),
          width: pz(2 * R, 640),
          aspectRatio: "1",
          borderRadius: "50%",
          border: kontur ? `1.5px solid ${kontur}` : "none",
          boxSizing: "border-box",
          backgroundColor: fuellung,
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {kind}
      </div>
    );
    const nameKompakt = (zentrum: { x: number; y: number }, text: string, oben = false) => (
      <span
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          top: pz(zentrum.y + (oben ? -(R + 30) : R + 30), VHD),
          transform: "translate(-50%, -50%)",
          fontFamily: sans,
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          color: C.bg,
        }}
      >
        {text}
      </span>
    );

    return (
      <div style={{ width: "100%" }}>
        <div
          role="group"
          aria-label={
            `${inhalt.sie} — ${inhalt.tellian}: ${inhalt.kanten[0]}. ` +
            `${inhalt.sie} — ${inhalt.bank}: ${inhalt.kanten[1]}. ` +
            `${inhalt.tellian} — ${inhalt.bank}: ${inhalt.kanten[2]}.`
          }
          style={{ position: "relative", width: "100%", aspectRatio: `640 / ${VHD}` }}
        >
          <svg
            viewBox={`0 0 640 ${VHD}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
            focusable="false"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {kanteMitZiffer.map(([a, b]) => (
              <line key={`${a.x}-${b.x}`} {...kante(a, b)} stroke={C.muted} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
          </svg>

          {kreisKompakt(KD.sie, C.muted, <span aria-hidden style={rasterMotiv(publikumIcon.src, "40%", C.purple)} />)}
          {kreisKompakt(
            KD.tellian,
            C.purple,
            <img src={monogramm.src} width={monogramm.width} height={monogramm.height} alt="" aria-hidden style={{ width: "35%", height: "auto", display: "block" }} />,
            KONTUR_HELL,
          )}
          {kreisKompakt(KD.bank, C.muted, <span aria-hidden style={rasterMotiv(bankgebaeudeIcon.src, "31.5%", C.purple)} />)}

          {nameKompakt(KD.sie, inhalt.sie, true)}
          {nameKompakt(KD.tellian, inhalt.tellian)}
          {nameKompakt(KD.bank, inhalt.bank)}

          {kanteMitZiffer.map(([a, b, n]) => {
            const m = mitte(a, b);
            return (
              <span
                key={`z-${n}`}
                aria-hidden
                style={{
                  position: "absolute",
                  left: pz(m.x, 640),
                  top: pz(m.y, VHD),
                  transform: "translate(-50%, -50%)",
                  padding: "2px 9px",
                  backgroundColor: "var(--tellian-s2-bg, #281F33)",
                  fontFamily: serif,
                  fontSize: "15px",
                  fontWeight: "var(--tellian-ziffer-weight)" as unknown as number,
                  letterSpacing: "var(--tellian-ziffer-ls)",
                  color: C.muted,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {zf(n)}
              </span>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "18px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(184, 174, 163, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {inhalt.kanten.map((wortText, i) => (
            <p
              key={wortText}
              lang={sprache === "EN" ? "en" : "de"}
              style={{ margin: 0, display: "flex", alignItems: "baseline", gap: "12px" }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: serif,
                  fontSize: "15px",
                  fontWeight: "var(--tellian-ziffer-weight)" as unknown as number,
                  letterSpacing: "var(--tellian-ziffer-ls)",
                  color: C.muted,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {zf(i + 1)}
              </span>
              <span style={{ fontFamily: sans, fontSize: "13px", lineHeight: 1.5, letterSpacing: "0.02em", color: SILBER }}>
                {wortText}
              </span>
            </p>
          ))}
        </div>

        <div style={{ marginTop: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {(["sie", "bank"] as const).map((id) => (
            <p key={id} lang={sprache === "EN" ? "en" : "de"} style={{ margin: 0 }}>
              <span
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontFamily: sans,
                  fontSize: "12px",
                  letterSpacing: "0.04em",
                  color: SILBER_DIM,
                }}
              >
                {inhalt[id]}
              </span>
              <span style={{ fontFamily: sans, fontSize: "14px", lineHeight: 1.65, color: SILBER }}>{inhalt.prosa[id]}</span>
            </p>
          ))}
          <button
            type="button"
            onClick={() => onMandat?.()}
            className="tellian-dreieck-mandat tellian-cta-primaer"
            style={{
              alignSelf: "flex-start",
              margin: 0,
              padding: "13px 20px",
              border: "none",
              borderRadius: 0,
              minHeight: "var(--tellian-tippziel)",
              fontFamily: sans,
              fontSize: "13px",
              letterSpacing: "var(--tellian-ls-cta-klein)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {inhalt.prosa.tellian}
          </button>
        </div>

        <style>{`
          .tellian-dreieck-mandat { outline: none; }
          .tellian-dreieck-mandat:focus-visible {
            outline: 2px solid var(--tellian-muted);
            outline-offset: 4px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        role="group"
        aria-label={
          `${inhalt.sie} — ${inhalt.tellian}: ${inhalt.kanten[0]}. ` +
          `${inhalt.sie} — ${inhalt.bank}: ${inhalt.kanten[1]}. ` +
          `${inhalt.tellian} — ${inhalt.bank}: ${inhalt.kanten[2]}.`
        }
        style={{ position: "relative", width: "100%", aspectRatio: `640 / ${VH}` }}
      >
        <svg
          ref={linienSvgRef}
          viewBox={`0 0 640 ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
          focusable="false"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {[
            [K.sie, K.tellian],
            [K.sie, K.bank],
            [K.tellian, K.bank],
          ].map(([a, b], i) => (
            <line
              key={i}
              ref={(el) => {
                linienRefs.current[i] = el;
              }}
              {...kante(a, b)}
              stroke={C.muted}
              strokeWidth={1}
            />
          ))}
        </svg>

        {knoten("sie", K.sie, C.muted, null, <span aria-hidden style={rasterMotiv(publikumIcon.src, "40%", C.purple)} />, inhalt.sie)}
        {knoten(
          "tellian",
          K.tellian,
          C.purple,
          KONTUR_HELL,
          <img src={monogramm.src} width={monogramm.width} height={monogramm.height} alt="" aria-hidden style={{ width: "35%", height: "auto", display: "block" }} />,
          inhalt.tellian,
        )}
        {knoten("bank", K.bank, C.muted, null, <span aria-hidden style={rasterMotiv(bankgebaeudeIcon.src, "31.5%", C.purple)} />, inhalt.bank)}

        {wort(m1, inhalt.kanten[0], "rechts", false, inhalt.kantenZeilen[0])}
        {wort(m2, inhalt.kanten[1], "links", false, inhalt.kantenZeilen[1])}
        {wort(m3, inhalt.kanten[2], "oben", false, inhalt.kantenZeilen[2])}
      </div>

      <div aria-live="polite" style={{ position: "relative", marginTop: "10px", display: "grid" }}>
        {(["sie", "tellian", "bank"] as const).map((id) => (
          <p
            key={id}
            lang={sprache === "EN" ? "en" : "de"}
            style={{
              gridArea: "1 / 1",
              margin: 0,
              textAlign: "center",
              fontFamily: sans,
              fontSize: "var(--tellian-lauf-size)",
              lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
              color: C.bg,
              maxWidth: "46em",
              justifySelf: "center",
              visibility: aktiv === id ? "visible" : "hidden",
            }}
          >
            {inhalt.prosa[id]}
          </p>
        ))}
      </div>

      <style>{`
        .tellian-dreieck-knoten { outline: none; }
        .tellian-dreieck-knoten:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 4px;
        }
        .tellian-dreieck-knoten:hover { filter: brightness(1.06); }
      `}</style>
    </div>
  );
}
