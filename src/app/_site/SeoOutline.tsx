import { pickLocale, type Lang, type LocaleValue } from "@/i18n/types";
import { BUSINESS } from "@/lib/seo";

/* Server-rendered text outline of a route, built from the same CMS fields
   the interactive page shows. HomeClient renders nothing but the preload
   screen until it mounts (its sections read window during render), so
   without this the initial HTML had no headings or text at all — invisible
   to crawlers and AI assistants that don't run JavaScript. HomeClient
   shows it under the preload screen and drops it after hydration. Empty
   CMS fields are simply left out. */

export type OutlineRoute =
  | "home"
  | "vermoegensverwaltung"
  | "anlagestrategien"
  | "portfolio-management"
  | "impressum"
  | "datenschutz"
  | "kundeninformation";

type Doc = any;

function textHelpers(lang: Lang) {
  const t = (v: unknown) => (v == null ? "" : pickLocale(v as LocaleValue, lang).trim());
  const join = (...parts: unknown[]) => parts.map(t).filter(Boolean).join(" ");
  const list = (v: unknown) => (Array.isArray(v) ? v.map(t).filter(Boolean) : []);
  return { t, join, list };
}

function Paras({ items }: { items: string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function Bullets({ items }: { items: string[] }) {
  return items.length > 0 ? (
    <ul>
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  ) : null;
}

function Faq({ items, lang, heading }: { items: unknown; lang: Lang; heading: string }) {
  const { t } = textHelpers(lang);
  const rows = (Array.isArray(items) ? items : [])
    .map((f: Doc) => ({ q: t(f?.question), a: t(f?.answer) }))
    .filter((f) => f.q && f.a);
  if (rows.length === 0) return null;
  return (
    <section>
      <h2>{heading}</h2>
      {rows.map((f, i) => (
        <div key={i}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </section>
  );
}

function Home({ d, lang }: { d: Doc; lang: Lang }) {
  const { t, join, list } = textHelpers(lang);
  const de = lang === "de";
  const prefix = de ? "" : "/en";
  const team = (Array.isArray(d?.teamMembers) ? d.teamMembers : []) as Doc[];

  return (
    <>
      <header>
        <p>{t(d?.startEyebrow)}</p>
        <h1>{join(d?.startHeadingLine1, d?.startHeadingLine2) || BUSINESS.name}</h1>
        <Paras items={list(d?.startParagraphs)} />
      </header>

      <section>
        <h2>{join(d?.philosophyHeadingLine1, d?.philosophyHeadingLine2)}</h2>
        {t(d?.philosophyQuote) && <blockquote>{t(d?.philosophyQuote)}</blockquote>}
        <Paras items={list(d?.philosophyParagraphs)} />
        <Bullets items={(d?.philosophyValues ?? []).map((v: Doc) => t(v?.name)).filter(Boolean)} />
      </section>

      <section>
        <h2>{join(d?.methodHeadingLine1, d?.methodHeadingLine2, d?.methodHeadingLine3)}</h2>
        <Paras items={list(d?.methodParagraphs)} />
        <p>
          <a href="/vermoegensverwaltung">{t(d?.methodCtaLabel) || "Vermögensverwaltung"}</a>
        </p>
      </section>

      <section>
        <h2>{join(d?.strategyHeadingLine1, d?.strategyHeadingLine2)}</h2>
        <Paras items={list(d?.strategyParagraphs)} />
        <p>
          <a href="/anlagestrategien">{t(d?.strategyCtaLabel) || "Anlagestrategien"}</a>
          {" · "}
          <a href="/portfolio-management">Portfolio Management</a>
        </p>
      </section>

      <section>
        <h2>{join(d?.teamHeadingLine1, d?.teamHeadingLine2)}</h2>
        <Paras items={list(d?.teamParagraphs)} />
        {team.length > 0 && (
          <ul>
            {team.map((m, i) => (
              <li key={i}>{[t(m?.name), t(m?.role)].filter(Boolean).join(", ")}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>{t(d?.contactHeading) || (de ? "Kontakt" : "Contact")}</h2>
        <p>{t(d?.contactDescription)}</p>
        <address style={{ fontStyle: "normal" }}>
          {t(d?.contactCompanyName) || BUSINESS.legalName}
          <br />
          {t(d?.contactAddress) || `${BUSINESS.street}, ${BUSINESS.postalCode} ${BUSINESS.city}`}
          <br />
          <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>
          <br />
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
        </address>
      </section>

      <nav>
        <a href={`${prefix}/faq`}>FAQ</a> · <a href="/solutions/de">Tellian Capital Solutions</a> ·{" "}
        <a href="/datenschutz">Datenschutz</a> ·{" "}
        <a href="/kundeninformation">Kundeninformation</a> ·{" "}
        <a href={de ? "/en" : "/de"} hrefLang={de ? "en" : "de"}>
          {de ? "English" : "Deutsch"}
        </a>
      </nav>
    </>
  );
}

function Vermoegensverwaltung({ d }: { d: Doc }) {
  const { t, join, list } = textHelpers("de");
  const steps = (d?.methodDetailSteps ?? []) as Doc[];
  const timeline = (d?.methodTimelineSteps ?? []) as Doc[];
  return (
    <>
      <header>
        <p>{t(d?.methodDetailEyebrow)}</p>
        <h1>{join(d?.methodDetailHeadingLine1, d?.methodDetailHeadingLine2) || "Vermögensverwaltung"}</h1>
      </header>
      {timeline.length > 0 && (
        <ol>
          {timeline.map((s, i) => (
            <li key={i}>
              <strong>{t(s?.title)}</strong> {t(s?.description)}
            </li>
          ))}
        </ol>
      )}
      {steps.map((s, i) => (
        <section key={i}>
          <h2>{t(s?.headline) || t(s?.shortLabel)}</h2>
          <p>{t(s?.subline)}</p>
          <Paras items={[t(s?.body)].filter(Boolean)} />
          <Bullets items={list(s?.bullets)} />
          <Paras items={[t(s?.closing)].filter(Boolean)} />
        </section>
      ))}
      <Faq items={d?.methodFaqItems} lang="de" heading="Häufige Fragen" />
      <p>
        <a href="/de">Tellian Capital</a> · <a href="/anlagestrategien">Anlagestrategien</a> ·{" "}
        <a href="/faq">FAQ</a>
      </p>
    </>
  );
}

function Anlagestrategien({ d }: { d: Doc }) {
  const { t, join, list } = textHelpers("de");
  return (
    <>
      <header>
        <p>{t(d?.strategyDetailEyebrow)}</p>
        <h1>{join(d?.strategyDetailHeadingLine1, d?.strategyDetailHeadingLine2) || "Anlagestrategien"}</h1>
        <Paras items={list(d?.strategyParagraphs)} />
      </header>
      <section>
        <h2>{t(d?.strategyTopDownTitle) || t(d?.strategyTopDownDetailEyebrow)}</h2>
        <p>{t(d?.strategyTopDownDetailSubline)}</p>
        <Paras items={[t(d?.strategyTopDownDetailBody)].filter(Boolean)} />
        <Bullets items={list(d?.strategyTopDownDetailBullets)} />
        <Paras items={[t(d?.strategyTopDownDetailClosing)].filter(Boolean)} />
      </section>
      <section>
        <h2>{t(d?.strategyBottomUpTitle) || t(d?.strategyBottomUpDetailEyebrow)}</h2>
        <p>{t(d?.strategyBottomUpDetailSubline)}</p>
        <Paras items={[t(d?.strategyBottomUpDetailBody)].filter(Boolean)} />
        <Bullets items={list(d?.strategyBottomUpDetailBullets)} />
        <Paras items={[t(d?.strategyBottomUpDetailClosing)].filter(Boolean)} />
      </section>
      <Faq items={d?.strategyFaqItems} lang="de" heading="Häufige Fragen" />
      <p>
        <a href="/de">Tellian Capital</a> · <a href="/vermoegensverwaltung">Vermögensverwaltung</a> ·{" "}
        <a href="/portfolio-management">Portfolio Management</a> · <a href="/faq">FAQ</a>
      </p>
    </>
  );
}

function PortfolioManagement({ d }: { d: Doc }) {
  const { t, join, list } = textHelpers("de");
  const stages = (d?.pmProcessStages ?? []) as Doc[];
  const strategies = (d?.pmStrategies ?? []) as Doc[];
  return (
    <>
      <header>
        <p>{t(d?.pmDetailEyebrow)}</p>
        <h1>{join(d?.pmDetailHeadingLine1, d?.pmDetailHeadingLine2) || "Portfolio Management"}</h1>
        <Paras items={list(d?.pmIntroParagraphs)} />
      </header>
      <section>
        <h2>{join(d?.pmProcessHeadingLine1, d?.pmProcessHeadingLine2)}</h2>
        {stages.map((s, i) => (
          <div key={i}>
            <h3>{t(s?.name)}</h3>
            <Bullets items={list(s?.bullets)} />
          </div>
        ))}
        <Paras items={[t(d?.pmProcessClosing)].filter(Boolean)} />
      </section>
      <section>
        <h2>{join(d?.pmCommitteeHeadingLine1, d?.pmCommitteeHeadingLine2)}</h2>
        <Paras items={list(d?.pmCommitteeParagraphs)} />
      </section>
      <section>
        <h2>{join(d?.pmStrategiesHeadingLine1, d?.pmStrategiesHeadingLine2)}</h2>
        <p>{t(d?.pmStrategiesSubline)}</p>
        {strategies.map((s, i) => (
          <div key={i}>
            <h3>{[t(s?.name), t(s?.tag)].filter(Boolean).join(" — ")}</h3>
            <Paras items={[t(s?.goal), t(s?.focus)].filter(Boolean)} />
          </div>
        ))}
      </section>
      <section>
        <h2>{join(d?.pmUniverseHeadingLine1, d?.pmUniverseHeadingLine2)}</h2>
        <Paras items={list(d?.pmUniverseParagraphs)} />
      </section>
      <p>
        <a href="/de">Tellian Capital</a> · <a href="/anlagestrategien">Anlagestrategien</a> ·{" "}
        <a href="/vermoegensverwaltung">Vermögensverwaltung</a>
      </p>
    </>
  );
}

const LEGAL = {
  impressum: { prefix: "legalImpressum", fallback: "Impressum" },
  datenschutz: { prefix: "legalDatenschutz", fallback: "Datenschutzerklärung" },
  kundeninformation: { prefix: "legalKundeninformation", fallback: "Kundeninformation" },
} as const;

function Legal({ d, route }: { d: Doc; route: keyof typeof LEGAL }) {
  const { t, list } = textHelpers("de");
  const { prefix, fallback } = LEGAL[route];
  const sections = (d?.[`${prefix}Sections`] ?? []) as Doc[];
  return (
    <>
      <header>
        <h1>{t(d?.[`${prefix}Title`]) || fallback}</h1>
        <p>{t(d?.[`${prefix}Updated`])}</p>
      </header>
      {sections.map((s, i) => (
        <section key={i}>
          <h2>{t(s?.heading)}</h2>
          <Paras items={list(s?.paragraphs)} />
          <Bullets items={list(s?.list)} />
        </section>
      ))}
      <p>
        <a href="/de">Tellian Capital</a>
      </p>
    </>
  );
}

export function SeoOutline({ route, homepage, lang = "de" }: { route: OutlineRoute; homepage: Doc; lang?: Lang }) {
  let body: React.ReactNode;
  switch (route) {
    case "home":
      body = <Home d={homepage} lang={lang} />;
      break;
    case "vermoegensverwaltung":
      body = <Vermoegensverwaltung d={homepage} />;
      break;
    case "anlagestrategien":
      body = <Anlagestrategien d={homepage} />;
      break;
    case "portfolio-management":
      body = <PortfolioManagement d={homepage} />;
      break;
    default:
      body = <Legal d={homepage} route={route} />;
  }
  /* Clipped to the viewport so the (covered) outline never makes the page
     scroll behind the preload screen. */
  return (
    <main data-seo-outline="" style={{ height: "100%", overflow: "hidden", padding: 24 }}>
      {body}
    </main>
  );
}
