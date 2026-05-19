"use client";

import { useId, useState } from "react";

const sans = "'Inter', sans-serif";
const serif = "'Cormorant Garamond', serif";

const C = {
  dark: "#1A1916",
  charcoal: "#3A3835",
  stone: "#8A857C",
  muted: "#B0ACA5",
  line: "#D8D5CF",
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Accessibility / DOM id namespace for the heading. Required so multiple
      FAQ blocks on the same page never share a heading id. */
  schemaId: string;
  /** Uppercase label rendered above the list. Default: "Häufige Fragen". */
  label?: string;
  /** Index of the row open on first render. `null` keeps everything closed. */
  defaultOpenIndex?: number | null;
  /** Heading level used by screen readers for the label. */
  headingLevel?: 2 | 3 | 4;
}

/**
 * Server-friendly accordion for FAQ rows. The accompanying `FAQPage` JSON-LD
 * is emitted by the parent server component via `faqJsonLd()` so it ships
 * with the initial HTML — Google does not have to execute JS to see it.
 */
export function FaqAccordion({
  items,
  schemaId,
  label = "Häufige Fragen",
  defaultOpenIndex = 0,
  headingLevel = 2,
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultOpenIndex);

  if (items.length === 0) return null;

  const headingId = `faq-heading-${schemaId}`;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <section aria-labelledby={headingId}>
      {/* Label — accent line + uppercase meta label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "16px",
            height: "1px",
            backgroundColor: C.muted,
            flexShrink: 0,
          }}
        />
        <Heading
          id={headingId}
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: C.stone,
            textTransform: "uppercase",
            fontWeight: 500,
            margin: 0,
          }}
        >
          {label}
        </Heading>
      </div>

      {/* Accordion list */}
      <div>
        {items.map((item, i) => (
          <FaqRow
            key={i}
            question={item.question}
            answer={item.answer}
            open={activeIndex === i}
            onToggle={() => setActiveIndex(activeIndex === i ? null : i)}
            isFirst={i === 0}
          />
        ))}
      </div>
    </section>
  );
}

function FaqRow({
  question,
  answer,
  open,
  onToggle,
  isFirst,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  isFirst: boolean;
}) {
  const id = useId();
  const btnId = `faq-btn-${id}`;
  const panelId = `faq-panel-${id}`;

  return (
    <div
      style={{
        borderTop: isFirst ? `0.5px solid ${C.line}` : "none",
        borderBottom: `0.5px solid ${C.line}`,
      }}
    >
      <button
        id={btnId}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "18px 0",
          minHeight: "44px",
          textAlign: "left",
          outline: "none",
        }}
      >
        <span
          style={{
            fontFamily: serif,
            fontSize: "17px",
            color: C.dark,
            lineHeight: 1.4,
            fontWeight: 400,
            flex: 1,
          }}
        >
          {question}
        </span>

        {/* + at rest, rotates 45° to × when open */}
        <span
          aria-hidden
          style={{
            position: "relative",
            width: "14px",
            height: "14px",
            flexShrink: 0,
            marginTop: "6px",
            color: C.stone,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: `transform 300ms ${EASE}`,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              backgroundColor: "currentColor",
              transform: "translateY(-50%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "1px",
              backgroundColor: "currentColor",
              transform: "translateX(-50%)",
            }}
          />
        </span>
      </button>

      {/* Answer panel — grid-rows trick for smooth height animation */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: `grid-template-rows 350ms ${EASE}`,
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              fontFamily: sans,
              fontSize: "14px",
              color: C.charcoal,
              lineHeight: 1.7,
              fontWeight: 300,
              margin: 0,
              paddingBottom: "20px",
              maxWidth: "600px",
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
