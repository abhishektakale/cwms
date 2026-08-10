# CWMS — Deploy guide (what goes where, and how)

Use this when sharing a **tester / UAT** build on the free/cheap cloud stack.

Local Docker (`npm run docker:up` → http://localhost:8080) is separate and unchanged.

---

## Big picture

```text
  Testers' browsers
         │
         ▼
  ┌──────────────────────────┐
  │  SPA (static site)       │  Cloudflare Pages  OR  Vercel
  │  React build             │  URL e.g. https://cwms.pages.dev
  └────────────┬─────────────┘
               │  HTTPS + cookies (credentials)
               ▼
  ┌──────────────────────────┐
  │  API (Docker container)  │  Render  OR  Railway
  │  NestJS + Prisma         │  URL e.g. https://cwms-api.onrender.com
  └──────┬───────────┬───────┘
         │           │
         ▼           ▼
  ┌──────────┐  ┌────────────────┐
  │ Postgres │  │ Object storage │
  │  Neon    │  │ Cloudflare R2  │
  └──────────┘  └────────────────┘
```

| Piece | What it is | Where you put it | Repo config |
|-------|------------|------------------|-------------|
| **DB** | PostgreSQL data | **Neon** | `DATABASE_URL` on the API |
| **Files** | Uploaded documents / backups bucket | **Cloudflare R2** | `S3_*` on the API |
| **API** | Nest backend (login, CRUD, reports) | **Render** or **Railway** | `Dockerfile.backend`, `render.yaml` / `railway.toml` |
| **SPA** | React UI testers open in the browser | **Vercel** or **Cloudflare Pages** | `frontend/vercel.json`, `_redirects`, `VITE_API_BASE_URL` |

**Recommended Path A (one VM + MinIO):** [`path-a/README.md`](./path-a/README.md).  
**Recommended Path B (split cloud + R2):** [`path-b/README.md`](./path-b/README.md).

**Path B files:** Cloudflare R2 (`S3_*` from [`cloud.env.example`](./cloud.env.example), `S3_FORCE_PATH_STYLE=false`).  
**If skipping files:** omit all `S3_*` (health `storage: skipped`, uploads disabled).

Env template: [`cloud.env.example`](./cloud.env.example).

---

## Deploy shapes

### Path A — One VM + full Docker Compose (simplest with MinIO)

Everything (Postgres, MinIO, API, SPA) on one server. No Neon, no R2, no Pages required.

```text
Testers → https://your-domain  (Caddy → :8080 nginx SPA)
                └─ /api → backend → postgres + minio (Docker network)
```

| Piece | Where |
|-------|--------|
| DB | Compose `postgres` |
| Files | Compose `minio` (+ `minio-init` creates buckets) |
| API | Compose `backend` |
| SPA | Compose `frontend` |

**Steps**

1. Rent a small Ubuntu VM (Oracle Always Free, Hetzner, Lightsail, etc.). Open ports **80** and **443**.
2. Install Docker.
3. Clone the repo on the VM:

```bash
git clone https://github.com/abhishektakale/cwms.git
cd cwms
```

4. Change default passwords in `deploy/docker/docker-compose.yml` (Postgres, MinIO, and later demo users).
5. For public HTTPS, set backend env in compose:
   - `CORS_ORIGIN=https://your-domain.com`
   - `COOKIE_SAMESITE=lax` (same origin via nginx — keep **lax**, not `none`)
   - `COOKIE_SECURE=true`
   - Keep MinIO as internal (`S3_ENDPOINT=http://minio:9000`, `S3_FORCE_PATH_STYLE=true`) — do **not** need to expose MinIO ports publicly.
6. Start:

```bash
docker compose -f deploy/docker/docker-compose.yml up -d --build
```

7. Put Caddy (or nginx) in front of `localhost:8080` with HTTPS for `your-domain.com`.
8. Testers open `https://your-domain.com`. Login: `Administrator` / `Password@123`.

**Updates:** `git pull` then `docker compose -f deploy/docker/docker-compose.yml up -d --build`.

This is the path of least friction when you want real file uploads without R2/card.

---

### Path B — Split cloud: Neon + R2 + API + SPA

```text
SPA (Vercel/Pages) → API (Render/Railway) → Neon
                                   └──────→ Cloudflare R2
```

| Piece | Service |
|-------|---------|
| DB | Neon |
| Files | **Cloudflare R2** |
| API | Render / Railway |
| SPA | Vercel (recommended) / Pages |

Full steps: [`path-b/README.md`](./path-b/README.md) · Render: [`path-b/RENDER.md`](./path-b/RENDER.md) · Vercel: [`path-b/VERCEL.md`](./path-b/VERCEL.md).

**Alternate files for Path B:** a public MinIO HTTPS endpoint works with the same `S3_*` keys (`S3_FORCE_PATH_STYLE=true`). Prefer R2 for free-tier UAT.

---

## Before you start

1. Code with cloud deploy support is on GitHub (`main`).
2. Open a notes file and fill these in as you go:

| Slot | Your value |
|------|------------|
| Neon `DATABASE_URL` | |
| R2 account id / endpoint | |
| R2 access key / secret | |
| API public URL | `https://________` |
| SPA public URL | `https://________` |

3. Order matters: **Neon → R2 → API → SPA → fix CORS on API**.

---

## Piece 1 — Database → Neon

**Why:** API needs Postgres. Neon is free-tier friendly and works with Prisma.

### How

1. Go to [https://neon.tech](https://neon.tech) → sign in → **New Project**.
2. Name the project (e.g. `cwms-uat`), create database `cwms` (or use default and rename later).
3. Open **Dashboard → Connection details**.
4. Choose the **pooled** connection string (host contains `-pooler`).
5. Ensure it ends with `?sslmode=require` (add if missing).
6. Paste into your notes as `DATABASE_URL`.

**You do not** run migrations from your laptop for UAT. The API container runs `prisma migrate deploy` on start.

---

## Piece 2 — Files → Cloudflare R2

**Why:** Document uploads use S3-compatible storage. R2 replaces local MinIO in the cloud.

### How

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**.
2. **Create bucket** `cwms-documents`.
3. **Create bucket** `cwms-backups`.
4. **Manage R2 API Tokens** → **Create API token**:
   - Permission: Object Read & Write (or Admin Read & Write for simplicity on UAT).
   - Apply to both buckets (or entire account for UAT).
5. Copy **Access Key ID** and **Secret Access Key**.
6. Find your **Account ID** (R2 overview / sidebar).
7. Build endpoint:

```text
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Also set on the API later:

```text
S3_REGION=auto
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET_DOCUMENTS=cwms-documents
S3_BUCKET_BACKUPS=cwms-backups
S3_FORCE_PATH_STYLE=false
```

---

## Piece 3 — API → Render (or Railway)

**Why:** Runs the Nest Docker image: HTTP API, migrations, seed, talks to Neon + R2.

**Repo files:** `deploy/docker/Dockerfile.backend`, `render.yaml`, `railway.toml`, entrypoint migrates + seeds.

### Option A — Render (recommended)

1. Push latest `main` to GitHub.
2. [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → select repo  
   *(uses `render.yaml`)*  
   **Or** **New → Web Service** manually:
   - Connect GitHub repo
   - Runtime: **Docker**
   - Dockerfile path: `deploy/docker/Dockerfile.backend`
   - Docker build context: repository **root** (`.`)
   - Health check path: `/api/v1/health`
3. Add environment variables (Render → Environment):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `API_PREFIX` | `api/v1` |
| `DATABASE_URL` | *(Neon pooled URL)* |
| `CORS_ORIGIN` | *(SPA URL — set after SPA exists; temporary `https://example.com` ok)* |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY` | *(R2)* |
| `S3_SECRET_KEY` | *(R2)* |
| `S3_BUCKET_DOCUMENTS` | `cwms-documents` |
| `S3_BUCKET_BACKUPS` | `cwms-backups` |
| `S3_FORCE_PATH_STYLE` | `false` |
| `CWMS_SEED` | `true` |
| `SESSION_IDLE_TIMEOUT_MINUTES` | `30` |
| `REMEMBER_ME_DAYS` | `14` |
| `PROFIT_LOSS_MODE` | `gross_minus_expenditure` |

4. Deploy. Copy the service URL, e.g. `https://cwms-api.onrender.com`.
5. Smoke test:

```bash
curl https://cwms-api.onrender.com/api/v1/health
```

Expect `"status":"ok"` and database/storage checks up.

### Option B — Railway (alternative)

1. [https://railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Railway reads `railway.toml` → Dockerfile `deploy/docker/Dockerfile.backend`.
3. **Variables** tab: same keys as the Render table above.
4. **Settings → Networking → Generate domain**.
5. Health check path: `/api/v1/health`.
6. Smoke the `/api/v1/health` URL the same way.

---

## Piece 4 — SPA → Cloudflare Pages (or Vercel)

**Why:** Testers open this URL. It is only static files; all data calls go to the API.

**Critical build env:** `VITE_API_BASE_URL` must be the **public API** + `/api/v1` (baked in at build time).

### Option A — Cloudflare Pages (recommended)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → Connect to Git.
2. Select the CWMS repo / `main`.
3. Build settings:

| Field | Value |
|-------|--------|
| Framework preset | None |
| Root directory | `/` (repo root) |
| Build command | `npm ci && npm run build -w frontend` |
| Build output directory | `frontend/dist` |

4. **Environment variables** (Production):

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://cwms-api.onrender.com/api/v1` *(your real API)* |

5. Save and deploy. Copy SPA URL, e.g. `https://cwms.pages.dev`.
6. Client-side routes are handled by `frontend/public/_redirects`.

### Option B — Vercel (recommended for Path B)

1. [https://vercel.com](https://vercel.com) → Import GitHub repo.
2. **Root Directory** = `frontend` (uses [`frontend/vercel.json`](../frontend/vercel.json) with `/api` → Render proxy).
3. Project → **Settings → Environment Variables**:

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `/api/v1` |

4. Deploy. Copy the Vercel URL (and add it to API `CORS_ORIGIN`). See [`path-b/VERCEL.md`](./path-b/VERCEL.md).

---

## Piece 5 — Connect SPA ↔ API (required)

Because SPA and API are on **different domains**, login cookies only work if:

| Where | Variable | Must be |
|-------|----------|---------|
| API | `CORS_ORIGIN` | Exact SPA origin, e.g. `https://cwms.pages.dev` (no trailing slash) |
| API | `COOKIE_SAMESITE` | `none` |
| API | `COOKIE_SECURE` | `true` |
| SPA build | `VITE_API_BASE_URL` | `https://YOUR_API/api/v1` |

### After first SPA deploy

1. Edit API env: set `CORS_ORIGIN` to the real SPA URL.
2. Redeploy / restart the API service.
3. If you change `VITE_API_BASE_URL`, **rebuild** the SPA (env is compile-time).

Multiple SPA URLs (production + preview):

```text
CORS_ORIGIN=https://cwms.pages.dev,https://cwms-git-main-xxx.pages.dev
```

---

## First-time checklist (copy/paste)

- [ ] Neon project + pooled `DATABASE_URL`
- [ ] R2 buckets `cwms-documents`, `cwms-backups` + API token
- [ ] API deployed (Render/Railway) with Neon + R2 + cookie env
- [ ] `GET /api/v1/health` returns ok
- [ ] SPA deployed with `VITE_API_BASE_URL` pointing at API
- [ ] API `CORS_ORIGIN` updated to SPA URL + API restarted
- [ ] Browser: open **SPA** URL → login `Administrator` / `Password@123`
- [ ] Create/open a work; upload a document (proves R2)

**Share with testers:** the **SPA** URL only (not Neon, not R2, not the raw API unless debugging).

---

## Updating after code changes

```text
git push origin main
```

| Piece | What happens |
|-------|----------------|
| API | Render/Railway auto-builds Dockerfile (if auto-deploy on) |
| SPA | Pages/Vercel rebuilds; keep `VITE_API_BASE_URL` set |
| Neon / R2 | No redeploy unless you change secrets or buckets |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Login works then immediately logged out / 401 | Cookies blocked cross-site | `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`, HTTPS on both |
| Browser CORS error | Wrong `CORS_ORIGIN` | Must equal SPA origin exactly |
| SPA calls localhost / wrong host | Bad or missing `VITE_API_BASE_URL` | Set env and **rebuild** SPA |
| Health `database: down` | Bad `DATABASE_URL` | Use Neon **pooled** URL + `sslmode=require` |
| Health `storage: down` | Bad R2 env / bucket name | Check endpoint, keys, bucket names |
| Render slow first hit | Free tier sleep | Wait 30–60s; upgrade plan if needed |
| Blank page on deep link | SPA rewrite missing | Confirm `_redirects` (Pages) or `frontend/vercel.json` rewrites |

---

## Security notes for UAT

- Do not commit real `.env` / secrets; only set them in dashboards.
- Demo users are seeded when `CWMS_SEED=true` — change passwords if the link is public.
- In-app backup/restore is still a stub; rely on Neon/R2 for durability.

---

## Related files

| File | Role |
|------|------|
| [`cloud.env.example`](./cloud.env.example) | Full env list |
| [`docker/Dockerfile.backend`](./docker/Dockerfile.backend) | API image |
| [`docker/Dockerfile.frontend`](./docker/Dockerfile.frontend) | Optional container SPA (local/compose) |
| [`../render.yaml`](../render.yaml) | Render Blueprint |
| [`../railway.toml`](../railway.toml) | Railway |
| [`../frontend/vercel.json`](../frontend/vercel.json) | Vercel SPA (Root Directory = `frontend`) |
| [`../frontend/public/_redirects`](../frontend/public/_redirects) | Cloudflare Pages SPA routes |
