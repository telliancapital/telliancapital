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

  // 02 — Philosophy
  philosophyEyebrow,
  philosophyHeadingLine1,
  philosophyHeadingLine2,
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

  // 04 — Strategy
  strategyEyebrow,
  strategyHeadingLine1,
  strategyHeadingLine2,
  strategyParagraphs,
  strategyCtaLabel,
  strategyDetailEyebrow,
  strategyDetailHeadingLine1,
  strategyDetailHeadingLine2,

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
 * Legacy contact-only query — still consumed by `Section6Kontakt` via
 * `useLiveQuery`. The fields are now localized; the component picks the
 * correct language with `pickLocale()` from the LanguageContext.
 */
export const CONTACT_QUERY = defineQuery(`*[_type == "homepage"][0]{
  "subheading": contactSubheading,
  "heading": contactHeading,
  "description": contactDescription,
  "formHeading": contactFormHeading,
  "formFirstName": contactFormFirstName,
  "formLastName": contactFormLastName,
  "formEmail": contactFormEmail,
  "formPhone": contactFormPhone,
  "formMessage": contactFormMessage,
  "formSubmit": contactFormSubmit,
  "formResponseTime": contactFormResponseTime,
  "formThanksTitle": contactFormThanksTitle,
  "formThanksBody": contactFormThanksBody,
  "companyName": contactCompanyName,
  "companyTagline": contactCompanyTagline,
  "address": contactAddress,
  "phone": contactPhone,
  "email": contactEmail,
  "mapLinkLabel": contactMapLinkLabel,
  "footerTagline": contactFooterTagline
}`);
