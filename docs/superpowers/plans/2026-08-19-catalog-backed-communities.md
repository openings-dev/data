# Catalog-backed Communities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish every configured source as a community and make the frontend display and resolve communities even when they have zero open opportunities.

**Architecture:** The data build creates a versioned `api/communities.json` artifact by joining catalog entries with open opportunity aggregates. The manifest references and hashes that artifact. The frontend validates and loads it through the existing coherent static-artifact view instead of reconstructing communities from open snapshot items.

**Tech Stack:** Node.js 20+ test runner and ES modules in `data`; Next.js 16, React 19, and strict TypeScript in `openings`.

---

### Task 1: Build the catalog-backed communities artifact

**Files:**
- Create: `test/static-api-communities.test.mjs`
- Create: `src/modules/snapshot/static-api/communities.mjs`
- Modify: `src/modules/snapshot/static-api/paths.mjs`
- Modify: `src/modules/snapshot/static-api/build-static-api-files.mjs`
- Modify: `src/modules/snapshot/prepare-segmented-snapshot.mjs`
- Modify: `src/app/run-build.mjs`

- [ ] **Step 1: Write failing tests** for a catalog source with no items, a source with only closed items, and a source with two open items. Assert deterministic repository ordering, zero counts, and the latest open `createdAt` value.
- [ ] **Step 2: Run `node --test test/static-api-communities.test.mjs`** and confirm failure because the communities builder does not exist.
- [ ] **Step 3: Implement `buildCommunities(catalogRepositories, openItems)`** returning `{ items }`, with owner-based fallback names, `https://github.com/<owner>.png` avatars, catalog location metadata, and open-item counts.
- [ ] **Step 4: Add `staticApiCommunitiesPath()`** returning `api/communities.json`, emit the file from `buildStaticApiFiles`, and pass selected catalog repositories from `runBuild` through `prepareSegmentedSnapshot`.
- [ ] **Step 5: Run the focused test and `npm test`**; expect all tests to pass.
- [ ] **Step 6: Commit** with `feat(data): publish catalog communities`.

### Task 2: Version and validate the manifest contract

**Files:**
- Modify: `test/static-api-communities.test.mjs`
- Modify: `src/modules/snapshot/static-api/build-static-api-files.mjs`

- [ ] **Step 1: Add a failing manifest test** asserting schema version `4`, `files.communities === "api/communities.json"`, `totals.communities` equals the catalog size, and `dataHash` changes when only catalog community data changes.
- [ ] **Step 2: Run the focused test** and confirm the current version-3 manifest fails the new assertions.
- [ ] **Step 3: Extend `manifestPayload`** to include the communities path and count, bump the schema to `4`, and include the community payload in `dataHash`.
- [ ] **Step 4: Run `npm test` and `npm run validate`**; expect both to pass.
- [ ] **Step 5: Commit** with `feat(data): version communities artifact`.

### Task 3: Consume catalog communities in the frontend

**Files:**
- Modify: `lib/opportunities/api-types.ts`
- Modify: `lib/opportunities/static-artifact-validation.ts`
- Modify: `lib/opportunities/static-artifacts.ts`
- Modify: `lib/opportunities/communities.ts`
- Create: `tooling/validate-communities-artifact.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create a failing validation script** that checks a zero-count community is accepted, malformed entries are rejected, and manifest schema 4 requires `files.communities` and `totals.communities`.
- [ ] **Step 2: Run `node tooling/validate-communities-artifact.mjs`** and confirm failure against the current parser/types.
- [ ] **Step 3: Add `StaticCommunity`, `StaticCommunities`, and schema-4 manifest fields** to the frontend contract; implement strict unknown-data validation for the communities artifact.
- [ ] **Step 4: Add a communities cache and `loadOpportunityCommunities(manifest)`** to the existing static-artifact recovery boundary.
- [ ] **Step 5: Replace snapshot grouping in `communities.ts`** with the new loader while preserving count/recency/repository sorting and repository lookup behavior. Do not filter zero counts.
- [ ] **Step 6: Add the validation script to the existing outreach validation command or run it as a dedicated package script.**
- [ ] **Step 7: Run the focused validation, `npm run lint`, and `npm run test:outreach`**; expect clean output.
- [ ] **Step 8: Commit** with `feat: show inactive communities`.

### Task 4: Regenerate and verify published artifacts

**Files:**
- Modify: `snapshots/opportunities/api/communities.json`
- Modify: `snapshots/opportunities/api/manifest.json`
- Modify: any static API files whose deterministic hashes change during regeneration

- [ ] **Step 1: Regenerate static API artifacts** from the existing segmented repository snapshots and the full catalog, without making new GitHub ingestion requests.
- [ ] **Step 2: Verify `Gommunity/vagas` and `rustdevbr/vagas` exist** in `api/communities.json` with `opportunitiesCount: 0`.
- [ ] **Step 3: Run `npm run validate` in `data`**; expect all tests and repository validation to pass.
- [ ] **Step 4: Serve the local data repository over HTTP and run the frontend build against it**, then run `npm run build`; expect a successful static export including both community profile routes.
- [ ] **Step 5: Run `npm run lint` and `npm run test:outreach` again** to confirm the final tree is clean.
- [ ] **Step 6: Commit generated data** with `chore(data): publish catalog communities`.

### Task 5: Add the vetted source expansion

**Files:**
- Modify: `src/modules/catalog/repositories.json`
- Modify: `test/static-api-communities.test.mjs`

- [ ] **Step 1: Add a failing catalog assertion** for the seven approved issue-backed repositories: `awesome-jobs/jobs`, `CangaceirosDevels/vagas`, `CodeandoMexico/jobs`, `eduardoborges/vagas-ti-sergipe`, `felipenoka/vagas`, `Infrasity-Labs/developer-marketing-jobs`, and `stone-pagamentos/vagas`.
- [ ] **Step 2: Run the focused test** and confirm it fails because the repositories are absent.
- [ ] **Step 3: Add normalized catalog entries** with verified country, region, locale, scope, source, URL, and query hints; preserve case-insensitive repository ordering and uniqueness.
- [ ] **Step 4: Regenerate only the catalog-backed communities and manifest artifacts**, then verify all seven entries appear with zero or current open counts.
- [ ] **Step 5: Run `npm run validate` in `data` and the frontend validation/build commands**; expect all checks to pass.
- [ ] **Step 6: Commit** with `feat(data): add linked job communities`.
