# Deploy CWMS SPA on Vercel

Testers open the Vercel URL. API stays on Render.

Repo: https://github.com/abhishektakale/cwms  
Root config: [`vercel.json`](../../vercel.json)

---

## 1. Import the project

1. Go to [https://vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New…** → **Project**.
3. Import **`abhishektakale/cwms`**.
4. Framework preset: **Other** (or leave auto; `vercel.json` overrides).

---

## 2. Build settings

| Field | Value |
|-------|--------|
| Root Directory | **Leave empty** (repo root) |
| Build Command | `npm run build -w frontend` *(from `vercel.json`; OK if shown)* |
| Output Directory | `frontend/dist` *(from `vercel.json`)* |
| Install Command | `npm install` (default is fine) |

Do **not** set Root Directory to `frontend` or `/`.

`vercel.json` already has:

```json
{
  "buildCommand": "npm run build -w frontend",
  "outputDirectory": "frontend/dist",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Rewrites keep React Router working.

---

## 3. Environment variable

**Settings → Environment Variables** (Production + Preview if you want):

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-SERVICE.onrender.com/api/v1` |

No trailing slash after `v1`.

---

## 4. Deploy

Click **Deploy**. Wait for the build.

Copy the URL, e.g. `https://cwms-xxx.vercel.app`.

---

## 5. Wire the API (Render)

1. Render → `cwms-api` → Environment  
2. Set:

```text
CORS_ORIGIN=https://YOUR-APP.vercel.app
```

Exact URL, no trailing slash.  
If you use a custom domain later, add it too (comma-separated).

3. **Manual Deploy** the API.

---

## 6. Test

1. Open the **Vercel** URL (not Render).  
2. Login: `Administrator` / `Password@123`  
3. Skip document upload (storage skipped).

---

## Updates later

Push to `main` → Vercel auto-redeploys.

If you change `VITE_API_BASE_URL`, redeploy the SPA (env is build-time).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Log shows `prisma: not found` then skip | Harmless on older commits; latest skips postinstall on Vercel entirely |
| CORS error | `CORS_ORIGIN` on Render must match the Vercel origin exactly |
| Login fails / cookies | API needs `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true` |
| SPA calls wrong API | Fix `VITE_API_BASE_URL` and **redeploy** Vercel |
| Build fails `nest` / prisma hard-fail | Root Directory must be empty; use latest `main` |
| 404 on refresh | Ensure `vercel.json` rewrites are present (already in repo) |
