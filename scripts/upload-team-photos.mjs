/**
 * Lädt die retuschierten Teamfotos der Vorlage (DesignTellian,
 * src/assets/team) in Sanity hoch und hängt sie an die passenden
 * Einträge in homepage.teamMembers[] — samt Hotspot auf der Augenlinie
 * der Vorlage, damit die Kachel (src/sanity/lib/teamImage.ts) exakt den
 * Ausschnitt des Redesigns zeigt.
 *
 * Warum: Im CMS liegen die unbearbeiteten Originale (gemessen ~10 %
 * dunkler, anders gesättigt). Die Vorlage zeigt bearbeitete Fassungen
 * derselben Aufnahmen. Nach dem Lauf TEAM_BILD_FILTER in teamImage.ts
 * auf "none" setzen.
 *
 * Aufruf (Token mit Schreibrecht, wird NICHT in .env abgelegt):
 *   SANITY_API_WRITE_TOKEN=... node scripts/upload-team-photos.mjs
 *   SANITY_API_WRITE_TOKEN=... node scripts/upload-team-photos.mjs --dry
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { createClient } from "@sanity/client";

const DESIGN_TEAM_DIR =
  process.env.DESIGN_TEAM_DIR ?? "/Users/mac/Documents/DesignTellian/TellianCaptialDesign/src/assets/team";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "6x7hxuvh";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dry = process.argv.includes("--dry");

/* Nachname (klein, ohne Diakritika) → Datei der Vorlage + Augenlinie
   (Anteil der Quellhöhe; aus scripts/optimize-images.mjs der Vorlage). */
const FOTOS = {
  bill: ["Olivier-Bill.JPG", 0.309],
  ludescher: ["Marco-Ludescher.JPG", 0.355],
  schneider: ["Rolf-Schneider.JPG", 0.215],
  honegger: ["Bryan-Honegger.png", 0.171],
  trumpler: ["Andreas-Trümpler.JPG", 0.21],
  rukavina: ["Jasmina-Rukavina.JPG", 0.215],
  pons: ["Thibault-Pons.png", 0.314],
};

const schluessel = (name) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z]+/);

if (!token && !dry) {
  console.error("SANITY_API_WRITE_TOKEN fehlt (oder --dry zum Probelauf).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const homepage = await client.fetch(`*[_type == "homepage"][0]{ _id, teamMembers[]{ _key, name } }`);
if (!homepage) throw new Error("Kein homepage-Dokument gefunden.");

for (const m of homepage.teamMembers ?? []) {
  const treffer = schluessel(m.name ?? "").find((w) => w in FOTOS);
  if (!treffer) {
    console.log(`– ${m.name}: kein Foto in der Vorlage, übersprungen`);
    continue;
  }
  const [datei, augenlinie] = FOTOS[treffer];
  const pfad = join(DESIGN_TEAM_DIR, datei);
  if (!existsSync(pfad)) {
    console.log(`– ${m.name}: ${pfad} fehlt, übersprungen`);
    continue;
  }
  if (dry) {
    console.log(`· ${m.name} ← ${datei} (Augenlinie ${augenlinie})`);
    continue;
  }
  const asset = await client.assets.upload("image", createReadStream(pfad), { filename: basename(pfad) });
  await client
    .patch(homepage._id)
    .set({
      [`teamMembers[_key=="${m._key}"].image`]: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        hotspot: { _type: "sanity.imageHotspot", x: 0.5, y: augenlinie, width: 0.3, height: 0.2 },
        crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
      },
    })
    .commit();
  console.log(`✓ ${m.name} ← ${datei} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`);
}
console.log(dry ? "Probelauf beendet." : "Fertig. Jetzt TEAM_BILD_FILTER in src/sanity/lib/teamImage.ts auf \"none\" setzen.");
