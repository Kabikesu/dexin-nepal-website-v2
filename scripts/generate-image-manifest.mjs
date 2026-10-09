import fs from "node:fs";
import path from "node:path";

const root = path.resolve("images");
const output = path.resolve("data/image-manifest.json");
const folders = ["hero", "factory", "certifications", "careers"];
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function titleFromFile(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ").trim().replace(/\b\w/g, letter => letter.toUpperCase());
}

function collectImages(folder, directory = path.join(root, folder), relative = "") {
  if (!fs.existsSync(directory)) return [];
  const entries = fs.readdirSync(directory, { withFileTypes: true }).filter(entry => !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  const result = [];
  for (const entry of entries) {
    const localPath = path.posix.join(relative, entry.name);
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectImages(folder, fullPath, localPath));
    } else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      const src = path.posix.join("images", folder, localPath.split(path.sep).join("/"));
      const title = titleFromFile(entry.name);
      result.push({ src, title, alt: title });
    }
  }
  return result;
}

const manifest = Object.fromEntries(folders.map(folder => [folder, collectImages(folder)]));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(manifest, null, 2) + "\n");
console.log("Generated", output, ":", folders.map(folder => folder + "=" + manifest[folder].length).join(", "));
