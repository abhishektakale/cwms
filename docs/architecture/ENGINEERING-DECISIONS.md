# CWMS Engineering Decisions (Implementation Log)

**Status:** Living register — record decisions made during build that are not in product docs.  
**Rule:** Product docs win on conflicts. This file records engineering choices only.

| Date | ID | Decision | Rationale |
|------|-----|----------|-----------|
| 2026-07-31 | ED-001 | Monorepo layout: `docs/`, `ui/`, `frontend/`, `backend/` | PO-confirmed structure |
| 2026-07-31 | ED-002 | SPA: React + TypeScript + Vite | Architecture ADR + free static hosting (Pages/Vercel) |
| 2026-07-31 | ED-003 | API: NestJS + TypeScript modular monolith | Shared language with SPA; module folders map to architecture |
| 2026-07-31 | ED-004 | ORM: Prisma + PostgreSQL | ADR-001; Neon-friendly for free hosting |
| 2026-07-31 | ED-005 | Object storage: S3-compatible (MinIO local; R2/S3 cloud) | DEC-07 / File Storage design |
| 2026-07-31 | ED-006 | Package manager: npm workspaces | Available on machine; no pnpm required |
| 2026-07-31 | ED-007 | API prefix: `/api/v1` | Architecture versioning note |
| 2026-07-31 | ED-008 | Doc 13 defaults for all Doc 14 open questions until PO answers | PO instruction 2026-07-31 |
| 2026-07-31 | ED-009 | Missing Stitch screens derived from Screen Spec + Design System | Stitch handoff gap audit; flagged in UI reviews |
| 2026-07-31 | ED-010 | Product docs keep existing filenames (`00-…` … `15-…` + `architecture/`) | Traceability; do not renumber to alternate short names |
| 2026-07-31 | ED-011 | Canonical Stitch path is `ui/stitch-export/`; `docs/design/stitch-cwms-v1-handoff` kept as identical archive; `stitch-review/` deleted (superseded incomplete set) | Duplicate audit — see ASSET-LOCATIONS.md |
| 2026-07-31 | ED-012 | Remember Me cookie `CWMSREMEMBER`; duration 14 days (A-SEC-06) | Auth design default |
| 2026-07-31 | ED-013 | Demo `login_id` = role display name; `role_code` = OpenAPI enum | BR-SEC-03 + OpenAPI Role |
| 2026-07-31 | ED-014 | Local Docker Postgres published on host **5433** (avoid conflict with other local PG on 5432) | Dev environment |
| 2026-07-31 | ED-015 | Dashboard body placeholder until alerts/KPI milestone; shell+nav in M1 | Architecture M1 exit |
| 2026-07-31 | ED-016 | Dev ops ritual: **before each milestone** tear down local setup; **after each milestone** start setup for verification | PO instruction 2026-07-31 |
| 2026-07-31 | ED-017 | Full local stack in Docker Compose: Postgres + MinIO + API + SPA (nginx proxies `/api` → backend); app URL `http://localhost:8080` | PO: manage app setup in Docker |
| 2026-08-03 | ED-018 | Cloud UAT split deploy: Neon + R2 + Render/Railway API + Pages/Vercel SPA; cross-origin cookies via `COOKIE_SAMESITE=none` + `COOKIE_SECURE`; configs in `render.yaml` / `railway.toml` / `frontend/vercel.json` / `deploy/path-b/` | PO: deploy for testers on free/cheap stack |

## Free hosting target (initial)

| Concern | Target |
|---------|--------|
| Frontend | Cloudflare Pages or Vercel |
| Backend | Render / Railway |
| Database | Neon PostgreSQL |
| Files | Cloudflare R2 |

**How to deploy:** see [`deploy/README.md`](../../deploy/README.md) and [`deploy/cloud.env.example`](../../deploy/cloud.env.example).
