import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputRoot = path.resolve("images");
const outputRoot = path.resolve("optimized-images");
const mapOutput = path.resolve("data/image-optimization-map.json");
const supported = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const map = {};
const summary = { processed: 0, skipped: 0, originalBytes: 0, optimizedBytes: 0, failures: [] };

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full));
    else if (entry.isFile() && supported.has(path.extname(entry.name).toLowerCase())) result.push(full);
  }
  return result;
}

function maxWidthFor(relative) {
  if (/^hero\//i.test(relative) || /^factory\//i.test(relative)) return 2200;
  if (/^gallery\//i.test(relative)) return 1800;
  if (/^staff\//i.test(relative) || /^products\//i.test(relative)) return 1200;
  return 1600;
}

for (const file of await walk(inputRoot)) {
  const relative = path.relative(inputRoot, file).split(path.sep).join("/");
  const outputRelative = relative.replace(/\.[^.]+$/, ".webp");
  const outputFile = path.join(outputRoot, outputRelative);
  const originalStat = await fs.promises.stat(file);
  try {
    await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
    await sharp(file, { failOn: "none" })
      .rotate()
      .resize({ width: maxWidthFor(relative), withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, smartSubsample: true })
      .toFile(outputFile);
    const outputStat = await fs.promises.stat(outputFile);
    if (outputStat.size >= originalStat.size && originalStat.size < 250_000) {
      await fs.promises.rm(outputFile, { force: true });
      summary.skipped++;
      continue;
    }
    map["images/" + relative] = "optimized-images/" + outputRelative;
    summary.processed++;
    summary.originalBytes += originalStat.size;
    summary.optimizedBytes += outputStat.size;
  } catch (error) {
    summary.failures.push({ path: relative, error: String(error.message || error) });
  }
}

await fs.promises.mkdir(path.dirname(mapOutput), { recursive: true });
await fs.promises.writeFile(mapOutput, JSON.stringify(map, null, 2) + "\n");
const saved = summary.originalBytes - summary.optimizedBytes;
console.log(JSON.stringify({
  ...summary,
  originalMB: Number((summary.originalBytes / 1048576).toFixed(2)),
  optimizedMB: Number((summary.optimizedBytes / 1048576).toFixed(2)),
  savedMB: Number((saved / 1048576).toFixed(2)),
  savedPercent: summary.originalBytes ? Number((saved / summary.originalBytes * 100).toFixed(1)) : 0
}, null, 2));
if (summary.failures.length) process.exitCode = 1;
