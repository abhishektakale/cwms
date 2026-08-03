# CWMS Path B — split cloud (Neon + MinIO + API + SPA)
#
# Testers open: the SPA URL only (Pages or Vercel)
# No single VM required. MinIO replaces Cloudflare R2 (no R2 card).

## Big picture

```text
  Testers
     │
     ▼
  SPA ──────────────► API ──────► Neon (Postgres)
  Pages / Vercel      Render /     MinIO (files)
                      Railway
```

| Piece | Service | You get |
|-------|---------|---------|
| **DB** | [Neon](https://neon.tech) | `DATABASE_URL` |
| **Files** | MinIO (Railway / tiny VM / Docker) | `S3_*` |
| **API** | [Render](https://render.com) or [Railway](https://railway.app) | `https://…/api/v1` |
| **SPA** | [Cloudflare Pages](https://pages.cloudflare.com) or [Vercel](https://vercel.com) | tester URL |

**Recommended first combo:** Neon + MinIO on Railway (or small VM) + Render API + Cloudflare Pages.

Worksheet: copy [`env.worksheet.example`](./env.worksheet.example) and fill as you go.  
Repo configs: `render.yaml`, `railway.toml`, `vercel.json`, `deploy/docker/Dockerfile.backend`.

**Order:** Neon → MinIO → API → SPA → fix API `CORS_ORIGIN`.

---

## 0. Push code

Path B needs cloud deploy support on GitHub `main` (cookies, Dockerfiles, etc.).

```bash
git push origin main
```

---

## 1. Database → Neon

1. Sign up: [https://neon.tech](https://neon.tech) → **New Project** (e.g. `cwms-uat`).
2. Open **Connection details**.
3. Copy the **pooled** URL (host contains `-pooler`).
4. Ensure `?sslmode=require` is present (add if missing).
5. Save as `DATABASE_URL` in your worksheet.

Migrations run automatically when the API container starts (`prisma migrate deploy`). You do **not** migrate from your laptop for UAT.

---

## 2. Files → MinIO (instead of R2)

Create buckets **`cwms-documents`** and **`cwms-backups`**.

### Option 2A — MinIO on Railway (common)

1. [Railway](https://railway.app) → New Project → add **MinIO** template (or Docker image `minio/minio`).
2. Start command / args: `server /data --console-address ":9001"`.
3. Variables:
   - `MINIO_ROOT_USER` = strong username  
   - `MINIO_ROOT_PASSWORD` = strong password  
4. Attach a **volume** mounted at `/data`.
5. **Networking:** public HTTPS URL for S3 API port **9000**  
   Example: `https://minio-xxxx.up.railway.app`
6. Open MinIO **console** (port 9001) once → create buckets:
   - `cwms-documents`
   - `cwms-backups`  
   Or use `mc` against the API URL.

### Option 2B — MinIO on a tiny Ubuntu VM

```bash
docker run -d --name minio --restart unless-stopped \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=cwmsminio \
  -e MINIO_ROOT_PASSWORD='choose-a-strong-password' \
  -v minio_data:/data \
  minio/minio server /data --console-address ":9001"
```

Put HTTPS on `:9000` (Caddy). Create the two buckets in the console (`:9001`).

### Option 2C — Skip files for now

Leave all `S3_*` unset on the API. App uses in-memory fake storage (uploads lost on restart). Rest of Path B still works.

### API env for MinIO (2A / 2B)

```text
S3_ENDPOINT=https://YOUR_MINIO_HOST
S3_REGION=us-east-1
S3_ACCESS_KEY=...same as MINIO_ROOT_USER...
S3_SECRET_KEY=...same as MINIO_ROOT_PASSWORD...
S3_BUCKET_DOCUMENTS=cwms-documents
S3_BUCKET_BACKUPS=cwms-backups
S3_FORCE_PATH_STYLE=true
```

---

## 3. API → Render (or Railway)

### 3A — Render (recommended)

1. [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** (uses repo `render.yaml`)  
   **or** **Web Service**:
   - Repo: your CWMS GitHub repo  
   - Runtime: **Docker**  
   - Dockerfile: `deploy/docker/Dockerfile.backend`  
   - Context: repository **root**  
   - Health check: `/api/v1/health`
2. Set environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `API_PREFIX` | `api/v1` |
| `DATABASE_URL` | Neon pooled URL |
| `CORS_ORIGIN` | temporary `https://example.com` until SPA exists |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `S3_ENDPOINT` | MinIO HTTPS URL (or omit all `S3_*` for fake storage) |
| `S3_REGION` | `us-east-1` |
| `S3_ACCESS_KEY` | MinIO user |
| `S3_SECRET_KEY` | MinIO password |
| `S3_BUCKET_DOCUMENTS` | `cwms-documents` |
| `S3_BUCKET_BACKUPS` | `cwms-backups` |
| `S3_FORCE_PATH_STYLE` | `true` |
| `CWMS_SEED` | `true` |
| `SESSION_IDLE_TIMEOUT_MINUTES` | `30` |
| `REMEMBER_ME_DAYS` | `14` |
| `PROFIT_LOSS_MODE` | `gross_minus_expenditure` |

3. Deploy. Copy API URL, e.g. `https://cwms-api.onrender.com`.
4. Smoke:

```bash
curl https://cwms-api.onrender.com/api/v1/health
```

Expect `"status":"ok"`. With MinIO configured, `storage` should be `"up"`.

### 3B — Railway API (alternative)

1. New service from GitHub; `railway.toml` points at `deploy/docker/Dockerfile.backend`.
2. Same env vars as the table above.
3. Generate public domain; health `/api/v1/health`.

---

## 4. SPA → Cloudflare Pages (or Vercel)

Testers use **this** URL.

### 4A — Cloudflare Pages (recommended)

1. Cloudflare → **Workers & Pages** → Create → Connect Git → CWMS repo / `main`.
2. Build settings:

| Field | Value |
|-------|--------|
| Framework preset | None |
| Root directory | `/` |
| Build command | `npm ci && npm run build -w frontend` |
| Build output directory | `frontend/dist` |

3. Environment variable (Production):

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR_API_HOST/api/v1` |

4. Deploy. Copy SPA URL, e.g. `https://cwms.pages.dev`.

### 4B — Vercel (alternative)

1. Import GitHub repo (root `vercel.json` already configures build + SPA rewrites).
2. Env: `VITE_API_BASE_URL=https://YOUR_API_HOST/api/v1`.
3. Deploy; copy the Vercel URL.

---

## 5. Wire SPA ↔ API (required)

SPA and API are **different domains**, so:

| Where | Variable | Value |
|-------|----------|--------|
| API | `CORS_ORIGIN` | Exact SPA URL, e.g. `https://cwms.pages.dev` (no trailing slash) |
| API | `COOKIE_SAMESITE` | `none` |
| API | `COOKIE_SECURE` | `true` |
| SPA | `VITE_API_BASE_URL` | `https://YOUR_API/api/v1` (rebuild SPA if you change this) |

1. Update API `CORS_ORIGIN` to the real SPA URL.  
2. Redeploy / restart API.  
3. Open **SPA** URL → login `Administrator` / `Password@123`.  
4. Smoke: open a work; upload a document (proves MinIO).

Multiple SPA URLs:

```text
CORS_ORIGIN=https://cwms.pages.dev,https://other-preview.pages.dev
```

---

## Checklist

- [ ] Neon `DATABASE_URL` (pooled + ssl)
- [ ] MinIO up + buckets created (or consciously skipped)
- [ ] API healthy: `GET /api/v1/health`
- [ ] SPA built with correct `VITE_API_BASE_URL`
- [ ] API `CORS_ORIGIN` = SPA origin; cookies `none` + `secure`
- [ ] Login works from SPA; document upload works (if MinIO used)

**Share with testers:** SPA URL only.

---

## Updates later

```text
git push origin main
```

| Piece | Action |
|-------|--------|
| API | Auto-redeploy on Render/Railway if connected to GitHub |
| SPA | Auto-rebuild on Pages/Vercel |
| Neon / MinIO | Only if you change secrets or recreate buckets |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error in browser | `CORS_ORIGIN` must match SPA origin exactly |
| Login then instant logout / 401 | `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` + HTTPS on both |
| SPA still calls wrong API | Fix `VITE_API_BASE_URL` and **rebuild** SPA |
| `database: down` | Wrong Neon URL; use **pooled** + `sslmode=require` |
| `storage: down` | MinIO URL/keys/buckets; must be reachable from API; `S3_FORCE_PATH_STYLE=true` |
| Render cold start slow | Free tier sleep — wait 30–60s on first hit |

---

## Path A vs Path B

| | Path A | Path B |
|---|--------|--------|
| Guide | [`../path-a/README.md`](../path-a/README.md) | this file |
| Hosting | One Ubuntu VM + Docker Compose | Neon + MinIO + Render/Railway + Pages/Vercel |
| Cookies | `lax` (same origin) | `none` (cross origin) |
| Best when | You can run a VM | You want managed free/cheap pieces |
