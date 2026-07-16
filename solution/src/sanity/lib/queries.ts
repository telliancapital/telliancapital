import { defineQuery } from "next-sanity";

/**
 * Solutions site homepage — single document, shared Sanity project/dataset
 * with the main Tellian Capital site (schema type "solutionsHomepage" is
 * defined in that project's Studio). Three languages (DE/EN/FR), so every
 * `triLocaleString`/`triLocaleText` field resolves to `{ de, en, fr }`.
 */
export const SOLUTIONS_HOMEPAGE_QUERY = defineQuery(`*[_type == "solutionsHomepage"][0]{
  navItems[]{ label, sub },

  heroEyebrow,
  heroTaglineLine1,
  heroTaglineLine2,
  heroTaglineLine3,
  heroLeadSentence,
  heroClosingLine,

  servicesEyebrow,
  servicesHeadingLine1,
  servicesHeadingLine2,
  servicesIntro,
  servicesColumns[]{ title, body },

  teamEyebrow,
  teamHeadingLine1,
  teamHeadingLine2,
  teamSendMessageLabel,
  teamCtaLabel,
  teamMembers[]{
    name,
    role,
    email,
    linkedin,
    "imageAsset": image.asset->{ url },
    imageUrl
  },

  contactEyebrow,
  contactHeadingLine1,
  contactHeadingLine2,
  contactIntro,
  contactHours,
  contactFormEyebrow,
  contactFieldFirstName,
  contactFieldLastName,
  contactFieldEmail,
  contactFieldPhone,
  contactFieldMessage,
  contactSubmitLabel,
  contactResponseHint,
  contactPrivacyNotice,
  contactMapLink,
  contactThankYou,
  contactThankYouSub,
  contactPhone,
  contactEmailAddr,
  contactCompanyName,
  contactCompanySubtitle,
  contactAddressLine
}`);
