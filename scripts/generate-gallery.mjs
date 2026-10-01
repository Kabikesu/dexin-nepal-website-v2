import fs from "node:fs";
import path from "node:path";

const root = path.resolve("images/gallery");
const output = path.resolve("data/gallery.json");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function titleFromName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function slugFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function collectImages(dir, relativeDir = "") {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base"
    }));

  const images = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      const relativePath = relativeDir
        ? path.posix.join("images/gallery", relativeDir, entry.name)
        : path.posix.join("images/gallery", entry.name);

      images.push({
        src: relativePath,
        alt: titleFromName(entry.name),
        title: titleFromName(entry.name)
      });
      continue;
    }

    if (entry.isDirectory()) {
      const childRelative = relativeDir
        ? path.posix.join(relativeDir, entry.name)
        : entry.name;

      images.push(...collectImages(absolutePath, childRelative));
    }
  }

  return images;
}

function build() {
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });

  const albums = fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map(entry => {
      const images = collectImages(path.join(root, entry.name), entry.name);

      return images.length
        ? {
            id: slugFromName(entry.name),
            title: entry.name,
            images
          }
        : null;
    })
    .filter(Boolean);

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(albums, null, 2) + "\n");

  console.log("Generated", output, "with", albums.length, "albums");
}

build();
