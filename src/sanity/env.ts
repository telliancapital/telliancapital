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
 * Public URL of the Tellian Capital Solutions site — used for the
 * "Solutions" links in Navigation.tsx, Section6Kontakt.tsx, StationKontakt.tsx
 * and HomeClient.tsx. Since the Multi-Zones setup (next.config.ts rewrites)
 * Solutions is served on THIS domain under /solutions, so the default is the
 * relative path. Override with NEXT_PUBLIC_SOLUTIONS_URL only if Solutions
 * should open on another origin again.
 */
export const solutionsSiteUrl = process.env.NEXT_PUBLIC_SOLUTIONS_URL || "/solutions";

/**
 * URL of the Tellian Capital client portal login page — used by the
 * "Login" button in Navigation.tsx. Override with NEXT_PUBLIC_LOGIN_URL
 * in .env.local if the portal deployment changes.
 */
export const loginUrl =
  process.env.NEXT_PUBLIC_LOGIN_URL || "https://telliancapitalportal.9a8da0f.deploio.app/login";

/**
 * Portal links shown in the LoginOverlay popup (Kundenportal button) —
 * override with NEXT_PUBLIC_PORTAL_KUNDE_URL / _PARTNER_URL / _MITARBEITER_URL
 * in .env.local if any of the portal deployments change.
 */
export const portalKundeUrl =
  process.env.NEXT_PUBLIC_PORTAL_KUNDE_URL;
export const portalPartnerUrl =
  process.env.NEXT_PUBLIC_PORTAL_PARTNER_URL;
export const portalMitarbeiterUrl =
  process.env.NEXT_PUBLIC_PORTAL_MITARBEITER_URL;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}
