# Deploy CWMS SPA on Vercel

Repo: https://github.com/abhishektakale/cwms

Browsers often block cookies on cross-site calls (`vercel.app` → `onrender.com`).  
`frontend/vercel.json` proxies `/api/*` to Render so the SPA and cookies stay **same-origin**.

---

## Settings

| Field | Value |
|-------|--------|
| **Root Directory** | `frontend` |
| Framework | Other / Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Environment variable (required)

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `/api/v1` |

Must be the **relative** path (not `https://…onrender.com…`). Redeploy after changing it.

### Proxy target

In `frontend/vercel.json`, the rewrite destination must match your Render URL:

`https://cwms-mplm.onrender.com/api/:path*`

If the Render hostname changes, edit that line and push.

---

## After deploy

1. Vercel env: `VITE_API_BASE_URL=/api/v1` → Redeploy  
2. Render: `CORS_ORIGIN=https://cwms-frontend-uo98.vercel.app` (keep for safety)  
3. Render: `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true` + R2 `S3_*` (see [`RENDER.md`](./RENDER.md))  
4. Login: `Administrator` / `Password@123`

### Smoke (after R2 on API)

1. `GET /api/v1/health` → `storage: up`, `documentUpload: true`  
2. Documents → upload PDF/image ≤20MB → open → delete  
3. Expenditure → Attach → open → remove  

Cold start on free Render can take ~30–60s on first API call.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 on `/auth/me` then dashboard | Expected when logged out; after login, cookies must stick — use `/api/v1` + proxy |
| Login works then immediately 401 | Old build still calling `onrender.com` directly — set `VITE_API_BASE_URL=/api/v1` and redeploy |
| CORS errors | Only if SPA still calls Render directly; switch to `/api/v1` |
| Proxy 502 / timeout | Wake Render (hit `/api/v1/health` once), wait, retry |
