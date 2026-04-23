import { readFile } from "node:fs/promises";

/**
 * @param {string} filePath
 */
async function readJsonFile(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

/**
 * @param {unknown} catalog
 */
function assertCatalogShape(catalog) {
  if (!catalog || typeof catalog !== "object") {
    throw new Error("Invalid catalog: expected object.");
  }

  if (!Array.isArray(catalog.repositories)) {
    throw new Error("Invalid catalog: repositories must be an array.");
  }

  for (const repository of catalog.repositories) {
    if (!repository || typeof repository !== "object") {
      throw new Error("Invalid catalog repository: expected object.");
    }

    if (typeof repository.repository !== "string" || repository.repository.length === 0) {
      throw new Error("Invalid catalog repository: repository field is required.");
    }
  }
}

/**
 * @param {string} filePath
 */
export async function readRepositoryCatalog(filePath) {
  const catalog = await readJsonFile(filePath);
  assertCatalogShape(catalog);
  return catalog;
}

