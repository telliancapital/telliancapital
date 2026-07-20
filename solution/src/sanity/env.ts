export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-04-24";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const readToken = process.env.SANITY_API_READ_TOKEN;
export const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET;

/**
 * Base URL of the main Tellian Capital site. Used both for the public links
 * scattered across the UI (footer "Tellian Capital" link, Datenschutz /
 * Kundeninformation links) and to build the Studio URL below. Defaults to
 * the real production domain; override with NEXT_PUBLIC_MAIN_SITE_URL in
 * .env.local (e.g. "http://localhost:3000") when running both apps locally.
 */
export const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://telliancapital.ch";

/**
 * The main Tellian Capital site's Studio lives in the other project — this
 * app has no Studio of its own, so stega click-to-edit links point there.
 */
export const mainSiteStudioUrl = `${mainSiteUrl}/studio`;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}
