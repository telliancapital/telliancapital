import { notFound } from "next/navigation";
import Home from "../../Home";
import { sanityFetch } from "@/sanity/lib/live";
import { SOLUTIONS_HOMEPAGE_QUERY } from "@/sanity/lib/queries";

const SUPPORTED_LANGS = ["de", "en", "fr"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function LocalizedHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as Lang)) notFound();

  const { data: homepage } = await sanityFetch({ query: SOLUTIONS_HOMEPAGE_QUERY });
  return <Home homepage={homepage} />;
}
