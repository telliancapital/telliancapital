/* ═══════════════════════════════════════════════════════════
   ZWEI-ZEILEN-REGEL
   Überschriften (h1, h2) stehen auf höchstens zwei Zeilen. Bricht
   eine auf drei oder mehr um, wird ihre Schrift schrittweise
   verkleinert (höchstens bis 60 %, nie unter 18px). Ausnahme per
   data-zeilen-frei. Nur im Browser aufrufen.
   ═══════════════════════════════════════════════════════════ */

const MAX_ZEILEN = 2;
const MIN_FAKTOR = 0.6;
const MIN_PX = 18;
const SCHRITT = 0.03;

function zeilen(el: HTMLElement): number {
  const tops: number[] = [];
  const lh = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.textContent || !n.textContent.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 1) continue;
      if (!tops.some((t) => Math.abs(t - r.top) < lh)) tops.push(r.top);
    }
  }
  return tops.length;
}

function anpassen(el: HTMLElement) {
  if (el.hasAttribute("data-zeilen-frei") || el.offsetParent === null) return;
  const original = el.dataset.zzOriginal ?? el.style.fontSize;
  el.dataset.zzOriginal = original;
  el.style.fontSize = original;
  if (zeilen(el) <= MAX_ZEILEN) return;
  const basis = parseFloat(getComputedStyle(el).fontSize);
  const minF = Math.max(MIN_FAKTOR, Math.min(1, MIN_PX / basis));
  let f = 1;
  while (f > minF) {
    f = Math.max(minF, f - SCHRITT);
    el.style.fontSize = `${(basis * f).toFixed(2)}px`;
    if (zeilen(el) <= MAX_ZEILEN) break;
  }
}

/** Startet die Regel; gibt eine Aufräumfunktion zurück. */
export function zweiZeilenRegel(): () => void {
  const beobachtet = new WeakSet<Element>();
  let geplant = 0;
  const ro = new ResizeObserver((eintraege) => {
    for (const e of eintraege) anpassen(e.target as HTMLElement);
  });
  const alle = () => {
    cancelAnimationFrame(geplant);
    geplant = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("h1, h2").forEach((el) => {
        if (!beobachtet.has(el)) {
          beobachtet.add(el);
          ro.observe(el);
        }
        anpassen(el);
      });
    });
  };
  const mo = new MutationObserver(alle);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("resize", alle);
  document.fonts?.ready.then(alle).catch(() => {});
  alle();
  return () => {
    cancelAnimationFrame(geplant);
    mo.disconnect();
    ro.disconnect();
    window.removeEventListener("resize", alle);
  };
}
