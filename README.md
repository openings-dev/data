# openings-data

Repositório de dados públicos do `openings.dev`.

Este projeto mantém:

- `src/modules/catalog/repositories.json`: catálogo de repositórios fonte.
- `snapshots/opportunities/index.json`: índice global do snapshot segmentado.
- `snapshots/opportunities/countries/*`: shards por país e por repositório.

## Arquitetura

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

Princípios aplicados:

- segmentação por país (`countries/<countryCode>`);
- shard por repositório para reduzir diffs e commits desnecessários;
- escrita incremental (apenas arquivos alterados);
- validação estrutural para bloquear arquivos gigantes e snapshot monolítico;
- microcomponentes com limite de 100 linhas por arquivo de código.

## Estrutura do snapshot segmentado

```txt
snapshots/
  opportunities/
    index.json
    countries/
      br/
        index.json
        repositories/
          backend-br__vagas.json
      us/
        index.json
        repositories/
          simplifyjobs__summer2026-internships.json
```

- `index.json`: metadados globais e ponteiros para cada país.
- `countries/<code>/index.json`: metadados do país e ponteiros por repositório.
- `countries/<code>/repositories/*.json`: oportunidades por repositório.

## Como funciona

1. O workflow `.github/workflows/update-opportunities.yml` roda em cron (3 em 3 horas).
2. `scripts/build-opportunities.mjs` chama `src/app/run-build.mjs`.
3. O build agrupa repositórios por país, consulta issues do GitHub e normaliza oportunidades.
4. O snapshot segmentado é atualizado apenas nos arquivos que mudaram.

## Setup

1. Crie este repositório como **público**.
2. Garanta que `src/modules/catalog/repositories.json` esteja atualizado.
3. (Opcional, recomendado) Configure o secret `OPENINGS_GITHUB_TOKEN` com um PAT do GitHub.
4. Habilite Actions.
5. Copie `.env.example` para `.env` para testes locais.

## Execução local

```bash
npm run validate
npm run build:snapshot
```

Migração inicial do snapshot legado:

```bash
npm run migrate:snapshot
```

Variáveis suportadas:

- `OPENINGS_GITHUB_TOKEN`: token opcional para chamadas autenticadas.
- `MAX_ISSUES_PER_REPOSITORY`: padrão `30` (máx `100`).
- `MAX_REPOSITORIES`: padrão `0` (0 = todos).
- `REQUEST_DELAY_MS`: padrão `120`.
- `COUNTRY_CODES`: lista opcional separada por vírgula (ex: `BR,US,PT`).

## URL para o front

Use o índice global segmentado:

```txt
https://raw.githubusercontent.com/<org>/<repo>/main/snapshots/opportunities/index.json
```

## Payloads

- `snapshots/opportunities/index.json`: dados globais + `countries[].indexFile`.
- `countries/<code>/index.json`: totais do país + `byRepository[].file`.
- `countries/<code>/repositories/*.json`: oportunidades normalizadas daquele repositório.

## Contribuição

Leia [CONTRIBUTING.md](./CONTRIBUTING.md) antes de abrir PR.

## Licença

[MIT](./LICENSE)
