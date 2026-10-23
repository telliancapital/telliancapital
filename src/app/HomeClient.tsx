"use client";

import { memo, useEffect, useState, useCallback, useMemo, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useSubpageMode } from "@/components/useSubpageMode";
import { SubpageOverlay } from "@/components/SubpageOverlay";
import { AnlageprozessDetail } from "@/components/AnlageprozessDetail";
import { AnlagestrategienDetail } from "@/components/AnlagestrategienDetail";
import { PortfolioManagementDetail } from "@/components/PortfolioManagementDetail";
import { ANLAGEPROZESS_STEPS } from "@/data/anlageprozessSteps";
import { AnlageprozessStepOrdinal, ORDINAL_FONT_SIZE } from "@/components/AnlageprozessStepOrdinal";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";
import { Kopfzeile } from "@/components/Kopfzeile";
import { MobilMenue } from "@/components/MobilMenue";
import { PreloadScreen } from "@/components/PreloadScreen";
import { useBandZonen } from "@/components/useBandTon";
import { useVerticalSectionIndex } from "@/components/useVerticalSectionIndex";
import { SECTIONS, sectionOrdinal, leisteSektionen, activeIndexFromProgress, type Sprache } from "@/sections";
import { LoginOverlay } from "@/components/LoginOverlay";
import { LegalPage, useLegalRoute } from "@/components/LegalPage";
import { useHorizontalScroll } from "@/components/useHorizontalScroll";
import { useBreakpoint } from "@/components/useBreakpoint";
import {
  ScrollImage,
  HeroExpandingImage,
  ParallaxText,
  ScrollFade,
} from "@/components/ScrollAnimations";
import { DotNavigation } from "@/components/DotNavigation";
import { CtaButton } from "@/components/CtaButton";
import { SectionEnteredProvider } from "@/components/SectionEntry";
import { Station1Einstieg } from "@/components/Station1Einstieg";
import { StationVermoegensverwaltung } from "@/components/StationVermoegensverwaltung";
import { StationVorteile } from "@/components/StationVorteile";
import { StationGeschaeftsbeziehungen } from "@/components/StationGeschaeftsbeziehungen";
import { StationTeam } from "@/components/StationTeam";
import { StationKontakt } from "@/components/StationKontakt";

/* ── Stationen memoisiert ──
   Beim Stationswechsel ändern sich in HomeClient nur activeIndex und
   der Eintritts-Latch EINER Station. Ohne memo rendern trotzdem alle
   sechs Stationen neu (gemessen ein 90-ms-Ruckler je Wechsel bei
   vierfach gedrosselter CPU). Alle Props der breiten Spur sind
   referenzstabil (useCallback-Handler, CMS-Dokument, Konstanten);
   Sprache und Eintritt kommen per Context an den memoisierten
   Komponenten vorbei. (14.10., Scroll-Performance) */
const Station1EinstiegM = memo(Station1Einstieg);
const StationVermoegensverwaltungM = memo(StationVermoegensverwaltung);
const StationVorteileM = memo(StationVorteile);
const StationGeschaeftsbeziehungenM = memo(StationGeschaeftsbeziehungen);
const StationTeamM = memo(StationTeam);
const StationKontaktM = memo(StationKontakt);
import { UnterseiteMandat } from "@/components/UnterseiteMandat";
import { UnterseiteAdvisory } from "@/components/UnterseiteAdvisory";
import { zweiZeilenRegel } from "@/zweiZeilen";
import { solutionsSiteUrl } from "@/sanity/env";
import { ExpandableBody } from "@/components/ExpandableBody";
import { ParteiDreieck } from "@/components/ParteiDreieck";
import { LAYOUT, TEXT_COLUMN_STYLE, getLayout, getTextColumnStyle, SPACING } from "@/layout";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import { C, serif, sans } from "../tokens";
import { EASE } from "../styles/motion";

// const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/* ══════════════════════════════════════════════════════════
   CONTACT FORM — minimalist line inputs
   ═══════════════════════════════════════════════════════════ */
/* ── Bänder mit eigener Tonmessung ──
   useBandZonen misst je Frame, welche Stationsflächen unter Kopfzeile
   und Stationsleiste liegen, und liefert beim Scrollen fast jeden Frame
   neue Zonen. Lag dieser State in HomeClient, renderte die GANZE Seite
   samt sechs Stationen 60-mal pro Sekunde (gemessen ~90 ms je Frame bei
   vierfach gedrosselter CPU). In diesen Hüllen bleibt der Frame-State
   bei den zwei kleinen Bändern. (14.10., Scroll-Performance) */
type KopfzeileProps = Omit<React.ComponentProps<typeof Kopfzeile>, "zonen">;
function KopfzeileBand({ aktiv, activeIndex, ...rest }: KopfzeileProps & { aktiv: boolean; activeIndex: number }) {
  const zonen = useBandZonen(aktiv, activeIndex, "oben");
  return <Kopfzeile zonen={zonen} {...rest} />;
}

type DotNavigationProps = Omit<React.ComponentProps<typeof DotNavigation>, "zonen">;
function DotNavigationBand({ aktiv, ...rest }: DotNavigationProps & { aktiv: boolean }) {
  const zonen = useBandZonen(aktiv, rest.activeIndex, "unten");
  return <DotNavigation zonen={zonen} {...rest} />;
}

function ContactForm({ scrollX, isVertical = false }: { scrollX: number; isVertical?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: sans,
    color: C.dark,
    backgroundColor: "transparent",
    borderBottom: `1px solid ${C.line}`,
    outline: "none",
    padding: "12px 0 10px 0",
    width: "100%",
    transition: "border-color 0.4s ease",
  };

  return (
    <div className="w-full max-w-[380px]">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col gap-8"
          >
            <input
              type="text"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                ...inputStyle,
                fontSize: "12px",
                letterSpacing: "0.04em",
              }}
              className="placeholder:text-[#B0ACA5] focus:border-[#8A857C]"
            />
            <input
              type="email"
              placeholder="E-Mail"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                ...inputStyle,
                fontSize: "12px",
                letterSpacing: "0.04em",
              }}
              className="placeholder:text-[#B0ACA5] focus:border-[#8A857C]"
            />
            <textarea
              placeholder="Ihre Nachricht"
              required
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{
                ...inputStyle,
                fontSize: "12px",
                letterSpacing: "0.04em",
                resize: "none",
              }}
              className="placeholder:text-[#B0ACA5] focus:border-[#8A857C]"
            />
            <CtaButton
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              Anfrage senden
            </CtaButton>
          </motion.form>
        ) : (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.0,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2,
            }}
            className="flex flex-col items-start"
          >
            <span
              style={{
                fontFamily: serif,
                color: C.dark,
                lineHeight: 1.15,
              }}
              className="text-[clamp(1.4rem,2.5vw,2.2rem)] tracking-[-0.015em]"
            >
              Vielen Dank.
            </span>
            <span
              style={{
                fontFamily: sans,
                color: C.charcoal,
                lineHeight: 1.8,
              }}
              className="mt-5 max-w-[300px] text-[11px]"
            >
              Wir melden uns innerhalb von zwei Arbeitstagen bei Ihnen. Wenn Sie vorher Fragen
              haben, erreichen Sie uns unter +41 44 224 40 24.
            </span>
            <div className="mt-8 h-[1px] w-8" style={{ backgroundColor: C.line }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE / TABLET SUBPAGE OVERLAYS
   Plain fade (no FLIP) using the shared SubpageOverlay shell.
   ═══════════════════════════════════════════════════════════ */
function VermoegensverwaltungMobileOverlay({
  isOpen,
  onClose,
  onContactClick,
  homepage,
  detailEyebrow,
  detailHeadingLine1,
  detailHeadingLine2,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
  homepage?: any;
  detailEyebrow: string;
  detailHeadingLine1: string;
  detailHeadingLine2: string;
}) {
  return (
    <SubpageOverlay
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={detailEyebrow}
      headline={
        <>
          {detailHeadingLine1}
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>{detailHeadingLine2}</em>
        </>
      }
    >
      <AnlageprozessDetail isMobile={true} onContactClick={onContactClick} homepage={homepage} />
    </SubpageOverlay>
  );
}

function AnlagestrategienMobileOverlay({
  isOpen,
  onClose,
  onContactClick,
  homepage,
  detailEyebrow,
  detailHeadingLine1,
  detailHeadingLine2,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
  homepage?: any;
  detailEyebrow: string;
  detailHeadingLine1: string;
  detailHeadingLine2: string;
}) {
  return (
    <SubpageOverlay
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={detailEyebrow}
      headline={
        <>
          {detailHeadingLine1}
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>{detailHeadingLine2}</em>
        </>
      }
    >
      <AnlagestrategienDetail
        isMobile={true}
        isDetail={isOpen}
        reducedMotion={true}
        onContactClick={onContactClick}
        homepage={homepage}
      />
    </SubpageOverlay>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — VERMÖGENSVERWALTUNG
   Has two view modes:
   • overview (default): standard section with text left + timeline right
   • detail: fixed fullscreen, horizontal stepper, detail content below
   The same DOM is used — only CSS classes change.
   ══════════════════════════════════════════════════════════ */
interface Section3Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: "mobile" | "tablet" | "desktop";
  viewMode?: "overview" | "detail";
  onOpenDetail?: () => void;
  onCloseDetail?: () => void;
  onContactClick?: () => void;
  homepage?: any;
  /** Nur die Unterseite /vermoegensverwaltung rendern — die Station im
      Track ist seit dem Redesign StationVermoegensverwaltung. */
  nurUnterseite?: boolean;
}

function Section3Vermoegensverwaltung({
  scrollX,
  isVertical = false,
  breakpoint = "desktop" as const,
  viewMode = "overview",
  onOpenDetail,
  onCloseDetail,
  onContactClick,
  homepage,
  nurUnterseite = false,
}: Section3Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const reducedMotion = usePrefersReducedMotion();
  const { t } = useLanguage();
  const isDetail = viewMode === "detail";

  const handleAnlageprozess = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onOpenDetail?.();
  };

  const handleContactClick = () => {
    onContactClick?.();
  };

  const handleBackClick = () => {
    onCloseDetail?.();
  };

  const fallbackParagraphs = [
    "Tellian Capital verwaltet Vermögen auf Mandatsbasis. Das bedeutet: Sie erteilen uns eine Verwaltungsvollmacht, Ihr Vermögen bleibt auf Ihrem eigenen Depot bei einer Kooperationsbank. Wir treffen die Anlageentscheide — Sie behalten die Kontrolle über Ihre Bankbeziehung.",
    "Jeder Kunde erhält ein eigenes Portfolio. Keine Modellportfolios, keine Standardallokation. Die Zusammenstellung richtet sich nach Ihren Zielen, Ihrer Risikotoleranz und Ihrer finanziellen Gesamtsituation.",
    "Der Weg zum Portfolio folgt einem klaren Ablauf: Zuerst definieren wir gemeinsam Ihre Anlageziele. Dann prüfen wir Risikotoleranz und Eignung. Auf dieser Basis filtern wir das Investmentuniversum, bestimmen die Vermögensallokation und bauen Ihr Portfolio auf. Danach beginnt die aktive Verwaltung.",
    "Anlageentscheide trifft nicht eine einzelne Person. Das Anlagekomitee von Tellian Capital tagt monatlich und vereint Geschäftsleitung, Chef Anlagestrategie, internationale Partner Asset Manager und Experten für alternative Anlageklassen. Bei ausserordentlichen Marktentwicklungen tagt das Komitee kurzfristig. Entschieden wird mit einfachem Mehr.",
    "Die Portfolios folgen einer Core-/Satelliten-Struktur. Der Kern besteht aus Positionen mit einem Anlagehorizont von drei bis fünf Jahren. Der Satellitenanteil nutzt kurzfristige Marktchancen und taktische Opportunitäten. Die Gewichtung zwischen beiden wird vom Anlagekomitee festgelegt.",
    "Ihr Portfolio wird laufend überwacht. Definierte Verlustschwellen, aktive Kontrolle der Anlegerprofile und ein klarer Prozess für Gewinnmitnahmen sind Teil der Verwaltung. Die Berichterstattung erfolgt vierteljährlich — automatisch, konsolidiert und bei Bedarf mit kundenspezifischen Zusatzauswertungen.",
  ];

  const cmsParagraphs: string[] = (homepage?.methodParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const bodyParagraphs = cmsParagraphs.length > 0 ? cmsParagraphs : fallbackParagraphs;

  const eyebrowText = t(homepage?.methodEyebrow, "Vermögensverwaltung");
  const headingLine1 = t(homepage?.methodHeadingLine1, "Ihr Vermögen.");
  const headingLine2 = t(homepage?.methodHeadingLine2, "Ihr Konto.");
  const headingLine3 = t(homepage?.methodHeadingLine3, "Unsere Verantwortung.");
  const ctaLabel = t(homepage?.methodCtaLabel, "Mehr zur Vermögensverwaltung");
  const detailEyebrow = t(homepage?.methodDetailEyebrow, "Anlageprozess");
  const detailHeadingLine1 = t(homepage?.methodDetailHeadingLine1, "Die Methode hinter");
  const detailHeadingLine2 = t(homepage?.methodDetailHeadingLine2, "jedem Entscheid.");

  /* Horizontal stepper at the top of the detail overlay.
     Prefer the localized `shortLabel` from `methodDetailSteps[]`; fall back
     to the bundled ANLAGEPROZESS_STEPS entry per index. */
  type CmsStepperEntry = { shortLabel?: LocaleValue; headline?: LocaleValue };
  const cmsStepperSteps: CmsStepperEntry[] = (homepage?.methodDetailSteps ?? []).slice(0, 5);
  const stepperItems: { num: string; shortLabel: string }[] =
    cmsStepperSteps.length > 0
      ? cmsStepperSteps.map((s, i) => {
          const fallback = ANLAGEPROZESS_STEPS[i];
          const cmsLabel = t(s.shortLabel, "");
          const cmsHeadline = t(s.headline, "");
          return {
            num: String(i + 1).padStart(2, "0"),
            shortLabel: cmsLabel || fallback?.shortLabel || cmsHeadline || "",
          };
        })
      : ANLAGEPROZESS_STEPS.map((s) => ({ num: s.num, shortLabel: s.shortLabel }));

  if (isVertical) {
    if (nurUnterseite) {
      return (
        <VermoegensverwaltungMobileOverlay
          isOpen={isDetail}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
          homepage={homepage}
          detailEyebrow={detailEyebrow}
          detailHeadingLine1={detailHeadingLine1}
          detailHeadingLine2={detailHeadingLine2}
        />
      );
    }
    return (
      <section id="section-vermoegensverwaltung" style={{ backgroundColor: C.bg }}>
        {/* Text content — comes FIRST on mobile/tablet */}
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
              }}
              className="uppercase"
            >
              {eyebrowText}
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize:
                  breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              {headingLine1}
              <br />
              {headingLine2}
              <br />
              <em>{headingLine3}</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody }}>
              <ExpandableBody
                paragraphs={bodyParagraphs}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>
        </div>

        {/* Partei-Dreieck — comes AFTER text on mobile/tablet */}
        <div
          style={{
            width: "100%",
            padding: breakpoint === "mobile" ? "32px 20px" : "40px 32px",
          }}
        >
          <ParteiDreieck compact onNavigate={() => onOpenDetail?.()} homepage={homepage} />
        </div>

        {/* CTA — AFTER the visual element on mobile */}
        <ScrollFade scrollX={0} isVertical yOffset={16}>
          <div style={{ padding: breakpoint === "mobile" ? "0 20px 32px" : "0 32px 32px" }}>
            <CtaButton href="/vermoegensverwaltung" onClick={handleAnlageprozess}>
              {ctaLabel}
            </CtaButton>
          </div>
        </ScrollFade>
        {/* Detail overlay for mobile/tablet — plain fade (no FLIP) */}
        <VermoegensverwaltungMobileOverlay
          isOpen={isDetail}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
          homepage={homepage}
          detailEyebrow={detailEyebrow}
          detailHeadingLine1={detailHeadingLine1}
          detailHeadingLine2={detailHeadingLine2}
        />
      </section>
    );
  }

  /* ── OVERVIEW section (always rendered inside the scroll strip) ── */
  const overviewMarkup = (
    <div
      className="relative h-screen flex-shrink-0"
      style={{ width: layout.sectionWidth, backgroundColor: C.bg }}
      data-tellian-station="2"
    >
      {/* Content wrapper — no sticky/scroll-lock, standard flow */}
      <div style={{ position: "relative", width: layout.sectionWidth, height: "100%" }}>
        <ParteiDreieck onNavigate={() => onOpenDetail?.()} homepage={homepage} />

        <div
          className="relative z-10 flex h-full flex-col justify-center"
          style={{
            ...textColStyle,
            width: "44vw" /* Narrowed from 56vw — aligns with dark panel edge at 44vw */,
            backgroundColor: C.bg /* Opaque — prevents dark panel bleeding through */,
            maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
            opacity: isDetail ? 0 : 1,
            transform: isDetail ? "translateX(-50px)" : "translateX(0)",
            transition: `opacity 500ms ${EASE.standard}, transform 500ms ${EASE.standard}`,
            pointerEvents: isDetail ? "none" : "auto",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              color: C.stone,
              display: "block",
            }}
            className="uppercase"
          >
            {eyebrowText}
          </span>

        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.dark,
            marginTop: SPACING.eyebrowToAccent,
          }}
        />

        <h2
          style={{
            fontFamily: serif,
            fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94,
            color: C.dark,
            letterSpacing: "-0.03em",
            marginTop: SPACING.accentToHeadline,
          }}
        >
          {headingLine1}
          <br />
          {headingLine2}
          <br />
          <em>{headingLine3}</em>
        </h2>

        <div
          style={{
            marginTop: SPACING.headlineToBody,
            maxWidth: layout.bodyMaxWidth,
            display: "flex",
            flexDirection: "column",
            gap: SPACING.bodyParagraphGap,
          }}
        >
          {bodyParagraphs.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans,
                fontSize: "clamp(11px, 1.6vh, 16px)",
                color: C.charcoal,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}

          {/* CTA — inline with body text, left-aligned */}
          <a
            href="/vermoegensverwaltung"
            onClick={handleAnlageprozess}
            className="inline-flex items-center gap-3 uppercase"
            style={{
              marginTop: "56px",
              padding: "16px 24px",
              border: `1px solid ${C.button}`,
              borderRadius: 0,
              backgroundColor: C.button,
              fontFamily: sans,
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: C.dark,
              textDecoration: "none",
              lineHeight: 1,
              alignSelf: "flex-start",
              transition: "background-color 250ms ease-out",
            }}
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
      </div>
    </div>
  );

  /* ── DETAIL overlay (rendered via Portal to body) ── */
  const detailOverlay =
    typeof document !== "undefined" &&
    createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          backgroundColor: C.bg,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          opacity: isDetail ? 1 : 0,
          pointerEvents: isDetail ? "auto" : "none",
          visibility: isDetail ? "visible" : "hidden",
          transition: `opacity 400ms ease-out, visibility 0s linear ${isDetail ? "0s" : "800ms"}`,
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
            opacity: isDetail ? 1 : 0,
            transition: `opacity 300ms ease-out ${isDetail ? "900ms" : "0ms"}`,
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
            Tellian
          </span>
          <button
            onClick={handleBackClick}
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

        {/* ═══ Hero title ═══ */}
        <div
          style={{
            textAlign: "center",
            padding: "80px 48px 40px",
            opacity: isDetail ? 1 : 0,
            transform: isDetail ? "translateY(0)" : "translateY(-12px)",
            transition: `opacity 600ms ease-out ${isDetail ? "500ms" : "0ms"}, transform 600ms ${EASE.standard} ${isDetail ? "500ms" : "0ms"}`,
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
            {detailEyebrow}
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
            {detailHeadingLine1}
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{detailHeadingLine2}</em>
          </h1>
        </div>

        {/* ═══ Horizontal Stepper ═══ Container is always opaque — only labels
             and connector lines fade in. Step ordinals are FLIP targets and
             need stable parent opacity for Framer Motion's layoutId to work. */}
        <div
          style={{
            padding: "40px 48px 56px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "clamp(24px, 3vw, 48px)",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            {stepperItems.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: "clamp(24px, 3vw, 48px)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    padding: "8px 4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "center",
                    minWidth: "80px",
                  }}
                >
                  {/* Step ordinal — kept as a FLIP target (shared layoutId) for when
                    another overview element renders it; currently fades in on its own
                    since the Partei-Dreieck visual has no matching ordinal. */}
                  {isDetail && (
                    <AnlageprozessStepOrdinal
                      num={step.num}
                      color={C.dark}
                      opacity={0.2}
                      enableFlip={!reducedMotion}
                      layoutDelay={i * 0.08}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: "11px",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: C.stone,
                      whiteSpace: "nowrap",
                      opacity: isDetail ? 1 : 0,
                      transform: isDetail ? "translateY(0)" : "translateY(6px)",
                      transition: `opacity 400ms ease-out ${isDetail ? `${500 + i * 80}ms` : "0ms"}, transform 400ms ${EASE.standard} ${isDetail ? `${500 + i * 80}ms` : "0ms"}`,
                    }}
                  >
                    {step.shortLabel}
                  </span>
                </div>

                {/* Connector line — grows AFTER the FLIP completes.
                  Last FLIP ends at ~1.1s (4 steps × 80ms delay + 800ms duration).
                  Lines start at 1100ms with 80ms stagger. */}
                {i < stepperItems.length - 1 && (
                  <div
                    aria-hidden
                    style={{
                      width: "clamp(32px, 4vw, 64px)",
                      height: "0.5px",
                      backgroundColor: C.line,
                      marginTop: "48px",
                      flexShrink: 0,
                      transformOrigin: "left center",
                      transform: isDetail ? "scaleX(1)" : "scaleX(0)",
                      transition: `transform 450ms ${EASE.standard} ${isDetail ? `${1100 + i * 80}ms` : "0ms"}`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Detail body ═══ */}
        <div
          style={{
            opacity: isDetail ? 1 : 0,
            transform: isDetail ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 500ms ease-out ${isDetail ? "900ms" : "0ms"}, transform 500ms ${EASE.standard} ${isDetail ? "900ms" : "0ms"}`,
          }}
        >
          <AnlageprozessDetail
            isMobile={false}
            onContactClick={handleContactClick}
            homepage={homepage}
          />
        </div>
      </div>,
      document.body,
    );

  /* LayoutGroup enables Framer Motion's layoutId matching across React portals,
     so any overview element sharing a layoutId with the Portal overlay's ordinals
     can be recognized as the same element for a FLIP transition. */
  return (
    <LayoutGroup>
      {!nurUnterseite && overviewMarkup}
      {detailOverlay}
    </LayoutGroup>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — ANLAGESTRATEGIEN
   ═══════════════════════════════════════════════════════════ */
interface Section4Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: "mobile" | "tablet" | "desktop";
  viewMode?: "overview" | "detail";
  onOpenDetail?: () => void;
  onCloseDetail?: () => void;
  onContactClick?: () => void;
  /** Opens the Portfolio Management detail subpage (CTA "Mehr zum Anlageprozess") */
  onNavigateToProcess?: () => void;
  homepage?: any;
  /** Nur die Unterseite /anlagestrategien rendern — die Station im
      Track ist seit dem Redesign StationVorteile. */
  nurUnterseite?: boolean;
}

function Section4Anlagestrategien({
  scrollX,
  isVertical = false,
  breakpoint = "desktop" as const,
  viewMode = "overview",
  onCloseDetail,
  onContactClick,
  onNavigateToProcess,
  homepage,
  nurUnterseite = false,
}: Section4Props) {
  void scrollX;
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const { t } = useLanguage();
  const isDetail = viewMode === "detail";
  const reducedMotion = usePrefersReducedMotion();

  const handleNavigateToProcess = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigateToProcess?.();
  };

  /* Overview copy — reframed around Portfolio Management (see the new
     /portfolio-management subpage). CMS-driven via the strategy* fields,
     which were freed up by this redesign for exactly this content. */
  const overviewEyebrow = t(homepage?.strategyEyebrow, "Portfolio Management");
  const overviewHeadingLine1 = t(homepage?.strategyHeadingLine1, "Methode statt");
  const overviewHeadingLine2 = t(homepage?.strategyHeadingLine2, "Zufall.");

  const fallbackBodyParagraphs = [
    "Jede Anlageentscheidung bei Tellian Capital folgt einem klaren, nachvollziehbaren Prozess. Von den Leitprinzipien über Ihr persönliches Anlegerprofil bis zur strategischen und taktischen Allokation — nichts entsteht aus Marktstimmung, alles aus Methode.",
    "Das Ergebnis ist eine individuelle Portfolio-Konstruktion, die laufend überwacht und transparent berichtet wird. So bleibt Ihr Portfolio jederzeit auf Ihre Ziele ausgerichtet.",
  ];
  const cmsBodyParagraphs: string[] = (homepage?.strategyParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const bodyParagraphs = cmsBodyParagraphs.length > 0 ? cmsBodyParagraphs : fallbackBodyParagraphs;

  const overviewCtaLabel = t(homepage?.strategyCtaLabel, "Mehr zum Anlageprozess");

  /* Flowchart — fixed-size tiers merged with CMS overrides; falls back
     to the original hardcoded labels whenever a CMS array is empty. */
  const fallbackFlowchartTier1 = ["Leitprinzipien", "Investment-Philosophie"];
  const fallbackFlowchartTier2 = [
    "Innovatives Portfolio-Management",
    "Zugang zu einzigartigen Investmentmöglichkeiten",
    "Inhouse-Expertise & internationales Netzwerk",
  ];
  const fallbackFlowchartTier3 = ["Strategische Allokation", "Taktische Allokation"];
  const fallbackFlowchartTier5 = ["Überwachung", "Reporting"];

  const cmsFlowchartTier1: string[] = (homepage?.strategyFlowchartTier1 ?? [])
    .map((v: LocaleValue) => t(v, ""))
    .filter((v: string) => v.length > 0);
  const flowchartTier1 = cmsFlowchartTier1.length > 0 ? cmsFlowchartTier1 : fallbackFlowchartTier1;

  const flowchartConnectorLabel = t(homepage?.strategyFlowchartConnectorLabel, "Anlegerprofil des Kunden");

  const cmsFlowchartTier2: string[] = (homepage?.strategyFlowchartTier2 ?? [])
    .map((v: LocaleValue) => t(v, ""))
    .filter((v: string) => v.length > 0);
  const flowchartTier2 = cmsFlowchartTier2.length > 0 ? cmsFlowchartTier2 : fallbackFlowchartTier2;

  const cmsFlowchartTier3: string[] = (homepage?.strategyFlowchartTier3 ?? [])
    .map((v: LocaleValue) => t(v, ""))
    .filter((v: string) => v.length > 0);
  const flowchartTier3 = cmsFlowchartTier3.length > 0 ? cmsFlowchartTier3 : fallbackFlowchartTier3;

  const flowchartTier4 = t(homepage?.strategyFlowchartTier4, "Individuelle Portfolio-Konstruktion");

  const cmsFlowchartTier5: string[] = (homepage?.strategyFlowchartTier5 ?? [])
    .map((v: LocaleValue) => t(v, ""))
    .filter((v: string) => v.length > 0);
  const flowchartTier5 = cmsFlowchartTier5.length > 0 ? cmsFlowchartTier5 : fallbackFlowchartTier5;

  const detailEyebrow = t(homepage?.strategyDetailEyebrow, "Anlagestrategien");
  const detailHeadingLine1 = t(homepage?.strategyDetailHeadingLine1, "Zwei Perspektiven,");
  const detailHeadingLine2 = t(homepage?.strategyDetailHeadingLine2, "ein Portfolio.");

  if (isVertical) {
    if (nurUnterseite) {
      return (
        <AnlagestrategienMobileOverlay
          isOpen={isDetail}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
          homepage={homepage}
          detailEyebrow={detailEyebrow}
          detailHeadingLine1={detailHeadingLine1}
          detailHeadingLine2={detailHeadingLine2}
        />
      );
    }
    return (
      <section id="section-anlagestrategien" style={{ backgroundColor: C.bg }}>
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
              }}
              className="uppercase"
            >
              {overviewEyebrow}
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize:
                  breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              {overviewHeadingLine1}
              <br />
              <em>{overviewHeadingLine2}</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody }}>
              <ExpandableBody
                paragraphs={bodyParagraphs}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>
        </div>

        {/* Methodik-Schaubild — comes AFTER text on mobile/tablet */}
        <div style={{ width: "100%", padding: "32px 16px" }}>
          <figure
            role="img"
            aria-label="Flussdiagramm: Anlageprozess von Leitprinzipien bis Reporting."
            style={{ maxWidth: 480, margin: "0 auto", padding: 0 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {flowchartTier1.map((label) => (
                <div
                  key={label}
                  style={{ border: `1px solid ${C.line}`, padding: "12px 14px", textAlign: "center" }}
                >
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
              aria-hidden
            >
              <div style={{ width: 0.5, height: 10, borderLeft: `1px dashed ${C.line}` }} />
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 7,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.stone,
                  padding: "2px 8px",
                }}
              >
                {flowchartConnectorLabel}
              </span>
              <div style={{ width: 0.5, height: 10, borderLeft: `1px dashed ${C.line}` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {flowchartTier2.map((label) => (
                <div
                  key={label}
                  style={{ backgroundColor: C.purple, padding: "12px 14px", textAlign: "center" }}
                >
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
              aria-hidden
            >
              <div style={{ width: 0.5, height: 14, borderLeft: `1px dashed ${C.line}` }} />
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path
                  d="M1 1l4 4 4-4"
                  stroke={C.stone}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {flowchartTier3.map((label) => (
                <div
                  key={label}
                  style={{ border: `1px solid ${C.line}`, padding: "12px 14px", textAlign: "center" }}
                >
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
              aria-hidden
            >
              <div style={{ width: 0.5, height: 14, borderLeft: `1px dashed ${C.line}` }} />
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path
                  d="M1 1l4 4 4-4"
                  stroke={C.stone}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ backgroundColor: C.purple, padding: "14px 18px", textAlign: "center" }}>
              <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>
                {flowchartTier4}
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
              aria-hidden
            >
              <div style={{ width: 0.5, height: 14, borderLeft: `1px dashed ${C.line}` }} />
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path
                  d="M1 1l4 4 4-4"
                  stroke={C.stone}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {flowchartTier5.map((label) => (
                <div
                  key={label}
                  style={{ border: `1px solid ${C.line}`, padding: "12px 14px", textAlign: "center" }}
                >
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </figure>
        </div>

        {/* CTA — AFTER the visual element on mobile */}
        <ScrollFade scrollX={0} isVertical yOffset={16}>
          <div style={{ padding: breakpoint === "mobile" ? "0 20px 32px" : "0 32px 32px" }}>
            <CtaButton href="/portfolio-management" onClick={handleNavigateToProcess}>
              {overviewCtaLabel}
            </CtaButton>
          </div>
        </ScrollFade>

        <AnlagestrategienMobileOverlay
          isOpen={isDetail}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
          homepage={homepage}
          detailEyebrow={detailEyebrow}
          detailHeadingLine1={detailHeadingLine1}
          detailHeadingLine2={detailHeadingLine2}
        />
      </section>
    );
  }

  /* Desktop */

  /* ─── Overview markup — normal section inside horizontal scroll strip ─── */
  const overviewMarkup = (
    <div
      className="relative h-screen flex-shrink-0"
      style={{ width: layout.sectionWidth, backgroundColor: C.bg }}
      data-tellian-station="3"
    >
      {/* ── Right column: Methodik-Schaubild ──
           Section4: 40/60 instead of 50/50 — deliberate, the diagram needs width.
           Don't align this to the other sections' split. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "38vw",
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        <figure
          role="img"
          aria-label="Flussdiagramm: Von Leitprinzipien und Investment-Philosophie über das Anlegerprofil des Kunden zu innovativem Portfolio-Management, strategischer und taktischer Allokation, individueller Portfolio-Konstruktion, Überwachung und Reporting."
          style={{ maxWidth: 560, width: "100%", margin: 0, padding: 0 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {flowchartTier1.map((label) => (
              <div
                key={label}
                style={{ border: `1px solid ${C.line}`, padding: "14px 16px", textAlign: "center" }}
              >
                <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
            aria-hidden
          >
            <div style={{ width: 0.5, height: 12, borderLeft: `1px dashed ${C.line}` }} />
            <span
              style={{
                fontFamily: sans,
                fontSize: 8,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.stone,
                padding: "3px 10px",
              }}
            >
              {flowchartConnectorLabel}
            </span>
            <div style={{ width: 0.5, height: 12, borderLeft: `1px dashed ${C.line}` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {flowchartTier2.map((label) => (
              <div
                key={label}
                style={{
                  backgroundColor: C.purple,
                  padding: "14px 12px",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
            aria-hidden
          >
            <div style={{ width: 0.5, height: 16, borderLeft: `1px dashed ${C.line}` }} />
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
              <path
                d="M1 1l4 4 4-4"
                stroke={C.stone}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {flowchartTier3.map((label) => (
              <div
                key={label}
                style={{ border: `1px solid ${C.line}`, padding: "14px 16px", textAlign: "center" }}
              >
                <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
            aria-hidden
          >
            <div style={{ width: 0.5, height: 16, borderLeft: `1px dashed ${C.line}` }} />
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
              <path
                d="M1 1l4 4 4-4"
                stroke={C.stone}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ backgroundColor: C.purple, padding: "16px 20px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>
              {flowchartTier4}
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}
            aria-hidden
          >
            <div style={{ width: 0.5, height: 16, borderLeft: `1px dashed ${C.line}` }} />
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
              <path
                d="M1 1l4 4 4-4"
                stroke={C.stone}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {flowchartTier5.map((label) => (
              <div
                key={label}
                style={{ border: `1px solid ${C.line}`, padding: "14px 16px", textAlign: "center" }}
              >
                <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </figure>
      </div>

      {/* ── Left column: text (38vw — narrower, 40/60 split for the diagram) ── */}
      <div
        className="relative z-10 flex h-full flex-col justify-center"
        style={{
          ...textColStyle,
          width: "38vw",
          maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
          opacity: isDetail ? 0 : 1,
          transform: isDetail ? "translateX(-50px)" : "translateX(0)",
          transition: `opacity 500ms ${EASE.in}, transform 500ms ${EASE.in}`,
          pointerEvents: isDetail ? "none" : "auto",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.22em",
            color: C.stone,
            display: "block",
          }}
          className="uppercase"
        >
          {overviewEyebrow}
        </span>

        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.dark,
            marginTop: SPACING.eyebrowToAccent,
          }}
        />

        <h2
          style={{
            fontFamily: serif,
            fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94,
            color: C.dark,
            letterSpacing: "-0.03em",
            marginTop: SPACING.accentToHeadline,
          }}
        >
          {overviewHeadingLine1}
          <br />
          <em>{overviewHeadingLine2}</em>
        </h2>

        <div
          style={{
            marginTop: SPACING.headlineToBody,
            maxWidth: layout.bodyMaxWidth,
            display: "flex",
            flexDirection: "column",
            gap: SPACING.bodyParagraphGap,
          }}
        >
          {bodyParagraphs.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans,
                fontSize: "clamp(11px, 1.6vh, 16px)",
                color: C.charcoal,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}

          {/* CTA — inline with body text, left-aligned */}
          <a
            href="/portfolio-management"
            onClick={handleNavigateToProcess}
            className="inline-flex items-center gap-3 uppercase"
            style={{
              marginTop: "56px",
              padding: "16px 24px",
              border: `1px solid ${C.button}`,
              borderRadius: 0,
              backgroundColor: C.button,
              fontFamily: sans,
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: C.dark,
              textDecoration: "none",
              lineHeight: 1,
              alignSelf: "flex-start",
              transition: "background-color 250ms ease-out",
            }}
          >
            <span>{overviewCtaLabel}</span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );

  /* ─── Wrap overview + overlay in a shared LayoutGroup so Framer Motion
         can match headline layoutIds across the React Portal. ─── */
  return (
    <LayoutGroup>
      {!nurUnterseite && overviewMarkup}
      <SubpageOverlay
        isOpen={isDetail}
        onClose={() => onCloseDetail?.()}
        eyebrow={detailEyebrow}
        headline={
          <>
            {detailHeadingLine1}
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{detailHeadingLine2}</em>
          </>
        }
      >
        <AnlagestrategienDetail
          isMobile={isVertical}
          isDetail={isDetail}
          reducedMotion={reducedMotion}
          onContactClick={() => onContactClick?.()}
        />
      </SubpageOverlay>
    </LayoutGroup>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function HomeClient({ homepage, outline }: { homepage: any; outline?: React.ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);
  const { breakpoint, isVertical } = useBreakpoint();
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const { t, lang, setLang } = useLanguage();
  const sprache: Sprache = lang === "en" ? "EN" : "DE";
  const onSprache = useCallback(
    (s: Sprache) => setLang(s === "EN" ? "en" : "de"),
    [setLang],
  );

  /* ── Navigation copy from Sanity (same fields the sidebar used) ──
        Section order, scroll targets and IDs stay in code (structural);
        only the labels and the portal copy are CMS-driven. */
  const cmsNavItems = homepage?.navItems;
  const leisteNamen = useMemo(
    () => leisteSektionen(sprache, cmsNavItems, t),
    [sprache, cmsNavItems, t],
  );
  const kundenportalLabel = t(homepage?.navKundenportalLabel, "Kundenportal");

  // Portfolio Management subpage overlay header (localized, with fallback to the original German copy)
  const pmDetailEyebrow = t(homepage?.pmDetailEyebrow, "Portfolio Management");
  const pmDetailHeadingLine1 = t(homepage?.pmDetailHeadingLine1, "Wie wir Ihr Portfolio");
  const pmDetailHeadingLine2 = t(homepage?.pmDetailHeadingLine2, "führen.");

  /* ── Gemessene Stationskanten (Desktop) ──
     Die Stationen sind unterschiedlich breit (Hero 100vw, Rad und
     Team eigene Masse). Sprungziele und aktive Station kommen deshalb
     aus den gemessenen Kanten der Panels, nicht aus festen Anteilen.
     Die Kanten liegen zusätzlich in einem Ref, damit die Scroll-
     Schleife sie je Frame lesen kann, ohne React zu bemühen. */
  const [kanten, setKanten] = useState<number[] | null>(null);
  const kantenRef = useRef<number[] | null>(null);
  useEffect(() => {
    kantenRef.current = kanten;
  }, [kanten]);

  const indexAt = useCallback((x: number, max: number) => {
    const k = kantenRef.current;
    if (!k) return activeIndexFromProgress(max > 0 ? x / max : 0);
    let idx = 0;
    for (let i = 1; i < k.length; i++) {
      if (x >= (k[i - 1] + k[i]) / 2) idx = i;
    }
    return idx;
  }, []);

  const { activeIndex: horizontalIndex, containerRef, scrollTo } = useHorizontalScroll({
    disabled: isVertical || !introComplete,
    indexAt,
  });

  const [loginOpen, setLoginOpen] = useState(false);
  const handleKundenportalClick = () => {
    setLoginOpen(true);
  };
  const [menueOffen, setMenueOffen] = useState(false);

  /* The page is mounted BENEATH the preload screen right after hydration,
     so the purple surface slides up and reveals the hero (as in the new
     design). SSR output stays the preload screen alone — the sections read
     window/document during render and were never server-rendered before. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const mountedTrack = mounted && introComplete;

  useEffect(() => {
    if (isVertical) return;
    const track = containerRef.current;
    if (!track) return;
    const messen = () => {
      const lefts = SECTIONS.map((_, i) => {
        const el = track.querySelector<HTMLElement>(`[data-tellian-station="${i}"]`);
        return el ? el.offsetLeft : -1;
      });
      setKanten(lefts.every((l) => l >= 0) ? lefts : null);
    };
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(track);
    window.addEventListener("resize", messen);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", messen);
    };
  }, [isVertical, mountedTrack]);

  /* Active section: desktop from the scroll position against the
     measured edges, tablet/mobile from an IntersectionObserver. */
  const verticalIndex = useVerticalSectionIndex(isVertical);
  const activeIndex = isVertical ? verticalIndex : horizontalIndex;

  /* Single entry point for direct jumps from header, menu and station bar. */
  const navigateToSection = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(SECTIONS.length - 1, index));
      const section = SECTIONS[i];
      if (isVertical) {
        document.getElementById(section.domId)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const track = containerRef.current;
      const el = track?.querySelector<HTMLElement>(`[data-tellian-station="${i}"]`);
      const max = track ? track.scrollWidth - track.clientWidth : 0;
      if (el && max > 0) {
        scrollTo(Math.min(1, el.offsetLeft / max));
      } else {
        scrollTo(section.progress);
      }
    },
    [isVertical, scrollTo, containerRef],
  );

  /* Sichtbare Stationsflächen unter den Bändern messen KopfzeileBand
     und DotNavigationBand selbst (siehe oben). */
  const bandAktiv = !isVertical && introComplete;

  const handleWelt = useCallback((ziel: "capital" | "solutions") => {
    if (ziel === "solutions") window.location.href = solutionsSiteUrl;
  }, []);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);


  const vvw = useSubpageMode("/vermoegensverwaltung");
  const ast = useSubpageMode("/anlagestrategien");
  const pm = useSubpageMode("/portfolio-management");
  /* Mandat und Advisory hängen an Station 02 (Redesign). */
  const adv = useSubpageMode("/advisory");
  const man = useSubpageMode("/mandat");
  const legal = useLegalRoute();
  /* Personen-Detail der Teamstation. */
  const [teamDetailOffen, setTeamDetailOffen] = useState(false);
  void teamDetailOffen;

  const isDetailMode =
    vvw.mode === "detail" ||
    ast.mode === "detail" ||
    pm.mode === "detail" ||
    adv.isDetail ||
    man.isDetail ||
    legal.activePath !== null;

  /* ═══ Eintritts-Latch ═══ Rastet die aktuelle Station und nimmt sie
     nie zurück: Einblendungen laufen genau einmal. Die erste Rastung
     wartet auf das Ende des Intros und einen Moment für die Schriften. */
  const [entered, setEntered] = useState<boolean[]>(() => SECTIONS.map(() => false));
  const firstLatchDone = useRef(false);
  useEffect(() => {
    if (isVertical || !introComplete) return;
    const latch = () =>
      setEntered((prev) => (prev[activeIndex] ? prev : prev.map((v, k) => (k === activeIndex ? true : v))));
    if (firstLatchDone.current) {
      latch();
      return;
    }
    const t = setTimeout(() => {
      firstLatchDone.current = true;
      latch();
    }, 120);
    return () => clearTimeout(t);
  }, [isVertical, introComplete, activeIndex]);

  /* Eingabeart merken (Zeiger oder Tastatur) für den Fokusrahmen, und
     die Zwei-Zeilen-Regel für Überschriften. */
  useEffect(() => {
    const eingabe = (art: "zeiger" | "tastatur") => {
      if (document.documentElement.dataset.eingabe !== art) document.documentElement.dataset.eingabe = art;
    };
    const aufZeiger = () => eingabe("zeiger");
    const aufTaste = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key.startsWith("Arrow")) eingabe("tastatur");
    };
    window.addEventListener("pointerdown", aufZeiger, { capture: true, passive: true });
    window.addEventListener("keydown", aufTaste, { capture: true });
    const stop = zweiZeilenRegel();
    return () => {
      window.removeEventListener("pointerdown", aufZeiger, { capture: true });
      window.removeEventListener("keydown", aufTaste, { capture: true });
      stop();
    };
  }, []);

  const navigateToContact = useCallback(() => {
    vvw.closeDetail();
    ast.closeDetail();
    pm.closeDetail();
    adv.closeDetail();
    man.closeDetail();
    legal.close();
    navigateToSection(SECTIONS.length - 1);
  }, [vvw, ast, pm, adv, man, legal, navigateToSection]);

  const marke = (i: number) => ({ nr: sectionOrdinal(i), name: leisteNamen[i]?.label ?? SECTIONS[i].label });
  const handleWeltMenue = handleWelt;

  const preload = !introComplete && <PreloadScreen onComplete={handleIntroComplete} />;

  /* `outline` = server-rendered text of this route (app/_site/SeoOutline),
     covered by the preload screen and replaced once mounted. */
  if (!mounted) {
    return (
      <>
        {preload}
        {outline}
      </>
    );
  }

  /* ═══ Unterseiten Mandat / Advisory (beide Zweige) ═══ */
  const mandatAdvisoryOverlays = (
    <>
      <SubpageOverlay isOpen={adv.isDetail} onClose={adv.closeDetail} eyebrow="" headline={null}>
        <UnterseiteAdvisory
          isMobile={isVertical}
          aktiv={adv.isDetail}
          sprache={sprache}
          onContactClick={navigateToContact}
          onAndereSeite={() => {
            adv.closeSilently();
            man.openDetail();
          }}
        />
      </SubpageOverlay>
      <SubpageOverlay isOpen={man.isDetail} onClose={man.closeDetail} eyebrow="" headline={null}>
        <UnterseiteMandat
          isMobile={isVertical}
          aktiv={man.isDetail}
          sprache={sprache}
          onContactClick={navigateToContact}
          onAndereSeite={() => {
            man.closeSilently();
            adv.openDetail();
          }}
        />
      </SubpageOverlay>
    </>
  );

  /* ═══ Portfolio Management Subpage (beide Zweige) ═══ */
  const pmOverlay = (
    <SubpageOverlay
      isOpen={pm.isDetail}
      onClose={() => pm.closeDetail()}
      eyebrow={pmDetailEyebrow}
      headline={
        <>
          {pmDetailHeadingLine1}
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>{pmDetailHeadingLine2}</em>
        </>
      }
    >
      <PortfolioManagementDetail isMobile={isVertical} onContactClick={navigateToContact} homepage={homepage} />
    </SubpageOverlay>
  );

  /* ═══════════════════════════════════════════════════════
     VERTICAL LAYOUT (Tablet + Mobile)
     ═══════════════════════════════════════════════════════ */
  if (isVertical) {
    return (
      <div
        className="min-h-screen w-full cursor-default"
        style={{
          backgroundColor: C.bg,
          opacity: isDetailMode ? 0 : 1,
          pointerEvents: isDetailMode ? "none" : "auto",
          transition: "opacity 400ms ease-out",
        }}
      >
        {preload}

        <KopfzeileBand
          aktiv={bandAktiv}
          activeIndex={activeIndex}
          sprache={sprache}
          onSprache={onSprache}
          onPortal={handleKundenportalClick}
          onLogo={() => navigateToSection(0)}
          welt="capital"
          onWelt={handleWelt}
          isVertical
          menueOffen={menueOffen}
          onMenue={() => setMenueOffen((o) => !o)}
          portalLabel={kundenportalLabel}
          sichtbar={introComplete}
        />

        <MobilMenue
          offen={menueOffen}
          onSchliessen={() => setMenueOffen(false)}
          activeIndex={activeIndex}
          sektionen={leisteNamen}
          onNavigate={navigateToSection}
          onOpenLegal={legal.open}
          welt="capital"
          onWelt={handleWeltMenue}
          sprache={sprache}
          sprachen={["DE", "EN"]}
          onSprache={(s) => onSprache(s as Sprache)}
          onPortal={handleKundenportalClick}
          portalLabel={kundenportalLabel}
        />

        <main>
          {/* 01 — Einstieg */}
          <Station1Einstieg isVertical bereit={introComplete} sprache={sprache} homepage={homepage} />

          {/* 02 — Vermögensverwaltung (dunkel) */}
          <StationVermoegensverwaltung
            isVertical
            domId={SECTIONS[1].domId}
            sprache={sprache}
            homepage={homepage}
            marke={marke(1)}
            onMandat={man.openDetail}
            onAdvisory={adv.openDetail}
          />

          {/* 03 — Ihre Vorteile (hell) */}
          <StationVorteile
            isVertical
            domId={SECTIONS[2].domId}
            sprache={sprache}
            marke={marke(2)}
            homepage={homepage}
            istAktiv={SECTIONS[activeIndex]?.key === "strategien"}
          />

          {/* 04 — Geschäftsbeziehungen (dunkel) */}
          <StationGeschaeftsbeziehungen
            isVertical
            domId={SECTIONS[3].domId}
            sprache={sprache}
            homepage={homepage}
            marke={marke(3)}
            onMandat={man.openDetail}
          />

          {/* 05 — Team */}
          <StationTeam
            isVertical
            domId={SECTIONS[4].domId}
            sprache={sprache}
            homepage={homepage}
            marke={marke(4)}
            onDetailToggle={setTeamDetailOffen}
          />

          {/* 06 — Kontakt */}
          <StationKontakt
            isVertical
            domId={SECTIONS[5].domId}
            sprache={sprache}
            homepage={homepage}
            marke={marke(5)}
            onOpenLegal={legal.open}
          />
        </main>

        {mandatAdvisoryOverlays}

        {/* Unterseiten /vermoegensverwaltung und /anlagestrategien (CMS) */}
        <Section3Vermoegensverwaltung
          nurUnterseite
          scrollX={0}
          isVertical
          breakpoint={breakpoint}
          viewMode={vvw.mode}
          onOpenDetail={vvw.openDetail}
          onCloseDetail={vvw.closeDetail}
          onContactClick={navigateToContact}
          homepage={homepage}
        />
        <Section4Anlagestrategien
          nurUnterseite
          scrollX={0}
          isVertical
          breakpoint={breakpoint}
          viewMode={ast.mode}
          onOpenDetail={ast.openDetail}
          onCloseDetail={ast.closeDetail}
          onContactClick={navigateToContact}
          onNavigateToProcess={pm.openDetail}
          homepage={homepage}
        />

        <LegalPage activePath={legal.activePath} onClose={legal.close} homepage={homepage} />
        {pmOverlay}

        <LoginOverlay
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSupportClick={navigateToContact}
          homepage={homepage}
        />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     DESKTOP — HORIZONTAL LAYOUT
     ═══════════════════════════════════════════════════════ */
  return (
    <div className="relative h-screen w-full overflow-hidden cursor-default" style={{ backgroundColor: C.bg }}>
      {preload}

      {/* Genau zwei Navigationselemente: Kopfzeile und Stationsleiste. */}
      <div
        style={{
          opacity: isDetailMode ? 0 : 1,
          pointerEvents: isDetailMode ? "none" : "auto",
          transition: "opacity 400ms ease-out",
        }}
      >
        <KopfzeileBand
          aktiv={bandAktiv}
          activeIndex={activeIndex}
          sprache={sprache}
          onSprache={onSprache}
          onPortal={handleKundenportalClick}
          onLogo={() => navigateToSection(0)}
          welt="capital"
          onWelt={handleWelt}
          portalLabel={kundenportalLabel}
          sichtbar={introComplete}
        />

        {introComplete && (
          <DotNavigationBand
            aktiv={bandAktiv}
            activeIndex={activeIndex}
            onNavigate={navigateToSection}
            sektionen={leisteNamen}
            ariaLabel={lang === "en" ? "Section navigation" : "Sektion-Navigation"}
          />
        )}
      </div>

      <div
        ref={containerRef}
        data-tellian-track
        className="flex h-screen overflow-x-scroll overflow-y-hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          pointerEvents: introComplete && !isDetailMode ? "auto" : "none",
          opacity: isDetailMode ? 0 : 1,
          transition: isDetailMode ? "opacity 600ms ease-out 150ms" : "opacity 400ms ease-out",
        }}
      >
        {/* STATION 1 — EINSTIEG */}
        <SectionEnteredProvider value={entered[0]}>
          <Station1EinstiegM sprache={sprache} homepage={homepage} />
        </SectionEnteredProvider>

        {/* STATION 2 — VERMÖGENSVERWALTUNG (dunkel) */}
        <SectionEnteredProvider value={entered[1]}>
          <StationVermoegensverwaltungM
            domId={SECTIONS[1].domId}
            sprache={sprache}
            homepage={homepage}
            onMandat={man.openDetail}
            onAdvisory={adv.openDetail}
          />
        </SectionEnteredProvider>

        {/* STATION 3 — IHRE VORTEILE (hell) */}
        <SectionEnteredProvider value={entered[2]}>
          <StationVorteileM
            domId={SECTIONS[2].domId}
            sprache={sprache}
            homepage={homepage}
            istAktiv={SECTIONS[activeIndex]?.key === "strategien"}
          />
        </SectionEnteredProvider>

        {/* STATION 4 — GESCHÄFTSBEZIEHUNGEN (dunkel) */}
        <SectionEnteredProvider value={entered[3]}>
          <StationGeschaeftsbeziehungenM
            domId={SECTIONS[3].domId}
            sprache={sprache}
            homepage={homepage}
            onMandat={man.openDetail}
          />
        </SectionEnteredProvider>

        {/* STATION 5 — TEAM */}
        <SectionEnteredProvider value={entered[4]}>
          <StationTeamM
            domId={SECTIONS[4].domId}
            sprache={sprache}
            homepage={homepage}
            onDetailToggle={setTeamDetailOffen}
          />
        </SectionEnteredProvider>

        {/* STATION 6 — KONTAKT */}
        <SectionEnteredProvider value={entered[5]}>
          <StationKontaktM domId={SECTIONS[5].domId} sprache={sprache} homepage={homepage} onOpenLegal={legal.open} />
        </SectionEnteredProvider>
      </div>

      {mandatAdvisoryOverlays}

      {/* Unterseiten /vermoegensverwaltung und /anlagestrategien (CMS) */}
      <Section3Vermoegensverwaltung
        nurUnterseite
        scrollX={0}
        breakpoint={breakpoint}
        viewMode={vvw.mode}
        onOpenDetail={vvw.openDetail}
        onCloseDetail={vvw.closeDetail}
        onContactClick={navigateToContact}
        homepage={homepage}
      />
      <Section4Anlagestrategien
        nurUnterseite
        scrollX={0}
        breakpoint={breakpoint}
        viewMode={ast.mode}
        onOpenDetail={ast.openDetail}
        onCloseDetail={ast.closeDetail}
        onContactClick={navigateToContact}
        onNavigateToProcess={pm.openDetail}
        homepage={homepage}
      />

      <LegalPage activePath={legal.activePath} onClose={legal.close} homepage={homepage} />
      {pmOverlay}

      <LoginOverlay
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSupportClick={navigateToContact}
          homepage={homepage}
        />
    </div>
  );
}
