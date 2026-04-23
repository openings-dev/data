import { validateCodeLineLimits } from "../src/modules/validation/validate-code-line-limits.mjs";
import { validateJsonFiles } from "../src/modules/validation/validate-json-files.mjs";
import { validateModuleSyntax } from "../src/modules/validation/validate-module-syntax.mjs";
import { validateSnapshotStructure } from "../src/modules/validation/validate-snapshot-structure.mjs";

const ROOT = process.cwd();

async function main() {
  await validateJsonFiles(ROOT);
  await validateSnapshotStructure(ROOT);
  await validateCodeLineLimits(ROOT);
  await validateModuleSyntax(ROOT);
  console.log("validate-ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
