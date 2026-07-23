---
name: K8s DB startup ordering
description: Why the API server retries migrations and gates listen() on DB readiness.
---

Rule: the API server must fully apply migrations + seed (retrying with backoff while Postgres comes up) BEFORE calling `app.listen`, and `process.exit(1)` if the DB never becomes ready.

**Why:** User deploys the Docker image on Kubernetes, where there is no `depends_on`/healthcheck ordering like Docker Compose. The original fire-and-forget migration swallowed connection errors, so the pod served traffic against an empty DB (`relation "users" does not exist`). Fixed July 2026.

**How to apply:** Any change to server bootstrap must preserve: retry loop around migrations/seed, listen only after success, exit non-zero on final failure so the orchestrator restarts the pod. Seed must stay idempotent since it can rerun on retries.
