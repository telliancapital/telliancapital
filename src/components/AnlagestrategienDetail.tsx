"use client";

import { motion } from "motion/react";
import {
  ANLAGESTRATEGIEN_SECTIONS,
  type AnlagestrategienSection,
} from "../data/anlagestrategienSections";
import { CtaButton } from "./CtaButton";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import { C, serif, sans } from "@/tokens";

const FALLBACK_FAQ: readonly FaqItem[] = [
  {
    question: "Was unterscheidet Ihren quantitativen Ansatz von anderen?",
    answer:
      "Wir arbeiten seit 1996 mit quantitativen Modellen — deutlich vor dem Branchen-Mainstream. Diese Erfahrung steckt in unserem Prozess: Inhouse-Modelle, ein eigenes Anlagekomitee und ein internationales Netzwerk aus Partner Asset Managern und Marktexperten. Die Modelle treffen keine Entscheidungen für sich allein. Sie liefern die Grundlage, auf der das Komitee monatlich entscheidet.",
  },
  {
    question: "Wie schützen Sie mein Vermögen in volatilen Märkten?",
    answer:
      "Durch Disziplin im Prozess. Jede Position hat definierte Verlustschwellen. Wenn diese erreicht werden, handeln wir — unabhängig davon, ob die aktuelle Stimmung dafür oder dagegen spricht. Die strategische Allokation bleibt das Fundament, auch in nervösen Phasen. Bei ausserordentlichen Marktentwicklungen tagt das Anlagekomitee kurzfristig.",
  },
  {
    question: "Wie viel Risiko ist in welcher Strategie enthalten?",
    answer:
      "Jede Strategie hat definierte Risikokennzahlen und maximale Verlustgrenzen. Diese werden im Erstgespräch im Detail vorgestellt und regelmässig überwacht. Die Einhaltung der Risikovorgaben ist Teil unserer laufenden Verwaltung.",
  },
];

interface AnlagestrategienDetailProps {
  isMobile: boolean;
  /** Whether detail is currently visible — gates the FLIP ordinals */
  isDetail: boolean;
  /** Disable motion for reduced-motion users */
  reducedMotion: boolean;
  /** Called when the user clicks "Gespräch vereinbaren" */
  onContactClick: () => void;
  homepage?: any;
}

type RenderSection = {
  key: "topdown" | "bottomup";
  title: string;
  detailEyebrow: string;
  detailSubline: string;
  detailBody: string[];
  detailBullets: string[];
  detailClosing?: string;
};

/**
 * Long-scroll detail body for /anlagestrategien.
 * Contains two large sections (Top-Down + Bottom-Up), each with a
 * FLIP'd headline (matching the headlines in Section4TopDownBottomUp).
 */
export function AnlagestrategienDetail({
  isMobile,
  isDetail,
  reducedMotion,
  onContactClick,
  homepage,
}: AnlagestrategienDetailProps) {
  const enableFlip = !isMobile && !reducedMotion;
  const { t } = useLanguage();

  /* ── Build per-section content from CMS, with per-field fallback to the
        bundled `ANLAGESTRATEGIEN_SECTIONS` so a partial CMS entry still
        renders cleanly. ── */
  const arrToStrings = (arr: LocaleValue[] | undefined, fallback: string[]) => {
    const cms = (arr ?? []).map((v) => t(v, "")).filter((s) => s.length > 0);
    return cms.length > 0 ? cms : fallback;
  };

  const fbTop: AnlagestrategienSection | undefined = ANLAGESTRATEGIEN_SECTIONS.find(
    (s) => s.key === "topdown",
  );
  const fbBot: AnlagestrategienSection | undefined = ANLAGESTRATEGIEN_SECTIONS.find(
    (s) => s.key === "bottomup",
  );

  const SECTIONS: RenderSection[] = [
    {
      key: "topdown",
      title: t(homepage?.strategyTopDownTitle, fbTop?.title ?? "Top-Down"),
      detailEyebrow: t(
        homepage?.strategyTopDownDetailEyebrow,
        fbTop?.detailEyebrow ?? "Globale Perspektive",
      ),
      detailSubline: t(homepage?.strategyTopDownDetailSubline, fbTop?.detailSubline ?? ""),
      detailBody: arrToStrings(homepage?.strategyTopDownDetailBody, fbTop?.detailBody ?? []),
      detailBullets: arrToStrings(
        homepage?.strategyTopDownDetailBullets,
        fbTop?.detailBullets ?? [],
      ),
      detailClosing:
        t(homepage?.strategyTopDownDetailClosing, fbTop?.detailClosing ?? "") || undefined,
    },
    {
      key: "bottomup",
      title: t(homepage?.strategyBottomUpTitle, fbBot?.title ?? "Bottom-Up"),
      detailEyebrow: t(
        homepage?.strategyBottomUpDetailEyebrow,
        fbBot?.detailEyebrow ?? "Einzeltitel-Perspektive",
      ),
      detailSubline: t(homepage?.strategyBottomUpDetailSubline, fbBot?.detailSubline ?? ""),
      detailBody: arrToStrings(homepage?.strategyBottomUpDetailBody, fbBot?.detailBody ?? []),
      detailBullets: arrToStrings(
        homepage?.strategyBottomUpDetailBullets,
        fbBot?.detailBullets ?? [],
      ),
      detailClosing:
        t(homepage?.strategyBottomUpDetailClosing, fbBot?.detailClosing ?? "") || undefined,
    },
  ];

  /* ── FAQ items ── */
  type CmsFaq = { question?: LocaleValue; answer?: LocaleValue };
  const cmsFaq: FaqItem[] = (homepage?.strategyFaqItems ?? [])
    .map((f: CmsFaq): FaqItem | null => {
      const question = t(f?.question, "");
      const answer = t(f?.answer, "");
      if (!question && !answer) return null;
      return { question, answer };
    })
    .filter((f: FaqItem | null): f is FaqItem => f !== null);
  const FAQ_ITEMS: readonly FaqItem[] = cmsFaq.length > 0 ? cmsFaq : FALLBACK_FAQ;

  /* ── Final CTA + footer ── */
  const ctaEyebrow = t(homepage?.strategyDetailCtaEyebrow, "Nächster Schritt");
  const ctaPrefix = t(homepage?.strategyDetailCtaHeadingPrefix, "Reden wir über");
  const ctaItalic = t(homepage?.strategyDetailCtaHeadingItalic, "Ihre");
  const ctaSuffix = t(homepage?.strategyDetailCtaHeadingSuffix, "Strategie.");
  const ctaDescription = t(
    homepage?.strategyDetailCtaDescription,
    "Jede Strategie beginnt mit einer Frage: Was wollen Sie erreichen? Lassen Sie uns die Antwort zusammen finden.",
  );
  const ctaButtonLabel = t(homepage?.strategyDetailCtaButtonLabel, "Gespräch vereinbaren");
  const footerTagline = t(
    homepage?.strategyDetailFooterTagline,
    "Tellian Capital AG — Est. 1996 — Zürich",
  );

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: isMobile ? "16px 20px 40px" : "40px 48px 56px",
        fontFamily: sans,
        color: C.dark,
      }}
    >
      {/* Lead paragraph */}
      <div style={{ maxWidth: "760px", paddingBottom: isMobile ? "40px" : "56px" }}>
        <p
          style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}
        >
          Tellian Capital arbeitet seit 1996 mit einem quantitativen Anlageansatz — als eine der
          ersten Schweizer Vermögensverwaltungen. Damals war datengestützte Analyse in der
          Branche die Ausnahme. Heute ist sie Standard.
        </p>
        <p
          style={{
            fontFamily: sans,
            fontSize: "14px",
            color: C.charcoal,
            lineHeight: 1.7,
            margin: "20px 0 0 0",
          }}
        >
          Was uns unterscheidet, ist die Erfahrung von fast drei Jahrzehnten, in denen wir den
          Prozess durch Marktkrisen und regulatorische Umbrüche hindurch verfeinert haben.
        </p>
      </div>

      {SECTIONS.map((section, i) => (
        <section
          key={section.key}
          style={{
            paddingTop: i === 0 ? "0" : isMobile ? "56px" : "80px",
            paddingBottom: isMobile ? "56px" : "80px",
            borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
          }}
        >
          {/* Section header — FLIP target wrapped in motion.span so it lands here from Section4 */}
          <div style={{ maxWidth: "760px" }}>
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
              {section.detailEyebrow}
            </span>

            {/* FLIP'd headline — shares layoutId with the one in Section4TopDownBottomUp */}
            {isDetail && (
              <AnlagestrategienFlipTitle
                id={section.key}
                title={section.title}
                enableFlip={enableFlip}
                sizeDesktop="clamp(48px, 6vw, 72px)"
                sizeMobile="clamp(40px, 10vw, 56px)"
                isMobile={isMobile}
              />
            )}

            <p
              style={{
                fontFamily: sans,
                fontSize: isMobile ? "13px" : "14px",
                color: C.stone,
                lineHeight: 1.5,
                margin: "12px 0 32px 0",
              }}
            >
              {section.detailSubline}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {section.detailBody.map((text, j) => (
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
              {section.detailBullets.map((bullet, j) => (
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

            {section.detailClosing && (
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "14px",
                  color: C.charcoal,
                  lineHeight: 1.7,
                  margin: "24px 0 0 0",
                }}
              >
                {section.detailClosing}
              </p>
            )}
          </div>
        </section>
      ))}

      {/* ═══ Inhouse-Expertise ═══ */}
      <section
        style={{
          paddingTop: isMobile ? "56px" : "80px",
          paddingBottom: isMobile ? "56px" : "80px",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div style={{ maxWidth: "760px" }}>
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
            Inhouse-Expertise
          </span>
          <h2
            style={{
              fontFamily: serif,
              fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "32px",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: "14px 0 0 0",
              color: C.dark,
            }}
          >
            Wer hinter den Modellen steht
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "32px" }}>
            <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
              Beide Perspektiven werden von einem Netzwerk getragen, das über die quantitativen
              Modelle hinausgeht.
            </p>
            <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
              Das Anlagekomitee tagt monatlich und vereint:
            </p>
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
            {[
              "Geschäftsleitung und Chef Anlagestrategie",
              "Internationale Partner Asset Manager",
              "Marktexperten für alternative Anlageklassen",
            ].map((item, j) => (
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
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: "24px 0 0 0" }}>
            Hinzu kommen externe Quellen: Branchenexperten, Unternehmensanalysten und unabhängige
            Research Teams, mit denen wir in laufendem Austausch stehen.
          </p>
          <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: "20px 0 0 0" }}>
            Dieses Netzwerk stellt sicher, dass keine Anlageentscheidung aus einer einzelnen
            Sichtweise entsteht.
          </p>
        </div>
      </section>

      {/* ═══ Risikokontrolle ═══ */}
      <section
        style={{
          paddingTop: isMobile ? "56px" : "80px",
          paddingBottom: isMobile ? "56px" : "80px",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div style={{ maxWidth: "760px" }}>
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
            Risikokontrolle
          </span>
          <h2
            style={{
              fontFamily: serif,
              fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "32px",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: "14px 0 0 0",
              color: C.dark,
            }}
          >
            Wie wir Verluste begrenzen
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "32px" }}>
            <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
              Risikokontrolle ist kein nachgelagerter Schritt. Sie ist Teil jeder
              Allokationsentscheidung.
            </p>
            <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
              Was wir laufend prüfen:
            </p>
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
            {[
              "Überschreitung definierter Verlustschwellen",
              "Passive Verletzungen des Anlegerprofils durch Marktbewegungen",
              "Aktive Abweichungen durch Anlageentscheide",
              "Realisierung von Gewinnen nach klaren Regeln",
            ].map((item, j) => (
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
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: "24px 0 0 0" }}>
            Wenn eine Schwelle erreicht ist, handeln wir. Das ist im Prozess verankert — nicht
            eine Frage individueller Einschätzung im Moment.
          </p>
        </div>
      </section>

      {/* ═══ FAQ — thematic questions about strategy selection and adjustment ═══ */}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          paddingTop: isMobile ? "48px" : "72px",
          paddingBottom: isMobile ? "8px" : "16px",
        }}
      >
        <FaqAccordion items={FAQ_ITEMS} schemaId="anlagestrategien" />
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
          {ctaPrefix} <em style={{ fontStyle: "italic", fontWeight: 400 }}>{ctaItalic}</em>{" "}
          {ctaSuffix}
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

/* ─── Reusable FLIP'd title ─── */
function AnlagestrategienFlipTitle({
  id,
  title,
  enableFlip,
  sizeDesktop,
  sizeMobile,
  isMobile,
}: {
  id: string;
  title: string;
  enableFlip: boolean;
  sizeDesktop: string;
  sizeMobile: string;
  isMobile: boolean;
}) {
  const style: React.CSSProperties = {
    fontFamily: serif,
    fontSize: isMobile ? sizeMobile : sizeDesktop,
    lineHeight: 1.02,
    letterSpacing: "-0.02em",
    color: C.dark,
    fontWeight: 400,
    margin: "14px 0 0 0",
    display: "block",
  };

  if (!enableFlip) {
    return <h2 style={style}>{title}</h2>;
  }

  return (
    <motion.h2
      layoutId={`anlagestrategien-headline-${id}`}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: id === "bottomup" ? 0.08 : 0 }}
      style={style}
    >
      {title}
    </motion.h2>
  );
}
