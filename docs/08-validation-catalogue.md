# CWMS – Construction Work Management System  
## 08 – Validation Catalogue

**Document Type:** Product Design Package – Validation Catalogue  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–07 + `dialog.md`  
**Depends On:** Documents 00–07 especially `06-business-rules.md`  
**Audience:** Engineering, QA, BA, Product  

---

## 0. Introduction

### 0.1 Purpose

This catalogue lists every Version 1.0 validation:

- Field validations
- Business validations
- Cross-module validations
- Error conditions and user-facing messages (intent)

### 0.2 Severity Levels

| Level | Meaning | Effect |
|-------|---------|--------|
| **Block** | Must fix before save/action succeeds | Reject operation |
| **Warn** | Allowed to proceed after acknowledgment or soft warning | Save allowed |
| **Info** | Guidance only | No block |

### 0.3 Message Style

Messages below are **intent text**. UX may refine wording; meaning must remain.

### 0.4 ID Scheme

`VAL-<AREA>-<nnn>`

---

## 1. Authentication & User Validations

| ID | Field/Rule | Level | Rule | Error condition / message intent |
|----|------------|-------|------|----------------------------------|
| VAL-AUTH-001 | Username | Block | Required on login | Enter username |
| VAL-AUTH-002 | Password | Block | Required on login | Enter password |
| VAL-AUTH-003 | Credentials | Block | Username+password must match active user | Invalid username or password |
| VAL-AUTH-004 | Active flag | Block | User must be Active | Account is inactive. Contact Administrator |
| VAL-AUTH-005 | New password length | Block | ≥ 8 characters | Password must be at least 8 characters |
| VAL-AUTH-006 | New password complexity | Block | Must include upper and lower case | Password must include uppercase and lowercase letters |
| VAL-AUTH-007 | New password digit | Block | Must include a number | Password must include a number |
| VAL-AUTH-008 | New password symbol | Block | Must include a symbol | Password must include a symbol |
| VAL-AUTH-009 | Personal details | Block | Must avoid personal details (name/username/phone fragments when detectable) | Password must not contain personal details |
| VAL-AUTH-010 | Confirm password | Block | Must match new password | Passwords do not match |
| VAL-AUTH-011 | Current password | Block | Required and correct for self-change | Current password is incorrect |
| VAL-AUTH-012 | Login ID (admin create) | Block | Required | Enter login ID |
| VAL-AUTH-013 | Login ID unique | Block | Must be unique | Login ID already exists |
| VAL-AUTH-014 | User Name | Block | Required on create/edit | Enter name |
| VAL-AUTH-015 | Role | Block | Must be one of five roles | Select a valid role |
| VAL-AUTH-016 | Permission mutate | Block | Viewer cannot mutate | You do not have permission to perform this action |
| VAL-AUTH-017 | Session | Block | Protected actions require valid session | Session expired. Please sign in again |
| VAL-AUTH-018 | Admin-only function | Block | Masters/Users/Restore require Administrator | Administrator access required |

---

## 2. Work Register Validations

### 2.1 Field Validations

| ID | Field | Level | Rule | Message intent |
|----|-------|-------|------|----------------|
| VAL-WORK-001 | Work Name | Block | Required, non-blank after trim | Enter work name |
| VAL-WORK-002 | Work Order No. | Block | Required | Enter work order number |
| VAL-WORK-003 | Work Order No. | Block | Unique across works | Work order number already exists |
| VAL-WORK-004 | Work Order Date | Block | Required; valid date | Enter a valid work order date |
| VAL-WORK-005 | Work Status | Block | Required; ∈ Planned/In Progress/Hold/Completed | Select work status |
| VAL-WORK-006 | GST Type | Block | Required; ∈ GST Extra / GST Included | Select GST type |
| VAL-WORK-007 | Work Portion Value | Block | Required for GST Extra; numeric; ≥ 0 | Enter a valid work portion value |
| VAL-WORK-008 | Total Work Value (entered) | Block | Required for GST Included path; numeric; ≥ 0 | Enter a valid total work value |
| VAL-WORK-009 | GST % | Block | Required; numeric; ≥ 0; ≤ 100 (assumption) | Enter a valid GST % |
| VAL-WORK-010 | Project | Info/Warn | Optional but recommended | (optional) Consider entering project name |
| VAL-WORK-011 | Work Category | Warn | Recommended if masters exist | Select work category |
| VAL-WORK-012 | Client | Warn | Recommended | Enter client |
| VAL-WORK-013 | Contractor | Info | Optional | — |
| VAL-WORK-014 | Start Date | Block if both | If Scheduled Completion present, Start ≤ Scheduled Completion | Scheduled completion cannot be before start date |
| VAL-WORK-015 | Actual Completion | Block if both | If present with Start, Actual ≥ Start | Actual completion cannot be before start date |
| VAL-WORK-016 | Physical Progress % | Block | If present: 0–100 | Physical progress must be between 0 and 100 |
| VAL-WORK-017 | Side | Block if present | ∈ LHS / RHS / Both | Select a valid side |
| VAL-WORK-018 | Work Code | Block | System-assigned; user cannot edit | Work code cannot be changed |
| VAL-WORK-019 | Financial Progress % | Block | System-calculated; not user-editable | Financial progress is calculated by the system |
| VAL-WORK-020 | Balance Work Value | Block | System-calculated; not user-editable | Balance is calculated by the system |

### 2.2 Business Validations

| ID | Rule | Level | Message intent |
|----|------|-------|----------------|
| VAL-WORK-101 | GST Extra calculations must produce Total = Portion + GST | Block | Financial values are inconsistent; recalculate |
| VAL-WORK-102 | GST Included reverse calc must produce Portion + GST = Total | Block | Financial values are inconsistent; recalculate |
| VAL-WORK-103 | Status Completed with blank Actual Completion | Warn | Actual completion date is empty for a completed work |
| VAL-WORK-104 | Gross Bills Raised > Total Work Value (after bills) | Warn | Gross bills exceed total work value (negative balance) |
| VAL-WORK-105 | Delete work with children | Block | Cannot delete work while related estimates, schedules, documents, bills, or expenses exist |
| VAL-WORK-106 | Edit while locked by another user | Block | Edit in progress by another user. Try again later |
| VAL-WORK-107 | Viewer create/edit/delete work | Block | VAL-AUTH-016 |

---

## 3. Estimate Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-EST-001 | Work | Block | Required parent | Work is required |
| VAL-EST-002 | Estimate No. | Block | Required | Enter estimate number |
| VAL-EST-003 | Estimate Date | Block | Valid date required | Enter estimate date |
| VAL-EST-004 | Estimated Amount | Block | Numeric ≥ 0 | Enter a valid estimated amount |
| VAL-EST-005 | Revised Estimate | Block if present | Numeric ≥ 0 | Enter a valid revised estimate |
| VAL-EST-006 | Orphan estimate | Block | Cannot save without existing Work | Selected work was not found |

---

## 4. Schedule Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-SCH-001 | Work | Block | Required | Work is required |
| VAL-SCH-002 | Activity | Block | Required | Enter activity name |
| VAL-SCH-003 | Start/Finish | Block if both | Finish ≥ Start | Finish date cannot be before start date |
| VAL-SCH-004 | Actual Start/Finish | Block if both | Actual Finish ≥ Actual Start | Actual finish cannot be before actual start |
| VAL-SCH-005 | Progress % | Block | 0–100 | Progress must be between 0 and 100 |

---

## 5. Document Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-DOC-001 | Work | Block | Required | Select work |
| VAL-DOC-002 | Document Type | Block | Required; must exist in masters | Select document type |
| VAL-DOC-003 | File | Block | Required on upload | Choose a file |
| VAL-DOC-004 | File type | Block | PDF or image only | Only PDF and image files are allowed |
| VAL-DOC-005 | File size | Block | ≤ 20 MB | File exceeds the 20 MB limit |
| VAL-DOC-006 | Title | Warn | Recommended | Enter document title |
| VAL-DOC-007 | Document Number | Info | Optional | — |
| VAL-DOC-008 | Storage availability | Block | CWMS storage must accept copy | Upload failed. Storage unavailable. Try again |
| VAL-DOC-009 | Delete confirm | Block until confirm | Permanent delete acknowledgment required | Confirm permanent delete (no recycle bin) |
| VAL-DOC-010 | Open missing blob | Block | Stored object must exist | File is unavailable. Contact Administrator |
| VAL-DOC-011 | Batch partial failure | Warn | Some files may fail | N uploaded, M failed. Review failed files |
| VAL-DOC-012 | Viewer upload/delete | Block | VAL-AUTH-016 | |

---

## 6. Billing Validations

### 6.1 Field Validations

| ID | Field | Level | Rule | Message intent |
|----|-------|-------|------|----------------|
| VAL-BILL-001 | Work | Block | Required; must exist | Select work |
| VAL-BILL-002 | Bill Type | Block | RA Bill or Final Bill | Select bill type |
| VAL-BILL-003 | Bill Date | Block | Required valid date | Enter bill date |
| VAL-BILL-004 | Period From/To | Block if both | From ≤ To | Period end cannot be before period start |
| VAL-BILL-005 | RA Bill No. | Block if provided | Unique within same work | RA bill number already exists for this work |
| VAL-BILL-006 | Current Work Portion Amount | Block | Numeric ≥ 0 | Enter a valid current amount |
| VAL-BILL-007 | GST Amount | Block | Numeric ≥ 0 | Enter a valid GST amount |
| VAL-BILL-008 | Previous Bill Amount | Block if present | Numeric ≥ 0 | Enter a valid previous bill amount |
| VAL-BILL-009 | Standard deduction amounts | Block | Each ≥ 0 | Deduction amounts cannot be negative |
| VAL-BILL-010 | Other deduction name | Block if amount > 0 | Name required when amount entered | Enter deduction name |
| VAL-BILL-011 | Other deduction amount | Block | ≥ 0 | Deduction amount cannot be negative |
| VAL-BILL-012 | Payment Status | Block | Pending / Partially Received / Fully Received | Select payment status |
| VAL-BILL-013 | Amount Received | Block | Numeric ≥ 0 | Enter a valid amount received |
| VAL-BILL-014 | System Bill Number | Block | System-assigned; not user-editable | System bill number cannot be changed |

### 6.2 Business Validations

| ID | Rule | Level | Message intent |
|----|------|-------|----------------|
| VAL-BILL-101 | Gross = Current Portion + GST (per rules) | Block | Gross bill amount is inconsistent |
| VAL-BILL-102 | Total Deductions = sum of all deduction lines | Block | Total deductions are inconsistent |
| VAL-BILL-103 | Net = Gross − Total Deductions | Block | Net bill amount is inconsistent |
| VAL-BILL-104 | Net < 0 | Warn | Net bill is negative because deductions exceed gross |
| VAL-BILL-105 | Amount Received = 0 but status Fully Received | Block/Auto | Payment status does not match amount received |
| VAL-BILL-106 | Amount Received > 0 and < Net but status Pending | Warn/Auto | Payment status updated to Partially Received |
| VAL-BILL-107 | Amount Received ≥ Net ≥ 0 but not Fully Received | Warn/Auto | Payment status should be Fully Received |
| VAL-BILL-108 | Overpayment Amount Received > Net | Warn | Amount received exceeds net bill |
| VAL-BILL-109 | Work edit lock conflict while saving bill | Block/Warn | Per concurrency assumptions; prefer consistent recalculation without silent corruption |
| VAL-BILL-110 | Viewer mutate bill | Block | VAL-AUTH-016 |

---

## 7. Expenditure Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-EXP-001 | Expense Type | Block | Work-Specific or General | Select expense type |
| VAL-EXP-002 | Work | Block | Required if Work-Specific | Select work |
| VAL-EXP-003 | Work | Block | Must be empty/ignored on create when General (until assign) | — |
| VAL-EXP-004 | Expense Date | Block | Required valid date | Enter expense date |
| VAL-EXP-005 | Expense Head | Block | Required; from masters | Select expense head |
| VAL-EXP-006 | Vendor | Warn | Recommended free text | Enter vendor |
| VAL-EXP-007 | Expense Value | Block | Numeric ≥ 0 | Enter a valid expense value |
| VAL-EXP-008 | GST % | Block | Numeric ≥ 0; ≤ 100 assumption | Enter a valid GST % |
| VAL-EXP-009 | GST/Total consistency | Block | Total = Value + GST Amount | Expense totals are inconsistent |
| VAL-EXP-010 | Payment Mode | Block if Paid | ∈ Cash/Bank Transfer/Cheque/UPI when payment captured | Select payment mode |
| VAL-EXP-011 | Status | Block | Draft/Paid/Assigned to Work/Cancelled | Select status |
| VAL-EXP-012 | Assign target Work | Block | Required on assign; must exist | Select work to assign |
| VAL-EXP-013 | Assign only general/unassigned or reassignable | Block | Cannot assign invalid state | Expense cannot be assigned in its current state |
| VAL-EXP-014 | Attachment type/size | Block | Same as documents | Only PDF/images ≤ 20 MB |
| VAL-EXP-015 | Viewer mutate | Block | VAL-AUTH-016 | |

---

## 8. Masters Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-MST-001 | Master type | Block | One of five list types | Select master type |
| VAL-MST-002 | Name | Block | Required after trim | Enter a name |
| VAL-MST-003 | Name unique | Block | Unique within type (case-insensitive) | This name already exists |
| VAL-MST-004 | Delete in use | Block | Cannot delete referenced value | Cannot delete. This value is used by existing records |
| VAL-MST-005 | Non-Admin mutate | Block | Administrator only | VAL-AUTH-018 |

---

## 9. Reports Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-RPT-001 | Date From/To | Block if both | From ≤ To | End date cannot be before start date |
| VAL-RPT-002 | Financial Year | Block if selected | Must be valid Apr–Mar period label/range | Select a valid financial year |
| VAL-RPT-003 | Work-wise Summary Work | Block | Work required | Select a work |
| VAL-RPT-004 | Saved filter name | Block | Required on save | Enter a filter name |
| VAL-RPT-005 | Export failure | Block | Generation must succeed | Export failed. Try again |
| VAL-RPT-006 | Empty result | Info | Allowed | No records found for the selected filters |

---

## 10. Backup & Restore Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-BAK-001 | Restore role | Block | Administrator only | VAL-AUTH-018 |
| VAL-BAK-002 | Backup status | Block | Only Successful backups restorable | Selected backup cannot be restored |
| VAL-BAK-003 | Retention | Block | Backup must still be within 30-day retention | Backup is no longer available |
| VAL-BAK-004 | Double confirmation | Block | Both confirmation steps required | Confirm restore to continue |
| VAL-BAK-005 | Concurrent writes | Block | Writes blocked during restore | System restore is in progress |
| VAL-BAK-006 | Restore failure | Block | Must not leave undefined hybrid state if avoidable | Restore failed. System remains on previous state |

---

## 11. Search Validations

| ID | Field/Rule | Level | Rule | Message intent |
|----|------------|-------|------|----------------|
| VAL-SRCH-001 | Query length | Warn/Block | Extremely long queries truncated/rejected safely | Search text is too long |
| VAL-SRCH-002 | No matches | Info | Allowed | No matches found |

---

## 12. Cross-Module Validations

| ID | Modules | Level | Rule | Message intent |
|----|---------|-------|------|----------------|
| VAL-X-001 | Bill → Work | Block | Bill.Work must exist | Selected work was not found |
| VAL-X-002 | Expense → Work | Block | Work-Specific/Assign target must exist | Selected work was not found |
| VAL-X-003 | Document → Work | Block | Document.Work must exist | Selected work was not found |
| VAL-X-004 | Estimate/Schedule → Work | Block | Parent work must exist | Selected work was not found |
| VAL-X-005 | Bill save → Work financials | Block | Post-save aggregates must recompute successfully or transaction fails | Could not update work financials. Bill not saved |
| VAL-X-006 | Expense save → Work totals | Block | Same transactional integrity for qualifying expenses | Could not update work expenditure. Expense not saved |
| VAL-X-007 | Document type → Masters | Block | Type must exist | Selected document type is invalid |
| VAL-X-008 | Expense head → Masters | Block | Head must exist | Selected expense head is invalid |
| VAL-X-009 | Work category → Masters | Block if selected | Category must exist | Selected work category is invalid |
| VAL-X-010 | Delete master → children refs | Block | VAL-MST-004 | |
| VAL-X-011 | Delete work → children exist | Block | VAL-WORK-105 | |
| VAL-X-012 | Dashboard alerts ↔ source data | Info | Counts must reflect rules in Document 06 | (no user error; data consistency) |
| VAL-X-013 | Report FY ↔ date filters | Warn | If both FY and date range set, intersection applies; empty possible | No records found for the selected filters |
| VAL-X-014 | Gross progress basis | Block | UI must not allow saving a manual Financial Progress that overrides formula | VAL-WORK-019 |
| VAL-X-015 | General expense assign 100% only | Block | No multi-work split UI/values | Expense must be assigned to a single work |
| VAL-X-016 | File rules shared | Block | Expense attachments use document type/size rules | VAL-DOC-004/005 |
| VAL-X-017 | Unique Work Order vs bills | Info | Bills do not create new works | — |
| VAL-X-018 | Completed work still billable | Warn | Billing a Completed work allowed with warning | This work is marked Completed |
| VAL-X-019 | Hold work billable/expense | Info | Allowed | — |
| VAL-X-020 | Concurrent aggregate update | Block | No partial bill-without-rollup | VAL-X-005 |

---

## 13. Error Conditions Catalogue (Runtime / Environmental)

| ID | Condition | User-facing intent | Recovery |
|----|-----------|--------------------|----------|
| ERR-ENV-001 | Network unavailable during save | Connection lost. Changes were not saved | Retry when online |
| ERR-ENV-002 | Network unavailable during upload | Upload failed due to connection | Retry failed files |
| ERR-ENV-003 | Auth service/cloud unavailable at login | Unable to sign in. Try again | Retry |
| ERR-ENV-004 | Object storage unavailable | Upload failed. Storage unavailable | Retry / Admin |
| ERR-ENV-005 | Report engine failure | Unable to generate report | Retry |
| ERR-ENV-006 | Export failure | Export failed | Retry |
| ERR-ENV-007 | Backup job failure | (Admin history shows Failed) | Next schedule / ops |
| ERR-ENV-008 | Restore failure | Restore failed. Previous state retained | Retry other backup |
| ERR-ENV-009 | Unexpected server error | Something went wrong. Try again | Retry; Admin if persists |
| ERR-ENV-010 | Permission denied | You do not have permission | Use allowed role |
| ERR-ENV-011 | Resource not found | Record was not found | Refresh list |
| ERR-ENV-012 | Optimistic/lock conflict | Record changed or locked by another user | Reload and retry |
| ERR-ENV-013 | Session timeout mid-action | Session expired | Sign in again |
| ERR-ENV-014 | Double-submit | (Prevented by disabling button) | Wait for completion |

---

## 14. Warning Catalogue (Non-Blocking)

| ID | Condition | Message intent |
|----|-----------|----------------|
| WARN-001 | Completed without Actual Completion date | Actual completion date is empty |
| WARN-002 | Negative Balance / over-billing | Gross bills exceed total work value |
| WARN-003 | Negative Net bill | Deductions exceed gross |
| WARN-004 | Overpayment on bill | Amount received exceeds net |
| WARN-005 | Billing a Completed work | Work is marked Completed |
| WARN-006 | Batch upload partial failure | Some files failed |
| WARN-007 | Unsaved changes navigation | Discard unsaved changes? |
| WARN-008 | Permanent document delete | This cannot be undone |
| WARN-009 | Restore destructive | Current data will be replaced |
| WARN-010 | Missing recommended fields (client/category) | Recommended fields are empty |

---

## 15. Validation by Action Matrix (Summary)

| Action | Key validations |
|--------|-----------------|
| Login | VAL-AUTH-001–004, ERR-ENV-003 |
| Change password | VAL-AUTH-005–011 |
| Create/Edit Work | VAL-WORK-001–020, 101–107 |
| Delete Work | VAL-WORK-105 |
| Save Estimate/Schedule | VAL-EST-*, VAL-SCH-* |
| Upload Document | VAL-DOC-001–008, 011 |
| Delete Document | VAL-DOC-009 |
| Save Bill | VAL-BILL-001–014, 101–110, VAL-X-005 |
| Save/Assign Expense | VAL-EXP-*, VAL-X-006/015 |
| Maintain Masters | VAL-MST-* |
| Run/Export Report | VAL-RPT-* |
| Restore Backup | VAL-BAK-* |

---

## 16. Out-of-Scope Validations (Version 1.0)

Do not implement as Version 1.0 validation requirements:

- Offline queue conflict validations
- Sync merge validations
- Excel import schema validations
- BOQ quantity / MB validations
- Multi-work expense split percentage = 100% validations
- Recycle-bin restore eligibility validations
- Custom branding upload validations

---

## 17. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Senior Business Analyst | ☐ Catalogue complete | |
| QA Lead | ☐ Usable for test cases | |

---

## 18. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-08 |
| Title | Validation Catalogue |
| Next Document | `09-edge-case-catalogue.md` |

---

**End of Document 08 – Validation Catalogue**
