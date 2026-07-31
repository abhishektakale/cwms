# CWMS – Construction Work Management System  
## 07 – Domain Model

**Document Type:** Product Design Package – Domain Model  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–06 + `dialog.md`  
**Depends On:** Documents 00–06  
**Audience:** Engineering, Architecture, BA, Product  
**Note:** No SQL, schemas, or API contracts. Product-level domain only.

---

## 0. Introduction

### 0.1 Purpose

This document defines the Version 1.0 domain:

- Entities
- Relationships
- Ownership
- Lifecycle
- Permissions
- Dependencies

It is the conceptual model behind Work-centric CWMS behaviour.

### 0.2 Modelling Principles

1. **Work is the aggregate root** for operational records (estimates, schedules, documents, bills, expenses assigned to works).
2. **One Work → everything related to that work** remains the organising idea.
3. **Projects are light** in Version 1.0 (name association, not a full aggregate module).
4. **Clients, Contractors, Vendors are free-text values**, not mandatory master entities.
5. **Masters** are Admin-maintainable option lists used by forms.
6. **No Sync/Offline replicas** in the Version 1.0 domain.

### 0.3 Legend

| Symbol | Meaning |
|--------|---------|
| **Root** | Aggregate root / primary ownership boundary |
| **Child** | Owned by / dependent on a parent |
| **Ref** | Reference / association without exclusive ownership |
| **System** | Created/managed primarily by the system |

---

## 1. Domain Context Map (Conceptual)

```text
┌─────────────────────────────────────────────────────────────┐
│                     CWMS Version 1.0 Domain                   │
│                                                               │
│  User ─── Role                                                │
│    │                                                          │
│    ├── AuditLog                                               │
│    ├── SavedReportFilter                                      │
│    └── (acts on) Work and children                            │
│                                                               │
│  MasterOptionList (Categories, DocTypes, DeductionHeads,      │
│                    ExpenseCategories, ClientDeptFormats)      │
│                                                               │
│  ProjectName (light, not full entity module)                  │
│       │                                                       │
│       └── Work  ◄────────────────────────────── ROOT          │
│             ├── Estimate                                      │
│             ├── ScheduleActivity                              │
│             ├── Document ──► StoredFile                       │
│             ├── Bill ──┬── BillDeduction                      │
│             │          └── Payment (optional detail)          │
│             └── Expense (work-specific or assigned)           │
│                                                               │
│  Expense (general, unassigned)                                │
│                                                               │
│  BackupRecord ──► BackupArtifact                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Entity Catalogue

### 2.1 User

| Attribute (conceptual) | Notes |
|------------------------|-------|
| User identity | Internal id |
| Name | Display name |
| Login ID | Unique credentials key |
| Password credential | Secure one-way stored secret |
| Role | Administrator / Data Entry Operator / Engineer / Accounts / Viewer |
| Mobile | Optional |
| Email | Optional |
| Active | Yes/No |
| Created On | Timestamp |
| Remember-Me tokens | Implementation detail; conceptually session persistence |

**Ownership:** Organisation / system administered by Administrator.  
**Lifecycle:** Created → Active ↔ Inactive → (no hard delete required in Version 1.0; deactivation preferred).  
**Permissions:** Admin manages users; each user authenticates as self; Viewer cannot mutate domain data.  
**Dependencies:** Role enumeration; AuditLog on changes.

---

### 2.2 Role (Enumeration)

Not a freestanding editable entity in Version 1.0 beyond the five fixed values:

1. Administrator  
2. Data Entry Operator  
3. Engineer  
4. Accounts  
5. Viewer  

**Ownership:** Product-defined.  
**Lifecycle:** Fixed for Version 1.0.  
**Permissions:** Determines authorization outcomes (Document 06).  
**Dependencies:** None.

---

### 2.3 ProjectName (Light Concept)

| Attribute | Notes |
|-----------|-------|
| Name | Distinct string used on works |

**Ownership:** Not a full root module; emerges from Work.Project values.  
**Lifecycle:** Appears when first used; remains selectable while referenced by any work.  
**Permissions:** Any Full-access user may type/select; no Admin Projects screen.  
**Dependencies:** Work.  
**Note:** Dashboard “Total Projects” = count of distinct names.

---

### 2.4 Work (Aggregate Root)

| Attribute group | Attributes |
|-----------------|------------|
| Identity | Work ID (internal), Work Code (`CWMS-YYYY-####`) |
| Classification | Project name, Work Name, Work Category (from masters), Client (text), Contractor (text), Client/Department Format (from masters, optional) |
| Order | Work Order No. (unique), Work Order Date |
| Financial | GST Type, Work Portion Value, GST %, GST Amount, Total Work Value, Balance Work Value, Financial Progress % |
| Location | State, District, Taluka, Village, Existing Chainage, Design Chainage, Side (LHS/RHS/Both), Structure Type |
| Schedule summary | Start Date, Scheduled Completion, Actual Completion, Physical Progress % |
| Status | Planned / In Progress / Hold / Completed |
| Derived attention | Traffic light (Green/Yellow/Red) |
| Audit | Created On, Created By, Updated On, Updated By |
| Concurrency | Edit lock holder / lock timestamp (conceptual) |

**Ownership:** Organisational operational data; created by Full-access users.  
**Lifecycle:**
1. Created (Work Code assigned)
2. Updated through operational life
3. Status transitions among Planned / In Progress / Hold / Completed
4. Delete only if no children (blocked otherwise)
5. Soft concepts like archive not in Version 1.0

**Permissions:** Full-access mutate; Viewer read; edit lock governs concurrent editors.  
**Dependencies:** Masters (category/format); child collections; bill/expense aggregates for derived financials.  
**Derived fields:** Balance, Financial Progress, Gross Bills Raised, Payments Received, Outstanding, Total Expenditure, Estimated Profit/Loss (computed per Business Rules; may be stored for performance but rule-owned).

---

### 2.5 Estimate

| Attribute | Notes |
|-----------|-------|
| Estimate ID | Internal |
| Work reference | Required |
| Estimate No. | |
| Estimate Date | |
| Estimated Amount | |
| Revised Estimate | Optional |
| Approved By | Optional |
| Document reference | Optional link to Document |
| Remarks | Optional |

**Ownership:** Child of Work.  
**Lifecycle:** Create → Update → Delete (does not delete Work).  
**Permissions:** Full-access mutate; Viewer read.  
**Dependencies:** Work; optional Document.

---

### 2.6 ScheduleActivity

| Attribute | Notes |
|-----------|-------|
| Schedule ID | Internal |
| Work reference | Required |
| Activity | Name/description |
| Start Date / Finish Date | Planned |
| Actual Start / Actual Finish | Optional |
| Progress % | 0–100 |

**Ownership:** Child of Work.  
**Lifecycle:** Create → Update → Delete.  
**Permissions:** Full-access mutate; Viewer read.  
**Dependencies:** Work; feeds overdue alert rules with Work schedule summary fields.

---

### 2.7 Document

| Attribute | Notes |
|-----------|-------|
| Document ID / Code | Internal / optional DOC-YYYY-#### |
| Work reference | Required |
| Document Type | From masters |
| Document Number | Optional official reference |
| Title | |
| File Name | Original name |
| File Type | PDF / image |
| Storage reference | Pointer to StoredFile in CWMS storage |
| Upload Date | |
| Uploaded By | User |
| Remarks | Optional |

**Ownership:** Child of Work; binary owned by system storage.  
**Lifecycle:** Uploaded (copy stored) → Open/Download/Print → Permanently Deleted (no recycle bin).  
**Permissions:** Full-access upload/delete; all roles open/download/print as allowed for Viewer read.  
**Dependencies:** Work; Master Document Types; StoredFile.

---

### 2.8 StoredFile

| Attribute | Notes |
|-----------|-------|
| Storage key/URI | In CWMS-managed object storage |
| Size | Bytes; ≤ 20 MB enforced at upload |
| Content type | PDF or image |
| Checksum | Optional integrity aid |

**Ownership:** System file storage service.  
**Lifecycle:** Created on upload copy → Deleted with Document.  
**Permissions:** Access mediated via Document permissions.  
**Dependencies:** Document metadata record.

---

### 2.9 Bill

| Attribute | Notes |
|-----------|-------|
| Bill ID | Internal |
| System Bill Number | `BILL-YYYY-####`, required, system-assigned |
| Work reference | Required |
| Bill Type | RA Bill / Final Bill |
| RA Bill No. | Optional user value; unique per work when present |
| Bill Date | |
| Period From / To | |
| Previous Bill Amount | Informational/continuity |
| Current Work Portion Amount | |
| GST Amount | |
| Gross Bill Amount | Computed/stored |
| Total Deductions | Computed/stored |
| Net Bill Amount | Computed/stored |
| Payment Status | Pending / Partially Received / Fully Received |
| Payment Date | Optional |
| Amount Received | |
| UTR/Cheque No. | Optional |
| Bank Name | Optional |
| Remarks | Optional |
| Bill Status | Optional operational status if used; payment status is mandatory |

**Ownership:** Child of Work.  
**Lifecycle:** Created (system number assigned) → Updated (amounts/payments) → Deleted (recalculates Work aggregates).  
**Permissions:** Full-access mutate; Viewer read.  
**Dependencies:** Work; BillDeduction collection; optional Payment rows; Masters deduction heads / formats.

---

### 2.10 BillDeduction

| Attribute | Notes |
|-----------|-------|
| Deduction ID | Internal |
| Bill reference | Required |
| Deduction Name | Standard head or custom other |
| Amount | ≥ 0 |
| Kind | Standard vs Other line (conceptual) |

**Ownership:** Child of Bill (cascade delete with Bill).  
**Lifecycle:** Created/updated with Bill → Deleted with Bill or line removal.  
**Permissions:** Same as Bill.  
**Dependencies:** Bill; optional Master Deduction Heads for names.

---

### 2.11 Payment (Optional detail entity)

Discovery included Payments Received as a related structure. Version 1.0 MAY model payment fields on Bill only, or as child Payment rows summed into Amount Received.

| Attribute | Notes |
|-----------|-------|
| Payment ID | Internal |
| Bill reference | Required |
| Payment Date | |
| Amount Received | |
| UTR/Cheque No. | |
| Bank | |
| Remarks | |

**Ownership:** Child of Bill.  
**Lifecycle:** Create/update/delete with bill payment tracking.  
**Permissions:** Same as Bill.  
**Dependencies:** Bill.

If not modelled separately, Bill carries the payment attributes directly (acceptable Version 1.0 simplification).

---

### 2.12 Expense

| Attribute | Notes |
|-----------|-------|
| Expense ID / Code | Internal / optional EXP-YYYY-#### |
| Expense Type | Work-Specific / General |
| Work reference | Required if Work-Specific; null if General unassigned; set on assignment |
| Expense Date | |
| Expense Head | From masters |
| Vendor | Free text |
| Description | |
| Invoice/Bill No. | Optional |
| Invoice Date | Optional |
| Expense Value excl. GST | |
| GST % / GST Amount / Total | |
| Payment Mode | Cash / Bank Transfer / Cheque / UPI |
| Payment Reference | |
| Payment Date | |
| Status | Draft / Paid / Assigned to Work / Cancelled |
| Attachments | Zero or more StoredFiles via small attachment docs |

**Ownership:**  
- Work-Specific / Assigned → associated to Work (not exclusively cascading delete of Work; Work delete blocked if expenses exist).  
- General unassigned → organisational floating cost.  

**Lifecycle:** Draft → Paid → (optional) Assigned to Work → Cancelled; or Delete.  
**Permissions:** Full-access mutate; Viewer read.  
**Dependencies:** Optional Work; Master Expense Categories; attachments storage.

---

### 2.13 MasterOption

| Attribute | Notes |
|-----------|-------|
| Master Type | WorkCategory / DocumentType / DeductionHead / ExpenseCategory / ClientDepartmentFormat |
| Name | Unique within type |
| Active | Optional |
| Created/Updated | Audit timestamps |

**Ownership:** Administrator-maintained reference data.  
**Lifecycle:** Created → Renamed/Edited → Delete blocked if in use.  
**Permissions:** Admin mutate; all users read via form dropdowns.  
**Dependencies:** Referenced by Work/Bill/Document/Expense forms.

Seeded examples exist at first run (Drain, Bridge, Work Order, TDS, Labour, etc.).

---

### 2.14 SavedReportFilter

| Attribute | Notes |
|-----------|-------|
| Filter ID | Internal |
| User reference | Owner |
| Report Type | One of nine reports |
| Name | User label |
| Filter payload | Selected filter values |
| Is Default | Per user per report |

**Ownership:** Owning User.  
**Lifecycle:** Save → Rename / Set Default → Delete.  
**Permissions:** Owner manages own filters; no shared filters required in Version 1.0.  
**Dependencies:** User; Report type enumeration.

---

### 2.15 AuditLog

| Attribute | Notes |
|-----------|-------|
| Log ID | Internal |
| User | Actor or System |
| Date/Time | |
| Module | |
| Action | |
| Details | Description / references |

**Ownership:** System.  
**Lifecycle:** Append-only; not user-editable.  
**Permissions:** Administrator may view; not mutable.  
**Dependencies:** Triggered by domain events (Document 06).

---

### 2.16 BackupRecord

| Attribute | Notes |
|-----------|-------|
| Backup ID | Internal |
| Date/Time | |
| Identifier/Name | |
| Type | Automatic (weekly) |
| Status | Success / Failed |
| Retention expiry | Based on 30-day policy |
| Artifact reference | BackupArtifact |

**Ownership:** System.  
**Lifecycle:** Created by weekly job (and initial deploy backup) → Retained 30 days → Purged.  
**Permissions:** Admin views; Admin restores from Successful records.  
**Dependencies:** BackupArtifact contents (data + files).

---

### 2.17 BackupArtifact

| Attribute | Notes |
|-----------|-------|
| Storage location | Cloud backup storage |
| Contents | Business data snapshot + document objects |

**Ownership:** System.  
**Lifecycle:** Created with BackupRecord → Used by Restore → Deleted after retention.  
**Permissions:** Mediated by restore operation (Admin only).  
**Dependencies:** BackupRecord.

---

### 2.18 BrandingDefaults (Conceptual configuration)

| Attribute | Notes |
|-----------|-------|
| Default company/office name | System-provided Version 1.0 |
| Default logo asset | System-provided Version 1.0 |

**Ownership:** System product defaults.  
**Lifecycle:** Fixed for Version 1.0; user upload deferred to Version 2.0.  
**Permissions:** Not user-editable in Version 1.0.  
**Dependencies:** Report print/PDF headers.

---

### 2.19 WorkEditLock (Conceptual)

| Attribute | Notes |
|-----------|-------|
| Work reference | |
| Locked By User | |
| Locked At | |
| Expires At | On timeout/logout |

**Ownership:** System concurrency control tied to Work.  
**Lifecycle:** Acquired on Edit → Released on Save/Cancel/Timeout/Logout.  
**Permissions:** Enforced for all Full-access editors.  
**Dependencies:** Work; User; Session.

---

## 3. Relationships

### 3.1 Relationship Table

| From | Cardinality | To | Type | Notes |
|------|-------------|----|------|-------|
| User | many | AuditLog | creates | Actor on events |
| User | 1 | many | SavedReportFilter | owns |
| User | 1 | many | Document (Uploaded By) | ref |
| Work | 1 | many | Estimate | child |
| Work | 1 | many | ScheduleActivity | child |
| Work | 1 | many | Document | child |
| Work | 1 | many | Bill | child |
| Work | 1 | many | Expense | child when linked |
| Bill | 1 | many | BillDeduction | child cascade |
| Bill | 1 | many | Payment | child optional |
| Document | 1 | 1 | StoredFile | content |
| Expense | 0..1 | Work | ref | null if general unassigned |
| Expense | 0..many | StoredFile | attachments | |
| Work | many | MasterOption | ref | category/format names |
| Bill/Expense/Document | many | MasterOption | ref | heads/types |
| BackupRecord | 1 | 1 | BackupArtifact | |
| Work | 0..1 | WorkEditLock | control | |

### 3.2 Ownership Rules

1. Deleting a **Bill** deletes its **BillDeductions** (and Payments if modelled).  
2. Deleting a **Document** deletes its **StoredFile**.  
3. Deleting a **Work** is **blocked** while any Estimate, ScheduleActivity, Document, Bill, or linked Expense exists.  
4. Deleting a **MasterOption** is **blocked** while referenced.  
5. Deleting a **User** is not required; deactivation preferred.  
6. Assigning a General **Expense** to a Work sets reference; does not create a duplicate expense.

### 3.3 Derived Relationship: ProjectName ↔ Work

- Logical 1 ProjectName → many Works  
- Physical Version 1.0: shared string on Work, not mandatory Project table

---

## 4. Aggregate Boundaries

### 4.1 Work Aggregate

Consistency boundary for:
- Work attributes
- Child collections listed above
- Derived financial rollups for that work
- Edit lock

Invariants (enforced with Business Rules):
- Unique Work Code and Work Order No.
- Balance/Progress from Gross Bills Raised
- Status ∈ allowed set
- Financial fields non-negative inputs

### 4.2 Bill Aggregate (within Work)

- Bill + deductions (+ payments)
- Net/Gross consistency
- System Bill Number uniqueness

### 4.3 Expense Aggregate

- Single expense with optional work link and attachments
- Status-driven inclusion in totals

### 4.4 Identity Aggregate

- User + Role assignment + Active flag

### 4.5 Reference Data Aggregate

- MasterOption per type

### 4.6 Backup Aggregate

- BackupRecord + BackupArtifact

---

## 5. Lifecycle State Machines

### 5.1 Work Status

```text
Planned ──► In Progress ──► Completed
   │              │
   └────► Hold ◄──┘
            │
            └──► In Progress / Completed
```

Version 1.0 allows flexible setting with warnings (see Business Rules); not a hard workflow engine.

### 5.2 Bill Payment Status

```text
Pending ──► Partially Received ──► Fully Received
   │                │
   └────────────────┴──► (auto-adjusted from Amount Received)
```

### 5.3 Expense Status

```text
Draft ──► Paid ──► Assigned to Work
  │         │
  └────► Cancelled ◄────┘
```

General expenses typically enter Paid (or Draft) before Assigned.

### 5.4 Document Lifecycle

```text
Upload (copy stored) ──► Available ──► Permanently Deleted
```

### 5.5 Backup Lifecycle

```text
Scheduled/Initial Run ──► Success or Failed
Success ──► Retained (≤30 days) ──► Purged
Success ──► (Admin) Restored into live system
```

### 5.6 User Lifecycle

```text
Created (Active) ──► Inactive
Inactive ──► Active
```

Demo users created at first run.

---

## 6. Permissions by Entity (Version 1.0 Interim)

| Entity | Admin | Operator/Engineer/Accounts | Viewer |
|--------|-------|----------------------------|--------|
| User | CRUD/deactivate | Read self / change own password | Read self / change own password |
| MasterOption | CRUD | Read (via dropdowns) | Read (via dropdowns) |
| Work | CRUD* | CRUD* | R |
| Estimate | CRUD | CRUD | R |
| ScheduleActivity | CRUD | CRUD | R |
| Document/StoredFile | CRUD + open | CRUD + open | R + open/download/print |
| Bill (+ deductions/payments) | CRUD | CRUD | R |
| Expense | CRUD + assign | CRUD + assign | R |
| SavedReportFilter | Own CRUD | Own CRUD | Own CRUD |
| AuditLog | R | — | — |
| BackupRecord/Artifact | R + Restore | — | — |
| BrandingDefaults | R (fixed) | R | R |
| WorkEditLock | System | System | — |

\* Delete Work subject to child-existence block.  
CRUD = create/read/update/delete where allowed by rules.

---

## 7. Dependency Graph (Build/Logic Order)

```text
Role / User
    ↓
MasterOption
    ↓
Work (light ProjectName)
    ↓
├── Estimate
├── ScheduleActivity
├── Document → StoredFile
├── Bill → BillDeduction → Payment
└── Expense → attachments
        ↓
Derived Work financials & Dashboard alerts/traffic lights
        ↓
Reports / SavedReportFilter
        ↓
AuditLog (orthogonal)
BackupRecord (orthogonal)
```

---

## 8. Domain Events (Conceptual)

| Event | Effects |
|-------|---------|
| WorkCreated | Work Code assigned; audit |
| WorkUpdated | Recalc if financial fields change; audit; alerts may change |
| WorkEditLockAcquired/Released | Concurrency control |
| BillSaved/Deleted | Recalc Gross Bills, Balance, Progress, Outstanding; alerts |
| PaymentUpdated | Recalc Payments/Outstanding; alerts |
| ExpenseSaved/Assigned/Cancelled/Deleted | Recalc Expenditure & P/L; reports |
| DocumentUploaded/Deleted | Missing-doc alert; storage create/delete |
| MasterChanged | Future dropdown options change |
| BackupCompleted/Failed | History row |
| RestoreCompleted | System state replaced; audit |
| UserLoggedIn/Out | Audit; session |

---

## 9. Explicit Non-Entities in Version 1.0

The following are **not** Version 1.0 domain entities (deferred/removed):

- SyncQueue / SyncConflict / OfflineChangeSet  
- BoqItem / MeasurementBookLine / RunningQuantity  
- WorkDiaryEntry  
- NotificationCentreMessage (beyond computed alerts)  
- Full Project aggregate with agreement value module UI  
- Client/Contractor/Vendor master registers  
- RecycleBinItem  
- CompanyBrandingUpload  
- ExcelImportJob  

---

## 10. Invariants Checklist (Cross-Entity)

1. Every Bill, Estimate, ScheduleActivity, Document references an existing Work.  
2. Work Order No. unique; Work Code unique; System Bill Number unique.  
3. Balance = Total Work Value − Σ Bill.Gross.  
4. Financial Progress from Gross Bills only.  
5. Expense assignment is to at most one Work.  
6. Document files are PDF/image ≤ 20 MB and stored as copies.  
7. Viewer never mutates entities.  
8. Restore only by Administrator.  
9. Master delete blocked when in use.  
10. Work delete blocked when children exist.

---

## 11. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Principal Software Architect (product-level) | ☐ Aggregates coherent | |
| Senior Business Analyst | ☐ Traceable to rules & PRD | |

---

## 12. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-07 |
| Title | Domain Model |
| Next Document | `08-validation-catalogue.md` |

---

**End of Document 07 – Domain Model**
