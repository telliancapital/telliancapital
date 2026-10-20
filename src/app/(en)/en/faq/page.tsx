import type { Metadata } from "next";
import { buildFaqMetadata, FaqPageBody } from "@/app/(de)/faq/_shared";

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return buildFaqMetadata("en");
}

export default function FaqPageEn() {
  return <FaqPageBody lang="en" />;
}
