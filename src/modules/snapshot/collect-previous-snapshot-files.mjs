import { resolve } from "node:path";
import { readJsonIfExists } from "../storage/read-json-if-exists.mjs";

/**
 * @param {string} snapshotRootDir
 */
export async function collectPreviousSnapshotFiles(snapshotRootDir) {
  const files = new Set();
  const globalIndexPath = resolve(snapshotRootDir, "index.json");
  const globalIndex = await readJsonIfExists(globalIndexPath);

  if (!globalIndex || !Array.isArray(globalIndex.countries)) {
    return files;
  }

  files.add("index.json");

  if (Array.isArray(globalIndex.staticApi?.files)) {
    for (const file of globalIndex.staticApi.files) {
      if (typeof file === "string") {
        files.add(file);
      }
    }
  }

  for (const country of globalIndex.countries) {
    if (typeof country.indexFile !== "string") {
      continue;
    }

    files.add(country.indexFile);
    const countryIndexPath = resolve(snapshotRootDir, country.indexFile);
    const countryIndex = await readJsonIfExists(countryIndexPath);

    if (!countryIndex || !Array.isArray(countryIndex.byRepository)) {
      continue;
    }

    for (const repository of countryIndex.byRepository) {
      if (typeof repository.file === "string") {
        files.add(repository.file);
      }
    }
  }

  return files;
}
