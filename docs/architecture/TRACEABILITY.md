# CWMS v1.0 — Architecture Traceability Matrix

**Type:** Cross-cutting design traceability (not implementation)  
**Sources:** PRD (`02`), Functional Spec (`03`), Business Rules (`06`), Domain Model (`07`), Validation (`08`)  
**Targets:** `api/API-CATALOGUE.md`, `api/openapi.yaml`, `database/SQL-DATABASE-DESIGN.md`, `database/MIGRATIONS.md`, `security/AUTHENTICATION-AUTHORIZATION-DESIGN.md`, `storage/FILE-STORAGE-DESIGN.md`, `reporting/REPORTING-ENGINE-DESIGN.md`  

---

## 1. How to Read This Matrix

| Column | Meaning |
|--------|---------|
| PRD | Product requirement module ID |
| BR | Business rule ID(s) that encode the requirement |
| FS | Functional specification feature ID(s) |
| API | REST operation(s) / path family |
| Table | Physical table(s) |
| Domain | Doc 07 entity section |

OpenAPI operations also carry `x-fs-refs`, `x-prd-refs`, `x-br-refs` where applied.

---

## 2. Module Traceability (PRD → API → Data)

| PRD | FS (primary) | BR (primary) | API surface | Tables | Domain |
|-----|--------------|--------------|-------------|--------|--------|
| PRD-AUTH | F-AUTH-01..03, G-01 | BR-SEC-01..03, BR-ID-06 | `/auth/*` | `users`, `auth_sessions`, `remember_me_tokens` | User §2.1 |
| PRD-ADM | F-USR-*, F-MST-* | BR-MST-*, BR-ID-06/07 | `/users/*`, `/masters/*` | `users`, `master_options` | User, MasterOption |
| PRD-DASH | F-DASH-01..05 | BR-TL-*, BR-STAT-03/06/07A, BR-BILL-13/14, BR-FIN-14 | `/dashboard/*` | Reads `works`, `bills`, `expenses`, `documents`, `schedule_activities` | Work + derived |
| PRD-WORK | F-WORK-*, F-FIN-* | BR-FIN-*, BR-ID-01/04, BR-CON-01, BR-VAL-04, BR-PRJ-*, BR-STAT-01/02 | `/works/*` | `works`, `work_edit_locks`, `id_sequences` | Work, WorkEditLock, ProjectName |
| PRD-EST | F-EST-* | (estimate field rules in VAL/FS) | `/works/{id}/estimates`, `/estimates/*` | `estimates` | Estimate §2.5 |
| PRD-SCH | F-SCH-* | BR-STAT-04..06 | `/works/{id}/schedule-activities`, `/schedule-activities/*` | `schedule_activities` | ScheduleActivity §2.6 |
| PRD-DOC | F-DOC-* | BR-DOC-*, BR-STAT-07A | `/documents/*`, `/works/{id}/documents*` | `documents`, `stored_files` | Document, StoredFile |
| PRD-BILL | F-BILL-*, F-FIN-03 | BR-BILL-*, BR-FIN-08..15, BR-ID-02/05 | `/bills/*`, `/works/{id}/bills` | `bills`, `bill_deductions`, (`bill_payments`) | Bill, BillDeduction, Payment |
| PRD-EXP | F-EXP-* | BR-EXP-*, BR-FIN-15 | `/expenses/*`, `/works/{id}/expenses` | `expenses`, `expense_attachments`, `stored_files` | Expense §2.12 |
| PRD-RPT | F-RPT-* | BR-RPT-* | `/reports/*` | Reads operational tables; writes `saved_report_filters` | SavedReportFilter |
| PRD-SRCH | F-SRCH-01 | — | `/search`, list `q` params | Indexes on works/bills/docs/expenses | Cross-entity |
| PRD-BAK | F-BAK-* | BR-BAK-* | `/backups/*` | `backup_records`, `backup_artifacts`, `app_settings` | BackupRecord, BackupArtifact |
| PRD-AUD | §1.2 PRD | BR-AUD-* | `/audit-logs` | `audit_logs` | AuditLog §2.15 |
| PRD-NAV | G-* shell | — | SPA routes (not REST except `/meta`) | — | — |

---

## 3. API Endpoint → FS Requirement Map

Full path inventory is in `api/API-CATALOGUE.md`. Condensed operationId → FS:

| operationId | FS / PRD |
|-------------|----------|
| authLogin | F-AUTH-01, F-AUTH-01A/B, PRD-AUTH |
| authLogout | F-AUTH-03 |
| authMe | G-01 |
| authChangePassword | F-AUTH-02 |
| authRefresh | F-AUTH-01A |
| listUsers / createUser / getUser / updateUser / deactivateUser / activateUser | F-USR-01..02, PRD-ADM |
| listMasters / createMaster / updateMaster / deleteMaster | F-MST-01..02, PRD-ADM |
| getDashboardSummary | F-DASH-01, PRD-DASH |
| getDashboardAlerts | F-DASH-03 |
| getDashboardAttention | F-DASH-02 |
| getDashboardRecent | F-DASH-05 |
| listWorks / createWork / getWork / updateWork / deleteWork | F-WORK-01..07, PRD-WORK |
| listProjectNames | F-WORK-04 |
| acquireWorkLock / releaseWorkLock | F-WORK-05 |
| getWorkFinancialSummary | F-WORK-06, F-FIN-03/04 |
| listEstimates / createEstimate / getEstimate / updateEstimate / deleteEstimate | F-EST-01..03, PRD-EST |
| listScheduleActivities / createScheduleActivity / updateScheduleActivity / deleteScheduleActivity | F-SCH-01..03, PRD-SCH |
| listDocuments / listWorkDocuments / uploadDocument / uploadDocumentsBatch / getDocument / getDocumentContent / deleteDocument | F-DOC-01..05, PRD-DOC |
| listBills / createBill / getBill / updateBill / deleteBill / listWorkBills | F-BILL-01..06, PRD-BILL |
| listExpenses / createExpense / getExpense / updateExpense / deleteExpense / assignExpense / cancelExpense / listWorkExpenses | F-EXP-01..06, PRD-EXP |
| listReportTypes / runReport / exportReport / listSavedFilters / createSavedFilter / updateSavedFilter / deleteSavedFilter | F-RPT-01..05, PRD-RPT |
| globalSearch | F-SRCH-01, PRD-SRCH |
| listBackups / getBackup / restoreBackup | F-BAK-02..03, PRD-BAK |
| listAuditLogs | PRD-AUD, BR-AUD-* |
| health / meta | Platform / G-04 |

---

## 4. Database Table → Domain Entity Map

| Table | Domain entity | PRD |
|-------|---------------|-----|
| users | User §2.1 | PRD-AUTH, PRD-ADM |
| auth_sessions | User session (impl) | PRD-AUTH |
| remember_me_tokens | User Remember-Me | PRD-AUTH |
| master_options | MasterOption §2.13 | PRD-ADM |
| works | Work §2.4; ProjectName §2.3 (column) | PRD-WORK |
| work_edit_locks | WorkEditLock §2.19 | PRD-WORK |
| estimates | Estimate §2.5 | PRD-EST |
| schedule_activities | ScheduleActivity §2.6 | PRD-SCH |
| stored_files | StoredFile §2.8 | PRD-DOC |
| documents | Document §2.7 | PRD-DOC |
| bills | Bill §2.9 (+ Payment fields) | PRD-BILL |
| bill_deductions | BillDeduction §2.10 | PRD-BILL |
| bill_payments | Payment §2.11 (optional) | PRD-BILL |
| expenses | Expense §2.12 | PRD-EXP |
| expense_attachments | Expense attachments | PRD-EXP |
| saved_report_filters | SavedReportFilter §2.14 | PRD-RPT |
| audit_logs | AuditLog §2.15 | PRD-AUD |
| backup_records | BackupRecord §2.16 | PRD-BAK |
| backup_artifacts | BackupArtifact §2.17 | PRD-BAK |
| id_sequences | System numbering | BR-ID-01/02 |
| app_settings | BrandingDefaults §2.18 + flags | PRD-RPT/BAK |

---

## 5. Business Rule → PRD Origin Map

| BR family | Originating PRD / cross-cut | Enforced primarily by |
|-----------|----------------------------|------------------------|
| BR-ID-* | PRD-WORK, PRD-BILL, PRD-ADM | API create + `id_sequences` / unique indexes |
| BR-FIN-* | PRD-WORK, PRD-BILL, PRD-DASH | Work/Bill services; cached columns on `works` |
| BR-BILL-* | PRD-BILL | Billing API + `bills` / `bill_deductions` |
| BR-EXP-* | PRD-EXP | Expenditure API + `expenses` |
| BR-STAT-* | PRD-WORK, PRD-SCH, PRD-DASH | Work/Schedule update + alert queries |
| BR-TL-* | PRD-DASH, PRD-WORK | Derived `works.traffic_light` |
| BR-DOC-* | PRD-DOC | Upload API + `documents`/`stored_files` |
| BR-MST-* | PRD-ADM | Masters API + `master_options` |
| BR-SEC-* | PRD-AUTH | Auth API + password hash storage |
| BR-CON-01 | PRD §1.3 | Lock API + `work_edit_locks` |
| BR-AUD-* | PRD §1.2 / PRD-AUD | Writers across modules → `audit_logs` |
| BR-BAK-* | PRD-BAK | Worker + Backup API |
| BR-RPT-* | PRD-RPT | Reports API |
| BR-PRJ-* | PRD-WORK | `works.project_name` |
| BR-VAL-04 | PRD-WORK | DELETE work guarded by child existence |

Individual BR titles remain authoritative in `docs/06-business-rules.md`. Validation IDs `VAL-*` in Doc 08 map to OpenAPI schema constraints + `ProblemDetails.errors[]`.

---

## 6. Migration → Domain Coverage

| Migrations | Domain coverage |
|------------|-----------------|
| M0001–M0002 | Identity |
| M0003 | Masters |
| M0004 | System settings / numbering |
| M0005–M0006 | Work aggregate + locks |
| M0007–M0008 | Documents + files |
| M0009–M0010 | Estimates + schedule |
| M0011–M0012 | Billing + expenditure |
| M0013–M0015 | Reports prefs, audit, backup |
| M0016–M0017 | Seeds + DB privileges |

---

## 7. Cross-Cutting Design Docs → Product IDs

| Design document | Primary PRD / BR / FS |
|-----------------|----------------------|
| Authentication & Authorization | PRD-AUTH, PRD-ADM, PRD-AUD · F-AUTH-* · BR-SEC-* · BR-AUD-* · A-SEC-* |
| File Storage | PRD-DOC, PRD-EXP, PRD-BAK · F-DOC-* · BR-DOC-* · BR-EXP-11 |
| Reporting Engine | PRD-RPT · F-RPT-* · BR-RPT-* · RPT-01..09 (Doc 10) |

---

## 8. Explicit Non-Coverage (v1)

| Product exclusion | No API | No table |
|-------------------|--------|----------|
| Offline / Sync | ✓ | ✓ |
| Excel import | ✓ | ✓ |
| Recycle bin | ✓ | ✓ |
| Branding upload | ✓ | (defaults in `app_settings` only) |
| BOQ line items | ✓ | ✓ |
| Full Project module | ✓ | (name column only) |
| Client/Contractor master entities | ✓ | (free text) |

---

## 9. Maintenance Rule

When adding a feature:

1. Assign/extend PRD + FS + BR IDs in product docs.  
2. Add/update OpenAPI operation with `x-fs-refs` / `x-prd-refs` / `x-br-refs`.  
3. Update API Catalogue table.  
4. Update SQL design table/column list + Domain map.  
5. Add migration ID if schema changes.  
6. Update security / storage / reporting design docs when those surfaces change.  
7. Update this matrix.

---

**End of Traceability Matrix**
