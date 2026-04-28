import { HeroExpandingImage, ScrollFade } from "./ScrollAnimations";
import { ExpandableBody } from "./ExpandableBody";
import philosophyImg from "@/assets/a44e63e47eecf6c5811f4525d593bd929e31be63.png";
import { LAYOUT, getLayout, getTextColumnStyle, SPACING } from "../layout";
import type { Breakpoint } from "./useBreakpoint";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

/* ─── Design tokens ─── */
const C = {
  bg: "#F9F9F7",
  dark: "#1A1916",
  charcoal: "#3A3835",
  stone: "#8A857C",
};
const serif = "var(--font-cormorant), serif";
const sans = "var(--font-inter), sans-serif";

/* ─── Section geometry ────────────────────────────────────────
   Layout order: Hero(110) + Breathing(8)
   → Philosophie starts at scrollX = 118vw.
   Section width = 110vw.
   progress = (scrollX - 118vw) / 110vw   clamped [0, 1]
   ──────────────────────────────────────────────────────────── */
const SECTION_START_VW = 118;
const SECTION_WIDTH_VW = 110;

/* ─── Animation mapping (all linear, GPU-friendly) ───────────
   progress 0.0  →  scale 1.00 (32px), quoteOpacity 0.40, overlay 0.00
   progress 0.5  →  scale 1.50 (48px), quoteOpacity 0.70, overlay 0.15
   progress 1.0  →  scale 2.00 (64px), quoteOpacity 1.00, overlay 0.35
   ───────────────────────────────────────────────────────────── */
function getAnimValues(scrollX: number) {
  const vw = typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1440;
  const start = (SECTION_START_VW * vw) / 100;
  const width = (SECTION_WIDTH_VW * vw) / 100;

  if (width === 0) return { scale: 1.0, quoteOpacity: 0.7, overlayAlpha: 0.5 };

  const p = Math.max(0, Math.min(1, (scrollX - start) / width));
  const safe = (n: number) => (isFinite(n) ? n : 0);

  // Ease-out curve: fast ramp to ~90% at p=0.35, then slow crawl to 100%
  const eased = 1 - Math.pow(1 - p, 2.5);

  return {
    scale: safe(1.0 + eased * 0.5), // 1.00 → 1.50  (48px → 72px)
    quoteOpacity: safe(0.7 + eased * 0.3), // 0.70 → 1.00
    overlayAlpha: safe(0.1 + eased * 0.3), // 0.10 → 0.40
  };
}

interface Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: Breakpoint;
  homepage?: any;
}

const FALLBACK_BODY = [
  "Tellian Capital verwaltet Vermögen nach einem quantitativen Prozess. Anlageentscheide entstehen aus Daten, Modellen und systematischer Marktanalyse — nicht aus Prognosen einzelner Personen und nicht aus der Nachrichtenlage einer Woche.",
  "Wir nehmen Positionen ein, wenn unsere Analyse sie stützt. Und wir halten sie, solange die Grundlage trägt. Das erfordert Disziplin — besonders dann, wenn die Märkte nervös werden und der Impuls zum Handeln am grössten ist.",
  "Diese Arbeitsweise ist kein Zufall. Tellian Capital wurde 1996 als eine der ersten Schweizer Vermögensverwaltungen mit quantitativem Ansatz gegründet. Seither haben wir den Prozess verfeinert, aber das Prinzip nicht verändert: Methodik vor Meinung.",
  "Wir sind unabhängig von Banken, Produktanbietern und Vertriebsinteressen. Das bedeutet: Jede Anlageentscheidung dient einem Interesse — dem des Kunden.",
];

export function Section2Anlagephilosophie({
  scrollX,
  isVertical = false,
  breakpoint = "desktop",
  homepage,
}: Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const { t } = useLanguage();

  const eyebrow = t(homepage?.philosophyEyebrow, "Anlagephilosophie");
  const headingLine1 = t(homepage?.philosophyHeadingLine1, "Analyse entscheidet.");
  const headingLine2 = t(homepage?.philosophyHeadingLine2, "Nicht Stimmung.");
  const quote = t(
    homepage?.philosophyQuote,
    "Ihr Vermögen verdient bessere Gründe als ein Bauchgefühl.",
  );
  const cmsParagraphs: string[] = (homepage?.philosophyParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const BODY_PARAGRAPHS = cmsParagraphs.length > 0 ? cmsParagraphs : FALLBACK_BODY;

  /* Background image: prefer uploaded asset, then external URL, then bundled fallback */
  const imageSrc: string =
    homepage?.philosophyImageAsset?.url || homepage?.philosophyImageUrl || philosophyImg.src;
  /* Alt text — kept for future a11y wiring; HeroExpandingImage doesn't currently
     forward an `alt` prop, so unused for now. */
  void t(homepage?.philosophyImageAlt, "");

  /* ── VERTICAL (Tablet / Mobile) ── */
  if (isVertical) {
    return (
      <section id="section-anlagephilosophie" style={{ backgroundColor: C.bg }}>
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
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
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
              <em>{headingLine2}</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody, paddingBottom: "32px" }}>
              <ExpandableBody
                paragraphs={BODY_PARAGRAPHS}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>
        </div>

        {/* Image with quote overlay — comes AFTER text on mobile/tablet */}
        <div
          style={{
            width: "100%",
            height: breakpoint === "mobile" ? "50vh" : "55vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <HeroExpandingImage src={imageSrc} scrollX={0} className="h-full w-full" isVertical />
          {/* Dark overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          {/* Quote */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 3,
              padding: breakpoint === "mobile" ? "0 24px" : "0 10%",
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: breakpoint === "mobile" ? "28px" : "36px",
                fontStyle: "italic",
                color: "#ffffff",
                lineHeight: 1.3,
                maxWidth: breakpoint === "mobile" ? "90%" : "70%",
                textAlign: "center",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              «{quote}»
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ── DESKTOP (horizontal) ── */
  const { scale, quoteOpacity, overlayAlpha } = getAnimValues(scrollX);

  return (
    <div
      className="relative h-screen flex-shrink-0"
      style={{ width: "110vw", backgroundColor: C.bg }}
    >
      <div className="absolute z-0" style={{ top: 0, bottom: 0, left: LAYOUT.imageLeft, right: 0 }}>
        <HeroExpandingImage src={imageSrc} scrollX={scrollX} className="h-full w-full" />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(0,0,0,${overlayAlpha.toFixed(4)})`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 3,
            padding: "0 10%",
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontSize: "48px",
              fontStyle: "italic",
              color: "#ffffff",
              lineHeight: 1.3,
              maxWidth: "45%",
              textAlign: "center",
              margin: 0,
              letterSpacing: "-0.01em",
              opacity: quoteOpacity,
              transform: `scale(${scale.toFixed(4)})`,
              transformOrigin: "center center",
              willChange: "opacity, transform",
            }}
          >
            «{quote}»
          </p>
        </div>
      </div>

      <div
        className="relative z-10 flex h-full flex-col justify-end"
        style={{
          width: LAYOUT.columnWidth,
          paddingLeft: LAYOUT.paddingLeft,
          paddingRight: LAYOUT.paddingRight,
          paddingBottom: "clamp(56px, 8vh, 96px)",
        }}
      >
        <div style={{ marginBottom: "clamp(100px, 18vh, 240px)" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              color: C.stone,
              display: "block",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
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
            <em>{headingLine2}</em>
          </h2>

          <div
            style={{
              marginTop: SPACING.headlineToBody,
              maxWidth: LAYOUT.bodyMaxWidth,
              display: "flex",
              flexDirection: "column",
              gap: SPACING.bodyParagraphGap,
            }}
          >
            {BODY_PARAGRAPHS.map((text, i) => (
              <p
                key={i}
                style={{
                  fontFamily: sans,
                  fontSize: "clamp(10.5px, 1.3vh, 12px)",
                  color: C.charcoal,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
