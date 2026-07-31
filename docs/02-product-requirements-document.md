# CWMS – Construction Work Management System  
## 02 – Product Requirements Document (PRD)

**Document Type:** Product Design Package – Product Requirements Document  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** `dialog.md` + `00-executive-summary.md` + `01-product-vision.md`  
**Depends On:** Documents 00 and 01  
**Audience:** Product, Engineering, UX, BA, QA, Architecture  

---

## 0. How to Read This PRD

### 0.1 Purpose

This PRD expands every Version 1.0 module into implementation-ready product requirements. It stays at product level: no programming languages, frameworks, or API designs.

### 0.2 Global Permission Rule (Version 1.0 Interim)

| Role | Access |
|------|--------|
| Administrator | Full access to all modules, plus Administrator-only restore and Masters maintenance |
| Data Entry Operator | Full access to all operational modules |
| Engineer | Full access to all operational modules |
| Accounts | Full access to all operational modules |
| Viewer | **View only** — no create/edit/delete/restore/masters changes |

Where a section says “Full-access roles,” it means Administrator, Data Entry Operator, Engineer, and Accounts.

### 0.3 Global Platform Assumptions (Binding)

- Online-only public-cloud web application
- Any place, any browser
- ~50 concurrent users initial target
- ~200 works/year expected volume
- Currency presentation: ₹ (Indian Rupees) per discovery examples
- Financial Year: April–March
- No Synchronization module
- No vague Settings module
- No Excel data import (export only)
- No document recycle bin
- Report branding uses system defaults

### 0.4 Cross-Cutting Requirement IDs

| Prefix | Area |
|--------|------|
| PRD-AUTH | Login & User Management |
| PRD-DASH | Dashboard |
| PRD-WORK | Work Register |
| PRD-EST | Estimates |
| PRD-SCH | Schedule |
| PRD-DOC | Documents |
| PRD-BILL | Billing |
| PRD-EXP | Expenditure |
| PRD-RPT | Reports |
| PRD-SRCH | Search & Filters |
| PRD-BAK | Backup & Restore |
| PRD-ADM | Administration & Masters |
| PRD-AUD | Audit (cross-cutting) |
| PRD-NAV | Navigation / shell |

---

## 1. Cross-Cutting Product Requirements

### 1.1 Application Shell and Navigation

**Purpose:** Provide a consistent web application frame for all modules.

**Goals:**
- Predictable navigation to every Version 1.0 module
- Always-visible identity of signed-in user and key status
- Reinforce work-centric access patterns

**Features:**
- Header with product name (CWMS), signed-in user, role, logout
- Primary navigation to: Dashboard, Work Register, Billing, Expenditure, Documents, Reports, Masters (Admin), Backup/Restore (as permitted), Administration/Users (as permitted)
- Content area for lists, forms, and summaries
- Status area showing online/cloud readiness cues appropriate to a web app (no offline sync status)
- Quick access from Dashboard shortcuts

**Business rules:**
- Viewer navigation shows the same modules but actions that mutate data are hidden or disabled
- Masters maintenance is Administrator-only
- Restore is Administrator-only

**Permissions:** Per global rule.

**Acceptance criteria:**
- Every Full-access and Viewer user can reach modules allowed to them after login
- Navigation labels are consistent across the application

**Empty / loading / failure:**
- Loading: navigation remains visible; content shows loading state
- Failure: module load errors show recoverable message without blanking the whole shell

**Future considerations:** Finer role-based menu visibility in later versions.

### 1.2 Audit Requirements (Cross-Cutting)

**Purpose:** Record who changed what and when for accountability.

**Features / events to audit (minimum from discovery):**
- User login / logout
- Work created / updated / deleted
- Bill created / updated / deleted
- Expenditure created / updated / deleted / assigned
- Document uploaded / deleted
- Masters option list changes
- Restore operations
- Important financial field changes

**Audit fields (product-level):** User, date/time, module, action, details.

**Permissions:** Audit log viewable by Administrator in Version 1.0 (other roles view-only if exposed later; not required for Viewer mutation).

**Future considerations:** Richer audit search and export in later versions if needed.

### 1.3 Concurrent Edit Locking (Cross-Cutting for Works)

**Business rule:** When a user is editing a work (and by extension work-linked edit contexts as specified later), other users attempting to edit the same work receive a lock message indicating edit is in progress by another user.

**Acceptance criteria:**
- Second editor cannot overwrite silently
- Clear message is shown
- Lock releases when first editor saves/cancels/session ends as defined in Functional Specification

### 1.4 Currency, Dates, and Financial Year

- Amounts displayed with ₹ formatting in UI/reports per discovery examples
- Date fields use consistent office-readable format (exact format in Screen Spec)
- Financial Year filters use **April–March**

---

## 2. Module – Login & User Management (PRD-AUTH)

### 2.1 Purpose

Authenticate users, enforce password policy, support Remember Me, and provide seeded demo accounts for each role so the organization can train and operate CWMS securely.

### 2.2 Goals

- Prevent anonymous access
- Support five official roles
- Make first-run training possible via demo accounts
- Enforce strong passwords for non-demo policy compliance on password change/create

### 2.3 Features

1. Login screen with Username, Password, Remember Me, Login, Exit/Close equivalent for web (leave/cancel)
2. Change Password capability
3. Role association per user
4. User active/inactive status (from discovery user fields)
5. Seeded demo users on first run:
   - Administrator / Password@123
   - Data Entry Operator / Password@123
   - Engineer / Password@123
   - Accounts / Password@123
   - Viewer / Password@123
6. Session handling with inactivity timeout (discovery requirement; exact duration in later spec if not fixed by PO — record as required behaviour with configurable-or-default timeout; Settings module excluded so default system timeout applies)
7. Login history / audit of login events

### 2.4 Business Rules

- Access requires successful authentication
- Passwords stored using secure one-way protection (product requirement)
- Password rules for user-set passwords:
  - Minimum 8 characters
  - Mix of uppercase and lowercase
  - Numbers and symbols required
  - Avoid personal details
- Demo accounts exist for training; organizations should change demo passwords in production use (operational guidance)
- Viewer cannot mutate data after login
- Remember Me keeps browser session per agreed web session behaviour in Functional Spec

### 2.5 Validation

- Username required
- Password required
- Invalid credentials → generic failure message (no user enumeration detail beyond normal login failure)
- Change Password must satisfy password rules
- Inactive users cannot log in

### 2.6 Dependencies

- User records available (seeded demos at minimum)
- Audit logging for login events

### 2.7 Permissions

- Any user may log in with valid credentials
- Administrator manages users (create/edit/activate as Administration scope)
- Viewer and others change own password if feature exposed to them

### 2.8 Acceptance Criteria

- Valid demo accounts can sign in to the correct role experience
- Invalid password is rejected
- Password change rejects passwords that break rules
- Remember Me functions as specified
- Viewer session cannot create/edit/delete records

### 2.9 Edge Cases

- Caps Lock / whitespace in username
- Multiple failed attempts (rate-limit behaviour may be defined in later security hardening; not explicitly frozen — note as future/security enhancement unless specified)
- User deleted/deactivated while session active → subsequent actions denied

### 2.10 Empty States

- Not applicable on login form beyond empty fields with validation

### 2.11 Failure Scenarios

- Cloud/auth service unavailable → clear “cannot sign in” message
- Network loss during login → retry guidance

### 2.12 Loading States

- Login button shows progress and prevents double-submit

### 2.13 Search / Filter / Sort / Bulk

- User Administration list (Admin): search by name/username/role; sort by name/role/status; no bulk delete required in Version 1.0 unless specified later

### 2.14 Reports / Printing / Export

- None required specifically for login
- User list export not required in Version 1.0 unless added later

### 2.15 Audit Requirements

- Login success/failure (failure at product discretion for security logging)
- Logout
- Password change
- User create/edit/status change by Administrator

### 2.16 Future Considerations

- Finer permission matrix per module
- SSO / enterprise identity (not in Version 1.0)
- Forced demo password rotation policy UI

---

## 3. Module – Dashboard (PRD-DASH)

### 3.1 Purpose

Provide immediate portfolio visibility and shortcuts after login, including KPIs, traffic lights, and simple alerts.

### 3.2 Goals

- Answer “how are we doing?” without opening reports first
- Drive attention to problem works
- Accelerate common actions for Full-access roles

### 3.3 Features

**KPI cards (from discovery, adapted to web):**
- Total Projects (light project names distinct count as available)
- Total Works
- Active / In Progress Works (map to statuses In Progress; Planned may be shown separately if useful — statuses are Planned/In Progress/Hold/Completed)
- Completed Works
- Works on Hold (also an alert)
- Total Work Portion Value
- Total GST
- Total Work Value
- Total Bills Raised (Gross)
- Payments Received
- Outstanding Amount
- Total Expenditure
- Profit/Loss summary at portfolio level as discovery dashboard intent

**Traffic lights:**
- Green – progressing normally
- Yellow – attention required (e.g., pending bill, delayed schedule)
- Red – critical (e.g., overdue, financial issue, work stopped/hold critical)

**Simple alerts (confirmed):**
1. Pending bills
2. Overdue / delayed schedule
3. Outstanding payments
4. Missing key documents
5. Works on Hold

**Quick actions (Full-access):**
- New Work
- Billing
- Expenditure
- Documents
- Reports
- Backup (navigate to backup history / admin backup area)

**Recent works / recent activities** list

### 3.4 Business Rules

- KPI totals aggregate across accessible data (all users see portfolio aggregates in Version 1.0 interim model)
- Financial Progress and Balance metrics elsewhere use Gross Bills Raised; dashboard “Bills Raised” means gross bills
- Alert counts link to filtered lists/reports where practicable
- Traffic light rules detailed in Business Rules document; dashboard must display the resulting indicator

### 3.5 Validation

- Not a data-entry module; validates only navigation targets exist

### 3.6 Dependencies

- Work, Billing, Expenditure, Document, Schedule data
- Alert rule engine definitions

### 3.7 Permissions

- View: all roles
- Quick actions that create data: Full-access only

### 3.8 Acceptance Criteria

- After login, dashboard loads with KPI values
- Each confirmed alert type is visible when qualifying records exist
- Traffic lights visible for works in recent list and/or summary widgets
- Viewer cannot execute mutating quick actions

### 3.9 Edge Cases

- Zero works → KPIs show zero; empty recent list; alerts empty
- Mixed FY data → default dashboard scope clarified in Functional Spec (current FY vs all-time); **Assumption A-DASH-01:** dashboard defaults to all active portfolio totals unless filter applied

### 3.10 Empty States

- “No works yet” with New Work action for Full-access roles
- “No alerts” positive empty state

### 3.11 Failure Scenarios

- Partial widget failure shows per-widget error without blocking entire dashboard

### 3.12 Loading States

- Skeleton/placeholders for KPI cards and lists

### 3.13 Search / Filter / Sort / Bulk

- Optional dashboard filter by FY/project in Version 1.0 if inexpensive; not frozen as mandatory beyond alert drill-down
- No bulk operations on dashboard

### 3.14 Reports / Printing / Export

- Navigate to Dashboard Summary Report
- Print dashboard not mandatory; report covers management print need

### 3.15 Audit Requirements

- No audit for mere viewing; audit when quick actions create records (in target modules)

### 3.16 Future Considerations

- Full Notification Centre
- Email/SMS alerts
- Customizable KPI layout

---

## 4. Module – Work Register (PRD-WORK)

### 4.1 Purpose

Create and maintain the master work record that every other module links to—the heart of CWMS and the digital work file.

### 4.2 Goals

- One work → one record → everything linked
- Auto identity via Work Code
- Correct GST Extra / GST Included financials
- Light project association
- Clear status and progress

### 4.3 Features

**List**
- Columns: Work Code, Work Order No., Work Name, Client, Status, Balance Work Value (minimum from discovery; may include Project, Contractor, Traffic Light)
- Actions: New Work, Edit, Delete, View, Search, Export
- Pagination (e.g., Showing 1–20 of N)

**Create/Edit form tabs (discovery):**
1. **General Information** — Work Code (auto), Project (free text + dropdown of existing names), Work Name, Work Category (from Masters), Client (free text), Contractor (free text), Work Order No., Work Order Date, Work Status (Planned/In Progress/Hold/Completed), Client/Department Format (from Masters, if applicable on work)
2. **Financial Details** — GST Type (Extra/Included), Work Portion Value, GST % (free number), GST Amount (auto), Total Work Value (auto), Balance Work Value (auto)
3. **Location Details** — State, District, Taluka, Village, Existing Chainage, Design Chainage, LHS/RHS/Both, Structure Type
4. **Schedule (work-level)** — Start Date, Scheduled Completion, Actual Completion, Physical Progress %, Financial Progress % (auto from Gross Bills)
5. **Documents** — quick upload entry points into Document module patterns
6. **Summary** — review-before-save; Save, Save & New, Cancel, Print Work Summary

**Work Summary surface (discovery philosophy):**
- Header identity fields
- Financial summary card (Work Portion, GST, Total, Bills Raised Gross, Payments, Outstanding, Expenditure, Balance, Profit/Loss)
- Navigation into Estimate, Schedule, Documents, Billing, Expenditure, Reports

**Auto numbering:** Work Code format `CWMS-YYYY-####` (year-based sequence)

### 4.4 Business Rules

1. Work Code auto-generated; user cannot invent duplicates
2. Work Order Number must be unique
3. GST Extra: portion entered → GST calculated → Total = Portion + GST
4. GST Included: Total entered → reverse GST → Portion = Total − GST
5. Balance Work Value = Total Work Value − Gross Bills Raised
6. Financial Progress % = (Gross Bills Raised ÷ Total Work Value) × 100 (0 if Total Work Value = 0)
7. Status limited to Planned / In Progress / Hold / Completed
8. Project is light: typed name and/or selected from existing distinct project names
9. Client and Contractor are free text
10. Delete work rules: must block or warn when child bills/expenses/documents exist — **Assumption A-WORK-01:** deletion of a work with children is prevented unless Administrator confirms cascade policy; default Version 1.0 = prevent delete when children exist
11. Edit lock applies

### 4.5 Validation

- Work Name required
- Work Order No. required and unique
- Work Order Date valid
- Financial values numeric and ≥ 0
- GST % numeric ≥ 0 (free number; upper bound practical validation may apply)
- Actual Completion not before Start Date
- Scheduled Completion not before Start Date when both present
- Status required

### 4.6 Dependencies

- Masters: Work Categories (and Client/Department Formats if used on work)
- Billing for balance/progress
- Documents, Estimates, Schedule, Expenditure child modules

### 4.7 Permissions

- Full-access: create/edit/delete (subject to delete rules)
- Viewer: view/search/export-as-allowed read-only outputs

### 4.8 Acceptance Criteria

- Creating a work generates Work Code and appears in list
- GST Extra and GST Included examples calculate correctly
- Balance and Financial Progress update when gross bills change
- Duplicate Work Order No. rejected
- Viewer cannot edit
- Second user hits edit lock message

### 4.9 Edge Cases

- Total Work Value zero
- Gross bills exceeding Total Work Value → Balance negative possible; system must show value and alert rather than hide — **display allowed; warning recommended**
- Hold status still visible in alerts
- Very long work names / chainage strings

### 4.10 Empty States

- List: “No works yet” + New Work
- Summary tabs with no children: guided empty messages

### 4.11 Failure Scenarios

- Save failure preserves user input where possible and shows error
- Partial network failure on save → no silent partial work creation (transactional integrity product requirement from discovery)

### 4.12 Loading States

- List pagination loading
- Save in progress disables Save buttons

### 4.13 Search Behaviour

Search by Work Order, Work Name, Client, Contractor, Chainage, Project, Date, Status, Work Code

### 4.14 Filtering

Filter by Status, Project, Client, Contractor, Date range, FY, Category

### 4.15 Sorting

Sort by Work Code, Work Order Date, Work Name, Balance, Status

### 4.16 Bulk Operations

- Not required for Version 1.0 work delete/edit bulk
- Bulk export of filtered list via Export is sufficient

### 4.17 Reports / Printing / Export

- Work Register Report
- Work-wise Summary
- Print Work Summary from form
- List Export

### 4.18 Audit Requirements

- Create/update/delete work
- Status changes
- Financial field changes

### 4.19 Future Considerations

- Full Projects module
- Work Diary
- QR code
- Finer permissions (Engineer vs Accounts field-level)

---

## 5. Module – Estimate Management (PRD-EST)

### 5.1 Purpose

Maintain estimate records linked to each work as part of the digital work file.

### 5.2 Goals

- Capture estimate identity and amounts
- Support revised estimates over time (multiple estimates per work via documents/records as discovery allows multiple estimate documents)
- Link to estimate documents

### 5.3 Features

- Estimate list per work
- Fields from discovery: Estimate No., Estimate Date, Estimated Amount, Revised Estimate (if any), Approved By, Document link/upload
- Add / Edit / View / Delete estimate records
- Open related estimate documents

### 5.4 Business Rules

- Every estimate belongs to one Work
- Multiple estimates per work allowed (aligned with multiple estimate documents)
- Deleting estimate does not delete work

### 5.5 Validation

- Estimate No. recommended/required
- Estimate Date valid
- Amount numeric ≥ 0

### 5.6 Dependencies

- Work Register parent
- Document module for estimate files

### 5.7 Permissions

- Full-access mutate; Viewer read-only

### 5.8 Acceptance Criteria

- User can add estimate to a work and see it in work context
- Estimate document can be opened from estimate/document areas

### 5.9 Edge Cases

- Revised estimate supersedes prior amount for display — show history, do not invent automatic “current estimate” unless specified; **Assumption A-EST-01:** latest estimate by date is treated as current for summary display

### 5.10 Empty States

- “No estimates for this work” + Add Estimate

### 5.11 Failure Scenarios

- Save failures show error; no orphan estimate without work

### 5.12 Loading States

- Standard list/form loading

### 5.13 Search / Filter / Sort / Bulk

- Search by Estimate No. within work or global register if provided
- Sort by date
- No bulk required

### 5.14 Reports / Printing / Export

- Included in Work-wise Summary
- Estimate details printable as part of work summary

### 5.15 Audit Requirements

- Estimate create/update/delete

### 5.16 Future Considerations

- Estimate approval workflow
- Link to BOQ versioning

---

## 6. Module – Schedule Management (PRD-SCH)

### 6.1 Purpose

Track planned and actual schedule activities and progress for each work.

### 6.2 Goals

- Maintain activity-level schedule lines
- Reflect delays for dashboard alerts and traffic lights
- Support physical progress tracking

### 6.3 Features

- Schedule list per work: Activity, Start Date, Finish Date, Actual Start, Actual Finish, Progress
- Work-level dates also on Work form: Start, Scheduled Completion, Actual Completion, Physical Progress %, Financial Progress %
- Add / Edit / Delete schedule activities

### 6.4 Business Rules

- Schedule rows belong to one Work
- Overdue/delayed schedule alert when planned finish/scheduled completion is past and work not Completed (exact rule in Business Rules doc)
- Financial Progress is not manually arbitrary if auto-calculated from Gross Bills; manual override **not** in Version 1.0 unless explicitly added — **Rule:** Financial Progress is system-calculated
- Physical Progress is user-entered % (0–100)

### 6.5 Validation

- Activity name required
- Dates valid; actual finish not before actual start
- Progress % between 0 and 100

### 6.6 Dependencies

- Work Register
- Dashboard alerts

### 6.7 Permissions

- Full-access mutate; Viewer read-only

### 6.8 Acceptance Criteria

- Activities can be maintained per work
- Delayed works appear in Overdue/delayed schedule alert when rules met
- Financial Progress matches Gross Bills formula

### 6.9 Edge Cases

- Activities without finish dates
- Hold status with schedule in past

### 6.10 Empty States

- “No schedule activities” + Add Activity

### 6.11 Failure Scenarios

- Standard save failures

### 6.12 Loading States

- Standard

### 6.13 Search / Filter / Sort / Bulk

- Filter activities by date; sort by start date
- No bulk

### 6.14 Reports / Printing / Export

- Work-wise Summary includes schedule
- No dedicated Gantt in Version 1.0 (deferred)

### 6.15 Audit Requirements

- Schedule create/update/delete
- Physical progress changes

### 6.16 Future Considerations

- Gantt chart
- Critical path / delay analysis automation beyond simple alerts

---

## 7. Module – Document Management (PRD-DOC)

### 7.1 Purpose

Store, organize, and retrieve all work documents as controlled copies in CWMS-managed cloud storage.

### 7.2 Goals

- Unlimited documents per type per work
- Multi-upload
- Reliable retrieval independent of user local folders
- Support missing-document visibility

### 7.3 Features

- Document types from Masters (seed examples: Work Order, Agreement, Estimate, BOQ, Drawing, Approval, Letter Inward/Outward, Invoice, Bill Copy, Payment Receipt, Site Photo, Other — discovery list, Admin-maintainable)
- Fields: Document ID/Code, Work, Category/Type, Document Number (optional but recommended), Title, File Name, File Type, Upload Date, Uploaded By, Remarks
- Upload single / multiple
- Open, Download, Print, Delete
- Document register across works
- Missing Document Report support
- Logical organization by year/work/type in storage layout (product behaviour)

### 7.4 Business Rules

1. Every document belongs to one Work
2. Files are **copied** into CWMS storage (not links to user PC paths)
3. Allowed types: **PDF and images only**
4. Max size **20 MB per file**
5. Delete is **permanent** after warning; **no recycle bin**
6. Unlimited count per type
7. Missing key documents alert uses a defined “key” set — **Assumption A-DOC-01:** key types default to Work Order and Estimate unless Admin configures key flags later; if no key-flag feature in Version 1.0, alert uses Work Order missing as minimum key check, plus Estimate missing where expected

### 7.5 Validation

- Work required
- Document type required
- File required on upload
- Reject disallowed extensions/MIME
- Reject > 20 MB
- Title optional but recommended

### 7.6 Dependencies

- Work Register
- Masters Document Types
- Cloud file storage

### 7.7 Permissions

- Full-access upload/delete
- Viewer open/download/print as read-only

### 7.8 Acceptance Criteria

- Multi-upload stores each file as its own record
- Opening document serves CWMS-stored copy
- Delete warns and removes permanently
- Non-PDF/non-image rejected
- >20 MB rejected

### 7.9 Edge Cases

- Duplicate file names → system accepts with unique stored object keys; display original file name
- Upload interrupted → no partial committed document record
- Deleted work blocked if documents exist (per work delete rule)

### 7.10 Empty States

- “No documents for this work” + Upload

### 7.11 Failure Scenarios

- Storage unavailable → clear error; no fake success
- Virus/content scan if later added — not in Version 1.0 scope

### 7.12 Loading States

- Per-file upload progress for multi-upload

### 7.13 Search Behaviour

- By Work Code/Name, Document Type, File Name, Document Number, Date

### 7.14 Filtering / Sorting

- Filter by type, date range, work, project
- Sort by upload date, type, title

### 7.15 Bulk Operations

- Bulk upload (multi-select) required
- Bulk delete not required in Version 1.0

### 7.16 Reports / Printing / Export

- Document Register
- Missing Document Report
- Print/open individual files

### 7.17 Audit Requirements

- Upload, delete, (download optional audit)

### 7.18 Future Considerations

- Recycle bin
- Office/AutoCAD types
- Versioning of documents
- Custom branding irrelevant here

---

## 8. Module – Billing Management (PRD-BILL)

### 8.1 Purpose

Manage RA Bills and Final Bills, deductions, net payable, payments, and the effect on work balance and financial progress.

### 8.2 Goals

- Support department/client deduction reality with flexible other deductions
- Keep Version 1.0 billing as **single total amount** (no BOQ item lines)
- Maintain auditability via System Bill Number

### 8.3 Features

**Billing list/dashboard columns:** Work Code, Work Name, RA Bill No., Bill Date, Bill Status, Net Bill Amount, Payment Status

**New Bill sections (discovery):**
- A: Work details auto-filled (values, balance)
- B: Bill Type (RA/Final), RA Bill No. (user, when available), Bill Date, Period From/To
- C: Previous Bill Amount, Current Work Portion Amount, GST Amount, Gross Bill Amount (auto)
- D: Standard deductions + multiple custom other deductions (Add More)
- E: Net Bill Amount (auto)
- F: Payment Status (Pending / Partially Received / Fully Received), Payment Date, Amount Received, UTR/Cheque No., Bank, Remarks

**System Bill Number:** always assigned in background for audit (`BILL-YYYY-####` style from discovery auto-numbering intent)

**Bill history per work**

### 8.4 Business Rules

1. Bill belongs to one Work
2. Gross Bill Amount computed from bill amount components as specified in Business Rules doc
3. Total Deductions = standard + all other deduction lines
4. Net Bill = Gross − Total Deductions
5. Saving a bill recalculates work Gross Bills Raised, Balance Work Value, Financial Progress
6. Payment Status semantics:
   - Pending: nothing received
   - Partially Received: amount received > 0 and < net
   - Fully Received: amount received ≥ net
7. Outstanding at bill level = Net − Amount Received (floor at 0 for display unless overpayment handled — **Assumption A-BILL-01:** overpayment allowed to display negative outstanding/credit style; show actual arithmetic)
8. Client/Department Format may influence which deduction heads are emphasized; Version 1.0 still uses shared deduction entry UI with Masters heads + flexible others
9. No item-wise quantity billing

### 8.5 Validation

- Work required
- Bill Type required
- Bill Date required
- Amounts numeric ≥ 0 for money fields (except adjustments if any — none frozen)
- Period From ≤ Period To
- Deduction amounts ≥ 0
- RA Bill No. unique per work recommended; **Assumption A-BILL-02:** RA Bill No. unique within the same work when provided

### 8.6 Dependencies

- Work Register financial fields
- Masters Deduction Heads / Client-Department Formats
- Payments records
- Dashboard pending/outstanding alerts

### 8.7 Permissions

- Full-access mutate; Viewer read-only

### 8.8 Acceptance Criteria

- RA bill with multiple other deductions calculates Net correctly
- Work balance drops based on Gross Bills Raised, not Net
- System Bill Number always present even if RA Bill No. blank
- Payment partial status works
- Pending bills alert includes unpaid/pending statuses as defined

### 8.9 Edge Cases

- Final Bill while balance remains
- Bill without RA number (system number only)
- Gross bills > Total Work Value
- Zero deduction bills

### 8.10 Empty States

- “No bills for this work” + New Bill

### 8.11 Failure Scenarios

- Save failure does not update work totals
- Concurrent edit of work while billing → respect lock rules

### 8.12 Loading States

- Recalculation feedback on amount fields

### 8.13 Search / Filter / Sort / Bulk

- Search by RA Bill No., System Bill No., Work, Client
- Filter by Bill Status, Payment Status, Date, Client, Work, FY
- Sort by Bill Date, Net, Outstanding
- No bulk posting required

### 8.14 Reports / Printing / Export

- Billing Report
- Pending Payment Report
- Work-wise Summary bill section
- Print bill summary
- Excel/PDF export via Reports

### 8.15 Audit Requirements

- Bill create/update/delete
- Payment updates
- Deduction changes

### 8.16 Future Considerations

- BOQ/MB quantity billing
- Abstract generation
- Deeper client format engines

---

## 9. Module – Expenditure Management (PRD-EXP)

### 9.1 Purpose

Track work-specific and general expenses, support later assignment of general expenses to a single work, and contribute to estimated profit/loss.

### 9.2 Goals

- Do not force immediate work allocation for every cost
- Keep Version 1.0 assignment as 100% to one work (no multi-work split)
- Capture GST and payment mode details

### 9.3 Features

**List columns:** Date, Work Code (if any), Expense Head, Vendor, Amount, Payment Mode, Voucher No.

**Expense Type choice:** Work-Specific / General

**Sections:**
- Work details (if work-specific)
- Expense details: Date, Expense Head (Masters), Vendor (free text), Description, Invoice/Bill No., Invoice Date
- Financial: Expense Value (excl. GST), GST %, GST Amount, Total
- Payment: Mode (Cash/Bank Transfer/Cheque/UPI), Reference No., Payment Date
- Attachments: Invoice copy, Payment receipt, other (PDF/images, 20 MB rule)
- Status: Draft / Paid / Assigned to Work / Cancelled (discovery)

**Assign General Expense to Work:** assign 100% to one work

### 9.4 Business Rules

1. Work-specific expenses require Work
2. General expenses allow null Work until assignment
3. Assignment in Version 1.0 is whole-expense to one work only
4. Work Total Expenditure includes work-specific + assigned general expenses
5. Estimated Profit/Loss at work level uses discovery intent: relate work value/bills/expenditure — **Assumption A-EXP-01:** Estimated Profit/Loss = Gross Bills Raised − Total Expenditure for the work (display label “Estimated”); alternative definitions deferred unless PO amends
6. Cancelled expenses excluded from totals

### 9.5 Validation

- Expense Date required
- Expense Head required
- Amounts ≥ 0
- Work required when type = Work-Specific
- Attachment type/size rules same as documents

### 9.6 Dependencies

- Work Register
- Masters Expense Categories
- Document/attachment storage
- Financial summary widgets

### 9.7 Permissions

- Full-access mutate; Viewer read-only

### 9.8 Acceptance Criteria

- General expense can be saved without work
- Assignment links it to one work and updates totals
- Work-specific expense appears in work expenditure
- Viewer cannot edit

### 9.9 Edge Cases

- Reassignment of already assigned general expense — **Assumption A-EXP-02:** allowed by Full-access with audit; previous work totals recalculate
- Cancelled after assignment removes from totals

### 9.10 Empty States

- “No expenses” + New Expense

### 9.11 Failure Scenarios

- Assignment failure leaves expense unassigned and shows error

### 9.12 Loading States

- Standard

### 9.13 Search / Filter / Sort / Bulk

- Filter by Work / General, Vendor, Date, Expense Head, Payment Mode
- Sort by date/amount
- No bulk assignment required

### 9.14 Reports / Printing / Export

- Expenditure Report
- General Expense Report
- Work-wise Summary
- Payment Mode perspectives via filters

### 9.15 Audit Requirements

- Create/update/delete/assign/cancel

### 9.16 Future Considerations

- Split across multiple works by percentage
- Vendor master register

---

## 10. Module – Reports (PRD-RPT)

### 10.1 Purpose

Produce official, filterable, printable, and exportable reports for management and office records.

### 10.2 Goals

- Cover the frozen report catalogue
- Support Saved Report Filters
- Use default company branding in Version 1.0

### 10.3 Features

**Reports:**
1. Work Register Report
2. Billing Report
3. Expenditure Report
4. Financial Summary Report
5. Work-wise Summary Report
6. Pending Payment Report
7. Document Register
8. General Expense Report
9. Dashboard Summary Report

**Common capabilities:** Print, Print Preview, PDF Export, Excel Export, Search, Sort, Filter, Date Range, Financial Year (Apr–Mar), Saved Filters (Save, Rename, Set Default, Delete)

**Print header metadata:** default Company/Office Name, Report Name, Project Name (when applicable), Date & Time, Page Number, User Name, Filters Used, default logo

### 10.4 Business Rules

- Excel **export** in scope; Excel **import** out of scope
- FY boundaries April–March
- Financial figures use official CWMS terminology and Gross Bills basis where progress/balance shown
- Saved filters are per user in Version 1.0 — **Assumption A-RPT-01:** saved filters are user-specific

### 10.5 Validation

- Date range From ≤ To
- Invalid filter combinations show empty results, not crash

### 10.6 Dependencies

- All data modules
- Default branding assets

### 10.7 Permissions

- All roles can run view/print/export of reports in Version 1.0 interim model
- Viewer remains read-only (export/print of views allowed)

### 10.8 Acceptance Criteria

- Each listed report runs with filters
- PDF and Excel export succeed for sample data
- Saved filter restores settings
- Headers include required metadata with defaults

### 10.9 Edge Cases

- Empty result set still prints header and “No records”
- Very large Excel export — system should complete or show progressive wait; performance target aligned to ~200 works/year scale

### 10.10 Empty States

- No records message inside report body

### 10.11 Failure Scenarios

- Export failure shows retry message

### 10.12 Loading States

- Report generation progress indicator

### 10.13 Search / Filter / Sort / Bulk

- As per each report; standard filters: Project, Client, Contractor, Work Status, Work Code, Work Name, Date Range, FY
- Billing also: Bill Status, Payment Status
- Expenditure also: Vendor, Expense Type

### 10.14 Reports / Printing / Export

- This module is the reporting surface

### 10.15 Audit Requirements

- Optional audit of export/print not frozen; may log as enhancement
- Saved filter create/delete audited optionally

### 10.16 Future Considerations

- Custom logo/name upload
- More report types
- Scheduled emailed reports

---

## 11. Module – Search & Filters (PRD-SRCH)

### 11.1 Purpose

Provide powerful search and filtering across modules so users can find works and related records quickly.

### 11.2 Goals

- Support discovery search attributes
- Keep filters consistent with reports

### 11.3 Features

- Global search entry point (product shell) and module search boxes
- Attributes: Work Order, Client, Contractor, Chainage, Project, Date, Status, Work Code, Work Name, Document Number, RA Bill No., System Bill No., Vendor, Expense Head

### 11.4 Business Rules

- Search is case-insensitive for text — **Assumption A-SRCH-01**
- Partial match for names/numbers — **Assumption A-SRCH-02**

### 11.5 Validation

- Extremely long search strings truncated safely

### 11.6 Dependencies

- Indexed fields in underlying data store (implementation concern)

### 11.7 Permissions

- All roles can search within viewable data

### 11.8 Acceptance Criteria

- Known sample work found by Work Code and Work Order No.
- Chainage search returns matching works

### 11.9 Edge Cases

- No results → empty state
- Special characters in search

### 11.10 Empty / Loading / Failure

- Empty: “No matches”
- Loading: debounce/spinner
- Failure: retry message

### 11.11 Filtering / Sorting / Bulk

- Module filters as defined per module
- No bulk from global search required

### 11.12 Reports / Printing / Export

- Search results lists may export where module export exists

### 11.13 Audit

- Not required for searches

### 11.14 Future Considerations

- Faster advanced search
- Saved global searches beyond report filters

---

## 12. Module – Backup & Restore (PRD-BAK)

### 12.1 Purpose

Protect CWMS business data and stored documents via automatic backups and Administrator restore.

### 12.2 Goals

- Cost-conscious automatic protection
- Clear restore authority
- Visible backup history

### 12.3 Features

- Automatic **weekly** backups
- Retention **30 days**
- Backup history list: date, file/name/id, type, status
- Administrator restore from a selected backup
- Backup includes database/business data + documents in CWMS storage

### 12.4 Business Rules

1. Backups are system-automatic (not primarily Admin-triggered)
2. Restore is Administrator-only
3. Restore replaces recoverable system state to selected backup point (destructive warning required)
4. Backups older than 30 days are purged by system retention job
5. Backup success/failure recorded in history

### 12.5 Validation

- Restore requires explicit confirmation typing/acknowledgement — **Assumption A-BAK-01:** double confirmation required

### 12.6 Dependencies

- Cloud storage for backup artifacts
- All modules’ data consistency

### 12.7 Permissions

- History view: Administrator (minimum)
- Restore: Administrator only
- Other roles: no restore

### 12.8 Acceptance Criteria

- Weekly backup job creates history entries
- Backups older than 30 days not retained
- Admin can restore a known backup in test environment
- Non-Admin cannot restore

### 12.9 Edge Cases

- Backup fails mid-run → status Failed; previous backups remain
- Restore while users online — **Assumption A-BAK-02:** system warns and should block concurrent writes during restore window

### 12.10 Empty States

- “No backups yet” early after first deploy until first weekly run (plus optional immediate first backup on deploy — **Assumption A-BAK-03:** first backup runs on initial deployment)

### 12.11 Failure Scenarios

- Restore failure leaves system on pre-restore state if possible; show failure

### 12.12 Loading States

- Restore progress indicator; block UI mutations

### 12.13 Search / Filter / Sort / Bulk

- History sort by date; filter by status
- No bulk restore

### 12.14 Reports / Printing / Export

- Backup history printable optional; not mandatory

### 12.15 Audit Requirements

- Backup job results
- Restore operations with Admin identity

### 12.16 Future Considerations

- Manual backup button
- Longer retention tiers
- Point-in-time granular restore

---

## 13. Module – Administration & Masters (PRD-ADM)

### 13.1 Purpose

Provide Administrator capabilities for users and maintainable form option lists on a separate Masters page. No vague global Settings module in Version 1.0.

### 13.2 Goals

- Keep dropdown values aligned to office practice
- Administer users/demo readiness
- Avoid Settings sprawl

### 13.3 Features

**Masters page (separate) – Admin only:**
- Work Categories
- Document Types
- Deduction Heads
- Expense Categories
- Client/Department Formats  
Each with Add / Edit / Delete

**User Administration:**
- Create/edit users: Name, Login ID, Password (rules), Role, Mobile, Email, Active
- Ensure demo seeds exist on first run

**Not in Version 1.0 Settings:**
- No general settings catalogue
- No company logo upload (defaults only)

### 13.4 Business Rules

1. Deleting a master value that is in use — **Assumption A-ADM-01:** prevent deletion when referenced, or allow with reassignment requirement; default = prevent if in use
2. Masters changes affect future form selections immediately
3. Existing records retain previously saved text/values even if master renamed — **Assumption A-ADM-02:** stored values on records remain as saved; rename updates master label for future selections

### 13.5 Validation

- Master name required/unique within type
- User Login ID unique
- Password rules on create/change

### 13.6 Dependencies

- Forms across Work/Billing/Docs/Expenditure

### 13.7 Permissions

- Masters: Administrator only
- User admin: Administrator only
- Others: use master values on forms only

### 13.8 Acceptance Criteria

- Admin can add a Work Category and see it on Work form
- Non-Admin cannot open Masters mutate UI
- User role changes take effect next login/session refresh as specified

### 13.9 Edge Cases

- Empty master list → forms show empty dropdown + Admin guidance
- Concurrent Admin edits on same master row — last write with audit acceptable for Version 1.0

### 13.10 Empty States

- “No categories yet” + Add

### 13.11 Failure Scenarios

- Delete in-use value blocked with explanation

### 13.12 Loading States

- Standard

### 13.13 Search / Filter / Sort / Bulk

- Search masters by name
- No bulk import (Excel import deferred)

### 13.14 Reports / Printing / Export

- Not mandatory for masters

### 13.15 Audit Requirements

- All master add/edit/delete
- User admin changes

### 13.16 Future Considerations

- Settings module
- Logo/name upload
- Master key-document flags
- Excel import of masters

---

## 14. Non-Functional Product Requirements (Product Level)

| ID | Requirement |
|----|-------------|
| NFR-01 | Usable on any modern browser without a desktop installer |
| NFR-02 | Supports ~50 concurrent users initially |
| NFR-03 | Supports ~200 works/year and multi-year history growth |
| NFR-04 | Learnability target ~30 minutes for basic operations |
| NFR-05 | No data loss on normal save; transactional saves |
| NFR-06 | Weekly backup + 30-day retention |
| NFR-07 | Secure password storage and authenticated access |
| NFR-08 | Theme decided by UI/UX designer |
| NFR-09 | Public cloud hosting |
| NFR-10 | File storage via CWMS-managed object storage |

---

## 15. Explicitly Out of Scope for Version 1.0 (PRD Reminder)

- Offline mode / Synchronization
- Excel data import
- Company/logo upload
- Document recycle bin
- BOQ/MB quantity billing
- General expense multi-work split
- Full Projects module
- Full Notification Centre
- Native mobile app
- Gantt
- Vague Settings module
- Word/Excel/AutoCAD document uploads
- Finer module permission matrix beyond Viewer vs full access

---

## 16. Assumptions Register (PRD-Local)

| ID | Assumption |
|----|------------|
| A-DASH-01 | Dashboard defaults to portfolio totals without mandatory FY filter |
| A-WORK-01 | Work delete prevented when child records exist |
| A-EST-01 | Latest estimate by date is current for summary |
| A-DOC-01 | Missing key documents minimum = Work Order (and Estimate when expected) |
| A-BILL-01 | Overpayment displays via arithmetic outstanding |
| A-BILL-02 | RA Bill No. unique within a work when provided |
| A-EXP-01 | Estimated Profit/Loss = Gross Bills Raised − Expenditure |
| A-EXP-02 | General expense reassignment allowed with audit |
| A-RPT-01 | Saved report filters are per user |
| A-SRCH-01 | Case-insensitive search |
| A-SRCH-02 | Partial match search |
| A-BAK-01 | Restore requires double confirmation |
| A-BAK-02 | Restore blocks concurrent writes |
| A-BAK-03 | Initial backup on deployment |
| A-ADM-01 | In-use master values cannot be deleted |
| A-ADM-02 | Renaming masters does not rewrite historical record values |

---

## 17. Traceability Snapshot

| Discovery / PO Decision | PRD Module |
|-------------------------|------------|
| One Work digital file | PRD-WORK |
| GST Extra/Included | PRD-WORK / PRD-BILL |
| Gross Bills progress | PRD-WORK / PRD-BILL / PRD-DASH |
| Flexible deductions | PRD-BILL |
| General expenses + assign | PRD-EXP |
| PDF/images 20MB | PRD-DOC |
| Weekly backup 30 days | PRD-BAK |
| Masters separate page | PRD-ADM |
| Alerts + traffic lights | PRD-DASH |
| Demo accounts | PRD-AUTH |
| Saved report filters | PRD-RPT |

---

## 18. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Senior Business Analyst | ☐ Traceable & complete for Version 1.0 modules | |
| Principal Product Manager | ☐ Scope-aligned | |

---

## 19. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-02 |
| Title | Product Requirements Document |
| Next Document | `03-functional-specification.md` |

---

**End of Document 02 – Product Requirements Document**
