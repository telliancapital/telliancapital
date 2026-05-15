/**
 * Motion tokens — easing curves and durations.
 *
 * CSS strings for inline style={{ transition: `... ${EASE.standard}` }}.
 * Framer Motion arrays for <motion.div transition={{ ease: EASE.standardArr }}>.
 */

export const EASE = {
  /** Primary easing — ~80% of all animations (accent-lines, overlays, fades). */
  standard: "cubic-bezier(0.16, 1, 0.3, 1)",
  standardArr: [0.16, 1, 0.3, 1] as [number, number, number, number],

  /** Closing/collapsing — overlays, accordions. */
  in: "cubic-bezier(0.4, 0, 0.2, 1)",
  inArr: [0.4, 0, 0.2, 1] as [number, number, number, number],

  /** Navigation panel slide. */
  nav: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  navArr: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
} as const;

export const DURATION = {
  fast: 200,
  normal: 300,
  medium: 400,
  slow: 600,
  cinematic: 800,
} as const;
