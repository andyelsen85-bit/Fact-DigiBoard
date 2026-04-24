# Threat Model

## Project Overview

DigiBoard is a monorepo-based psychiatric patient management application for case managers and administrators. In production, `artifacts/api-server` exposes an Express API under `/api` and serves the compiled React frontend from `artifacts/factboard`. The application stores highly sensitive patient data, user credentials, session tokens, clinical notes, and configuration data in PostgreSQL through Drizzle ORM.

Production assumptions for this scan:
- `NODE_ENV=production` in deployed environments.
- Replit handles TLS for deployed traffic.
- `artifacts/mockup-sandbox` is a development-only sandbox and is out of scope unless production reachability is demonstrated.

## Assets

- **Patient records and clinical context** — names, addresses, phone numbers, diagnoses, aggression indicators, board placement, notes, history, and free-text observations. Disclosure or tampering would directly impact patient privacy and care.
- **User accounts and sessions** — usernames, password hashes, roles, password-change flags, and bearer session tokens. Compromise enables impersonation and access to the full patient database.
- **Administrative configuration** — user management, shared dropdown/reference data, deleted-patient restore workflows, and ICD-10 catalog data. Unauthorized modification can alter global application behavior for all users.
- **Application secrets and database access** — `DATABASE_URL` and any environment-provided secrets. Compromise would expose the full backing datastore.

## Trust Boundaries

- **Browser to API (`artifacts/factboard` → `artifacts/api-server/src/routes/*`)** — all client input is untrusted, even from authenticated users.
- **API to PostgreSQL (`artifacts/api-server` → `lib/db`)** — route handlers have broad read/write access to sensitive tables; any authorization or validation failure at the API layer reaches the database.
- **Unauthenticated to authenticated** — public auth/bootstrap endpoints (`/api/auth/*`) sit in front of the full patient-management surface.
- **Authenticated to admin** — some capabilities are intended only for administrators, but they rely on server-side role enforcement rather than frontend visibility.
- **Production to dev-only** — `artifacts/mockup-sandbox` is excluded from production analysis unless evidence shows it is served in production.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*`
- **High-risk code areas:** `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/middlewares/auth.ts`, `artifacts/api-server/src/routes/settings.ts`, `artifacts/api-server/src/routes/users.ts`, `artifacts/api-server/src/routes/patients.ts`, `artifacts/api-server/src/routes/notes.ts`, `artifacts/api-server/src/routes/history.ts`, `artifacts/api-server/src/routes/icd10.ts`
- **Authenticated surfaces:** nearly all `/api` routes except health and initial auth/bootstrap endpoints
- **Admin surfaces:** user management in `routes/users.ts`; likely admin-only UI/workflows exposed from `factboard/src/pages/settings.tsx`
- **Usually ignore unless proven reachable in production:** `artifacts/mockup-sandbox/**`

## Threat Categories

### Spoofing

The application uses database-backed bearer session tokens from `Authorization: Bearer ...`. Protected endpoints must reject missing, expired, or invalid tokens on every request, and public bootstrap/authentication endpoints must not let an attacker establish the first privileged identity without an authorized setup path.

### Tampering

Authenticated users can submit broad free-form updates that change patient records, notes, history, shared settings, and reference data. The server must validate input shape and enforce server-side authorization on every write so users cannot change records or global configuration beyond their intended role.

### Information Disclosure

This system handles special-category health information and operational staff data. API responses must stay scoped to authenticated, authorized users only; production logs and errors must not expose patient content, secrets, or stack traces. Dev-only UI artifacts must not become reachable in production.

### Denial of Service

Public auth endpoints and authenticated write-heavy endpoints must resist brute force and abuse. The application should bound request sizes and rate-limit login and other high-value endpoints so attackers cannot exhaust resources or guess credentials online.

### Elevation of Privilege

The most important privilege boundary is regular authenticated user versus administrator. Administrative workflows must be enforced server-side, not only by hiding buttons or routes in the frontend. Route handlers that update shared configuration, deleted records, users, or other global state must require an admin role explicitly.