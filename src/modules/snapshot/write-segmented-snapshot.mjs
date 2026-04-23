import { collectPreviousSnapshotFiles } from "./collect-previous-snapshot-files.mjs";
import { pruneStaleSnapshotFiles } from "./prune-stale-snapshot-files.mjs";
import { writeJsonIfChanged } from "../storage/write-json-if-changed.mjs";

function collectNextSnapshotFiles(snapshot) {
  const files = new Set([snapshot.globalIndex.relativePath]);

  for (const country of snapshot.countrySnapshots) {
    files.add(country.index.relativePath);

    for (const repositoryShard of country.repositoryShards) {
      files.add(repositoryShard.relativePath);
    }
  }

  return files;
}

async function writeCountrySnapshot(countrySnapshot, changedFiles) {
  for (const repositoryShard of countrySnapshot.repositoryShards) {
    const changed = await writeJsonIfChanged(repositoryShard.filePath, repositoryShard.payload);

    if (changed) {
      changedFiles.push(repositoryShard.relativePath);
    }
  }

  const changedIndex = await writeJsonIfChanged(
    countrySnapshot.index.filePath,
    countrySnapshot.index.payload,
  );

  if (changedIndex) {
    changedFiles.push(countrySnapshot.index.relativePath);
  }
}

/**
 * @param {{snapshotRootDir: string; globalIndex: {filePath: string; relativePath: string; payload: Record<string, unknown>}; countrySnapshots: Array<any>}} snapshot
 */
export async function writeSegmentedSnapshot(snapshot) {
  const previousFiles = await collectPreviousSnapshotFiles(snapshot.snapshotRootDir);
  const nextFiles = collectNextSnapshotFiles(snapshot);
  const changedFiles = await pruneStaleSnapshotFiles({
    snapshotRootDir: snapshot.snapshotRootDir,
    previousFiles,
    nextFiles,
  });

  for (const countrySnapshot of snapshot.countrySnapshots) {
    await writeCountrySnapshot(countrySnapshot, changedFiles);
  }

  const changedGlobalIndex = await writeJsonIfChanged(
    snapshot.globalIndex.filePath,
    snapshot.globalIndex.payload,
  );

  if (changedGlobalIndex) {
    changedFiles.push(snapshot.globalIndex.relativePath);
  }

  return {
    updated: changedFiles.length > 0,
    changedFiles,
  };
}
