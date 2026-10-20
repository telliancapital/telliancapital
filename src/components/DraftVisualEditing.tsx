"use client";

import dynamic from "next/dynamic";

/* Sanity's click-to-edit overlay for the Studio's Presentation tool. A
   static import in the root layout made its code (comlink, xstate, …) part
   of every page's bundle, although it only renders in draft mode or dev —
   loaded on demand, regular visitors never download it. */
const VisualEditing = dynamic(() => import("next-sanity/visual-editing").then((m) => m.VisualEditing), {
  ssr: false,
});

export function DraftVisualEditing() {
  return <VisualEditing />;
}
