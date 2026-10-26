import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { previewSecret } from "@/sanity/env";

/* The main site's Studio enables draft mode through its own route and hands
   /solutions previews on to this one (the draft cookie is per app). The
   Studio's `sanity-preview-pathname` names the page being previewed. */
const PREVIEW_PATH = /^\/solutions\/(de|en|fr)(?:[/?#]|$)/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== previewSecret) {
    return new Response("Invalid secret", { status: 401 });
  }

  (await draftMode()).enable();
  // Land on the previewed page, else on the localized homepage so the
  // Studio's preview iframe hits a real page (no `/` → `/de` redirect chain).
  /* basePath: redirect() in a route handler is not prefixed. */
  const requested = searchParams.get("sanity-preview-pathname") ?? "";
  redirect(PREVIEW_PATH.test(requested) ? requested : "/solutions/de");
}
