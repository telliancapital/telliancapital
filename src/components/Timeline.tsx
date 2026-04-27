"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════
   EDITORIAL TIMELINE — Swiss Private Capital
   Premium horizontal milestone axis with line icons,
   vertical stems, and progressive scroll-driven reveals.
   ═══════════════════════════════════════════════════════════ */

const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";
const EASE_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

const C = {
  bg: "#F9F9F7",
  dark: "#1A1916",
  charcoal: "#3A3835",
  stone: "#8A857C",
  muted: "#B0ACA5",
  line: "#D8D5CF",
  lineLight: "#E8E6E1",
};

const serif = "var(--font-cormorant), serif";
const sans = "var(--font-inter), sans-serif";

/* ── Scroll-aware progress hook ── */
function useElementProgress(ref: React.RefObject<HTMLElement | null>, scrollX: number) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let id: number;
    const update = () => {
      if (!ref.current) {
        id = requestAnimationFrame(update);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const center = rect.left + rect.width / 2;
      const p = 1 - center / vw;
      const clamped = Math.max(-0.5, Math.min(1.5, p));
      if (Number.isFinite(clamped)) setProgress(clamped);
      id = requestAnimationFrame(update);
    };
    id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [scrollX]);

  return progress;
}

/* ═══════════════════════════════════════════════════════════
   MINIMAL LINE ICONS — Swiss editorial precision
   Each icon is 32×32, stroke-only, 1px weight
   ═══════════════════════════════════════════════════════════ */

function IconZurich() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Grossmünster-inspired twin towers */}
      <line x1="10" y1="28" x2="10" y2="10" />
      <line x1="22" y1="28" x2="22" y2="10" />
      <line x1="8" y1="28" x2="12" y2="28" />
      <line x1="20" y1="28" x2="24" y2="28" />
      {/* Spires */}
      <polyline points="8,10 10,4 12,10" />
      <polyline points="20,10 22,4 24,10" />
      {/* Cross detail on left spire */}
      <line x1="10" y1="6" x2="10" y2="8" />
      <line x1="9" y1="7" x2="11" y2="7" />
      {/* Bridge between */}
      <line x1="12" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function IconModel() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Abstract data/analysis: connected nodes */}
      <circle cx="8" cy="22" r="2" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="24" cy="16" r="2" />
      <circle cx="16" cy="26" r="2" />
      <line x1="9.5" y1="20.8" x2="14.5" y2="11.2" />
      <line x1="17.5" y1="11.2" x2="22.5" y2="14.8" />
      <line x1="14.5" y1="24.8" x2="9.5" y2="23.2" />
      <line x1="17.5" y1="25" x2="22.8" y2="17.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shield — stability, protection */}
      <path d="M16 4 L26 9 L26 18 C26 24 16 29 16 29 C16 29 6 24 6 18 L6 9 Z" />
      {/* Inner detail — check mark */}
      <polyline points="12,16 15,19 21,13" />
    </svg>
  );
}

function IconGrowth() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ascending steps — growth, scale */}
      <polyline points="4,26 4,20 10,20 10,16 16,16 16,12 22,12 22,8 28,8 28,26" />
      <line x1="4" y1="26" x2="28" y2="26" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Globe — international presence */}
      <circle cx="16" cy="16" r="11" />
      <ellipse cx="16" cy="16" rx="5" ry="11" />
      <line x1="5" y1="16" x2="27" y2="16" />
      <path d="M7 10 C10 10 22 10 25 10" />
      <path d="M7 22 C10 22 22 22 25 22" />
    </svg>
  );
}

function IconAnalysis() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Abstract signal/waveform — next-gen analysis */}
      <polyline points="4,20 8,14 12,22 16,8 20,18 24,12 28,16" />
      {/* Baseline */}
      <line x1="4" y1="28" x2="28" y2="28" />
      {/* Vertical axis */}
      <line x1="4" y1="6" x2="4" y2="28" />
    </svg>
  );
}

function IconPillar() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Classical column — continuity, foundation */}
      <rect x="12" y="8" width="8" height="18" />
      {/* Capital */}
      <line x1="10" y1="8" x2="22" y2="8" />
      <line x1="9" y1="6" x2="23" y2="6" />
      {/* Base */}
      <line x1="10" y1="26" x2="22" y2="26" />
      <line x1="9" y1="28" x2="23" y2="28" />
      {/* Fluting details */}
      <line x1="14.5" y1="9" x2="14.5" y2="25" />
      <line x1="17.5" y1="9" x2="17.5" y2="25" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MILESTONE DATA
   ═══════════════════════════════════════════════════════════ */

interface Milestone {
  year: string;
  label: string;
  text: string;
  expanded?: boolean;
  expandedText?: string;
  icon: () => ReactNode;
}

const MILESTONES: Milestone[] = [
  {
    year: "1996",
    label: "Gründung",
    text: "Dr. Blumer & Partner entsteht an der Löwenstrasse 1 in Zürich.",
    expanded: true,
    expandedText:
      "Ein Unternehmen, das Vermögen ausschliesslich auf Basis quantitativer Modelle verwaltet — in Europa zu dieser Zeit eine Ausnahme. Der Standort und die Methodik gelten bis heute.",
    icon: IconZurich,
  },
  {
    year: "2001",
    label: "Erste Modelle",
    text: "Proprietäre Selektionsmodelle für europäische Aktienmärkte werden produktiv eingesetzt.",
    icon: IconModel,
  },
  {
    year: "2008",
    label: "Bewährungsprobe",
    text: "Stabile Performance während der Finanzkrise.",
    expanded: true,
    expandedText:
      "Kein Kunde erleidet permanenten Kapitalverlust. Die quantitative Disziplin bewährt sich unter Bedingungen, für die sie entworfen wurde.",
    icon: IconShield,
  },
  {
    year: "2014",
    label: "Wachstum",
    text: "Verwaltetes Vermögen übersteigt CHF 1 Mrd. Lancierung der Multistrategy-Plattform für institutionelle Mandate.",
    icon: IconGrowth,
  },
  {
    year: "2019",
    label: "International",
    text: "Eröffnung London. Betreuung internationaler Familien aus einem dritten Standort.",
    icon: IconGlobe,
  },
  {
    year: "2023",
    label: "Dritte Generation",
    text: "Die B&P QuantAnalyse wird grundlegend erneuert. Integration alternativer Datenquellen und maschineller Lernverfahren.",
    icon: IconAnalysis,
  },
  {
    year: "2026",
    label: "Tellian Capital",
    text: "Drei Jahrzehnte. Derselbe Standort, dieselbe Methodik.",
    expanded: true,
    expandedText:
      "Ein neuer Name für das, was immer schon galt: Vermögensverwaltung mit quantitativem Fundament, persönlicher Verantwortung und Schweizer Präzision.",
    icon: IconPillar,
  },
];

/* ═══════════════════════════════════════════════════════════
   INDIVIDUAL MILESTONE COMPONENT
   ═══════════════════════════════════════════════════════════ */

const AXIS_TOP = "62%"; // Axis position from top

function MilestoneNode({
  milestone,
  scrollX,
  width,
}: {
  milestone: Milestone;
  scrollX: number;
  width: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useElementProgress(ref, scrollX);

  // Reveal logic: opacity peaks when element is centered in viewport
  const distFromCenter = Math.abs(progress - 0.45);
  const rawOpacity = 1 - distFromCenter * 2.0;
  const opacity = Math.max(0, Math.min(1, rawOpacity));

  // Stem draws in from bottom to top
  const stemReveal = Math.max(0, Math.min(1, (progress + 0.2) * 1.8));

  // Content rises gently
  const contentY = (1 - opacity) * 20;

  // Icon reveal — slightly delayed
  const iconReveal = Math.max(0, Math.min(1, (progress + 0.1) * 1.6));

  const isExpanded = milestone.expanded;
  const Icon = milestone.icon;

  // Stem height varies: taller for expanded milestones
  const stemHeight = isExpanded ? 180 : 120;

  return (
    <div
      ref={ref}
      className="relative flex-shrink-0"
      style={{
        width,
        height: "100%",
      }}
    >
      {/* ── Vertical stem from axis upward ── */}
      <div
        className="absolute left-1/2"
        style={{
          top: `calc(${AXIS_TOP} - ${stemHeight}px)`,
          height: `${stemHeight}px`,
          width: "1px",
          transformOrigin: "bottom center",
          transform: `translateX(-0.5px) scaleY(${stemReveal})`,
          backgroundColor: C.line,
          transition: `transform 1.2s ${EASE_EXPO}`,
        }}
      />

      {/* ── Dot on the axis ── */}
      <div
        className="absolute left-1/2 rounded-full"
        style={{
          top: AXIS_TOP,
          width: isExpanded ? "7px" : "5px",
          height: isExpanded ? "7px" : "5px",
          backgroundColor: isExpanded ? C.charcoal : C.stone,
          transform: `translate(-50%, -50%) scale(${stemReveal})`,
          transition: `transform 0.8s ${EASE_EXPO}`,
        }}
      />

      {/* ── Content block above the stem ── */}
      <div
        className="absolute left-1/2 flex flex-col items-center"
        style={{
          bottom: `calc(100% - ${AXIS_TOP} + ${stemHeight}px + 8px)`,
          transform: `translateX(-50%) translate3d(0, ${contentY}px, 0)`,
          opacity,
          transition: `transform 0.8s ${EASE}, opacity 1.0s ${EASE}`,
          width: isExpanded ? "clamp(240px, 18vw, 320px)" : "clamp(160px, 12vw, 220px)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            color: C.charcoal,
            opacity: iconReveal,
            transform: `scale(${0.85 + iconReveal * 0.15})`,
            transition: `opacity 1s ${EASE}, transform 1s ${EASE_EXPO}`,
          }}
          className="mb-5"
        >
          <Icon />
        </div>

        {/* Year */}
        <span
          style={{
            fontFamily: serif,
            color: C.dark,
            lineHeight: 1,
          }}
          className={
            isExpanded
              ? "text-[clamp(2.4rem,3.5vw,4rem)] tracking-[-0.03em]"
              : "text-[clamp(1.6rem,2.2vw,2.4rem)] tracking-[-0.02em]"
          }
        >
          {milestone.year}
        </span>

        {/* Label */}
        <span
          style={{
            fontFamily: sans,
            letterSpacing: "0.14em",
            color: C.stone,
          }}
          className="mt-3 block text-center text-[7px] uppercase md:text-[8px]"
        >
          {milestone.label}
        </span>

        {/* Thin separator */}
        <div
          className="mt-4 mb-4"
          style={{
            width: "16px",
            height: "1px",
            backgroundColor: C.line,
            opacity: opacity * 0.8,
          }}
        />

        {/* Primary text */}
        <p
          style={{
            fontFamily: sans,
            color: C.charcoal,
            lineHeight: 1.85,
            textAlign: "center",
          }}
          className={isExpanded ? "text-[11px]" : "text-[10px]"}
        >
          {milestone.text}
        </p>

        {/* Expanded detail text */}
        {isExpanded && milestone.expandedText && (
          <p
            style={{
              fontFamily: sans,
              color: C.dark,
              lineHeight: 1.9,
              textAlign: "center",
            }}
            className="mt-3 max-w-[280px] text-[10px]"
          >
            {milestone.expandedText}
          </p>
        )}
      </div>

      {/* ── Year echo below the axis (subtle) ── */}
      <div
        className="absolute left-1/2"
        style={{
          top: `calc(${AXIS_TOP} + 14px)`,
          transform: "translateX(-50%)",
          opacity: opacity * 0.35,
          transition: `opacity 1s ${EASE}`,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            letterSpacing: "0.1em",
            color: C.muted,
          }}
          className="text-[8px]"
        >
          {milestone.year}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROGRESSIVE AXIS LINE — draws itself as user scrolls
   ═══════════════════════════════════════════════════════════ */

function TimelineAxis({ scrollX }: { scrollX: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    let id: number;
    const update = () => {
      if (!ref.current) {
        id = requestAnimationFrame(update);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const entered = vw - rect.left;
      const total = rect.width + vw;
      const p = entered / total;
      const clamped = Math.max(0, Math.min(1, p * 1.8 - 0.15));
      if (Number.isFinite(clamped)) setLineProgress(clamped);
      id = requestAnimationFrame(update);
    };
    id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [scrollX]);

  return (
    <div
      ref={ref}
      className="absolute right-0 left-0 h-[1px]"
      style={{
        top: AXIS_TOP,
        transform: "translateY(-0.5px)",
      }}
    >
      {/* Faint background track */}
      <div className="absolute inset-0" style={{ backgroundColor: C.lineLight, opacity: 0.6 }} />
      {/* Drawn line — reveals progressively */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          backgroundColor: C.stone,
          opacity: 0.35,
          width: `${lineProgress * 100}%`,
          transition: `width 2.2s ${EASE_EXPO}`,
        }}
      />
      {/* Leading dot at the drawn edge */}
      <div
        className="absolute rounded-full"
        style={{
          width: "3px",
          height: "3px",
          backgroundColor: C.stone,
          top: "-1px",
          left: `${lineProgress * 100}%`,
          transform: "translateX(-1.5px)",
          opacity: lineProgress > 0.02 && lineProgress < 0.98 ? 0.5 : 0,
          transition: `left 2.2s ${EASE_EXPO}, opacity 0.6s ${EASE}`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION HEADER — Left-aligned intro panel
   ═══════════════════════════════════════════════════════════ */

function TimelineHeader({ scrollX }: { scrollX: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useElementProgress(ref, scrollX);

  const distFromCenter = Math.abs(progress - 0.35);
  const opacity = Math.max(0, Math.min(1, 1 - distFromCenter * 2.0));
  const y = (1 - opacity) * 14 * (progress < 0.35 ? 1 : -1);

  return (
    <div
      ref={ref}
      className="absolute top-0 bottom-0 left-0 z-20 flex flex-col justify-center pl-10 md:pl-20 lg:pl-32"
      style={{
        width: "clamp(220px, 20vw, 360px)",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translate3d(0, ${y}px, 0)`,
          transition: `transform 0.5s ${EASE}, opacity 0.9s ${EASE}`,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            letterSpacing: "0.28em",
            color: C.dark,
          }}
          className="mb-10 block text-[8px] uppercase md:text-[9px]"
        >
          Unsere Geschichte
        </span>

        <span
          style={{
            fontFamily: serif,
            lineHeight: 1.1,
            color: C.dark,
          }}
          className="block text-[clamp(1.5rem,2.8vw,2.8rem)] tracking-[-0.02em]"
        >
          1996
        </span>
        <span
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            lineHeight: 1.1,
            color: C.dark,
          }}
          className="block text-[clamp(1.5rem,2.8vw,2.8rem)] tracking-[-0.02em]"
        >
          bis heute.
        </span>

        <div className="mt-8 h-[1px] w-8" style={{ backgroundColor: C.line }} />

        <p
          style={{
            fontFamily: sans,
            color: C.charcoal,
            lineHeight: 1.85,
          }}
          className="mt-6 max-w-[220px] text-[10px]"
        >
          Drei Jahrzehnte konsequenter Entwicklung. Jeder Schritt auf dem gleichen Fundament.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN TIMELINE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function EditorialTimeline({ scrollX }: { scrollX: number }) {
  // Width per milestone: expanded ones get more space
  const milestoneWidths = MILESTONES.map((m) =>
    m.expanded ? "clamp(260px, 22vw, 380px)" : "clamp(180px, 16vw, 280px)",
  );

  return (
    <div
      className="relative h-screen flex-shrink-0"
      style={{
        width: "210vw",
        backgroundColor: C.bg,
      }}
    >
      {/* Section header */}
      <TimelineHeader scrollX={scrollX} />

      {/* Timeline area */}
      <div
        className="absolute h-full"
        style={{
          left: "clamp(240px, 22vw, 400px)",
          right: "8vw",
        }}
      >
        {/* The continuous horizontal axis */}
        <TimelineAxis scrollX={scrollX} />

        {/* Milestone nodes distributed along the axis */}
        <div className="absolute inset-0 flex items-start" style={{ padding: "0 3vw" }}>
          {MILESTONES.map((m, i) => (
            <MilestoneNode
              key={m.year}
              milestone={m}
              scrollX={scrollX}
              width={milestoneWidths[i]}
            />
          ))}
        </div>
      </div>

      {/* Soft edge blends */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[6vw]"
        style={{
          background: `linear-gradient(to right, ${C.bg}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[6vw]"
        style={{
          background: `linear-gradient(to left, ${C.bg}, transparent)`,
        }}
      />
    </div>
  );
}
