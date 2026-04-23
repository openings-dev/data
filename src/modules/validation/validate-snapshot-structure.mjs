import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const MAX_SNAPSHOT_JSON_LINES = 4000;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSnapshotJson(rootDir, relativePath) {
  const fullPath = resolve(rootDir, "snapshots", "opportunities", relativePath);
  const content = await readFile(fullPath, "utf8");
  const lines = content.split(/\r?\n/).length;

  if (lines > MAX_SNAPSHOT_JSON_LINES) {
    throw new Error(`Snapshot file too large (${lines} lines): ${relativePath}`);
  }

  return JSON.parse(content);
}

/**
 * @param {string} rootDir
 */
export async function validateSnapshotStructure(rootDir) {
  const legacySnapshotPath = resolve(rootDir, "snapshots", "opportunities.json");

  if (await exists(legacySnapshotPath)) {
    throw new Error("Legacy monolithic snapshot is not allowed: snapshots/opportunities.json");
  }

  const globalIndex = await readSnapshotJson(rootDir, "index.json");

  if (!Array.isArray(globalIndex.countries)) {
    throw new Error("Invalid segmented snapshot: countries must be an array.");
  }

  for (const country of globalIndex.countries) {
    if (typeof country.indexFile !== "string") {
      throw new Error(`Invalid country entry: indexFile missing for ${country.countryCode}`);
    }

    const countryIndex = await readSnapshotJson(rootDir, country.indexFile);

    if (!Array.isArray(countryIndex.byRepository)) {
      throw new Error(`Invalid country index: byRepository missing for ${country.countryCode}`);
    }

    for (const repository of countryIndex.byRepository) {
      if (typeof repository.file !== "string") {
        throw new Error(`Invalid repository entry in ${country.countryCode}: file missing.`);
      }

      const shard = await readSnapshotJson(rootDir, repository.file);

      if (!Array.isArray(shard.items)) {
        throw new Error(`Invalid repository shard: items missing in ${repository.file}`);
      }

      if (String(shard.countryCode).toUpperCase() !== String(country.countryCode).toUpperCase()) {
        throw new Error(`Country mismatch in shard ${repository.file}`);
      }
    }
  }

  console.log(`snapshot-structure-ok: ${globalIndex.countries.length} countries`);
}
