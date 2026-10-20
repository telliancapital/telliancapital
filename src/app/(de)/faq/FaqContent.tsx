"use client";

import { FaqAccordion, type FaqItem } from "@/components/FaqAccordion";
import { C, sans, serif } from "@/tokens";

/**
 * One section per page bucket, each rendering its own FaqAccordion.
 *
 * Marked `"use client"` only because FaqAccordion is interactive. Everything
 * else (the heading, the lead paragraph, the JSON-LD script in the parent
 * server component) is server-rendered, so the FAQs are fully indexable
 * before any JS executes.
 */
export interface FaqGroup {
  /** Bucket key from the Sanity `page` enum. */
  page: string;
  /** Localized section heading shown above the accordion. */
  heading: string;
  items: readonly FaqItem[];
}

interface FaqContentProps {
  groups: readonly FaqGroup[];
  accordionLabel: string;
}

export function FaqContent({ groups, accordionLabel }: FaqContentProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
      {groups.map((group) => (
        <section
          key={group.page}
          aria-labelledby={`faq-group-${group.page}`}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <h2
            id={`faq-group-${group.page}`}
            style={{
              fontFamily: serif,
              fontSize: "clamp(28px, 3vw, 36px)",
              fontWeight: 400,
              color: C.dark,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {group.heading}
          </h2>
          <FaqAccordion
            items={group.items}
            schemaId={`faq-${group.page}`}
            label={accordionLabel}
            headingLevel={3}
            defaultOpenIndex={null}
          />
        </section>
      ))}
    </div>
  );
}

export function FaqEmptyState({ message }: { message: string }) {
  return (
    <p
      style={{
        fontFamily: sans,
        fontSize: "14px",
        color: C.stone,
        lineHeight: 1.7,
        margin: 0,
      }}
    >
      {message}
    </p>
  );
}
