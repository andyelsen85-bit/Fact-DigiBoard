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

- **API server**: port 8080, path `/api`
- **Frontend**: port 18576, path `/`
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

## Orval Codegen Workaround

After running orval: set `lib/api-zod/src/index.ts` to only `export * from "./generated/api";`

## Key Commands

- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/factboard run dev` — run frontend
- `docker compose up --build` — build and run in Docker
