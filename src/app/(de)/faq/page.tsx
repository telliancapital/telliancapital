import type { Metadata } from "next";
import { buildFaqMetadata, FaqPageBody } from "./_shared";

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return buildFaqMetadata("de");
}

export default function FaqPage() {
  return <FaqPageBody lang="de" />;
}
