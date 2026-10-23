"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { C, cormorant, sans, serif } from "@/tokens";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { useSectionEntered } from "./SectionEntry";
import { useTitelHoehe } from "./useTitelHoehe";
import type { Sprache } from "@/sections";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════════
   STATION 03 — IHRE VORTEILE (hell)

   Vier Punkte auf einem Ring. Die Beschriftungen stehen waagrecht
   auf einem gemeinsamen Radius; die Segmente zeichnen sich am
   Scroll (breit) bzw. reisen ins Dock (schmal).

   INHALTE aus Sanity (homepage → «3b. Vorteile»: advantagesHeading-
   Line1/2, advantagesSubtitle, advantagesItems[]). Der Ring hat fest
   vier Positionen; CMS-Punkte ersetzen den Punkt an derselben Stelle.
   Ohne CMS-Werte greift der Wortlaut des Redesigns.
   ═══════════════════════════════════════════════════════════ */

interface Punkt {
  titel: string;
  text: string;
}

interface StationInhalt {
  titel: readonly [string, string];
  untertitel: string;
  punkte: readonly Punkt[];
}

const INHALT: Readonly<Record<Sprache, StationInhalt>> = {
  DE: {
    titel: ["Tellian", "Ihre Vorteile"],
    untertitel: "Was Sie von uns erwarten dürfen.",
    punkte: [
      { titel: "Expertise", text: "Unsere Erfahrung und ein klarer Investmentprozess helfen uns, komplexe Märkte einzuordnen und Ihr Vermögen gezielt über Anlageklassen und Kapitalmärkte hinweg auszurichten. Diese Expertise bringen wir seit vielen Jahren auch als Jurymitglied der Swiss ETF Awards ein." },
      { titel: "Unabhängigkeit", text: "Wir sind weder an eigene Produkte noch an eine bestimmte Depotbank gebunden. So wählen wir Anlagen und Lösungen frei, objektiv und ausschliesslich in Ihrem Interesse." },
      { titel: "Transparenz", text: "Sie behalten jederzeit den Überblick über Ihr Vermögen. Klare Portfoliostrukturen und transparent ausgewiesene Gebühren sorgen für Nachvollziehbarkeit. Eine eigens entwickelte App steht Ihnen für den laufenden Überblick über Ihre Anlagen zur Verfügung. Zum Jahresende erhalten Sie zusätzlich einen auf Ihr Steuerdomizil abgestimmten Steuerauszug." },
      { titel: "Flexibilität", text: "Ihre Bedürfnisse geben die Richtung vor. Individuelle Lösungen, liquide Anlagen und jederzeitige Bezugsmöglichkeiten geben Ihnen die nötige Flexibilität. Ohne Kündigungsfristen bewahren Sie jederzeit Ihre Freiheit." },
    ],
  },
  EN: {
    titel: ["Tellian.", "Your Advantages."],
    untertitel: "What you can expect from us.",
    punkte: [
      { titel: "Expertise", text: "Our experience and disciplined investment process help us navigate complex markets and position your wealth across asset classes and global markets. For many years, we have also contributed this expertise as a member of the Swiss ETF Awards jury." },
      { titel: "Independence", text: "We are not tied to proprietary products or any particular custodian bank. This gives us the freedom to select investments and solutions objectively, with your interests at the centre of every decision." },
      { titel: "Transparency", text: "You retain a clear view of your portfolio, its performance and all associated fees. Our proprietary app provides secure access to your portfolio information whenever required. At year-end, you receive tax documentation tailored to your individual tax domicile." },
      { titel: "Flexibility", text: "Your needs set the direction. Tailored solutions, liquid investments and ready access to your assets provide the flexibility you require. With no notice periods, you retain the freedom to act at any time." },
    ],
  },
};

const N = 4;
const ziffer = (i: number) => String(i + 1).padStart(2, "0");

/* ── Geometrie ── */
const SCHRITT = 360 / N;
const VB = 200;
const MITTE = VB / 2;
const RADIUS = 88;
const winkel = (i: number) => -90 + i * SCHRITT;
const LUECKE = 7;
const rad = (g: number) => (g * Math.PI) / 180;
const punktAuf = (r: number, g: number) => ({
  x: MITTE + r * Math.cos(rad(g)),
  y: MITTE + r * Math.sin(rad(g)),
});

function bogen(i: number, luecke: number) {
  const halb = SCHRITT / 2 - luecke / 2;
  const a = punktAuf(RADIUS, winkel(i) - halb);
  const b = punktAuf(RADIUS, winkel(i) + halb);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export interface StationVorteileCms {
  advantagesHeadingLine1?: LocaleValue;
  advantagesHeadingLine2?: LocaleValue;
  advantagesSubtitle?: LocaleValue;
  advantagesItems?: { title?: LocaleValue; text?: LocaleValue }[] | null;
}

interface Props {
  isVertical?: boolean;
  domId?: string;
  sprache?: Sprache;
  /** CMS-Dokument (homepage) für Titel, Untertitel und die vier Punkte. */
  homepage?: StationVorteileCms | null;
  /** Steht die Station gerade im Bild? Beim Eintreten fällt das Rad
      auf den Ruhepunkt zurück. */
  istAktiv?: boolean;
  marke?: { nr: string; name: string };
}

const RUHE = 0;

export function StationVorteile({
  isVertical = false,
  domId,
  sprache = "DE",
  istAktiv = false,
  marke,
  homepage,
}: Props) {
  const { t } = useLanguage();
  const basis = INHALT[sprache];
  const cmsPunkte = homepage?.advantagesItems ?? [];
  const inhalt: StationInhalt = {
    titel: [
      t(homepage?.advantagesHeadingLine1, basis.titel[0]),
      t(homepage?.advantagesHeadingLine2, basis.titel[1]),
    ],
    untertitel: t(homepage?.advantagesSubtitle, basis.untertitel),
    /* Je Ringposition: CMS-Punkt an derselben Stelle, sonst Redesign. */
    punkte: basis.punkte.map((p, i) => ({
      titel: t(cmsPunkte[i]?.title, p.titel),
      text: t(cmsPunkte[i]?.text, p.text),
    })),
  };
  const PUNKTE = inhalt.punkte;
  const [aktiv, setAktiv] = useState<number>(RUHE);
  const knopfRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const betreten = useSectionEntered();
  void betreten;

  /* ── SCRUB-ZEICHNEN (breit): der Ring hängt am Scroll ── */
  const ringRef = useRef<SVGSVGElement | null>(null);
  const zeichenRefs = useRef<(SVGPathElement | null)[]>([]);
  const scrubRafRef = useRef(0);
  const scrubPRef = useRef(-1);

  useEffect(() => {
    if (isVertical) return;
    const svg = ringRef.current;
    if (!svg) return;

    const schreibe = (P: number) => {
      if (Math.abs(P - scrubPRef.current) < 0.0005) return;
      scrubPRef.current = P;
      for (let i = 0; i < N; i++) {
        const el = zeichenRefs.current[i];
        if (!el) continue;
        const p = Math.max(0, Math.min(1, P * N - i));
        el.style.strokeDashoffset = String(1 - p);
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      schreibe(1);
      return;
    }

    const ZUG_PRO_S = 0.7;
    let laeuft = false;
    let anzeigeP = 0;
    let letzteZeit = 0;
    const tick = (jetzt: number) => {
      if (!laeuft) return;
      const dt = letzteZeit ? Math.min((jetzt - letzteZeit) / 1000, 0.1) : 0;
      letzteZeit = jetzt;
      const r = svg.getBoundingClientRect();
      const sichtbar = window.innerWidth - r.left;
      const zielP = Math.max(0, Math.min(1, (sichtbar - r.width * 0.45) / (r.width * 0.55)));
      const delta = Math.max(-ZUG_PRO_S * dt, Math.min(ZUG_PRO_S * dt, zielP - anzeigeP));
      anzeigeP += delta;
      schreibe(anzeigeP);
      scrubRafRef.current = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (eintraege) => {
        const nah = eintraege.some((e) => e.isIntersecting);
        if (nah && !laeuft) {
          laeuft = true;
          letzteZeit = 0;
          scrubRafRef.current = requestAnimationFrame(tick);
        } else if (!nah && laeuft) {
          laeuft = false;
          cancelAnimationFrame(scrubRafRef.current);
          anzeigeP = 0;
          scrubPRef.current = -1;
          schreibe(0);
        }
      },
      { rootMargin: "0px 50% 0px 50%" },
    );
    io.observe(svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(scrubRafRef.current);
      laeuft = false;
    };
  }, [isVertical]);

  useEffect(() => {
    if (istAktiv) setAktiv(RUHE);
  }, [istAktiv]);

  /* ── SCHMAL: der mitreisende Ring ── */
  const ringSchmalRef = useRef<SVGSVGElement | null>(null);
  const ringHuelleRef = useRef<HTMLDivElement | null>(null);
  const dockLeisteRef = useRef<HTMLDivElement | null>(null);
  const dockAnkerRef = useRef<HTMLDivElement | null>(null);
  const dockSvgRef = useRef<SVGSVGElement | null>(null);
  const zeichenSchmalRefs = useRef<(SVGPathElement | null)[]>([]);
  const zeichenDockRefs = useRef<(SVGPathElement | null)[]>([]);
  const goldSchmalRefs = useRef<(SVGPathElement | null)[]>([]);
  const goldDockRefs = useRef<(SVGPathElement | null)[]>([]);
  const dockZifferRef = useRef<SVGTextElement | null>(null);
  const ziffernSchmalRefs = useRef<(SVGTextElement | null)[]>([]);
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);
  const schmalRafRef = useRef(0);

  useEffect(() => {
    if (!isVertical) return;
    const svg = ringSchmalRef.current;
    const huelle = ringHuelleRef.current;
    const leiste = dockLeisteRef.current;
    const dockSvg = dockSvgRef.current;
    if (!svg || !huelle || !leiste || !dockSvg) return;

    const klemme = (x: number) => Math.max(0, Math.min(1, x));

    let basisP = -1;
    const schreibeBasis = (p: number) => {
      if (Math.abs(p - basisP) < 0.0005) return;
      basisP = p;
      for (let i = 0; i < N; i++) {
        const q = klemme(p * N - i);
        const offset = String(1 - q);
        const a = zeichenSchmalRefs.current[i];
        if (a) a.style.strokeDashoffset = offset;
        const b = zeichenDockRefs.current[i];
        if (b) b.style.strokeDashoffset = offset;
      }
    };

    const goldStand = [-1, -1, -1, -1];
    const schreibeGold = (i: number, q: number) => {
      if (Math.abs(q - goldStand[i]) < 0.003) return;
      goldStand[i] = q;
      const offset = String(1 - q);
      const a = goldSchmalRefs.current[i];
      if (a) a.style.strokeDashoffset = offset;
      const b = goldDockRefs.current[i];
      if (b) b.style.strokeDashoffset = offset;
      const z = ziffernSchmalRefs.current[i];
      if (z) z.style.fill = q > 0.02 ? "var(--tellian-r4-arc-active-color)" : "var(--tellian-r4-accent)";
    };

    let kopfUnterkante = 56;
    const messeKopf = () => {
      const kopfEl = document.querySelector("header");
      kopfUnterkante = kopfEl ? Math.max(0, kopfEl.getBoundingClientRect().bottom) : 56;
      const anker = dockAnkerRef.current;
      if (anker) anker.style.top = `${kopfUnterkante}px`;
    };
    messeKopf();
    window.addEventListener("resize", messeKopf);
    const kopfPx = () => kopfUnterkante;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ZUG_PRO_S = 0.7;
    let laeuft = false;
    let anzeigeP = rm ? 1 : 0;
    let letzteZeit = 0;
    if (rm) schreibeBasis(1);

    const tick = (jetzt: number) => {
      if (!laeuft) return;
      const vh = window.innerHeight;
      const rw = huelle.getBoundingClientRect();

      if (!rm) {
        const dt = letzteZeit ? Math.min((jetzt - letzteZeit) / 1000, 0.1) : 0;
        letzteZeit = jetzt;
        const ziel = klemme((vh - rw.top) / (vh * 0.65));
        const delta = Math.max(-ZUG_PRO_S * dt, Math.min(ZUG_PRO_S * dt, ziel - anzeigeP));
        anzeigeP += delta;
        schreibeBasis(anzeigeP);
      }

      const lesezone = vh * 0.55;
      let aktivI = -1;
      for (let i = 0; i < N; i++) {
        const li = liRefs.current[i];
        if (!li) continue;
        const lr = li.getBoundingClientRect();
        schreibeGold(i, lr.height > 0 ? klemme((lesezone - lr.top) / lr.height) : 0);
        if (lr.top < lesezone) aktivI = i;
      }
      const dz = dockZifferRef.current;
      if (dz) {
        const soll = aktivI >= 0 ? ziffer(aktivI) : "";
        if (dz.textContent !== soll) dz.textContent = soll;
      }

      const kopf = kopfPx();
      if (rm) {
        leiste.style.opacity = rw.bottom < kopf + 70 ? "1" : "0";
      } else {
        const start = kopf + 210;
        const zielTop = kopf + 12;
        const H = klemme((start - rw.top) / (start - zielTop));
        leiste.style.opacity = H.toFixed(3);
        if (H > 0) {
          const dr = dockSvg.getBoundingClientRect();
          const dx = dr.left + dr.width / 2 - (rw.left + rw.width / 2);
          const dy = dr.top + dr.height / 2 - (rw.top + rw.height / 2);
          const S = svg.clientWidth > 0 ? dr.width / svg.clientWidth : 0.24;
          svg.style.transform =
            "translate(" + (dx * H).toFixed(1) + "px, " + (dy * H).toFixed(1) +
            "px) scale(" + (1 + (S - 1) * H).toFixed(3) + ")";
          svg.style.opacity = (1 - klemme((H - 0.7) / 0.3)).toFixed(3);
        } else {
          svg.style.transform = "none";
          svg.style.opacity = "1";
        }
      }

      schmalRafRef.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (eintraege) => {
        const nah = eintraege.some((e) => e.isIntersecting);
        if (nah && !laeuft) {
          laeuft = true;
          letzteZeit = 0;
          schmalRafRef.current = requestAnimationFrame(tick);
        } else if (!nah && laeuft) {
          laeuft = false;
          cancelAnimationFrame(schmalRafRef.current);
          if (!rm) {
            anzeigeP = 0;
            basisP = -1;
            schreibeBasis(0);
          }
          for (let i = 0; i < N; i++) schreibeGold(i, 0);
          svg.style.transform = "none";
          svg.style.opacity = "1";
          leiste.style.opacity = "0";
        }
      },
      { rootMargin: "30% 0px 30% 0px" },
    );
    io.observe(svg.closest("section") ?? svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(schmalRafRef.current);
      window.removeEventListener("resize", messeKopf);
    };
  }, [isVertical]);

  const beiTaste = useCallback(
    (e: React.KeyboardEvent, i: number, liste: React.RefObject<(HTMLElement | SVGElement | null)[]>) => {
      const schritte: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        const ziel = e.key === "Home" ? 0 : N - 1;
        setAktiv(ziel);
        (liste.current?.[ziel] as HTMLElement | undefined)?.focus();
        return;
      }
      const d = schritte[e.key];
      if (d === undefined) return;
      e.preventDefault();
      const ziel = (i + d + N) % N;
      setAktiv(ziel);
      (liste.current?.[ziel] as HTMLElement | undefined)?.focus();
    },
    [],
  );

  const tabPunkt = aktiv;

  const erklaerung = (
    <div
      aria-live="polite"
      style={{
        width: "var(--tellian-r4-box-width)",
        maxWidth: "100%",
        backgroundColor: "var(--tellian-r4-box-bg)",
        border: "1px solid rgba(184, 174, 163, 0.35)",
        borderRadius: 0,
        padding: "var(--tellian-r4-box-pad-y) var(--tellian-r4-box-pad-x)",
        boxSizing: "border-box",
        display: "grid",
        textAlign: "center",
      }}
    >
      {PUNKTE.map((p, i) => (
        <div key={p.titel} style={{ gridArea: "1 / 1", visibility: i === aktiv ? "visible" : "hidden" }}>
          <span
            style={{
              display: "block",
              fontFamily: cormorant,
              fontSize: "var(--tellian-r4-title-size)",
              fontWeight: 600,
              lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
              color: "var(--tellian-muted)",
            }}
          >
            {p.titel}
          </span>
          <span
            style={{
              display: "block",
              marginTop: "8px",
              fontFamily: sans,
              fontSize: "var(--tellian-r4-body-size)",
              lineHeight: "var(--tellian-r4-body-leading)",
              color: "var(--tellian-r4-accent)",
            }}
          >
            {p.text}
          </span>
        </div>
      ))}
    </div>
  );

  const { wurzelRef, oben: kopfOben } = useTitelHoehe(!isVertical);

  const kopf = (
    <div>
      <h2
        style={{
          margin: 0,
          fontFamily: serif,
          fontSize: "var(--tellian-r4-heading-size)",
          fontWeight: 400,
          lineHeight: "var(--tellian-r4-heading-leading)" as unknown as number,
          letterSpacing: "var(--tellian-r4-heading-tracking)",
          color: "var(--tellian-r4-ink)",
        }}
      >
        {inhalt.titel[0]}
        <br />
        <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{inhalt.titel[1]}</em>
      </h2>
      <p
        style={{
          margin: "12px 0 0",
          fontFamily: serif,
          fontSize: "var(--tellian-r4-unter-size)",
          lineHeight: 1.3,
          color: "var(--tellian-muted)",
        }}
      >
        {inhalt.untertitel}
      </p>
    </div>
  );

  const stil = (
    <style>{`
      .tellian-r4-punkt:focus-visible,
      .tellian-r4-treffer:focus-visible {
        outline: 2px solid var(--tellian-r4-focus);
        outline-offset: 4px;
      }
      .tellian-r4-treffer:focus-visible { stroke: var(--tellian-r4-focus); stroke-opacity: 0.35; }
      .tellian-r4-treffer { cursor: pointer; pointer-events: stroke; }
      @media (prefers-reduced-motion: reduce) {
        .tellian-r4-seg, .tellian-r4-punkt { transition: none !important; }
      }
    `}</style>
  );

  /* ── SCHMAL ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-r4-bg)",
          paddingTop: "var(--tellian-abschnitt-luft-schmal)",
          paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
          paddingLeft: "clamp(20px, 6vw, 48px)",
          paddingRight: "clamp(20px, 6vw, 48px)",
        }}
      >
        {marke && (
          <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
            <Kapitelmarke nr={marke.nr} name={marke.name} />
          </div>
        )}
        <Aufgang>{kopf}</Aufgang>

        <div
          ref={dockAnkerRef}
          style={{
            position: "sticky",
            top: "var(--tellian-kopf-height)",
            zIndex: 3,
            height: 0,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div
            ref={dockLeisteRef}
            style={{
              margin: "0 calc(-1 * clamp(20px, 6vw, 48px))",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "clamp(20px, 6vw, 48px)",
              backgroundColor: "var(--tellian-r4-bg)",
              borderBottom: "1px solid rgba(25, 23, 24, 0.08)",
              opacity: 0,
            }}
          >
            <svg
              ref={dockSvgRef}
              viewBox={`0 0 ${VB} ${VB}`}
              aria-hidden
              focusable="false"
              style={{ width: "48px", height: "48px", overflow: "visible" }}
            >
              {PUNKTE.map((p, i) => (
                <path
                  key={`dock-${p.titel}`}
                  ref={(el) => {
                    zeichenDockRefs.current[i] = el;
                  }}
                  d={bogen(i, LUECKE)}
                  fill="none"
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1}
                  stroke="var(--tellian-r4-arc-idle-color)"
                  strokeWidth={7}
                />
              ))}
              {PUNKTE.map((p, i) => (
                <path
                  key={`dock-gold-${p.titel}`}
                  ref={(el) => {
                    goldDockRefs.current[i] = el;
                  }}
                  d={bogen(i, LUECKE)}
                  fill="none"
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1}
                  stroke="var(--tellian-r4-arc-active-color)"
                  strokeWidth={18}
                />
              ))}
              <text
                ref={dockZifferRef}
                x={MITTE}
                y={MITTE}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={cormorant}
                fontSize="66"
                letterSpacing="0.06em"
                fill="var(--tellian-r4-ink)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              />
            </svg>
          </div>
        </div>

        <div
          ref={ringHuelleRef}
          style={{
            marginTop: "clamp(30px, 4.5vh, 48px)",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <svg
            ref={ringSchmalRef}
            viewBox={`0 0 ${VB} ${VB}`}
            aria-hidden
            focusable="false"
            style={{
              width: "clamp(190px, 56vw, 270px)",
              height: "auto",
              overflow: "visible",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            {PUNKTE.map((p, i) => (
              <path
                key={p.titel}
                ref={(el) => {
                  zeichenSchmalRefs.current[i] = el;
                }}
                className="tellian-r4-seg"
                d={bogen(i, LUECKE)}
                fill="none"
                strokeLinecap="butt"
                pointerEvents="none"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
                stroke="var(--tellian-r4-arc-idle-color)"
                strokeWidth="var(--tellian-r4-arc-idle)"
              />
            ))}
            {PUNKTE.map((p, i) => (
              <path
                key={`gold-${p.titel}`}
                ref={(el) => {
                  goldSchmalRefs.current[i] = el;
                }}
                d={bogen(i, LUECKE)}
                fill="none"
                strokeLinecap="butt"
                pointerEvents="none"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
                stroke="var(--tellian-r4-arc-active-color)"
                strokeWidth="var(--tellian-r4-arc-active)"
              />
            ))}
            {PUNKTE.map((p, i) => {
              const pos = punktAuf(RADIUS + 26, winkel(i));
              return (
                <text
                  key={`ziffer-${p.titel}`}
                  ref={(el) => {
                    ziffernSchmalRefs.current[i] = el;
                  }}
                  x={pos.x.toFixed(2)}
                  y={pos.y.toFixed(2)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily={cormorant}
                  fontSize="13"
                  letterSpacing="0.08em"
                  fill="var(--tellian-r4-accent)"
                  style={{ transition: "fill 220ms ease" }}
                >
                  {ziffer(i)}
                </text>
              );
            })}
          </svg>
        </div>

        <ol
          style={{
            listStyle: "none",
            margin: "clamp(28px, 4vh, 44px) 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "clamp(26px, 3.6vh, 40px)",
          }}
        >
          {PUNKTE.map((p, i) => (
            <li
              key={p.titel}
              ref={(el) => {
                liRefs.current[i] = el;
              }}
              style={{
                borderTop: i === 0 ? "none" : "1px solid rgba(25, 23, 24, 0.12)",
                paddingTop: i === 0 ? 0 : "clamp(26px, 3.6vh, 40px)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: cormorant,
                  fontSize: "var(--tellian-r4-numeral-size)",
                  color: "var(--tellian-r4-accent)",
                  letterSpacing: "0.08em",
                }}
              >
                {ziffer(i)}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontFamily: cormorant,
                  fontSize: "var(--tellian-r4-title-size)",
                  fontWeight: 600,
                  lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
                  color: "var(--tellian-r4-ink)",
                }}
              >
                {p.titel}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontFamily: sans,
                  fontSize: "var(--tellian-r4-body-size)",
                  lineHeight: "var(--tellian-r4-body-leading)",
                  color: "var(--tellian-r4-accent)",
                }}
              >
                {p.text}
              </span>
            </li>
          ))}
        </ol>
        {stil}
      </section>
    );
  }

  /* ── BREIT ── */
  const ANKER = 0.505;
  const platz = (i: number) => {
    const g = winkel(i);
    const oben = i === 0;
    const unten = i === N / 2;
    return {
      oben,
      unten,
      rechts: !oben && !unten && Math.cos(rad(g)) > 0,
      dx: ANKER * Math.cos(rad(g)),
      dy: ANKER * Math.sin(rad(g)),
    };
  };

  return (
    <div
      id={domId}
      ref={(el) => {
        wurzelRef.current = el;
      }}
      className="flex-shrink-0 h-screen relative"
      style={{ width: "var(--tellian-r4-section-width)", backgroundColor: C.bg }}
      data-tellian-station="2"
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "var(--tellian-r4-bg)" }} />

      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          paddingLeft: "var(--tellian-r4-pad-left)",
          paddingRight: "clamp(24px, 3vw, 56px)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "var(--tellian-r4-heading-left)",
            ...(kopfOben === null ? { top: "50%", transform: "translateY(-50%)" } : { top: `${kopfOben}px` }),
          }}
        >
          {kopf}
        </div>

        <div
          onMouseLeave={(e) => {
            if (!e.currentTarget.contains(document.activeElement)) setAktiv(RUHE);
          }}
          style={{
            position: "absolute",
            left: "var(--tellian-r4-block-center)",
            top: "calc(50% - var(--tellian-r4-mitte-versatz))",
            transform: "translate(-50%, -50%)",
            width: "var(--tellian-r4-block)",
            height: "calc(var(--tellian-r4-wheel) + 2 * var(--tellian-r4-label-row))",
            flexShrink: 0,
          }}
        >
          <svg
            ref={ringRef}
            viewBox={`0 0 ${VB} ${VB}`}
            aria-hidden
            focusable="false"
            style={{
              position: "absolute",
              left: "50%",
              top: "var(--tellian-r4-label-row)",
              transform: "translateX(-50%)",
              width: "var(--tellian-r4-wheel)",
              height: "var(--tellian-r4-wheel)",
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            {PUNKTE.map((p, i) => {
              const an = i === aktiv;
              return (
                <path
                  key={p.titel}
                  ref={(el) => {
                    zeichenRefs.current[i] = el;
                  }}
                  className="tellian-r4-seg"
                  d={bogen(i, LUECKE)}
                  fill="none"
                  strokeLinecap="butt"
                  pointerEvents="none"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1}
                  stroke={an ? "var(--tellian-r4-arc-active-color)" : "var(--tellian-r4-arc-idle-color)"}
                  strokeWidth={an ? "var(--tellian-r4-arc-active)" : "var(--tellian-r4-arc-idle)"}
                  style={{ transition: "stroke 220ms ease, stroke-width 220ms ease" }}
                />
              );
            })}

            {PUNKTE.map((p, i) => (
              <path
                key={`treffer-${p.titel}`}
                ref={(el) => {
                  segRefs.current[i] = el;
                }}
                className="tellian-r4-treffer"
                d={bogen(i, 0)}
                fill="none"
                stroke="transparent"
                strokeWidth={24}
                pointerEvents="stroke"
                role="tab"
                aria-selected={i === aktiv}
                aria-label={`${ziffer(i)} ${p.titel}`}
                tabIndex={i === tabPunkt ? 0 : -1}
                onKeyDown={(e) => beiTaste(e, i, segRefs)}
                onFocus={() => setAktiv(i)}
                onMouseEnter={() => setAktiv(i)}
                onClick={() => setAktiv(i)}
              />
            ))}
          </svg>

          {PUNKTE.map((p, i) => {
            const s = platz(i);
            const an = i === aktiv;
            const gemeinsam: React.CSSProperties = {
              position: "absolute",
              background: "transparent",
              border: "none",
              padding: "4px 2px",
              cursor: "pointer",
              fontFamily: sans,
              fontSize: "var(--tellian-r4-label-size)",
              lineHeight: 1.3,
              color: an ? "var(--tellian-r4-ink)" : "var(--tellian-r4-ink-dim)",
              transition: "color 200ms ease",
              whiteSpace: "normal",
            };
            const x = `calc(50% + ${s.dx.toFixed(4)} * var(--tellian-r4-wheel))`;
            const y = `calc(50% + ${s.dy.toFixed(4)} * var(--tellian-r4-wheel))`;
            const lage: React.CSSProperties = s.oben
              ? { left: x, top: y, transform: "translate(-50%, -100%)", textAlign: "center", maxWidth: "var(--tellian-r4-label-col)" }
              : s.unten
                ? { left: x, top: y, transform: "translate(-50%, 0)", textAlign: "center", maxWidth: "var(--tellian-r4-label-col)" }
                : s.rechts
                  ? { left: x, top: y, transform: "translate(0, -50%)", textAlign: "left", maxWidth: "var(--tellian-r4-label-col)" }
                  : { left: x, top: y, transform: "translate(-100%, -50%)", textAlign: "right", maxWidth: "var(--tellian-r4-label-col)" };

            return (
              <button
                key={p.titel}
                ref={(el) => {
                  knopfRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={an}
                tabIndex={i === tabPunkt ? 0 : -1}
                onKeyDown={(e) => beiTaste(e, i, knopfRefs)}
                onMouseEnter={() => setAktiv(i)}
                onFocus={() => setAktiv(i)}
                onClick={() => setAktiv(i)}
                className="tellian-r4-punkt"
                style={{ ...gemeinsam, ...lage }}
              >
                <span
                  style={{
                    fontFamily: cormorant,
                    fontSize: "var(--tellian-r4-numeral-size)",
                    color: "var(--tellian-r4-accent)",
                    letterSpacing: "0.08em",
                    marginRight: "8px",
                  }}
                >
                  {ziffer(i)}
                </span>
                {p.titel}
              </button>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            left: "var(--tellian-r4-block-center)",
            transform: "translateX(-50%)",
            top: "calc(50% - var(--tellian-r4-mitte-versatz) + var(--tellian-r4-wheel) / 2 + var(--tellian-r4-label-row) + var(--tellian-r4-box-gap))",
            width: "var(--tellian-r4-box-width)",
            maxWidth: "100%",
          }}
        >
          {erklaerung}
        </div>
      </div>

      {stil}
    </div>
  );
}
