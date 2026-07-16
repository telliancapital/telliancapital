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

// The Solutions app is a separate Next.js deployment (different origin/port
// in dev). The Presentation tool's preview iframe only allows same-origin
// frontends by default — any other origin used in `resolve.ts` locations
// must be explicitly allowlisted here, or the preview silently refuses to load.
const SOLUTIONS_URL = process.env.NEXT_PUBLIC_SOLUTIONS_URL || "http://localhost:3100";

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
      allowOrigins: [SOLUTIONS_URL],
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
