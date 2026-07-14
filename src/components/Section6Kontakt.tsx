"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
/* mapbox-gl is dynamic-imported inside ZurichMap below to keep it out of the
   main bundle. The map only renders when the user opens the overlay. */
import type mapboxgl from "mapbox-gl";
import type { Breakpoint } from "./useBreakpoint";
import { FloatingField } from "./FloatingField";
import { LEGAL_PATHS, LEGAL_LINK_LABELS, type LegalPath } from "../data/legalPages";
import { CONTACT_QUERY } from "@/sanity/lib/queries";
import { useLiveQuery } from "@sanity/preview-kit";
import { useLanguage } from "@/i18n/LanguageContext";

import { C, serif, sans } from "@/tokens";

/* Mapbox-specific colors (not design tokens — map theming only) */
const MAP_COLORS = { road: "#E8E6E1", water: "#D5DDD8", green: "#E4E8E0" };

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;
const MAP_CENTER: [number, number] = [8.5387, 47.3769];

/* ═══════════════════════════════════════════════════════════
   MAPBOX STYLING HELPERS
   ═══════════════════════════════════════════════════════════ */
type MapboxGL = typeof mapboxgl;

function applyStyleAndMarker(mapboxgl: MapboxGL, map: mapboxgl.Map) {
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
          map.setPaintProperty(id, "fill-color", MAP_COLORS.water);
        } else if (/park|wood|grass|vegetation|landuse/i.test(id) && !/building/i.test(id)) {
          map.setPaintProperty(id, "fill-color", MAP_COLORS.green);
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
          map.setPaintProperty(id, "line-color", MAP_COLORS.road);
        } else if (/water|river/i.test(id)) {
          map.setPaintProperty(id, "line-color", MAP_COLORS.water);
        } else {
          map.setPaintProperty(id, "line-color", MAP_COLORS.road);
        }
      } else if (type === "symbol") {
        if (/poi|transit|airport|shield/i.test(id)) {
          map.setLayoutProperty(id, "visibility", "none");
        } else {
          try {
            map.setPaintProperty(id, "text-color", C.stone);
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

    let cancelled = false;
    let ro: ResizeObserver | null = null;

    /* Lazy-load mapbox-gl + its CSS on first mount of this component.
       Keeps ~700 KB of JS out of the main bundle so the homepage paints
       faster — the user has to click the map button to land here anyway. */
    (async () => {
      const [{ default: mapboxgl }] = await Promise.all([
        import("mapbox-gl"),
        import("mapbox-gl/dist/mapbox-gl.css"),
      ]);
      if (cancelled) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;

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
        map.on("style.load", () => applyStyleAndMarker(mapboxgl, map));
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

        ro = new ResizeObserver(() => map.resize());
        ro.observe(el);
      };

      initWhenReady();
    })();

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

  /* Focus management */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const t = setTimeout(() => closeBtnRef.current?.focus(), 550);
      return () => clearTimeout(t);
    } else if (wasOpenRef.current) {
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
            backgroundColor: C.dark,
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
  sending: string;
  responseTime: string;
  thanksTitle: string;
  thanksBody: string;
  privacyText: ReactNode;
}

function ContactForm({ stack = false, labels }: { stack?: boolean; labels: ContactFormLabels }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const messageBody = form.phone.trim()
      ? `${form.message}\n\n—\nTelefon: ${form.phone}`
      : form.message;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: form.email,
          subject: `Neue Kontaktanfrage von ${fullName}`,
          message: messageBody,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.");
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: "20px 0" }} role="status" aria-live="polite">
        <span
          style={{
            fontFamily: serif,
            fontSize: "24px",
            color: C.dark,
            display: "block",
            lineHeight: 1.15,
          }}
        >
          {labels.thanksTitle}
        </span>
        <span
          style={{
            fontFamily: sans,
            fontSize: "13px",
            color: C.charcoal,
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

  const pairStyle: React.CSSProperties = stack
    ? { display: "flex", flexDirection: "column", gap: "16px" }
    : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={pairStyle}>
        <FloatingField
          label={labels.firstName}
          required
          value={form.firstName}
          onChange={(v) => setForm({ ...form, firstName: v })}
        />
        <FloatingField
          label={labels.lastName}
          required
          value={form.lastName}
          onChange={(v) => setForm({ ...form, lastName: v })}
        />
      </div>
      <div style={pairStyle}>
        <FloatingField
          label={labels.email}
          type="email"
          required
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <FloatingField
          label={labels.phone}
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
      </div>
      <FloatingField
        label={labels.message}
        required
        multiline
        rows={5}
        value={form.message}
        onChange={(v) => setForm({ ...form, message: v })}
      />

      {/* Datenschutz-Hinweis */}
      <p
        style={{
          fontFamily: sans,
          fontSize: "12px",
          color: C.charcoal,
          opacity: 0.65,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {labels.privacyText}
      </p>

      {/* Error message */}
      {errorMsg && (
        <p
          role="alert"
          style={{
            fontFamily: sans,
            fontSize: "12px",
            color: "#b3261e",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="hover:bg-tellian-button-hover active:scale-[0.98]"
        style={{
          fontFamily: sans,
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.dark,
          backgroundColor: C.button,
          border: "none",
          borderRadius: 0,
          padding: "16px 24px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.8 : 1,
          transition: "background-color 200ms ease, opacity 200ms ease",
          appearance: "none",
          width: stack ? "100%" : undefined,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {loading ? labels.sending : labels.submit}
        {!loading && <span aria-hidden>→</span>}
      </button>

      {/* Response time hint */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "1px",
            backgroundColor: C.stone,
            opacity: 0.5,
          }}
          aria-hidden
        />
        <span
          style={{
            fontFamily: sans,
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.stone,
            opacity: 0.65,
          }}
        >
          {labels.responseTime}
        </span>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — KONTAKT
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
  labels,
}: {
  onOpenLegal?: (path: LegalPath) => void;
  align?: "left" | "center";
  labels?: Record<LegalPath, string>;
}) {
  return (
    <div
      style={{
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: `0.5px solid ${C.line}`,
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
              color: C.stone,
              textDecoration: "none",
              transition: "color 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
            onFocus={(e) => (e.currentTarget.style.color = C.dark)}
            onBlur={(e) => (e.currentTarget.style.color = C.stone)}
          >
            {labels?.[path] || LEGAL_LINK_LABELS[path]}
          </a>
        </span>
      ))}

      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
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
        <a
          href="https://solutions.telliancapital.ch"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.stone,
            textDecoration: "none",
            transition: "color 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            outline: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
          onFocus={(e) => (e.currentTarget.style.color = C.dark)}
          onBlur={(e) => (e.currentTarget.style.color = C.stone)}
        >
          Tellian Capital Solutions
        </a>
      </span>
    </div>
  );
}

/* ─── Mobile-only: "Auf Karte anzeigen" as accent-line link ─── */
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
          backgroundColor: hover ? C.dark : C.stone,
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
          color: C.dark,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Mobile-only: vertical stacked legal links ─── */
function LegalLinksStackedMobile({
  onOpenLegal,
  labels,
}: {
  onOpenLegal?: (path: LegalPath) => void;
  labels?: Record<LegalPath, string>;
}) {
  return (
    <div
      style={{
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: `0.5px solid ${C.line}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {LEGAL_PATHS.map((path) => (
        <LegalLinkMobileRow
          key={path}
          path={path}
          label={labels?.[path] || LEGAL_LINK_LABELS[path]}
          onOpenLegal={onOpenLegal}
        />
      ))}
      <SolutionsLinkMobileRow />
    </div>
  );
}

/* ─── Mobile-only: external "Tellian Capital Solutions" link, same row style ─── */
function SolutionsLinkMobileRow() {
  const [hover, setHover] = useState(false);
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  return (
    <a
      href="https://solutions.telliancapital.ch"
      target="_blank"
      rel="noopener noreferrer"
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
          backgroundColor: hover ? C.charcoal : C.muted,
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
          color: hover ? C.dark : C.stone,
          transition: `color 300ms ${EASE}`,
          lineHeight: 1,
        }}
      >
        Tellian Capital Solutions
      </span>
    </a>
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
          backgroundColor: hover ? C.charcoal : C.muted,
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
          color: hover ? C.dark : C.stone,
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
  const { t, lang } = useLanguage();

  // Live preview using @sanity/preview-kit
  const [data] = useLiveQuery(initialData, CONTACT_QUERY);
  const cms: any = data ?? initialData ?? {};

  if (typeof window !== "undefined") {
    console.log("[contact debug] contactFormThanksBody");
    console.log("[contact debug] contactFormThanksTitle");
  }

  /* Privacy link — opens legal modal if onOpenLegal is wired, otherwise plain href */
  const privacyPrefix = t(cms.contactPrivacyPrefix);
  const privacyLinkLabel = t(cms.contactPrivacyLinkLabel);
  const privacySuffix = t(cms.contactPrivacySuffix);
  const privacyTextNode: ReactNode = (
    <>
      {privacyPrefix}
      <a
        href="/datenschutz"
        onClick={(e) => {
          if (!onOpenLegal) return;
          e.preventDefault();
          onOpenLegal("/datenschutz");
        }}
        style={{ color: "inherit", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        {privacyLinkLabel}
      </a>
      {privacySuffix}
    </>
  );

  const content = {
    /* Editorial column */
    subheading: t(cms.contactSubheading, "Kontakt"),
    heading: t(cms.contactHeading, ""),
    description: t(
      cms.contactDescription,
      "Ein erstes Gespräch ist unverbindlich. Persönlich an der Löwenstrasse, oder digital.",
    ),

    /* Form labels */
    formHeading: t(cms.contactFormHeading, "Schreiben Sie uns"),
    formFirstName: t(cms.contactFormFirstName, "Vorname"),
    formLastName: t(cms.contactFormLastName, "Nachname"),
    formEmail: t(cms.contactFormEmail, "E-Mail"),
    formPhone: t(cms.contactFormPhone, "Telefon"),
    formMessage: t(cms.contactFormMessage, "Nachricht"),
    formSubmit: t(cms.contactFormSubmit, "Anfrage senden"),
    formSending: t(cms.contactFormSendingLabel, "Wird gesendet..."),
    formResponseTime: t(cms.contactFormResponseTime, "Antwort innert 24h"),
    formThanksTitle: t(cms.contactFormThanksTitle, "Vielen Dank."),
    formThanksBody: t(cms.contactFormThanksBody, "Wir melden uns innert 24 Stunden."),

    /* Company / address (plain string fields) */
    companyName: cms.contactCompanyName || "Tellian Capital",
    companyTagline: t(cms.contactCompanyTagline, "Vermögensverwaltung Zürich AG"),
    address: cms.contactAddress || "Löwenstrasse 1, CH-8001 Zürich",
    phone: cms.contactPhone || "+41 44 224 40 24",
    email: cms.contactEmail || "info@telliancapital.ch",
    phoneHours: t(cms.contactPhoneHours, "Montag bis Freitag, 8 bis 18 Uhr"),

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
    sending: content.formSending,
    responseTime: content.formResponseTime,
    thanksTitle: content.formThanksTitle,
    thanksBody: content.formThanksBody,
    privacyText: privacyTextNode,
  };

  /* Legal-link labels — sourced from the full homepage doc (`initialData`).
     Hardcoded fallbacks are language-aware so the UI stays localized even
     when the matching Sanity fields are empty. */
  const legalSource: any = initialData ?? cms;
  const legalFallbacks: Record<LegalPath, Record<"de" | "en", string>> = {
    "/impressum": { de: "Impressum", en: "Legal Notice" },
    "/datenschutz": { de: "Datenschutz", en: "Privacy Policy" },
    "/kundeninformation": { de: "Kundeninformation", en: "Client Information" },
  };
  const legalLabels: Record<LegalPath, string> = {
    "/impressum": t(legalSource?.legalImpressumLinkLabel, legalFallbacks["/impressum"][lang]),
    "/datenschutz": t(legalSource?.legalDatenschutzLinkLabel, legalFallbacks["/datenschutz"][lang]),
    "/kundeninformation": t(
      legalSource?.legalKundeninformationLinkLabel,
      legalFallbacks["/kundeninformation"][lang],
    ),
  };

  /* Headline fallback: "Sprechen wir." with italic "wir." */
  const headingFallback = (
    <>
      Sprechen <em style={{ fontStyle: "italic", fontWeight: 400 }}>wir.</em>
    </>
  );
  const headingNode: ReactNode = content.heading ? content.heading : headingFallback;

  /* Phone in tel: URI (strip spaces) */
  const phoneHref = `tel:${content.phone.replace(/\s+/g, "")}`;

  /* ═══ VERTICAL MODE (mobile + tablet) — stacked, no card-in-card ═══ */
  if (isVertical) {
    const isMobile = breakpoint === "mobile";
    const padX = isMobile ? "20px" : "clamp(32px, 6vw, 64px)";
    return (
      <section
        id="section-kontakt"
        style={{
          backgroundColor: C.bg,
          padding: `clamp(48px, 7vh, 80px) ${padX} 48px`,
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "2.5px",
            color: C.stone,
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
            backgroundColor: C.dark,
            margin: "12px 0",
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "clamp(36px, 5vw, 48px)",
            lineHeight: 1.12,
            color: C.dark,
            letterSpacing: "-0.02em",
            margin: "16px 0 0 0",
            fontWeight: 400,
          }}
        >
          {headingNode}
        </h2>

        {/* Body */}
        <p
          style={{
            fontFamily: sans,
            fontSize: isMobile ? "14px" : "15px",
            color: C.charcoal,
            lineHeight: 1.65,
            maxWidth: "520px",
            marginTop: "24px",
          }}
        >
          {content.description}
        </p>

        {/* Phone — prominent */}
        <div style={{ marginTop: "28px" }}>
          <a
            href={phoneHref}
            style={{
              fontFamily: serif,
              fontSize: "26px",
              fontWeight: 400,
              color: C.dark,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {content.phone}
          </a>
          <span
            style={{
              fontFamily: sans,
              fontSize: "11px",
              color: C.stone,
              display: "block",
              marginTop: "6px",
            }}
          >
            {content.phoneHours}
          </span>
        </div>

        {/* Email — secondary */}
        <a
          href={`mailto:${content.email}`}
          style={{
            fontFamily: sans,
            fontSize: "13px",
            color: C.charcoal,
            textDecoration: "none",
            display: "inline-block",
            marginTop: "12px",
          }}
        >
          {content.email}
        </a>

        {/* Form section — mobile */}
        <div style={{ marginTop: "40px" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: C.stone,
              display: "block",
              textTransform: "uppercase",
            }}
          >
            {content.formHeading}
          </span>
          <div
            style={{
              width: "28px",
              height: "1.5px",
              backgroundColor: C.dark,
              marginTop: "12px",
              marginBottom: "24px",
            }}
          />
          <ContactForm stack labels={formLabels} />
        </div>

        {/* Address */}
        <div style={{ marginTop: "40px" }}>
          <div
            style={{
              width: "100%",
              height: "0.5px",
              backgroundColor: C.line,
              marginBottom: "20px",
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: "13px",
              fontWeight: 500,
              color: C.dark,
              display: "block",
            }}
          >
            {content.companyName}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: "12px",
              color: C.stone,
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
              color: C.stone,
              display: "block",
              marginTop: "4px",
            }}
          >
            {content.address}
          </span>

          {/* Map link */}
          <MapLinkMobile
            buttonRef={openBtnRef}
            onClick={() => setMapOpen(true)}
            ariaExpanded={mapOpen}
            label={content.mapLinkLabel}
          />

          {/* Tel + Mail rows (44px touch target) */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
            <a
              href={phoneHref}
              style={{
                fontFamily: sans,
                fontSize: "13px",
                color: C.charcoal,
                display: "flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "4px 0",
              }}
            >
              {content.phone}
            </a>
            <a
              href={`mailto:${content.email}`}
              style={{
                fontFamily: sans,
                fontSize: "13px",
                color: C.charcoal,
                display: "flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "4px 0",
              }}
            >
              {content.email}
            </a>
          </div>
        </div>

        {/* Legal links stack */}
        <LegalLinksStackedMobile onOpenLegal={onOpenLegal} labels={legalLabels} />

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
          <div style={{ width: "16px", height: "1px", backgroundColor: C.line }} />
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
        backgroundColor: C.bg,
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
          justifyContent: "space-between",
          backgroundColor: C.bg,
        }}
      >
        {/* Main content — vertically centered */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          {/* 1. Eyebrow */}
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
            {content.subheading}
          </span>

          {/* 2. Eyebrow divider */}
          <div
            style={{ width: "28px", height: "1.5px", backgroundColor: C.dark, marginTop: "16px" }}
          />

          {/* 3. Headline */}
          <h2
            style={{
              fontFamily: serif,
              fontSize: "clamp(48px, 7vh, 80px)",
              lineHeight: 0.94,
              color: C.dark,
              letterSpacing: "-0.03em",
              margin: 0,
              marginTop: "32px",
              fontWeight: 400,
            }}
          >
            {headingNode}
          </h2>

          {/* 4. Body */}
          <p
            style={{
              fontFamily: sans,
              fontSize: "14px",
              color: C.charcoal,
              lineHeight: 1.6,
              maxWidth: "320px",
              margin: 0,
              marginTop: "24px",
            }}
          >
            {content.description}
          </p>

          {/* 5. Phone — prominent */}
          <div style={{ marginTop: "48px" }}>
            <a
              href={phoneHref}
              style={{
                fontFamily: serif,
                fontSize: "28px",
                fontWeight: 400,
                color: C.dark,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                display: "block",
                lineHeight: 1.2,
                transition: "color 300ms ease-out",
              }}
            >
              {content.phone}
            </a>
            <span
              style={{
                fontFamily: sans,
                fontSize: "14px",
                color: C.charcoal,
                opacity: 0.7,
                display: "block",
                marginTop: "8px",
              }}
            >
              {content.phoneHours}
            </span>
          </div>

          {/* 6. Email */}
          <a
            href={`mailto:${content.email}`}
            style={{
              fontFamily: sans,
              fontSize: "13px",
              color: C.charcoal,
              textDecoration: "none",
              display: "inline-block",
              marginTop: "32px",
              transition: "color 300ms ease-out",
            }}
          >
            {content.email}
          </a>

          {/* 7. Address block */}
          <div style={{ marginTop: "64px" }}>
            <span
              style={{
                fontFamily: sans,
                fontSize: "13px",
                fontWeight: 500,
                color: C.dark,
                display: "block",
              }}
            >
              {content.companyName}
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                color: C.stone,
                display: "block",
                marginTop: "4px",
              }}
            >
              {content.companyTagline}
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                color: C.stone,
                display: "block",
                marginTop: "4px",
              }}
            >
              {content.address}
            </span>

            {/* "Auf Karte anzeigen" */}
            <button
              ref={openBtnRef}
              onClick={() => setMapOpen(true)}
              aria-expanded={mapOpen}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginTop: "16px",
                fontFamily: sans,
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.stone,
                transition: "color 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
            >
              <span>{content.mapLinkLabel}</span>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>

        {/* 8. Footer — anchored to bottom */}
        <div style={{ paddingTop: "32px" }}>
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: C.dark,
              opacity: 0.25,
              marginBottom: "24px",
            }}
          />
          <LegalLinksRow onOpenLegal={onOpenLegal} labels={legalLabels} />
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
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            backgroundColor: C.bg,
            border: `0.5px solid ${C.line}`,
            borderRadius: "12px",
            padding: "32px",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: C.stone,
              display: "block",
              textTransform: "uppercase",
            }}
          >
            {content.formHeading}
          </span>
          <div
            style={{
              width: "28px",
              height: "1.5px",
              backgroundColor: C.dark,
              marginTop: "12px",
              marginBottom: "24px",
            }}
          />
          <ContactForm labels={formLabels} />
        </div>
      </div>

      {/* ═══ OVERLAY — rendered via portal to document.body ═══ */}
      <MapOverlay
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        returnFocusRef={openBtnRef}
        address={content.address}
      />
    </div>
  );
}
