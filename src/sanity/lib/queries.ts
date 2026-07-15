import { defineQuery } from "next-sanity";

/**
 * Returns the full homepage document with every locale field.
 * Each `localeString` / `localeText` value is shaped as { de, en }.
 * Components pick the correct language client-side via the
 * LanguageContext + `pickLocale()` helper.
 */
export const HOMEPAGE_QUERY = defineQuery(`*[_type == "homepage"][0]{
  title,

  // 01 — Start
  startEyebrow,
  startHeadingLine1,
  startHeadingLine2,
  startCtaLabel,
  startBottomLabel,
  "startImageAsset": startImage.asset->{ url },
  startImageUrl,
  startImageAlt,

  // 02 — Philosophy
  philosophyEyebrow,
  philosophyHeadingLine1,
  philosophyHeadingLine2,
  "philosophyImageAsset": philosophyImage.asset->{ url },
  philosophyImageUrl,
  philosophyImageAlt,
  philosophyQuote,
  philosophyParagraphs,
  philosophyValuesLabel,
  philosophyValues[]{ name, readout },

  // 03 — Method
  methodEyebrow,
  methodHeadingLine1,
  methodHeadingLine2,
  methodHeadingLine3,
  methodParagraphs,
  methodCtaLabel,
  methodDetailEyebrow,
  methodDetailHeadingLine1,
  methodDetailHeadingLine2,
  methodTimelineSteps[]{ title, description },
  methodTimelineDividerLabel,
  methodTimelineFooterLabel,
  methodPartiesCaption,
  methodPartyKundeLabel,
  methodPartyKundeProsa,
  methodPartyTellianLabel,
  methodPartyTellianProsa,
  methodPartyBankenLabel,
  methodPartyBankenProsa,
  methodEdgeLabelAuftrag,
  methodEdgeLabelDepot,
  methodEdgeLabelVollmacht,
  methodDetailSteps[]{
    shortLabel,
    eyebrow,
    headline,
    subline,
    body,
    bullets,
    closing
  },
  methodFaqItems[]{ question, answer },
  methodDetailCtaEyebrow,
  methodDetailCtaHeadingLine1,
  methodDetailCtaHeadingLine2,
  methodDetailCtaDescription,
  methodDetailCtaButtonLabel,
  methodDetailFooterTagline,

  // 04 — Strategy
  strategyEyebrow,
  strategyHeadingLine1,
  strategyHeadingLine2,
  strategyParagraphs,
  strategyCtaLabel,
  strategyFlowchartTier1,
  strategyFlowchartConnectorLabel,
  strategyFlowchartTier2,
  strategyFlowchartTier3,
  strategyFlowchartTier4,
  strategyFlowchartTier5,
  strategyDetailEyebrow,
  strategyDetailHeadingLine1,
  strategyDetailHeadingLine2,
  strategyTopDownEyebrow,
  strategyTopDownTitle,
  strategyTopDownBullets,
  strategyDecisionLabel,
  strategyCommitteeLabel,
  strategyBottomUpEyebrow,
  strategyBottomUpTitle,
  strategyBottomUpBullets,
  strategyTopDownDetailEyebrow,
  strategyTopDownDetailSubline,
  strategyTopDownDetailBody,
  strategyTopDownDetailBullets,
  strategyTopDownDetailClosing,
  strategyBottomUpDetailEyebrow,
  strategyBottomUpDetailSubline,
  strategyBottomUpDetailBody,
  strategyBottomUpDetailBullets,
  strategyBottomUpDetailClosing,
  strategyFaqItems[]{ question, answer },
  strategyDetailCtaEyebrow,
  strategyDetailCtaHeadingPrefix,
  strategyDetailCtaHeadingItalic,
  strategyDetailCtaHeadingSuffix,
  strategyDetailCtaDescription,
  strategyDetailCtaButtonLabel,
  strategyDetailFooterTagline,

  // 05 — Team
  teamEyebrow,
  teamHeadingLine1,
  teamHeadingLine2,
  teamParagraphs,
  teamCtaLabel,
  teamMembers[]{
    name,
    role,
    email,
    linkedin,
    bio,
    "imageAsset": image.asset->{ url },
    imageUrl
  },

  // 06 — Contact
  contactSubheading,
  contactHeading,
  contactDescription,
  contactFormHeading,
  contactFormFirstName,
  contactFormLastName,
  contactFormEmail,
  contactFormPhone,
  contactFormMessage,
  contactFormSubmit,
  contactFormResponseTime,
  contactFormThanksTitle,
  contactFormThanksBody,
  contactPrivacyPrefix,
  contactPrivacyLinkLabel,
  contactPrivacySuffix,
  contactCompanyName,
  contactCompanyTagline,
  contactAddress,
  contactPhone,
  contactPhoneHours,
  contactEmail,
  contactMapLinkLabel,
  contactFooterTagline,

  // 07 — Legal pages (Impressum / Datenschutz / Kundeninformation)
  legalImpressumLinkLabel,
  legalImpressumTitle,
  legalImpressumUpdated,
  legalImpressumSections[]{ heading, paragraphs, list },
  legalDatenschutzLinkLabel,
  legalDatenschutzTitle,
  legalDatenschutzUpdated,
  legalDatenschutzSections[]{ heading, paragraphs, list },
  legalKundeninformationLinkLabel,
  legalKundeninformationTitle,
  legalKundeninformationUpdated,
  legalKundeninformationSections[]{ heading, paragraphs, list },

  // 08 — Sidebar / Navigation
  navBrandPrimary,
  navBrandSecondary,
  navItems[]{ label, sub },
  navLoginButtonLabel,
  navKundenportalLabel,
  navKundenportalCaption,

  // 10 — Portfolio Management
  pmDetailEyebrow,
  pmDetailHeadingLine1,
  pmDetailHeadingLine2,
  pmIntroParagraphs,
  pmProcessEyebrow,
  pmProcessHeadingLine1,
  pmProcessHeadingLine2,
  pmProcessClosing,
  pmProcessStages[]{ name, bullets },
  pmCommitteeEyebrow,
  pmCommitteeHeadingLine1,
  pmCommitteeHeadingLine2,
  pmCommitteeParagraphs,
  pmStrategiesEyebrow,
  pmStrategiesHeadingLine1,
  pmStrategiesHeadingLine2,
  pmStrategiesSubline,
  pmStrategies[]{ name, tag, goal, volatility, allocation, allocationLegend, focus },
  pmUniverseEyebrow,
  pmUniverseHeadingLine1,
  pmUniverseHeadingLine2,
  pmUniverseParagraphs,
  pmCtaEyebrow,
  pmCtaHeadingLine1,
  pmCtaHeadingLine2,
  pmCtaDescription,
  pmCtaButtonLabel,
  pmFooterTagline
}`);

/**
 * All published FAQs across every page bucket, ordered by `page` then `order`.
 * Used by the dedicated /faq page (which groups client-side by the `page`
 * field) and by the FAQ JSON-LD emitter.
 */
export const FAQ_ALL_QUERY = defineQuery(`*[
  _type == "faq" && isPublished == true
] | order(page asc, order asc, _createdAt asc){
  _id,
  question,
  answer,
  page,
  order
}`);

/**
 * Published FAQs for a single page bucket, e.g. "vermoegensverwaltung".
 * Accepts `$page` as a GROQ parameter.
 */
export const FAQ_BY_PAGE_QUERY = defineQuery(`*[
  _type == "faq" && isPublished == true && page == $page
] | order(order asc, _createdAt asc){
  _id,
  question,
  answer,
  page,
  order
}`);

/**
 * SEO-only query — returns just the per-page meta tag blocks from the
 * homepage doc, so `generateMetadata` doesn't have to fetch the full
 * document. Each block follows the `seoMeta` schema: localized title /
 * description (`{ de, en }`), a flat keywords array, and an optional
 * Open Graph image (the asset URL is resolved with `->`).
 */
export const SEO_QUERY = defineQuery(`*[_type == "homepage"][0]{
  "home": seoHome{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  },
  "vermoegensverwaltung": seoVermoegensverwaltung{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  },
  "anlagestrategien": seoAnlagestrategien{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  },
  "impressum": seoImpressum{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  },
  "datenschutz": seoDatenschutz{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  },
  "kundeninformation": seoKundeninformation{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  },
  "faq": seoFaq{
    title,
    description,
    keywords,
    "ogImageUrl": ogImage.asset->url
  }
}`);

/**
 * Contact-only query, used by `Section6Kontakt` for in-Studio live preview.
 * Returns the same field names as the homepage doc so the component can
 * read identical keys whether the data comes from `initialData` (full doc
 * passed by the page) or from the live query subscription.
 */
export const CONTACT_QUERY = defineQuery(`*[_type == "homepage"][0]{
  contactSubheading,
  contactHeading,
  contactDescription,
  contactFormHeading,
  contactFormFirstName,
  contactFormLastName,
  contactFormEmail,
  contactFormPhone,
  contactFormMessage,
  contactFormSubmit,
  contactFormResponseTime,
  contactFormThanksTitle,
  contactFormThanksBody,
  contactPrivacyPrefix,
  contactPrivacyLinkLabel,
  contactPrivacySuffix,
  contactCompanyName,
  contactCompanyTagline,
  contactAddress,
  contactPhone,
  contactPhoneHours,
  contactEmail,
  contactMapLinkLabel,
  contactFooterTagline
}`);
