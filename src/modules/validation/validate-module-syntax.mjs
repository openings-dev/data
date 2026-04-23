import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { walkFiles } from "./walk-files.mjs";

const SOURCE_DIRECTORIES = ["src", "scripts"];

/**
 * @param {string} rootDir
 */
export async function validateModuleSyntax(rootDir) {
  const files = [];

  for (const relativeDir of SOURCE_DIRECTORIES) {
    const fullDir = resolve(rootDir, relativeDir);
    files.push(...(await walkFiles(fullDir)));
  }

  const moduleFiles = files.filter((file) => file.endsWith(".mjs"));

  for (const file of moduleFiles) {
    const check = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });

    if (check.status !== 0) {
      throw new Error(`Syntax validation failed for ${file}`);
    }
  }

  console.log(`syntax-ok: ${moduleFiles.length} files`);
}
