import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { previewSecret } from "@/sanity/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== previewSecret) {
    return new Response("Invalid secret", { status: 401 });
  }

  (await draftMode()).enable();
  // Redirect straight to the localized homepage so the Studio's preview
  // iframe lands on a real page (no `/` → `/de` redirect chain).
  redirect("/de");
}
