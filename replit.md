# DigiBoard — Psychiatric Patient Management

## Overview

Full-stack patient management web app for Luxembourg psychiatric case managers. pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo**: pnpm workspaces
- **Backend**: Express 5 + PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS 4 + TanStack Query
- **Auth**: Custom session token (bcrypt, stored in DB)
- **API codegen**: Orval (OpenAPI → React Query hooks)
- **Build**: esbuild (API), Vite (frontend)

## Key Details

- **API server (dev)**: port 8080, path `/api`
- **Frontend (dev)**: port 18576, path `/`
- **Production container**: single process on port 80 (API + static frontend served together)
- **Patient ID**: Auto-generated as `FACT-XXXX` (zero-padded to 4 digits, based on DB id)
- **Boards**: PréAdmission → FactBoard → RecoveryBoard → Irrecevable → Clôturé
- **Clôturé view**: Shows ALL board-specific sections (phase, recovery, infos, motif)
- **HTTP methods**: Generated client uses PATCH; server accepts both PUT and PATCH for all update routes
- **Board filter**: `GET /api/patients?board=X` — PatientList passes params directly (not wrapped in `{ params }`)

## API Route Notes

All patient update sub-routes accept both PUT and PATCH:
- `PATCH /api/patients/:id` — update patient
- `PATCH /api/patients/:id/board` — move board  
- `PATCH /api/patients/:id/phase` — update phase
- `PATCH /api/patients/:id/passages` — weekly passages
- `PATCH /api/patients/:id/recovery` — recovery board fields
- `PATCH /api/patients/:id/infos-recoltees` — pre-admission info
- `PATCH /api/patients/:id/motif-irrecevable` — rejection reason

## Docker Deployment

```bash
# Start with Docker Compose (includes PostgreSQL)
docker compose up -d

# Environment variables:
# POSTGRES_PASSWORD — DB password (default: digiboard_secret)
# SESSION_SECRET    — session signing secret (CHANGE IN PRODUCTION)
# APP_PORT          — host port to expose (default: 80)
```

The Docker image builds and serves both the API and the React frontend from a single container on **port 80**.

**Schema migrations run automatically on startup** — no manual `drizzle-kit push` required. The server applies `lib/db/drizzle/0000_slow_silk_fever.sql` (idempotent: uses `CREATE TABLE IF NOT EXISTS`) before seeding data. On a completely fresh database it creates all 9 tables; on an existing database it skips silently.

## ICD-10 Code Management

Codes stored in `icd10_codes` table (not a static file):
- `code` TEXT PRIMARY KEY, `title`, `description`, `risks`, `is_favorite` BOOLEAN, `created_at`
- API: `GET /api/icd10`, `POST /api/icd10`, `PATCH /api/icd10/:code`, `DELETE /api/icd10/:code`
- Frontend hook: `artifacts/factboard/src/hooks/use-icd10.ts` (uses `localStorage["auth-token"]` for auth)
- Settings page: `ICD10ManagementTable` component — shows all DB codes with ★ favorite toggle, edit, delete
- Favorites (★) = codes where `is_favorite = true` — shown first in patient form dropdown
- Seeded automatically on first run via `seedIcd10Codes()` in `api-server/src/lib/seed.ts`
- **cim10.ts** static file kept for reference only (not imported anywhere)

## iRock / HoNOS Evaluations

Clinical evaluation tools accessible from each patient's detail view:

- **Tables**: `irock_evaluations` (10 questions, q1–q10) and `honos_evaluations` (12 questions, q1–q12) — both linked via `patient_id` FK
- **Migration**: `lib/db/drizzle/0001_irock_honos_evaluations.sql` — applied automatically on startup
- **API routes** (`artifacts/api-server/src/routes/evaluations.ts`):
  - `GET /api/patients/:id/irock` — list iRock evaluations
  - `POST /api/patients/:id/irock` — create iRock evaluation
  - `PATCH /api/patients/:id/irock/:eid` — update iRock evaluation
  - `DELETE /api/patients/:id/irock/:eid` — delete iRock evaluation
  - Same pattern for `/honos`
  - `GET /api/patients/:id/kpi` — board stability stats (first eval, last eval, mean score)
  - `GET /api/patients-selector` — lightweight list for dropdowns (id, prenom, nom, board)
- **Frontend hooks**: `artifacts/factboard/src/hooks/use-evaluations.ts`
- **EvaluationModal**: `artifacts/factboard/src/components/EvaluationModal.tsx` — shared form for both tools
- **PatientKpiView**: `artifacts/factboard/src/components/PatientKpiView.tsx` — per-question LineCharts + board stability panel (accessible via "Patient KPI" nav tab)
- **Scoring**: 0=Jamais→4=Toujours (iRock), 0=Aucun→4=Grave (HoNOS)
- **Stats**: `GET /api/stats` returns `irockCount` and `honosCount`; displayed as cards in StatsView

## Docker / Alpine Native Binaries

The lock file is generated on glibc Linux (Replit), so musl-specific native binaries are excluded by default. All three are pinned explicitly in `artifacts/factboard/package.json` → `optionalDependencies` so pnpm locks their SHA512 integrity and installs them on Alpine:

- `@rollup/rollup-linux-x64-musl` — Vite bundler
- `@tailwindcss/oxide-linux-x64-musl` — Tailwind 4 Rust engine
- `lightningcss-linux-x64-musl` — CSS compiler

If a future upgrade adds a new native dependency, add its musl variant here and re-run `pnpm install`.

## Orval Codegen Workaround

After running orval: set `lib/api-zod/src/index.ts` to only `export * from "./generated/api";`

## Key Commands

- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/factboard run dev` — run frontend
- `docker compose up --build` — build and run in Docker
