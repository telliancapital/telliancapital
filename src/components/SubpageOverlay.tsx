"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/* ─── Design tokens ─── */
const C = {
  bg: "#F9F9F7",
  dark: "#1A1916",
  stone: "#8A857C",
  line: "#D8D5CF",
};

const serif = "var(--font-cormorant), serif";
const sans = "var(--font-inter), sans-serif";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

interface SubpageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Small uppercase eyebrow shown above the hero headline */
  eyebrow: string;
  /** Serif headline with optional <em> — JSX allowed */
  headline: ReactNode;
  /** Everything rendered inside the overlay below the hero
   *  (e.g. FLIP anchor area, detail content, footer) */
  children: ReactNode;
}

/**
 * Reusable subpage overlay shell.
 * Renders via React Portal to document.body, animates open/close, handles
 * the sticky top bar with back button, and the hero title block.
 * Each concrete subpage provides its own `children` (stepper/FLIP/detail).
 */
export function SubpageOverlay({
  isOpen,
  onClose,
  eyebrow,
  headline,
  children,
}: SubpageOverlayProps) {
  /* Scroll to top each time overlay opens so long-scroll content starts fresh */
  useEffect(() => {
    if (!isOpen) return;
    const overlay = document.getElementById("tellian-subpage-overlay");
    if (overlay) overlay.scrollTo({ top: 0 });
  }, [isOpen]);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      id="tellian-subpage-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: C.bg,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
        transition: `opacity 400ms ease-out, visibility 0s linear ${isOpen ? "0s" : "800ms"}`,
      }}
    >
      {/* ═══ Top Bar (sticky) ═══ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(249, 249, 247, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.line}`,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          opacity: isOpen ? 1 : 0,
          transition: `opacity 300ms ease-out ${isOpen ? "900ms" : "0ms"}`,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "2.5px",
            color: C.dark,
            textTransform: "uppercase",
          }}
        >
          Tellian<span style={{ fontWeight: 400 }}> Capital</span>
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "10px 4px",
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: sans,
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.stone,
            transition: "color 300ms ease-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
        >
          <span aria-hidden>←</span>
          <span>Zurück</span>
        </button>
      </div>

      {/* ═══ Hero — eyebrow + headline ═══ */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 48px 40px",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(-12px)",
          transition: `opacity 600ms ease-out ${isOpen ? "500ms" : "0ms"}, transform 600ms ${EASE} ${isOpen ? "500ms" : "0ms"}`,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.28em",
            color: C.stone,
            textTransform: "uppercase",
            display: "block",
          }}
        >
          {eyebrow}
        </span>
        <h1
          style={{
            fontFamily: serif,
            fontSize: "clamp(40px, 4.5vw, 56px)",
            lineHeight: 1.05,
            color: C.dark,
            letterSpacing: "-0.02em",
            margin: "20px 0 0 0",
            fontWeight: 400,
          }}
        >
          {headline}
        </h1>
      </div>

      {/* ═══ Custom per-subpage content ═══ */}
      {children}
    </div>,
    document.body,
  );
}
