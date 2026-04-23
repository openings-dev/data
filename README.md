# openings-data

Repositório de dados públicos do `openings.dev`.

Este projeto mantém:

- `src/modules/catalog/repositories.json`: catálogo de repositórios fonte.
- `snapshots/opportunities.json`: snapshot normalizado de vagas reais (issues abertas e fechadas do GitHub, ordenadas por atualização).

O front consome o snapshot diretamente, sem backend dedicado.

## Arquitetura

```txt
src/
  app/
    run-build.mjs
  config/
    env.mjs
  modules/
    catalog/
      repositories.json
      catalog-repository.mjs
    github/
    observability/
    opportunities/
    snapshot/
  shared/
    errors/
    utils/
scripts/
  build-opportunities.mjs
```

Princípios aplicados:

- organização por domínio/módulo;
- separação entre orquestração, cliente externo, regra de negócio e persistência de snapshot;
- utilitários compartilhados isolados;
- entrypoint fino em `scripts/`.

## Como funciona

1. O workflow `.github/workflows/update-opportunities.yml` roda em cron.
2. `scripts/build-opportunities.mjs` chama `src/app/run-build.mjs`.
3. O job consulta os repositórios do catálogo e normaliza issues abertas/fechadas mais recentes (`state=all`, `sort=updated`).
4. O snapshot é regravado e commitado apenas quando o `dataHash` muda.

## Setup

1. Crie este repositório como **público**.
2. Garanta que `src/modules/catalog/repositories.json` esteja atualizado.
3. (Opcional, recomendado) Configure o secret `OPENINGS_GITHUB_TOKEN` com um PAT do GitHub.
4. Habilite Actions.
5. Copie `.env.example` para `.env` quando quiser testar localmente.

## Execução local

```bash
npm run validate
npm run build:snapshot
```

Variáveis suportadas:

- `OPENINGS_GITHUB_TOKEN`: token opcional para chamadas autenticadas.
- `MAX_ISSUES_PER_REPOSITORY`: padrão `30` (máx `100`).
- `MAX_REPOSITORIES`: padrão `0` (0 = todos).
- `REQUEST_DELAY_MS`: padrão `120`.

## URL para o front

Use o snapshot bruto do GitHub:

```txt
https://raw.githubusercontent.com/<org>/<repo>/main/snapshots/opportunities.json
```

## Payload

- `generatedAt`: data da geração.
- `dataHash`: hash determinístico do conteúdo funcional.
- `totals`: estatísticas agregadas.
- `items`: vagas normalizadas.
- `byRepository`: contagem por repositório (total, abertas e fechadas).
- `failedRepositories`: erros não bloqueantes por fonte.

Observação: cada item inclui `contentHash` para detectar alterações de conteúdo (título/descrição) mesmo quando o `excerpt` não muda.

## Contribuição

Leia [CONTRIBUTING.md](./CONTRIBUTING.md) antes de abrir PR.

## Licença

[MIT](./LICENSE)
