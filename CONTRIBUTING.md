# Contributing to openings-data

Thanks for contributing to the `openings.dev` data layer.

## Scope

This repository owns:

- source repository catalog entries;
- GitHub issue ingestion and normalization;
- segmented opportunity snapshots;
- static API files consumed by the front-end;
- validation and build scripts for the data pipeline.

Front-end UI work belongs in `openings-dev/openings`.

## Data Contract Rules

- Keep `snapshots/opportunities/**` segmented.
- Do not reintroduce `snapshots/opportunities.json`.
- Keep generated API files under `snapshots/opportunities/api/**`.
- Keep source repositories in `src/modules/catalog/repositories.json`.
- Do not commit secrets or private source data.
- Do not add mock datasets as substitutes for the generated snapshots.

The front-end consumes this repository only through raw GitHub URLs. Do not require the front-end to import local JSON files.

## Local Workflow

Requirements:

- Node.js `>=20.0.0`
- npm

```bash
npm install
cp .env.example .env
npm run validate
```

`OPENINGS_GITHUB_TOKEN` is optional but recommended for local snapshot builds.

Build snapshots:

```bash
npm run build:snapshot
```

## Adding a Source Repository

Update `src/modules/catalog/repositories.json` with:

- `repository`: `owner/name`
- `url`: GitHub repository URL
- `country`: human-readable country name
- `countryCode`: uppercase country code or `GLOBAL`
- `region`: human-readable region

After editing the catalog, run:

```bash
npm run validate
npm run build:snapshot
```

Commit catalog changes together with any generated snapshot changes when the dataset changes.

## Pull Requests

Keep pull requests focused on one type of change:

- catalog update;
- pipeline or normalization update;
- validation update;
- documentation update.

Before opening a pull request:

- [ ] `npm run validate` passes.
- [ ] Generated snapshots are included when data output changed.
- [ ] No secrets are committed.
- [ ] No monolithic snapshot file was added.
- [ ] Raw API file paths remain compatible with the front-end.
