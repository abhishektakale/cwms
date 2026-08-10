# Deploy CWMS API on Render — Free tier (Node)

Render Free often auto-selects **Node** and may not offer **Docker**. That is fine. Use this Node setup.

Repo: https://github.com/abhishektakale/cwms  
Files: Cloudflare R2 via `S3_*` (see section 2).

---

## 1. Create Web Service (Free + Node)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect repo **`abhishektakale/cwms`**, branch **`main`**
3. Leave **Language = Node** (auto-detect is OK)
4. Set:

| Field | Value |
|-------|--------|
| Name | `cwms-api` |
| Instance type | **Free** |
| Root Directory | *(leave empty)* |
| Build Command | `npm ci --include=dev && npm run build -w backend` |
| Start Command | `sh deploy/render/start.sh` |
| Health Check Path | `/api/v1/health` |

5. Do **not** set Root Directory to `backend` (monorepo install needs repo root).

### About “Docker”
You can ignore Docker on Free. If Language shows Node only, continue with the commands above.

---

## 2. Environment variables

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `API_PREFIX` | `api/v1` |
| `DATABASE_URL` | Neon **pooled** URL + `sslmode=require` |
| `CORS_ORIGIN` | SPA URL (no trailing slash) |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `CWMS_SEED` | `true` |
| `SESSION_IDLE_TIMEOUT_MINUTES` | `30` |
| `REMEMBER_ME_DAYS` | `14` |
| `PROFIT_LOSS_MODE` | `gross_minus_expenditure` |
| `S3_ENDPOINT` | `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY` | R2 Access Key ID |
| `S3_SECRET_KEY` | R2 Secret Access Key |
| `S3_BUCKET_DOCUMENTS` | `cwms-documents` |
| `S3_BUCKET_BACKUPS` | `cwms-backups` |
| `S3_FORCE_PATH_STYLE` | `false` |

**Do not set:**
- `PORT` — Render injects this automatically
- `DOCUMENTS_UPLOAD_ENABLED=false` — that disables uploads even with R2 configured

Create R2 buckets `cwms-documents` and `cwms-backups` before first deploy (API does not auto-create them).

---

## 3. Deploy

Click **Create Web Service** (or **Manual Deploy** after env changes). First build can take several minutes.

Copy the URL, e.g. `https://cwms-api.onrender.com`.

---

## 4. Verify

```bash
curl https://YOUR-SERVICE.onrender.com/api/v1/health
```

Expect:

```json
{
  "status": "ok",
  "checks": { "database": "up", "storage": "up" },
  "features": { "documentUpload": true }
}
```

If `"storage":"down"`, check Render logs for a HeadBucket warning (wrong Account ID, token, or missing `cwms-documents` bucket).

If health fails on first try, wait (Free cold start / migrate) and retry.

---

## 5. After SPA is live

1. Vercel: `VITE_API_BASE_URL=/api/v1` (see [`VERCEL.md`](./VERCEL.md))
2. Render: `CORS_ORIGIN=https://your-spa.vercel.app` → **Manual Deploy**
3. Login: `Administrator` / `Password@123`
4. Smoke: Documents upload + Expenditure attach (PDF/image ≤20MB)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails `nest: not found` | Use `npm ci --include=dev` (Free/`NODE_ENV=production` skips devDependencies) |
| Build fails `workspace` | Root Directory must be empty; build from repo root |
| `database: down` | Neon **pooler** URL + `sslmode=require` |
| `storage: skipped` | Set `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` |
| `storage: down` | Create bucket; fix R2 token/endpoint; read HeadBucket log line |
| Upload still disabled | Remove `DOCUMENTS_UPLOAD_ENABLED=false` → redeploy |
| App sleeps / slow first hit | Free tier — wait 30–60s |
| Still on Docker docs | Free path is **Node**; Docker is optional paid |

---

## Optional later: Docker (paid / if Language shows Docker)

Language → **Docker**  
Dockerfile Path: `deploy/docker/Dockerfile.backend`  
Context: `.`  

For Free, prefer Node above.
