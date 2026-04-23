import { spawnSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const REQUIRED_JSON_FILES = [
  "src/modules/catalog/repositories.json",
  "snapshots/opportunities.json",
];
const SOURCE_DIRECTORIES = ["src", "scripts"];

async function walk(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function validateJsonFiles() {
  for (const relativePath of REQUIRED_JSON_FILES) {
    const fullPath = resolve(ROOT, relativePath);
    await access(fullPath);
    const content = await readFile(fullPath, "utf8");
    JSON.parse(content);
    console.log(`json-ok: ${relativePath}`);
  }
}

async function validateModuleSyntax() {
  const files = [];

  for (const relativeDir of SOURCE_DIRECTORIES) {
    const fullDir = resolve(ROOT, relativeDir);
    files.push(...(await walk(fullDir)));
  }

  const moduleFiles = files.filter((file) => file.endsWith(".mjs"));

  for (const file of moduleFiles) {
    const check = spawnSync(process.execPath, ["--check", file], {
      stdio: "inherit",
    });

    if (check.status !== 0) {
      throw new Error(`Syntax validation failed for ${file}`);
    }
  }

  console.log(`syntax-ok: ${moduleFiles.length} files`);
}

async function main() {
  await validateJsonFiles();
  await validateModuleSyntax();
  console.log("validate-ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

