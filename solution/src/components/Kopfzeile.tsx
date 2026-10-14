"use client";

import { useEffect, useState } from "react";

import { sans } from "@/tokens";
import { SECTIONS, type Sprache } from "@/sections";
import { zonenMaske, hatZone, type Zone, type BandSchicht } from "./useBandTon";
import logoDunkel from "@/assets/logo/tellian-logo-dunkel.svg";
import logoHell from "@/assets/logo/tellian-logo-hell.svg";
import monoDunkel from "@/assets/logo/tellian-monogramm-dunkel.svg";
import monoHell from "@/assets/logo/tellian-monogramm-hell.svg";

/* ═══════════════════════════════════════════════════════════
   KOPFZEILE

   Links das Logo, rechts Welten-Umschalter, Sprachwahl, ein senkrechter
   Trenner und das Kundenportal. Sonst nichts.

   KEINE EIGENE FLÄCHE
   Die Kopfzeile ist durchsichtig und liegt über dem, was gerade
   darunter ist. Nur im schmalen Zweig bekommt sie ab dem Scrollen eine
   deckende Fläche — dort läuft der Inhalt sonst hindurch.

   DREI SCHICHTEN STATT EINER FARBE
   Derselbe Inhalt wird mehrfach gezeichnet:
     1. in dunkler Schrift, maskiert auf die HELLEN Bereiche,
     2. in heller Schrift, maskiert auf die DUNKLEN,
     3. hell mit Scrim, maskiert auf FOTOS,
     4. unsichtbar und unmaskiert als Griff — sie trägt die Knöpfe,
        den Tastaturweg und den Fokusring.
   Die Farbschichten sind reine Farbe (aria-hidden, keine Zeiger).

   Beschriftungen (Portal) kommen aus Sanity — s. HomeClient.
   ═══════════════════════════════════════════════════════════ */

const SPRACHEN_STANDARD = ["DE", "EN"] as const satisfies readonly Sprache[];

type Schicht = "hell" | "dunkel" | "bild" | "griff";

interface Props {
  /** Sichtbare Stationsbereiche — siehe useBandZonen. */
  zonen: Zone[];
  sprache: Sprache;
  onSprache: (s: Sprache) => void;
  onPortal: () => void;
  /** Sprung auf Station 1 — das Logo ist der Weg zurück. */
  onLogo: () => void;
  /** Schmaler Zweig: zusätzlich der Menüknopf. */
  isVertical?: boolean;
  menueOffen?: boolean;
  onMenue?: () => void;
  /** Welt, in der die Kopfzeile steht. */
  welt?: "capital" | "solutions";
  /** Wechsel in die andere Welt. */
  onWelt?: (ziel: "capital" | "solutions") => void;
  logoHref?: string;
  logoLabel?: string;
  /** Sichtbarer Sprachumfang des Toggles. Standard DE/EN. */
  sprachen?: readonly Sprache[];
  /** Hinterlegung des Portalfelds über dem Foto. */
  bildScrim?: string;
  /** Dezenter Schatten unter der Schrift auf hellen Fotos. */
  bildSchatten?: boolean;
  /** Beschriftung des Portal-Felds (aus Sanity). */
  portalLabel?: string;
  /** Beschriftung des Welten-Eintrags «Capital» (aus Sanity). */
  weltLabel?: string;
  /** Während des Intros bleibt die Kopfzeile unsichtbar. */
  sichtbar?: boolean;
}

/* Schlosszeichen. Rein dekorativ — der Knopf trägt seinen Namen
   bereits als Text. */
function Schloss() {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: "block" }}
    >
      <rect x="0.6" y="5.2" width="9.8" height="7.2" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.9 5.2V3.4a2.6 2.6 0 0 1 5.2 0v1.8" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function Kopfzeile({
  zonen,
  sprache,
  onSprache,
  onPortal,
  onLogo,
  isVertical = false,
  menueOffen = false,
  onMenue,
  welt = "capital",
  onWelt,
  logoHref,
  logoLabel,
  sprachen = SPRACHEN_STANDARD,
  portalLabel,
  weltLabel,
  bildScrim = "rgba(40, 31, 51, 0.22)",
  bildSchatten = false,
  sichtbar = true,
}: Props) {
  const portalText = portalLabel ?? (sprache === "EN" ? "Client portal" : "Kundenportal");
  const weltText = weltLabel ?? (sprache === "EN" ? "Wealth Management" : "Vermögensverwaltung");

  /* ── DECKENDE FLÄCHE, NUR IM SCHMALEN ZWEIG ──
     Erst AB DEM SCROLLEN: am Anfang steht der Hero, und ein deckender
     Balken schnitte ihm oben ein Stück ab. */
  const [gescrollt, setGescrollt] = useState(false);
  useEffect(() => {
    if (!isVertical) return;
    const auf = () => setGescrollt(window.scrollY > 4);
    auf();
    window.addEventListener("scroll", auf, { passive: true });
    return () => window.removeEventListener("scroll", auf);
  }, [isVertical]);

  const grundDunkel = zonen[0]?.dunkel ?? false;
  const flaeche =
    isVertical && gescrollt
      ? grundDunkel
        ? "var(--tellian-kopf-flaeche-dunkel)"
        : "var(--tellian-kopf-flaeche-hell)"
      : "transparent";

  /* Zeiger ODER Tastaturfokus füllen das Portalfeld. Der Zustand
     wandert durch React zu allen Schichten. */
  const [portalAn, setPortalAn] = useState(false);
  const [weltAn, setWeltAn] = useState<"capital" | "solutions" | null>(null);

  const inhalt = (schicht: Schicht) => {
    const griff = schicht === "griff";
    const aufDunkel = schicht === "dunkel" || schicht === "bild";
    const ink = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-ink-dunkel)"
        : "var(--tellian-band-ink-hell)";
    const dim = griff
      ? "transparent"
      : schicht === "bild"
        ? "var(--tellian-band-dim-bild)"
        : aufDunkel
          ? "var(--tellian-band-dim-dunkel)"
          : "var(--tellian-band-dim-hell)";
    const weltDim = griff
      ? "transparent"
      : schicht === "bild"
        ? "var(--tellian-welt-dim-bild)"
        : aufDunkel
          ? "var(--tellian-welt-dim-dunkel)"
          : "var(--tellian-welt-dim-hell)";
    const trenner = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-trenner-dunkel)"
        : "var(--tellian-kopf-trenner-hell)";
    const portalLinie = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-portal-line-dunkel)"
        : "var(--tellian-kopf-portal-line-hell)";
    const portalFuellung = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-portal-fuell-dunkel)"
        : "var(--tellian-kopf-portal-fuell-hell)";
    const portalInkGefuellt = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-portal-ink-fuell-dunkel)"
        : "var(--tellian-kopf-portal-ink-fuell-hell)";
    const portalInkRuhe = griff ? "transparent" : aufDunkel ? "var(--tellian-muted)" : ink;

    const klein: React.CSSProperties = {
      fontFamily: sans,
      fontSize: "var(--tellian-kopf-size)",
      letterSpacing: "var(--tellian-kopf-tracking)",
      textTransform: "uppercase",
      lineHeight: 1,
      background: "transparent",
      border: "none",
      padding: 0,
      display: "inline-flex",
      alignItems: "center",
      cursor: griff ? "pointer" : "default",
    };

    return (
      <>
        <a
          href={logoHref ?? `#${SECTIONS[0].anker}`}
          onClick={(e) => {
            e.preventDefault();
            if (griff) onLogo();
          }}
          className="tellian-kopf-ziel tellian-kopf-logo"
          aria-label={logoLabel ?? `Tellian Capital — zurück zu ${SECTIONS[0].label}`}
          aria-hidden={!griff}
          tabIndex={griff ? undefined : -1}
          style={{
            display: "flex",
            flexDirection: welt === "solutions" ? "column" : "row",
            alignItems: welt === "solutions" ? "flex-start" : "center",
            flexShrink: 0,
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <span
              className="tellian-kopf-wortmarke"
              style={{
                height: "var(--tellian-kopf-logo-h)",
                aspectRatio: "3.274",
              }}
            >
              {!griff && (
                <img
                  src={aufDunkel ? logoHell.src : logoDunkel.src}
                  alt=""
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              )}
            </span>
            <span
              className="tellian-kopf-monogramm"
              style={{
                height: "var(--tellian-kopf-logo-h)",
                aspectRatio: "1.139",
              }}
            >
              {!griff && (
                <img
                  src={aufDunkel ? monoHell.src : monoDunkel.src}
                  alt=""
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              )}
            </span>
          </span>
          {welt === "solutions" && (
            <span
              className="tellian-kopf-zusatz"
              style={{
                marginTop: "3px",
                marginLeft: "calc(0.351 * var(--tellian-kopf-logo-h) * 3.274)",
                fontFamily: sans,
                fontSize: "var(--tellian-kopf-zusatz-size)",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: griff ? "transparent" : aufDunkel ? "#B8AEA3" : "#8C8479",
              }}
            >
              Solutions
            </span>
          )}
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tellian-kopf-gruppe-gap)",
            flexShrink: 0,
          }}
        >
          {/* ── Welten-Umschalter ── CAPITAL │ SOLUTIONS. Die aktive
              Welt steht in voller Stärke und ist kein Ziel; die andere
              führt zur Zielwelt. Schmal lebt er im Menü. */}
          {!isVertical && (
            <div
              role={griff ? "group" : undefined}
              aria-label={griff ? "Bereich" : undefined}
              aria-hidden={!griff}
              className="tellian-kopf-welten"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tellian-kopf-gap-innen)",
              }}
            >
              {(["capital", "solutions"] as const).map((ziel, i) => {
                const aktiv = welt === ziel;
                return (
                  <span
                    key={ziel}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--tellian-kopf-gap-innen)",
                    }}
                  >
                    {i > 0 && (
                      <span
                        aria-hidden
                        className="tellian-kopf-trenner"
                        style={{ backgroundColor: trenner }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => griff && !aktiv && onWelt?.(ziel)}
                      onMouseEnter={() => griff && !aktiv && setWeltAn(ziel)}
                      onMouseLeave={() => griff && setWeltAn((w) => (w === ziel ? null : w))}
                      onFocus={() => griff && !aktiv && setWeltAn(ziel)}
                      onBlur={() => griff && setWeltAn((w) => (w === ziel ? null : w))}
                      aria-current={aktiv ? "true" : undefined}
                      aria-disabled={aktiv ? "true" : undefined}
                      tabIndex={griff ? undefined : -1}
                      className={
                        "tellian-kopf-ziel tellian-kopf-welt" +
                        (aktiv && !griff ? " tellian-kopf-welt-aktiv" : "")
                      }
                      style={{
                        ...klein,
                        color: aktiv || weltAn === ziel ? ink : weltDim,
                        fontWeight: aktiv ? 500 : 400,
                        cursor: griff && !aktiv ? "pointer" : "default",
                      }}
                    >
                      {ziel === "capital" ? weltText : "Solutions"}
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {!isVertical && (
            <span aria-hidden className="tellian-kopf-trenner" style={{ backgroundColor: trenner }} />
          )}

          {/* ── Sprachwahl ── leiser als das Portal. Schmal lebt sie
              im Menü. */}
          {!isVertical && (
            <div
              role={griff ? "group" : undefined}
              aria-label={griff ? "Sprache" : undefined}
              aria-hidden={!griff}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tellian-kopf-sprache-gap)",
              }}
            >
              {sprachen.map((s, i) => (
                <span
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--tellian-kopf-sprache-gap)",
                  }}
                >
                  {i > 0 && (
                    <span aria-hidden style={{ ...klein, color: dim, cursor: "default" }}>
                      /
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => griff && onSprache(s)}
                    aria-pressed={sprache === s}
                    tabIndex={griff ? undefined : -1}
                    className="tellian-kopf-ziel tellian-kopf-sprache"
                    style={{ ...klein, color: sprache === s ? ink : dim }}
                  >
                    {s}
                  </button>
                </span>
              ))}
            </div>
          )}

          {!isVertical && (
            <span aria-hidden className="tellian-kopf-trenner" style={{ backgroundColor: trenner }} />
          )}

          {/* ── Kundenportal ── das einzige Feld im Band. */}
          {!isVertical && (
            <button
              type="button"
              onClick={() => griff && onPortal()}
              onMouseEnter={() => griff && setPortalAn(true)}
              onMouseLeave={() => griff && setPortalAn(false)}
              onFocus={() => griff && setPortalAn(true)}
              onBlur={() => griff && setPortalAn(false)}
              tabIndex={griff ? undefined : -1}
              aria-hidden={!griff}
              aria-haspopup="dialog"
              className="tellian-kopf-ziel tellian-kopf-portal"
              style={{
                fontFamily: sans,
                fontSize: "var(--tellian-kopf-portal-size)",
                letterSpacing: "var(--tellian-kopf-tracking)",
                textTransform: "uppercase",
                lineHeight: 1,
                color: portalAn ? portalInkGefuellt : portalInkRuhe,
                backgroundColor: portalAn
                  ? portalFuellung
                  : schicht === "bild"
                    ? bildScrim
                    : "transparent",
                border: `1px solid ${portalAn ? portalFuellung : portalLinie}`,
                borderRadius: 0,
                height: "var(--tellian-kopf-portal-h)",
                padding: "0 var(--tellian-kopf-portal-pad-x)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                cursor: griff ? "pointer" : "default",
                transition: "background-color 180ms ease, border-color 180ms ease, color 180ms ease",
              }}
            >
              <Schloss />
              {portalText}
            </button>
          )}

          {isVertical && onMenue && (
            <button
              type="button"
              onClick={() => griff && onMenue()}
              aria-expanded={menueOffen}
              aria-label={menueOffen ? "Menü schliessen" : "Menü öffnen"}
              aria-hidden={!griff}
              tabIndex={griff ? undefined : -1}
              className="tellian-kopf-ziel tellian-kopf-menue"
              style={{
                ...klein,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "5px",
                width: "24px",
                height: "24px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    display: "block",
                    width: "22px",
                    height: "1.5px",
                    backgroundColor: griff ? "transparent" : ink,
                    transformOrigin: "center",
                    transform: menueOffen
                      ? i === 0
                        ? "translateY(6.5px) rotate(45deg)"
                        : i === 1
                          ? "scaleX(0)"
                          : "translateY(-6.5px) rotate(-45deg)"
                      : "none",
                    transition: "transform 260ms ease",
                  }}
                />
              ))}
            </button>
          )}
        </div>
      </>
    );
  };

  const schichtStil = (schicht: Schicht): React.CSSProperties => {
    const maske = schicht === "griff" ? undefined : zonenMaske(zonen, schicht as BandSchicht);
    return {
      position: "absolute",
      inset: 0,
      paddingLeft: "var(--tellian-kopf-pad-x)",
      paddingRight: "var(--tellian-kopf-pad-x)",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--tellian-kopf-gap)",
      pointerEvents: schicht === "griff" ? "auto" : "none",
      ...(schicht === "bild" && bildSchatten
        ? { textShadow: "0 1px 10px rgba(40, 31, 51, 0.45)" }
        : null),
      ...(maske ? { WebkitMaskImage: maske, maskImage: maske } : null),
    };
  };

  return (
    <header
      className={"tellian-kopfzeile" + (welt === "solutions" ? " tellian-kopfzeile-solutions" : "")}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 160,
        height: isVertical ? "var(--tellian-kopfzeile-schmal)" : "var(--tellian-kopf-height)",
        backgroundColor: flaeche,
        opacity: sichtbar ? 1 : 0,
        transition: "background-color 220ms ease, opacity 400ms ease-out",
        border: "none",
        pointerEvents: "none",
      }}
    >
      {/* Durch die Schichten liegt jeder Knopf MEHRFACH im Dokument.
          Nur die letzte — die Griffschicht ohne aria-hidden — nimmt
          Zeiger und Tastatur an; die Farbschichten sind reine Malerei. */}
      {(["hell", "dunkel", "bild"] as const).map((schicht) =>
        hatZone(zonen, schicht) ? (
          <div key={schicht} aria-hidden style={schichtStil(schicht)}>
            {inhalt(schicht)}
          </div>
        ) : null,
      )}
      <div style={{ ...schichtStil("griff"), pointerEvents: sichtbar ? "auto" : "none" }}>
        {inhalt("griff")}
      </div>

      <style>{`
        .tellian-kopf-ziel { text-decoration: none; outline: none; position: relative; }
        .tellian-kopf-trenner {
          display: block;
          width: 1px;
          height: var(--tellian-kopf-trenner-h);
          flex-shrink: 0;
        }
        .tellian-kopf-sprache::before,
        .tellian-kopf-welt::before {
          content: "";
          position: absolute;
          inset: -14px -6px;
        }
        .tellian-kopf-menue::before {
          content: "";
          position: absolute;
          inset: -10px;
        }
        .tellian-kopf-welt-aktiv::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 1px;
          background-color: var(--tellian-muted);
        }
        .tellian-kopf-sprache::after,
        .tellian-kopf-portal::after,
        .tellian-kopf-logo::after,
        .tellian-kopf-menue::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: var(--tellian-tippziel);
          transform: translateY(-50%);
        }
        .tellian-kopf-sprache::after { left: -6px; right: -6px; }
        .tellian-kopf-menue::after { left: -10px; right: -10px; }
        .tellian-kopf-wortmarke { display: block; }
        .tellian-kopf-monogramm { display: none; }
        .tellian-kopf-welt { transition: color 180ms ease; }
        .tellian-kopf-ziel:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-kopfzeile * { transition: none !important; }
        }
      `}</style>
    </header>
  );
}
