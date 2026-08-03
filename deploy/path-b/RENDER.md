# Deploy CWMS API on Render — Free tier (Node)

Render Free often auto-selects **Node** and may not offer **Docker**. That is fine. Use this Node setup.

Repo: https://github.com/abhishektakale/cwms  
Files skipped for now (no `S3_*`).

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
| Build Command | `npm ci && npm run build -w backend` |
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
| `CORS_ORIGIN` | SPA URL (placeholder OK for now) |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `DOCUMENTS_UPLOAD_ENABLED` | `false` |
| `CWMS_SEED` | `true` |
| `SESSION_IDLE_TIMEOUT_MINUTES` | `30` |
| `REMEMBER_ME_DAYS` | `14` |
| `PROFIT_LOSS_MODE` | `gross_minus_expenditure` |

**Do not set:**
- `PORT` — Render injects this automatically (do not force `3000`)
- Any `S3_*` variables

---

## 3. Deploy

Click **Create Web Service**. First build can take several minutes (`npm ci` + Nest build).

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
  "checks": { "database": "up", "storage": "skipped" },
  "features": { "documentUpload": false }
}
```

If health fails on first try, wait (Free cold start / migrate) and retry.

---

## 5. After SPA is live

1. Pages/Vercel: `VITE_API_BASE_URL=https://YOUR-SERVICE.onrender.com/api/v1`
2. Render: `CORS_ORIGIN=https://your-spa.pages.dev` → **Manual Deploy**
3. Login on SPA: `Administrator` / `Password@123`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails `workspace` | Root Directory must be empty; build from repo root |
| `Cannot find module` / wrong main | Confirm start command is `npm run start:render -w backend` |
| `database: down` | Neon **pooler** URL + `sslmode=require` |
| App sleeps / slow first hit | Free tier — wait 30–60s |
| Still on Docker docs | Free path is **Node**; Docker is optional paid |

---

## Optional later: Docker (paid / if Language shows Docker)

Language → **Docker**  
Dockerfile Path: `deploy/docker/Dockerfile.backend`  
Context: `.`  

See older notes in git if needed. For Free, prefer Node above.
