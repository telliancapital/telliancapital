"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

const serif = "var(--font-cormorant), serif";
const sans = "var(--font-inter), sans-serif";

/* ─── Accent line + text row ─── */
function AccentRow({ text, lineColor }: { text: string; lineColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div
        style={{
          width: "16px",
          height: "1px",
          backgroundColor: lineColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: sans,
          fontSize: "clamp(13px, 3.5vw, 15px)",
          color: "#8A857C",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
}

interface Props {
  scrollX: number;
  isVertical?: boolean;
  /** When true (Anlagestrategien subpage open), the FLIP'd headlines unmount
   *  so the subpage's detail instances become the Framer Motion targets. */
  isDetailMode?: boolean;
  homepage?: any;
}

export function Section4TopDownBottomUp({
  scrollX,
  isVertical = false,
  isDetailMode = false,
  homepage,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const enableFlip = !isVertical && !reducedMotion;
  const { t } = useLanguage();

  /* ── Localized copy from CMS (fallbacks preserve original German) ── */
  const topDownEyebrow = t(homepage?.strategyTopDownEyebrow, "Globale Perspektive");
  const topDownTitle = t(homepage?.strategyTopDownTitle, "Top-Down");
  const topDownFallback = [
    "Makroindikatoren und Konjunkturzyklen",
    "Systematische Bewertung der Anlageklassen",
    "Strategischer Horizont: 3–5 Jahre",
  ];
  const topDownBullets: string[] = (() => {
    const cms: LocaleValue[] = homepage?.strategyTopDownBullets ?? [];
    const resolved = cms.map((b) => t(b, "")).filter((s) => s.length > 0);
    const merged = [...resolved];
    while (merged.length < 3) merged.push(topDownFallback[merged.length]);
    return merged.slice(0, 3);
  })();

  const decisionLabel = t(homepage?.strategyDecisionLabel, "Anlageentscheid");
  const committeeLabel = t(homepage?.strategyCommitteeLabel, "Anlagekomitee");

  const bottomUpTitle = t(homepage?.strategyBottomUpTitle, "Bottom-Up");
  const bottomUpEyebrow = t(homepage?.strategyBottomUpEyebrow, "Einzeltitel-Perspektive");
  const bottomUpFallback = [
    "Quantitative Modelle und Datenanalyse",
    "Technische Analyse und Marktpsychologie",
    "Kurzfristige Trends und Opportunitäten",
  ];
  const bottomUpBullets: string[] = (() => {
    const cms: LocaleValue[] = homepage?.strategyBottomUpBullets ?? [];
    const resolved = cms.map((b) => t(b, "")).filter((s) => s.length > 0);
    const merged = [...resolved];
    while (merged.length < 3) merged.push(bottomUpFallback[merged.length]);
    return merged.slice(0, 3);
  })();

  useEffect(() => {
    if (visible || !panelRef.current) return;

    if (isVertical) {
      // Vertical: use IntersectionObserver
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible(true);
        },
        { threshold: 0.15 },
      );
      observer.observe(panelRef.current);
      return () => observer.disconnect();
    }

    const rect = panelRef.current.getBoundingClientRect();
    if (rect.left < window.innerWidth) setVisible(true);
  }, [scrollX, visible, isVertical]);

  return (
    <div
      ref={panelRef}
      className={isVertical ? "" : "absolute z-0"}
      style={
        isVertical
          ? {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: visible ? 1 : 0,
              transition: "opacity 600ms ease-out",
              backgroundColor: "#F9F9F7",
              padding: "24px",
            }
          : {
              top: 0,
              bottom: 0,
              left: "44vw",
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: visible ? 1 : 0,
              transition: "opacity 600ms ease-out",
            }
      }
    >
      {/* ── Contained block: mobile uses full viewport width + natural height ── */}
      <div
        style={{
          width: isVertical ? "100%" : "clamp(460px, 34vw, 540px)",
          maxWidth: isVertical ? "540px" : undefined,
          display: "flex",
          flexDirection: "column",
          height: isVertical ? "auto" : "72vh",
          minHeight: isVertical ? undefined : "480px",
          maxHeight: isVertical ? undefined : "680px",
        }}
      >
        {/* ════════════════════════════════════════════════
            OBERE ZONE — dunkel, Inhalt unten verankert
            ════════════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1A1916",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "clamp(24px, 6vw, 44px) clamp(20px, 6vw, 52px)",
            minHeight: isVertical ? "240px" : undefined,
          }}
        >
          {/* Kleine Überschrift */}
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "#6B665E",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "20px",
            }}
          >
            {topDownEyebrow}
          </span>

          {/* FLIP anchor — unmounts in detail mode so the sub-page instance
              becomes Framer Motion's target via shared layoutId. */}
          {!isDetailMode &&
            (enableFlip ? (
              <motion.span
                layoutId="anlagestrategien-headline-topdown"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(40px, 9vw, 64px)",
                  letterSpacing: "-0.03em",
                  color: "#F9F9F7",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {topDownTitle}
              </motion.span>
            ) : (
              <span
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(40px, 9vw, 64px)",
                  letterSpacing: "-0.03em",
                  color: "#F9F9F7",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {topDownTitle}
              </span>
            ))}

          {/* Drei Zeilen */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <AccentRow text={topDownBullets[0]} lineColor="#989071" />
            <AccentRow text={topDownBullets[1]} lineColor="#989071" />
            <AccentRow text={topDownBullets[2]} lineColor="#989071" />
          </div>
        </div>

        {/* ═══════════════════��════════════════════════════
            MITTLERE ZONE — Akzentbalken
            ════════════════════════════════════════════════ */}
        <div
          style={{
            height: isVertical ? "auto" : "72px",
            minHeight: isVertical ? "56px" : undefined,
            flexShrink: 0,
            backgroundColor: "#989071",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isVertical ? "12px clamp(20px, 6vw, 52px)" : "0 52px",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: "clamp(18px, 5vw, 24px)",
              fontStyle: "italic",
              color: "#F9F9F7",
              lineHeight: 1,
            }}
          >
            {decisionLabel}
          </span>

          <span
            style={{
              fontFamily: sans,
              fontSize: "clamp(9px, 2.5vw, 10px)",
              letterSpacing: "0.15em",
              color: "#D8D5CF",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {committeeLabel}
          </span>
        </div>

        {/* ════════════════════════════════════════════════
            UNTERE ZONE — hell, Inhalt oben verankert
            ════════════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#F9F9F7",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "clamp(24px, 6vw, 44px) clamp(20px, 6vw, 52px)",
            minHeight: isVertical ? "240px" : undefined,
          }}
        >
          {/* FLIP anchor — unmounts in detail mode */}
          {!isDetailMode &&
            (enableFlip ? (
              <motion.span
                layoutId="anlagestrategien-headline-bottomup"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(40px, 9vw, 64px)",
                  letterSpacing: "-0.03em",
                  color: "#1A1916",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {bottomUpTitle}
              </motion.span>
            ) : (
              <span
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(40px, 9vw, 64px)",
                  letterSpacing: "-0.03em",
                  color: "#1A1916",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {bottomUpTitle}
              </span>
            ))}

          {/* Kleine Überschrift */}
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "#B0ACA5",
              textTransform: "uppercase",
              display: "block",
              marginTop: "20px",
            }}
          >
            {bottomUpEyebrow}
          </span>

          {/* Drei Zeilen */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <AccentRow text={bottomUpBullets[0]} lineColor="#D8D5CF" />
            <AccentRow text={bottomUpBullets[1]} lineColor="#D8D5CF" />
            <AccentRow text={bottomUpBullets[2]} lineColor="#D8D5CF" />
          </div>
        </div>
      </div>
    </div>
  );
}
