import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { previewSecret } from "@/sanity/env";

/* Multi-Zones: /solutions/* is served by the separate Solutions app (rewrite
   in next.config.ts). Next derives the draft-mode cookie value per app, so
   enabling draft mode here does nothing for that zone — its pages would
   keep showing published content in the Studio's Presentation tool. The
   Studio appends `sanity-preview-pathname` (the page being previewed) to
   this route; a /solutions path is therefore handed on to the zone's own
   enable route, which sets its cookie and lands on the requested page. */
const SOLUTIONS_PREFIX = "/solutions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== previewSecret) {
    return new Response("Invalid secret", { status: 401 });
  }

  const previewPathname = searchParams.get("sanity-preview-pathname") ?? "";
  if (previewPathname === SOLUTIONS_PREFIX || previewPathname.startsWith(`${SOLUTIONS_PREFIX}/`)) {
    const params = new URLSearchParams({ secret, "sanity-preview-pathname": previewPathname });
    redirect(`${SOLUTIONS_PREFIX}/api/draft-mode?${params}`);
  }

  (await draftMode()).enable();
  // Redirect straight to the localized homepage so the Studio's preview
  // iframe lands on a real page (no `/` → `/de` redirect chain).
  redirect("/de");
}
