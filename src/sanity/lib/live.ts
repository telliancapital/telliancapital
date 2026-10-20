import "server-only";

import { validateApiPerspective, type ClientPerspective, type QueryParams } from "@sanity/client";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { cookies, draftMode } from "next/headers";
import { client as baseClient } from "./client";

import { readToken } from "../env";

/* Server-side equivalent of next-sanity's `defineLive().sanityFetch`
   (next-sanity 12.3, dist/live.js) — same draft-mode perspective, stega,
   token, CDN and cache-tag handling. `defineLive` itself is not used
   because its module imports the <SanityLive> client components, which
   made Next ship @sanity/client, comlink and xstate (~60 KB gz) to every
   visitor although <SanityLive> is never rendered here. If live updates
   are wanted later, switch back to `defineLive` and render <SanityLive />. */

const client = baseClient.withConfig({ allowReconfigure: false, useCdn: false });
const { token: originalToken } = client.config();
const studioUrlDefined = typeof client.config().stega.studioUrl !== "undefined";

async function resolveCookiePerspective(): Promise<ClientPerspective> {
  if (!(await draftMode()).isEnabled) return "published";
  const jar = await cookies();
  if (!jar.has(perspectiveCookieName)) return "drafts";
  const raw = jar.get(perspectiveCookieName)?.value;
  const perspective = typeof raw === "string" && raw.includes(",") ? raw.split(",") : raw;
  try {
    validateApiPerspective(perspective);
    return perspective === "raw" ? "drafts" : (perspective as ClientPerspective);
  } catch (err) {
    console.warn("Invalid perspective:", raw, err);
    return "drafts";
  }
}

export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  stega: _stega,
  tags = [],
  perspective: _perspective,
  tag = "next-loader.fetch",
}: {
  query: Q;
  params?: QueryParams;
  stega?: boolean;
  tags?: string[];
  perspective?: ClientPerspective;
  tag?: string;
}) {
  const stega = _stega ?? (studioUrlDefined && (await draftMode()).isEnabled);
  const perspective = _perspective ?? (await resolveCookiePerspective());
  const useCdn = perspective === "published";
  const revalidate = process.env.NODE_ENV === "production" ? false : undefined;
  const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
  const cacheMode = useCdn && !isBuildPhase ? ("noStale" as const) : undefined;

  const { syncTags } = await client.fetch(query, params, {
    filterResponse: false,
    perspective,
    stega: false,
    returnQuery: false,
    next: { revalidate, tags: [...tags, "sanity:fetch-sync-tags"] },
    useCdn,
    cacheMode,
    tag: [tag, "fetch-sync-tags"].join("."),
  });
  const cacheTags = [...tags, ...(syncTags?.map((t) => `sanity:${t}`) ?? [])];

  const { result, resultSourceMap } = await client.fetch(query, params, {
    filterResponse: false,
    perspective,
    stega,
    token: perspective !== "published" && readToken ? readToken : originalToken,
    next: { revalidate, tags: cacheTags },
    useCdn,
    cacheMode,
    tag,
  });

  return { data: result, sourceMap: resultSourceMap || null, tags: cacheTags };
}
