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

## Critical: Root directory must be `frontend`

If the build log shows `cwms@0.1.0 postinstall` or `prisma:generate`, Pages is still using the **repo root**.

In Pages → **Settings** → **Builds & deployments** → **Build configuration**:

- **Root directory:** `frontend` (exact string — not empty, not `/`)
- Save → **Retry deployment**

With Root = `frontend`, install uses only `frontend/package.json` (no Prisma).

---

## After deploy

1. Copy SPA URL (e.g. `https://cwms.pages.dev`)
2. Render API: `CORS_ORIGIN=<that URL>` → redeploy
3. Login: `Administrator` / `Password@123`

---

## Vercel (alternative)

Root Directory empty; `vercel.json` at repo root handles build.  
Env: `VITE_API_BASE_URL=https://YOUR-API/api/v1`
