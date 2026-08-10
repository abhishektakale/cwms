# Deploy CWMS SPA on Cloudflare Pages

Build is working. Latest failure is **auth on deploy**, not the app build.

---

## Fix the auth error (`Authentication error [code: 10000]`)

Wrangler is using `CLOUDFLARE_API_TOKEN`. That token needs Pages edit rights, **or** you should stop using Wrangler and let Pages upload for you.

### Option A — Recommended (no Wrangler deploy)

In **Settings → Builds & deployments**:

| Field | Value |
|-------|--------|
| Root directory | *(empty)* |
| Build command | `npm run build -w frontend` |
| **Deploy command** | **Clear / leave empty** |

If the UI has **Build output directory** / **Output directory**, set:

```text
frontend/dist
```

Save → Retry. Cloudflare’s own Pages pipeline uploads `frontend/dist` (no API token needed).

Also: **Settings → Environment variables** — **delete** `CLOUDFLARE_API_TOKEN` if you added it. It overrides CI auth and often causes error 10000.

---

### Option B — Keep Wrangler deploy command

1. Cloudflare Dashboard → **My Profile** → **API Tokens** → **Create Token**
2. Use template **Edit Cloudflare Workers** or **Custom token** with:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Account Settings** → **Read** (if listed)
   - Include your account resource
3. Put the new token in Pages → **Settings → Environment variables** as `CLOUDFLARE_API_TOKEN` (Production + Preview)
4. Deploy command:

```text
npx wrangler pages deploy frontend/dist --project-name=cwms
```

(`cwms` must match the Pages project name in the dashboard.)

---

### Option C — Vercel (recommended; see [`VERCEL.md`](./VERCEL.md))

1. Import `abhishektakale/cwms` on Vercel  
2. Root Directory = `frontend` (`frontend/vercel.json` + `/api` proxy)  
3. Env: `VITE_API_BASE_URL=/api/v1`

---

## After SPA is live

1. Copy SPA URL  
2. Render: `CORS_ORIGIN=<exact SPA URL>` → redeploy API  
3. Login: `Administrator` / `Password@123`
