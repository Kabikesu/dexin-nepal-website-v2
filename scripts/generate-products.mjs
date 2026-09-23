import { readdir, writeFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const roots = [
  { folder: "images/products/coffee", type: "Coffee" },
  { folder: "images/products/nutraceuticals", type: "Nutraceuticals" }
];
const allowed = new Set([".jpg",".jpeg",".png",".webp",".avif"]);

function titleFromFilename(name) {
  return basename(name, extname(name))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

async function scan(folder, type) {
  try {
    const entries = await readdir(folder, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && allowed.has(extname(entry.name).toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name))
      .map(entry => ({
        id: basename(entry.name, extname(entry.name)).toLowerCase().replace(/[^a-z0-9]+/g,"-"),
        name: titleFromFilename(entry.name),
        type,
        description: "",
        image: join(folder, entry.name).replaceAll("\\","/"),
        featured: false,
        upcoming: false
      }));
  } catch {
    return [];
  }
}

const products = (await Promise.all(roots.map(root => scan(root.folder, root.type)))).flat();
await writeFile("data/products.json", JSON.stringify(products, null, 2) + "\n");
console.log(`Generated ${products.length} products.`);