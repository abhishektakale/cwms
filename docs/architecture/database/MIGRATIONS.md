# CWMS v1.0 — Database Migration Specification (Architecture)

**Type:** Schema evolution design (not framework migration scripts)  
**Companion:** `SQL-DATABASE-DESIGN.md`  
**Out of scope:** Flyway/Liquibase/EF/Prisma/Knex files, raw `.sql` implementation scripts  

This document defines **migration sequence**, **dependencies**, **upgrade rules**, and **rollback considerations** for engineering handoff.

---

## 1. Principles

| Rule | Meaning |
|------|---------|
| Ordered, named steps | Each migration has stable ID `Mxxxx` and title |
| Forward-only preferred | Production upgrades apply `up`; `down` is documented for non-prod/emergency |
| Expand → migrate → contract | For breaking column/table changes in future versions |
| No data loss silently | Destructive steps require backup + explicit approval |
| Traceability | Each step maps to Domain entities / PRD modules |
| Idempotent tooling | Implementation tool may track applied IDs in `schema_migrations` |

### 1.1 Tracking Table (Logical)

| Column | Purpose |
|--------|---------|
| migration_id | e.g. `M0001` |
| name | Human title |
| applied_at | Timestamp |
| checksum | Optional content hash of migration artifact |
| applied_by | Operator / CI identity |

Physical DDL for this tracker is an implementation concern; existence is required.

---

## 2. Baseline Migration Sequence (v1.0 Greenfield)

Apply in order. Do not reorder after any environment has applied a later ID.

| ID | Name | Creates / Changes | Depends on | Domain / PRD |
|----|------|-------------------|------------|--------------|
| M0001 | Identity foundation | `users` | — | User §2.1, PRD-AUTH/ADM |
| M0002 | Auth tokens | `auth_sessions`, `remember_me_tokens` | M0001 | PRD-AUTH |
| M0003 | Masters | `master_options` + seed rows | M0001 | MasterOption §2.13, PRD-ADM |
| M0004 | Platform settings & sequences | `id_sequences`, `app_settings` | — | BrandingDefaults, BR-ID-* |
| M0005 | Works | `works` + indexes/FKs to masters/users | M0001, M0003, M0004 | Work §2.4, PRD-WORK |
| M0006 | Work locks | `work_edit_locks` | M0005 | WorkEditLock §2.19 |
| M0007 | File store metadata | `stored_files` | — | StoredFile §2.8 |
| M0008 | Documents | `documents` | M0005, M0007, M0003 | Document §2.7, PRD-DOC |
| M0009 | Estimates | `estimates` (+ FK to documents) | M0005, M0008 | Estimate §2.5, PRD-EST |
| M0010 | Schedule | `schedule_activities` | M0005 | ScheduleActivity §2.6, PRD-SCH |
| M0011 | Billing | `bills`, `bill_deductions` | M0005, M0003 | Bill §2.9–2.10, PRD-BILL |
| M0012 | Expenditure | `expenses`, `expense_attachments` | M0005, M0003, M0007 | Expense §2.12, PRD-EXP |
| M0013 | Report filters | `saved_report_filters` | M0001 | SavedReportFilter §2.14, PRD-RPT |
| M0014 | Audit | `audit_logs` | M0001 | AuditLog §2.15, PRD-AUD |
| M0015 | Backup catalogue | `backup_records`, `backup_artifacts` | — | Backup §2.16–2.17, PRD-BAK |
| M0016 | Demo / seed users | Demo accounts per product decision | M0001 | PRD-AUTH demo |
| M0017 | Grants & roles (DB) | App DB role privileges; revoke DELETE on `audit_logs` | M0014 | BR-AUD-02 |

### 2.1 Optional deferred step

| ID | Name | Notes |
|----|------|-------|
| M0011a | `bill_payments` | Only if multi-payment rows chosen over columns on `bills` |

---

## 3. Dependency Graph

```text
M0001 users
  ├── M0002 sessions/tokens
  ├── M0003 masters ──┐
  ├── M0013 filters   │
  └── M0014 audit     │
M0004 sequences/settings
M0007 stored_files ───┤
                      ▼
              M0005 works
                ├── M0006 locks
                ├── M0008 documents ◄── M0007, M0003
                │     └── M0009 estimates
                ├── M0010 schedule
                ├── M0011 bills/deductions ◄── M0003
                └── M0012 expenses/attachments ◄── M0003, M0007
M0015 backups (independent)
M0016 seeds (after M0001/M0003 as needed)
M0017 privileges (after M0014)
```

---

## 4. Upgrade Rules

### 4.1 Applying to a new environment

1. Ensure empty database (or allow only tracker table).  
2. Apply M0001…M0017 in order.  
3. Verify seed masters + demo users.  
4. Run application smoke checks (login, create work, upload doc).  
5. Trigger **Initial** backup (product requirement).  

### 4.2 Applying to an environment with data

1. Take successful product backup **before** any non-baseline migration.  
2. Put app in maintenance mode for migrations that rewrite large tables or change money rules.  
3. Apply only migrations with ID > last applied.  
4. Run post-migration verification checklist (§7).  
5. Exit maintenance mode.  

### 4.3 Future schema changes (v1.x / v2.0)

Use expand/migrate/contract:

1. **Expand:** Add nullable columns / new tables; deploy app that writes both old+new if needed.  
2. **Migrate:** Backfill data in batches; keep old columns readable.  
3. **Contract:** Stop writing old columns; drop in a later migration after soak period.  

Never rename columns in place without expand/contract when production data exists.

### 4.4 Data migration classes

| Class | Example | Rule |
|-------|---------|------|
| Pure DDL | New index | Online if possible; no app downtime |
| Backfill | Recalculate `works` rollups | Idempotent job; verify totals |
| Destructive | Drop unused column | Requires backup + contract phase |
| Enum extend | Add work status | Prefer additive CHECK update; never remove value still in use |

---

## 5. Rollback Considerations

| Migration type | Rollback feasibility | Guidance |
|----------------|----------------------|----------|
| Additive tables/columns | High | Drop new objects if unused |
| Seed data | Medium | Delete by known seed keys only |
| Backfill of derived fields | High | Re-run calculation with prior formula if versioned |
| Destructive drops | Low | Restore from pre-migration backup |
| Constraint tightening | Medium | May fail if dirty data; clean then re-apply |
| Privilege changes | High | Re-grant prior role |

### 5.1 Rollback policy (binding intent)

- **Dev/Test:** Down migrations allowed for additive steps M0001–M0015 in reverse order when no irreplaceable data.  
- **Staging/Production:** Prefer **restore from backup** over reverse DDL for any migration that touched money, IDs, or documents.  
- Never rollback past a migration that issued Work Codes / Bill Numbers already shared externally without product approval.  

### 5.2 Reverse order (greenfield only)

`M0017 → M0016 → M0015 → … → M0001` dropping dependents first (attachments → expenses → bills → documents → works → masters → users).

---

## 6. Compatibility with Application Versions

| Schema watermark | Minimum API / app version |
|------------------|---------------------------|
| Through M0017 | CWMS API `v1` / app 1.0.0 |
| Future M0100+ | Document in release notes; bump API only on breaking contract |

Application MUST refuse start if required watermark not applied (implementation detail).

---

## 7. Post-Migration Verification Checklist

| Check | Expected |
|-------|----------|
| Tracker | All expected `Mxxxx` applied |
| FKs | No orphan rows |
| Uniques | No duplicate `work_code`, `work_order_no`, `system_bill_number`, `login_id` |
| Seeds | Master types present; demo users exist if environment requires |
| Rollups | Spot-check Work financials vs sum of bills/expenses |
| Audit immutability | App DB role cannot UPDATE/DELETE `audit_logs` |
| Backup | Initial/weekly job can write `backup_records` |
| Search filters | Indexes exist per design |

---

## 8. Environment Notes

| Environment | Seeds | Demo passwords |
|-------------|-------|----------------|
| Local/Dev | Full masters + demo users | Per product (`Password@123`) |
| Staging | Full masters + demo users | Same or rotated |
| Production | Masters seed; **no** weak demo passwords | Admin-created users only |

---

## 9. Archival & Retention Migrations (Future)

Not in v1 baseline. When introduced:

| Future ID (reserved) | Intent |
|----------------------|--------|
| M0200 | Partition `audit_logs` by year |
| M0201 | Archive schema for completed works |
| M0202 | Purge job metadata tables |

Each must define upgrade/rollback and PRD change reference before execution.

---

## 10. Approval Record

| Item | Value |
|------|-------|
| Document | Migrations Specification v1.0 |
| Status | Draft for engineering handoff |
| Scripts | Explicitly excluded — describe sequence only |
