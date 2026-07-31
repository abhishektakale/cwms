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
├── deploy/docker/        # Local Postgres + MinIO
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

- Node.js 20+
- Docker (for local Postgres + MinIO)

## Local setup ritual (required)

| When | Action |
|------|--------|
| **Before** starting a milestone | Pull down: `powershell -File scripts/setup.ps1 -Action down` |
| **After** finishing a milestone | Start up: `powershell -File scripts/setup.ps1 -Action up`, then `npm run dev:backend` and `npm run dev:frontend` |

Recorded as **ED-016** in `docs/architecture/ENGINEERING-DECISIONS.md`.

## Quick start


```bash
# 1. Infrastructure (Postgres on host port 5433, MinIO 9000/9001)
docker compose -f deploy/docker/docker-compose.yml up -d

# 2. Environment
cp .env.example .env
cp .env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Install (npm workspaces)
npm install

# 4. Migrate + seed demo users
cd backend
npx prisma migrate deploy
npx prisma db seed
cd ..

# 5. Run API + SPA
npm run dev:backend
npm run dev:frontend
```

- SPA: http://localhost:5173  
- API health: http://localhost:3000/api/v1/health  
- MinIO console: http://localhost:9001 (`cwmsminio` / `cwmsminio_dev_password`)
- Demo login: `Administrator` / `Password@123` (also Data Entry Operator, Engineer, Accounts, Viewer)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Vite dev server |
| `npm run dev:backend` | Nest watch mode |
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
