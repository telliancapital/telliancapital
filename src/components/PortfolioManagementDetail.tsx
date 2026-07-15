import { CtaButton } from "./CtaButton";
import { C, serif, sans } from "@/tokens";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import {
  PM_HERO,
  PM_PROCESS_STAGES,
  PM_PROCESS_BODY,
  PM_STRATEGIES,
  PM_TEXT_SECTIONS,
} from "../data/portfolioManagementSections";

/* ═══════════════════════════════════════════════════════════
   PORTFOLIO MANAGEMENT — Subpage detail body.
   4 Sektionen: Prozess → Komitee → Strategien → Universum.
   Keine Verwahrung (MANDAT deckt das ab).
   Alle Texte CMS-gestützt (homepage.pm*), Fallback = Bundled German.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  isMobile: boolean;
  onContactClick: () => void;
  homepage?: any;
}

export function PortfolioManagementDetail({ isMobile, onContactClick, homepage }: Props) {
  const { t } = useLanguage();
  const sectionPad = {
    paddingTop: isMobile ? "48px" : "72px",
    paddingBottom: isMobile ? "48px" : "72px",
  };
  const hSize = isMobile ? "clamp(28px, 7vw, 36px)" : "32px";

  /* ── Intro paragraphs ── */
  const cmsIntroParagraphs: string[] = (homepage?.pmIntroParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const introParagraphs = cmsIntroParagraphs.length > 0 ? cmsIntroParagraphs : [...PM_HERO.intro];

  /* ── Section 1 — Anlageprozess ── */
  const processEyebrow = t(homepage?.pmProcessEyebrow, "Anlageprozess");
  const processHeadingLine1 = t(homepage?.pmProcessHeadingLine1, "Der Weg zum");
  const processHeadingLine2 = t(homepage?.pmProcessHeadingLine2, "Portfolio.");
  const processClosing = t(homepage?.pmProcessClosing, PM_PROCESS_BODY);

  type CmsStage = { name?: LocaleValue; bullets?: LocaleValue[] };
  const cmsStages: CmsStage[] = homepage?.pmProcessStages ?? [];
  const processStages = PM_PROCESS_STAGES.map((fb, i) => {
    const cms = cmsStages[i];
    const cmsBullets = (cms?.bullets ?? []).map((b) => t(b, "")).filter((b) => b.length > 0);
    return {
      name: t(cms?.name, fb.name),
      bullets: cmsBullets.length > 0 ? cmsBullets : fb.bullets,
    };
  });

  /* ── Section 2 — Anlagekomitee ── */
  const committeeEyebrow = t(homepage?.pmCommitteeEyebrow, PM_TEXT_SECTIONS[0].eyebrow);
  const committeeHeadingLine1 = t(homepage?.pmCommitteeHeadingLine1, PM_TEXT_SECTIONS[0].headlineBefore);
  const committeeHeadingLine2 = t(homepage?.pmCommitteeHeadingLine2, PM_TEXT_SECTIONS[0].headlineItalic);
  const cmsCommitteeParagraphs: string[] = (homepage?.pmCommitteeParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const committeeParagraphs =
    cmsCommitteeParagraphs.length > 0 ? cmsCommitteeParagraphs : PM_TEXT_SECTIONS[0].paragraphs;

  /* ── Section 3 — Anlagestrategien ── */
  const strategiesEyebrow = t(homepage?.pmStrategiesEyebrow, "Anlagestrategien");
  const strategiesHeadingLine1 = t(homepage?.pmStrategiesHeadingLine1, "Sieben Strategien,");
  const strategiesHeadingLine2 = t(homepage?.pmStrategiesHeadingLine2, "frei kombinierbar.");
  const strategiesSubline = t(
    homepage?.pmStrategiesSubline,
    "Sie legen eine oder mehrere Strategien für Ihr Portfolio fest und bestimmen die Gewichtung selbst. Die angegebene Zielallokation ist eine Richtgrösse; im Rahmen der vertraglich vereinbarten Bandbreiten darf davon abgewichen werden.",
  );

  type CmsStrategy = {
    name?: LocaleValue;
    tag?: LocaleValue;
    goal?: LocaleValue;
    volatility?: LocaleValue;
    allocation?: LocaleValue;
    allocationLegend?: LocaleValue;
    focus?: LocaleValue;
  };
  const cmsStrategies: CmsStrategy[] = homepage?.pmStrategies ?? [];
  const strategies = PM_STRATEGIES.map((fb, i) => {
    const cms = cmsStrategies[i];
    return {
      name: t(cms?.name, fb.name),
      tag: t(cms?.tag, fb.tag),
      goal: t(cms?.goal, fb.goal),
      volatility: t(cms?.volatility, fb.volatility),
      allocation: t(cms?.allocation, fb.allocation),
      allocationLegend: t(cms?.allocationLegend, fb.allocationLegend ?? ""),
      focus: t(cms?.focus, fb.focus ?? ""),
    };
  });

  /* ── Section 4 — Anlageuniversum ── */
  const universeEyebrow = t(homepage?.pmUniverseEyebrow, PM_TEXT_SECTIONS[1].eyebrow);
  const universeHeadingLine1 = t(homepage?.pmUniverseHeadingLine1, PM_TEXT_SECTIONS[1].headlineBefore);
  const universeHeadingLine2 = t(homepage?.pmUniverseHeadingLine2, PM_TEXT_SECTIONS[1].headlineItalic);
  const cmsUniverseParagraphs: string[] = (homepage?.pmUniverseParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const universeParagraphs =
    cmsUniverseParagraphs.length > 0 ? cmsUniverseParagraphs : PM_TEXT_SECTIONS[1].paragraphs;

  /* ── Final CTA + footer ── */
  const ctaEyebrow = t(homepage?.pmCtaEyebrow, "Nächster Schritt");
  const ctaHeadingLine1 = t(homepage?.pmCtaHeadingLine1, "Ein Gespräch ist");
  const ctaHeadingLine2 = t(homepage?.pmCtaHeadingLine2, "der Anfang.");
  const ctaDescription = t(
    homepage?.pmCtaDescription,
    "Wenn Sie unseren Prozess bis hierher verfolgt haben — sprechen wir über Ihren. Ein erstes Gespräch ist unverbindlich, persönlich und vertraulich.",
  );
  const ctaButtonLabel = t(homepage?.pmCtaButtonLabel, "Gespräch vereinbaren");
  const footerTagline = t(homepage?.pmFooterTagline, "Tellian Capital AG — Est. 1996 — Zürich");

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: isMobile ? "16px 20px 40px" : "24px 48px 56px",
        fontFamily: sans,
        color: C.dark,
      }}
    >
      {/* ═══ Intro (below SubpageOverlay hero) ═══ */}
      <section style={{ paddingBottom: isMobile ? "48px" : "72px" }}>
        <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {introParagraphs.map((text, i) => (
            <p
              key={i}
              style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}
            >
              {text}
            </p>
          ))}
        </div>
      </section>

      {/* ═══ Sektion 1 — Anlageprozess (PROZESS) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.stone,
              display: "block",
            }}
          >
            {processEyebrow}
          </span>
          <h2
            style={{
              fontFamily: serif,
              fontSize: hSize,
              lineHeight: 1.12,
              color: C.dark,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: "16px 0 0 0",
            }}
          >
            {processHeadingLine1}{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{processHeadingLine2}</em>
          </h2>

          {/* 8 process stages */}
          <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: 0 }}>
            {processStages.map((stage, si) => (
              <div
                key={si}
                style={{
                  paddingTop: si === 0 ? 0 : "24px",
                  paddingBottom: "24px",
                  borderTop: si === 0 ? "none" : `1px solid ${C.line}`,
                }}
              >
                <span
                  style={{ fontFamily: serif, fontSize: "15px", color: C.dark, lineHeight: 1.3, display: "block" }}
                >
                  {stage.name}
                </span>
                {stage.bullets.length > 0 && (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "10px 0 0 0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {stage.bullets.map((b, bi) => (
                      <li
                        key={bi}
                        style={{
                          fontFamily: sans,
                          fontSize: "13px",
                          color: C.charcoal,
                          lineHeight: 1.6,
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <span aria-hidden style={{ color: C.stone, flexShrink: 0 }}>
                          —
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Begleitsatz */}
          <p
            style={{
              fontFamily: sans,
              fontSize: "14px",
              color: C.charcoal,
              lineHeight: 1.7,
              margin: "8px 0 0 0",
              fontStyle: "italic",
            }}
          >
            {processClosing}
          </p>
        </div>
      </section>

      {/* ═══ Sektion 2 — Anlagekomitee (KOMITEE) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.stone,
              display: "block",
            }}
          >
            {committeeEyebrow}
          </span>
          <h2
            style={{
              fontFamily: serif,
              fontSize: hSize,
              lineHeight: 1.12,
              color: C.dark,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: "16px 0 0 0",
            }}
          >
            {committeeHeadingLine1}{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{committeeHeadingLine2}</em>
          </h2>
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {committeeParagraphs.map((text, i) => (
              <p
                key={i}
                style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Sektion 3 — Anlagestrategien (STRATEGIEN, Option A: Zeilen) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.stone,
              display: "block",
            }}
          >
            {strategiesEyebrow}
          </span>
          <h2
            style={{
              fontFamily: serif,
              fontSize: hSize,
              lineHeight: 1.12,
              color: C.dark,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: "16px 0 0 0",
            }}
          >
            {strategiesHeadingLine1}{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{strategiesHeadingLine2}</em>
          </h2>
          <p
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "13px" : "14px",
              color: C.stone,
              lineHeight: 1.5,
              margin: "8px 0 32px 0",
            }}
          >
            {strategiesSubline}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {strategies.map((s, si) => (
              <div
                key={si}
                style={{
                  paddingTop: si === 0 ? 0 : "20px",
                  paddingBottom: "20px",
                  borderTop: si === 0 ? "none" : `1px solid ${C.line}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: serif, fontSize: "15px", color: C.dark, lineHeight: 1.3 }}>
                    {s.name}
                  </span>
                  <span style={{ fontFamily: sans, fontSize: "11px", color: C.stone, letterSpacing: "0.08em" }}>
                    ({s.tag})
                  </span>
                </div>
                <p style={{ fontFamily: sans, fontSize: "13px", color: C.charcoal, lineHeight: 1.6, margin: "6px 0 0 0" }}>
                  {s.goal}
                </p>
                {s.volatility && (
                  <p style={{ fontFamily: sans, fontSize: "12px", color: C.stone, lineHeight: 1.5, margin: "4px 0 0 0" }}>
                    {s.volatility}
                  </p>
                )}
                {s.allocation && (
                  <p style={{ fontFamily: sans, fontSize: "12px", color: C.stone, lineHeight: 1.5, margin: "4px 0 0 0" }}>
                    {s.allocation}
                    {s.allocationLegend ? ` (${s.allocationLegend})` : ""}
                  </p>
                )}
                {s.focus && (
                  <p
                    style={{
                      fontFamily: sans,
                      fontSize: "13px",
                      color: C.charcoal,
                      lineHeight: 1.6,
                      margin: "8px 0 0 0",
                      fontStyle: "italic",
                    }}
                  >
                    {s.focus}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Sektion 4 — Anlageuniversum (UNIVERSUM) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.stone,
              display: "block",
            }}
          >
            {universeEyebrow}
          </span>
          <h2
            style={{
              fontFamily: serif,
              fontSize: hSize,
              lineHeight: 1.12,
              color: C.dark,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: "16px 0 0 0",
            }}
          >
            {universeHeadingLine1}{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{universeHeadingLine2}</em>
          </h2>
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {universeParagraphs.map((text, i) => (
              <p
                key={i}
                style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ: pending — Inhalte folgen */}

      {/* ═══ Final CTA ═══ */}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          paddingTop: isMobile ? "48px" : "72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.stone,
          }}
        >
          {ctaEyebrow}
        </span>
        <h3
          style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(26px, 6vw, 32px)" : "32px",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            fontWeight: 400,
            margin: 0,
            color: C.dark,
          }}
        >
          {ctaHeadingLine1} <em style={{ fontStyle: "italic", fontWeight: 400 }}>{ctaHeadingLine2}</em>
        </h3>
        <p
          style={{
            fontFamily: sans,
            fontSize: "14px",
            color: C.charcoal,
            lineHeight: 1.7,
            maxWidth: "500px",
            margin: 0,
          }}
        >
          {ctaDescription}
        </p>
        <CtaButton
          href="/#contact"
          onClick={(e) => {
            e.preventDefault();
            onContactClick();
          }}
        >
          {ctaButtonLabel}
        </CtaButton>
      </div>

      {/* ═══ Footer ═══ */}
      <div
        style={{
          marginTop: "48px",
          padding: "32px 0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div style={{ width: "16px", height: "1px", backgroundColor: C.line }} />
        <span
          style={{
            fontFamily: sans,
            fontSize: "8px",
            letterSpacing: "0.16em",
            color: C.muted,
            opacity: 0.6,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {footerTagline}
        </span>
      </div>
    </div>
  );
}
