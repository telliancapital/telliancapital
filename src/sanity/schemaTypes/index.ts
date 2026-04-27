import { type SchemaTypeDefinition } from "sanity";
import { homepageType } from "./homepage";
import { localeString } from "./localeString";
import { localeText } from "./localeText";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homepageType, localeString, localeText],
};
