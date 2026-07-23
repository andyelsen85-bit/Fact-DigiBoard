---
name: DigiBoard i18n conventions
description: Rules for the FR/EN/DE/NL translation system — what must stay French and how namespaces load
---

- Board names (`PréAdmission`, `FactBoard`, `RecoveryBoard`, `Irrecevable`, `Clôturé`) are stored **in French in the DB** and used as API values. Never translate the values sent to or compared with the backend — display-only via `t("common.board." + name)`.
- **Why:** existing production data and route logic key off the French strings; translating values would corrupt board assignment.
- i18n namespaces self-register via side-effect import (`import "@/i18n/dict/<ns>"`) in each consuming component; `common` is built-in, `evaluations` registers in App.tsx. Adding a new namespace without the side-effect import silently falls back to raw keys.
- ICD-10 translations live in per-language DB columns (titleEn/De/Nl etc.), French is the base; seed backfill only fills NULLs. Frontend uses `icdText()` helper with FR fallback.
- App language is a single admin-set setting (`settings.language`), read publicly via `GET /api/language` (login page needs it pre-auth); writes validated to fr|en|de|nl. Default language is **English** (server + client fallbacks); French remains the dictionary fallback for missing keys.
- I.ROC has no official DE/NL versions — those wordings are faithful translations, not official instruments (HoNOS DE/NL use ANQ/Trimbos wordings).
