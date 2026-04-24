<p align="center">
  <a href="https://openings.dev">
    <img src="public/logo.png" alt="openings.dev" width="190" />
  </a>
</p>

# openings-data

Public data pipeline and static JSON API for `openings.dev`.

This repository owns the source catalog, GitHub ingestion pipeline, normalized opportunity snapshots, and static API files consumed by the front-end through raw GitHub URLs.

## Repository Role

`openings-dev/data` is the data publication layer. It is intentionally separate from the front-end:

- the data repo generates and stores publishable JSON snapshots;
- the front-end reads those snapshots remotely from `raw.githubusercontent.com`;
- the front-end must not copy, import, or mock these JSON files locally.

## Architecture

```txt
src/
  app/
    run-build.mjs
  config/
    env.mjs
  modules/
    build/                 repository selection and country processing
    catalog/               source repository catalog reader
    github/                GitHub API client
    observability/         structured CLI logger
    opportunities/         issue normalization and enrichment
    snapshot/              segmented snapshot and static API builders
    storage/               JSON read/write helpers
    validation/            repository validation checks
  shared/
    errors/
    utils/
scripts/
  build-opportunities.mjs
  migrate-opportunities-snapshot.mjs
  validate-repo.mjs
snapshots/
  opportunities/           published static API and segmented snapshots
```

## Source Catalog

The source catalog lives at:

```txt
src/modules/catalog/repositories.json
```

Each catalog entry describes a public GitHub repository that posts opportunities as issues, including repository name, URL, country, country code, and region.

## Published Data Layout

```txt
snapshots/opportunities/
  index.json
  api/
    manifest.json
    facet-index.json
    job-ids.json
    page-lookup.json
    search-index.json
    order/
      recent.json
    pages/
      page-0001.json
    jobs/
      ab.json
  countries/
    br/
      index.json
      repositories/
        backend-br-vagas.json
```

Primary files:

- `api/manifest.json`: entry point for front-end list loading.
- `api/order/recent.json`: opportunity IDs in default recent order.
- `api/page-lookup.json`: maps opportunity IDs to page files.
- `api/pages/*.json`: paginated opportunity payloads.
- `api/jobs/*.json`: bucketed job detail records.
- `api/job-ids.json`: static job IDs used for front-end static params.
- `index.json`: global segmented snapshot index.
- `countries/*/index.json`: country-level snapshot indexes.
- `countries/*/repositories/*.json`: repository-level shards.

There is no monolithic `snapshots/opportunities.json` file.

## Raw API Consumption

The front-end consumes this repository through raw GitHub URLs:

```txt
https://raw.githubusercontent.com/openings-dev/data/main/snapshots/opportunities
https://raw.githubusercontent.com/openings-dev/data/main
```

Example:

```ts
const baseUrl =
  "https://raw.githubusercontent.com/openings-dev/data/main/snapshots/opportunities";

const manifest = await fetch(`${baseUrl}/api/manifest.json`).then((response) =>
  response.json(),
);
```

## Build Flow

1. Load environment and repository catalog.
2. Select repositories using optional country and repository limits.
3. Fetch public GitHub issues.
4. Normalize opportunities and enrich metadata.
5. Build segmented snapshots and static API files.
6. Write only changed JSON files.
7. Prune stale snapshot files.

GitHub Actions runs the update workflow on a schedule and commits changed files under `snapshots/opportunities/**`.

## Local Setup

Requirements:

- Node.js `>=20.0.0`
- npm

```bash
npm install
cp .env.example .env
npm run validate
```

`OPENINGS_GITHUB_TOKEN` is optional but recommended to increase GitHub API quota.

Build a snapshot locally:

```bash
npm run build:snapshot
```

## Environment Variables

- `OPENINGS_GITHUB_TOKEN`: optional GitHub token.
- `MAX_ISSUES_PER_REPOSITORY`: default `30`, min `1`, max `100`.
- `MAX_REPOSITORIES`: default `0` (`0` means no cap), max `50000`.
- `REQUEST_DELAY_MS`: default `120`, min `0`, max `10000`.
- `COUNTRY_CODES`: optional comma-separated filter, for example `BR,US,PT`.

## Validation

```bash
npm run validate
```

Validation checks:

- required JSON files exist and parse;
- segmented snapshot structure is valid;
- monolithic legacy snapshot output is forbidden;
- snapshot JSON files stay under the configured line limit;
- source modules stay under the configured line limit;
- JavaScript modules parse successfully.

## Migration Script

`npm run migrate:snapshot` exists only for maintainers converting an old local monolithic snapshot into the segmented layout. New work must keep the segmented static API structure.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

[MIT](./LICENSE)
