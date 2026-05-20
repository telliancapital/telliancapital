import { type SchemaTypeDefinition } from "sanity";
import { homepageType } from "./homepage";
import { localeString } from "./localeString";
import { localeText } from "./localeText";
import { seoMeta } from "./seoMeta";
import { faqType } from "./faq";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homepageType, localeString, localeText, seoMeta, faqType],
};
