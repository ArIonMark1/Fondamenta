// Resize + recompress site photos — `npm run images`.
// Originals (any size) live in assets/original-images/ (not served).
// Web-ready copies are written to public/images/, which next/image then
// turns into AVIF/WebP at the exact widths each device needs.
// To add a photo: drop it into assets/original-images/, add a max width below
// (or rely on the default), run `npm run images`.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "assets", "original-images");
const outDir = path.join(root, "public", "images");

// Largest width each photo is ever displayed at (CSS px × ~2 for retina, capped).
const maxWidth = {
  "hero-worker": 1920, // full-bleed hero, ~70% of the screen on desktop
  "site-team": 1200, // big bento tile
  "villa": 1200, // "why us" photo
  "blueprints": 1280, // dimmed background behind the process steps
  "modern-house": 900, // small bento tile
};
const DEFAULT_MAX = 1600;

await mkdir(outDir, { recursive: true });
const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

let before = 0;
let after = 0;
for (const file of files) {
  const name = path.parse(file).name;
  const input = path.join(srcDir, file);
  const output = path.join(outDir, `${name}.jpg`);
  const width = maxWidth[name] ?? DEFAULT_MAX;

  const info = await sharp(input)
    .rotate() // respect EXIF orientation
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toFile(output); // EXIF/GPS metadata is dropped by default

  const inSize = (await stat(input)).size;
  before += inSize;
  after += info.size;
  console.log(
    `${name.padEnd(14)} ${String(info.width).padStart(4)}×${String(info.height).padEnd(4)} ` +
      `${(inSize / 1024).toFixed(0).padStart(5)} KB → ${(info.size / 1024).toFixed(0).padStart(4)} KB`,
  );
}
console.log(`total          ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`);
