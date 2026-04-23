import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { walkFiles } from "./walk-files.mjs";

const CODE_DIRECTORIES = ["src", "scripts"];
const MAX_CODE_LINES = 100;

/**
 * @param {string} rootDir
 */
export async function validateCodeLineLimits(rootDir) {
  const files = [];

  for (const relativeDir of CODE_DIRECTORIES) {
    files.push(...(await walkFiles(resolve(rootDir, relativeDir))));
  }

  const moduleFiles = files.filter((file) => file.endsWith(".mjs"));

  for (const file of moduleFiles) {
    const content = await readFile(file, "utf8");
    const lines = content.split(/\r?\n/).length;

    if (lines > MAX_CODE_LINES) {
      throw new Error(`Line limit exceeded (${lines}/${MAX_CODE_LINES}) in ${file}`);
    }
  }

  console.log(`line-limit-ok: ${moduleFiles.length} files`);
}
