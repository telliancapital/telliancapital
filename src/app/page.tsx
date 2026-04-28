import { redirect } from "next/navigation";

/**
 * The homepage is rendered under `/[lang]` (e.g. `/de`, `/en`).
 * Visiting `/` always lands on the German variant; users switch language
 * via the sidebar buttons, which navigate to `/de` or `/en`.
 */
export default function Page() {
  redirect("/de");
}
