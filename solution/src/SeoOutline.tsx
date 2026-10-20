import { pickLocale, type Locale, type LocaleValue } from "@/i18n/types";
import { mainSiteUrl } from "@/sanity/env";

/* Server-rendered text outline of the Solutions page, built from the same
   CMS fields the interactive page shows. Home renders only the preload
   screen until it mounts, so without this the initial HTML had no text —
   invisible to crawlers and AI assistants that don't run JavaScript.
   Home shows it under the preload screen and drops it after hydration. */

export function SeoOutline({ homepage: d, lang }: { homepage: any; lang: Locale }) {
  const t = (v: unknown) => (v == null ? "" : pickLocale(v as LocaleValue, lang).trim());
  const join = (...parts: unknown[]) => parts.map(t).filter(Boolean).join(" ");
  /* Headline lines strictly in the active language, as SolutionsEinstieg does —
     the language fallback would append e.g. a FR-only third line. */
  const strict = (v: unknown) => (typeof v === "string" ? v.trim() : (((v as any)?.[lang] as string) ?? "").trim());
  const headline = [d?.heroTaglineLine1, d?.heroTaglineLine2, d?.heroTaglineLine3].map(strict).filter(Boolean).join(" ");
  const columns = (Array.isArray(d?.servicesColumns) ? d.servicesColumns : []) as any[];
  const team = (Array.isArray(d?.teamMembers) ? d.teamMembers : []) as any[];
  const contactHeading = { de: "Kontakt", en: "Contact", fr: "Contact" }[lang];

  return (
    <main data-seo-outline="" style={{ height: "100%", overflow: "hidden", padding: 24 }}>
      <header>
        <p>{t(d?.heroEyebrow)}</p>
        <h1>{headline || t(d?.heroClosingLine) || "Tellian Capital Solutions"}</h1>
        <p>{t(d?.heroLeadSentence)}</p>
        <p>{t(d?.heroClosingLine)}</p>
      </header>

      <section>
        <h2>{join(d?.servicesHeadingLine1, d?.servicesHeadingLine2)}</h2>
        <p>{t(d?.servicesIntro)}</p>
        {columns.map((c, i) => (
          <div key={i}>
            <h3>{t(c?.title)}</h3>
            <p>{t(c?.body)}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>{join(d?.teamHeadingLine1, d?.teamHeadingLine2)}</h2>
        {team.length > 0 && (
          <ul>
            {team.map((m, i) => (
              <li key={i}>{[t(m?.name), t(m?.role)].filter(Boolean).join(", ")}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>{join(d?.contactHeadingLine1, d?.contactHeadingLine2) || contactHeading}</h2>
        <p>{t(d?.contactIntro)}</p>
        <address style={{ fontStyle: "normal" }}>
          {t(d?.contactCompanyName)}
          <br />
          {t(d?.contactAddressLine)}
          <br />
          {t(d?.contactPhone)}
          <br />
          {t(d?.contactEmailAddr)}
        </address>
      </section>

      <nav>
        <a href={`${mainSiteUrl}/de`}>Tellian Capital</a> ·{" "}
        {(["de", "en", "fr"] as const)
          .filter((l) => l !== lang)
          .map((l, i) => (
            <span key={l}>
              {i > 0 && " · "}
              <a href={`/solutions/${l}`} hrefLang={l}>
                {l.toUpperCase()}
              </a>
            </span>
          ))}
      </nav>
    </main>
  );
}
