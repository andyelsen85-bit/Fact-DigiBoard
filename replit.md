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

The Docker image builds and serves both the API and the React frontend from a single container.

## ICD-10 Code Management

Codes stored in `icd10_codes` table (not a static file):
- `code` TEXT PRIMARY KEY, `title`, `description`, `risks`, `is_favorite` BOOLEAN, `created_at`
- API: `GET /api/icd10`, `POST /api/icd10`, `PATCH /api/icd10/:code`, `DELETE /api/icd10/:code`
- Frontend hook: `artifacts/factboard/src/hooks/use-icd10.ts` (uses `localStorage["auth-token"]` for auth)
- Settings page: `ICD10ManagementTable` component — shows all DB codes with ★ favorite toggle, edit, delete
- Favorites (★) = codes where `is_favorite = true` — shown first in patient form dropdown
- Seeded automatically on first run via `seedIcd10Codes()` in `api-server/src/lib/seed.ts`
- **cim10.ts** static file kept for reference only (not imported anywhere)

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
