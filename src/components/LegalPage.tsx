"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LEGAL_PAGES,
  LEGAL_PATHS,
  type LegalPath,
  type LegalPageContent,
  type LegalSection,
} from "../data/legalPages";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

const sans = "var(--font-inter), sans-serif";
const serif = "var(--font-cormorant), serif";

const C = {
  bg: "#F9F9F7",
  dark: "#1A1916",
  charcoal: "#3A3835",
  stone: "#8A857C",
  muted: "#B0ACA5",
  line: "#D8D5CF",
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function isLegalPath(p: string): p is LegalPath {
  return (LEGAL_PATHS as readonly string[]).includes(p);
}

/**
 * History-based routing for the three legal pages.
 * Matches the pattern used by useSubpageMode — no React Router,
 * pushState + popstate only. Direct URL entry works on first load.
 */
export function useLegalRoute() {
  const getInitial = (): LegalPath | null => {
    if (typeof window === "undefined") return null;
    const p = window.location.pathname;
    return isLegalPath(p) ? p : null;
  };

  const [activePath, setActivePath] = useState<LegalPath | null>(getInitial);

  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      setActivePath(isLegalPath(p) ? p : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = useCallback((path: LegalPath) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setActivePath(path);
  }, []);

  const close = useCallback(() => {
    window.history.pushState({}, "", "/");
    setActivePath(null);
  }, []);

  return { activePath, open, close };
}

/* ─── CMS field-name lookup per legal path ─── */
const FIELD_KEYS: Record<LegalPath, { title: string; updated: string; sections: string }> = {
  "/impressum": {
    title: "legalImpressumTitle",
    updated: "legalImpressumUpdated",
    sections: "legalImpressumSections",
  },
  "/datenschutz": {
    title: "legalDatenschutzTitle",
    updated: "legalDatenschutzUpdated",
    sections: "legalDatenschutzSections",
  },
  "/kundeninformation": {
    title: "legalKundeninformationTitle",
    updated: "legalKundeninformationUpdated",
    sections: "legalKundeninformationSections",
  },
};

interface LegalPageProps {
  activePath: LegalPath | null;
  onClose: () => void;
  homepage?: any;
}

export function LegalPage({ activePath, onClose, homepage }: LegalPageProps) {
  const backRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (activePath) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => backRef.current?.focus(), 100);
      return () => window.clearTimeout(t);
    }
    triggerRef.current?.focus?.({ preventScroll: true });
  }, [activePath]);

  useEffect(() => {
    if (!activePath) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePath, onClose]);

  useEffect(() => {
    if (!activePath) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activePath]);

  if (typeof document === "undefined" || !activePath) return null;

  /* ── Build the rendered content from CMS, falling back per-field to the
        bundled `LEGAL_PAGES` so a partial CMS entry still renders cleanly. ── */
  const fallback: LegalPageContent = LEGAL_PAGES[activePath];
  const keys = FIELD_KEYS[activePath];

  const cmsSections: LocaleSection[] | undefined = homepage?.[keys.sections];
  const renderedSections: LegalSection[] =
    cmsSections && cmsSections.length > 0
      ? cmsSections.map((s, i): LegalSection => {
          const fb = fallback.sections[i];
          const heading = t(s?.heading, fb?.heading ?? "");
          const paragraphs = (s?.paragraphs ?? []).map((p) => t(p, "")).filter((p) => p.length > 0);
          const list = (s?.list ?? []).map((l) => t(l, "")).filter((l) => l.length > 0);
          return {
            heading,
            paragraphs: paragraphs.length > 0 ? paragraphs : fb?.paragraphs,
            list: list.length > 0 ? list : fb?.list,
          };
        })
      : fallback.sections;

  const title = t(homepage?.[keys.title], fallback.title);
  const updated = t(homepage?.[keys.updated], fallback.updated ?? "");

  return createPortal(
    <div
      role="main"
      aria-labelledby="legal-page-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        backgroundColor: C.bg,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: C.bg,
          zIndex: 10,
          padding: "clamp(24px, 3vh, 40px) clamp(24px, 5vw, 80px)",
          borderBottom: `0.5px solid ${C.line}`,
        }}
      >
        <a
          ref={backRef}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          style={{
            fontFamily: sans,
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.stone,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: `color 300ms ${EASE}`,
            outline: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
          onFocus={(e) => (e.currentTarget.style.color = C.dark)}
          onBlur={(e) => (e.currentTarget.style.color = C.stone)}
        >
          <span aria-hidden>←</span>
          Zurück
        </a>
      </div>

      <article
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "clamp(40px, 6vh, 80px) clamp(24px, 5vw, 40px) clamp(64px, 10vh, 120px)",
        }}
      >
        <h1
          id="legal-page-title"
          style={{
            fontFamily: serif,
            fontSize: "clamp(40px, 5vw, 64px)",
            lineHeight: 1.05,
            color: C.dark,
            letterSpacing: "-0.02em",
            fontWeight: 400,
            margin: 0,
            marginBottom: "12px",
          }}
        >
          {title}
        </h1>

        {updated && (
          <p
            style={{
              fontFamily: sans,
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.muted,
              margin: 0,
              marginBottom: "clamp(40px, 5vh, 72px)",
            }}
          >
            {updated}
          </p>
        )}

        {renderedSections.map((section, i) => (
          <section key={i} style={{ marginTop: i === 0 ? 0 : "clamp(36px, 5vh, 56px)" }}>
            <h2
              style={{
                fontFamily: serif,
                fontSize: "clamp(22px, 2.4vw, 28px)",
                lineHeight: 1.2,
                color: C.dark,
                letterSpacing: "-0.01em",
                fontWeight: 500,
                margin: 0,
                marginBottom: "16px",
              }}
            >
              {section.heading}
            </h2>

            {section.paragraphs?.map((p, j) => (
              <p
                key={j}
                style={{
                  fontFamily: sans,
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: C.charcoal,
                  margin: 0,
                  marginBottom: "12px",
                  fontWeight: 300,
                }}
              >
                {p}
              </p>
            ))}

            {section.list && section.list.length > 0 && (
              <ul
                style={{
                  fontFamily: sans,
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: C.charcoal,
                  fontWeight: 300,
                  paddingLeft: "20px",
                  marginTop: "12px",
                  marginBottom: 0,
                }}
              >
                {section.list.map((item, k) => (
                  <li key={k} style={{ marginBottom: "6px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>,
    document.body,
  );
}

type LocaleSection = {
  heading?: LocaleValue;
  paragraphs?: LocaleValue[];
  list?: LocaleValue[];
};
