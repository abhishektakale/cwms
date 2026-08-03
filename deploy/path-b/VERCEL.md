# Deploy CWMS SPA on Vercel

Repo: https://github.com/abhishektakale/cwms

---

## Recommended settings (simplest)

Because design CSS is inside `frontend/`, use the SPA folder as the Vercel root:

| Field | Value |
|-------|--------|
| **Root Directory** | `frontend` |
| Framework | Other / Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`frontend/vercel.json` already sets build + `dist` + SPA rewrites.

### Environment variable

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-API.onrender.com/api/v1` |

---

## Do not use

| Wrong | Why |
|-------|-----|
| Root empty + Output `dist` only | Monorepo install; Vite may write under `frontend/dist` |
| Root `frontend` + build `node scripts/vercel-prepare…` | Script lives at **repo** `scripts/`, not under `frontend/` |

---

## After deploy

1. Copy Vercel URL  
2. Render: `CORS_ORIGIN=https://YOUR-APP.vercel.app` → redeploy API  
3. Login: `Administrator` / `Password@123`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module .../frontend/scripts/vercel-prepare-output.js` | Root is `frontend` — use Build `npm run build` only (no prepare script) |
| CORS / login cookie issues | Render `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`, matching `CORS_ORIGIN` |
| Wrong API host | Redeploy after setting `VITE_API_BASE_URL` |
