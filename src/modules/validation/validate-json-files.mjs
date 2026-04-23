import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const REQUIRED_JSON_FILES = [
  "src/modules/catalog/repositories.json",
  "snapshots/opportunities/index.json",
];

/**
 * @param {string} rootDir
 */
export async function validateJsonFiles(rootDir) {
  for (const relativePath of REQUIRED_JSON_FILES) {
    const fullPath = resolve(rootDir, relativePath);
    await access(fullPath);
    const content = await readFile(fullPath, "utf8");
    JSON.parse(content);
    console.log(`json-ok: ${relativePath}`);
  }
}
