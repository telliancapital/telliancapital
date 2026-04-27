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
  redirect("/");
}
