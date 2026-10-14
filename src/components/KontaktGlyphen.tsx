/* ═══════════════════════════════════════════════════════════
   KONTAKTZEICHEN — LinkedIn und Brief, im Mass ihrer Textzeile.
   ═══════════════════════════════════════════════════════════ */

export function LinkedInGlyph({ farbe }: { farbe: string }) {
  return (
    <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill={farbe}
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
      />
    </svg>
  );
}

export function MailGlyph({ farbe }: { farbe: string }) {
  return (
    <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x="2.1" y="4.6" width="19.8" height="14.8" fill="none" stroke={farbe} strokeWidth="1.9" />
      <path d="M2.9 5.4 12 12.6l9.1-7.2" fill="none" stroke={farbe} strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  );
}
