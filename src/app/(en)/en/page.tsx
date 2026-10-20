import type { Metadata } from "next";
import { homeMetadata, LocalizedHomepage } from "../../_site/home";

export function generateMetadata(): Promise<Metadata> {
  return homeMetadata("en");
}

export default function HomepageEn() {
  return <LocalizedHomepage lang="en" />;
}
