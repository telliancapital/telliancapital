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
 * Base URL of the Tellian Capital Solutions site (separate Next.js
 * deployment) — used for the public "Tellian Capital Solutions" links in
 * Navigation.tsx and Section6Kontakt.tsx. Defaults to the deployed Vercel
 * URL; override with NEXT_PUBLIC_SOLUTIONS_URL in .env.local (e.g. a local
 * dev port) when running both apps side by side.
 */
export const solutionsSiteUrl =
  process.env.NEXT_PUBLIC_SOLUTIONS_URL || "https://solution-telliancapital.vercel.app";

/**
 * URL of the Tellian Capital client portal login page — used by the
 * "Login" button in Navigation.tsx. Override with NEXT_PUBLIC_LOGIN_URL
 * in .env.local if the portal deployment changes.
 */
export const loginUrl =
  process.env.NEXT_PUBLIC_LOGIN_URL || "https://telliancapitalportal.9a8da0f.deploio.app/login";

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}
