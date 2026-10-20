"use client";

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

import { presentationTool } from "sanity/presentation";

import { resolve } from "@/sanity/lib/resolve";

// The Solutions app is a separate Next.js deployment, normally served on this
// domain under /solutions (Multi-Zones rewrite), so it is same-origin and needs
// no allowlisting. Only when NEXT_PUBLIC_SOLUTIONS_URL is an absolute URL (a
// different origin) must that origin be allowlisted — `allowOrigins` is parsed
// with `new URLPattern()`, which throws on relative paths like "/solutions".
const SOLUTIONS_URL = process.env.NEXT_PUBLIC_SOLUTIONS_URL || "/solutions";
const SOLUTIONS_ORIGIN = /^https?:\/\//.test(SOLUTIONS_URL) ? new URL(SOLUTIONS_URL).origin : undefined;

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      ...(SOLUTIONS_ORIGIN && { allowOrigins: [SOLUTIONS_ORIGIN] }),
      previewUrl: {
        draftMode: {
          enable: "/api/draft-mode?secret=tellian-preview-secret-2026",
        },
      },
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
