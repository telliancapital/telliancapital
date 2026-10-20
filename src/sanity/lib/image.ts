import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

/** Widths offered in srcSet for full-bleed / half-width CMS images. */
/* Fine steps so phones (DPR 2–3) land close to the rendered size. */
const STUFEN = [480, 640, 828, 1080, 1280, 1600, 1920] as const;

/**
 * src + srcSet for a CMS image given as its plain CDN URL (the queries fetch
 * `asset->{ url }`). Without parameters the CDN sends the original upload —
 * the hero was ~500 KB that way; with w/auto=format it sends a resized
 * AVIF/WebP. Non-Sanity URLs (external URL field, bundled fallback) are
 * returned unchanged with no srcSet.
 */
export function responsiveImage(url: string, widths: readonly number[] = STUFEN): { src: string; srcSet?: string } {
  if (!url.startsWith("https://cdn.sanity.io/images/")) return { src: url };
  const at = (w: number) => {
    const u = new URL(url);
    u.searchParams.set("w", String(w));
    u.searchParams.set("fit", "max");
    u.searchParams.set("auto", "format");
    u.searchParams.set("q", "65");
    return u.toString();
  };
  return {
    src: at(widths[Math.min(3, widths.length - 1)]),
    srcSet: widths.map((w) => `${at(w)} ${w}w`).join(", "),
  };
}
