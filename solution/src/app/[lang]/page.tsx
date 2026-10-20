import Home from "../../Home";
import { SeoOutline } from "../../SeoOutline";
import { sanityFetch } from "@/sanity/lib/live";
import { SOLUTIONS_HOMEPAGE_QUERY } from "@/sanity/lib/queries";
import { publicSiteUrl } from "@/sanity/env";
import type { Locale } from "@/i18n/types";

/* Organization for this zone, linked to the main site's FinancialService
   (src/lib/seo.ts there: `${SITE_URL}/#organization`). */
function organizationJsonLd(lang: Locale) {
  const url = `${publicSiteUrl}/solutions/${lang}`;
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${publicSiteUrl}/solutions#organization`,
    name: "Tellian Capital Solutions",
    url,
    logo: `${publicSiteUrl}/logo.png`,
    image: `${publicSiteUrl}/og-image.png`,
    parentOrganization: { "@id": `${publicSiteUrl}/#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Löwenstrasse 1",
      postalCode: "8001",
      addressLocality: "Zürich",
      addressRegion: "ZH",
      addressCountry: "CH",
    },
    areaServed: { "@type": "Country", name: "Switzerland" },
    knowsLanguage: ["de", "en", "fr"],
  };
}

/* Unsupported languages never reach here: the [lang] layout sets
   dynamicParams = false with de/en/fr as static params. */
export default async function LocalizedHome({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Locale;
  const { data: homepage } = await sanityFetch({ query: SOLUTIONS_HOMEPAGE_QUERY });
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(lang)).replace(/</g, "\\u003c") }}
      />
      <Home homepage={homepage} outline={<SeoOutline homepage={homepage} lang={lang} />} />
    </>
  );
}
