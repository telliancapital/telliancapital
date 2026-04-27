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
import type { Lang, LocaleValue } from "./types";
import { pickLocale } from "./types";

const STORAGE_KEY = "tellian.lang";
const DEFAULT_LANG: Lang = "de";

interface LanguageContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Resolve a localized field to the active language with safe fallback. */
  t: (value: LocaleValue, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;

  // 1. URL `?lang=` wins (deep-linkable)
  try {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("lang");
    if (fromUrl === "de" || fromUrl === "en") return fromUrl;
  } catch {
    /* ignore malformed URL */
  }

  // 2. Persisted preference
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "de" || stored === "en") return stored;
  } catch {
    /* localStorage may be blocked */
  }

  // 3. Browser language hint
  const nav = window.navigator?.language?.toLowerCase() ?? "";
  if (nav.startsWith("en")) return "en";

  return DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hydrate after mount so SSR matches
  useEffect(() => {
    setLangState(readInitialLang());
  }, []);

  // Sync to <html lang="…"> + persist + URL
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("lang") !== lang) {
        url.searchParams.set("lang", lang);
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const t = useCallback(
    (value: LocaleValue, fallback = "") => pickLocale(value, lang, fallback),
    [lang],
  );

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Render-time fallback so any subtree without the provider still works.
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (value, fallback = "") => pickLocale(value, DEFAULT_LANG, fallback),
    };
  }
  return ctx;
}
