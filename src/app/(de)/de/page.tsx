import type { Metadata } from "next";
import { homeMetadata, LocalizedHomepage } from "../../_site/home";

export function generateMetadata(): Promise<Metadata> {
  return homeMetadata("de");
}

export default function HomepageDe() {
  return <LocalizedHomepage lang="de" />;
}
