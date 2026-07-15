import { useState, useEffect, useRef, useCallback } from "react";
import { HeroExpandingImage, ScrollFade } from "./ScrollAnimations";
import { ExpandableBody } from "./ExpandableBody";
import sardonaImg from "@/assets/sardona-1.jpg";
import { LAYOUT, getLayout, getTextColumnStyle, SPACING } from "../layout";
import type { Breakpoint } from "./useBreakpoint";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

import { C, serif, sans, cormorant } from "@/tokens";
import { EASE, DURATION } from "@/styles/motion";

interface Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: Breakpoint;
  homepage?: any;
}

const FALLBACK_BODY = [
  "Tellian Capital verwaltet Vermögen nach einem quantitativen Prozess. Was wir kaufen oder verkaufen, ergibt sich aus Daten und Modellen, die wir laufend prüfen. Die Stimmung an den Märkten oder die Schlagzeile der Woche ändert daran nichts.",
];

/* ─── Leistungsethik values (not CMS-driven — new to this design) ─── */
const VALUES = [
  {
    de: "Ehrlichkeit",
    en: "Integrity",
    readoutDe: "Wir benennen Chancen und Risiken so, wie sie sind.",
    readoutEn: "We name opportunities and risks as they are.",
    inactiveSize: "22px",
    mobileSize: "22px",
    offset: "0%",
    mobileOffset: "0px",
  },
  {
    de: "Disziplin",
    en: "Discipline",
    readoutDe: "Wir halten uns an den Prozess, auch wenn es unbequem wird.",
    readoutEn: "We stick to the process, even when it gets uncomfortable.",
    inactiveSize: "19px",
    mobileSize: "19px",
    offset: "4%",
    mobileOffset: "8px",
  },
  {
    de: "Respekt",
    en: "Respect",
    readoutDe: "Jedes Mandat zählt gleich viel, unabhängig von seiner Grösse.",
    readoutEn: "Every mandate counts the same, whatever its size.",
    inactiveSize: "20px",
    mobileSize: "20px",
    offset: "8%",
    mobileOffset: "16px",
  },
  {
    de: "Leistungsbereitschaft",
    en: "Commitment",
    readoutDe: "Wir arbeiten am Portfolio weiter, nicht nur zum Quartalsende.",
    readoutEn: "We keep working on the portfolio, not just at quarter-end.",
    inactiveSize: "18px",
    mobileSize: "18px",
    offset: "2%",
    mobileOffset: "4px",
  },
  {
    de: "Unabhängigkeit",
    en: "Independence",
    readoutDe: "Unsere Analyse ist unsere eigene, ohne fremde Interessen.",
    readoutEn: "Our analysis is our own, free of outside interests.",
    inactiveSize: "21px",
    mobileSize: "20px",
    offset: "12%",
    mobileOffset: "12px",
  },
  {
    de: "Entschlossenheit",
    en: "Resolve",
    readoutDe: "Tragen die Daten eine Position, dann halten wir sie.",
    readoutEn: "When the data backs a position, we hold it.",
    inactiveSize: "19px",
    mobileSize: "19px",
    offset: "6%",
    mobileOffset: "6px",
  },
];

/* ═══════════════════════════════════════════════════════════════
   LEISTUNGSETHIK STAGE — Typographic composition
   ═══════════════════════════════════════════════════════════════ */
const ROW_H = 40;

interface StageProps {
  compact?: boolean;
  /** CMS-resolved label + per-value overrides (falls back to the bundled German copy when absent) */
  label?: string;
  overrides?: { label: string; readout: string }[];
  lang?: "de" | "en";
}

function LeistungsethikStage({ compact = false, label, overrides, lang = "de" }: StageProps) {
  const [active, setActive] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useRef(true);

  /* ── Viewport observer — pause cycle off-screen ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        isInView.current = entry.isIntersecting;
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Auto-cycle ── */
  const startCycle = useCallback(() => {
    if (reducedMotion) return;
    if (cycleTimer.current) clearInterval(cycleTimer.current);
    cycleTimer.current = setInterval(() => {
      if (!isInView.current) return;
      setActive((p) => (p + 1) % VALUES.length);
    }, DURATION.valueCycle);
  }, [reducedMotion]);

  const stopCycle = useCallback(() => {
    if (cycleTimer.current) {
      clearInterval(cycleTimer.current);
      cycleTimer.current = null;
    }
  }, []);

  const handleInteract = useCallback(
    (i: number) => {
      setActive(i);
      stopCycle();
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      pauseTimer.current = setTimeout(() => startCycle(), DURATION.valueCyclePause);
    },
    [stopCycle, startCycle],
  );

  useEffect(() => {
    if (!reducedMotion) startCycle();
    return () => {
      stopCycle();
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [reducedMotion, startCycle, stopCycle]);

  /* ── Keyboard ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (active + 1) % VALUES.length;
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (active - 1 + VALUES.length) % VALUES.length;
      e.preventDefault();
    }
    if (next !== active) handleInteract(next);
  };

  const transition = reducedMotion
    ? "none"
    : `font-size ${DURATION.medium}ms ${EASE.standard}, color ${DURATION.medium}ms ${EASE.standard}`;

  const activeSize = compact ? "clamp(26px, 6vw, 34px)" : "clamp(26px, 2.4vw, 36px)";

  return (
    <div ref={containerRef}>
      {/* Micro-label eyebrow */}
      <div style={{ width: "28px", height: "1.5px", backgroundColor: C.dark }} />
      <span
        style={{
          fontFamily: sans,
          fontSize: compact ? "10px" : "11px",
          letterSpacing: "0.2em",
          color: C.stone,
          textTransform: "uppercase",
          display: "block",
          marginTop: "16px",
        }}
      >
        {label || "Unsere Leistungsethik"}
      </span>

      {/* Values composition */}
      <div
        role="listbox"
        aria-label="Unsere Leistungsethik"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          marginTop: compact ? "20px" : "18px",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          gap: compact ? "4px" : "2px",
        }}
      >
        {VALUES.map((v, i) => {
          const isAct = active === i;
          return (
            <div
              key={i}
              role="option"
              aria-selected={isAct}
              tabIndex={-1}
              onMouseEnter={() => {
                if (!compact) handleInteract(i);
              }}
              onFocus={() => handleInteract(i)}
              onClick={() => handleInteract(i)}
              style={{
                minHeight: `${ROW_H}px`,
                paddingLeft: compact ? v.mobileOffset : v.offset,
                display: "flex",
                alignItems: "center",
                overflow: "visible",
                position: "relative",
                zIndex: isAct ? 1 : 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: cormorant,
                  fontSize: isAct ? activeSize : compact ? v.mobileSize : v.inactiveSize,
                  fontWeight: isAct ? 500 : 300,
                  color: isAct ? C.ink : C.greigeSoft,
                  lineHeight: 1.1,
                  transition,
                  userSelect: "none",
                  whiteSpace: compact ? "normal" : "nowrap",
                  wordBreak: compact ? "normal" : undefined,
                  hyphens: compact ? "auto" : undefined,
                }}
                lang={lang}
              >
                {overrides?.[i]?.label ?? v.de}
              </span>
            </div>
          );
        })}
      </div>

      {/* Readout / companion line */}
      <div
        aria-live="polite"
        style={{
          minHeight: compact ? "48px" : "30px",
          marginTop: compact ? "16px" : "10px",
        }}
      >
        <p
          key={active}
          style={{
            fontFamily: sans,
            fontSize: compact ? "13px" : "12px",
            fontStyle: "italic",
            color: C.charcoal,
            lineHeight: 1.5,
            margin: 0,
            animation: reducedMotion ? "none" : `stageReadoutFade ${DURATION.normal}ms ${EASE.standard}`,
          }}
        >
          {overrides?.[active]?.readout ?? VALUES[active].readoutDe}
        </p>
      </div>

      <style>{`
        @keyframes stageReadoutFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — ANLAGEPHILOSOPHIE
   ═══════════════════════════════════════════════════════════════ */
export function Section2Anlagephilosophie({
  scrollX,
  isVertical = false,
  breakpoint = "desktop",
  homepage,
}: Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const { t, lang } = useLanguage();

  const eyebrow = t(homepage?.philosophyEyebrow, "Anlagephilosophie");
  const headingLine1 = t(homepage?.philosophyHeadingLine1, "Analyse entscheidet.");
  const headingLine2 = t(homepage?.philosophyHeadingLine2, "Nicht Stimmung.");
  const cmsParagraphs: string[] = (homepage?.philosophyParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const BODY_PARAGRAPHS = cmsParagraphs.length > 0 ? cmsParagraphs : FALLBACK_BODY;

  /* Background image: prefer uploaded asset, then external URL, then bundled fallback */
  const imageSrc: string =
    homepage?.philosophyImageAsset?.url || homepage?.philosophyImageUrl || sardonaImg.src;
  const imageAlt = t(
    homepage?.philosophyImageAlt,
    "Tektonikarena Sardona — UNESCO-Welterbe im Kanton Glarus.",
  );

  /* ── Leistungsethik values: CMS text merged with the bundled fallback,
        sizing/offset stay index-driven (not editor-controlled). ── */
  const valuesLabel = t(homepage?.philosophyValuesLabel, "Unsere Leistungsethik");
  type CmsValue = { name?: LocaleValue; readout?: LocaleValue };
  const cmsValues: CmsValue[] = homepage?.philosophyValues ?? [];
  const valueOverrides = VALUES.map((fb, i) => {
    const cms = cmsValues[i];
    return {
      label: t(cms?.name, fb.de),
      readout: t(cms?.readout, fb.readoutDe),
    };
  });

  /* ── VERTICAL (Tablet / Mobile) ── */
  if (isVertical) {
    return (
      <section id="section-anlagephilosophie" style={{ backgroundColor: C.bg }}>
        {/* Text content — comes FIRST on mobile/tablet */}
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize:
                  breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              {headingLine1}
              <br />
              <em>{headingLine2}</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody }}>
              <ExpandableBody
                paragraphs={BODY_PARAGRAPHS}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>

          {/* Leistungsethik Stage */}
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <div style={{ marginTop: "36px", paddingBottom: "24px" }}>
              <LeistungsethikStage compact label={valuesLabel} overrides={valueOverrides} lang={lang} />
            </div>
          </ScrollFade>
        </div>

        {/* Image — clean, no overlay */}
        <div
          style={{
            width: "100%",
            height: breakpoint === "mobile" ? "60vh" : "55vh",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      </section>
    );
  }

  /* ── DESKTOP (horizontal) ── */
  return (
    <div
      className="relative h-screen flex-shrink-0"
      style={{ width: "110vw", backgroundColor: C.bg }}
    >
      {/* Image — right, narrowed to give the text column more room */}
      <div className="absolute z-0" style={{ top: 0, bottom: 0, left: "54vw", right: 0 }}>
        <HeroExpandingImage src={imageSrc} scrollX={scrollX} className="h-full w-full" />
      </div>

      {/* Left column — eyebrow + headline + body + Leistungsethik, vertically centered.
          width (52vw) is deliberately narrower than the image's left offset (54vw) so the
          column never overlaps the image at tablet-landscape widths (~1024–1350px); at
          1440px+ maxWidth remains the governing constraint, so this is visually unchanged there. */}
      <div
        className="relative z-10 flex h-full flex-col justify-center"
        style={{
          width: "52vw",
          paddingLeft: "clamp(36px, 8vw, 120px)",
          paddingRight: "clamp(36px, 5vw, 80px)",
          maxWidth: "calc(600px + clamp(36px, 5vw, 120px) + 4vw)",
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.22em",
            color: C.stone,
            display: "block",
          }}
          className="uppercase"
        >
          {eyebrow}
        </span>

        {/* Eyebrow divider */}
        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.dark,
            marginTop: SPACING.eyebrowToAccent,
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: serif,
            fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94,
            color: C.dark,
            letterSpacing: "-0.03em",
            marginTop: SPACING.accentToHeadline,
          }}
        >
          {headingLine1}
       
        </h2>

        {/* Body */}
        <div
          style={{
            marginTop: SPACING.headlineToBody,
            maxWidth: "560px",
            display: "flex",
            flexDirection: "column",
            gap: SPACING.bodyParagraphGap,
          }}
        >
          {BODY_PARAGRAPHS.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans,
                fontSize: "clamp(10.5px, 1.3vh, 12.5px)",
                color: C.charcoal,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}
        </div>

        {/* Leistungsethik Stage */}
        <div style={{ marginTop: SPACING.bodyToCta }}>
          <LeistungsethikStage label={valuesLabel} overrides={valueOverrides} lang={lang} />
        </div>
      </div>
    </div>
  );
}
