"use client";

import { ANLAGEPROZESS_STEPS, type AnlageprozessStep } from "../data/anlageprozessSteps";
import { CtaButton } from "./CtaButton";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

const FALLBACK_FAQ: readonly FaqItem[] = [
  {
    question: "Wie funktioniert die Vermögensverwaltung auf Mandatsbasis?",
    answer:
      "Sie erteilen uns eine Verwaltungsvollmacht. Ihr Vermögen bleibt auf Ihrem eigenen Depot bei einer Kooperationsbank. Wir treffen die Anlageentscheide — Sie behalten die Kontrolle über Ihre Bankbeziehung.",
  },
  {
    question: "Wer entscheidet über Anlagen in meinem Portfolio?",
    answer:
      "Die Entscheidungen trifft unser Anlagekomitee, das monatlich tagt und Geschäftsleitung, Chef Anlagestrategie, internationale Partner Asset Manager und Experten für alternative Anlageklassen vereint. Bei ausserordentlichen Marktentwicklungen tagt das Komitee kurzfristig.",
  },
  {
    question: "Wie oft erhalte ich ein Reporting?",
    answer:
      "Vierteljährlich, automatisch und konsolidiert. Auf Wunsch mit kundenspezifischen Zusatzauswertungen. Zusätzlich haben Sie jederzeit Einblick in Ihr Kundenportal.",
  },
];

/* ─── Design tokens ─── */
const C = {
  bg: "#F9F9F7",
  dark: "#1A1916",
  charcoal: "#3A3835",
  stone: "#8A857C",
  muted: "#B0ACA5",
  line: "#D8D5CF",
};

const serif = "var(--font-cormorant), serif";
const sans = "var(--font-inter), sans-serif";

interface AnlageprozessDetailProps {
  isMobile: boolean;
  /** Called when the user clicks the "Gespräch vereinbaren" CTA — should close detail mode. */
  onContactClick: () => void;
  homepage?: any;
}

/**
 * The detail body shown below the horizontal step-stepper when the
 * Vermögensverwaltung detail view is active.
 *
 * Does NOT include: header-bar, back-link, stepper (those live in the
 * overlay shell so the steps can share DOM with Section3Timeline).
 */
export function AnlageprozessDetail({
  isMobile,
  onContactClick,
  homepage,
}: AnlageprozessDetailProps) {
  const { t } = useLanguage();

  /* ── Build the per-step detail content from `methodDetailSteps[]`.
        Each missing field is filled from the bundled `ANLAGEPROZESS_STEPS`
        at the same index, so a partial CMS entry still renders cleanly. ── */
  type CmsDetailStep = {
    shortLabel?: LocaleValue;
    eyebrow?: LocaleValue;
    headline?: LocaleValue;
    subline?: LocaleValue;
    body?: LocaleValue[];
    bullets?: LocaleValue[];
    closing?: LocaleValue;
  };

  type RenderStep = {
    num: string;
    detailEyebrow: string;
    detailHeadline: string;
    detailSubline: string;
    detailBody: string[];
    detailBullets: string[];
    detailClosing?: string;
  };

  const cmsSteps: CmsDetailStep[] = (homepage?.methodDetailSteps ?? []).slice(0, 5);
  const STEPS: RenderStep[] = cmsSteps.map((s: CmsDetailStep, i: number): RenderStep => {
    const fb: AnlageprozessStep | undefined = ANLAGEPROZESS_STEPS[i];
    const num = String(i + 1).padStart(2, "0");
    const arrToStrings = (arr: LocaleValue[] | undefined, fallback: string[]) => {
      const cms = (arr ?? []).map((v) => t(v, "")).filter((s) => s.length > 0);
      return cms.length > 0 ? cms : fallback;
    };
    return {
      num,
      detailEyebrow: t(s.eyebrow, fb?.detailEyebrow ?? `Schritt ${num}`),
      detailHeadline: t(s.headline, fb?.detailHeadline ?? ""),
      detailSubline: t(s.subline, fb?.detailSubline ?? ""),
      detailBody: arrToStrings(s.body, fb?.detailBody ?? []),
      detailBullets: arrToStrings(s.bullets, fb?.detailBullets ?? []),
      detailClosing: t(s.closing, fb?.detailClosing ?? "") || undefined,
    };
  });

  /* If the CMS has no detail steps at all, render the original 5 hardcoded
     ones so the page never appears empty. */
  const RENDER_STEPS: RenderStep[] =
    STEPS.length > 0
      ? STEPS
      : ANLAGEPROZESS_STEPS.map((fb) => ({
          num: fb.num,
          detailEyebrow: fb.detailEyebrow,
          detailHeadline: fb.detailHeadline,
          detailSubline: fb.detailSubline,
          detailBody: fb.detailBody,
          detailBullets: fb.detailBullets,
          detailClosing: fb.detailClosing,
        }));

  /* ── FAQ items ── */
  type CmsFaq = { question?: LocaleValue; answer?: LocaleValue };
  const cmsFaq: FaqItem[] = (homepage?.methodFaqItems ?? [])
    .map((f: CmsFaq): FaqItem | null => {
      const question = t(f?.question, "");
      const answer = t(f?.answer, "");
      if (!question && !answer) return null;
      return { question, answer };
    })
    .filter((f: FaqItem | null): f is FaqItem => f !== null);
  const FAQ_ITEMS: readonly FaqItem[] = cmsFaq.length > 0 ? cmsFaq : FALLBACK_FAQ;

  /* ── Final CTA + footer ── */
  const ctaEyebrow = t(homepage?.methodDetailCtaEyebrow, "Nächster Schritt");
  const ctaHeading1 = t(homepage?.methodDetailCtaHeadingLine1, "Ein Gespräch ist");
  const ctaHeading2 = t(homepage?.methodDetailCtaHeadingLine2, "der Anfang.");
  const ctaDescription = t(
    homepage?.methodDetailCtaDescription,
    "Wenn Sie unseren Prozess bis hierher verfolgt haben — sprechen wir über Ihren. Ein erstes Gespräch ist unverbindlich, persönlich und vertraulich.",
  );
  const ctaButtonLabel = t(homepage?.methodDetailCtaButtonLabel, "Gespräch vereinbaren");
  const footerTagline = t(
    homepage?.methodDetailFooterTagline,
    "Tellian Capital AG — Est. 1996 — Zürich",
  );

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
      {RENDER_STEPS.map((step, i) => (
        <section
          key={step.num}
          style={{
            paddingTop: i === 0 ? "0" : isMobile ? "48px" : "72px",
            paddingBottom: isMobile ? "48px" : "72px",
            borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
          }}
        >
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
              {step.detailEyebrow}
            </span>

            <h2
              style={{
                fontFamily: serif,
                fontSize: isMobile ? "clamp(28px, 7vw, 36px)" : "32px",
                lineHeight: 1.12,
                color: C.dark,
                letterSpacing: "-0.02em",
                fontWeight: 400,
                margin: "16px 0 0 0",
              }}
            >
              {step.detailHeadline}
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
              {step.detailSubline}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {step.detailBody.map((text, j) => (
                <p
                  key={j}
                  style={{
                    fontFamily: sans,
                    fontSize: "14px",
                    color: C.charcoal,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "16px 0 0 0",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {step.detailBullets.map((bullet, j) => (
                <li
                  key={j}
                  style={{
                    fontFamily: sans,
                    fontSize: "14px",
                    color: C.charcoal,
                    lineHeight: 1.7,
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <span aria-hidden style={{ color: C.stone, flexShrink: 0 }}>
                    —
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {step.detailClosing && (
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "14px",
                  color: C.charcoal,
                  lineHeight: 1.7,
                  margin: "24px 0 0 0",
                }}
              >
                {step.detailClosing}
              </p>
            )}
          </div>
        </section>
      ))}

      {/* ═══ FAQ — thematic questions about the Mandat & process ═══ */}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          paddingTop: isMobile ? "48px" : "72px",
          paddingBottom: isMobile ? "8px" : "16px",
        }}
      >
        <FaqAccordion items={FAQ_ITEMS} schemaId="vermoegensverwaltung" />
      </div>

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
          {ctaHeading1} <em style={{ fontStyle: "italic", fontWeight: 400 }}>{ctaHeading2}</em>
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
