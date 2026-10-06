import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve("images");
const output = path.resolve("data/image-audit.json");
const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const thresholds = {
  warningBytes: 1_500_000,
  criticalBytes: 5_000_000
};

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric:true, sensitivity:"base"}))) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (allowed.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function category(relativePath) {
  const parts = relativePath.split("/");
  return parts[1] || "root";
}

async function sha256(file) {
  const data = await fs.readFile(file);
  return createHash("sha256").update(data).digest("hex");
}

const files = await walk(root);
const records = [];
for (const file of files) {
  const stat = await fs.stat(file);
  const relative = path.relative(process.cwd(), file).replaceAll(path.sep, "/");
  records.push({
    path: relative,
    category: category(relative),
    extension: path.extname(file).toLowerCase().slice(1),
    bytes: stat.size,
    mb: Number((stat.size / 1024 / 1024).toFixed(2)),
    sha256: await sha256(file)
  });
}

records.sort((a,b) => b.bytes - a.bytes);

const duplicateGroups = [];
const byHash = new Map();
for (const item of records) {
  if (!byHash.has(item.sha256)) byHash.set(item.sha256, []);
  byHash.get(item.sha256).push(item.path);
}
for (const [sha256, paths] of byHash) {
  if (paths.length > 1) duplicateGroups.push({ sha256, files: paths });
}

const byCategory = {};
for (const item of records) {
  byCategory[item.category] ??= { files: 0, bytes: 0 };
  byCategory[item.category].files++;
  byCategory[item.category].bytes += item.bytes;
}
for (const value of Object.values(byCategory)) {
  value.mb = Number((value.bytes / 1024 / 1024).toFixed(2));
}

const productFiles = records.filter(item => item.category === "products");
const product19 = productFiles.filter(item => /^images\/products\/(coffee|nutraceuticals)\//.test(item.path));

const report = {
  generatedAt: new Date().toISOString(),
  policy: {
    warningBytes: thresholds.warningBytes,
    criticalBytes: thresholds.criticalBytes,
    destructiveChanges: false,
    duplicateDeletion: false
  },
  summary: {
    totalFiles: records.length,
    totalBytes: records.reduce((sum, item) => sum + item.bytes, 0),
    totalMb: Number((records.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024).toFixed(2)),
    warningFiles: records.filter(item => item.bytes >= thresholds.warningBytes).length,
    criticalFiles: records.filter(item => item.bytes >= thresholds.criticalBytes).length,
    exactDuplicateGroups: duplicateGroups.length,
    productImageCount: product19.length
  },
  categories: byCategory,
  largestFiles: records.slice(0, 25),
  duplicateGroups,
  productImages: product19
};

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.summary, null, 2));
