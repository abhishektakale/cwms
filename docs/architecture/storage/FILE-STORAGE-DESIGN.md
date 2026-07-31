# CWMS v1.0 — File Storage Design

**Type:** Architecture / storage design (not implementation)  
**Traceability:** PRD-DOC, PRD-EXP, PRD-BAK · F-DOC-* · BR-DOC-* · BR-EXP-11 · Domain Document §2.7, StoredFile §2.8  
**Companions:** `../api/openapi.yaml` (documents + multipart), `../database/SQL-DATABASE-DESIGN.md` (`documents`, `stored_files`, `expense_attachments`)  
**Target:** S3-compatible object storage (ADR-001)  
**Out of scope:** SDK code, bucket IAM JSON, virus scanner product choice  

---

## 1. Goals

1. Every operational file is a **copy** in CWMS-managed storage (BR-DOC-02) — never a link to a user’s local path.  
2. Enforce PDF/images only and **≤ 20 MB** (BR-DOC-03/04).  
3. Separate **metadata** (RDBMS) from **bytes** (object storage).  
4. Support permanent delete without recycle bin (BR-DOC-06).  
5. Include document objects in weekly backup (BR-BAK-03).  

---

## 2. File Upload Lifecycle

### 2.1 Single document upload — F-DOC-01

```text
Client                API                   Validator         Object storage      DB
  |-- multipart ------>|                        |                   |            |
  |                    |-- size/MIME/magic ---->|                   |            |
  |                    |<- accept/reject -------|                   |            |
  |                    |-- put object ----------------------------->|            |
  |                    |<- storage_key -----------------------------|            |
  |                    |-- insert stored_files + documents --------------------->|
  |                    |-- audit DocumentUploaded ------------------------------->|
  |<- 201 Document ----|                        |                   |            |
```

**Atomicity rule:** No committed `documents` row without a successful object put. On DB failure after put, delete orphan object (compensating action) or run orphan-GC job.

### 2.2 Batch upload — F-DOC-02

Same per-file validation. Return per-file success/failure (`DocumentBatchUploadResult`). Partial success allowed; no single transaction across all files required.

### 2.3 Expense attachments — BR-EXP-11

Same MIME/size rules. Metadata via `expense_attachments` → `stored_files` (may omit full `documents` row if attachment is expense-only). Prefer reusing `stored_files` for all binaries.

### 2.4 States

```text
Uploading --> Available   (metadata + object committed)
Uploading --> Failed      (validation or storage error; no durable metadata)
Available --> Deleted     (permanent; object + metadata removed)
```

Interrupted upload → no partial committed document (PRD-DOC edge case).

---

## 3. Naming Convention

### 3.1 Object key (storage)

```text
{env}/works/{work_id}/documents/{yyyy}/{mm}/{stored_file_id}/{safe_original_name}
```

| Segment | Purpose |
|---------|---------|
| `env` | `prod` / `staging` / `dev` isolation |
| `work_id` | Aggregate partition |
| `yyyy/mm` | Time partitioning for ops listing |
| `stored_file_id` | UUID uniqueness; collision-proof |
| `safe_original_name` | Sanitized original filename (see §3.3) |

**Expense attachments:**

```text
{env}/expenses/{expense_id}/attachments/{stored_file_id}/{safe_original_name}
```

**Backup artifacts (separate prefix/bucket):**

```text
{env}/backups/{backup_record_id}/db/{dump_name}
{env}/backups/{backup_record_id}/files/...
{env}/backups/{backup_record_id}/manifest.json
```

Live documents and backups MUST NOT share the same prefix root (architecture ADR).

### 3.2 Business codes (optional display)

| Code | Pattern | Table |
|------|---------|-------|
| Document code | `DOC-YYYY-####` | `documents.document_code` |
| Work / Bill | Existing CWMS / BILL codes | unrelated to object key |

Object keys use UUID; business codes are for UI/search only.

### 3.3 Filename sanitization

- Strip path segments (`..\`, `/`).  
- Allow `[A-Za-z0-9._-]` plus limited Unicode letters; replace others with `_`.  
- Max length ~180 chars before extension.  
- Preserve extension only if it matches validated type.

---

## 4. Metadata Model

### 4.1 Logical

| Entity | Responsibility |
|--------|----------------|
| Document | Work link, type, number, title, uploader, remarks, timestamps |
| StoredFile | `storage_key`, original name, content type, size, checksum |
| ExpenseAttachment | Links expense ↔ StoredFile |

### 4.2 Physical (see SQL design)

- `documents` 1:1 `stored_files` via `stored_file_id` UNIQUE  
- `expense_attachments` N:1 expense, 1:1 file  

### 4.3 Required metadata fields

| Field | Required |
|-------|----------|
| work_id (for work documents) | Yes |
| document_type_id | Yes |
| file name / content type / size | Yes |
| uploaded_at / uploaded_by | Yes |
| document_number / title / remarks | Optional |
| checksum_sha256 | Recommended |

---

## 5. Folder / Object Organization

```text
bucket (or account)
├── prod/
│   ├── works/{workId}/documents/...
│   ├── expenses/{expenseId}/attachments/...
│   └── backups/{backupId}/...          # or dedicated backup bucket
├── staging/...
└── dev/...
```

| Concern | Design |
|---------|--------|
| Multi-env | Prefix or separate buckets |
| Listing | Prefer DB queries; do not rely on S3 list as source of truth |
| Public ACL | **Private** objects only; no public-read buckets for documents |
| Encryption | SSE at rest (provider managed or CMK) |

---

## 6. Versioning

| Scope | v1 policy |
|-------|-----------|
| Document content versioning | **Not in product** — each upload is a new Document/StoredFile |
| Overwrite in place | Not used; delete + re-upload creates new ids |
| Object storage bucket versioning | **Ops recommendation:** enable for ransomware/accidental delete recovery; opaque to app |
| App-level version field | None in v1 |

If bucket versioning enabled, permanent delete in app should still delete current object; lifecycle rules may purge noncurrent versions after N days (ops-owned).

---

## 7. Deletion Policy — BR-DOC-06, F-DOC-04

| Rule | Design |
|------|--------|
| Recycle bin | None |
| Confirmation | API requires `confirm=true` (or equivalent); UI double warning |
| Effect | Delete `documents` row + `stored_files` row + object bytes |
| Orphans | GC job removes objects without metadata and metadata without objects |
| Work delete | Blocked while documents exist (BR-VAL-04) |
| Estimate link | `estimates.document_id` SET NULL on document delete |
| Audit | DocumentDeleted with work id + file name |

Expense attachment delete: remove junction + stored file + object (or cascade with expense delete).

---

## 8. Retention

| Class | Retention |
|-------|-----------|
| Live work documents | Indefinite while work exists; no auto-purge in v1 |
| Deleted documents | Immediate purge (no soft delete) |
| Backup copies of files | 30 days with backup retention (BR-BAK-02) |
| Orphan GC grace | Design default 24–72 h before hard-delete unmarked orphans |

Archival of old completed works’ files is **out of v1** (aligned with SQL archival strategy).

---

## 9. Access Control

| Actor | Upload | Open/Download | Delete |
|-------|:------:|:-------------:|:------:|
| Administrator | ✓ | ✓ | ✓ |
| Operator / Engineer / Accounts | ✓ | ✓ | ✓ |
| Viewer | — | ✓ | — |
| Anonymous | — | — | — |

**Enforcement**

1. Authenticated session required.  
2. Authorization via RBAC (same as Documents API).  
3. Object storage credentials **never** exposed to browser.  
4. Downloads mediated by API (`GET /documents/{id}/content`) — server fetches object and streams, **or** issues short-lived pre-signed URL (TTL e.g. 60–300 s) after authz check.  

**Pre-signed URL rules (if used):** no public ACL; GET-only; bound to exact key; audit Open/Download optional (view not required in BR-AUD).

---

## 10. Download Behavior — F-DOC-03

| Mode | `disposition` | Use |
|------|---------------|-----|
| Inline | `inline` | In-browser PDF/image viewer |
| Attachment | `attachment` | Force download |

**Response headers (design)**

- Correct `Content-Type` from `stored_files.content_type`  
- `Content-Disposition` with sanitized filename  
- `X-Content-Type-Options: nosniff`  
- Cache: `private`, short max-age or no-store for sensitive docs  

Print uses browser print on inline view; no separate print binary in v1.

---

## 11. Size / Type Validation — BR-DOC-03/04

### 11.1 Allowed types

| Kind | Extensions (indicative) | MIME (indicative) |
|------|-------------------------|-------------------|
| PDF | `.pdf` | `application/pdf` |
| Images | `.jpg`, `.jpeg`, `.png` | `image/jpeg`, `image/png` |

**Reject:** Office docs, ZIP, EXE, SVG (XSS risk), HTML, WEBP optional — **v1 binding:** PDF + JPG/JPEG + PNG only unless PO extends.

### 11.2 Validation pipeline (order)

1. Authenticated + Full-access.  
2. Multipart present; field size ≤ **20 MB** (20 × 1024 × 1024 bytes).  
3. Extension allowlist.  
4. Declared Content-Type allowlist.  
5. **Magic-byte / file-signature** check matches declared type.  
6. Reject mismatch → `415` / `INVALID_FILE_TYPE`.  
7. Oversize → `413` / `FILE_TOO_LARGE`.  

### 11.3 Antivirus (optional perimeter)

Not a product feature; recommended at reverse proxy or async scan. If scan fails, quarantine/delete object and do not expose download.

---

## 12. Backup Interaction

Weekly job (and initial backup):

1. DB dump including document metadata.  
2. Copy/list all live object keys under `works/` and `expenses/` into backup prefix (or snapshot).  
3. Write `manifest_json` with keys + checksums.  
4. Record Success/Failed on `backup_records`.  

Restore replaces DB + restores objects from backup prefix (Admin only, maintenance mode).

---

## 13. API Mapping

| Operation | Path |
|-----------|------|
| Upload | `POST /works/{workId}/documents` |
| Batch | `POST /works/{workId}/documents:batch` |
| Metadata | `GET /documents/{documentId}` |
| Content | `GET /documents/{documentId}/content` |
| Delete | `DELETE /documents/{documentId}?confirm=true` |
| Register | `GET /documents` |

---

## 14. Non-Functional Notes

| Topic | Guidance |
|-------|----------|
| Scale | ~200 works/year; unbounded docs/work but 20 MB cap keeps storage modest |
| Throughput | Sync upload in request for v1; async only if timeouts appear |
| Consistency | Metadata DB is source of truth for “what exists” |
| Cost | Lifecycle rules on backup prefix after 30 days |

---

## 15. Out of Scope (v1)

- User branding logo upload (v2)  
- Recycle bin / soft delete  
- Client-side direct-to-S3 without API authz (unless pre-signed upload URL designed later)  
- Document OCR / full-text inside PDFs  
- External DMS sync  

---

## 16. Approval Record

| Item | Value |
|------|-------|
| Document | File Storage Design v1.0 |
| Status | Draft for engineering handoff |
| Code | Explicitly excluded |
