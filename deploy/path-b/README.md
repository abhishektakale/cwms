# CWMS Path B — split cloud (Neon + API + SPA)
#
# Testers open: the SPA URL only (Pages or Vercel)
# File storage (MinIO/R2) is **skipped for now** — document upload disabled.

## Big picture

```text
  Testers
     │
     ▼
  SPA ──────────────► API ──────► Neon (Postgres)
  Pages / Vercel      Render /
                      Railway
```

| Piece | Service | You get |
|-------|---------|---------|
| **DB** | [Neon](https://neon.tech) | `DATABASE_URL` |
| **Files** | *Skipped* | No MinIO/R2; upload disabled |
| **API** | [Render](https://render.com) or [Railway](https://railway.app) | `https://…/api/v1` |
| **SPA** | [Cloudflare Pages](https://pages.cloudflare.com) or [Vercel](https://vercel.com) | tester URL |

**Recommended combo now:** Neon + Render + Cloudflare Pages.

Worksheet: [`env.worksheet.example`](./env.worksheet.example)  
Repo: `render.yaml`, `railway.toml`, `vercel.json`, `deploy/docker/Dockerfile.backend`

**Order:** Neon → API → SPA → set API `CORS_ORIGIN` to SPA URL.

---

## 0. Push latest code

Upload-disable + cloud cookie support must be on GitHub `main` before you deploy.

```bash
git push origin main
```

Repo: https://github.com/abhishektakale/cwms

---

## 1. Database → Neon

1. [https://neon.tech](https://neon.tech) → **New Project** (e.g. `cwms-uat`).
2. **Connection details** → copy the **pooled** URL (`-pooler` in the host).
3. Ensure `?sslmode=require` (add if missing).
4. Save as `DATABASE_URL` (do not commit it).

Migrations run on API boot (`prisma migrate deploy`). No laptop migrate needed.

---

## 2. Files → skipped

Do **not** create MinIO or R2.

On the API:
- Leave all `S3_*` **unset**
- Set `DOCUMENTS_UPLOAD_ENABLED=false` (optional but clear)

Then:
- Health: `"storage":"skipped"`, `"features":{"documentUpload":false}`
- Documents page: upload form hidden + notice
- API rejects upload with 503 if someone calls it anyway

You can add MinIO later; see older notes in git history / Path A if needed.

---

## 3. API → Render (recommended)

1. [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** (`render.yaml`)  
   **or** **Web Service**:
   - GitHub repo: `abhishektakale/cwms`
   - Runtime: **Docker**
   - Dockerfile: `deploy/docker/Dockerfile.backend`
   - Context: repo **root**
   - Health check: `/api/v1/health`
2. Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `API_PREFIX` | `api/v1` |
| `DATABASE_URL` | Neon pooled URL |
| `CORS_ORIGIN` | temporary `https://example.com` until SPA exists |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `DOCUMENTS_UPLOAD_ENABLED` | `false` |
| `CWMS_SEED` | `true` |
| `SESSION_IDLE_TIMEOUT_MINUTES` | `30` |
| `REMEMBER_ME_DAYS` | `14` |
| `PROFIT_LOSS_MODE` | `gross_minus_expenditure` |

**Do not set** `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, etc.

3. Deploy. Note API URL, e.g. `https://cwms-api.onrender.com`.
4. Smoke:

```bash
curl https://YOUR_API_HOST/api/v1/health
```

Expect something like:

```json
{
  "status": "ok",
  "checks": { "database": "up", "storage": "skipped" },
  "features": { "documentUpload": false }
}
```

### API → Railway (alternative)

1. Deploy from GitHub; `railway.toml` → `deploy/docker/Dockerfile.backend`.
2. Same env vars as the table (no `S3_*`).
3. Generate public domain; health `/api/v1/health`.

---

## 4. SPA → Cloudflare Pages (recommended)

Testers use **this** URL.

1. Cloudflare → **Workers & Pages** → Create → Connect Git → `cwms` / `main`.
2. Build:

| Field | Value |
|-------|--------|
| Framework preset | None |
| Root directory | `/` |
| Build command | `npm ci && npm run build -w frontend` |
| Build output directory | `frontend/dist` |

3. Env (Production):

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR_API_HOST/api/v1` |

4. Deploy. Note SPA URL, e.g. `https://cwms.pages.dev`.

### SPA → Vercel (alternative)

1. Import repo (`vercel.json` already set).
2. Env: `VITE_API_BASE_URL=https://YOUR_API_HOST/api/v1`.
3. Deploy; copy URL.

---

## 5. Wire SPA ↔ API

| Where | Variable | Value |
|-------|----------|--------|
| API | `CORS_ORIGIN` | Exact SPA URL, e.g. `https://cwms.pages.dev` (no trailing slash) |
| API | `COOKIE_SAMESITE` | `none` |
| API | `COOKIE_SECURE` | `true` |
| SPA | `VITE_API_BASE_URL` | `https://YOUR_API/api/v1` (rebuild SPA if changed) |

1. Set API `CORS_ORIGIN` to the real SPA URL → redeploy API.  
2. Open **SPA** → login `Administrator` / `Password@123`.  
3. Smoke: dashboard, works, billing — **skip Documents upload**.

---

## Checklist

- [ ] Latest code on `main` (upload-skip + cookies)
- [ ] Neon `DATABASE_URL` (pooled + ssl)
- [ ] No `S3_*` / no MinIO
- [ ] API health: `storage: skipped`, `documentUpload: false`
- [ ] SPA `VITE_API_BASE_URL` points at API
- [ ] API `CORS_ORIGIN` = SPA origin
- [ ] Login works from SPA

**Share with testers:** SPA URL only.  
Demo: `Administrator` / `Password@123`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error | `CORS_ORIGIN` must match SPA origin exactly |
| Login then 401 / logged out | `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` + HTTPS |
| SPA hits wrong host | Fix `VITE_API_BASE_URL` and **rebuild** SPA |
| `database: down` | Use Neon **pooled** URL + `sslmode=require` |
| Upload form still shows | Redeploy API/SPA with latest code; confirm no `S3_*` |
| Render first hit slow | Free tier cold start — wait 30–60s |

---

## Path A vs Path B

| | Path A | Path B |
|---|--------|--------|
| Guide | [`../path-a/README.md`](../path-a/README.md) | this file |
| Hosting | One VM + full Docker (includes MinIO) | Neon + Render/Railway + Pages/Vercel |
| Files now | MinIO on the VM | Skipped |
| Cookies | `lax` | `none` |
