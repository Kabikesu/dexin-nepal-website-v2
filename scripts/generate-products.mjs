import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const roots = [
  { folder: "images/products/coffee", type: "Coffee" },
  { folder: "images/products/nutraceuticals", type: "Nutraceuticals" }
];
const allowed = new Set([".jpg",".jpeg",".png",".webp",".avif"]);

function slugFromFilename(name) {
  return basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromFilename(name) {
  return basename(name, extname(name))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

const details = JSON.parse(await readFile("data/product-details.json", "utf8"));

async function scan(folder, type) {
  try {
    const entries = await readdir(folder, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && allowed.has(extname(entry.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry => {
        const id = slugFromFilename(entry.name);
        const known = details[id];
        return {
          id,
          name: known?.name || titleFromFilename(entry.name),
          type: known?.type || type,
          description: known?.description || "",
          image: join(folder, entry.name).replaceAll("\\", "/"),
          packageSize: known?.packageSize || "",
          status: known?.status || "review",
          featured: known?.featured ?? false,
          upcoming: known?.status === "upcoming",
          published: known?.published ?? Boolean(known)
        };
      });
  } catch {
    return [];
  }
}

const detected = (await Promise.all(roots.map(root => scan(root.folder, root.type)))).flat();
const detectedIds = new Set(detected.map(product => product.id));

const catalogOnly = Object.entries(details)
  .filter(([id]) => !detectedIds.has(id))
  .map(([id, product]) => ({
    id,
    name: product.name,
    type: product.type,
    description: product.description || "",
    image: product.image || "",
    packageSize: product.packageSize || "",
    status: product.status || "review",
    featured: product.featured ?? false,
    upcoming: product.status === "upcoming",
    published: product.published ?? true
  }));

const products = [...detected, ...catalogOnly];

await writeFile("data/products.json", JSON.stringify(products, null, 2) + "\n");
console.log(`Generated ${products.length} products from image manifest + product details.`);
