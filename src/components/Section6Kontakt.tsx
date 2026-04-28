"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Breakpoint } from "./useBreakpoint";
import { LEGAL_PATHS, LEGAL_LINK_LABELS, type LegalPath } from "../data/legalPages";
import { client } from "@/sanity/lib/client";
import { CONTACT_QUERY } from "@/sanity/lib/queries";
import { useLiveQuery } from "@sanity/preview-kit";
import { useLanguage } from "@/i18n/LanguageContext";

/* ─── Design tokens ─── */
const C = {
  bgPrimary: "#F9F9F7",
  bgSecondary: "#F2F1EC",
  textPrimary: "#1A1916",
  textSecondary: "#3A3835",
  textTertiary: "#8A857C",
  borderTertiary: "#D8D5CF",
  line: "#D8D5CF",
  muted: "#B0ACA5",
  warm: "#989071",
  road: "#E8E6E1",
  water: "#D5DDD8",
  green: "#E4E8E0",
};

const serif = "var(--font-cormorant), serif";
const sans = "var(--font-inter), sans-serif";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;
const MAP_CENTER: [number, number] = [8.5387, 47.3769];

/* ═══════════════════════════════════════════════════════════
   MAPBOX STYLING HELPERS
   ═══════════════════════════════════════════════════════════ */
function applyStyleAndMarker(map: mapboxgl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id;
    const type = layer.type;
    try {
      if (type === "background") {
        map.setPaintProperty(id, "background-color", C.bgSecondary);
      } else if (type === "fill") {
        if (/water|river|stream|sea|lake/i.test(id)) {
          map.setPaintProperty(id, "fill-color", C.water);
        } else if (/park|wood|grass|vegetation|landuse/i.test(id) && !/building/i.test(id)) {
          map.setPaintProperty(id, "fill-color", C.green);
        } else if (/building/i.test(id)) {
          map.setPaintProperty(id, "fill-color", "#E8E6E1");
          map.setPaintProperty(id, "fill-outline-color", "#DCD8D0");
        } else {
          map.setPaintProperty(id, "fill-color", C.bgSecondary);
        }
      } else if (type === "line") {
        if (/motorway|trunk|primary|main/i.test(id)) {
          map.setPaintProperty(id, "line-color", C.line);
        } else if (/road|street|secondary|tertiary|service|path|pedestrian/i.test(id)) {
          map.setPaintProperty(id, "line-color", C.road);
        } else if (/water|river/i.test(id)) {
          map.setPaintProperty(id, "line-color", C.water);
        } else {
          map.setPaintProperty(id, "line-color", C.road);
        }
      } else if (type === "symbol") {
        if (/poi|transit|airport|shield/i.test(id)) {
          map.setLayoutProperty(id, "visibility", "none");
        } else {
          try {
            map.setPaintProperty(id, "text-color", C.textTertiary);
            map.setPaintProperty(id, "text-halo-color", C.bgSecondary);
            map.setPaintProperty(id, "text-halo-width", 1.2);
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      /* unsupported property */
    }
  }

  /* Custom marker */
  const el = document.createElement("div");
  el.style.width = "20px";
  el.style.height = "20px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = "rgba(152, 144, 113, 0.2)";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";

  const dot = document.createElement("div");
  dot.style.width = "12px";
  dot.style.height = "12px";
  dot.style.borderRadius = "50%";
  dot.style.backgroundColor = C.warm;
  el.appendChild(dot);

  new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat(MAP_CENTER).addTo(map);
}

/* ═══════════════════════════════════════════════════════════
   ZURICH MAP
   ═══════════════════════════════════════════════════════════ */
function ZurichMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const el = mapContainer.current;
    if (!el || mapRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    let cancelled = false;
    let ro: ResizeObserver | null = null;

    const initWhenReady = () => {
      if (cancelled) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(initWhenReady);
        return;
      }

      const map = new mapboxgl.Map({
        container: el,
        style: "mapbox://styles/mapbox/light-v11",
        center: MAP_CENTER,
        zoom: 15.5,
        pitch: 0,
        bearing: 0,
        interactive: false,
        attributionControl: false,
      });

      mapRef.current = map;
      map.on("load", () => map.resize());
      map.on("style.load", () => applyStyleAndMarker(map));
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

      ro = new ResizeObserver(() => map.resize());
      ro.observe(el);
    };

    initWhenReady();

    return () => {
      cancelled = true;
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: C.bgSecondary,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   MAP OVERLAY — centered modal via React portal
   ═══════════════════════════════════════════════════════════ */
interface MapOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Element to return focus to after close */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  address: string;
}

function MapOverlay({ open, onClose, returnFocusRef, address }: MapOverlayProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const isAnimatingRef = useRef(false);
  const [rendered, setRendered] = useState(open);

  /* Keep the overlay mounted during the closing animation */
  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    // Unmount after close animation finishes (250ms backdrop + 100ms delay = 350ms total)
    const t = setTimeout(() => setRendered(false), 400);
    return () => clearTimeout(t);
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Focus management — only return focus AFTER overlay was actually opened.
     Avoids page jumping on initial mount (calling .focus() scrolls the element
     into view, which on mobile jumps the whole page down to the trigger). */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      // Wait until close button is visually present (300ms delay + 250ms fade = 550ms)
      const t = setTimeout(() => closeBtnRef.current?.focus(), 550);
      return () => clearTimeout(t);
    } else if (wasOpenRef.current) {
      // Only return focus if overlay was previously open — not on initial mount
      returnFocusRef.current?.focus({ preventScroll: true });
    }
  }, [open, returnFocusRef]);

  const handleClose = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    onClose();
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 500);
  };

  if (!rendered) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Standort auf Karte"
      className={open ? "tellian-map-overlay open" : "tellian-map-overlay"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        visibility: open ? "visible" : "hidden",
        transition: open ? "visibility 0s" : "visibility 0s linear 350ms",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          opacity: open ? 1 : 0,
          transition: open ? "opacity 350ms ease-out" : "opacity 250ms ease-out 100ms",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "680px",
          maxWidth: "90vw",
          height: "480px",
          maxHeight: "80vh",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E8E4DC",
          transform: open ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.92)",
          opacity: open ? 1 : 0,
          transition: open
            ? "transform 450ms cubic-bezier(0.16, 1, 0.3, 1) 50ms, opacity 450ms cubic-bezier(0.16, 1, 0.3, 1) 50ms"
            : "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Close button */}
        <button
          ref={closeBtnRef}
          onClick={handleClose}
          aria-label="Karte schliessen"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "0.5px solid rgba(0, 0, 0, 0.08)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            fontSize: "16px",
            color: "#666",
            fontFamily: sans,
            zIndex: 2,
            opacity: open ? 1 : 0,
            transition: open
              ? "opacity 250ms ease-out 300ms, transform 150ms ease-out"
              : "opacity 100ms ease-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ×
        </button>

        {/* Map area */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#E8E4DC",
          }}
        >
          <ZurichMap />
        </div>

        {/* Address bar */}
        <div
          style={{
            height: "48px",
            backgroundColor: "#1A1A1A",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.45)",
            }}
          >
            {address}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT FORM (Card content)
   ═══════════════════════════════════════════════════════════ */
interface ContactFormLabels {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  responseTime: string;
  thanksTitle: string;
  thanksBody: string;
}

function ContactForm({ stack = false, labels }: { stack?: boolean; labels: ContactFormLabels }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const fieldStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: stack ? "14px" : "13px",
    color: C.textPrimary,
    backgroundColor: "transparent",
    border: `0.5px solid ${C.borderTertiary}`,
    borderRadius: "6px",
    padding: stack ? "12px 14px" : "10px 12px",
    minHeight: stack ? "44px" : undefined, // Apple HIG touch target on mobile
    outline: "none",
    width: "100%",
    transition: "border-color 0.3s ease",
    appearance: "none",
  };

  if (submitted) {
    return (
      <div style={{ padding: "20px 0" }}>
        <span
          style={{
            fontFamily: serif,
            fontSize: "24px",
            color: C.textPrimary,
            display: "block",
            lineHeight: 1.15,
          }}
        >
          {labels.thanksTitle}
        </span>
        <span
          style={{
            fontFamily: sans,
            fontSize: "12px",
            color: C.textSecondary,
            display: "block",
            marginTop: "12px",
            lineHeight: 1.6,
          }}
        >
          {labels.thanksBody}
        </span>
      </div>
    );
  }

  /* Stack mode: every field gets its own row (mobile / vertical).
     Default mode: two-column pairs (Vorname+Nachname, E-Mail+Telefon). */
  const pairStyle: React.CSSProperties = stack
    ? { display: "flex", flexDirection: "column", gap: "10px" }
    : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={pairStyle}>
        <input
          type="text"
          placeholder={labels.firstName}
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          style={fieldStyle}
          className="placeholder:text-[#B0ACA5] focus:border-[#1A1916]"
        />
        <input
          type="text"
          placeholder={labels.lastName}
          required
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          style={fieldStyle}
          className="placeholder:text-[#B0ACA5] focus:border-[#1A1916]"
        />
      </div>
      <div style={pairStyle}>
        <input
          type="email"
          placeholder={labels.email}
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={fieldStyle}
          className="placeholder:text-[#B0ACA5] focus:border-[#1A1916]"
        />
        <input
          type="tel"
          placeholder={labels.phone}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={fieldStyle}
          className="placeholder:text-[#B0ACA5] focus:border-[#1A1916]"
        />
      </div>
      <textarea
        placeholder={labels.message}
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        style={{ ...fieldStyle, height: stack ? "100px" : "80px", resize: "none" }}
        className="placeholder:text-[#B0ACA5] focus:border-[#1A1916]"
      />

      {stack ? (
        /* Mobile: full-width button + caption underneath, centered */
        <div style={{ marginTop: "10px" }}>
          <button
            type="submit"
            style={{
              fontFamily: sans,
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              backgroundColor: C.textPrimary,
              border: "none",
              borderRadius: "6px",
              padding: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              appearance: "none",
              width: "100%",
            }}
            className="hover:bg-[#3A3835]"
          >
            {labels.submit}
          </button>
          <span
            style={{
              fontFamily: sans,
              fontSize: "11px",
              color: C.textTertiary,
              display: "block",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {labels.responseTime}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px" }}>
          <button
            type="submit"
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              backgroundColor: C.textPrimary,
              border: "none",
              borderRadius: "6px",
              padding: "13px 28px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              appearance: "none",
            }}
            className="hover:bg-[#3A3835]"
          >
            {labels.submit}
          </button>
          <span style={{ fontFamily: sans, fontSize: "10px", color: C.textTertiary }}>
            {labels.responseTime}
          </span>
        </div>
      )}
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — KONTAKT
   Desktop: 2 columns (Editorial left | Form right on bg-secondary).
   Mobile/Tablet: stacked single column, no card-in-card.
   Map is rendered via MapOverlay (portal) — does NOT affect layout.
   ═══════════════════════════════════════════════════════════ */
interface Section6Props {
  isVertical?: boolean;
  breakpoint?: Breakpoint;
  onOpenLegal?: (path: LegalPath) => void;
  initialData?: any;
}

/* ─── Legal links row — used in both vertical and desktop layouts ─── */
function LegalLinksRow({
  onOpenLegal,
  align = "left",
}: {
  onOpenLegal?: (path: LegalPath) => void;
  align?: "left" | "center";
}) {
  return (
    <div
      style={{
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: `0.5px solid ${C.borderTertiary}`,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: "10px",
        rowGap: "6px",
      }}
    >
      {LEGAL_PATHS.map((path, i) => (
        <span key={path} style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
          {i > 0 && (
            <span
              aria-hidden
              style={{
                fontFamily: sans,
                fontSize: "10px",
                color: C.muted,
                lineHeight: 1,
              }}
            >
              ·
            </span>
          )}
          <a
            href={path}
            onClick={(e) => {
              if (!onOpenLegal) return;
              e.preventDefault();
              onOpenLegal(path);
            }}
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.textTertiary,
              textDecoration: "none",
              transition: "color 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.textPrimary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textTertiary)}
            onFocus={(e) => (e.currentTarget.style.color = C.textPrimary)}
            onBlur={(e) => (e.currentTarget.style.color = C.textTertiary)}
          >
            {LEGAL_LINK_LABELS[path]}
          </a>
        </span>
      ))}
    </div>
  );
}

/* ─── Mobile-only: "Auf Karte anzeigen" as accent-line link (primary action) ─── */
function MapLinkMobile({
  onClick,
  ariaExpanded,
  buttonRef,
  label,
}: {
  onClick: () => void;
  ariaExpanded: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  label: string;
}) {
  const [hover, setHover] = useState(false);
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "14px 0",
        minHeight: "44px",
        marginTop: "8px",
        outline: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: hover ? "24px" : "14px",
          height: "0.5px",
          backgroundColor: hover ? C.textPrimary : C.textTertiary,
          transition: `width 300ms ${EASE}, background-color 300ms ${EASE}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: sans,
          fontSize: "11px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.textPrimary,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Mobile-only: vertical stacked legal links, each with its own accent-line ─── */
function LegalLinksStackedMobile({ onOpenLegal }: { onOpenLegal?: (path: LegalPath) => void }) {
  return (
    <div
      style={{
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: `0.5px solid ${C.borderTertiary}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {LEGAL_PATHS.map((path) => (
        <LegalLinkMobileRow
          key={path}
          path={path}
          label={LEGAL_LINK_LABELS[path]}
          onOpenLegal={onOpenLegal}
        />
      ))}
    </div>
  );
}
function LegalLinkMobileRow({
  path,
  label,
  onOpenLegal,
}: {
  path: LegalPath;
  label: string;
  onOpenLegal?: (path: LegalPath) => void;
}) {
  const [hover, setHover] = useState(false);
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  return (
    <a
      href={path}
      onClick={(e) => {
        if (!onOpenLegal) return;
        e.preventDefault();
        onOpenLegal(path);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        minHeight: "36px",
        textDecoration: "none",
        outline: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: hover ? "22px" : "14px",
          height: "0.5px",
          backgroundColor: hover ? C.textSecondary : C.muted,
          transition: `width 300ms ${EASE}, background-color 300ms ${EASE}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: sans,
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: hover ? C.textPrimary : C.textTertiary,
          transition: `color 300ms ${EASE}`,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </a>
  );
}

export function Section6Kontakt({
  isVertical = false,
  breakpoint = "desktop",
  onOpenLegal,
  initialData,
}: Section6Props = {}) {
  const [mapOpen, setMapOpen] = useState(false);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  // Live preview using @sanity/preview-kit
  const [data] = useLiveQuery(initialData, CONTACT_QUERY);

  // Both `data` (live) and `initialData` (full homepage doc) use the same
  // field names, so a single fall-through reads either source.
  const cms: any = data ?? initialData ?? {};

  const content = {
    /* Editorial column */
    subheading: t(cms.contactSubheading, "Kontakt"),
    heading: t(cms.contactHeading, "Ein Gespräch ist der Anfang."),
    description: t(
      cms.contactDescription,
      "Wenn Sie wissen möchten, ob unsere Arbeitsweise zu Ihren Erwartungen passt, laden wir Sie zu einem unverbindlichen Erstgespräch ein. Persönlich, vertraulich, in unseren Räumen an der Löwenstrasse oder digital.",
    ),

    /* Form labels */
    formHeading: t(cms.contactFormHeading, "Schreiben Sie uns"),
    formFirstName: t(cms.contactFormFirstName, "Vorname"),
    formLastName: t(cms.contactFormLastName, "Nachname"),
    formEmail: t(cms.contactFormEmail, "E-Mail"),
    formPhone: t(cms.contactFormPhone, "Telefon"),
    formMessage: t(cms.contactFormMessage, "Nachricht"),
    formSubmit: t(cms.contactFormSubmit, "Anfrage senden →"),
    formResponseTime: t(cms.contactFormResponseTime, "Antwort innert 24h"),
    formThanksTitle: t(cms.contactFormThanksTitle, "Vielen Dank."),
    formThanksBody: t(cms.contactFormThanksBody, "Wir melden uns innerhalb von 24 Stunden."),

    /* Company / address (plain string fields, no locale) */
    companyName: cms.contactCompanyName || "Tellian Capital",
    companyTagline: t(cms.contactCompanyTagline, "Vermögensverwaltung Zürich AG"),
    address: cms.contactAddress || "Löwenstrasse 1, CH-8001 Zürich",
    phone: cms.contactPhone || "+41 44 224 40 24",
    email: cms.contactEmail || "info@telliancapital.ch",

    /* Footer / overlay link */
    mapLinkLabel: t(cms.contactMapLinkLabel, "Auf Karte anzeigen"),
    footerTagline: t(cms.contactFooterTagline, "Tellian Capital AG — Est. 1996 — Zürich"),
  };

  const formLabels: ContactFormLabels = {
    firstName: content.formFirstName,
    lastName: content.formLastName,
    email: content.formEmail,
    phone: content.formPhone,
    message: content.formMessage,
    submit: content.formSubmit,
    responseTime: content.formResponseTime,
    thanksTitle: content.formThanksTitle,
    thanksBody: content.formThanksBody,
  };

  /* ═══ VERTICAL MODE (mobile + tablet) — stacked, no card-in-card ═══ */
  if (isVertical) {
    const isMobile = breakpoint === "mobile";
    const padX = isMobile ? "20px" : "clamp(32px, 6vw, 64px)";
    return (
      <section
        id="section-kontakt"
        style={{
          backgroundColor: C.bgPrimary,
          padding: `clamp(48px, 7vh, 80px) ${padX} 48px`,
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "2.5px",
            color: C.textTertiary,
            display: "block",
            textTransform: "uppercase",
          }}
        >
          {content.subheading}
        </span>

        {/* Accent line */}
        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.textPrimary,
            margin: "12px 0",
          }}
        />

        {/* Headline — same wording as desktop */}
        <h2
          style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "clamp(36px, 5vw, 48px)",
            lineHeight: 1.12,
            color: C.textPrimary,
            letterSpacing: "-0.02em",
            margin: "16px 0 0 0",
            fontWeight: 400,
          }}
        >
          {content.heading === "Ein Gespräch ist der Anfang." ? (
            <>
              Ein Gespräch ist
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>der Anfang.</em>
            </>
          ) : (
            content.heading
          )}
        </h2>

        {/* Body */}
        <p
          style={{
            fontFamily: sans,
            fontSize: isMobile ? "14px" : "15px",
            color: C.textSecondary,
            lineHeight: 1.65,
            maxWidth: "520px",
            marginTop: "24px",
          }}
        >
          {content.description}
        </p>

        {/* Form section header — replaces the Card on mobile */}
        <div style={{ marginTop: "32px" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "2px",
              color: C.textTertiary,
              display: "block",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            {content.formHeading}
          </span>
          <ContactForm stack labels={formLabels} />
        </div>

        {/* Address */}
        <div style={{ marginTop: "40px" }}>
          <div
            style={{
              width: "100%",
              height: "0.5px",
              backgroundColor: C.borderTertiary,
              marginBottom: "20px",
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: "13px",
              fontWeight: 500,
              color: C.textPrimary,
              display: "block",
            }}
          >
            {content.companyName}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: "12px",
              color: C.textTertiary,
              display: "block",
              marginTop: "2px",
            }}
          >
            {content.companyTagline}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: "12px",
              color: C.textTertiary,
              display: "block",
              marginTop: "4px",
            }}
          >
            {content.address}
          </span>

          {/* Map link — directly under address, part of the address block */}
          <MapLinkMobile
            buttonRef={openBtnRef}
            onClick={() => setMapOpen(true)}
            ariaExpanded={mapOpen}
            label={content.mapLinkLabel}
          />

          {/* Tel + Mail as touch-friendly rows (44px min height) */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
            <a
              href={`tel:${content.phone.replace(/\s+/g, "")}`}
              style={{
                fontFamily: sans,
                fontSize: "13px",
                color: C.textSecondary,
                display: "flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "4px 0",
              }}
              className="transition-colors duration-300 hover:text-[#1A1916]"
            >
              {content.phone}
            </a>
            <a
              href={`mailto:${content.email}`}
              style={{
                fontFamily: sans,
                fontSize: "13px",
                color: C.textSecondary,
                display: "flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "4px 0",
              }}
              className="transition-colors duration-300 hover:text-[#1A1916]"
            >
              {content.email}
            </a>
          </div>
        </div>

        {/* Legal links — vertical stack, separated from address block by top border */}
        <LegalLinksStackedMobile onOpenLegal={onOpenLegal} />

        {/* Footer */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{ width: "16px", height: "1px", backgroundColor: C.borderTertiary }} />
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
            {content.footerTagline}
          </span>
        </div>

        {/* Shared overlay (portal) */}
        <MapOverlay
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          returnFocusRef={openBtnRef}
          address={content.address}
        />
      </section>
    );
  }

  /* ═══ DESKTOP MODE ═══ */
  return (
    <div
      className="flex h-screen flex-shrink-0"
      style={{
        width: "100vw",
        backgroundColor: C.bgPrimary,
      }}
    >
      {/* ═══ COLUMN 1 — Editorial ═══ */}
      <div
        style={{
          width: "36vw",
          minWidth: "380px",
          flexShrink: 0,
          padding: "clamp(36px, 5vh, 80px) clamp(36px, 5vw, 80px) clamp(24px, 3vh, 56px)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.bgPrimary,
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "2.5px",
            color: C.textTertiary,
            display: "block",
            textTransform: "uppercase",
          }}
        >
          {content.subheading}
        </span>

        {/* Accent line */}
        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.textPrimary,
            margin: "12px 0",
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: serif,
            fontSize: "32px",
            lineHeight: 1.12,
            color: C.textPrimary,
            letterSpacing: "-0.02em",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {content.heading === "Ein Gespräch ist der Anfang." ? (
            <>
              Ein Gespräch ist
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>der Anfang.</em>
            </>
          ) : (
            content.heading
          )}
        </h2>

        {/* Body */}
        <p
          style={{
            fontFamily: sans,
            fontSize: "14px",
            color: C.textSecondary,
            lineHeight: 1.6,
            maxWidth: "320px",
            marginTop: "20px",
          }}
        >
          {content.description}
        </p>

        {/* Bottom block — pushed down */}
        <div style={{ marginTop: "auto", paddingTop: "24px" }}>
          <div
            style={{
              width: "100%",
              height: "0.5px",
              backgroundColor: C.borderTertiary,
              marginBottom: "20px",
            }}
          />

          {/* Company */}
          <span
            style={{
              fontFamily: sans,
              fontSize: "13px",
              fontWeight: 500,
              color: C.textPrimary,
              display: "block",
            }}
          >
            {content.companyName}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: "11px",
              color: C.textTertiary,
              display: "block",
              marginTop: "2px",
            }}
          >
            {content.companyTagline}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: "11px",
              color: C.textTertiary,
              display: "block",
              marginTop: "4px",
            }}
          >
            {content.address}
          </span>

          {/* Contact row */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "12px",
            }}
          >
            <a
              href={`tel:${content.phone.replace(/\s+/g, "")}`}
              style={{ fontFamily: sans, fontSize: "11px", color: C.textSecondary }}
              className="transition-colors duration-300 hover:text-[#1A1916]"
            >
              {content.phone}
            </a>
            <a
              href={`mailto:${content.email}`}
              style={{ fontFamily: sans, fontSize: "11px", color: C.textSecondary }}
              className="transition-colors duration-300 hover:text-[#1A1916]"
            >
              {content.email}
            </a>
          </div>

          {/* Legal links — below contact row */}
          <LegalLinksRow onOpenLegal={onOpenLegal} />
        </div>
      </div>

      {/* ═══ COLUMN 2 — Form (on secondary bg) ═══ */}
      <div
        style={{
          flex: 1,
          minWidth: "460px",
          backgroundColor: C.bgSecondary,
          padding: "clamp(36px, 5vh, 80px) clamp(36px, 4vw, 64px) clamp(24px, 3vh, 56px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Form card */}
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: C.bgPrimary,
            border: `0.5px solid ${C.borderTertiary}`,
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "2px",
              color: C.textTertiary,
              display: "block",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            {content.formHeading}
          </span>
          <ContactForm labels={formLabels} />
        </div>

        {/* "Auf Karte anzeigen" — bottom right, triggers overlay */}
        <button
          ref={openBtnRef}
          onClick={() => setMapOpen(true)}
          aria-expanded={mapOpen}
          style={{
            position: "absolute",
            bottom: "clamp(24px, 3vh, 48px)",
            right: "clamp(36px, 4vw, 64px)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            fontFamily: sans,
            fontSize: "9px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: C.textTertiary,
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.textSecondary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.textTertiary)}
        >
          <span
            style={{
              display: "inline-block",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "currentColor",
            }}
            aria-hidden
          />
          {content.mapLinkLabel}
        </button>
      </div>

      {/* ═══ OVERLAY — rendered via portal to document.body ═══ */}
      <MapOverlay open={mapOpen} onClose={() => setMapOpen(false)} returnFocusRef={openBtnRef} />
    </div>
  );
}
