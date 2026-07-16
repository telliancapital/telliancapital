"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import { C, serif, sans } from "@/tokens";

/* ── CSS variable references for easy rebrand (see theme.css) ── */
const V = {
  cardBg: "var(--tellian-card-bg)",
  cardText: "var(--tellian-card-text)",
  cardBullet: "var(--tellian-card-bullet)",
  cardEyebrow: "var(--tellian-card-eyebrow)",
  goldBg: "var(--tellian-accent-gold)",
  goldText: "var(--tellian-accent-gold-text)",
};

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
  const reducedMotion = usePrefersReducedMotion();
  const canFlip = !isVertical && !reducedMotion;
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

  /* ── Build cards array from CMS-driven values ── */
  const CARDS = [
    {
      key: "topdown" as const,
      flipId: "anlagestrategien-headline-topdown",
      eyebrow: topDownEyebrow,
      title: topDownTitle,
      bullets: topDownBullets,
    },
    {
      key: "bottomup" as const,
      flipId: "anlagestrategien-headline-bottomup",
      eyebrow: bottomUpEyebrow,
      title: bottomUpTitle,
      bullets: bottomUpBullets,
    },
  ];

  /* ── Viewport entry detection for mobile ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isVertical) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isVertical]);

  // scrollX is intentionally referenced so prop-change triggers re-renders
  void scrollX;
  void visible;

  const isMobile = isVertical;
  const cardPad = isMobile ? "32px" : "40px";
  const headlineSize = isMobile ? "clamp(32px, 8vw, 40px)" : "clamp(48px, 5vh, 56px)";
  const bulletDash = isMobile ? "12px" : "14px";

  return (
    <div
      ref={containerRef}
      className={isVertical ? "" : "absolute z-0"}
      style={
        isVertical
          ? {
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: isMobile ? "32px 16px" : "40px 32px",
            }
          : {
              top: 0,
              bottom: 0,
              left: "44vw",
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 clamp(24px, 3vw, 48px)",
            }
      }
    >
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "600px" : "680px",
          opacity: isDetailMode ? 0 : 1,
          transform: isDetailMode ? "scale(0.96)" : "scale(1)",
          transition: "opacity 400ms ease-out, transform 400ms ease-out",
        }}
      >
        {/* Cards row */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "20px",
          }}
        >
          {CARDS.map((card) => (
            <div
              key={card.key}
              style={{
                flex: 1,
                background: V.cardBg,
                padding: cardPad,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Eyebrow */}
              <span
                style={{
                  fontFamily: sans,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: V.cardEyebrow,
                }}
              >
                {card.eyebrow}
              </span>

              {/* Headline — FLIP target. layoutId preserved to match
                  AnlagestrategienDetail.tsx (cross-component shared element). */}
              {isDetailMode ? null : canFlip ? (
                <motion.h3
                  layoutId={card.flipId}
                  style={{
                    fontFamily: serif,
                    fontSize: headlineSize,
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                    color: V.cardText,
                    fontWeight: 400,
                    margin: "12px 0 0 0",
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {card.title}
                </motion.h3>
              ) : (
                <h3
                  style={{
                    fontFamily: serif,
                    fontSize: headlineSize,
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                    color: V.cardText,
                    fontWeight: 400,
                    margin: "12px 0 0 0",
                  }}
                >
                  {card.title}
                </h3>
              )}

              {/* Bullets */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "24px 0 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {card.bullets.map((text, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: isMobile ? "12px" : "16px",
                      fontFamily: sans,
                      fontSize: isMobile ? "14px" : "15px",
                      color: V.cardText,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        width: bulletDash,
                        height: "1px",
                        backgroundColor: V.cardBullet,
                        flexShrink: 0,
                        marginTop: "11px",
                      }}
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gold bar — connecting sockel under both cards */}
        <div
          style={{
            background: V.goldBg,
            padding: isMobile ? "20px 32px" : "22px 40px",
            marginTop: isMobile ? "20px" : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: isMobile ? C.dark : V.goldText,
            }}
          >
            {decisionLabel}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "12px" : "14px",
              color: isMobile ? C.stone : V.goldText,
              margin: "0 8px",
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: isMobile ? C.dark : V.goldText,
            }}
          >
            {committeeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
