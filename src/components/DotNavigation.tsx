/* Six sections — thresholds determine when a section becomes active.
   Layout (total 864vw, scrollable 764vw):
   Hero(0-110) + Breathing(8) + Philo(118-228) + Breathing(8)
   + Vermögen(236-346) + Breathing(8) + Strategien(354-464) + Breathing(8)
   + Über uns(472-756) + Breathing(8) + Kontakt(764-864, 100vw)
   targets = sectionStart / 764 */
const SECTIONS = [
  { label: "Start", target: 0.0, threshold: 0.0 }, // Hero
  { label: "Haltung", target: 0.154, threshold: 0.08 }, // Anlagephilosophie
  { label: "Methode", target: 0.309, threshold: 0.23 }, // Vermögensverwaltung
  { label: "Strategie", target: 0.463, threshold: 0.39 }, // Anlagestrategien
  { label: "Team", target: 0.618, threshold: 0.54 }, // Über uns
  { label: "Kontakt", target: 1.0, threshold: 0.94 }, // Kontakt
];

const sans = "'Inter', sans-serif";

/* Palette — matches the rest of the design system */
const COLOR = {
  dotInactive: "#C8C5BB",
  dotActive: "#8A8575",
  labelInactive: "#8A857C",
  labelActive: "#3A3835",
};

function getActiveIndex(progress: number): number {
  let active = 0;
  for (let i = 1; i < SECTIONS.length; i++) {
    if (progress >= SECTIONS[i].threshold) active = i;
  }
  return active;
}

interface DotNavigationProps {
  scrollProgress: number;
  onNavigate: (target: number) => void;
}

export function DotNavigation({ scrollProgress, onNavigate }: DotNavigationProps) {
  const activeIndex = getActiveIndex(scrollProgress);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        pointerEvents: "auto",
      }}
    >
      {SECTIONS.map((section, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={i}
            onClick={() => onNavigate(section.target)}
            aria-label={section.label}
            aria-current={isActive ? "true" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              cursor: isActive ? "default" : "pointer",
              outline: "none",
              transition: "background-color 200ms ease-out",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* Dot */}
            <span
              aria-hidden
              style={{
                display: "block",
                width: isActive ? "22px" : "8px",
                height: "8px",
                borderRadius: isActive ? "4px" : "50%",
                backgroundColor: isActive ? COLOR.dotActive : COLOR.dotInactive,
                opacity: isActive ? 0.6 : 0.5,
                transition:
                  "width 350ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 350ms cubic-bezier(0.16, 1, 0.3, 1), background-color 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />

            {/* Label */}
            <span
              style={{
                fontFamily: sans,
                fontSize: "8px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: isActive ? COLOR.labelActive : COLOR.labelInactive,
                fontWeight: isActive ? 500 : 400,
                lineHeight: 1,
                userSelect: "none",
                transition: "color 200ms ease-out, font-weight 200ms ease-out",
              }}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
