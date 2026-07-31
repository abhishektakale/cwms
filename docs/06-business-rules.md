# CWMS – Construction Work Management System  
## 06 – Business Rules

**Document Type:** Product Design Package – Business Rules  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** `dialog.md` + Documents 00–05  
**Depends On:** Documents 00–05  
**Audience:** Engineering, BA, QA, Product  

---

## 0. Introduction

### 0.1 Purpose

This document is the authoritative catalogue of Version 1.0 business rules for calculations, statuses, financial logic, documents, backup, concurrency, permissions, and cross-module consistency.

### 0.2 Conventions

| Notation | Meaning |
|----------|---------|
| BR-xxx | Binding Version 1.0 business rule |
| MUST / MUST NOT | Mandatory |
| MAY | Optional behaviour within stated bounds |
| ₹ | Display currency per discovery examples |

### 0.3 Explicitly Not Applicable in Version 1.0

| Topic | Status |
|-------|--------|
| Offline operation rules | N/A – online-only web app |
| Synchronization / sync conflict merge rules | N/A – Sync module removed |
| Excel data import transformation rules | N/A – deferred to Version 2.0 |
| BOQ quantity / MB running-quantity rules | N/A – deferred to Version 2.0 |
| Multi-work expense percentage split | N/A – deferred to Version 2.0 |
| Document recycle-bin retention rules | N/A – permanent delete only |

---

## 1. Identity and Numbering Rules

### BR-ID-01 Work Code
- System MUST assign a unique Work Code on successful work creation.
- Format: `CWMS-YYYY-####` where `YYYY` is calendar year of creation and `####` is a zero-padded sequence resetting (or continuing uniquely) per year such that codes remain unique.
- Users MUST NOT edit Work Code after assignment.

### BR-ID-02 System Bill Number
- System MUST assign a unique System Bill Number on successful bill creation.
- Format intent: `BILL-YYYY-####` (unique).
- System Bill Number MUST exist even when user RA Bill No. is blank.
- Users MUST NOT edit System Bill Number.

### BR-ID-03 Other system codes (optional display)
- Expense and Document system identifiers MAY be assigned (`EXP-YYYY-####`, `DOC-YYYY-####`) for audit/search; if assigned, they MUST be unique and read-only.

### BR-ID-04 Work Order Number uniqueness
- Work Order Number MUST be unique across works.
- Create/update MUST fail validation if another work already has the same Work Order Number.

### BR-ID-05 RA Bill Number uniqueness
- When RA Bill No. is provided, it MUST be unique within the same Work.
- Blank RA Bill No. is allowed.

### BR-ID-06 User Login ID uniqueness
- Login ID MUST be unique among users.

### BR-ID-07 Master value uniqueness
- Within each master type, Name MUST be unique (case-insensitive comparison recommended).

---

## 2. Official Financial Standard (Work Values)

### BR-FIN-01 Terminology (binding)
The following terms MUST be used consistently across Work Register, Billing, Dashboard, Reports, and Work Summary:

| Term | Meaning |
|------|---------|
| Work Portion Value | Value excluding GST |
| GST % | GST percentage rate |
| GST Amount | Absolute GST amount |
| Total Work Value | Portion + GST |
| Gross Bills Raised | Sum of bill Gross Bill Amounts for the work |
| Net Bill Amount | Gross Bill − Total Deductions for a bill |
| Payments Received | Sum of amounts received against bills (work rollup) |
| Outstanding | Unpaid remainder (see BR-BILL-16 / BR-FIN-12) |
| Balance Work Value | Total Work Value − Gross Bills Raised |
| Total Expenditure | Sum of qualifying expenses for the work |
| Estimated Profit/Loss | Gross Bills Raised − Total Expenditure (work level) |

### BR-FIN-02 GST Type
- Every work MUST have GST Type = **GST Extra** or **GST Included**.

### BR-FIN-03 GST % input
- GST % MUST be a free numeric input (not limited to a fixed pick-list).
- GST % MUST be ≥ 0.
- Practical upper bound MAY be validated (e.g., reject absurd values > 100 unless explicitly allowed). **Binding minimum:** ≥ 0; **Assumption BR-FIN-03A:** GST % SHOULD be ≤ 100 for Version 1.0 validation.

### BR-FIN-04 GST Extra calculation
When GST Type = GST Extra:

1. User enters Work Portion Value (base).
2. `GST Amount = Work Portion Value × GST % ÷ 100`
3. `Total Work Value = Work Portion Value + GST Amount`

### BR-FIN-05 GST Included calculation
When GST Type = GST Included:

1. User enters the inclusive total as Total Work Value (entered amount).
2. System reverse-calculates:
   - `GST Amount = Total Work Value × GST % ÷ (100 + GST %)`
   - `Work Portion Value = Total Work Value − GST Amount`
3. If GST % = 0, then GST Amount = 0 and Work Portion Value = Total Work Value.

### BR-FIN-06 Rounding
- Monetary calculations MUST be rounded to **2 decimal places** using half-up rounding unless organization standard differs.  
- **Assumption BR-FIN-06A:** Round half up to 2 decimals for ₹ amounts.
- Percent progress MAY display 2 decimals.

### BR-FIN-07 Non-negative work value inputs
- Work Portion Value, Total Work Value (entered), and GST Amount (stored) MUST be ≥ 0 after calculation.
- Negative user entry for these fields MUST be rejected.

### BR-FIN-08 Balance Work Value
```
Balance Work Value = Total Work Value − Gross Bills Raised
```
- Gross Bills Raised MUST be the sum of **Gross Bill Amount** of all non-deleted bills for the work.
- Net Bill Amount MUST NOT be used in this formula.
- Payments Received MUST NOT be used in this formula.
- Balance MAY be negative if Gross Bills Raised > Total Work Value (over-billing); system MUST display the actual value and SHOULD raise attention via traffic light/alert rules.

### BR-FIN-09 Financial Progress
```
If Total Work Value = 0:
    Financial Progress % = 0
Else:
    Financial Progress % = (Gross Bills Raised ÷ Total Work Value) × 100
```
- Financial Progress % is system-calculated and MUST NOT be manually overwritten on the Work form.
- Payments / Outstanding / Net MUST NOT be used as the progress denominator or numerator.

### BR-FIN-10 Gross Bills Raised (work rollup)
```
Gross Bills Raised = Σ Gross Bill Amount (all bills of the work that are not deleted)
```

### BR-FIN-11 Payments Received (work rollup)
```
Payments Received = Σ Amount Received (all bills of the work that are not deleted)
```

### BR-FIN-12 Outstanding (work rollup)
```
Outstanding = Σ max(Net Bill Amount − Amount Received, 0)   // default display
```
- **Assumption BR-FIN-12A:** Bill-level overpayment (Amount Received > Net) contributes 0 to work Outstanding and MAY show bill-level credit separately.
- Alternative portfolio “Outstanding Amount” dashboard widget MUST use the same definition.

### BR-FIN-13 Estimated Profit/Loss (work)
```
Estimated Profit/Loss = Gross Bills Raised − Total Expenditure
```
- Positive ⇒ estimated profit; negative ⇒ estimated loss; zero ⇒ break-even.
- This is an operational estimate, not statutory accounting profit.

### BR-FIN-14 Portfolio aggregates
Dashboard/report portfolio totals MUST sum the same definitions across works (and general unassigned expenses only where the metric is expenditure-wide).

### BR-FIN-15 Recalculation triggers
Work Balance, Financial Progress, Gross Bills Raised, Payments Received, Outstanding, Total Expenditure, and Estimated Profit/Loss MUST be recalculated when:
- Work financial fields change
- Bill create/update/delete occurs
- Bill payment fields change
- Qualifying expense create/update/delete/assign/cancel occurs

---

## 3. Billing Rules

### BR-BILL-01 Bill association
- Every bill MUST belong to exactly one Work.

### BR-BILL-02 Bill types
- Bill Type MUST be **RA Bill** or **Final Bill**.

### BR-BILL-03 Version 1.0 amount model
- Billing MUST use a **single total amount** model.
- Item-wise BOQ quantity lines MUST NOT be required or used in Version 1.0.

### BR-BILL-04 Gross Bill Amount
```
Gross Bill Amount = Current Work Portion Amount + GST Amount
```
- If product captures Previous Bill Amount for reference, it MUST NOT double-count into Gross unless explicitly entered as part of Current.  
- **Binding clarification:** Gross for progress/balance is the saved **Gross Bill Amount** of each bill. Previous Bill Amount is informational for RA continuity unless included in Current by user entry practice.

### BR-BILL-05 Standard deductions
Standard deduction fields include at minimum:
- Security Deposit
- TDS
- GST TDS (if applicable)
- Labour Cess
- Royalty
- Recovery

Each MUST be ≥ 0 when provided (blank treated as 0).

### BR-BILL-06 Other / flexible deductions
- User MAY add multiple other deduction lines (name + amount).
- Each other deduction amount MUST be ≥ 0.
- Deduction names MAY come from Masters Deduction Heads or free text for “other” lines.
- Add More MUST allow additional lines without software change.

### BR-BILL-07 Total Deductions
```
Total Deductions = Σ Standard Deduction Amounts + Σ Other Deduction Line Amounts
```

### BR-BILL-08 Net Bill Amount
```
Net Bill Amount = Gross Bill Amount − Total Deductions
```
- If Total Deductions > Gross Bill Amount, Net MAY be negative; system MUST display actual value and SHOULD warn.  
- **Assumption BR-BILL-08A:** Allow save with warning when Net < 0.

### BR-BILL-09 Payment Status values
Payment Status MUST be one of:
- **Pending**
- **Partially Received**
- **Fully Received**

### BR-BILL-10 Payment Status consistency
- If Amount Received = 0 → Status MUST be Pending (system MAY auto-set).
- If 0 < Amount Received < Net Bill Amount → Status MUST be Partially Received (auto-set allowed).
- If Amount Received ≥ Net Bill Amount and Net ≥ 0 → Status MUST be Fully Received (auto-set allowed).
- If Net < 0, Fully Received rules MAY treat Amount Received ≥ 0 as special case; **Assumption BR-BILL-10A:** manual status allowed with warning when Net < 0.

### BR-BILL-11 Amount Received
- Amount Received MUST be ≥ 0.
- Amount Received is per bill (Version 1.0 single payment fields on bill; multiple payment history table MAY exist from discovery Payments entity).  
- **Assumption BR-BILL-11A:** Version 1.0 UI stores payment fields on the bill; if multiple payments are recorded, Amount Received is the sum of payment rows for that bill.

### BR-BILL-12 Bill-level outstanding
```
Bill Outstanding = Net Bill Amount − Amount Received
```
(display may clamp at 0 for “pending” lists per BR-FIN-12A)

### BR-BILL-13 Pending bills (alert definition)
A bill contributes to **Pending bills** alert when:
- Payment Status = Pending, OR
- Payment Status = Partially Received  
(i.e., not Fully Received), and bill is not deleted.

### BR-BILL-14 Outstanding payments (alert definition)
A bill/work contributes to **Outstanding payments** alert when Bill Outstanding > 0 (using clamp rule).

### BR-BILL-15 Days pending (report)
```
Days Pending = max(Current Date − Bill Date, 0)
```
for bills with outstanding > 0.  
**Assumption BR-BILL-15A:** Use bill date if payment due date not captured in Version 1.0.

### BR-BILL-16 Delete bill
- Deleting a bill MUST remove its contribution from all work rollups and MUST delete/cascade its deduction lines (and payment rows if any).

### BR-BILL-17 Client/Department Format
- Selecting a Client/Department Format MAY default suggested deduction heads for entry convenience.
- It MUST NOT prevent flexible other deductions.
- Deep format engines beyond option selection are out of Version 1.0 scope.

---

## 4. Expenditure Rules

### BR-EXP-01 Expense types
- Expense Type MUST be **Work-Specific** or **General**.

### BR-EXP-02 Work-Specific
- Work-Specific expense MUST reference exactly one Work.

### BR-EXP-03 General
- General expense MUST allow null Work initially.

### BR-EXP-04 Assignment (Version 1.0)
- User MAY assign a General expense **100%** to exactly one Work.
- Multi-work percentage split MUST NOT be offered in Version 1.0.
- Reassignment to a different single work is allowed; totals MUST recalculate; change MUST be audited.

### BR-EXP-05 Expense GST
```
GST Amount = Expense Value (excl. GST) × GST % ÷ 100
Total Expense Amount = Expense Value + GST Amount
```
- GST % free number ≥ 0 (same bound assumption as work GST %).

### BR-EXP-06 Status values
Status MUST be one of:
- Draft
- Paid
- Assigned to Work
- Cancelled

### BR-EXP-07 Qualifying for totals
Expense amounts MUST count toward Total Expenditure when:
- Status ∈ {Paid, Assigned to Work}, AND
- Status ≠ Cancelled, AND
- For work totals: expense is Work-Specific for that work OR General assigned to that work.

**Assumption BR-EXP-07A:** Draft expenses do not count in totals.  
**Assumption BR-EXP-07B:** General Paid but unassigned counts in portfolio/general expenditure reports, not in any work’s Total Expenditure.

### BR-EXP-08 Cancelled
- Cancelled expenses MUST be excluded from all totals.
- Cancelled MUST be reversible only by changing status back via edit (if allowed); **Assumption BR-EXP-08A:** Full-access may change Cancelled → Paid/Draft with audit.

### BR-EXP-09 Payment modes
Payment Mode MUST be one of: Cash, Bank Transfer, Cheque, UPI (when payment details captured).

### BR-EXP-10 Vendor
- Vendor is free text (no mandatory vendor master in Version 1.0).

### BR-EXP-11 Attachments
- Expense attachments MUST follow document file rules (PDF/images, ≤ 20 MB, copied to CWMS storage).

### BR-EXP-12 Delete expense
- Delete MUST remove from totals immediately after successful delete.

---

## 5. Work Status and Schedule Rules

### BR-STAT-01 Allowed work statuses
Work Status MUST be one of:
1. Planned  
2. In Progress  
3. Hold  
4. Completed  

### BR-STAT-02 Status transitions (Version 1.0)
Version 1.0 MUST allow Full-access users to set any status without a hard workflow engine, except:
- **Assumption BR-STAT-02A:** No technical restriction preventing Planned → Completed directly (business may still prefer staged updates).
- Setting Completed SHOULD encourage Actual Completion date entry (warn if blank; do not hard-block unless validated). **Assumption BR-STAT-02B:** Warn if Completed and Actual Completion empty.

### BR-STAT-03 Works on Hold alert
- Every work with Status = Hold MUST contribute to **Works on Hold** alert.

### BR-STAT-04 Date order
- If both Start Date and Scheduled Completion exist: Scheduled Completion MUST be ≥ Start Date.
- If both Start Date and Actual Completion exist: Actual Completion MUST be ≥ Start Date.
- Activity Actual Finish MUST be ≥ Actual Start when both exist.
- Activity Finish Date SHOULD be ≥ Start Date when both exist (validate as MUST).

### BR-STAT-05 Physical Progress
- Physical Progress % MUST be between 0 and 100 inclusive.

### BR-STAT-06 Overdue / delayed schedule alert
A work contributes to **Overdue/delayed schedule** when:
- Status ≠ Completed, AND
- (
  Scheduled Completion Date < Current Date  
  OR  
  exists schedule activity where Finish Date < Current Date AND (Actual Finish is empty OR Progress < 100)
)

### BR-STAT-07 Missing key documents alert
A work contributes to **Missing key documents** when Status ≠ Completed and at least one key document type is absent.

**Key types (Version 1.0):**
- Work Order document type missing, OR
- Estimate document type missing when at least one Estimate record exists without a linked document, OR Estimate record missing entirely while Status ∈ {In Progress, Hold, Completed}  

**Simplified binding rule BR-STAT-07A:**  
Missing key documents if Status ∈ {In Progress, Hold, Completed} AND (no document of type Work Order OR no document of type Estimate).

Planned works MAY be excluded from this alert. **Assumption BR-STAT-07B:** Planned works do not raise missing-key alert.

---

## 6. Traffic Light Rules

### BR-TL-01 Indicator values
Each work MUST resolve to exactly one traffic light: Green, Yellow, or Red (highest severity wins).

### BR-TL-02 Red (Critical)
Work is Red if any is true:
- Status = Hold, OR
- Overdue/delayed schedule rule true for more than **30 days** past due, OR
- Balance Work Value < 0 (over-billed), OR
- Outstanding payment exists with Days Pending > **60**

### BR-TL-03 Yellow (Attention)
Work is Yellow (and not Red) if any is true:
- Overdue/delayed schedule rule true, OR
- Has Pending or Partially Received bills, OR
- Missing key documents rule true, OR
- Outstanding payment exists with Days Pending > **30**, OR
- Financial Progress = 0 AND Status = In Progress AND days since Start Date > **30** (idle billing attention)

### BR-TL-04 Green (Normal)
- Work is Green if not Yellow and not Red.
- Completed works with no outstanding and no negative balance SHOULD be Green.

### BR-TL-05 Threshold assumptions
Threshold days in BR-TL-02/03 are Version 1.0 defaults (30/60) derived as operational assumptions for alert usefulness; Product Owner may amend later without changing formula structure.

---

## 7. Document Rules

### BR-DOC-01 Ownership
- Every document MUST belong to exactly one Work.

### BR-DOC-02 Storage copy
- Uploaded files MUST be copied into CWMS-managed cloud/object storage.
- CWMS MUST NOT rely on a path to the user’s local original file.

### BR-DOC-03 Allowed types
- Allowed uploads: **PDF** and **images** only (e.g., JPG/JPEG/PNG).
- Other types MUST be rejected.

### BR-DOC-04 Size limit
- Each file MUST be ≤ **20 MB**.
- Larger files MUST be rejected.

### BR-DOC-05 Multiplicity
- Unlimited documents per document type per work are allowed.

### BR-DOC-06 Delete
- Delete is **permanent**.
- System MUST show warning that there is no recycle bin.
- On confirm, record and stored object MUST be removed (or object deleted and record removed atomically from user perspective).

### BR-DOC-07 Document types source
- Document Type MUST be selected from Masters Document Types (Admin-maintainable).

### BR-DOC-08 Document Number
- Document Number is optional but recommended; when present, searchable.

---

## 8. Project (Light) Rules

### BR-PRJ-01 Light model
- Version 1.0 MUST NOT require a full Projects module.
- Project on a work is a name association.

### BR-PRJ-02 Entry modes
- User MAY type a new project name (free text).
- User MAY select from dropdown of existing distinct project names already used on works.

### BR-PRJ-03 Aggregation
- “Total Projects” on dashboard = count of distinct non-empty project names (trimmed).

---

## 9. Parties (Client / Contractor / Vendor)

### BR-PARTY-01 Free text
- Client, Contractor, and Vendor MUST be free text in Version 1.0.
- No mandatory master register for these parties.

---

## 10. Masters Rules

### BR-MST-01 Admin maintainable lists
Administrator MUST be able to add/edit/delete:
- Work Categories
- Document Types
- Deduction Heads
- Expense Categories
- Client/Department Formats

### BR-MST-02 In-use protection
- System MUST prevent deletion of a master value that is referenced by existing records.

### BR-MST-03 Rename behaviour
- Renaming a master value updates the master label for future selection.
- Historical records KEEP previously saved values/labels already stored on those records (no mass rewrite required in Version 1.0).

### BR-MST-04 Immediate availability
- Newly added values MUST appear on forms without redeploy.

---

## 11. Permissions and Security Rules

### BR-SEC-01 Authentication required
- All business screens/data require authenticated session.

### BR-SEC-02 Password rules
User-set passwords MUST:
1. Be at least 8 characters
2. Contain uppercase and lowercase letters
3. Contain at least one number
4. Contain at least one symbol
5. Avoid personal details (name, username, phone fragments when detectable)

### BR-SEC-03 Demo accounts
- System MUST seed one demo user per role with username = role name and password `Password@123`.
- Demo passwords satisfy BR-SEC-02.

### BR-SEC-04 Remember Me
- Remember Me MAY extend browser session persistence per web session design; it MUST NOT bypass password rules on password change.

### BR-SEC-05 Interim authorization model
- Viewer MUST be view-only (no create/update/delete/restore/masters/user-admin).
- Administrator, Data Entry Operator, Engineer, Accounts MUST have full operational access.
- Administrator ONLY: Masters mutate, User admin, Restore.

### BR-SEC-06 Session timeout
- Inactive sessions MUST expire after a system default timeout.  
- **Assumption BR-SEC-06A:** Default 30 minutes inactivity timeout for Version 1.0 (Settings module excluded).

---

## 12. Concurrency / Conflict Rules (Online Multi-User)

### BR-CON-01 Work edit lock
- When a user enters Edit Work, system MUST acquire a lock for that Work.
- Another user attempting Edit MUST be denied with message that edit is in progress by another user.
- Lock MUST release on save success, cancel, navigation away after discard, logout, or session timeout.

### BR-CON-02 No offline sync conflicts
- Sync merge/conflict rules are out of scope.
- Concurrent bill/expense edits on different records MAY proceed; work aggregate recalculation MUST be transactional/consistent.

### BR-CON-03 Last-write on non-locked entities
- For bills/expenses/documents not covered by work lock, Version 1.0 MAY use last-successful-save wins with audit.  
- **Assumption BR-CON-03A:** Editing a bill SHOULD attempt related work lock or optimistic check; if not feasible, last save wins with audit.

---

## 13. Backup and Restore Rules

### BR-BAK-01 Automatic weekly backup
- System MUST run backups automatically on a **weekly** schedule.

### BR-BAK-02 Retention
- Backups MUST be retained for **30 days**.
- Older backups MUST be purged by retention processing.

### BR-BAK-03 Backup contents
Backup MUST include:
- Business data (works, estimates, schedules, bills, deductions, payments, expenses, documents metadata, users, masters, audit as applicable)
- Stored document/object files

### BR-BAK-04 History
- Each run MUST record date/time, identifier, type=automatic, status Success/Failed.

### BR-BAK-05 Restore authority
- Only Administrator MAY restore.

### BR-BAK-06 Restore confirmation
- Restore MUST require double confirmation and clear destructive warning.

### BR-BAK-07 Restore effect
- Successful restore MUST return recoverable system state to the selected backup point (data + documents).

### BR-BAK-08 Initial backup
- System SHOULD create an initial backup on first deployment/initialization.

### BR-BAK-09 Restore concurrency
- During restore, system MUST block concurrent write operations.

---

## 14. Reporting Rules

### BR-RPT-01 Catalogue
Version 1.0 MUST support the nine frozen reports listed in the PRD/Reporting Catalogue.

### BR-RPT-02 Export
- PDF and Excel **export** MUST be supported.
- Excel **import** MUST NOT be offered in Version 1.0.

### BR-RPT-03 Financial Year
- FY filters MUST use **April–March**.
- Example: FY 2026–27 = 1 Apr 2026 through 31 Mar 2027.

### BR-RPT-04 Branding
- Headers MUST use **default** company/office name and logo in Version 1.0.
- User upload of branding is Version 2.0.

### BR-RPT-05 Header metadata
Printed/PDF outputs MUST include: default company/office name, report name, project name when applicable, date & time, page number, user name, filters used, default logo.

### BR-RPT-06 Saved filters
- Users MAY save/rename/set default/delete filter sets.
- Saved filters are per user.
- One default per report per user.

### BR-RPT-07 Empty results
- Reports with zero rows MUST still render header and a no-records body.

### BR-RPT-08 Financial consistency
- Any report showing Balance/Financial Progress MUST use Gross Bills Raised basis (BR-FIN-08/09).

---

## 15. Dashboard Alert Rules (Summary)

| Alert | Rule reference |
|-------|----------------|
| Pending bills | BR-BILL-13 |
| Overdue/delayed schedule | BR-STAT-06 |
| Outstanding payments | BR-BILL-14 |
| Missing key documents | BR-STAT-07 / BR-STAT-07A |
| Works on Hold | BR-STAT-03 |

All five alerts MUST be visible with counts (including zero).

---

## 16. Audit Rules

### BR-AUD-01 Events
System MUST audit at minimum:
- Login success (and optionally failure)
- Logout
- Work create/update/delete
- Bill create/update/delete and payment changes
- Expense create/update/delete/assign/cancel
- Document upload/delete
- Masters add/edit/delete
- User admin changes
- Password changes
- Restore operations
- Backup job results (system)

### BR-AUD-02 Audit fields
Each audit entry MUST capture: timestamp, user (or System), module, action, details/reference ids.

### BR-AUD-03 Immutability
- Audit records MUST NOT be editable by end users.

---

## 17. Validation Cross-Rules (Selected)

### BR-VAL-01 Money fields
- Money inputs MUST be numeric and ≥ 0 unless a specific rule allows negative computed results (Balance, Net, P/L).

### BR-VAL-02 Required work fields
- Work Name, Work Order No., Work Order Date, GST Type, Status are required.

### BR-VAL-03 Required bill fields
- Work, Bill Type, Bill Date, Gross components sufficient to compute Gross, Payment Status are required.

### BR-VAL-04 Cascading delete prevention
- Work delete MUST be prevented when child bills, expenses, documents, estimates, or schedule rows exist.

---

## 18. Calculation Worked Examples (Normative)

### Example A – GST Extra
- Portion = ₹10,00,000; GST % = 18; GST Extra  
- GST Amount = ₹1,80,000  
- Total = ₹11,80,000  
- No bills → Balance = ₹11,80,000; Progress = 0%

### Example B – GST Included
- Inclusive Total = ₹11,80,000; GST % = 18; GST Included  
- GST Amount = 1180000 × 18 / 118 = ₹1,80,000  
- Portion = ₹10,00,000  

### Example C – Bill impact
- Total Work Value = ₹11,80,000  
- Bill Gross = ₹5,00,000; Deductions = ₹45,000; Net = ₹4,55,000; Received = ₹0  
- Gross Bills Raised = ₹5,00,000  
- Balance = ₹6,80,000  
- Progress = 500000 / 1180000 × 100 = 42.37%  
- Outstanding uses Net − Received = ₹4,55,000  

### Example D – Profit/Loss estimate
- Gross Bills Raised = ₹8,00,000  
- Expenditure = ₹6,10,000  
- Estimated P/L = ₹1,90,000  

---

## 19. Rule Conflicts and Resolutions

| Conflict | Resolution |
|----------|------------|
| Discovery desktop offline sync rules vs web amendment | Sync/offline rules not applicable in Version 1.0 |
| Discovery daily backup vs PO weekly/cost-saving | **Weekly** backup; 30-day retention |
| Discovery recycle bin vs PO decision | Permanent delete with warning |
| Role sets in discovery | Five roles as finalized by PO |
| Balance basis ambiguity | **Gross Bills Raised** confirmed by PO |

---

## 20. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Senior Business Analyst | ☐ Rules complete and consistent | |
| Principal Software Architect (product-level) | ☐ Calculable & enforceable | |

---

## 21. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-06 |
| Title | Business Rules |
| Next Document | `07-domain-model.md` |

---

**End of Document 06 – Business Rules**
