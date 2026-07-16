import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/live";
import { FAQ_ALL_QUERY, SEO_QUERY } from "@/sanity/lib/queries";
import { faqJsonLd, resolveSeoMetadata } from "@/lib/seo";
import { pickLocale, type Lang, type LocaleValue } from "@/i18n/types";
import { C, sans, serif } from "@/tokens";
import { FaqContent, FaqEmptyState, type FaqGroup } from "./FaqContent";

/* Per-language URL mapping. Each route's metadata uses these to emit
   hreflang alternates so Google pairs the DE + EN variants. */
export const FAQ_PATHS: Record<Lang, string> = {
  de: "/faq",
  en: "/en/faq",
};

type CmsFaq = {
  _id: string;
  question?: LocaleValue;
  answer?: LocaleValue;
  page?: string | null;
  order?: number | null;
};

type FaqItem = { question: string; answer: string };

/* Display order of buckets on the page. Buckets without any published FAQ
   are filtered out before render. */
const BUCKET_ORDER = [
  "general",
  "home",
  "vermoegensverwaltung",
  "anlagestrategien",
  "kontakt",
] as const;

const BUCKET_HEADINGS: Record<(typeof BUCKET_ORDER)[number], { de: string; en: string }> = {
  general: { de: "Allgemein", en: "General" },
  home: { de: "Tellian Capital", en: "Tellian Capital" },
  vermoegensverwaltung: { de: "Vermögensverwaltung", en: "Wealth Management" },
  anlagestrategien: { de: "Anlagestrategien", en: "Investment Strategies" },
  kontakt: { de: "Kontakt", en: "Contact" },
};

const FALLBACK = {
  de: {
    title: "Häufige Fragen — Tellian Capital",
    description:
      "Antworten auf häufig gestellte Fragen zur Vermögensverwaltung, zu unseren Anlagestrategien und zur Zusammenarbeit mit Tellian Capital in Zürich.",
    eyebrow: "FAQ",
    heading: "Häufige Fragen",
    lead: "Eine Auswahl der Fragen, die uns am häufigsten gestellt werden — kurz, sachlich und unverbindlich beantwortet.",
    empty: "Aktuell sind keine FAQs veröffentlicht.",
    accordionLabel: "Häufige Fragen",
    backLabel: "Zurück zur Startseite",
    switchLabel: "EN",
    switchTitle: "Read in English",
  },
  en: {
    title: "FAQ — Tellian Capital",
    description:
      "Answers to common questions about wealth management, our investment strategies, and working with Tellian Capital in Zurich.",
    eyebrow: "FAQ",
    heading: "Frequently Asked Questions",
    lead: "A short, factual overview of the questions we are asked most often.",
    empty: "No FAQs are currently published.",
    accordionLabel: "Frequently Asked Questions",
    backLabel: "Back to homepage",
    switchLabel: "DE",
    switchTitle: "Auf Deutsch lesen",
  },
} as const;

function groupFaqs(faqs: readonly CmsFaq[], lang: Lang): FaqGroup[] {
  const buckets = new Map<string, FaqGroup>();

  for (const raw of faqs) {
    const page = (raw.page ?? "general") as (typeof BUCKET_ORDER)[number];
    const question = pickLocale(raw.question, lang);
    const answer = pickLocale(raw.answer, lang);
    if (!question || !answer) continue;

    if (!buckets.has(page)) {
      const fallback = BUCKET_HEADINGS[page] ?? BUCKET_HEADINGS.general;
      buckets.set(page, {
        page,
        heading: fallback[lang],
        items: [],
      });
    }
    const group = buckets.get(page)!;
    (group.items as FaqItem[]).push({ question, answer });
  }

  return BUCKET_ORDER.flatMap((key) => {
    const g = buckets.get(key);
    return g && g.items.length > 0 ? [g] : [];
  });
}

export async function buildFaqMetadata(lang: Lang): Promise<Metadata> {
  const { data: seo } = await sanityFetch({ query: SEO_QUERY, stega: false });
  return resolveSeoMetadata({
    seo: seo?.faq,
    fallback: { title: FALLBACK[lang].title, description: FALLBACK[lang].description },
    path: FAQ_PATHS[lang],
    lang,
    alternates: FAQ_PATHS,
  });
}

export async function FaqPageBody({ lang }: { lang: Lang }) {
  const { data } = await sanityFetch({ query: FAQ_ALL_QUERY });
  const faqs = (data ?? []) as CmsFaq[];
  const copy = FALLBACK[lang];

  const groups = groupFaqs(faqs, lang);
  const allItems: FaqItem[] = groups.flatMap((g) => g.items);
  const schema = faqJsonLd(allItems);

  const otherLang: Lang = lang === "de" ? "en" : "de";

  return (
    <main
      lang={lang}
      style={{
        /* The root layout locks <html> and <body> to height:100% so the SPA
           pages can manage their own scroll. Make this main its own scroll
           container so the FAQ page scrolls normally without touching the
           global layout. */
        height: "100%",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: C.bg,
        color: C.dark,
        padding: "clamp(64px, 10vh, 120px) clamp(24px, 6vw, 96px)",
      }}
    >
      {schema && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <article style={{ maxWidth: "780px", margin: "0 auto" }}>
        <header style={{ marginBottom: "56px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "16px",
                height: "1px",
                backgroundColor: C.muted,
              }}
            />
            <span
              style={{
                fontFamily: sans,
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: C.stone,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {copy.eyebrow}
            </span>

            {/* Language toggle — also gives crawlers a plain <a> to the other locale. */}
            <Link
              href={FAQ_PATHS[otherLang]}
              hrefLang={otherLang}
              title={copy.switchTitle}
              style={{
                marginLeft: "auto",
                fontFamily: sans,
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: C.charcoal,
                textTransform: "uppercase",
                textDecoration: "none",
                borderBottom: `1px solid ${C.line}`,
                paddingBottom: "2px",
              }}
            >
              {copy.switchLabel}
            </Link>
          </div>

          <h1
            style={{
              fontFamily: serif,
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 400,
              lineHeight: 1.05,
              color: C.dark,
              margin: 0,
            }}
          >
            {copy.heading}
          </h1>

          <p
            style={{
              marginTop: "20px",
              fontFamily: sans,
              fontSize: "16px",
              fontWeight: 300,
              lineHeight: 1.7,
              color: C.charcoal,
              maxWidth: "640px",
            }}
          >
            {copy.lead}
          </p>
        </header>

        {groups.length === 0 ? (
          <FaqEmptyState message={copy.empty} />
        ) : (
          <FaqContent groups={groups} accordionLabel={copy.accordionLabel} />
        )}

        <footer style={{ marginTop: "80px" }}>
          <Link
            href={lang === "en" ? "/en" : "/"}
            style={{
              fontFamily: sans,
              fontSize: "13px",
              letterSpacing: "0.02em",
              color: C.charcoal,
              textDecoration: "none",
              borderBottom: `1px solid ${C.line}`,
              paddingBottom: "2px",
            }}
          >
            ← {copy.backLabel}
          </Link>
        </footer>
      </article>
    </main>
  );
}
