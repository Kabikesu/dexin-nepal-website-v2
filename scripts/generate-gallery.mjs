import fs from "node:fs";
import path from "node:path";

const root = path.resolve("images/gallery");
const output = path.resolve("data/gallery.json");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function titleFromFile(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function slugFromPath(relativePath) {
  return relativePath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function imageFiles(dir, relativeDir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry =>
      !entry.name.startsWith(".") &&
      entry.isFile() &&
      extensions.has(path.extname(entry.name).toLowerCase())
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    )
    .map(entry => {
      const src = path.posix.join(
        "images/gallery",
        relativeDir,
        entry.name
      );

      return {
        src,
        alt: titleFromFile(entry.name),
        title: titleFromFile(entry.name)
      };
    });
}

function collectAlbums(dir, relativeDir = "") {
  const albums = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith("."))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

  const images = imageFiles(dir, relativeDir);

  // Every folder containing images directly becomes an album.
  // This means images/gallery/Events/Annual Dinner/ will display
  // "Annual Dinner" as its own album.
  if (images.length && relativeDir) {
    albums.push({
      id: slugFromPath(relativeDir),
      title: path.basename(relativeDir),
      folder: path.posix.join("images/gallery", relativeDir),
      count: images.length,
      cover: images[0]?.src || "",
      images
    });
  }

  // Parent folders are only organizational containers when they
  // contain subfolders. They do not become empty/combined albums.
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const childDir = path.join(dir, entry.name);
    const childRelative = relativeDir
      ? path.posix.join(relativeDir, entry.name)
      : entry.name;

    albums.push(...collectAlbums(childDir, childRelative));
  }

  return albums;
}

function build() {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const albums = collectAlbums(root);

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(albums, null, 2) + "\n");

  console.log("Generated", output, "with", albums.length, "albums");
}

build();
