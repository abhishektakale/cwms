# CWMS v1.0 — API Catalogue (Architecture Design)

**Type:** Architecture / Design specification (not implementation)  
**Companion:** `openapi.yaml` (OpenAPI 3.1)  
**API Version:** `v1` — base path `/api/v1`  
**Traceability:** Functional Spec IDs (`F-*`, `G-*`) from `docs/03-functional-specification.md`; Business Rules from `docs/06-business-rules.md`; PRD from `docs/02-product-requirements-document.md`  

---

## 1. Conventions

| Topic | Rule |
|-------|------|
| Style | Resource-oriented REST over HTTPS |
| Format | JSON (`application/json`) except multipart uploads and file/report downloads |
| Auth | Session cookie or `Authorization: Bearer <token>` (transport-agnostic; server validates session) |
| Versioning | URI prefix `/api/v1`; breaking changes require `/api/v2` |
| Pagination | `page` (1-based), `pageSize` (default 20, max 100); response `items`, `page`, `pageSize`, `totalItems`, `totalPages` |
| Sorting | `sort=field:asc\|desc` (comma-separated multi-sort allowed) |
| Filtering | Query parameters per resource |
| Search | `q` for text search where specified |
| IDs | Opaque UUID or bigint string in JSON; clients treat as string |
| Money | Decimal strings `"1000000.00"` (avoid binary float) |
| Dates | ISO-8601 dates `YYYY-MM-DD`; date-times UTC `YYYY-MM-DDThh:mm:ssZ` |
| Errors | RFC 7807-style `application/problem+json` (see OpenAPI `ProblemDetails`) |
| Idempotency | `POST` creates; `PUT`/`PATCH` updates; deletes permanent where specified |
| Viewer | All mutating methods return `403` for Viewer |

### 1.1 Standard Error Codes

| HTTP | When |
|------|------|
| 400 | Validation failure (`errors[]` field details) |
| 401 | Not authenticated / session expired |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate WO, edit lock, in-use master) |
| 413 | Upload too large |
| 415 | Unsupported media type |
| 422 | Semantic business rule failure (optional; may use 400) |
| 423 | Locked (work edit lock) — or 409 with `code=WORK_LOCKED` |
| 500 | Unexpected server error |
| 503 | Maintenance mode (restore in progress) |

### 1.2 Common Response Headers

| Header | Meaning |
|--------|---------|
| `X-Request-Id` | Correlation id |
| `X-CWMS-API-Version` | `1.0` |

---

## 2. Endpoint Catalogue with Traceability

### 2.1 Authentication — `PRD-AUTH`, `F-AUTH-*`, `G-01`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| POST | `/api/v1/auth/login` | Login | F-AUTH-01, F-AUTH-01A/B, PRD-AUTH | Anonymous |
| POST | `/api/v1/auth/logout` | Logout | F-AUTH-03 | Authenticated |
| GET | `/api/v1/auth/me` | Current user | G-01 | Authenticated |
| POST | `/api/v1/auth/change-password` | Change password | F-AUTH-02, BR-SEC-02 | Authenticated |
| POST | `/api/v1/auth/refresh` | Refresh/extend session (Remember Me) | F-AUTH-01A | Authenticated/refresh |

### 2.2 Users (Administration) — `PRD-ADM`, `F-USR-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/users` | List users | F-USR-01..03, PRD-ADM | Administrator |
| POST | `/api/v1/users` | Create user | F-USR-01 | Administrator |
| GET | `/api/v1/users/{userId}` | Get user | F-USR-02 | Administrator |
| PATCH | `/api/v1/users/{userId}` | Update user | F-USR-02 | Administrator |
| POST | `/api/v1/users/{userId}/deactivate` | Deactivate | F-USR-02 | Administrator |
| POST | `/api/v1/users/{userId}/activate` | Activate | F-USR-02 | Administrator |

### 2.3 Masters — `PRD-ADM`, `F-MST-*`, `BR-MST-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/masters/{masterType}` | List values | F-MST-02, PRD-ADM | Authenticated (read) |
| POST | `/api/v1/masters/{masterType}` | Create | F-MST-01, BR-MST-01 | Administrator |
| PATCH | `/api/v1/masters/{masterType}/{masterId}` | Update | F-MST-01, BR-MST-03 | Administrator |
| DELETE | `/api/v1/masters/{masterType}/{masterId}` | Delete | F-MST-01, BR-MST-02 | Administrator |

`masterType` ∈ `work-categories` \| `document-types` \| `deduction-heads` \| `expense-categories` \| `client-department-formats`

### 2.4 Dashboard & Alerts — `PRD-DASH`, `F-DASH-*`, `BR-TL-*`, `BR-STAT-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/dashboard/summary` | KPIs | F-DASH-01, PRD-DASH | Authenticated |
| GET | `/api/v1/dashboard/alerts` | Five alerts + counts | F-DASH-03, BR-BILL-13/14, BR-STAT-03/06/07 | Authenticated |
| GET | `/api/v1/dashboard/attention` | Traffic-light work list | F-DASH-02, BR-TL-* | Authenticated |
| GET | `/api/v1/dashboard/recent` | Recent works/activities | F-DASH-05 | Authenticated |

### 2.5 Works — `PRD-WORK`, `F-WORK-*`, `BR-FIN-*`, `BR-CON-01`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/works` | List/search/filter/sort | F-WORK-01/02, PRD-SRCH | Authenticated |
| POST | `/api/v1/works` | Create | F-WORK-04, BR-FIN-02..07 | Full-access |
| GET | `/api/v1/works/{workId}` | Get summary/detail | F-WORK-06 | Authenticated |
| PATCH | `/api/v1/works/{workId}` | Update | F-WORK-05, BR-CON-01 | Full-access + lock |
| DELETE | `/api/v1/works/{workId}` | Delete | F-WORK-07, BR-VAL-04 | Full-access |
| POST | `/api/v1/works/{workId}/lock` | Acquire edit lock | F-WORK-05, BR-CON-01 | Full-access |
| DELETE | `/api/v1/works/{workId}/lock` | Release lock | F-WORK-05, BR-CON-01 | Full-access (holder) |
| GET | `/api/v1/works/project-names` | Distinct project names | F-WORK-04, BR-PRJ-02 | Authenticated |
| GET | `/api/v1/works/{workId}/financial-summary` | Financial card | F-WORK-06, BR-FIN-08..13 | Authenticated |

### 2.6 Estimates — `PRD-EST`, `F-EST-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/works/{workId}/estimates` | List | F-EST-03 | Authenticated |
| POST | `/api/v1/works/{workId}/estimates` | Create | F-EST-01 | Full-access |
| GET | `/api/v1/estimates/{estimateId}` | Get | F-EST-03 | Authenticated |
| PATCH | `/api/v1/estimates/{estimateId}` | Update | F-EST-02 | Full-access |
| DELETE | `/api/v1/estimates/{estimateId}` | Delete | F-EST-02 | Full-access |

### 2.7 Schedule — `PRD-SCH`, `F-SCH-*`, `BR-STAT-04..06`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/works/{workId}/schedule-activities` | List | F-SCH-01 | Authenticated |
| POST | `/api/v1/works/{workId}/schedule-activities` | Create | F-SCH-01 | Full-access |
| PATCH | `/api/v1/schedule-activities/{activityId}` | Update | F-SCH-03 | Full-access |
| DELETE | `/api/v1/schedule-activities/{activityId}` | Delete | F-SCH-03 | Full-access |

### 2.8 Documents & Uploads — `PRD-DOC`, `F-DOC-*`, `BR-DOC-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/documents` | Register list/filter | F-DOC-05, PRD-DOC | Authenticated |
| GET | `/api/v1/works/{workId}/documents` | List by work | F-DOC-01 | Authenticated |
| POST | `/api/v1/works/{workId}/documents` | Upload single (multipart) | F-DOC-01, BR-DOC-02..04 | Full-access |
| POST | `/api/v1/works/{workId}/documents:batch` | Upload multiple | F-DOC-02 | Full-access |
| GET | `/api/v1/documents/{documentId}` | Metadata | F-DOC-03 | Authenticated |
| GET | `/api/v1/documents/{documentId}/content` | Download/open stream | F-DOC-03, BR-DOC-02 | Authenticated |
| DELETE | `/api/v1/documents/{documentId}` | Permanent delete | F-DOC-04, BR-DOC-06 | Full-access |

### 2.9 Billing — `PRD-BILL`, `F-BILL-*`, `BR-BILL-*`, `BR-FIN-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/bills` | List/filter | F-BILL-01 | Authenticated |
| POST | `/api/v1/bills` | Create | F-BILL-02, BR-BILL-*, F-FIN-03 | Full-access |
| GET | `/api/v1/bills/{billId}` | Get | F-BILL-06 | Authenticated |
| PATCH | `/api/v1/bills/{billId}` | Update | F-BILL-03/05 | Full-access |
| DELETE | `/api/v1/bills/{billId}` | Delete | F-BILL-04 | Full-access |
| GET | `/api/v1/works/{workId}/bills` | Bill history | F-BILL-06 | Authenticated |

### 2.10 Expenditure — `PRD-EXP`, `F-EXP-*`, `BR-EXP-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/expenses` | List/filter | F-EXP-06 | Authenticated |
| POST | `/api/v1/expenses` | Create | F-EXP-01/02 | Full-access |
| GET | `/api/v1/expenses/{expenseId}` | Get | F-EXP-05 | Authenticated |
| PATCH | `/api/v1/expenses/{expenseId}` | Update | F-EXP-05 | Full-access |
| DELETE | `/api/v1/expenses/{expenseId}` | Delete | F-EXP-05 | Full-access |
| POST | `/api/v1/expenses/{expenseId}/assign` | Assign 100% to work | F-EXP-03, BR-EXP-04 | Full-access |
| POST | `/api/v1/expenses/{expenseId}/cancel` | Cancel | F-EXP-04, BR-EXP-08 | Full-access |
| GET | `/api/v1/works/{workId}/expenses` | Work expenses | F-EXP-01 | Authenticated |

### 2.11 Reports — `PRD-RPT`, `F-RPT-*`, `BR-RPT-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/reports` | List report types | F-RPT-01 | Authenticated |
| POST | `/api/v1/reports/{reportType}/run` | Run report (JSON rows) | F-RPT-01, RPT-01..09 | Authenticated |
| POST | `/api/v1/reports/{reportType}/export` | Export PDF/Excel | F-RPT-03/04, BR-RPT-02 | Authenticated |
| GET | `/api/v1/reports/{reportType}/saved-filters` | List saved filters | F-RPT-05 | Authenticated |
| POST | `/api/v1/reports/{reportType}/saved-filters` | Save filter | F-RPT-05, BR-RPT-06 | Authenticated |
| PATCH | `/api/v1/reports/{reportType}/saved-filters/{filterId}` | Rename/default | F-RPT-05 | Authenticated (owner) |
| DELETE | `/api/v1/reports/{reportType}/saved-filters/{filterId}` | Delete filter | F-RPT-05 | Authenticated (owner) |

`reportType` ∈ `work-register` \| `billing` \| `expenditure` \| `financial-summary` \| `work-wise-summary` \| `pending-payment` \| `document-register` \| `general-expense` \| `dashboard-summary`

### 2.12 Search — `PRD-SRCH`, `F-SRCH-01`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/search` | Global search | F-SRCH-01, A-SRCH-* | Authenticated |

### 2.13 Backup & Restore — `PRD-BAK`, `F-BAK-*`, `BR-BAK-*`

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/backups` | History | F-BAK-02, BR-BAK-04 | Administrator |
| GET | `/api/v1/backups/{backupId}` | Detail | F-BAK-02 | Administrator |
| POST | `/api/v1/backups/{backupId}/restore` | Restore | F-BAK-03, BR-BAK-05..09 | Administrator |

### 2.14 Audit — `PRD-AUD` / `BR-AUD-*`, cross-cutting

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/audit-logs` | Query audit log | BR-AUD-01..03, PRD §1.2 | Administrator |

### 2.15 Platform

| Method | Path | Op | FS / PRD refs | Authz |
|--------|------|----|---------------|-------|
| GET | `/api/v1/health` | Liveness/readiness | NFR ops | Anonymous/Authenticated |
| GET | `/api/v1/meta` | API version, maintenance flag | G-04, BR-BAK-09 | Anonymous |

---

## 3. Authorization Matrix (API)

| Capability | Admin | Operator/Engineer/Accounts | Viewer |
|------------|-------|----------------------------|--------|
| Auth self | ✓ | ✓ | ✓ |
| Users admin | ✓ | — | — |
| Masters write | ✓ | — | — |
| Masters read | ✓ | ✓ | ✓ |
| Works/Bills/Expenses/Docs write | ✓ | ✓ | — |
| Works/Bills/Expenses/Docs read | ✓ | ✓ | ✓ |
| Reports run/export | ✓ | ✓ | ✓ (interim; see OQ-14-010) |
| Backup restore | ✓ | — | — |
| Audit read | ✓ | — | — |

---

## 4. Validation Mapping

Server MUST enforce Document 08 (`VAL-*`) and Document 06 (`BR-*`).  
OpenAPI `schemas` express field-level constraints; business conflicts return `409`/`400` with `code` from:

`DUPLICATE_WORK_ORDER`, `WORK_LOCKED`, `WORK_HAS_CHILDREN`, `MASTER_IN_USE`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `DUPLICATE_RA_BILL_NO`, etc.

---

## 5. Out of Scope Endpoints (v1)

Do not define: sync/*, offline/*, excel-import/*, recycle-bin/*, branding-upload/*, boq/*, notifications/centre/*

---

## 6. Companion Artefact

Machine-readable contract: **`openapi.yaml`** (OpenAPI 3.1).  
Human catalogue (this file) wins for narrative traceability; OpenAPI wins for schema structure. Keep both aligned.

---

**End of API Catalogue**
