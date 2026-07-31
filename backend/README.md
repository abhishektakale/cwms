# CWMS Backend

NestJS modular monolith. API prefix: `/api/v1`.

## M0 surface

- `GET /api/v1/health` — public health (DB + storage ping)
- Auth stub guard — denies non-`@Public()` routes until M1 sessions
- Prisma skeleton schema (`_schema_bootstrap` placeholder)
- Fake storage port (S3 adapter in M4)

## Commands

```bash
npm run start:dev -w backend
npm run test -w backend
npm run prisma:generate -w backend
```

See root `README.md` for Docker / env setup.
