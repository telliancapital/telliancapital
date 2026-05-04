"use client";

import { usePortalI18n, type Locale } from "@/lib/portal/i18n";

const LOCALES: Locale[] = ["de", "en"];

export function PortalLanguageToggle() {
  const { locale, setLocale } = usePortalI18n();

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span
              style={{
                color: "var(--tellian-line)",
                fontSize: "13px",
                marginRight: "4px",
                userSelect: "none",
              }}
            >
              |
            </span>
          )}
          <button
            onClick={() => setLocale(l)}
            style={{
              fontFamily: "var(--font-inter), 'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: locale === l ? 600 : 400,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: locale === l ? "var(--tellian-dark)" : "var(--tellian-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 4px",
              transition: "color 200ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
