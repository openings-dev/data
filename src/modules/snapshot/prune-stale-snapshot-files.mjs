import { rm } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * @param {{snapshotRootDir: string; previousFiles: Set<string>; nextFiles: Set<string>}} params
 */
export async function pruneStaleSnapshotFiles(params) {
  const { snapshotRootDir, previousFiles, nextFiles } = params;
  const removedFiles = [];

  for (const relativePath of previousFiles) {
    if (nextFiles.has(relativePath)) {
      continue;
    }

    await rm(resolve(snapshotRootDir, relativePath), { force: true });
    removedFiles.push(relativePath);
  }

  return removedFiles;
}
