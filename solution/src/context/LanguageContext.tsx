"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Locale, LocaleValue } from "../i18n/types";
import { pickLocale } from "../i18n/types";

const DEFAULT_LANG: Locale = "de";
const SUPPORTED: readonly Locale[] = ["de", "en", "fr"];

interface LanguageContextValue {
  lang: Locale;
  setLang: (next: Locale) => void;
  /** Resolve a localized field ({de, en, fr}) to the active language with safe fallback. */
  t: (value: LocaleValue, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/* This app is served under /solutions (basePath in next.config.ts).
   `usePathname()` strips that prefix, `window.location.pathname` keeps it —
   both are handled here so the language segment is always the one right
   after the prefix, never inserted in front of it (/en/solutions/de). */
const BASE_PATH = "/solutions";

/** Split a pathname into the basePath (if present) and the segments after it. */
function splitBase(pathname: string): { base: string; rest: string[] } {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === BASE_PATH.slice(1)) return { base: BASE_PATH, rest: parts.slice(1) };
  return { base: "", rest: parts };
}

/** Language segment of a path, or null if it's not a supported lang code. */
function pathLang(pathname: string | null | undefined): Locale | null {
  if (!pathname) return null;
  const seg = splitBase(pathname).rest[0];
  return SUPPORTED.includes(seg as Locale) ? (seg as Locale) : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  /* `usePathname()` runs both during SSR (returns the request path) and the
     first client render (returns the same path), so the initial state matches
     the URL the user actually loaded — `/de` → `de`, `/en` → `en`, `/fr` → `fr`. */
  const pathname = usePathname();
  const [lang, setLangState] = useState<Locale>(() => pathLang(pathname) ?? DEFAULT_LANG);

  /* Browser back / forward (popstate) — keep React state in sync with URL.
     `history.replaceState` (used in `setLang`) does NOT fire popstate, so we
     only react to genuine browser-driven navigation here. */
  useEffect(() => {
    const onPop = () => {
      const next = pathLang(window.location.pathname);
      if (next) setLangState(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Mirror to <html lang="…"> so screen readers / SEO see the right language. */
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Locale) => {
    setLangState((prev) => {
      if (prev === next) return prev;
      /* Update URL bar in place — no router.push / replace, so Next.js does
         not re-render server components, refetch data, or reset scroll. */
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const { base, rest } = splitBase(url.pathname);
        if (SUPPORTED.includes(rest[0] as Locale)) {
          rest[0] = next;
        } else {
          rest.unshift(next);
        }
        url.pathname = `${base}/${rest.join("/")}`;
        window.history.replaceState(window.history.state, "", url.toString());
      }
      return next;
    });
  }, []);

  const t = useCallback((value: LocaleValue, fallback = "") => pickLocale(value, lang, fallback), [lang]);

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    /* Render-time fallback so any subtree without the provider still works. */
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (value, fallback = "") => pickLocale(value, DEFAULT_LANG, fallback),
    };
  }
  return ctx;
}
