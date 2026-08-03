# CWMS — Construction Work Management System

Enterprise web application for civil/highway work management (Version 1.0).

**Product source of truth:** `docs/` (Documents 00–15 + `docs/architecture/`).  
**UI visual source of truth:** `ui/stitch-export/` (Stitch HTML + Industrial Precision design system).

## Repository layout

```text
CWMS/
├── docs/                 # Product design package + architecture
├── ui/
│   ├── stitch-export/    # Canonical Stitch screens (use these)
│   ├── design-system/    # CSS tokens from DESIGN.md
│   ├── color-palette/
│   └── screen-images/
├── frontend/             # React + TypeScript + Vite SPA
├── backend/              # NestJS modular monolith + Prisma
├── deploy/
│   ├── docker/           # Local full stack: Postgres + MinIO + API + SPA
│   ├── README.md         # Cloud UAT deploy guide (Neon + R2 + Render/Railway + Pages/Vercel)
│   └── cloud.env.example
├── render.yaml           # Render Blueprint (API)
├── railway.toml          # Railway (API)
├── vercel.json           # Vercel (SPA)
└── scripts/
```

See `docs/architecture/ASSET-LOCATIONS.md` for Stitch duplicate / archive notes.

## Stack (confirmed)

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript + Vite |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL (Prisma) |
| Files | S3-compatible (MinIO local; R2/S3 in cloud) |
| Free hosting target | Pages/Vercel + Render/Railway + Neon + R2 |

Open Questions (Doc 14) use **Document 13 defaults** until Product Owner answers.

## Prerequisites

- Docker Desktop (recommended — runs the full app)
- Node.js 20+ (optional — only for host-side `npm run dev:*` / tests)

## Local setup ritual (required)

| When | Action |
|------|--------|
| **Before** starting a milestone | Pull down: `powershell -File scripts/setup.ps1 -Action down` |
| **After** finishing a milestone | Start up: `powershell -File scripts/setup.ps1 -Action up` |

Recorded as **ED-016** / **ED-017** / **ED-018** in `docs/architecture/ENGINEERING-DECISIONS.md`.

## Quick start (Docker — recommended)


```bash
# Build and start Postgres + MinIO + API + SPA
docker compose -f deploy/docker/docker-compose.yml up -d --build

# Or via ritual script
powershell -File scripts/setup.ps1 -Action up
```

- **App:** http://localhost:8080 (SPA; `/api` proxied to Nest)
- **API health:** http://localhost:3000/api/v1/health
- **Postgres:** localhost:5433
- **MinIO console:** http://localhost:9001 (`cwmsminio` / `cwmsminio_dev_password`)
- **Demo login:** `Administrator` / `Password@123`

Migrations and demo seed run automatically on API container start.

### Optional: host-side Vite / Nest (hot reload)

With Docker infra (or the full stack) already up:

```bash
cp .env.example .env
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
npm run dev:backend   # http://localhost:3000
npm run dev:frontend  # http://localhost:5173
```

Use `DATABASE_URL` with host port **5433** when talking to Docker Postgres from the host.

## Deploy for testers (cloud)

| Path | Guide | Stack |
|------|-------|--------|
| **A** — one VM | [`deploy/path-a/README.md`](deploy/path-a/README.md) | Docker Compose (Postgres + MinIO + API + SPA) |
| **B** — split cloud | [`deploy/path-b/README.md`](deploy/path-b/README.md) | Neon + MinIO + Render/Railway + Pages/Vercel |

Env worksheet (Path B): [`deploy/path-b/env.worksheet.example`](deploy/path-b/env.worksheet.example) · overview: [`deploy/README.md`](deploy/README.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Build & start full Docker stack |
| `npm run docker:down` | Stop Docker stack |
| `npm run docker:ps` | Container status |
| `npm run docker:logs` | Tail compose logs |
| `npm run dev:frontend` | Vite on host |
| `npm run dev:backend` | Nest watch on host |
| `npm run build` | Build API + SPA |
| `npm test` | Workspace tests |
| `npm run lint` | Lint both apps |

## Milestone status

| Milestone | Status |
|-----------|--------|
| **M0** Foundation | Complete |
| **M1** Authentication & Shell | Complete |
| **M2** Masters + Work Core | Complete |
| **M3** Estimate & Schedule | Complete |
| **M4** Documents (MinIO) | Complete |
| **M5** Billing + work rollups | Complete |
| **M6** Expenditure + P/L | Complete |
| **M7** Dashboard KPIs & alerts | Complete |
| **M8** Reports + export | Complete |
| **M9** Backup & restore stub | Complete |

## Engineering decisions

`docs/architecture/ENGINEERING-DECISIONS.md`
