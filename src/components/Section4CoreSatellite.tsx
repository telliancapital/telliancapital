"use client";

import { useRef, useState, useEffect } from "react";
import { C, serif, sans } from "@/tokens";

/* ─── Satellite word definitions ─── */
interface Satellite {
  word: string;
  subtitle?: string;
  size: number;
  color: string;
  style: React.CSSProperties;
}

/*
  Container: 600 × 560 px
  Core circle: 320 px Ø, centred at (300, 280)
  Each word is absolutely positioned; distance from core encodes weight.
*/
const SATELLITES: Satellite[] = [
  {
    word: "Aktien",
    subtitle: "EQUITY",
    size: 38,
    color: C.warm,
    style: { top: "52px", left: "14px" },
  },
  {
    word: "Anleihen",
    subtitle: "FIXED INCOME",
    size: 32,
    color: C.warm,
    style: { top: "38px", right: "16px" },
  },
  {
    word: "Taktisch",
    subtitle: "KURZFRISTIG",
    size: 28,
    color: C.warm,
    style: { bottom: "120px", right: "18px" },
  },
  {
    word: "Alternativ",
    subtitle: "ALTERNATIVES",
    size: 24,
    color: C.muted,
    style: { bottom: "34px", right: "12px" },
  },
  {
    word: "Hedging",
    size: 20,
    color: C.muted,
    style: { bottom: "56px", left: "244px" },
  },
  {
    word: "Liquidität",
    size: 19,
    color: C.line,
    style: { bottom: "12px", left: "12px" },
  },
];

interface Props {
  /** Passed from parent solely to drive visibility re-checks on scroll. */
  scrollX: number;
}

export function Section4CoreSatellite({ scrollX }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  /* ── Detect when panel enters the viewport (once) ── */
  useEffect(() => {
    if (visible || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    if (rect.left < window.innerWidth) {
      setVisible(true);
    }
  }, [scrollX, visible]);

  return (
    <div
      ref={panelRef}
      className="absolute z-0"
      style={{
        top: 0,
        bottom: 0,
        left: "44vw",
        width: "61vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Entire graphic fades in as one block ── */}
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "560px",
          opacity: visible ? 1 : 0,
          transition: "opacity 600ms ease-out",
        }}
      >
        {/* ════════════════════════════════════════
            Core circle
            ════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            backgroundColor: C.dark,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {/* "Core" */}
          <span
            style={{
              fontFamily: serif,
              fontSize: "52px",
              color: C.bg,
              lineHeight: 1,
              display: "block",
            }}
          >
            Core
          </span>

          {/* "STRATEGISCH" */}
          <span
            style={{
              fontFamily: sans,
              fontSize: "12px",
              color: C.stone,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              display: "block",
              marginTop: "8px",
            }}
          >
            Strategisch
          </span>

          {/* "3–5 Jahre Horizont" */}
          <span
            style={{
              fontFamily: sans,
              fontSize: "13px",
              color: C.accent,
              display: "block",
              marginTop: "6px",
            }}
          >
            3–5 Jahre Horizont
          </span>
        </div>

        {/* ════════════════════════════════════════
            Satellite words
            ════════════════════════════════════════ */}
        {SATELLITES.map((sat) => (
          <div
            key={sat.word}
            style={{
              position: "absolute",
              ...sat.style,
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: `${sat.size}px`,
                color: sat.color,
                display: "block",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {sat.word}
            </span>

            {sat.subtitle && (
              <span
                style={{
                  fontFamily: sans,
                  fontSize: "9px",
                  color: C.line,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {sat.subtitle}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
