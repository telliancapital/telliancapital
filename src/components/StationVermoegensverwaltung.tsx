"use client";

import { sans, serif } from "@/tokens";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { SECTION_WIDTH, type Sprache } from "@/sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { ProzessGabelung } from "./ProzessGabelung";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════════
   STATION 02 — VERMÖGENSVERWALTUNG (dunkel)

   EINE Lesespur von oben nach unten:
     Titel → Absatz 1 | Absatz 2 (Textzone links)
           → Absatz 3 als Lead auf den Auswahlbereich
           → «Zwei Wege, ein Anspruch» mit den beiden Karten.

   INHALTE aus Sanity: Titel = methodEyebrow, Absätze =
   methodParagraphs (die ersten zwei in der Textzone, der dritte als
   Lead) — dieselben Felder wie in der bisherigen Sektion 3. Ohne
   CMS-Werte greift der Wortlaut des Redesign-Briefings.
   ═══════════════════════════════════════════════════════════ */

interface StationInhalt {
  titel: string;
  absaetze: readonly string[];
}

const INHALT: Readonly<Record<Sprache, StationInhalt>> = {
  DE: {
    titel: "Vermögensverwaltung",
    absaetze: [
      "Unser Portfoliomanagement ist unabhängig und frei von Interessenkonflikten. Hauseigene Investmentexpertise, ein internationales Netzwerk sowie der Zugang zu einzigartigen Investmentmöglichkeiten bilden die Grundlage unserer Vermögensverwaltung. Dabei verbinden wir unsere bewährten Anlagestrategien mit individuellen Lösungen, abgestimmt auf Ihre persönlichen Ziele und Bedürfnisse.",
      "Vermögen ist für uns mehr als eine Zahl. Es steht für das, was Sie aufgebaut haben, für Ihre Pläne und für die Menschen, die Ihnen wichtig sind. Deshalb betrachten wir Ihre persönliche und finanzielle Situation als Ganzes und richten unsere Vermögensverwaltung konsequent an Ihre Prioritäten und Ihrem Anlagehorizont aus.",
      "Im Mittelpunkt steht unser Vermögensverwaltungsmandat: Wir übernehmen die Anlageentscheide innerhalb der gemeinsam definierten Strategie. Mit Advisory bleiben die Anlageentscheide bei Ihnen, begleitet durch unsere Beratung.",
    ],
  },
  EN: {
    titel: "Wealth Management",
    absaetze: [
      "Our portfolio management is independent and free from conflicts of interest. In-house investment expertise, an international network and access to distinctive investment opportunities form the foundation of our approach to wealth management. We combine our proven investment strategies with tailored solutions designed around your individual objectives and needs.",
      "To us, wealth is more than a number. It represents what you have built, the plans you have for the future and the people who matter to you. That is why we take a holistic view of your personal and financial circumstances and align our wealth management approach with your priorities and investment horizon.",
      "At the core of our offering is our discretionary wealth management mandate, where we make investment decisions on your behalf within the strategy defined together with you. With our advisory service, investment decisions remain in your hands, supported by our expertise and personal guidance.",
    ],
  },
};

const STEP = { title: 0, body: 260, grafik: 120 } as const;
const DURATION = 460;

interface Props {
  isVertical?: boolean;
  domId?: string;
  sprache?: Sprache;
  homepage?: any;
  marke?: { nr: string; name: string };
  onMandat?: () => void;
  onAdvisory?: () => void;
}

export function StationVermoegensverwaltung({
  isVertical = false,
  domId,
  sprache = "DE",
  homepage,
  marke,
  onMandat,
  onAdvisory,
}: Props) {
  const { t } = useLanguage();
  const inhalt = INHALT[sprache];
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion || isVertical;

  const titelText = t(homepage?.methodEyebrow, inhalt.titel);
  const cmsAbsaetze: string[] = (homepage?.methodParagraphs ?? [])
    .map((p: LocaleValue) => t(p, ""))
    .filter((p: string) => p.length > 0);
  const absaetze = cmsAbsaetze.length > 0 ? cmsAbsaetze : inhalt.absaetze;

  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const titel = (
    <h2
      lang={sprache === "EN" ? "en" : "de"}
      style={{
        margin: 0,
        hyphens: "manual",
        overflowWrap: "break-word",
        fontFamily: serif,
        fontSize: "var(--tellian-pm-titel-dunkel-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-pm-title-leading)" as unknown as number,
        letterSpacing: "var(--tellian-pm-title-tracking)",
        color: "var(--tellian-pm-dunkel-ink)",
      }}
    >
      {titelText.replace("Vermögensverwaltung", "Vermögens­verwaltung")}
    </h2>
  );

  const textzone = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tellian-abstand-absatz)" }}>
      {absaetze.slice(0, 2).map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-pm-dunkel-dim)",
            maxWidth: "50ch",
          }}
        >
          {text}
        </p>
      ))}
    </div>
  );

  /* Lead des Auswahlbereichs: dritter CMS-Absatz; fehlt er, der
     Wortlaut des Redesigns, damit der Bereich nicht ohne Einleitung steht. */
  const lead = absaetze[2] ?? inhalt.absaetze[2];

  /* ── SCHMAL ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-purple)",
          backgroundImage: "var(--tellian-flaeche-dunkel-schmal)",
          scrollMarginTop: "var(--tellian-kopf-height)",
        }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "var(--tellian-rand-schmal)",
            paddingRight: "var(--tellian-rand-schmal)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--tellian-stapel-schmal)",
            alignItems: "flex-start",
          }}
        >
          {marke && <Kapitelmarke nr={marke.nr} name={marke.name} hell />}
          <Aufgang>{titel}</Aufgang>
          <Aufgang stufe={1}>{textzone}</Aufgang>
          <ProzessGabelung
            gestapelt
            aufDunkel
            lead={lead}
            sprache={sprache}
            onMandat={onMandat}
            onAdvisory={onAdvisory}
          />
        </div>
      </section>
    );
  }

  /* ── BREIT: 5/7 — Textzone links, Zwei Wege rechts ── */
  return (
    <div
      id={domId}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: SECTION_WIDTH,
        backgroundColor: "var(--tellian-purple)",
        backgroundImage: "var(--tellian-flaeche-dunkel)",
      }}
      data-tellian-station="1"
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          alignItems: "center",
          columnGap: "clamp(48px, 6.7vw, 96px)",
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--tellian-abstand-titel)",
          }}
        >
          <div style={enter(STEP.title, 24)}>{titel}</div>
          <div style={enter(STEP.body)}>{textzone}</div>
        </div>

        <div style={{ minWidth: 0, ...enter(STEP.grafik + 140) }}>
          <ProzessGabelung
            aufDunkel
            lead={lead}
            sprache={sprache}
            onMandat={onMandat}
            onAdvisory={onAdvisory}
          />
        </div>
      </div>
    </div>
  );
}
