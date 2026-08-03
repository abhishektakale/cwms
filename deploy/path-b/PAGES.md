# Deploy CWMS SPA on Cloudflare Pages

Repo: https://github.com/abhishektakale/cwms

Cloudflare Wrangler cannot deploy from the **monorepo root** (npm workspaces).
Use **Root directory = `frontend`**.

---

## Cloudflare Pages settings

| Field | Value |
|-------|--------|
| Framework preset | **None** (not Vite / Workers) |
| **Root directory** | `frontend` |
| Build command | `npm install && npm run build` |
| Build output directory | `dist` |

### Environment variable (Production)

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-API.onrender.com/api/v1` |

---

## Why you saw the workspace error

Building from the **repo root** runs Wrangler in an npm workspace →  

`application detection logic has been run in the root of a workspace`

**Fix:** Root directory = `frontend` so Wrangler targets one app.  
Design CSS is vendored under `frontend/src/styles/` so the Pages build does not need the `ui/` folder.

---

## After deploy

1. Copy SPA URL (e.g. `https://cwms.pages.dev`)
2. Render API: `CORS_ORIGIN=<that URL>` → redeploy
3. Login: `Administrator` / `Password@123`

---

## Vercel (alternative)

Root Directory empty; `vercel.json` at repo root handles build.  
Env: `VITE_API_BASE_URL=https://YOUR-API/api/v1`
