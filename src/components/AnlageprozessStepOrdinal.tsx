import { motion } from "motion/react";

/* ═══════════════════════════════════════════════════════════
   Single step ordinal number, shared between Section3Timeline
   (main page, vertical stack on the right) and the detail-view
   overlay (horizontal stepper).
   Both instances share the same `layoutId` so Framer Motion
   animates the position change during the FLIP transition.
   ═══════════════════════════════════════════════════════════ */

/** Uniform ordinal size across both pages — avoids font-size interpolation. */
export const ORDINAL_FONT_SIZE = 80;

interface AnlageprozessStepOrdinalProps {
  /** "01" … "05" */
  num: string;
  /** Color of the digit (usually C.dark) */
  color?: string;
  /** Opacity of the digit */
  opacity?: number;
  /** Controls whether Framer Motion should treat this as the FLIP source/target.
   *  Set to false when the instance is purely decorative or reduced-motion is on. */
  enableFlip?: boolean;
  /** Optional layout-animation delay in seconds (staggered FLIP between steps). */
  layoutDelay?: number;
}

export function AnlageprozessStepOrdinal({
  num,
  color = "#1A1916",
  opacity = 0.2,
  enableFlip = true,
  layoutDelay = 0,
}: AnlageprozessStepOrdinalProps) {
  const serif = "'Cormorant Garamond', serif";

  const baseStyle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: `${ORDINAL_FONT_SIZE}px`,
    lineHeight: 0.9,
    fontWeight: 400,
    color,
    opacity,
    display: "block",
    userSelect: "none",
  };

  if (!enableFlip) {
    return <span style={baseStyle}>{num}</span>;
  }

  return (
    <motion.span
      layoutId={`anlageprozess-step-${num}`}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: layoutDelay,
      }}
      style={baseStyle}
    >
      {num}
    </motion.span>
  );
}
