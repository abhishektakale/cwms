# CWMS v1.0 — Reporting Engine Design

**Type:** Architecture / reporting design (not implementation)  
**Traceability:** PRD-RPT · F-RPT-* · BR-RPT-* · Doc `10-reporting-catalogue.md` (RPT-01..09)  
**Companions:** `../api/openapi.yaml` (`/reports/*`), `../database/SQL-DATABASE-DESIGN.md` (`saved_report_filters`), AuthZ Viewer may export  
**Out of scope:** Concrete PDF/Excel library choice, pixel-perfect templates, source code  

---

## 1. Goals

1. Deliver nine frozen reports (BR-RPT-01 / RPT-01..09).  
2. Support interactive run (JSON) + **PDF** and **Excel** export (BR-RPT-02).  
3. Apply April–March FY filters (BR-RPT-03).  
4. Use system **default branding** only in v1 (BR-RPT-04/05).  
5. Per-user saved filters (BR-RPT-06).  
6. Financial figures consistent with Gross Bills Raised basis (BR-RPT-08 / BR-FIN-08/09).  
7. Perform acceptably at ~200 works/year + multi-year history with filters.  

---

## 2. Report Catalogue Binding

| Code | Name | API `reportType` |
|------|------|------------------|
| RPT-01 | Work Register Report | `work-register` |
| RPT-02 | Billing Report | `billing` |
| RPT-03 | Expenditure Report | `expenditure` |
| RPT-04 | Financial Summary Report | `financial-summary` |
| RPT-05 | Work-wise Summary Report | `work-wise-summary` |
| RPT-06 | Pending Payment Report | `pending-payment` |
| RPT-07 | Document Register | `document-register` |
| RPT-08 | General Expense Report | `general-expense` |
| RPT-09 | Dashboard Summary Report | `dashboard-summary` |

Column sets, section layouts, and filter dictionaries remain authoritative in Doc 10. This design defines the **engine** around that catalogue.

---

## 3. Report Generation Flow

### 3.1 Interactive run (preview)

```text
User → SPA Report screen
     → POST /reports/{reportType}/run  { filters, sort }
     → AuthZ (authenticated; all roles including Viewer)
     → Normalize & validate filters (FY, dates, enums)
     → Query read models (SQL) with same formulas as Work/Dashboard
     → Assemble ReportRunResponse { columns, rows|sections, totals, generatedAt, filtersApplied }
     → SPA grid / section view
```

Empty result: still return header metadata + empty rows; UI shows no-records body (BR-RPT-07).

### 3.2 Export

```text
User → Export PDF | Excel
     → POST /reports/{reportType}/export  { filters, sort, format }
     → Same query pipeline as /run (shared service)
     → Renderer: PdfRenderer | ExcelRenderer
     → Stream file with Content-Disposition attachment
     → On failure: problem+json; no corrupt partial download (best effort: buffer then send, or multipart abort)
```

**Invariant:** `/run` and `/export` MUST share one filter normalization + data-fetch path so on-screen and exported numbers match (Doc 10 NFR).

### 3.3 Logical components

| Component | Responsibility |
|-----------|----------------|
| ReportRegistry | Maps reportType → definition (columns, filters schema, orientation hint) |
| FilterNormalizer | FY expansion, date bounds, role-safe defaults |
| ReportQueryService | Parameterized SQL / read-model queries; no ad-hoc string concat from UI |
| TotalsCalculator | Aggregates consistent with BR-FIN / catalogue |
| BrandingProvider | Default company name + default logo asset |
| PdfRenderer | Paginated layout + header/footer |
| ExcelRenderer | Sheet(s) + typed numerics |
| SavedFilterStore | CRUD on `saved_report_filters` |

---

## 4. Filters

### 4.1 Common patterns

| Filter class | Examples | Notes |
|--------------|----------|-------|
| Financial year | `2026-27` | Expand to 1 Apr Y → 31 Mar Y+1 (BR-RPT-03) |
| Date range | bill date, expense date, WO date | Inclusive bounds |
| Status / enums | work status, payment status | From product enums |
| Free text | client, contractor, vendor, project | Case-insensitive contains |
| Masters | category, document type, expense head | By id |
| Work scope | workId / workCode | Detail drills |
| Traffic / alerts | optional | Where catalogue defines |

Exact filter sets per report: Doc 10. API accepts opaque `filters` object validated against the report’s schema.

### 4.2 Saved filters — F-RPT-05, BR-RPT-06

| Behaviour | Design |
|-----------|--------|
| Scope | Per user, per reportType |
| Operations | Save, rename, set default, delete, list, apply |
| Storage | `saved_report_filters.filters_json` (JSONB) |
| Default | At most one `is_default` per (user, reportType) |
| Security | Owner-only mutate; no shared/global filters in v1 |
| Apply | Client loads payload into filter form then calls `/run` |

### 4.3 Validation

- Unknown keys ignored or 400 (prefer **400** for unknown required schema violations).  
- Invalid FY format → 400.  
- Date from > to → 400.  

---

## 5. Export Pipeline

```text
Validated filters
    → Fetch dataset (same as preview)
    → Build ReportDocument model
         { meta, branding, filtersApplied, columns, rows|sections, totals }
    → Branch on format
         pdf   → layout engine → byte stream application/pdf
         excel → workbook builder → byte stream XLSX MIME
    → Response headers:
         Content-Disposition: attachment; filename="{reportType}_{yyyyMMdd_HHmm}.{ext}"
```

### 5.1 Filename convention

```text
CWMS_{reportType}_{fyOrAll}_{yyyyMMdd_HHmmss}.pdf|xlsx
```

Sanitize `reportType`; no user-controlled path segments.

### 5.2 Timeout / size

| Concern | Design default |
|---------|----------------|
| Sync export | Suitable for v1 scale; target complete within ~30–60 s |
| Row cap warning | Soft guidance: if result > N rows (e.g. 10,000), return 400 `RESULT_TOO_LARGE` asking user to narrow filters — tune N in implementation |
| Async export | **Future** (see §9) |

---

## 6. PDF Generation — BR-RPT-05

### 6.1 Page chrome (every PDF)

| Element | Content |
|---------|---------|
| Logo | System default logo asset (not user-uploaded) |
| Company / office | System default name from `app_settings` / BrandingDefaults |
| Report name | From catalogue |
| Project name | When filter/scope applicable |
| Generated at | Date & time |
| User name | Current user display name |
| Filters used | Human-readable summary of applied filters |
| Page number | `Page X of Y` |

### 6.2 Layout

| Report | Typical orientation (Doc 10) |
|--------|------------------------------|
| RPT-01..03 | Landscape |
| RPT-04, 05, 07..09 | Portrait |
| RPT-06 | Portrait or landscape |

Sectioned reports (Financial Summary, Work-wise Summary, Dashboard Summary) render **sections**, not only flat tables.

### 6.3 Typography & money

- Use readable fonts embeddable for PDF (implementation choice).  
- Money formatted with ₹ and 2 decimals consistent with UI.  
- Do not clip critical totals; allow multi-page tables with repeated header row.

### 6.4 Print preview

SPA may print from HTML preview **or** open generated PDF inline. Catalogue requires print preview capability; PDF path satisfies print need.

---

## 7. Excel Generation — BR-RPT-02

| Rule | Design |
|------|--------|
| Format | `.xlsx` (Office Open XML) |
| Import | **Not offered** in v1 |
| Sheets | Usually one sheet named after report; sectioned reports MAY use multiple sheets or stacked blocks with section titles |
| Types | Numbers as numeric cells (not text) for amounts/percents; dates as dates |
| Header block | Rows 1–n: company, report name, generated at, user, filters (text) |
| Data table | Starts below header; freeze header row recommended |
| Formulas | Not required; export computed values |
| Branding | Text company name in header; logo embedding in Excel optional (nice-to-have); PDF is branding-primary |
| Empty | Header + “No records” row |

---

## 8. Performance Considerations

| Technique | Application |
|-----------|-------------|
| Shared query path | One implementation for run + export |
| Indexed filters | Rely on SQL design indexes (status, dates, FKs) |
| Select only needed columns | Per report projection |
| Use cached work rollups | `works.gross_bills_raised`, etc., when report matches BR-FIN definitions — still verify consistency tests |
| Avoid N+1 | Join/batch child aggregates |
| Pagination of preview | Optional `page`/`pageSize` on `/run` for large grids; export uses full filtered set within cap |
| FY predicate | Compute date bounds once in FilterNormalizer |
| Concurrent users | ~50 concurrent app users; reports are read-only — use read replica later if needed (not required for v1) |
| Caching | Optional short TTL cache of Dashboard Summary report for identical filters; invalidate on writes not mandatory at this scale |

**Acceptance scale:** ~200 works/year plus historical years with typical filters completing without UI freeze (Doc 10 §13).

---

## 9. Scheduling (Future)

**Out of v1 product scope** for user-facing scheduled report delivery.

### 9.1 Future design stub (v2+)

| Topic | Intent |
|-------|--------|
| Trigger | Cron / weekly email of RPT-09 or Pending Payment |
| Storage | Generated artifact in object storage under `reports/scheduled/` |
| Auth | Per-user schedule ownership; Admin global schedules |
| Delivery | Email attachment or in-app download list |
| Reuse | Same ReportQueryService + renderers |

Do not build scheduler UI in v1. Weekly **backup** job remains separate (PRD-BAK).

---

## 10. Branding — BR-RPT-04/05

### 10.1 Version 1.0

| Asset | Source |
|-------|--------|
| Company / office name | System default (`app_settings` / BrandingDefaults §2.18) |
| Logo | System-packaged static asset (file or object key under app-managed prefix) |
| User upload | **Forbidden** in v1 (Settings / branding upload deferred) |

### 10.2 Application points

1. PDF header (required).  
2. Excel header text (required name; logo optional).  
3. Print CSS for HTML preview if used.  

### 10.3 Version 2.0 (reserved)

- Admin upload logo + edit company name.  
- Store in object storage + `app_settings`.  
- Invalidate cached report chrome.  
- No change to report query logic.

### 10.4 BrandingProvider interface (logical)

```text
getCompanyName() -> string
getLogoStream() -> bytes | url
getTimezoneLabel() -> for generated-at display (IST default)
```

---

## 11. Authorization & Audit

| Action | Roles |
|--------|-------|
| List/run/export reports | All authenticated roles including Viewer |
| Saved filters CUD | Owner (any authenticated role) |
| Branding change | N/A in v1 |

Audit: report **view/export** not required in BR-AUD-01. Optional future: audit export of sensitive financial reports.

---

## 12. API Surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/reports` | List catalogue |
| POST | `/reports/{reportType}/run` | JSON result |
| POST | `/reports/{reportType}/export` | PDF/XLSX bytes |
| GET/POST | `/reports/{reportType}/saved-filters` | List/create |
| PATCH/DELETE | `/reports/{reportType}/saved-filters/{filterId}` | Update/delete |

Error model: shared `ProblemDetails` (validation, too large, unauthorized).

---

## 13. Consistency Test Hooks

Engineering MUST maintain golden tests (design-level expectation):

1. Same filters → `/run` totals = `/export` parsed totals.  
2. Work Register Balance / Financial Progress = Work financial card (BR-RPT-08).  
3. Dashboard Summary report KPIs = Dashboard API for same FY/project scope.  
4. FY 2026–27 bounds = 2026-04-01 .. 2027-03-31.  

---

## 14. Out of Scope (v1)

- Excel **import**  
- Custom report builder  
- User branding upload  
- Email-scheduled reports  
- Pixel-identical Word export  
- Server-side HTML-to-PDF of arbitrary SPA pages (engine uses structured ReportDocument)  

---

## 15. Approval Record

| Item | Value |
|------|-------|
| Document | Reporting Engine Design v1.0 |
| Status | Draft for engineering handoff |
| Code | Explicitly excluded |
