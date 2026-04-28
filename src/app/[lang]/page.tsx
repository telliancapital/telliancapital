import { notFound } from "next/navigation";
import HomeClient from "../HomeClient";
import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";

const SUPPORTED_LANGS = ["de", "en"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function LocalizedHomepage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as Lang)) notFound();

  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });
  return <HomeClient homepage={homepage} />;
}
