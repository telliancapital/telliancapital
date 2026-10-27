"use client";

import { useMemo, useRef, useState } from "react";

import { C, sans, serif } from "@/tokens";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { useTitelHoehe } from "./useTitelHoehe";
import { TeamDetail } from "./TeamDetail";
import { TEAM_BILD_FILTER, teamKachel, teamPortraet, type SanityTeamImage, type TeamBild } from "@/sanity/lib/teamImage";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LocaleValue } from "@/i18n/types";
import type { Sprache } from "@/sections";

/* UI-Texte liegen DE/EN vor; FR fällt wie in der Vorlage (TODO-FR) auf DE zurück. */
const kern = (s: Sprache): "DE" | "EN" => (s === "FR" ? "DE" : s);

/* ═══════════════════════════════════════════════════════════
   STATION 05 — DAS TEAM (hell)

   Die Übersicht zeigt je Karte Foto, Name und Rolle. Die
   persönlichen Texte leben in der Detailansicht (TeamDetail), die
   per Klick auf die ganze Karte öffnet. Karten MIT Text tragen das
   Label «Mehr lesen»; Karten ohne Text sind keine Bedienelemente.

   INHALTE aus Sanity: teamHeadingLine1/2 und teamMembers[] (name,
   role, email, linkedin, bio, image) — dieselben Felder wie in der
   bisherigen Sektion 5.

   SOLUTIONS (Vorlage: Station5Team mit personenIds): nur wenige
   Porträts, entsprechend Raum — die Kacheln laufen 33 % grösser als
   auf der Hauptseite (Breite UND Höhe, sonst änderte sich der
   Ausschnitt), die Station ist 100vw breit, die Reihe misst sich an
   ihren Kacheln und beginnt links; die Kachel trägt das FORMAT des
   Motivs. Schmal ohne Kapitelmarke.

   BILDER: Die Kacheln laden wie in der Vorlage eine zugeschnittene
   0.9-Fassung in Grössenstufen, das geöffnete Porträt das ganze Foto —
   beides rechnet das Sanity-CDN aus dem Original (teamImage.ts).
   ═══════════════════════════════════════════════════════════ */

interface Person {
  id: string;
  name: string;
  rolle: string;
  /** Kachel (Verhältnis 0.9, Stufen 340–1000). */
  bild?: TeamBild;
  /** Ungeschnittenes Porträt für die Detailansicht. */
  bildVoll?: TeamBild;
  linkedin?: string;
  mail?: string;
  absaetze: readonly string[];
}

type CmsMember = {
  name?: string;
  role?: LocaleValue;
  email?: string;
  linkedin?: string;
  bio?: LocaleValue;
  image?: SanityTeamImage | null;
  imageAsset?: { url?: string };
  imageUrl?: string;
};

/* Bildquelle: das Sanity-Bild (mit Hotspot/Crop) fürs CDN; sonst die
   reine URL (Asset-URL oder externer Rückfall), unverändert. */
const bildQuelle = (m: CmsMember): { kachel?: TeamBild; voll?: TeamBild } => {
  const image: SanityTeamImage | null = m.image?.asset
    ? m.image
    : m.imageAsset?.url
      ? { asset: { url: m.imageAsset.url } }
      : null;
  if (image) {
    return { kachel: teamKachel(image, m.name) ?? undefined, voll: teamPortraet(image) ?? undefined };
  }
  if (m.imageUrl) {
    const roh = { src: m.imageUrl, srcSet: "" };
    return { kachel: roh, voll: roh };
  }
  return {};
};

const UI = {
  DE: { mehr: "Mehr lesen" },
  EN: { mehr: "Read more" },
} as const;

const MAIL_FIRMA = "info@telliancapital.ch";

const TITEL: Readonly<Record<"DE" | "EN", readonly [string, string]>> = {
  DE: ["Das", "Team"],
  EN: ["The", "Team"],
};

/* Solutions zeigt nur zwei Porträts und hat entsprechend Raum: die
   Kacheln laufen 33 % grösser (Vorlage: GROSS in Station5Team). */
const GROSS = 1.33;
const KACHEL_BREITE = `clamp(${240 * GROSS}px, ${21 * GROSS}vw, ${320 * GROSS}px)`;

const initialen = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((t) => t[0])
    .join("");

/** mailto-Ziel einer Person: eigene Adresse, sonst Haus + Betreff. */
function mailZiel(person: Person, sprache: Sprache): string {
  if (person.mail) return `mailto:${person.mail}`;
  const betreff = sprache === "EN" ? `Enquiry for ${person.name}` : `Anfrage an ${person.name}`;
  return `mailto:${MAIL_FIRMA}?subject=${encodeURIComponent(betreff)}`;
}

interface Props {
  isVertical?: boolean;
  domId?: string;
  sprache?: Sprache;
  homepage?: any;
  marke?: { nr: string; name: string };
  /** Meldet der App, dass das Overlay offen ist. */
  onDetailToggle?: (offen: boolean) => void;
}

export function StationTeam({
  isVertical = false,
  domId,
  sprache = "DE",
  homepage,
  marke,
  onDetailToggle,
}: Props) {
  const { t } = useLanguage();

  /* Die CDN-URLs (vier Stufen je Kachel) nur bei neuen CMS-Daten oder
     Sprachwechsel neu bauen — nicht bei jedem Render der Station. */
  const LEUTE: Person[] = useMemo(() => ((homepage?.teamMembers ?? []) as CmsMember[])
    .filter((m) => !!m?.name)
    .map((m, i) => ({
      id: `${i}-${m.name}`,
      name: m.name as string,
      rolle: t(m.role, ""),
      bild: bildQuelle(m).kachel,
      bildVoll: bildQuelle(m).voll,
      linkedin: m.linkedin || undefined,
      mail: m.email || undefined,
      absaetze: t(m.bio, "")
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    })), [homepage?.teamMembers, t]);

  const titelZeile1 = t(homepage?.teamHeadingLine1, TITEL[kern(sprache)][0]);
  const titelZeile2 = t(homepage?.teamHeadingLine2, TITEL[kern(sprache)][1]);
  /* «Mehr lesen» auf den Kacheln: aus dem CMS (teamReadMoreLabel), Rückfall je Sprache. */
  const mehrLabel = t(homepage?.teamReadMoreLabel, UI[kern(sprache)].mehr);

  const [offenId, setOffenId] = useState<string | null>(null);
  const kachelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rueckkehrRef = useRef<HTMLElement | null>(null);

  const oeffnen = (p: Person) => {
    rueckkehrRef.current = kachelRefs.current[p.id] ?? null;
    setOffenId(p.id);
    onDetailToggle?.(true);
  };
  const schliessen = () => {
    setOffenId(null);
    onDetailToggle?.(false);
    requestAnimationFrame(() => rueckkehrRef.current?.focus({ preventScroll: true }));
  };

  const offenPerson = LEUTE.find((p) => p.id === offenId) ?? null;

  const kopf = (
    <h2
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-t5-heading-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-t5-heading-leading)" as unknown as number,
        letterSpacing: "var(--tellian-t5-heading-tracking)",
        color: C.ink,
      }}
    >
      {titelZeile1}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{titelZeile2}</em>
    </h2>
  );

  /* Stufenwahl wie in der Vorlage: 26vw breit, 46vw schmal. */
  const portraet = (person: Person) =>
    person.bild ? (
      <img
        src={person.bild.src}
        srcSet={person.bild.srcSet || undefined}
        sizes={person.bild.srcSet ? (isVertical ? "46vw" : "30vw") : undefined}
        alt=""
        decoding="async"
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 0%",
          filter: TEAM_BILD_FILTER,
        }}
      />
    ) : (
      <span
        aria-hidden
        style={{
          fontFamily: serif,
          fontSize: "var(--tellian-t5-initial-size)",
          letterSpacing: "0.06em",
          color: "var(--tellian-t5-placeholder-ink)",
        }}
      >
        {initialen(person.name)}
      </span>
    );

  const karte = (person: Person, breit: boolean) => {
    /* Jede Karte ist ein Knopf mit «Mehr lesen» und öffnet das Porträt —
       auch wenn die Biografie im CMS (noch) leer ist. */
    const hatText = true;
    const innen = (
      <>
        <span
          className="tellian-t5-bild"
          style={{
            display: "flex",
            width: "100%",
            /* Teilmenge (Solutions): die Kachel bekommt das FORMAT des
               Motivs — dort ist Platz, und das Porträt steht vollständig. */
            aspectRatio: "var(--tellian-t5-tile-ratio)",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--tellian-t5-placeholder-bg)",
          }}
        >
          {portraet(person)}
        </span>
        <span
          style={{
            display: "block",
            marginTop: "var(--tellian-t5-label-gap)",
            ...(breit ? { height: "var(--tellian-t5-label-row)" } : null),
          }}
        >
          <span style={breit ? { display: "flex", alignItems: "stretch" } : undefined}>
            <span style={breit ? { flex: "1 1 auto", minWidth: 0 } : undefined}>
              <span
                style={{
                  display: "block",
                  fontFamily: sans,
                  fontSize: breit ? "var(--tellian-t5-name-size)" : "var(--tellian-t5-name-size-schmal)",
                  fontWeight: 600,
                  lineHeight: "var(--tellian-t5-name-leading)" as unknown as number,
                  color: C.ink,
                  minHeight: breit
                    ? "calc(var(--tellian-t5-name-size) * var(--tellian-t5-name-leading))"
                    : undefined,
                }}
              >
                {person.name}
              </span>
              {(person.rolle !== "" || !breit) && (
                <span
                  style={{
                    display: "block",
                    marginTop: "var(--tellian-t5-name-role-gap)",
                    fontFamily: sans,
                    fontSize: "var(--tellian-t5-role-size)",
                    lineHeight: "var(--tellian-t5-role-leading)",
                    color: C.accent,
                  }}
                >
                  {person.rolle}
                </span>
              )}
              {hatText && (
                <span
                  className="tellian-t5-mehr"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "var(--tellian-t5-cta-gap)",
                    fontFamily: sans,
                    fontSize: "var(--tellian-t5-cta-size)",
                    fontWeight: 500,
                    letterSpacing: "var(--tellian-ls-cta-klein)",
                    color: C.ink,
                  }}
                >
                  <span className="tellian-t5-pfeil" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </span>
                  {mehrLabel}
                </span>
              )}
            </span>
          </span>
        </span>
      </>
    );

    const huelle = (kind: React.ReactNode) => (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
        {kind}
      </div>
    );

    if (!hatText) {
      return huelle(
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>{innen}</div>,
      );
    }
    return huelle(
      <button
        type="button"
        ref={(el) => {
          kachelRefs.current[person.id] = el;
        }}
        onClick={() => oeffnen(person)}
        aria-haspopup="dialog"
        aria-label={`${person.name}${person.rolle ? ", " + person.rolle : ""} — ${mehrLabel}`}
        className="tellian-t5-kachel"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {innen}
      </button>,
    );
  };

  const stil = (
    <style>{`
      .tellian-t5-kachel { outline: none; }
      .tellian-t5-kachel:focus-visible {
        outline: 2px solid var(--tellian-t5-focus);
        outline-offset: 3px;
      }
      .tellian-t5-pfeil {
        display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
        width: var(--tellian-t5-cta-kreis); height: var(--tellian-t5-cta-kreis);
        border-radius: 50%; border: 1px solid var(--tellian-stone); color: var(--tellian-ink);
        transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
      }
      .tellian-t5-pfeil svg { transition: transform 200ms ease; }
      .tellian-t5-kachel:hover .tellian-t5-pfeil,
      .tellian-t5-kachel:focus-visible .tellian-t5-pfeil {
        background-color: var(--tellian-accent-gold);
        border-color: var(--tellian-accent-gold);
        color: var(--tellian-accent-gold-text);
      }
      .tellian-t5-kachel:hover .tellian-t5-pfeil svg,
      .tellian-t5-kachel:focus-visible .tellian-t5-pfeil svg { transform: translateX(2px); }
      @media (prefers-reduced-motion: reduce) {
        .tellian-t5-pfeil, .tellian-t5-pfeil svg { transition: none; }
        .tellian-t5-kachel:hover .tellian-t5-pfeil svg { transform: none; }
      }
      .tellian-t5-bild img { width: 100%; height: 100%; object-fit: cover; }
    `}</style>
  );

  const detail = offenPerson && (
    <TeamDetail
      offen
      name={offenPerson.name}
      rolle={offenPerson.rolle}
      bild={offenPerson.bildVoll ?? offenPerson.bild}
      mail={mailZiel(offenPerson, sprache)}
      linkedin={offenPerson.linkedin}
      absaetze={offenPerson.absaetze}
      sprache={sprache}
      isMobile={isVertical}
      onClose={schliessen}
      returnFocusRef={rueckkehrRef}
    />
  );

  /* ── SCHMAL: zwei Spalten ── */
  if (isVertical) {
    return (
      <section id={domId} style={{ backgroundColor: C.bg, scrollMarginTop: "var(--tellian-kopf-height)" }}>
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(18px, 4.6vw, 40px)",
            paddingRight: "clamp(18px, 4.6vw, 40px)",
          }}
        >
          {marke && (
            <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
              <Kapitelmarke nr={marke.nr} name={marke.name} />
            </div>
          )}
          <Aufgang>{kopf}</Aufgang>
          <div
            style={{
              marginTop: "clamp(28px, 4vh, 44px)",
              display: "grid",
              gridTemplateColumns: "repeat(var(--tellian-t5-cols-schmal), minmax(0, 1fr))",
              columnGap: "8px",
              rowGap: "clamp(22px, 3vh, 30px)",
            }}
          >
            {LEUTE.map((person, i) => (
              <Aufgang key={person.id} stufe={i % 2}>
                {karte(person, false)}
              </Aufgang>
            ))}
          </div>
        </div>
        {detail}
        {stil}
      </section>
    );
  }

  /* ── BREIT: Titelspalte + Kachelreihen à vier ── */
  const reihen = Math.max(1, Math.ceil(LEUTE.length / 4));

  return (
    <StationTeamBreit
      domId={domId}
      kopf={kopf}
      reihen={reihen}
      leute={LEUTE}
      karte={karte}
      detail={detail}
      stil={stil}
    />
  );
}

/* Breiter Zweig in eigener Komponente, damit useTitelHoehe nicht
   bedingt aufgerufen wird. */
function StationTeamBreit({
  domId,
  kopf,
  reihen,
  leute,
  karte,
  detail,
  stil,
}: {
  domId?: string;
  kopf: React.ReactNode;
  reihen: number;
  leute: Person[];
  karte: (p: Person, breit: boolean) => React.ReactNode;
  detail: React.ReactNode;
  stil: React.ReactNode;
}) {
  const { wurzelRef, oben: kopfOben } = useTitelHoehe(true);
  return (
    <div
      id={domId}
      ref={(el) => {
        (wurzelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="flex-shrink-0 h-screen relative"
      /* Teilmenge: 100vw statt der inhaltsbreiten Fünferreihe. */
      style={{ width: "100vw", backgroundColor: C.bg }}
      data-tellian-station="2"
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "stretch",
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: "0 0 var(--tellian-t5-title-col)", marginRight: "var(--tellian-t5-mid-gap)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              ...(kopfOben === null
                ? { top: "50%", transform: "translateY(-50%)" }
                : { top: `calc(${kopfOben}px - var(--tellian-s1-stage-pad))` }),
              /* Wie in der Vorlage inhaltsbreit; der Deckel hält einen
                 längeren CMS-Titel aus den Kacheln — die Zwei-Zeilen-
                 Regel (zweiZeilen.ts) nimmt ihn dann eine Stufe zurück. */
              width: "max-content",
              maxWidth: "calc(var(--tellian-t5-title-col) + var(--tellian-t5-mid-gap) - 12px)",
            }}
          >
            {kopf}
          </div>
        </div>

        <div
          style={{
            /* Teilmenge: die Reihe misst sich an ihren Kacheln. */
            flex: "1 1 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {Array.from({ length: reihen }, (_, reihe) => (
            <ul
              key={reihe}
              style={{
                listStyle: "none",
                margin: reihe === 0 ? "0" : "var(--tellian-t5-row-gap) 0 0",
                padding: 0,
                display: "flex",
                gap: "var(--tellian-t5-gap)",
                justifyContent: "flex-start",
                /* Die Höhe ergibt sich aus dem Bildformat, nicht aus der Reihenvorgabe. */
                height: "auto",
              }}
            >
              {leute.slice(reihe * 4, reihe * 4 + 4).map((person) => (
                <li
                  key={person.id}
                  style={{ flex: `0 0 ${KACHEL_BREITE}`, minWidth: 0, display: "flex", flexDirection: "column" }}
                >
                  {karte(person, true)}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {detail}
      {stil}
    </div>
  );
}
