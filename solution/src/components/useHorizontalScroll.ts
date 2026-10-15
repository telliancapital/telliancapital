import { useRef, useEffect, useCallback, useState } from "react";

// Organic cubic-bezier feel via lerp factor
const LERP_FACTOR = 0.065;
const WHEEL_MULTIPLIER = 1.0;

interface UseHorizontalScrollOptions {
  /** When true the hook becomes a no-op (vertical mode) */
  disabled?: boolean;
  /**
   * Liefert zur Trackposition (px) die aktive Station. Wird je Frame
   * aufgerufen, darf also nichts messen — nur rechnen. Fehlt sie,
   * bleibt activeIndex 0.
   */
  indexAt?: (scrollX: number, maxScroll: number) => number;
}

/* ── PERFORMANCE (14.10.) ──
   Vorher schrieb die Lerp-Schleife JEDEN Frame drei React-States
   (scrollX, scrollProgress, scrollDirection). Damit renderte HomeClient
   samt allen sechs Stationen 60-mal pro Sekunde neu — gemessen rund
   90 ms je Frame bei vierfach gedrosselter CPU, also Dauer-Ruckeln auf
   mittleren Geräten. Jetzt lebt die Position in Refs; nach aussen geht
   nur noch der Stationsindex, und der nur, wenn er sich ändert. */

export function useHorizontalScroll(opts?: UseHorizontalScrollOptions) {
  const disabled = opts?.disabled ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const rafId = useRef<number>(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const maxScroll = useRef(0);
  const touchStartX = useRef(0);
  const touchStartScroll = useRef(0);
  const [scrollDirection, setScrollDirection] = useState<"forward" | "backward" | "idle">("idle");
  const directionRef = useRef<"forward" | "backward" | "idle">("idle");
  const prevScroll = useRef(0);
  const directionTimer = useRef<number>(0);

  /* Immer die jüngste indexAt-Funktion, ohne die Schleife neu zu bauen. */
  const indexAt = opts?.indexAt;
  const indexAtRef = useRef(indexAt);
  useEffect(() => {
    indexAtRef.current = indexAt;
  }, [indexAt]);

  // Scroll-lock: when true, wheel/touch/key events skip updating targetScroll.
  const scrollLockRef = useRef(false);

  const updateMaxScroll = useCallback(() => {
    if (!containerRef.current) return;
    maxScroll.current = containerRef.current.scrollWidth - containerRef.current.clientWidth;
  }, []);

  const clampTarget = useCallback(() => {
    targetScroll.current = Math.max(0, Math.min(targetScroll.current, maxScroll.current));
  }, []);

  // Smooth animation loop using lerp
  const animate = useCallback(function loop() {
    const diff = targetScroll.current - currentScroll.current;

    // Only update if the difference is meaningful
    if (Math.abs(diff) > 0.5) {
      currentScroll.current += diff * LERP_FACTOR;
    } else {
      currentScroll.current = targetScroll.current;
    }

    /* Nur schreiben, wenn sich die Position wirklich bewegt — ein
       scrollLeft-Schreibzugriff im Stillstand kostet trotzdem Arbeit. */
    const delta = currentScroll.current - prevScroll.current;
    const bewegt = Math.abs(delta) > 0.01;
    if (bewegt && containerRef.current) {
      containerRef.current.scrollLeft = currentScroll.current;
    }

    if (maxScroll.current > 0) {
      /* Aktive Station: React erfährt nur den Wechsel. */
      const idx = indexAtRef.current ? indexAtRef.current(currentScroll.current, maxScroll.current) : 0;
      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveIndex(idx);
      }

      // Track scroll direction with a small threshold to avoid jitter
      if (Math.abs(delta) > 0.3) {
        const dir = delta > 0 ? "forward" : "backward";
        if (dir !== directionRef.current) {
          directionRef.current = dir;
          setScrollDirection(dir);
        }
        clearTimeout(directionTimer.current);
        directionTimer.current = window.setTimeout(() => {
          directionRef.current = "idle";
          setScrollDirection("idle");
        }, 400);
      }
    }
    prevScroll.current = currentScroll.current;

    rafId.current = requestAnimationFrame(loop);
  }, []);

  // Navigate to a specific progress (0-1)
  const scrollTo = useCallback(
    (progress: number) => {
      updateMaxScroll();
      targetScroll.current = progress * maxScroll.current;
      clampTarget();
    },
    [updateMaxScroll, clampTarget],
  );

  useEffect(() => {
    /* ── Vertical mode: no horizontal hijack ── */
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    updateMaxScroll();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLockRef.current) return;
      updateMaxScroll();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetScroll.current += delta * WHEEL_MULTIPLIER;
      clampTarget();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartScroll.current = targetScroll.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (scrollLockRef.current) return;
      const diff = touchStartX.current - e.touches[0].clientX;
      targetScroll.current = touchStartScroll.current + diff * 1.5;
      clampTarget();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (scrollLockRef.current) return;
      updateMaxScroll();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetScroll.current += window.innerWidth * 0.6;
        clampTarget();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetScroll.current -= window.innerWidth * 0.6;
        clampTarget();
      }
    };

    const handleResize = () => {
      updateMaxScroll();
      clampTarget();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    // Start animation loop
    rafId.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId.current);
    };
  }, [disabled, animate, updateMaxScroll, clampTarget]);

  return {
    containerRef,
    /** Aktive Station — wechselt nur, wenn sich der Index ändert. */
    activeIndex,
    scrollTo,
    scrollDirection,
    scrollLockRef,
    targetScroll,
    currentScroll,
    disabled,
  };
}
