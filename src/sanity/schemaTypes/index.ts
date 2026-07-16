import { type SchemaTypeDefinition } from "sanity";
import { homepageType } from "./homepage";
import { localeString } from "./localeString";
import { localeText } from "./localeText";
import { triLocaleString } from "./triLocaleString";
import { triLocaleText } from "./triLocaleText";
import { seoMeta } from "./seoMeta";
import { faqType } from "./faq";
import { solutionsHomepageType } from "./solutionsHomepage";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    homepageType,
    localeString,
    localeText,
    triLocaleString,
    triLocaleText,
    seoMeta,
    faqType,
    solutionsHomepageType,
  ],
};
