"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { C } from "@/tokens";
import { Kopfzeile } from "@/components/Kopfzeile";
import { DotNavigation } from "@/components/DotNavigation";
import { MobilMenue } from "@/components/MobilMenue";
import { LoginOverlay } from "@/components/LoginOverlay";
import { PreloadScreen } from "@/components/PreloadScreen";
import { LegalPage, useLegalRoute } from "@/components/LegalPage";
import { SectionEnteredProvider } from "@/components/SectionEntry";
import { StationTeam } from "@/components/StationTeam";
import { StationKontakt } from "@/components/StationKontakt";
import { useBreakpoint } from "@/components/useBreakpoint";
import { useHorizontalScroll } from "@/components/useHorizontalScroll";
import { useVerticalSectionIndex } from "@/components/useVerticalSectionIndex";
import { useBandZonen } from "@/components/useBandTon";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Locale } from "@/i18n/types";
import { mainSiteUrl } from "@/sanity/env";
import { SECTIONS, activeIndexFromProgress, leisteSektionen, type Sprache } from "@/sections";
import { SolutionsEinstieg } from "@/solutions/SolutionsEinstieg";
import { SolutionsWasWirTun } from "@/solutions/SolutionsWasWirTun";

/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL SOLUTIONS — zweite Stationen-Erfahrung

   Redesign (Vorlage: DesignTellian, src/app/solutions/SolutionsApp):
   vier Stationen im Hell/Dunkel-Rhythmus der Hauptseite — Einstieg,
   Was wir tun, Team, Kontakt — gefahren von derselben Scroll-Engine,
   derselben Kopfzeile (Zusatz «SOLUTIONS», Logo führt zur ersten
   Station, Welten-Wechsel zur Hauptseite), derselben Stationsleiste
   und derselben Kontakt-Station.

   INHALTE: alles aus Sanity (solutionsHomepage, DE/EN/FR) — dieselben
   Felder wie bisher. Die Stationen bekommen den CMS-Stand in der
   Feldform, die die geteilten Bausteine der Hauptseite lesen (siehe
   kontaktDaten unten).
   ═══════════════════════════════════════════════════════════ */

/* ── Bänder mit eigener Tonmessung (Frame-State bleibt bei den Bändern). ── */
type KopfzeileProps = Omit<React.ComponentProps<typeof Kopfzeile>, "zonen">;
function KopfzeileBand({ aktiv, activeIndex, ...rest }: KopfzeileProps & { aktiv: boolean; activeIndex: number }) {
  const zonen = useBandZonen(aktiv, activeIndex, "oben", SECTIONS);
  return <Kopfzeile zonen={zonen} {...rest} />;
}
type DotNavigationProps = Omit<React.ComponentProps<typeof DotNavigation>, "zonen">;
function DotNavigationBand({ aktiv, ...rest }: DotNavigationProps & { aktiv: boolean }) {
  const zonen = useBandZonen(aktiv, rest.activeIndex, "unten", SECTIONS);
  return <DotNavigation zonen={zonen} {...rest} />;
}

const SolutionsEinstiegM = memo(SolutionsEinstieg);
const SolutionsWasWirTunM = memo(SolutionsWasWirTun);
const StationTeamM = memo(StationTeam);
const StationKontaktM = memo(StationKontakt);

const SPRACHEN: readonly Sprache[] = ["DE", "EN", "FR"];
const LANG_ZU_SPRACHE: Record<Locale, Sprache> = { de: "DE", en: "EN", fr: "FR" };
const SPRACHE_ZU_LANG: Record<Sprache, Locale> = { DE: "de", EN: "en", FR: "fr" };

/**
 * Kontakt-Station: die geteilte StationKontakt liest die Feldnamen der
 * Hauptseite (homepage.contactHeading …). Hier die Zuordnung aus den
 * Feldern von solutionsHomepage — ein Feld, eine Quelle.
 */
function kontaktDaten(cms: any, t: (v: any, f?: string) => string) {
  if (!cms) return undefined;
  const heading = [t(cms.contactHeadingLine1, ""), t(cms.contactHeadingLine2, "")]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(" ");
  return {
    contactHeading: heading || undefined,
    contactDescription: cms.contactIntro,
    contactPhone: cms.contactPhone,
    contactEmail: cms.contactEmailAddr,
    contactPhoneHours: cms.contactHours,
    contactCompanyName: cms.contactCompanyName,
    contactAddress: t(cms.contactAddressLine, "") || undefined,
    contactMapLinkLabel: cms.contactMapLink,
    contactFormEmail: cms.contactFieldEmail,
    contactFormPhone: cms.contactFieldPhone,
    contactFormMessage: cms.contactFieldMessage,
    contactFormSubmit: cms.contactSubmitLabel,
    contactPrivacyNotice: cms.contactPrivacyNotice,
    contactThankYou: cms.contactThankYou,
    contactThankYouSub: cms.contactThankYouSub,
    /* Fussband (5. Fussband im Studio). */
    footerBrand: cms.footerBrand,
    footerLegalLine: cms.footerLegalLine,
    footerLinks: cms.footerLinks,
    linkedinUrl: cms.linkedinUrl,
    legalDatenschutzLinkLabel: cms.legalDatenschutzLinkLabel,
    legalKundeninformationLinkLabel: cms.legalKundeninformationLinkLabel,
  };
}

export default function Home({ homepage }: { homepage: any }) {
  const [introComplete, setIntroComplete] = useState(false);
  const { isVertical } = useBreakpoint();
  const { t, lang, setLang } = useLanguage();
  const sprache: Sprache = LANG_ZU_SPRACHE[lang] ?? "DE";
  const onSprache = useCallback((s: Sprache) => setLang(SPRACHE_ZU_LANG[s] ?? "de"), [setLang]);

  /* Leiste und Menü: CMS-Namen (navItems), Rückfall je Sprache. */
  const cmsNavItems = homepage?.navItems;
  const leisteNamen = useMemo(() => leisteSektionen(sprache, cmsNavItems, t), [sprache, cmsNavItems, t]);
  const kundenportalLabel = sprache === "FR" ? "Portail Client" : sprache === "EN" ? "Client portal" : "Kundenportal";

  /* ── Gemessene Stationskanten (Desktop) — je Frame aus dem Ref. ── */
  const [kanten, setKanten] = useState<number[] | null>(null);
  const kantenRef = useRef<number[] | null>(null);
  useEffect(() => {
    kantenRef.current = kanten;
  }, [kanten]);
  const indexAt = useCallback((x: number, max: number) => {
    const k = kantenRef.current;
    if (!k) return activeIndexFromProgress(max > 0 ? x / max : 0);
    let idx = 0;
    for (let i = 1; i < k.length; i++) if (x >= (k[i - 1] + k[i]) / 2) idx = i;
    return idx;
  }, []);

  const { activeIndex: horizontalIndex, containerRef, scrollTo } = useHorizontalScroll({
    disabled: isVertical || !introComplete,
    indexAt,
  });

  const [loginOpen, setLoginOpen] = useState(false);
  const [menueOffen, setMenueOffen] = useState(false);
  const [teamDetailOffen, setTeamDetailOffen] = useState(false);
  const legal = useLegalRoute();

  /* Die Seite wird erst nach der Hydration unter dem Ladebildschirm
     aufgebaut — die Stationen lesen window/document beim Rendern. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVertical, mountedTrack]);

  const verticalIndex = useVerticalSectionIndex(isVertical, SECTIONS);
  const activeIndex = isVertical ? verticalIndex : horizontalIndex;

  const navigateToSection = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(SECTIONS.length - 1, index));
      const section = SECTIONS[i];
      setMenueOffen(false);
      if (isVertical) {
        document.getElementById(section.domId)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const track = containerRef.current;
      const el = track?.querySelector<HTMLElement>(`[data-tellian-station="${i}"]`);
      const max = track ? track.scrollWidth - track.clientWidth : 0;
      if (el && max > 0) scrollTo(Math.min(1, el.offsetLeft / max));
      else scrollTo(section.progress);
    },
    [isVertical, scrollTo, containerRef],
  );
  const navigateToContact = useCallback(() => navigateToSection(SECTIONS.length - 1), [navigateToSection]);

  /* Weltenwechsel: volle Navigation zur Hauptseite. */
  const handleWelt = useCallback((ziel: "capital" | "solutions") => {
    if (ziel === "capital") window.location.href = mainSiteUrl;
  }, []);

  /* Betretene Stationen — einmal betreten bleibt betreten. */
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
    const id = setTimeout(() => {
      firstLatchDone.current = true;
      latch();
    }, 120);
    return () => clearTimeout(id);
  }, [isVertical, introComplete, activeIndex]);

  /* Eingabeart (Zeiger/Tastatur) für den Fokusrahmen. */
  useEffect(() => {
    const eingabe = (art: "zeiger" | "tastatur") => {
      if (document.documentElement.dataset.eingabe !== art) document.documentElement.dataset.eingabe = art;
    };
    const onPointer = () => eingabe("zeiger");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key.startsWith("Arrow")) eingabe("tastatur");
    };
    window.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", onPointer, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, []);

  const bandAktiv = !isVertical && introComplete;
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const preload = !introComplete && <PreloadScreen onComplete={handleIntroComplete} />;
  const kontakt = useMemo(() => kontaktDaten(homepage, t), [homepage, t]);
  const isDetailMode = teamDetailOffen || !!legal.activePath;

  if (!mounted) return <>{preload}</>;

  const kopf = (vertical: boolean) => (
    <KopfzeileBand
      aktiv={bandAktiv}
      activeIndex={activeIndex}
      sprache={sprache}
      onSprache={onSprache}
      onPortal={() => setLoginOpen(true)}
      onLogo={() => navigateToSection(0)}
      logoHref={`#${SECTIONS[0].key}`}
      welt="solutions"
      onWelt={handleWelt}
      sprachen={SPRACHEN}
      bildScrim="rgba(40, 31, 51, 0.32)"
      bildSchatten
      portalLabel={kundenportalLabel}
      isVertical={vertical}
      menueOffen={vertical ? menueOffen : undefined}
      onMenue={vertical ? () => setMenueOffen((o) => !o) : undefined}
      sichtbar={introComplete}
    />
  );

  const overlays = (
    <>
      <LoginOverlay open={loginOpen} onClose={() => setLoginOpen(false)} onSupportClick={navigateToContact} />
      <LegalPage activePath={legal.activePath} onClose={legal.close} homepage={homepage} />
    </>
  );

  /* ═══ SCHMAL: vertikale Sektionen ═══ */
  if (isVertical) {
    return (
      <div className="min-h-screen w-full cursor-default" style={{ backgroundColor: C.bg }}>
        {preload}
        {kopf(true)}
        <MobilMenue
          offen={menueOffen}
          onSchliessen={() => setMenueOffen(false)}
          activeIndex={activeIndex}
          sektionen={leisteNamen}
          onNavigate={navigateToSection}
          onOpenLegal={legal.open}
          welt="solutions"
          onWelt={handleWelt}
          sprache={sprache}
          sprachen={SPRACHEN}
          onSprache={(s) => onSprache(s as Sprache)}
          onPortal={() => setLoginOpen(true)}
          portalLabel={kundenportalLabel}
        />
        <main>
          {/* Wie in der Vorlage (SolutionsApp): keine Kapitelmarken auf Solutions. */}
          <SolutionsEinstieg isVertical bereit={introComplete} sprache={sprache} homepage={homepage} />
          <SolutionsWasWirTun isVertical sprache={sprache} domId={SECTIONS[1].domId} homepage={homepage} />
          <StationTeam
            isVertical
            domId={SECTIONS[2].domId}
            sprache={sprache}
            homepage={homepage}
            onDetailToggle={setTeamDetailOffen}
          />
          <StationKontakt
            isVertical
            domId={SECTIONS[3].domId}
            sprache={sprache}
            homepage={kontakt}
            onOpenLegal={legal.open}
          />
        </main>
        {overlays}
      </div>
    );
  }

  /* ═══ BREIT: der Filmstrip ═══ */
  return (
    <div className="relative h-screen w-full overflow-hidden cursor-default" style={{ backgroundColor: C.bg }}>
      {preload}

      <div
        style={{
          opacity: isDetailMode ? 0 : 1,
          pointerEvents: isDetailMode ? "none" : "auto",
          transition: "opacity 400ms ease-out",
        }}
      >
        {kopf(false)}
        {introComplete && (
          <DotNavigationBand
            aktiv={bandAktiv}
            activeIndex={activeIndex}
            onNavigate={navigateToSection}
            sektionen={leisteNamen}
            ariaLabel={sprache === "EN" ? "Section navigation" : sprache === "FR" ? "Navigation des sections" : "Sektion-Navigation"}
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
        <SectionEnteredProvider value={entered[0]}>
          <SolutionsEinstiegM sprache={sprache} homepage={homepage} />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[1]}>
          <SolutionsWasWirTunM sprache={sprache} domId={SECTIONS[1].domId} homepage={homepage} />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[2]}>
          <StationTeamM domId={SECTIONS[2].domId} sprache={sprache} homepage={homepage} onDetailToggle={setTeamDetailOffen} />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[3]}>
          <StationKontaktM domId={SECTIONS[3].domId} sprache={sprache} homepage={kontakt} onOpenLegal={legal.open} />
        </SectionEnteredProvider>
      </div>

      {overlays}
    </div>
  );
}
