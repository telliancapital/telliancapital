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

  // 05 — Team
  teamEyebrow,
  teamHeadingLine1,
  teamHeadingLine2,
  teamParagraphs,
  teamCtaLabel,
  teamMembers[]{
    name,
    role,
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
  contactCompanyName,
  contactCompanyTagline,
  contactAddress,
  contactPhone,
  contactEmail,
  contactMapLinkLabel,
  contactFooterTagline
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
  contactCompanyName,
  contactCompanyTagline,
  contactAddress,
  contactPhone,
  contactEmail,
  contactMapLinkLabel,
  contactFooterTagline
}`);
