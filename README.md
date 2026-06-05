# Boss Raid Quest Tracker

Tracker de quests para raids com **Fastify + Prisma + PostgreSQL** no backend e **Next.js 16 + React 19 + Tailwind 4** no frontend. Desenvolvido com TDD, Clean Architecture, dark mode, paginacao e testes E2E com Playwright.

## Indice

- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao](#configuracao)
- [Como rodar](#como-rodar)
- [Banco de dados](#banco-de-dados)
- [Testes](#testes)
- [CI](#ci)
- [Convencoes](#convencoes)
- [Endpoints da API](#endpoints-da-api)
- [Tarefas pendentes / ideias futuras](#tarefas-pendentes--ideias-futuras)

## Stack

### Backend

| Camada         | Tecnologia                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js 20+                         |
| Linguagem      | TypeScript 5 (strict)               |
| Framework HTTP | Fastify 5                           |
| Validacao      | Zod 3                               |
| ORM            | Prisma 6                            |
| Banco          | PostgreSQL 15                       |
| Testes         | Vitest 2 + @vitest/coverage-v8      |
| Dev runtime    | tsx watch                           |
| CORS           | @fastify/cors                       |

### Frontend

| Camada         | Tecnologia                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| UI             | React 19                            |
| Estilizacao    | Tailwind CSS 4                      |
| Formularios    | react-hook-form 7 + Zod 4           |
| Data fetching  | TanStack Query 5                    |
| Toasts         | sonner                              |
| Testes         | Vitest 2 + Testing Library 16 + happy-dom 15 |
| E2E            | @playwright/test 1.60 (chromium)    |

## Arquitetura

Clean Architecture em camadas finas. O backend segue o fluxo `rota -> service -> repository`:

```
HTTP Request
   |
   v
[Rota Fastify]  --> valida entrada (Zod), delega para service, formata resposta
   |
   v
[Service]       --> regras de negocio, orquestra repositories, mapeia erros de dominio
   |
   v
[Repository]    --> interface (contrato) + implementacao Prisma, isola persistencia
   |
   v
[Prisma Client] --> queries SQL type-safe
   |
   v
[PostgreSQL]
```

Princípios aplicados:
- **Rotas finas**: nenhuma regra de negocio em `routes/`.
- **Service orquestra, repository executa**: services nao conhecem Prisma.
- **Erros de dominio tipados**: `ResourceNotFoundError`, etc., mapeados no repository (boundary).
- **DTOs custom**: `CreateQuestData` / `UpdateQuestData` no service desacoplam tipos do Prisma.
- **Soft delete**: `deletadoEm` em todas as queries; delete logico retorna 404 quando ja deletado.
- **TDD obrigatorio**: services e repositories com testes (RED -> GREEN -> REFACTOR).
- **CORS whitelist**: `FRONTEND_URL` controla origens permitidas; preflight inclui PATCH/DELETE.

## Estrutura do projeto

```
Boss-Raid-Quest-Tracker/
|-- backend (raiz do backend)
|   |-- docker-compose.yml            # Postgres 15-alpine
|   |-- package.json
|   |-- tsconfig.json
|   |-- vitest.config.ts
|   |-- .env.example                  # template de variaveis
|   |-- prisma/
|   |   |-- schema.prisma             # model Quest
|   |   |-- seed.ts                   # 8 quests de exemplo (idempotente)
|   |   `-- migrations/
|   |-- src/
|   |   |-- server.ts                 # bootstrap Fastify
|   |   |-- config/
|   |   |   |-- env.ts                # Zod env schema
|   |   |   `-- cors.ts               # buildCorsOptions(frontendUrl)
|   |   |-- schemas/
|   |   |   |-- quest.schema.ts       # create/update quest
|   |   |   |-- quest-id.schema.ts    # UUID validator
|   |   |   `-- pagination.schema.ts  # page/limit Zod
|   |   |-- services/
|   |   |   `-- quest.service.ts
|   |   |-- repositories/
|   |   |   |-- quest.repository.ts   # interface
|   |   |   `-- prisma/
|   |   |       `-- quest.repository.prisma.ts
|   |   `-- routes/
|   |       `-- quests.routes.ts
|   `-- tests/
|       `-- unit/
|           |-- config/
|           |-- schemas/
|           |-- repositories/
|           |-- services/
|           `-- routes/
|
|-- frontend/                         # Next.js 16
|   |-- package.json
|   |-- tsconfig.json
|   |-- vitest.config.ts
|   |-- playwright.config.ts          # E2E (reusa dev servers)
|   |-- next.config.ts
|   |-- .env.local                    # NEXT_PUBLIC_API_URL
|   |-- e2e/
|   |   `-- quest-crud.spec.ts        # 1 teste happy path
|   `-- src/
|       |-- app/                      # App Router
|       |   |-- layout.tsx            # ThemeProvider + ThemeToggle
|       |   |-- page.tsx              # dashboard com paginacao + stats
|       |   |-- nova/page.tsx         # criar quest
|       |   `-- quests/[id]/page.tsx  # editar quest
|       |-- components/
|       |   |-- pagination.tsx
|       |   |-- quest-form.tsx
|       |   |-- quest-list.tsx
|       |   |-- quest-filters.tsx
|       |   |-- stats-cards.tsx
|       |   |-- delete-quest-button.tsx
|       |   |-- theme-provider.tsx
|       |   `-- theme-toggle.tsx
|       |-- lib/
|       |   |-- api.ts                # questsApi (typed fetch)
|       |   |-- schemas.ts            # Zod (frontend)
|       |   |-- stats.ts              # computeStats + filterQuests
|       |   `-- theme.ts              # localStorage + system preference
|       |-- types/
|       |   `-- quest.ts
|       `-- test/                     # setup, utilities
`-- .github/
    `-- workflows/
        `-- ci.yml                    # 4 jobs: backend, frontend, coverage, frontend-coverage
```

## Pre-requisitos

- **Node.js 20+** (testado em 20 LTS)
- **Docker** + Docker Compose v2 (para Postgres local)
- **Git**
- **Windows / macOS / Linux** (comandos abaixo assumem PowerShell no Windows; troque `&&` por `;` se precisar em cmd)

## Configuracao

### 1. Clonar e instalar

```powershell
git clone https://github.com/Frankwra/Boss-Raid-Quest-Tracker.git
cd Boss-Raid-Quest-Tracker

# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 2. Variaveis de ambiente

Crie `boss-raid-quest-tracker/.env` (copie de `.env.example` se existir, ou use o modelo abaixo):

```env
# Postgres
POSTGRES_USER=quest
POSTGRES_PASSWORD=quest
POSTGRES_DB=quest_tracker
POSTGRES_PORT=5432

# Backend
DATABASE_URL=postgresql://quest:quest@localhost:5432/quest_tracker
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Crie `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Como rodar

### Modo desenvolvimento (3 terminais)

```powershell
# Terminal 1 - Postgres
docker compose up -d

# Terminal 2 - Backend (porta 3333)
npm run db:migrate     # primeira vez: cria as tabelas
npm run db:seed        # primeira vez: popula com 8 quests
npm run dev            # tsx watch

# Terminal 3 - Frontend (porta 3000)
cd frontend
npm run dev
```

Acesse: **http://localhost:3000**

### Modo producao

```powershell
# Backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Resetar banco e seedar novamente

```powershell
npm run db:reset-seed   # apaga tudo, recria migrations, roda seed
```

## Banco de dados

### Schema

```prisma
model Quest {
  id           String    @id @default(uuid())
  titulo       String
  descricao    String?
  xp           Int       @default(0)
  concluida    Boolean   @default(false)
  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt
  deletadoEm   DateTime?           // soft delete

  @@map("quests")
}
```

### Seed

`prisma/seed.ts` cria 8 quests de exemplo (mix de concluidas/pendentes, varios niveis de XP). E idempotente: se as quests ja existem, nao duplica.

## Testes

### Backend (80 testes, coverage 88.88%)

```powershell
npm test                # roda uma vez
npm run test:watch      # watch mode
npm run test:coverage   # com coverage
```

Estrutura: `tests/unit/{config,schemas,repositories,services,routes}/`.

### Frontend (106 testes, coverage 95.64%)

```powershell
cd frontend
npm test                # vitest run
npm run test:watch      # watch mode
npm run test:coverage   # com coverage
```

Estrutura: `src/lib/*.test.ts`, `src/components/*.test.tsx`.

### E2E (1 teste happy path)

```powershell
cd frontend
npx playwright install chromium   # primeira vez
npm run e2e                       # roda contra dev servers
npm run e2e:ui                    # modo UI (debug)
```

Cenario coberto: criar quest, ver na lista, marcar como concluida, deletar.

## CI

GitHub Actions em `.github/workflows/ci.yml` com 4 jobs paralelos:

| Job                 | O que faz                                              |
| ------------------- | ------------------------------------------------------ |
| `backend`           | typecheck + vitest (backend) em Node 20                |
| `frontend`          | typecheck + vitest (frontend) em Node 20               |
| `coverage`          | gera coverage do backend + artifact (gate 80/80/80/70) |
| `frontend-coverage` | gera coverage do frontend + artifact (gate 80/80/80/70) |

Gate de coverage falha o build se qualquer uma das metricas (lines/branches/funcs/statements) ficar abaixo de **80/80/80/70**.

## Convencoes

### Branches

- `feat/<descricao-curta>` — nova feature
- `fix/<descricao-curta>` — correcao de bug
- `chore/<descricao-curta>` — manutencao (deps, CI, configs)
- `test/<descricao-curta>` — testes sem mudanca de comportamento

### Commits (Conventional Commits, em pt-BR)

```
<tipo>(<escopo>): <descricao em portugues>

<corpo opcional>

<rodape opcional>
```

Tipos: `feat`, `fix`, `chore`, `test`, `refactor`, `docs`, `style`, `perf`.

Exemplos:
- `feat(api): adiciona paginacao em GET /api/quests`
- `fix(frontend): remove conflito de dark mode no globals`
- `test(backend): cobre service de criar quest com erro de validacao`

### Pull Requests

- Branches `feat/*`/`fix/*`/`chore/*` sao mergeadas em `main` via PR.
- Commits atomicos (cada commit = 1 mudanca logica).
- Rebase em `main` antes de abrir PR.
- Titulo do PR segue Conventional Commits.

### TDD

- Services e repositories: testes primeiro.
- Rotas e schemas: testes sao obrigatorios.
- Configuracoes (env, cors): testes sao obrigatorios.

## Endpoints da API

Base URL: `http://localhost:3333`

### `GET /api/quests`

Lista quests com paginacao.

**Query params** (opcionais):
- `page` (int, >= 1, default 1)
- `limit` (int, 1..100, default 10)

**Resposta 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Derrotar o dragao ancião",
      "descricao": null,
      "xp": 500,
      "concluida": false,
      "criadoEm": "2026-06-05T18:00:00.000Z",
      "atualizadoEm": "2026-06-05T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

**Resposta 400**: query invalida (ZodError).

### `GET /api/quests/:id`

Retorna uma quest por ID.

**Resposta 200**: objeto Quest.
**Resposta 404**: quest nao encontrada ou deletada.

### `POST /api/quests`

Cria uma quest.

**Body**:
```json
{
  "titulo": "string (obrigatorio, 1..200)",
  "descricao": "string (opcional, max 1000)",
  "xp": "int (>= 0, default 0)"
}
```

**Resposta 201**: objeto Quest criado.
**Resposta 400`: body invalido (ZodError).

### `PATCH /api/quests/:id`

Atualiza uma quest (campos parciais).

**Body** (todos opcionais):
```json
{
  "titulo": "string",
  "descricao": "string | null",
  "xp": "int",
  "concluida": "boolean"
}
```

**Resposta 200**: objeto Quest atualizado.
**Resposta 400**: body invalido.
**Resposta 404**: quest nao encontrada.

### `DELETE /api/quests/:id`

Soft delete de uma quest.

**Resposta 204**: sucesso (sem body).
**Resposta 404**: quest nao encontrada ou ja deletada.

### Erros

Todos os erros seguem o formato do Fastify:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error"
}
```

## Tarefas pendentes / ideias futuras

- [ ] E2E no CI (job com `docker compose up` + Playwright + cleanup)
- [ ] Mais cenarios E2E (filtros, paginacao, dark mode toggle, validacao de formulario)
- [ ] Suporte a Firefox/WebKit nos testes E2E
- [ ] Autenticacao de usuarios (hoje single-user)
- [ ] Historico de alteracoes (audit log)
- [ ] Tags/categorias em quests
- [ ] Exportar quests (JSON / CSV)
- [ ] Dockerfile do backend e frontend (deploy)

---

**Licenca**: privado. **Autor**: [Frankwra](https://github.com/Frankwra).
