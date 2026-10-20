import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

/* DE/EN pairs share one hreflang map. The Solutions zone (/solutions/*) is a
   separate deployment served on this domain, so its pages are listed here
   too — it has no sitemap of its own. */
function pair(
  de: string,
  en: string,
  changeFrequency: Entry["changeFrequency"],
  priority: [number, number],
): Entry[] {
  const languages = { "de-CH": `${SITE_URL}${de}`, "en-US": `${SITE_URL}${en}` };
  return [
    { url: `${SITE_URL}${de}`, changeFrequency, priority: priority[0], alternates: { languages } },
    { url: `${SITE_URL}${en}`, changeFrequency, priority: priority[1], alternates: { languages } },
  ];
}

function single(path: string, changeFrequency: Entry["changeFrequency"], priority: number): Entry {
  return { url: `${SITE_URL}${path}`, changeFrequency, priority };
}

const SOLUTIONS_LANGS = { "de-CH": "de", "en-US": "en", "fr-CH": "fr" } as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const solutionsLanguages = Object.fromEntries(
    Object.entries(SOLUTIONS_LANGS).map(([hreflang, l]) => [hreflang, `${SITE_URL}/solutions/${l}`]),
  );

  return [
    ...pair("/de", "/en", "weekly", [1, 0.9]),
    single("/vermoegensverwaltung", "monthly", 0.8),
    single("/anlagestrategien", "monthly", 0.8),
    single("/portfolio-management", "monthly", 0.8),
    ...pair("/faq", "/en/faq", "weekly", [0.7, 0.6]),
    ...Object.values(SOLUTIONS_LANGS).map((l) => ({
      url: `${SITE_URL}/solutions/${l}`,
      changeFrequency: "monthly" as const,
      priority: l === "de" ? 0.8 : 0.7,
      alternates: { languages: solutionsLanguages },
    })),
    /* /impressum is temporarily disabled (LegalPage.tsx TEMP_DISABLED_LEGAL_PATHS)
       and noindexed — add it back here when it is re-enabled. */
    single("/datenschutz", "yearly", 0.3),
    single("/kundeninformation", "yearly", 0.3),
  ];
}
