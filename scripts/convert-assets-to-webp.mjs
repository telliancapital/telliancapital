#!/usr/bin/env node
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";

const DIR = new URL("../src/assets/", import.meta.url).pathname;
const MAX_WIDTH = 2000;
const QUALITY = 82;

const files = await readdir(DIR);
const pngs = files.filter((f) => f.toLowerCase().endsWith(".png"));

console.log(`Converting ${pngs.length} PNG(s) in src/assets/ → WebP …`);
let totalBefore = 0;
let totalAfter = 0;

for (const f of pngs) {
  const inPath = join(DIR, f);
  const outPath = join(DIR, parse(f).name + ".webp");
  const beforeBytes = (await stat(inPath)).size;

  await sharp(inPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  const afterBytes = (await stat(outPath)).size;
  totalBefore += beforeBytes;
  totalAfter += afterBytes;

  const pct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
  console.log(
    `  ${f}: ${(beforeBytes / 1024 / 1024).toFixed(2)} MB → ${(afterBytes / 1024).toFixed(0)} KB  (–${pct}%)`,
  );
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)} MB → ${(totalAfter / 1024 / 1024).toFixed(2)} MB  ` +
    `(saved ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB, –${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`,
);
