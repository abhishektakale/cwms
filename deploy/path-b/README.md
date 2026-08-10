# CWMS Path B — split cloud (Neon + R2 + API + SPA)
#
# Testers open: the SPA URL only (Pages or Vercel)
# File storage: Cloudflare R2 (Documents + expense attachments)

## Big picture

```text
  Testers
     │
     ▼
  SPA ──────────────► API ──────► Neon (Postgres)
  Pages / Vercel      Render /         │
                      Railway          ▼
                                 Cloudflare R2
```

| Piece | Service | You get |
|-------|---------|---------|
| **DB** | [Neon](https://neon.tech) | `DATABASE_URL` |
| **Files** | [Cloudflare R2](https://developers.cloudflare.com/r2/) | `S3_*` credentials |
| **API** | [Render](https://render.com) or [Railway](https://railway.app) | `https://…/api/v1` |
| **SPA** | [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com) | tester URL |

**Recommended combo:** Neon + R2 + Render + Vercel (same-origin `/api` proxy).

Worksheet: [`env.worksheet.example`](./env.worksheet.example)  
Also: [`RENDER.md`](./RENDER.md), [`VERCEL.md`](./VERCEL.md), [`deploy/cloud.env.example`](../cloud.env.example)

**Order:** Neon → R2 → API → SPA → set API `CORS_ORIGIN` to SPA URL.

---

## 0. Push latest code

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

## 2. Files → Cloudflare R2

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → create two buckets:
   - `cwms-documents` (Documents + expense attachments)
   - `cwms-backups` (reserved; backup feature still stub)
2. **R2** → **Manage R2 API Tokens** → create token with **Object Read & Write**.
3. Copy **Access Key ID** and **Secret Access Key**.
4. Note **Account ID** → endpoint:

```text
https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

The API does **not** create buckets. If `cwms-documents` is missing or the token cannot `HeadBucket`, health shows `"storage":"down"` and Render logs a warning.

Omit all `S3_*` only if you intentionally want uploads disabled (`storage: skipped`).

---

## 3. API → Render (recommended)

See [`RENDER.md`](./RENDER.md) for Free Node build/start commands.

Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `API_PREFIX` | `api/v1` |
| `DATABASE_URL` | Neon pooled URL |
| `CORS_ORIGIN` | SPA origin (no trailing slash) |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `CWMS_SEED` | `true` |
| `SESSION_IDLE_TIMEOUT_MINUTES` | `30` |
| `REMEMBER_ME_DAYS` | `14` |
| `PROFIT_LOSS_MODE` | `gross_minus_expenditure` |
| `S3_ENDPOINT` | `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY` | R2 access key |
| `S3_SECRET_KEY` | R2 secret |
| `S3_BUCKET_DOCUMENTS` | `cwms-documents` |
| `S3_BUCKET_BACKUPS` | `cwms-backups` |
| `S3_FORCE_PATH_STYLE` | `false` |

Do **not** set `DOCUMENTS_UPLOAD_ENABLED=false` once R2 is wired (or set it to `true`).  
Do **not** set `PORT` on Render Free (platform injects it).

Deploy, then:

```bash
curl https://YOUR_API_HOST/api/v1/health
```

Expect:

```json
{
  "status": "ok",
  "checks": { "database": "up", "storage": "up" },
  "features": { "documentUpload": true }
}
```

### API → Railway (alternative)

Same env vars including `S3_*`. Health check `/api/v1/health`.

---

## 4. SPA → Vercel (recommended)

See [`VERCEL.md`](./VERCEL.md).

| Field | Value |
|-------|--------|
| Root Directory | `frontend` |
| `VITE_API_BASE_URL` | `/api/v1` (same-origin proxy to Render) |

Upload traffic goes through the API (and Vercel `/api` rewrite); no public R2 CORS needed.

### SPA → Cloudflare Pages (alternative)

Root directory `frontend`. Env: `VITE_API_BASE_URL=https://YOUR_API_HOST/api/v1` (or same-origin if you add a proxy). See [`PAGES.md`](./PAGES.md).

---

## 5. Wire SPA ↔ API

| Where | Variable | Value |
|-------|----------|--------|
| API | `CORS_ORIGIN` | Exact SPA URL (no trailing slash) |
| API | `COOKIE_SAMESITE` | `none` |
| API | `COOKIE_SECURE` | `true` |
| SPA | `VITE_API_BASE_URL` | `/api/v1` on Vercel (or full API URL on Pages) |

1. Set API `CORS_ORIGIN` → redeploy API.  
2. Open **SPA** → login `Administrator` / `Password@123`.  
3. Smoke (see below).

---

## 6. Smoke after R2 is live

1. Health: `storage: up`, `documentUpload: true`
2. **Documents** → upload a PDF or image ≤20MB → open/download → delete
3. **Expenditure** → Attach on an expense → open → remove
4. Dashboard / works / billing still work

---

## Checklist

- [ ] Latest code on `main`
- [ ] Neon `DATABASE_URL` (pooled + ssl)
- [ ] R2 buckets `cwms-documents` + `cwms-backups`
- [ ] API `S3_*` set; `DOCUMENTS_UPLOAD_ENABLED` not `false`
- [ ] API health: `storage: up`, `documentUpload: true`
- [ ] SPA `VITE_API_BASE_URL` correct + redeployed
- [ ] API `CORS_ORIGIN` = SPA origin
- [ ] Login works from SPA
- [ ] Documents + expense attachment upload smoke pass

**Share with testers:** SPA URL only.  
Demo: `Administrator` / `Password@123`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error | `CORS_ORIGIN` must match SPA origin exactly |
| Login then 401 / logged out | `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` + HTTPS; Vercel use `/api/v1` |
| SPA hits wrong host | Fix `VITE_API_BASE_URL` and **rebuild** SPA |
| `database: down` | Use Neon **pooled** URL + `sslmode=require` |
| `storage: skipped` | `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` missing |
| `storage: down` | Create `cwms-documents` bucket; check R2 token + endpoint Account ID; see Render logs for HeadBucket warning |
| Upload form hidden | Health `documentUpload` false — remove `DOCUMENTS_UPLOAD_ENABLED=false`, redeploy |
| Upload 503 | Same as above; confirm R2 env on API |
| Render first hit slow | Free tier cold start — wait 30–60s |

---

## Path A vs Path B

| | Path A | Path B |
|---|--------|--------|
| Guide | [`../path-a/README.md`](../path-a/README.md) | this file |
| Hosting | One VM + full Docker (includes MinIO) | Neon + R2 + Render/Railway + Pages/Vercel |
| Files | MinIO on the VM | Cloudflare R2 |
| Cookies | `lax` | `none` (or same-origin via Vercel `/api` proxy) |
