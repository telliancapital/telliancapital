import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { C, sans, serif } from "@/tokens";

/* The root layout lives under [lang], so unmatched URLs (and languages
   other than de/en/fr) render this page directly
   (experimental.globalNotFound in next.config.ts). */

export const metadata: Metadata = {
  title: "Seite nicht gefunden | Tellian Capital Solutions",
  icons: { icon: { url: "/solutions/tellian-monogramm-dunkel.svg", type: "image/svg+xml" } },
};

export default function GlobalNotFound() {
  return (
    <html lang="de">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: C.bg,
          color: C.dark,
        }}
      >
        <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(28px, 4vw, 44px)", margin: 0 }}>
          Seite nicht gefunden
        </h1>
        <p style={{ fontFamily: sans, margin: 0 }}>Page not found · Page introuvable</p>
        <p style={{ fontFamily: sans, margin: 0 }}>
          <Link href="/de" style={{ color: "inherit" }}>
            Tellian Capital Solutions
          </Link>
        </p>
      </body>
    </html>
  );
}
