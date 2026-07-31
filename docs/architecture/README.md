# CWMS Architecture

| Document | Description |
|----------|-------------|
| [CWMS-v1-software-architecture.md](./CWMS-v1-software-architecture.md) | Complete v1.0 software architecture: context, layers, deployment, ADRs, domain (engineering view), modules, project structure, state diagrams, dependency graph, milestones, development roadmap |
| [TRACEABILITY.md](./TRACEABILITY.md) | Cross-cutting PRD ↔ FS ↔ BR ↔ API ↔ table ↔ Domain Model matrix |
| [ENGINEERING-DECISIONS.md](./ENGINEERING-DECISIONS.md) | Implementation ADRs / engineering choices |
| [ASSET-LOCATIONS.md](./ASSET-LOCATIONS.md) | Canonical Stitch path + duplicate/archive audit |

## API design (architecture-level)

| Document | Description |
|----------|-------------|
| [api/API-CATALOGUE.md](./api/API-CATALOGUE.md) | Human API catalogue with authz and FS/PRD/BR refs |
| [api/openapi.yaml](./api/openapi.yaml) | OpenAPI 3.1 specification (implementation-agnostic) |

## Database design (architecture-level)

| Document | Description |
|----------|-------------|
| [database/SQL-DATABASE-DESIGN.md](./database/SQL-DATABASE-DESIGN.md) | Logical + physical relational design, ER, tables, constraints, indexes, archival, backup considerations |
| [database/MIGRATIONS.md](./database/MIGRATIONS.md) | Migration sequence, dependencies, upgrade/rollback (no framework scripts) |

## Cross-cutting design (architecture-level)

| Document | Description |
|----------|-------------|
| [security/AUTHENTICATION-AUTHORIZATION-DESIGN.md](./security/AUTHENTICATION-AUTHORIZATION-DESIGN.md) | Login, sessions, password policy, Remember Me, RBAC, audit, lockout, password reset, CSRF/XSS |
| [storage/FILE-STORAGE-DESIGN.md](./storage/FILE-STORAGE-DESIGN.md) | Upload lifecycle, naming, metadata, object layout, versioning, deletion, retention, access, download, validation |
| [reporting/REPORTING-ENGINE-DESIGN.md](./reporting/REPORTING-ENGINE-DESIGN.md) | Report flow, filters, export pipeline, PDF/Excel, performance, future scheduling, branding |

**Product requirements source of truth:** `../00-executive-summary.md` … `../15-product-risks.md`

**Status:** Architecture package for engineering handoff. This folder remains design-only; application code lives in `/frontend` and `/backend`.
