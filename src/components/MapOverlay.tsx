"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
/* mapbox-gl is dynamic-imported inside ZurichMap below to keep it out of the
   main bundle. The map only renders when the user opens the overlay. */
import type mapboxgl from "mapbox-gl";
import { C, sans } from "@/tokens";

/* Split out of Section6Kontakt.tsx: StationKontakt only needs the map
   overlay, and importing it from there also bundled @sanity/preview-kit
   (useLiveQuery) for every visitor. */

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

export function MapOverlay({ open, onClose, returnFocusRef, address }: MapOverlayProps) {
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
