# CWMS Backend

NestJS modular monolith. API prefix: `/api/v1`.

## Surface

- Auth (session cookies), masters, works, estimates, schedule, documents, billing, expenditure, dashboard, reports, users, search
- `GET /api/v1/health` — DB + object-storage ping; `features.documentUpload` when `S3_*` is configured
- Prisma schema + migrations; S3-compatible storage (MinIO local / R2 cloud)

## Commands

```bash
npm run start:dev -w backend
npm run test -w backend
npm run prisma:generate -w backend
```

See root `README.md` for Docker / env setup and `deploy/path-b/` for cloud UAT.
