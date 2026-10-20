import type { Metadata } from "next";
import "./globals.css";
import { C, sans, serif } from "@/tokens";

/* With two root layouts ((de) and (en)) there is no single layout to build
   a 404 from, so unmatched URLs render this page directly
   (experimental.globalNotFound in next.config.ts). */

export const metadata: Metadata = {
  title: "Seite nicht gefunden | Tellian Capital",
  icons: { icon: { url: "/tellian-monogramm-dunkel.svg", type: "image/svg+xml" } },
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
        <p style={{ fontFamily: sans, margin: 0 }}>Page not found</p>
        <p style={{ fontFamily: sans, margin: 0 }}>
          <a href="/de" style={{ color: "inherit" }}>
            Zur Startseite
          </a>
          {" · "}
          <a href="/en" style={{ color: "inherit" }}>
            Homepage
          </a>
        </p>
      </body>
    </html>
  );
}
