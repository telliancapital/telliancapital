"use client";

import { sans, serif } from "@/tokens";
import { SECTION_WIDTH, type Sprache } from "@/sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { DreiecksBeziehung, DREIECK_INHALT, kantenZeilen, type DreieckInhalt } from "./DreiecksBeziehung";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { useLanguage } from "@/i18n/LanguageContext";

/* ═══════════════════════════════════════════════════════════
   STATION 04 — GESCHÄFTSBEZIEHUNGEN (dunkel)

   Links die Textzone (Titel + drei Absätze, 52ch), rechts die
   Dreiecksgrafik als visueller Anker. Beide vertikal zentriert.

   INHALTE aus Sanity (homepage → «4b. Geschäftsbeziehungen»): Titel =
   relationshipsHeadingLine1/2, Absätze = relationshipsParagraphs; die
   drei Parteien, ihre Erklärtexte und die Kantenwörter aus
   methodParty*Label/Prosa und methodEdgeLabel*. Ohne CMS-Werte greift
   der Wortlaut des Redesign-Briefings.
   ═══════════════════════════════════════════════════════════ */

interface StationInhalt {
  titel: readonly [string, string];
  absaetze: readonly string[];
}

const INHALT: Readonly<Record<Sprache, StationInhalt>> = {
  DE: {
    titel: ["Bewährte", "Geschäftsbeziehungen"],
    absaetze: [
      "Tellian Capital ist Partner und Bindeglied zwischen Ihnen und den Depotbanken. Wir setzen die gemeinsam definierte Anlagestrategie um, steuern Ihr Portfolio aktiv und vertreten Ihre Interessen gegenüber den Depotbanken. Ihr Vermögen bleibt dabei jederzeit in Ihrem Eigentum.",
      "Unsere Zusammenarbeit mit ausgewählten Depotbanken ermöglicht vorteilhafte Konditionen und den Zugang zu ergänzenden Bankdienstleistungen. Die Verwahrung der Vermögenswerte erfolgt bei der jeweiligen Bank. Bei Bedarf kann Ihr Vermögen auf mehrere Institute und Standorte verteilt werden.",
      "So bleiben die Rollen klar getrennt: Die Bank verwahrt Ihr Vermögen, Tellian Capital verwaltet es und Sie stehen im Mittelpunkt.",
    ],
  },
  EN: {
    titel: ["Established", "Banking Relationships"],
    absaetze: [
      "Tellian Capital acts as your partner and liaison with the custodian banks. We implement the investment strategy defined together with you, actively manage your portfolio and represent your interests in dealings with the custodian banks. Your assets remain in your ownership at all times.",
      "Our relationships with selected custodian banks provide access to preferential terms and additional banking services. Your assets are held with the respective custodian bank and, where appropriate, can be diversified across multiple institutions and locations.",
      "This ensures a clear separation of roles: the bank safeguards your assets, Tellian Capital manages them, and you remain at the centre of every decision.",
    ],
  },
};

const STEP = { title: 0, body: 200, grafik: 120 } as const;
const DURATION = 460;

interface Props {
  isVertical?: boolean;
  domId?: string;
  sprache?: Sprache;
  homepage?: any;
  marke?: { nr: string; name: string };
  /** Tellian-Knoten der Grafik → Unterseite Mandat. */
  onMandat?: () => void;
}

export function StationGeschaeftsbeziehungen({
  isVertical = false,
  domId,
  sprache = "DE",
  homepage,
  marke,
  onMandat,
}: Props) {
  const { t } = useLanguage();
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion || isVertical;
  const basisStation = INHALT[sprache];
  const cmsAbsaetze: string[] = (homepage?.relationshipsParagraphs ?? [])
    .map((a: unknown) => t(a as Parameters<typeof t>[0], ""))
    .filter((a: string) => a.trim().length > 0);
  const inhalt: StationInhalt = {
    titel: [
      t(homepage?.relationshipsHeadingLine1, basisStation.titel[0]),
      t(homepage?.relationshipsHeadingLine2, basisStation.titel[1]),
    ],
    absaetze: cmsAbsaetze.length > 0 ? cmsAbsaetze : basisStation.absaetze,
  };

  /* Dreieck: Sanity-Felder der Parteien, Rückfall je Sprache. */
  const basis = DREIECK_INHALT[sprache];
  const kanten: [string, string, string] = [
    t(homepage?.methodEdgeLabelAuftrag, basis.kanten[0]),
    t(homepage?.methodEdgeLabelDepot, basis.kanten[1]),
    t(homepage?.methodEdgeLabelVollmacht, basis.kanten[2]),
  ];
  const dreieck: DreieckInhalt = {
    sie: t(homepage?.methodPartyKundeLabel, basis.sie),
    tellian: t(homepage?.methodPartyTellianLabel, basis.tellian),
    bank: t(homepage?.methodPartyBankenLabel, basis.bank),
    kanten,
    kantenZeilen: kanten.map((k, i) =>
      k === basis.kanten[i] ? basis.kantenZeilen[i] : kantenZeilen(k),
    ) as unknown as DreieckInhalt["kantenZeilen"],
    prosa: {
      sie: t(homepage?.methodPartyKundeProsa, basis.prosa.sie),
      tellian: t(homepage?.methodPartyTellianProsa, basis.prosa.tellian),
      bank: t(homepage?.methodPartyBankenProsa, basis.prosa.bank),
    },
  };

  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const titel = (
    <div style={{ containerType: "inline-size" }}>
      <h2
        style={{
          margin: 0,
          fontFamily: serif,
          fontSize: "min(var(--tellian-s2-title-size), 10.8cqi)",
          fontWeight: 400,
          lineHeight: "var(--tellian-titel-lh)" as unknown as number,
          letterSpacing: "var(--tellian-titel-ls)",
          color: "var(--tellian-s2-ink)",
          hyphens: "auto",
          overflowWrap: "anywhere",
        }}
        lang={sprache === "EN" ? "en" : "de"}
      >
        {inhalt.titel[0]}
        <br />
        <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{inhalt.titel[1]}</em>
      </h2>
    </div>
  );

  const absaetze = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--tellian-abstand-absatz)" }}>
      {inhalt.absaetze.map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-s2-dim)",
            maxWidth: "52ch",
          }}
        >
          {text}
        </p>
      ))}
    </div>
  );

  /* ── SCHMAL ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-s2-bg)",
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
          }}
        >
          {marke && <Kapitelmarke nr={marke.nr} name={marke.name} hell />}
          <Aufgang>{titel}</Aufgang>
          <Aufgang stufe={1}>{absaetze}</Aufgang>
          <Aufgang stufe={1}>
            <DreiecksBeziehung sprache={sprache} inhalt={dreieck} onMandat={onMandat} kompakt />
          </Aufgang>
        </div>
      </section>
    );
  }

  /* ── BREIT — 5/7, beide Gruppen vertikal zentriert ── */
  return (
    <div
      id={domId}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: SECTION_WIDTH,
        backgroundColor: "var(--tellian-s2-bg)",
        backgroundImage: "var(--tellian-flaeche-dunkel)",
      }}
      data-tellian-station="3"
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
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--tellian-abstand-titel)" }}>
          <div style={enter(STEP.title, 24)}>{titel}</div>
          <div style={enter(STEP.body)}>{absaetze}</div>
        </div>

        <div style={{ minWidth: 0, display: "flex", justifyContent: "center", ...enter(STEP.grafik, 20) }}>
          <div
            style={{
              width: "100%",
              maxWidth:
                "min(100%, calc((100vh - var(--tellian-kopf-height) - var(--tellian-station-height)) * 0.87))",
            }}
          >
            <DreiecksBeziehung sprache={sprache} inhalt={dreieck} onMandat={onMandat} />
          </div>
        </div>
      </div>
    </div>
  );
}
