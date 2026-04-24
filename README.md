<p align="center">
  <a href="https://openings.dev">
    <img src="public/logo.png" alt="openings.dev" width="190" />
  </a>
</p>

# openings-data

Public data pipeline and snapshot repository for `openings.dev`.

This repository stores:

- `src/modules/catalog/repositories.json`: source repository catalog.
- `snapshots/opportunities/index.json`: global segmented snapshot index.
- `snapshots/opportunities/countries/*`: country indexes and repository shards.

## Why This Repository Is Structured This Way

The opportunities dataset is intentionally segmented to keep the repository fast and maintainable:

- primary segmentation by country (`countries/<countryCode>/...`);
- secondary segmentation by repository (`countries/<countryCode>/repositories/*.json`);
- incremental writes (only changed files are updated);
- smaller diffs and cleaner pull requests;
- no monolithic `snapshots/opportunities.json`.

This design avoids giant files, improves Git performance, and makes partial updates predictable.

## Architecture

```txt
src/
  app/
    run-build.mjs
  config/
    env.mjs
  modules/
    build/
    catalog/
      repositories.json
      catalog-repository.mjs
    github/
    observability/
    opportunities/
    snapshot/
    storage/
    validation/
  shared/
    errors/
    utils/
scripts/
  build-opportunities.mjs
  migrate-opportunities-snapshot.mjs
  validate-repo.mjs
```

## Snapshot Layout

```txt
snapshots/
  opportunities/
    index.json
    countries/
      br/
        index.json
        repositories/
          backend-br-vagas.json
      us/
        index.json
        repositories/
          simplifyjobs-summer2026-internships.json
```

- `index.json`: global metadata + pointer list (`countries[].indexFile`).
- `countries/<code>/index.json`: country metadata + repository pointers (`byRepository[].file`).
- `countries/<code>/repositories/*.json`: normalized opportunities for one repository.

Note: a `GLOBAL` country bucket may exist for repositories that are not country-specific.

## Data Contracts

### 1) Global Index

`snapshots/opportunities/index.json` contains:

- build metadata (`generatedAt`, `schemaVersion`, `catalogGeneratedAt`, `dataHash`);
- request settings (`request.maxIssuesPerRepository`, `requestDelayMs`, etc.);
- totals (`opportunities`, `uniqueRepositories`, `failedRepositories`, ...);
- per-country pointers (`countries[].indexFile`).

### 2) Country Index

`snapshots/opportunities/countries/<code>/index.json` contains:

- country metadata (`country`, `countryCode`, `region`);
- totals (`opportunities`, `openIssues`, `closedIssues`);
- repository shards (`byRepository[]` with `file` and `hash`).

### 3) Repository Shard

`snapshots/opportunities/countries/<code>/repositories/<slug>.json` contains:

- repository-level metadata (`repository`, `countryCode`, `totals`, `dataHash`);
- normalized `items[]` with fields such as:
  - `id`, `title`, `excerpt`, `issueState`;
  - `repository`, `region`, `country`, `tags`;
  - `author`, `community`;
  - `createdAt`, `updatedAt`, `url`, `sourceType`.

## Build and Update Flow

1. `.github/workflows/update-opportunities.yml` runs every 3 hours (`0 */3 * * *`) and supports manual trigger.
2. The workflow runs:
   - `npm run validate`
   - `npm run build:snapshot`
3. `scripts/build-opportunities.mjs` calls `src/app/run-build.mjs`.
4. The pipeline:
   - loads catalog repositories;
   - applies optional country filters;
   - collects and normalizes GitHub opportunities;
   - prepares segmented snapshots;
   - writes only changed files;
   - prunes stale snapshot files.
5. GitHub Actions commits only `snapshots/opportunities/**` when changes exist.

## Local Setup

Requirements:

- Node.js `>=20` (see `.nvmrc`).

Steps:

1. Copy `.env.example` to `.env`.
2. (Recommended) Set `OPENINGS_GITHUB_TOKEN` to increase API quota.
3. Run validation and build:

```bash
npm run validate
npm run build:snapshot
```

Legacy migration (one-time, if `snapshots/opportunities.json` still exists):

```bash
npm run migrate:snapshot
```

## Environment Variables

- `OPENINGS_GITHUB_TOKEN`: optional personal access token.
- `MAX_ISSUES_PER_REPOSITORY`: default `30`, min `1`, max `100`.
- `MAX_REPOSITORIES`: default `0` (`0` means no cap), max `50000`.
- `REQUEST_DELAY_MS`: default `120`, min `0`, max `10000`.
- `COUNTRY_CODES`: optional comma-separated filter, e.g. `BR,US,PT`.

## Validation Rules

`npm run validate` enforces repository safety:

- required JSON files must exist and parse;
- segmented snapshot structure must be valid;
- legacy monolithic snapshot file is forbidden;
- each snapshot JSON file is capped at `4000` lines;
- each `.mjs` file under `src/` and `scripts/` is capped at `100` lines.

These constraints are designed to keep the repo lightweight and easy to review.

## Frontend Consumption

Use the global segmented index URL:

```txt
https://raw.githubusercontent.com/<org>/<repo>/main/snapshots/opportunities/index.json
```

The frontend then resolves country indexes and repository shards through the pointers in that file.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

## License

[MIT](./LICENSE)
