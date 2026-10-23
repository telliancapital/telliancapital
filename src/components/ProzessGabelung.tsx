"use client";

import { C, cormorant, sans, serif } from "@/tokens";
import type { Sprache } from "@/sections";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════════
   ZWEI WEGE — Auswahlbereich der Station Vermögensverwaltung

   Ein Titel über zwei gleichrangigen Karten (Mandat / Advisory).
   EIN Bedienelement je Karte: die ganze Karte ist die Klickfläche.
   Titel und Kartentexte kommen aus Sanity (homepage → Methode →
   «Two paths»: methodPathsTitle, methodPathsMandat, methodPathsAdvisory).
   Ohne CMS-Werte greift der Wortlaut des Redesign-Briefings.
   ═══════════════════════════════════════════════════════════ */

interface Karte {
  id: "mandat" | "advisory";
  punkt: "mushroom" | "nacht";
  eyebrow: string;
  name: string;
  text: string;
  fuer: string;
  knopf: string;
}

interface GabelungInhalt {
  wegeTitel: string;
  karten: readonly [Karte, Karte];
}

const INHALT: Readonly<Record<Sprache, GabelungInhalt>> = {
  DE: {
    wegeTitel: "Zwei Wege, ein Anspruch",
    karten: [
      {
        id: "mandat",
        punkt: "mushroom",
        eyebrow: "Wir verwalten",
        name: "Mandat",
        text: "Sie übertragen uns die Verwaltung Ihres Portfolios. Wir treffen die Anlageentscheide innerhalb Ihrer definierten Strategie und Ihres Risikoprofils.",
        fuer: "Für Kunden, die ihre Anlageentscheide in professionelle Hände geben möchten.",
        knopf: "Mehr zum Mandat",
      },
      {
        id: "advisory",
        punkt: "nacht",
        eyebrow: "Sie entscheiden",
        name: "Advisory",
        text: "Wir analysieren Ihr Portfolio auf Basis Ihrer Ziele und Ihres Risikoprofils und beraten Sie unter Berücksichtigung des aktuellen Marktumfelds.",
        fuer: "Für Kunden, die ihre Anlageentscheide selbst treffen und dabei auf professionelle Beratung setzen möchten.",
        knopf: "Mehr zu Advisory",
      },
    ],
  },
  EN: {
    wegeTitel: "Two paths, one standard",
    karten: [
      {
        id: "mandat",
        punkt: "mushroom",
        eyebrow: "We manage",
        name: "Discretionary Mandate",
        text: "You entrust us with the management of your portfolio. We make investment decisions within your agreed strategy and risk profile.",
        fuer: "For clients who wish to place their investment decisions in professional hands.",
        knopf: "Learn more about our mandate",
      },
      {
        id: "advisory",
        punkt: "nacht",
        eyebrow: "You decide",
        name: "Advisory",
        text: "We analyse your portfolio in the context of your objectives, risk profile and the current market environment, and translate this into specific investment recommendations.",
        fuer: "For clients who wish to make their own investment decisions while benefiting from professional advice.",
        knopf: "Learn more about Advisory",
      },
    ],
  },
};

interface CmsKarte {
  eyebrow?: LocaleValue;
  name?: LocaleValue;
  text?: LocaleValue;
  audience?: LocaleValue;
  buttonLabel?: LocaleValue;
}

export interface ProzessGabelungCms {
  methodPathsTitle?: LocaleValue;
  methodPathsMandat?: CmsKarte | null;
  methodPathsAdvisory?: CmsKarte | null;
}

interface Props {
  /** CMS-Dokument (homepage) für Titel und Kartentexte. */
  homepage?: ProzessGabelungCms | null;
  /** Karten untereinander. */
  gestapelt?: boolean;
  /** Station liegt auf Imperial Purple: Titel hell, Fokusring hell. */
  aufDunkel?: boolean;
  /** Lead-Text zwischen Titel und Karten. */
  lead?: string;
  sprache?: Sprache;
  onMandat?: () => void;
  onAdvisory?: () => void;
}

export function ProzessGabelung({
  gestapelt = false,
  aufDunkel = false,
  lead,
  sprache = "DE",
  homepage,
  onMandat,
  onAdvisory,
}: Props) {
  const handler = { mandat: onMandat, advisory: onAdvisory } as const;
  const { t } = useLanguage();
  const basis = INHALT[sprache];

  /* CMS-Werte je Feld, Fallback = Wortlaut des Redesigns. */
  const cmsKarten = { mandat: homepage?.methodPathsMandat, advisory: homepage?.methodPathsAdvisory } as const;
  const inhalt: GabelungInhalt = {
    wegeTitel: t(homepage?.methodPathsTitle, basis.wegeTitel),
    karten: basis.karten.map((k) => {
      const c = cmsKarten[k.id];
      return {
        ...k,
        eyebrow: t(c?.eyebrow, k.eyebrow),
        name: t(c?.name, k.name),
        text: t(c?.text, k.text),
        fuer: t(c?.audience, k.fuer),
        knopf: t(c?.buttonLabel, k.knopf),
      };
    }) as unknown as readonly [Karte, Karte],
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: gestapelt || aufDunkel ? "none" : "var(--tellian-pm-graphic-max)",
        margin: aufDunkel ? "0" : "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          margin: "0 0 clamp(14px, 2.4vh, 30px)",
          fontFamily: serif,
          fontSize: "var(--tellian-pm-wege-size)",
          fontWeight: 400,
          lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
          color: aufDunkel ? "var(--tellian-pm-wege-color)" : C.ink,
          textAlign: gestapelt || aufDunkel ? "left" : "center",
        }}
      >
        {inhalt.wegeTitel}
      </h3>

      {lead && (
        <p
          style={{
            margin: "0 0 clamp(26px, 4.4vh, 40px)",
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            maxWidth: "66ch",
            color: aufDunkel ? "var(--tellian-pm-dunkel-dim)" : C.accent,
          }}
        >
          {lead}
        </p>
      )}

      {/* ── DIPTYCHON: zwei Karten als EIN Block ── */}
      <div
        style={
          gestapelt
            ? { display: "flex", flexDirection: "column", gap: "clamp(18px, 3vh, 28px)" }
            : {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "auto auto auto 1fr auto",
                columnGap: "2px",
                padding: "1px",
                backgroundColor: "var(--tellian-pm-fuge)",
              }
        }
      >
        {inhalt.karten.map((k) => {
          const zeile = (inhaltZeile: React.ReactNode, stil: React.CSSProperties) =>
            gestapelt ? (
              <span style={{ display: "block", ...stil }}>{inhaltZeile}</span>
            ) : (
              <span style={{ display: "block", minWidth: 0, ...stil }}>{inhaltZeile}</span>
            );
          return (
            <button
              key={k.id}
              type="button"
              onClick={handler[k.id]}
              className={aufDunkel ? "tellian-pm-karte tellian-pm-karte--aufdunkel" : "tellian-pm-karte"}
              style={{
                textAlign: "left",
                font: "inherit",
                cursor: "pointer",
                border: gestapelt ? "1px solid var(--tellian-pm-fuge)" : "none",
                borderRadius: 0,
                padding: 0,
                ...(gestapelt
                  ? { display: "flex", flexDirection: "column", alignItems: "stretch" }
                  : {
                      display: "grid",
                      gridTemplateRows: "subgrid",
                      gridRow: "1 / -1",
                      alignItems: "start",
                    }),
              }}
            >
              {zeile(
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: sans,
                    fontSize: "var(--tellian-pm-card-eyebrow-size)",
                    letterSpacing: "0.04em",
                    lineHeight: "var(--tellian-pm-card-eyebrow-leading)",
                    color: C.accent,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flex: "0 0 auto",
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor:
                        k.punkt === "mushroom" ? "var(--tellian-muted)" : "var(--tellian-pm-knopf-nacht)",
                    }}
                  />
                  {k.eyebrow}
                </span>,
                {
                  padding: "clamp(16px, 2.6vh, 22px) var(--tellian-pm-dip-pad-x) 12px",
                  borderBottom: "1px solid var(--tellian-pm-fuge)",
                },
              )}

              {zeile(
                <span
                  style={{
                    fontFamily: serif,
                    fontSize: "var(--tellian-pm-card-name-size)",
                    fontWeight: 400,
                    lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
                    letterSpacing: "var(--tellian-pm-card-name-tracking)",
                    color: C.ink,
                  }}
                >
                  {k.name}
                </span>,
                { padding: "clamp(16px, 2.6vh, 22px) var(--tellian-pm-dip-pad-x) 0" },
              )}

              {zeile(
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: "var(--tellian-pm-card-text-size)",
                    lineHeight: 1.5,
                    color: C.accent,
                  }}
                >
                  {k.text}
                </span>,
                { padding: "12px var(--tellian-pm-dip-pad-x) 0" },
              )}

              {zeile(
                <>
                  <span
                    aria-hidden
                    style={{ display: "block", height: "1px", backgroundColor: "var(--tellian-pm-fuge)" }}
                  />
                  <span
                    style={{
                      display: "block",
                      marginTop: "14px",
                      fontFamily: cormorant,
                      fontStyle: "italic",
                      fontSize: "var(--tellian-pm-card-fuer-size)",
                      lineHeight: "var(--tellian-kursiv-lh)" as unknown as number,
                      color: "var(--tellian-pm-card-fuer-color)",
                    }}
                  >
                    {k.fuer}
                  </span>
                </>,
                { padding: "clamp(14px, 2.2vh, 18px) var(--tellian-pm-dip-pad-x) 0" },
              )}

              {zeile(
                <span
                  className={`tellian-pm-knopf tellian-pm-knopf--${k.id}`}
                  style={{
                    display: "inline-block",
                    fontFamily: sans,
                    fontSize: "var(--tellian-pm-card-link-size)",
                    letterSpacing: "var(--tellian-ls-cta-klein)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "var(--tellian-pm-knopf-pad)",
                      borderRadius: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {k.knopf} <span aria-hidden>→</span>
                  </span>
                </span>,
                {
                  padding:
                    "var(--tellian-pm-cta-pad-oben) var(--tellian-pm-dip-pad-x) var(--tellian-pm-dip-pad-unten)",
                  ...(gestapelt ? { marginTop: "auto" } : { alignSelf: "end" }),
                },
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        .tellian-pm-karte {
          border-color: var(--tellian-pm-line);
          background-color: var(--tellian-pm-card-bg);
          transform: translateY(0);
          box-shadow: none;
          transition:
            border-color var(--tellian-pm-card-ms) ease,
            background-color var(--tellian-pm-card-ms) ease,
            transform var(--tellian-pm-card-ms) ease,
            box-shadow var(--tellian-pm-card-ms) ease;
        }
        .tellian-pm-karte:hover,
        .tellian-pm-karte:focus-visible {
          border-color: var(--tellian-pm-line-active);
          background-color: var(--tellian-pm-card-bg-aktiv);
          transform: translateY(var(--tellian-pm-card-hub));
          box-shadow: var(--tellian-pm-card-schatten);
        }
        .tellian-pm-knopf > span {
          font-weight: var(--tellian-pm-knopf-weight);
          transition:
            background-color var(--tellian-pm-card-ms) ease,
            color var(--tellian-pm-card-ms) ease;
        }
        .tellian-pm-knopf--mandat > span {
          background-color: var(--tellian-pm-knopf-mandat);
          color: var(--tellian-pm-knopf-mandat-ink);
        }
        .tellian-pm-karte:hover .tellian-pm-knopf--mandat > span,
        .tellian-pm-karte:focus-visible .tellian-pm-knopf--mandat > span {
          background-color: var(--tellian-pm-knopf-mandat-aktiv);
        }
        .tellian-pm-knopf--advisory > span {
          background-color: var(--tellian-pm-knopf-nacht);
          color: var(--tellian-pm-knopf-nacht-ink);
        }
        .tellian-pm-karte:hover .tellian-pm-knopf--advisory > span,
        .tellian-pm-karte:focus-visible .tellian-pm-knopf--advisory > span {
          background-color: var(--tellian-pm-knopf-nacht-aktiv);
        }
        .tellian-pm-karte:focus-visible {
          outline: 2px solid var(--tellian-pm-focus-ring);
          outline-offset: 3px;
        }
        .tellian-pm-karte--aufdunkel:focus-visible {
          outline-color: var(--tellian-pm-focus-ring-dunkel);
        }
        .tellian-pm-karte--aufdunkel {
          background-color: var(--tellian-bg);
          transform: none;
          box-shadow: none;
        }
        .tellian-pm-karte--aufdunkel:hover,
        .tellian-pm-karte--aufdunkel:focus-visible {
          background-color: var(--tellian-pm-card-bg-aktiv);
          transform: none;
          box-shadow: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-pm-karte,
          .tellian-pm-karte * { transition: none !important; }
          .tellian-pm-karte:hover,
          .tellian-pm-karte:focus-visible { transform: none; }
        }
      `}</style>
    </div>
  );
}
