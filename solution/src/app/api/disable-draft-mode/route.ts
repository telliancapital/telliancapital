import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  (await draftMode()).disable();
  /* basePath: redirect() in a route handler is not prefixed. */
  redirect("/solutions/de");
}
