# Contributing

Thanks for contributing to `openings-data`.

## Scope

This repository stores and updates data assets used by `openings.dev`:

- source repository catalog;
- segmented opportunities snapshots;
- data-generation pipeline scripts and workflows.

## Local workflow

1. Use Node `20` (`.nvmrc`).
2. Copy `.env.example` to `.env` (token is optional but recommended).
3. Validate repo:

```bash
npm run validate
```

4. Build segmented snapshot:

```bash
npm run build:snapshot
```

## Pull requests

- Keep changes focused (catalog update, pipeline change, or docs change).
- Do not commit secrets.
- Ensure `npm run validate` passes before opening the PR.
- Include changed files under `snapshots/opportunities/**` when snapshot data updates.
- Do not reintroduce `snapshots/opportunities.json` monolithic file.
