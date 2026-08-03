# Deploy CWMS SPA on Cloudflare Pages

Repo: https://github.com/abhishektakale/cwms

Your **build already succeeded**. The failure is the **deploy command**:
`npx wrangler deploy` (Workers). For this SPA use **Pages** deploy.

---

## Dashboard settings (use these)

| Field | Value |
|-------|--------|
| Framework preset | **None** |
| Root directory | *(leave **empty**)* |
| **Build command** | `npm run build -w frontend` |
| **Deploy command** | `npx wrangler pages deploy frontend/dist` |

If there is no separate “Build output directory” field, ignore it — the deploy command points at `frontend/dist`.

### Environment (Production)

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-API.onrender.com/api/v1` |

---

## Important: change Deploy command

Wrong (what failed):

```text
npx wrangler deploy
```

Right:

```text
npx wrangler pages deploy frontend/dist
```

Find it under **Settings → Builds & deployments** (sometimes “Deploy command” / “Non-production branch deploy command”).

---

## Why Prisma appeared in the log

Empty Root = monorepo root install. That is fine now (postinstall soft-fails).  
SPA build is `npm run build -w frontend` → output `frontend/dist`.

---

## After deploy

1. Copy SPA URL  
2. Render `CORS_ORIGIN=<SPA URL>` → redeploy API  
3. Login `Administrator` / `Password@123`
