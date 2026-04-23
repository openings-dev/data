# Contributing

Thanks for contributing to `openings-data`.

## Scope

This repository only stores and updates data assets used by `openings.dev`:

- catalog of source repositories;
- generated opportunities snapshot;
- data-generation pipeline scripts and workflows.

## Local workflow

1. Use Node `20` (`.nvmrc`).
2. Copy `.env.example` to `.env` (token is optional but recommended).
3. Validate repo:

```bash
npm run validate
```

4. Generate snapshot:

```bash
npm run build:snapshot
```

## Pull requests

- Keep changes focused (catalog update, pipeline change, or docs change).
- Do not commit secrets.
- Ensure `npm run validate` passes before opening the PR.
- If snapshot changes, include it in the PR with the script update that generated it.

