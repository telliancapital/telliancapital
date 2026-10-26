"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";

/* Direct subpath: the next-sanity barrel pulled live-preview code into the visitor bundle. */
import { stegaClean } from "@sanity/client/stega";

import { cormorant, sans } from "@/tokens";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { SECTION_WIDTH_LAST, type Sprache } from "@/sections";

/* UI-Texte liegen DE/EN vor; FR fällt wie in der Vorlage (TODO-FR) auf DE zurück. */
const kern = (s: Sprache): "DE" | "EN" => (s === "FR" ? "DE" : s);
import type { LegalPath } from "@/data/legalPages";
import { useLanguage } from "@/i18n/LanguageContext";
import { mainSiteUrl } from "@/sanity/env";
import type { LocaleValue } from "@/i18n/types";
import inBugWeiss from "@/assets/logo/InBug-White.png";

/* ═══════════════════════════════════════════════════════════
   STATION 6 — KONTAKT (dunkel)

   BREIT: zwei Spalten, links die Angaben, rechts das Formular,
   darunter das Fussband. SCHMAL: Telefon und E-Mail als Wegzeilen VOR
   dem Formular, dann Adressblock und Fussband.

   INHALTE aus Sanity (contact*-Felder, dieselben wie bisher):
   Titel, Lead, Telefon, Öffnungszeiten, E-Mail, Firma, Adresse,
   Kartenknopf, Formularbeschriftungen, Dank, Datenschutz-Hinweis,
   Fusszeile und die Namen der Rechtsseiten. Der Versand läuft wie
   bisher über /api/contact.
   ═══════════════════════════════════════════════════════════ */

/* Nur Bedienungs-Microcopy ohne CMS-Feld. Die Inhalte der Station (Titel,
   Lead, Telefon, E-Mail, Öffnungszeiten, Firma, Adresse, Fusszeile, Dank)
   kommen ausschliesslich aus Sanity — leere Felder bleiben leer. */
interface StationTexte {
  wegAnrufen: string;
  wegMail: string;
  wegSchreiben: string;
  fussAria: string;
  sendefehler: readonly [string, string];
  eilt: string;
  oder: string;
}

const STATION_TEXTE: Readonly<Record<"DE" | "EN", StationTexte>> = {
  DE: {
    wegAnrufen: "Anrufen",
    wegMail: "E-Mail",
    wegSchreiben: "Schreiben Sie uns",
    fussAria: "Rechtliches und weitere Seiten",
    sendefehler: [
      "Das Absenden hat nicht geklappt. Ihre Eingaben sind erhalten — versuchen Sie es nochmals, oder erreichen Sie uns direkt unter",
      ".",
    ],
    eilt: "Wenn es eilt, erreichen Sie uns direkt unter",
    oder: "oder",
  },
  EN: {
    wegAnrufen: "Call us",
    wegMail: "E-mail",
    wegSchreiben: "Write to us",
    fussAria: "Legal and further pages",
    sendefehler: ["Sending did not work. Your entries have been kept — please try again, or reach us directly on", "."],
    eilt: "If it is urgent, you can reach us directly on",
    oder: "or",
  },
};

interface FussVerweis {
  text: string;
  href?: string;
  legal?: LegalPath;
  extern?: boolean;
  marke?: string;
  vorlesen?: string;
}

/* ── Prüfung — grosszügig, nicht streng ── */
type Feldname = "name" | "email" | "telefon" | "nachricht";
type Felder = Record<Feldname, string>;
type Fehlerliste = Partial<Record<Feldname, string>>;

const LEER: Felder = { name: "", email: "", telefon: "", nachricht: "" };

interface FormTexte {
  feldName: string;
  feldMail: string;
  feldTelefon: string;
  feldNachricht: string;
  optionalWort: string;
  zustimmung: React.ReactNode;
  senden: string;
  sendet: string;
  fehlerName: string;
  fehlerMailLeer: string;
  fehlerMailAt: string;
  fehlerMailDomain: string;
  fehlerTelefon: string;
  fehlerNachricht: string;
  dankeTitel: string;
  dankeText: string;
}

const FEHLER: Readonly<Record<"DE" | "EN", Pick<FormTexte, "fehlerName" | "fehlerMailLeer" | "fehlerMailAt" | "fehlerMailDomain" | "fehlerTelefon" | "fehlerNachricht" | "optionalWort" | "sendet">>> = {
  DE: {
    optionalWort: "— optional",
    sendet: "Wird gesendet …",
    fehlerName: "Bitte tragen Sie Ihren Namen ein.",
    fehlerMailLeer: "Bitte tragen Sie Ihre E-Mail-Adresse ein, damit wir antworten können.",
    fehlerMailAt: "Es fehlt noch das @, zum Beispiel name@beispiel.ch",
    fehlerMailDomain: "Nach dem @ fehlt noch die Domain, zum Beispiel beispiel.ch",
    fehlerTelefon: "Die Nummer scheint unvollständig. Sie können das Feld auch leer lassen.",
    fehlerNachricht: "Bitte schreiben Sie uns kurz, worum es geht.",
  },
  EN: {
    optionalWort: "— optional",
    sendet: "Sending …",
    fehlerName: "Please enter your name.",
    fehlerMailLeer: "Please enter your e-mail address so that we can reply.",
    fehlerMailAt: "The @ is still missing, for example name@example.ch",
    fehlerMailDomain: "The domain after the @ is still missing, for example example.ch",
    fehlerTelefon: "The number looks incomplete. You may also leave this field empty.",
    fehlerNachricht: "Please tell us briefly what this is about.",
  },
};

const MAIL_VOLLSTAENDIG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_TRENNER = /[\s.\-/()]/g;
const TEL_KERN = /^(?:\+|00)?\d{7,15}$/;

function pruefeFeld(k: Feldname, f: Felder, t: FormTexte): string | undefined {
  const v = f[k].trim();
  if (k === "name") return v ? undefined : t.fehlerName;
  if (k === "email") {
    if (!v) return t.fehlerMailLeer;
    if (!v.includes("@")) return t.fehlerMailAt;
    if (!MAIL_VOLLSTAENDIG.test(v)) return t.fehlerMailDomain;
    return undefined;
  }
  if (k === "telefon") {
    if (!v) return undefined;
    if (!TEL_KERN.test(v.replace(TEL_TRENNER, ""))) return t.fehlerTelefon;
    return undefined;
  }
  return v ? undefined : t.fehlerNachricht;
}

const REIHENFOLGE: readonly Feldname[] = ["name", "email", "telefon", "nachricht"];

function pruefeAlles(f: Felder, t: FormTexte): Fehlerliste {
  const raus: Fehlerliste = {};
  for (const k of REIHENFOLGE) {
    const m = pruefeFeld(k, f, t);
    if (m) raus[k] = m;
  }
  return raus;
}

function FehlerZeichen() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false" style={{ flexShrink: 0, marginTop: "2px" }}>
      <circle cx="7" cy="7" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7 3.7v4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="10.4" r="0.85" fill="currentColor" />
    </svg>
  );
}

interface FeldProps {
  name: Feldname;
  beschriftung: string;
  optional?: boolean;
  optionalWort?: string;
  wert: string;
  onWert: (v: string) => void;
  onVerlassen: () => void;
  fehler?: string;
  mehrzeilig?: boolean;
  zeilen?: number;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  autoCapitalize?: string;
}

function KontaktFeld({
  name,
  beschriftung,
  optional = false,
  optionalWort = "— optional",
  wert,
  onWert,
  onVerlassen,
  fehler,
  mehrzeilig = false,
  zeilen = 5,
  type = "text",
  autoComplete,
  inputMode,
  autoCapitalize,
}: FeldProps) {
  const id = useId();
  const fehlerId = `${id}-meldung`;
  const kontur = fehler ? "var(--tellian-field-error)" : "var(--tellian-field-line)";

  const feldStil: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "var(--tellian-field-size)",
    lineHeight: 1.5,
    color: "var(--tellian-field-ink)",
    border: "none",
    borderBottom: `${fehler ? "2px" : "1px"} solid ${kontur}`,
    borderRadius: 0,
    backgroundColor: "transparent",
    padding: fehler ? "12px 2px 11px" : "12px 2px",
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
    resize: "none",
  };

  const geteilt = {
    id,
    name,
    value: wert,
    onBlur: onVerlassen,
    autoComplete,
    inputMode,
    autoCapitalize,
    "aria-invalid": fehler ? (true as const) : undefined,
    "aria-describedby": fehler ? fehlerId : undefined,
    className: "tellian-k6-feld",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label
        htmlFor={id}
        style={{ fontFamily: sans, fontSize: "var(--tellian-field-label-size)", lineHeight: 1.3, color: "var(--tellian-field-label)" }}
      >
        {beschriftung}
        {optional && <span style={{ color: "var(--tellian-k6-dim)" }}> {optionalWort}</span>}
      </label>

      {mehrzeilig ? (
        <textarea {...geteilt} rows={zeilen} onChange={(e) => onWert(e.target.value)} style={{ ...feldStil, minHeight: `${zeilen * 26}px` }} />
      ) : (
        <input
          {...geteilt}
          type={type}
          spellCheck={type === "email" ? false : undefined}
          onChange={(e) => onWert(e.target.value)}
          style={{ ...feldStil, height: "50px" }}
        />
      )}

      {fehler && (
        <span
          id={fehlerId}
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "7px",
            marginTop: "1px",
            fontFamily: sans,
            fontSize: "13px",
            lineHeight: 1.45,
            color: "var(--tellian-field-error)",
          }}
        >
          <FehlerZeichen />
          <span>{fehler}</span>
        </span>
      )}
    </div>
  );
}

/* ── Formular ── */
type Zustand = "bereit" | "sendet" | "fertig" | "fehler";
const MENSCHENZEIT_MS = 3000;

function Formular({
  gestapelt = false,
  sprache,
  t,
  st,
  telefon,
  telefonHref,
  mail,
}: {
  gestapelt?: boolean;
  sprache: Sprache;
  t: FormTexte;
  st: StationTexte & { oeffnung: string };
  telefon: string;
  telefonHref: string;
  mail: string;
}) {
  const [felder, setFelder] = useState<Felder>(LEER);
  const [fehler, setFehler] = useState<Fehlerliste>({});
  const [zustand, setZustand] = useState<Zustand>("bereit");
  const [honigtopf, setHonigtopf] = useState("");
  const honigId = useId();
  const formRef = useRef<HTMLFormElement | null>(null);
  const aufgebaut = useRef(0);
  useEffect(() => {
    aufgebaut.current = Date.now();
  }, []);
  const [springen, setSpringen] = useState(false);

  useEffect(() => {
    if (!springen) return;
    setSpringen(false);
    const erstes = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    if (!erstes) return;
    erstes.focus({ preventScroll: true });
    const r = erstes.getBoundingClientRect();
    if (r.top < 8 || r.bottom > window.innerHeight - 8) {
      erstes.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [springen]);

  const setzen = (k: Feldname) => (v: string) => {
    setFelder((alt) => {
      const neu = { ...alt, [k]: v };
      setFehler((f) => (f[k] ? { ...f, [k]: pruefeFeld(k, neu, t) } : f));
      return neu;
    });
  };

  const verlassen = (k: Feldname) => () => {
    setFehler((alt) => ({ ...alt, [k]: pruefeFeld(k, felder, t) }));
  };

  const absenden = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const verdacht = honigtopf.trim().length > 0 || Date.now() - aufgebaut.current < MENSCHENZEIT_MS;

      const gefunden = pruefeAlles(felder, t);
      setFehler(gefunden);
      if (Object.keys(gefunden).length) {
        setSpringen(true);
        return;
      }
      if (verdacht) {
        setZustand("fertig");
        return;
      }

      setZustand("sendet");
      try {
        /* Versand wie bisher: /api/contact (name, email, subject, message). */
        const name = felder.name.trim();
        const nachricht = felder.telefon.trim()
          ? `${felder.nachricht.trim()}\n\n—\nTelefon: ${felder.telefon.trim()}`
          : felder.nachricht.trim();
        /* basePath: hand-written fetch paths need the /solutions prefix. */
        const res = await fetch("/solutions/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: felder.email.trim(),
            subject: `Neue Kontaktanfrage von ${name}`,
            message: nachricht,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
        if (!res.ok || !data.ok) throw new Error("send failed");
        setZustand("fertig");
      } catch {
        setZustand("fehler");
      }
    },
    [felder, honigtopf, t],
  );

  if (zustand === "fertig") {
    return (
      <div role="status" aria-live="polite" style={{ padding: "4px 0" }}>
        <span
          style={{
            display: "block",
            fontFamily: cormorant,
            fontSize: "clamp(28px, 2.6vw, 38px)",
            fontWeight: 300,
            lineHeight: 1.15,
            color: "var(--tellian-k6-ink)",
          }}
        >
          {t.dankeTitel}
        </span>
        <span
          style={{
            display: "block",
            marginTop: "14px",
            maxWidth: "34em",
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-k6-dim)",
          }}
        >
          {t.dankeText}
        </span>
        <span
          style={{
            display: "block",
            marginTop: "20px",
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-k6-dim)",
          }}
        >
          {st.eilt}{" "}
          <a href={telefonHref} className="tellian-k6-tel" style={{ color: "var(--tellian-k6-ink)", textDecoration: "underline", textUnderlineOffset: "4px" }}>
            {telefon}
          </a>
          {st.sendefehler[1]} {st.oeffnung}.
        </span>
      </div>
    );
  }

  const paar: React.CSSProperties = gestapelt
    ? { display: "flex", flexDirection: "column", gap: "18px" }
    : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" };
  const sendet = zustand === "sendet";

  return (
    <form ref={formRef} onSubmit={absenden} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={honigId}>Bitte dieses Feld leer lassen</label>
        <input id={honigId} name="webseite" type="text" tabIndex={-1} autoComplete="off" value={honigtopf} onChange={(e) => setHonigtopf(e.target.value)} />
      </div>

      <div style={paar}>
        <KontaktFeld name="name" beschriftung={t.feldName} wert={felder.name} onWert={setzen("name")} onVerlassen={verlassen("name")} fehler={fehler.name} autoComplete="name" autoCapitalize="words" />
        <KontaktFeld name="email" beschriftung={t.feldMail} type="email" wert={felder.email} onWert={setzen("email")} onVerlassen={verlassen("email")} fehler={fehler.email} autoComplete="email" inputMode="email" autoCapitalize="none" />
      </div>

      <KontaktFeld name="telefon" beschriftung={t.feldTelefon} optional optionalWort={t.optionalWort} type="tel" wert={felder.telefon} onWert={setzen("telefon")} onVerlassen={verlassen("telefon")} fehler={fehler.telefon} autoComplete="tel" inputMode="tel" />

      <KontaktFeld name="nachricht" beschriftung={t.feldNachricht} mehrzeilig zeilen={5} wert={felder.nachricht} onWert={setzen("nachricht")} onVerlassen={verlassen("nachricht")} fehler={fehler.nachricht} autoComplete="off" autoCapitalize="sentences" />

      <p style={{ margin: 0, fontFamily: sans, fontSize: "12px", lineHeight: 1.5, color: "var(--tellian-k6-dim)" }}>{t.zustimmung}</p>

      {zustand === "fehler" && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "14px 16px",
            border: "2px solid var(--tellian-field-error)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontFamily: sans,
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--tellian-k6-ink)",
          }}
        >
          <span style={{ color: "var(--tellian-field-error)", display: "flex" }}>
            <FehlerZeichen />
          </span>
          <span>
            {st.sendefehler[0]}{" "}
            <a href={telefonHref} className="tellian-k6-tel" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              {telefon}
            </a>{" "}
            {st.oder}{" "}
            <a href={`mailto:${mail}`} className="tellian-k6-tel" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              {mail}
            </a>
            .
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={sendet}
        aria-busy={sendet}
        className="tellian-k6-primaer"
        style={{
          fontFamily: sans,
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "var(--tellian-ls-cta-klein)",
          color: "var(--tellian-ink)",
          border: "none",
          borderRadius: 0,
          padding: "17px 26px",
          minHeight: "var(--tellian-tippziel)",
          cursor: sendet ? "progress" : "pointer",
          width: gestapelt ? "100%" : "fit-content",
          alignSelf: gestapelt ? "stretch" : "flex-start",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          transition: "background-color 200ms ease",
        }}
      >
        {sendet ? (
          <>
            <span aria-hidden className="tellian-k6-kreisel" />
            {t.sendet}
          </>
        ) : (
          <>
            {t.senden}
            <span aria-hidden>→</span>
          </>
        )}
      </button>
      <span hidden>{sprache}</span>
    </form>
  );
}

/* ── Station ── */
interface Props {
  isVertical?: boolean;
  domId?: string;
  sprache?: Sprache;
  homepage?: any;
  marke?: { nr: string; name: string };
  onOpenLegal?: (path: LegalPath) => void;
}

export function StationKontakt({ isVertical = false, domId, sprache = "DE", homepage, marke, onOpenLegal }: Props) {
  const { t } = useLanguage();
  const cms: any = homepage ?? {};
  const stText = STATION_TEXTE[kern(sprache)];
  const [karteOffen, setKarteOffen] = useState(false);
  const karteBtn = useRef<HTMLButtonElement | null>(null);

  /* ── Sanity-Inhalte (kein Wortlaut im Code, leere Felder bleiben leer) ──
     stegaClean: im Vorschau-/Entwurfsmodus hängt Sanity an jeden String
     hunderte unsichtbare Bearbeitungsmarker. Werden solche Strings
     zerlegt (Titel in zwei Wörter, Lead in zwei Sätze) oder als href
     benutzt, landen die Marker im <em> bzw. im tel:/mailto: — der Titel
     wuchs dadurch auf zwei Zeilen und riss die Lücke zur Unterzeile auf. */
  const headingCms: string = stegaClean(t(cms.contactHeading, ""));
  const titelZeilen: readonly [string, string] = headingCms
    ? (() => {
        const w = headingCms.replace(/\.$/, "").trim().split(/\s+/);
        return w.length > 1 ? [w.slice(0, -1).join(" "), w[w.length - 1]] : [headingCms, ""];
      })()
    : ["", ""];
  const leadCms = stegaClean(t(cms.contactDescription, ""));
  const leadZeilen: readonly [string, string] = leadCms
    ? (() => {
        const i = leadCms.indexOf(". ");
        return i > 0 ? [leadCms.slice(0, i + 1), leadCms.slice(i + 2)] : [leadCms, ""];
      })()
    : ["", ""];
  const telefon: string = stegaClean(cms.contactPhone || "");
  const telefonHref = `tel:${telefon.replace(/\s+/g, "")}`;
  const mail: string = stegaClean(cms.contactEmail || "");
  const oeffnung = t(cms.contactPhoneHours, "");
  const firmaName: string = cms.contactCompanyName || "";
  const adresse: string = cms.contactAddress || "";
  const karteLabel = t(cms.contactMapLinkLabel, "");
  /* Fussband: Marke und Zusatz aus dem CMS (footerBrand, footerLegalLine). */
  const fussMarke: string = stegaClean(cms.footerBrand || "");
  const fussZeile = [fussMarke, t(cms.footerLegalLine, "")].filter(Boolean).join(" · ");

  const legalLabels: Record<"/datenschutz" | "/kundeninformation", string> = {
    "/datenschutz": t(cms.legalDatenschutzLinkLabel, ""),
    "/kundeninformation": t(cms.legalKundeninformationLinkLabel, ""),
  };

  const privacyPrefix = t(cms.contactPrivacyPrefix, "");
  const privacyLink = t(cms.contactPrivacyLinkLabel, "");
  const privacySuffix = t(cms.contactPrivacySuffix, "");
  const zustimmung: React.ReactNode = privacyLink ? (
    <>
      {privacyPrefix}
      <a
        href="/datenschutz"
        onClick={(e) => {
          if (!onOpenLegal) return;
          e.preventDefault();
          onOpenLegal("/datenschutz");
        }}
        style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}
      >
        {privacyLink}
      </a>
      {privacySuffix}
    </>
  ) : (
    t(cms.contactPrivacyNotice, "")
  );

  const formTexte: FormTexte = {
    ...FEHLER[kern(sprache)],
    feldName: sprache === "EN" ? "Name" : "Name",
    feldMail: t(cms.contactFormEmail, ""),
    feldTelefon: t(cms.contactFormPhone, ""),
    feldNachricht: t(cms.contactFormMessage, ""),
    senden: t(cms.contactFormSubmit, ""),
    sendet: t(cms.contactFormSendingLabel, FEHLER[kern(sprache)].sendet),
    zustimmung,
    dankeTitel: t(cms.contactFormThanksTitle, ""),
    dankeText: t(cms.contactFormThanksBody, ""),
  };

  /* Fussverweise: zuerst die CMS-Verweise (footerLinks: Label + Ziel),
     dann LinkedIn (Adresse aus linkedinUrl) und die Rechtsseiten (Labels
     aus dem CMS). Einträge ohne Label bzw. Adresse entfallen. */
  const cmsFussLinks: FussVerweis[] = ((cms.footerLinks ?? []) as { label?: LocaleValue; href?: string }[])
    .map((v) => ({ text: stegaClean(t(v?.label, "")), href: stegaClean(v?.href || "") }))
    .filter((v) => v.text && v.href)
    .map((v) => ({ ...v, extern: /^https?:\/\//.test(v.href) && !v.href.startsWith(mainSiteUrl) }));
  const linkedinHref: string = stegaClean(cms.linkedinUrl || "");
  const FUSS_RECHTS: readonly FussVerweis[] = [
    ...cmsFussLinks,
    ...(linkedinHref
      ? [{ text: "LinkedIn", href: linkedinHref, extern: true, marke: inBugWeiss.src, vorlesen: "Tellian Capital auf LinkedIn" }]
      : []),
    ...(legalLabels["/datenschutz"] ? [{ text: legalLabels["/datenschutz"], legal: "/datenschutz" as const }] : []),
    ...(legalLabels["/kundeninformation"]
      ? [{ text: legalLabels["/kundeninformation"], legal: "/kundeninformation" as const }]
      : []),
  ];

  const titel = (
    <h2
      style={{
        margin: 0,
        fontFamily: cormorant,
        fontSize: "var(--tellian-k6-title-size)",
        fontWeight: "var(--tellian-k6-title-weight)" as unknown as number,
        lineHeight: "var(--tellian-k6-title-leading)" as unknown as number,
        color: "var(--tellian-k6-ink)",
      }}
    >
      {titelZeilen[0]}{" "}
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{titelZeilen[1]}</em>
    </h2>
  );

  const lead = (zweizeilig: boolean) => (
    <p
      style={{
        margin: 0,
        marginTop: "clamp(14px, 2vh, 22px)",
        fontFamily: sans,
        fontSize: "var(--tellian-k6-lead-size)",
        lineHeight: "var(--tellian-k6-lead-leading)" as unknown as number,
        color: "var(--tellian-muted)",
      }}
    >
      {leadZeilen[0]}
      {leadZeilen[1] && (
        <>
          {zweizeilig ? <br /> : " "}
          {leadZeilen[1]}
        </>
      )}
    </p>
  );

  const telefonEl = (
    <a
      href={telefonHref}
      className="tellian-k6-tel"
      style={{ fontFamily: cormorant, fontSize: "var(--tellian-k6-phone-size)", fontWeight: 300, lineHeight: 1.1, color: "var(--tellian-k6-ink)", textDecoration: "none" }}
    >
      {telefon}
    </a>
  );

  const oeffnungEl = (
    <p style={{ margin: 0, marginTop: "8px", fontFamily: sans, fontSize: "var(--tellian-k6-meta-size)", color: "var(--tellian-k6-dim)" }}>{oeffnung}</p>
  );

  const mailEl = (
    <a
      href={`mailto:${mail}`}
      className="tellian-k6-tel"
      style={{
        marginTop: "clamp(14px, 2vh, 24px)",
        fontFamily: sans,
        fontSize: "var(--tellian-k6-mail-size)",
        color: "var(--tellian-k6-ink)",
        textDecoration: "underline",
        textDecorationThickness: "1px",
        textUnderlineOffset: "5px",
        textDecorationColor: "var(--tellian-k6-line)",
      }}
    >
      {mail}
    </a>
  );

  const weg = (href: string, ueberschrift: string, wert: string, zusatz?: string) => (
    <a href={href} className="tellian-k6-weg" style={{ display: "block", padding: "clamp(18px, 2.6vh, 26px) 0", borderTop: "1px solid var(--tellian-k6-line)", textDecoration: "none" }}>
      <span className="tellian-marker" style={{ display: "block", fontFamily: sans, color: "var(--tellian-k6-dim)" }}>
        {ueberschrift}
      </span>
      <span
        className="tellian-k6-weg-wert"
        style={{ display: "block", marginTop: "10px", fontFamily: cormorant, fontSize: "clamp(24px, 6.4vw, 32px)", fontWeight: 300, lineHeight: 1.1, color: "var(--tellian-k6-ink)", wordBreak: "break-word" }}
      >
        {wert}
      </span>
      {zusatz && (
        <span style={{ display: "block", marginTop: "8px", fontFamily: sans, fontSize: "13px", lineHeight: 1.45, color: "var(--tellian-k6-dim)" }}>{zusatz}</span>
      )}
    </a>
  );

  const firma = (
    <div>
      {firmaName && (
        <span style={{ display: "block", fontFamily: sans, fontSize: "var(--tellian-k6-firm-size)", fontWeight: 500, color: "var(--tellian-k6-ink)" }}>{firmaName}</span>
      )}
      {adresse && (
        <span style={{ display: "block", marginTop: "3px", fontFamily: sans, fontSize: "var(--tellian-k6-firm-size)", lineHeight: 1.5, color: "var(--tellian-k6-dim)" }}>{adresse}</span>
      )}
      {adresse && karteLabel && (
        <button
          ref={karteBtn}
          type="button"
          onClick={() => window.open(karteHref, "_blank", "noopener")}
          className="tellian-k6-still"
          style={{ marginTop: "10px", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: sans, fontSize: "var(--tellian-k6-meta-size)", color: "var(--tellian-k6-ink)" }}
        >
          {karteLabel} <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );

  const fussStil: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "var(--tellian-k6-foot-size)",
    letterSpacing: "var(--tellian-k6-foot-tracking)",
    textTransform: "uppercase",
    color: "var(--tellian-k6-foot-color)",
  };

  const fussband = (
    <div
      style={{
        borderTop: "1px solid var(--tellian-k6-line)",
        paddingTop: "clamp(14px, 1.8vh, 22px)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px 24px",
      }}
    >
      <span style={{ fontFamily: sans, fontSize: "var(--tellian-k6-foot-size)", color: "var(--tellian-k6-foot-color)" }}>{fussZeile}</span>

      <nav
        aria-label={stText.fussAria}
        className={isVertical ? "tellian-k6-fussraster" : undefined}
        style={{
          display: isVertical ? "grid" : "flex",
          ...(isVertical
            ? { gridTemplateColumns: "repeat(auto-fit, minmax(164px, 1fr))", columnGap: "clamp(12px, 4vw, 24px)", rowGap: "6px", width: "100%" }
            : { columnGap: "clamp(16px, 4vw, 28px)", rowGap: "0px" }),
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {FUSS_RECHTS.map((v) => (
          <span key={v.text} style={{ display: "flex", alignItems: "center", ...(isVertical ? { minHeight: "48px" } : null) }}>
            {v.legal ? (
              <button
                type="button"
                onClick={() => onOpenLegal?.(v.legal!)}
                className="tellian-k6-still"
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", ...fussStil }}
              >
                {v.text}
              </button>
            ) : (
              <a
                href={v.href}
                {...(v.extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={v.vorlesen}
                className="tellian-k6-still"
                style={{ ...fussStil, textDecoration: "none", gap: v.marke ? "var(--tellian-k6-marke-gap)" : undefined }}
              >
                {v.marke && <img src={v.marke} width={inBugWeiss.width} height={inBugWeiss.height} alt="" aria-hidden style={{ height: "var(--tellian-k6-marke-size)", width: "auto", display: "block", flexShrink: 0 }} />}
                {v.text}
              </a>
            )}
          </span>
        ))}
      </nav>
    </div>
  );

  const stil = (
    <style>{`
      .tellian-k6-tel:hover,
      .tellian-k6-still:hover { text-decoration: underline; text-underline-offset: 4px; }
      .tellian-k6-still { position: relative; }
      .tellian-k6-still::before { content: ""; position: absolute; inset: -9px -7px; }
      .tellian-k6-still,
      .tellian-k6-tel {
        display: inline-flex;
        align-items: center;
        min-height: var(--tellian-tippziel);
        padding-top: 12px;
        padding-bottom: 12px;
        margin-top: -12px;
        margin-bottom: -12px;
      }
      .tellian-k6-fussraster .tellian-k6-still {
        width: 100%; min-height: 48px;
        padding-top: 0; padding-bottom: 0; margin-top: 0; margin-bottom: 0;
      }
      .tellian-k6-fussraster .tellian-k6-still::before { inset: 0; }
      .tellian-k6-primaer { background-color: var(--tellian-muted); }
      .tellian-k6-primaer:hover:not(:disabled),
      .tellian-k6-primaer:focus-visible:not(:disabled) { background-color: var(--tellian-button-hover); }
      .tellian-k6-primaer:disabled { opacity: 0.8; }
      .tellian-k6-weg:hover .tellian-k6-weg-wert {
        text-decoration: underline; text-decoration-thickness: 1px;
        text-underline-offset: 5px; text-decoration-color: var(--tellian-k6-line);
      }
      .tellian-k6-feld { outline: none; }
      .tellian-k6-feld::placeholder { color: transparent; }
      .tellian-k6-feld:focus { border-color: var(--tellian-field-focus); }
      .tellian-k6-tel:focus-visible,
      .tellian-k6-still:focus-visible,
      .tellian-k6-primaer:focus-visible,
      .tellian-k6-weg:focus-visible,
      .tellian-k6-feld:focus-visible {
        outline: 2px solid var(--tellian-k6-focus);
        outline-offset: 3px;
      }
      .tellian-k6-kreisel {
        width: 14px; height: 14px; border-radius: 50%;
        border: 2px solid currentColor; border-top-color: transparent;
        display: inline-block; animation: tellian-k6-dreh 800ms linear infinite;
      }
      @keyframes tellian-k6-dreh { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .tellian-k6-kreisel { animation-duration: 2400ms; } }
    `}</style>
  );

  /* Keine Mapbox-Abhängigkeit in dieser App: der Kartenknopf öffnet
     Google Maps in einem neuen Tab (wie die bisherige Solutions-Seite). */
  const karteHref = `https://maps.google.com/?q=${encodeURIComponent(adresse)}`;
  const karte = null;

  const formular = (gestapelt: boolean) => (
    <Formular gestapelt={gestapelt} sprache={sprache} t={formTexte} st={{ ...stText, oeffnung }} telefon={telefon} telefonHref={telefonHref} mail={mail} />
  );

  /* ── SCHMAL ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-k6-bg)",
          backgroundImage: "var(--tellian-flaeche-dunkel-schmal)",
          scrollMarginTop: "var(--tellian-kopf-height)",
        }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {marke && (
            <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
              <Kapitelmarke nr={marke.nr} name={marke.name} hell />
            </div>
          )}
          <Aufgang>{titel}</Aufgang>
          {lead(false)}

          <div style={{ marginTop: "clamp(26px, 3.4vh, 40px)" }}>
            {telefon && weg(telefonHref, stText.wegAnrufen, telefon, oeffnung)}
            {mail && weg(`mailto:${mail}`, stText.wegMail, mail)}
            <div style={{ borderTop: "1px solid var(--tellian-k6-line)", paddingTop: "clamp(18px, 2.6vh, 26px)" }}>
              <span className="tellian-marker" style={{ display: "block", fontFamily: sans, color: "var(--tellian-k6-dim)" }}>
                {t(cms.contactFormHeading, stText.wegSchreiben)}
              </span>
              <div style={{ marginTop: "clamp(20px, 2.6vh, 30px)" }}>{formular(true)}</div>
            </div>
          </div>

          <div style={{ marginTop: "clamp(30px, 4vh, 46px)" }}>{firma}</div>
          <div style={{ marginTop: "clamp(28px, 4vh, 44px)" }}>{fussband}</div>
        </div>
        {karte}
        {stil}
      </section>
    );
  }

  /* ── BREIT ── */
  return (
    <div
      id={domId}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH_LAST, backgroundColor: "var(--tellian-k6-bg)", backgroundImage: "var(--tellian-flaeche-dunkel)" }}
      data-tellian-station="3"
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "clamp(16px, 2vh, 28px)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: "clamp(40px, 5vw, 110px)" }}>
            <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" }}>
              {titel}
              {lead(true)}
              {telefon && <div style={{ marginTop: "clamp(22px, 3vh, 40px)" }}>{telefonEl}</div>}
              {oeffnung && oeffnungEl}
              {mail && <div style={{ display: "flex" }}>{mailEl}</div>}
              <div style={{ marginTop: "auto", paddingTop: "clamp(24px, 3vh, 44px)" }}>{firma}</div>
            </div>

            <div style={{ flex: "0 0 clamp(380px, 38%, 560px)" }}>{formular(false)}</div>
          </div>
        </div>

        <div style={{ marginTop: "clamp(16px, 2vh, 28px)" }}>{fussband}</div>
      </div>

      {karte}
      {stil}
    </div>
  );
}
