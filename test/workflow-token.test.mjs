import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const WORKFLOWS = [
  ".github/workflows/update-opportunities.yml",
  ".github/workflows/discover-communities.yml",
];

test("scheduled GitHub API workflows use the ephemeral Actions token", async () => {
  for (const workflowPath of WORKFLOWS) {
    const workflow = await readFile(workflowPath, "utf8");

    assert.match(workflow, /GITHUB_TOKEN:\s*\$\{\{ github\.token \}\}/u, workflowPath);
    assert.doesNotMatch(workflow, /secrets\.OPENINGS_GITHUB_TOKEN/u, workflowPath);
  }
});
