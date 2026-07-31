# CWMS – Construction Work Management System  
## 03 – Functional Specification

**Document Type:** Product Design Package – Functional Specification  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** `dialog.md` + Documents 00–02  
**Depends On:** `00-executive-summary.md`, `01-product-vision.md`, `02-product-requirements-document.md`  
**Audience:** Product, Engineering, UX, BA, QA  

---

## 0. Introduction

### 0.1 Purpose

This Functional Specification describes **every Version 1.0 feature** in terms of:

- Screens involved
- User actions
- Expected results
- Alternative flows
- Cancellation flows
- Recovery flows

It stays at product/behaviour level. Visual layout detail is in Document 04 (Screen Specification). Calculations and status rules are finalized in Document 06 (Business Rules).

### 0.2 Conventions

| Term | Meaning |
|------|---------|
| Full-access user | Administrator, Data Entry Operator, Engineer, or Accounts |
| Viewer | View-only role |
| System | Automated behaviour without user click |
| Happy path | Primary successful flow |
| Alt | Alternative successful or branched flow |
| Cancel | User abandons without saving |
| Recover | System/user recovers from failure or interruption |

### 0.3 Global Behaviours

#### G-01 Authentication gate
- Any protected URL/screen requires authenticated session.
- If session missing/expired → redirect to Login with return path retained when safe.

#### G-02 Viewer mutation block
- Viewer can open view/list/report/document-open flows.
- Create/Edit/Delete/Restore/Masters-mutate controls are hidden or disabled.
- Direct action attempts → denied with message: user does not have permission.

#### G-03 Unsaved changes
- On Cancel/Navigate away from dirty forms → confirm discard.
- Confirm Discard → leave without save.
- Stay → remain on form.

#### G-04 Network / cloud failure
- Mutating save failures show error and **do not** apply partial totals.
- User may retry.
- View failures show retry on the affected panel.

#### G-05 Edit lock (Work)
- First user to enter Edit Work obtains lock.
- Second user attempting Edit → message that edit is in progress by other user; edit denied until lock released.
- Lock released on Save success, Cancel, explicit close, or session end/timeout.

#### G-06 Delete warning (Documents and destructive actions)
- Destructive actions require confirmation.
- Document delete is permanent (no recycle bin).

---

## 1. Login & Authentication

### 1.1 Screen: Login

#### Feature F-AUTH-01 – Sign In (Happy Path)
1. User opens CWMS web URL.
2. System shows Login screen.
3. User enters Username and Password.
4. User clicks **Login**.
5. System validates credentials and active status.
6. System creates session and opens **Dashboard**.

**Expected result:** Authenticated user lands on Dashboard with role-appropriate actions.

#### Alt F-AUTH-01A – Remember Me
1. User checks **Remember Me** before Login.
2. On success, system persists browser remember-session per product session rules.
3. Later visit within validity opens app without re-entering credentials (or with shortened re-auth as implemented consistently).

#### Alt F-AUTH-01B – Demo account login
1. User enters demo username equal to role name and password `Password@123`.
2. System signs in with that role’s permissions.

#### Failure F-AUTH-01F – Invalid credentials
1. User submits wrong username/password.
2. System remains on Login.
3. System shows login failure message.
4. Password field cleared or selectable for retry; no Dashboard access.

#### Failure F-AUTH-01F2 – Inactive user
1. Credentials match but user inactive.
2. System denies login with inactive-account message.

#### Cancel F-AUTH-01C
1. User leaves Login page / closes browser.
2. No session created.

#### Recover F-AUTH-01R – Service unavailable
1. Authentication backend unreachable.
2. System shows cannot-sign-in / try-again message.
3. User retries when connectivity restored.

---

### 1.2 Feature F-AUTH-02 – Change Password

#### Happy Path
1. Signed-in user opens Change Password (from profile/admin user edit as available).
2. User enters current password (when changing own), new password, confirm password.
3. System validates password rules:
   - ≥ 8 characters
   - Upper and lower case
   - Number and symbol
   - Avoid personal details
4. User confirms.
5. System updates password hash; shows success.
6. User continues with session (or re-login if security policy requires — **Assumption FS-AUTH-01:** session continues after own password change).

#### Failure – Rule violation
- System rejects with specific unmet rule guidance.
- Password not changed.

#### Cancel
- User cancels → return previous screen; password unchanged.

---

### 1.3 Feature F-AUTH-03 – Logout

#### Happy Path
1. User selects Logout.
2. System ends session.
3. System shows Login screen.
4. Back-button access to protected pages fails auth gate (G-01).

---

### 1.4 Feature F-AUTH-04 – Session Timeout

#### Happy Path / System
1. User idle beyond timeout.
2. System expires session.
3. Next action → Login with message session expired.

#### Recover
- User signs in again and continues; unsaved form data may be lost (browser warn if dirty form was open).

---

### 1.5 Feature F-AUTH-05 – First-Run Demo Seeding (System)

#### Happy Path / System
1. On first initialization of CWMS, system ensures five demo users exist:
   - Administrator / Data Entry Operator / Engineer / Accounts / Viewer
   - Password `Password@123` each
2. Admin may later change passwords/users via User Administration.

---

## 2. Application Shell & Navigation

### 2.1 Feature F-NAV-01 – Primary Navigation

#### Happy Path
1. After login, shell shows header (CWMS, user, role) and nav items.
2. User clicks a module (Dashboard, Work Register, Billing, Expenditure, Documents, Reports, Masters, Backup, Users/Admin as permitted).
3. System opens module list/home in content area.

#### Alt – Viewer
- Mutating entries hidden/disabled; view routes work.

#### Failure
- Module load error → inline error + Retry; shell remains.

---

### 2.2 Feature F-NAV-02 – Work-Centric Navigation

#### Happy Path
1. From Work list or Dashboard recent item, user opens a Work.
2. System shows Work Summary with section navigation: Details, Estimate, Schedule, Documents, Billing, Expenditure, Reports.
3. User selects a section.
4. System shows that section in work context (same Work Code retained).

#### Cancel
- User returns to Work Register list via Back/breadcrumb; unsaved section forms prompt G-03.

---

## 3. Dashboard

### 3.1 Screen: Dashboard Home

#### Feature F-DASH-01 – View KPIs (Happy Path)
1. User lands on Dashboard or clicks Dashboard.
2. System loads KPI cards: totals for works by status, work values, gross bills raised, payments, outstanding, expenditure, profit/loss summary.
3. User sees numeric values for current portfolio.

#### Empty
- All zeros / “No works yet” guidance; Full-access sees **New Work** shortcut.

#### Loading
- Placeholder skeletons until values return.

#### Failure
- KPI widget error → “Unable to load” + Retry on widget.

---

### 3.2 Feature F-DASH-02 – Traffic Lights

#### Happy Path
1. System evaluates works against traffic-light rules (Document 06).
2. Dashboard recent works / attention widgets show Green / Yellow / Red indicators.
3. User clicks a work indicator row.
4. System opens that Work Summary.

#### Empty
- No works → no traffic light rows.

---

### 3.3 Feature F-DASH-03 – Simple Alerts

#### Happy Path
1. System computes counts for:
   - Pending bills
   - Overdue/delayed schedule
   - Outstanding payments
   - Missing key documents
   - Works on Hold
2. User sees alert list/cards with counts.
3. User clicks an alert.
4. System opens filtered list/report for that alert type.

#### Empty
- “No alerts” positive state.

#### Alt – Zero count alerts
- May show count 0 or hide; **Assumption FS-DASH-01:** show all five alert types with counts including zero.

---

### 3.4 Feature F-DASH-04 – Quick Actions

#### Happy Path (Full-access)
1. User clicks New Work / Billing / Expenditure / Documents / Reports / Backup.
2. System navigates to the corresponding create or module home screen.

#### Viewer
- Mutating shortcuts not available; Reports/Dashboard viewing available.

---

### 3.5 Feature F-DASH-05 – Recent Works / Activities

#### Happy Path
1. System lists recently updated works/activities.
2. User clicks an item → Work Summary or relevant record opens.

#### Empty
- “No recent activity”.

---

## 4. Work Register

### 4.1 Screen: Work Register List

#### Feature F-WORK-01 – View Work List
1. User opens Work Register.
2. System shows paginated table: Work Code, Work Order No., Work Name, Client, Status, Balance Work Value (+ traffic light if shown).
3. User may browse pages.

#### Empty
- “No works yet” + **New Work** (Full-access).

---

#### Feature F-WORK-02 – Search / Filter / Sort Works
1. User enters search text and/or filters (Status, Project, Client, Contractor, Date range, FY, Category).
2. User applies.
3. System refreshes list to matching works.
4. User sorts by column (Work Code, Date, Name, Balance, Status).

#### Empty result
- “No matches” with clear-filters action.

#### Cancel
- User clears filters → full list returns.

---

#### Feature F-WORK-03 – Export Work List
1. Full-access/Viewer (read export allowed) clicks Export.
2. System exports current filtered list (Excel/CSV equivalent via report/export path).
3. User downloads file.

#### Failure
- Export error → message; list remains.

---

### 4.2 Screen: New / Edit Work (Tabbed Form)

#### Feature F-WORK-04 – Create Work (Happy Path)
1. Full-access user clicks **New Work**.
2. System opens form; Work Code shown as auto (assigned on save if preview placeholder).
3. User completes Tab 1 General:
   - Project: type free text and/or select from dropdown of existing project names
   - Work Name, Category (masters), Client, Contractor, Work Order No., Work Order Date, Status
4. User completes Tab 2 Financial:
   - Selects GST Extra or GST Included
   - Enters required amount fields and GST %
   - System auto-calculates GST Amount, Total Work Value, Balance (initially = Total)
5. User completes Tab 3 Location fields as needed.
6. User completes Tab 4 Schedule/progress fields as needed (Financial Progress system-calculated).
7. User may add documents on Tab 5 (or later).
8. User reviews Tab 6 Summary.
9. User clicks **Save**.
10. System validates; saves work; assigns Work Code `CWMS-YYYY-####`; releases any lock; shows success; opens View/Summary or returns to list.

**Expected result:** Work exists and appears in register; Balance = Total Work Value; Financial Progress = 0%.

#### Alt F-WORK-04A – Save & New
1. User clicks **Save & New** on Summary.
2. System saves successfully then opens a blank New Work form.

#### Alt F-WORK-04B – GST Included path
1. User selects GST Included and enters inclusive total / applicable inputs per financial standard.
2. System reverse-calculates GST Amount and Work Portion Value.

#### Failure – Validation
- Missing Work Name / Work Order No., bad dates, duplicate Work Order No., invalid numbers → inline errors; no save.

#### Cancel
- User clicks **Cancel** → G-03 discard confirm → list; no record created.

#### Recover – Save failure
- Error message; form data retained; user retries.

---

#### Feature F-WORK-05 – Edit Work
1. Full-access user selects work → **Edit**.
2. System attempts lock.
3. If lock OK → form opens with data.
4. User changes fields → **Save**.
5. System validates, saves, recalculates dependent financial fields, unlocks, success.

#### Alt – Lock conflict
1. Another user holds lock.
2. System shows edit-in-progress-by-other-user message.
3. User remains in view mode or list.

#### Cancel
- Cancel → unlock + discard confirm if dirty.

---

#### Feature F-WORK-06 – View Work Summary
1. Any user opens View/Summary.
2. System shows identity header, financial card (Portion, GST, Total, Gross Bills, Payments, Outstanding, Expenditure, Balance, Profit/Loss), traffic light, section links.
3. User navigates sections without edit lock unless entering Edit.

---

#### Feature F-WORK-07 – Delete Work
1. Full-access user selects Delete.
2. If child records exist → system prevents delete with explanation (PRD assumption).
3. If no children → confirmation warning.
4. User confirms → work deleted; list refreshes.
5. User cancels confirm → no delete.

#### Viewer
- Delete not available.

---

#### Feature F-WORK-08 – Print Work Summary
1. From Summary, user clicks Print Work Summary.
2. System opens print preview with default branding and work financial/identity summary.
3. User prints or closes.

#### Cancel
- Close preview → return to Summary.

---

#### Feature F-WORK-09 – Auto Recalculation on Bill Changes (System)
1. When gross bills for a work change, system updates Balance Work Value and Financial Progress %.
2. Work list/summary show updated values without manual edit.

---

## 5. Estimate Module

### 5.1 Feature F-EST-01 – Add Estimate to Work

#### Happy Path
1. From Work → Estimate, Full-access clicks Add Estimate.
2. User enters Estimate No., Date, Amount, Revised Estimate (optional), Approved By, remarks.
3. User may upload/link estimate document (PDF/image).
4. User saves.
5. Estimate appears in work estimate list; latest-by-date treated as current for summary.

#### Cancel
- Discard confirm if dirty → back to list; no record.

#### Failure
- Validation errors; no save.

---

### 5.2 Feature F-EST-02 – Edit / Delete Estimate

#### Edit Happy Path
1. User opens estimate → Edit → change → Save.

#### Delete Happy Path
1. User Delete → confirm → removed from list.
2. Does not delete parent work.

#### Cancel / Recover
- Standard G-03 / save retry.

---

### 5.3 Feature F-EST-03 – View Estimate (Viewer)
1. Viewer opens estimate read-only.
2. Can open attached document if permitted view/open.

---

## 6. Schedule Module

### 6.1 Feature F-SCH-01 – Add Schedule Activity

#### Happy Path
1. Work → Schedule → Add Activity.
2. User enters Activity, Start, Finish, Actual Start/Finish (optional), Progress %.
3. Save → appears in list.
4. If activity/work schedule is overdue per rules and work not Completed → contributes to Overdue/delayed alert.

#### Validation Failure
- Missing activity name / invalid dates / progress outside 0–100 → no save.

#### Cancel
- Standard discard.

---

### 6.2 Feature F-SCH-02 – Update Work-Level Schedule Fields
1. User edits Work Tab 4 fields: Start, Scheduled Completion, Actual Completion, Physical Progress %.
2. Financial Progress % display is read-only system value.
3. Save Work → updates; may affect traffic lights/alerts.

---

### 6.3 Feature F-SCH-03 – Edit / Delete Activity
- Same pattern as estimates: edit/save; delete with confirm; cancel discard; viewer read-only.

---

## 7. Document Management

### 7.1 Screen: Work Documents / Documents Module

#### Feature F-DOC-01 – Upload Single Document

#### Happy Path
1. Full-access selects Work and Document Type (masters).
2. Enters Document Number (optional), Title, Remarks.
3. Chooses file (PDF or image ≤ 20 MB).
4. Clicks Upload.
5. System copies file into CWMS storage, creates document record, shows in list.

#### Failure – Type/size
- Reject with reason; no record.

#### Failure – Storage
- Error; no record; user retries.

#### Cancel
- User closes upload dialog without upload → no change.

---

#### Feature F-DOC-02 – Upload Multiple Documents

#### Happy Path
1. User chooses Add Multiple Documents / multi-file picker.
2. Selects many PDF/image files.
3. System uploads each, creating one record per file (type/title rules per dialog defaults — **Assumption FS-DOC-01:** shared selected Document Type applies to batch unless per-file type UI provided).
4. Progress shown per file.
5. Success summary: N uploaded, M failed with reasons.

#### Alt – Partial batch failure
- Successful files remain stored; failed files listed for retry.

#### Cancel mid-batch
- User cancel stops pending files; already completed uploads remain (with message).

---

#### Feature F-DOC-03 – Open / Download / Print Document

#### Happy Path
1. User selects document → Open/Download/Print.
2. System streams CWMS-stored copy (not user PC original path).
3. Browser opens/downloads/print dialog.

#### Failure
- Missing storage object → error; Admin investigates; record still listed until deleted.

---

#### Feature F-DOC-04 – Delete Document (Permanent)

#### Happy Path
1. Full-access clicks Delete.
2. System warns permanent delete, no recycle bin.
3. User confirms → file and record removed.
4. User cancels warning → no delete.

#### Viewer
- Delete unavailable.

---

#### Feature F-DOC-05 – Search Documents
1. User searches by Work, Type, File Name, Document Number, Date.
2. System filters list.

#### Empty
- No matches.

---

#### Feature F-DOC-06 – Missing Key Documents Alert Contribution (System)
1. System detects works missing key documents (Work Order / Estimate per assumptions).
2. Dashboard alert count updates.
3. User drills into Missing Document Report/list.

---

## 8. Billing Management

### 8.1 Screen: Billing List

#### Feature F-BILL-01 – View Bills
1. User opens Billing.
2. System lists bills with Work Code, Work Name, RA Bill No., Bill Date, Status, Net Amount, Payment Status.
3. Search/filter/sort applied as user sets.

#### Empty
- “No bills” + New Bill (Full-access).

---

### 8.2 Screen: New / Edit Bill

#### Feature F-BILL-02 – Create RA/Final Bill (Happy Path)
1. Full-access clicks New Bill.
2. User selects Work.
3. System auto-fills work financial identity and current Balance.
4. User sets Bill Type (RA/Final), RA Bill No. (if available), Bill Date, Period From/To.
5. User enters Previous Bill Amount, Current Work Portion Amount, GST Amount as required.
6. System calculates Gross Bill Amount.
7. User enters standard deductions and zero or more Other Deduction lines (Add More).
8. System calculates Total Deductions and Net Bill Amount.
9. User sets Payment Status and payment details if any.
10. User saves.
11. System assigns System Bill Number if new; saves deductions; recalculates work Gross Bills Raised, Balance, Financial Progress; success.

**Expected result:** Bill in history; work financials updated from **Gross**; Net/Payments separate.

#### Alt – No RA Bill No.
1. User leaves RA Bill No. blank.
2. System still assigns System Bill Number for audit.
3. Save succeeds if other validations pass.

#### Alt – Multiple other deductions
1. User adds Other Deduction 1..N with name+amount.
2. Totals include all lines.

#### Failure – Validation
- Incomplete required fields / period invalid / negative amounts → no save; work totals unchanged.

#### Cancel
- Discard confirm → no bill; totals unchanged.

#### Recover – Save failure
- Error; form retained; totals unchanged until success.

---

#### Feature F-BILL-03 – Edit Bill
1. Acquire related work edit rules as applicable; open bill.
2. Modify amounts/payment.
3. Save → recalculate work aggregates from all bills’ gross figures.

#### Cancel / Failure
- Standard; no partial aggregate update.

---

#### Feature F-BILL-04 – Delete Bill
1. Confirm destructive delete.
2. On confirm → delete bill & deductions; recalculate work aggregates.
3. Cancel confirm → no change.

---

#### Feature F-BILL-05 – Update Payment Status
1. User sets Pending / Partially Received / Fully Received and Amount Received.
2. System validates consistency (e.g., Fully Received implies amount ≥ net — auto-adjust or warn per Business Rules).
3. Save updates Outstanding alert inputs.

---

#### Feature F-BILL-06 – View Bill History for Work
1. From Work → Billing, user sees chronological bills.
2. Click row → view detail.

#### Viewer
- Read-only history.

---

## 9. Expenditure Management

### 9.1 Feature F-EXP-01 – Create Work-Specific Expense

#### Happy Path
1. New Expense → choose Work-Specific → select Work.
2. Enter date, expense head (masters), vendor free text, description, invoice fields.
3. Enter expense value, GST %, system GST amount & total.
4. Enter payment mode/reference/date.
5. Optionally attach PDF/image ≤ 20 MB.
6. Set status (Draft/Paid/etc.).
7. Save → appears under work expenditure; work totals update when status counts toward totals (Paid/Assigned rules in Document 06).

#### Cancel / Failure
- Standard discard / validation / retry.

---

### 9.2 Feature F-EXP-02 – Create General Expense

#### Happy Path
1. New Expense → General.
2. No work required.
3. Complete financial/payment fields → Save.
4. Appears in General Expenses; Work Code blank.

---

### 9.3 Feature F-EXP-03 – Assign General Expense to Work

#### Happy Path
1. User opens General Expense.
2. Chooses Assign to Work → selects one Work.
3. Confirms 100% assignment.
4. System sets Work link; status Assigned to Work; that work’s expenditure totals update; general report shows Assigned = Yes.

#### Alt – Reassign
1. User assigns to a different work.
2. System moves association; both works’ totals recalculate; audited.

#### Cancel
- Close assign dialog → unchanged.

#### Failure
- Assign error → remains general/previous assignment.

---

### 9.4 Feature F-EXP-04 – Cancel Expense
1. User sets status Cancelled (or Cancel action).
2. Confirm.
3. Expense excluded from totals going forward.

---

### 9.5 Feature F-EXP-05 – Edit / Delete Expense
- Edit/save recalculates.
- Delete with confirm removes record and recalculates.
- Viewer read-only.

---

### 9.6 Feature F-EXP-06 – Search/Filter Expenses
- Filter Work vs General, vendor, date, head, payment mode.
- Empty matches message.

---

## 10. Reports

### 10.1 Feature F-RPT-01 – Run Report (Common Pattern)

#### Happy Path
1. User opens Reports → selects report type.
2. User sets filters (Project, Client, Contractor, Status, Work, Dates, FY Apr–Mar, and report-specific filters).
3. User clicks Run/Apply.
4. System shows results grid with totals as applicable.
5. User may Sort/Search within results.

#### Empty
- Header shown + “No records”.

#### Failure
- Generation error → message + retry.

#### Loading
- Progress indicator.

---

### 10.2 Feature F-RPT-02 – Print / Print Preview
1. User clicks Print Preview → preview with default company name/logo, report name, filters, user, date/time, page numbers.
2. User prints or closes.
3. Cancel/close → back to results.

---

### 10.3 Feature F-RPT-03 – Export PDF
1. User clicks Export PDF.
2. System generates download with same header metadata rules.
3. Failure → error; retry.

---

### 10.4 Feature F-RPT-04 – Export Excel
1. User clicks Export Excel.
2. System downloads spreadsheet of current result set.
3. Note: import not available in Version 1.0.

---

### 10.5 Feature F-RPT-05 – Saved Filters

#### Save
1. User configures filters → Save Current Filter → names it.
2. Filter stored for user.

#### Reuse
1. User selects saved filter.
2. System applies all saved settings and runs/redisplays.

#### Rename / Set Default / Delete
1. User manages saved filter entries accordingly.
2. Default auto-applies when opening that report — **Assumption FS-RPT-01:** one default per report per user.

#### Cancel
- Close save dialog without save → no new filter.

---

### 10.6 Report-Specific Functional Notes

| Report | Special interactions |
|--------|----------------------|
| Work Register | Columns for portion/GST/total/balance/status |
| Billing | Filters for bill & payment status; outstanding columns |
| Expenditure | Work vs General filter |
| Financial Summary | Portfolio aggregates using official terms |
| Work-wise Summary | Select one work → one-page management summary |
| Pending Payment | Days pending column; drill to bill |
| Document Register | Type/number/title/date |
| General Expense | Assigned Yes/No |
| Dashboard Summary | Management snapshot totals |

---

## 11. Search (Global)

### 11.1 Feature F-SRCH-01 – Global Search

#### Happy Path
1. User enters text in global search.
2. System returns matching works (and optionally bills/docs per implementation grouping).
3. User clicks result → target record opens.

#### Empty
- No matches.

#### Cancel
- Clear search → return prior view.

#### Failure
- Search service error → retry.

---

## 12. Backup & Restore

### 12.1 Feature F-BAK-01 – Automatic Weekly Backup (System)

#### Happy Path / System
1. Weekly schedule triggers backup.
2. System backs up business data + documents.
3. History row: timestamp, identifier, type=automatic, status=Success.
4. Backups older than 30 days removed by retention job.

#### Failure / System
- Status=Failed in history; previous good backups retained.
- Alert/ops visibility for Admin via history.

#### Recover
- Next weekly run retries; Admin may contact ops if repeated failure.

---

### 12.2 Feature F-BAK-02 – View Backup History
1. Administrator opens Backup area.
2. Sees list sorted by date with status.
3. Non-Admin: no restore actions; history visibility Admin-minimum.

---

### 12.3 Feature F-BAK-03 – Restore Backup (Administrator)

#### Happy Path
1. Admin selects a Successful backup → Restore.
2. System shows strong warning (destructive, overwrite current data).
3. Admin completes double confirmation.
4. System blocks concurrent writes; restores data+documents to backup point; records audit; shows success.
5. Users see restored state after refresh/relogin as required.

#### Cancel
- Admin cancels confirmation → no restore.

#### Failure
- Restore fails → error; system remains on pre-restore state if possible; audit failure.

#### Recover
- Admin selects another backup or retries after issue resolved.

---

### 12.4 Feature F-BAK-04 – Initial Deployment Backup (System)
1. On first deploy/init, system runs an initial backup (PRD assumption).
2. History shows first entry before first weekly cycle if applicable.

---

## 13. Administration – Users

### 13.1 Feature F-USR-01 – Create User (Administrator)

#### Happy Path
1. Admin opens Users → New User.
2. Enters Name, Login ID, Password (rules), Role, Mobile, Email, Active.
3. Save → user can log in.

#### Failure
- Duplicate Login ID / weak password → no save.

#### Cancel
- Discard → no user.

---

### 13.2 Feature F-USR-02 – Edit / Deactivate User
1. Admin edits fields/role/active flag → Save.
2. Deactivated user cannot log in; active sessions denied on next request.

---

### 13.3 Feature F-USR-03 – Viewer Permission Enforcement (System)
1. Viewer authenticates.
2. Any mutate API/UI action denied (G-02).

---

## 14. Masters / Option Lists (Separate Page)

### 14.1 Feature F-MST-01 – Maintain Master List (Administrator)

#### Happy Path – Add
1. Admin opens Masters page → selects list type (Work Categories / Document Types / Deduction Heads / Expense Categories / Client-Department Formats).
2. Clicks Add → enters name → Save.
3. New value appears in forms’ dropdowns.

#### Happy Path – Edit
1. Admin edits name → Save.
2. Future selections show new label; historical records keep saved values (PRD assumption).

#### Happy Path – Delete
1. Admin deletes unused value → confirm → removed.
2. If in use → blocked with message.

#### Cancel
- Dialog cancel → no change.

#### Unauthorized
- Non-Admin cannot mutate; direct access denied.

---

### 14.2 Feature F-MST-02 – Use Master Value on Forms (All Full-access)
1. User opens Work/Bill/Doc/Expense form.
2. Dropdown shows current master values (+ free text fields where applicable: Client/Contractor/Vendor remain free text).
3. User selects value → saved on record.

---

## 15. Cross-Module Financial Flows

### 15.1 Feature F-FIN-01 – GST Extra Work Order Entry
1. User selects GST Extra.
2. Enters Work Portion Value and GST %.
3. System sets GST Amount = Portion × GST% / 100.
4. Total = Portion + GST.
5. Balance starts = Total.

---

### 15.2 Feature F-FIN-02 – GST Included Work Order Entry
1. User selects GST Included.
2. Enters inclusive amount per form rules.
3. System reverse-calculates GST Amount and Work Portion Value.
4. Total Work Value = inclusive total.

---

### 15.3 Feature F-FIN-03 – Post Bill Impact
1. User saves bill with Gross G.
2. Work Gross Bills Raised increases by that bill’s gross (recomputed from all bills).
3. Balance = Total Work Value − Gross Bills Raised.
4. Financial Progress = Gross Bills Raised / Total Work Value × 100.
5. Payments/Outstanding/Net do not redefine Balance/Progress.

---

### 15.4 Feature F-FIN-04 – Expense Impact on Profit/Loss Display
1. Qualifying expenses sum into Work Total Expenditure.
2. Estimated Profit/Loss display updates per PRD assumption (Gross Bills − Expenditure) on summary/dashboard widgets.

---

## 16. Cancellation Matrix (Summary)

| Context | Cancel control | Result |
|---------|----------------|--------|
| Dirty form | Cancel / Navigate away | Confirm discard; no save |
| Delete confirm | Cancel | No delete |
| Restore confirm | Cancel | No restore |
| Upload dialog | Cancel | No new doc (pending files aborted) |
| Assign expense dialog | Cancel | No assignment change |
| Print preview | Close | No data change |
| Login | Leave site | No session |

---

## 17. Recovery Matrix (Summary)

| Failure | User/System recovery |
|---------|----------------------|
| Login service down | Retry later |
| Save failure | Message; retry; no partial totals |
| Upload partial batch | Retry failed files |
| Backup failed | Next schedule; Admin sees Failed history |
| Restore failed | Remain prior state; retry other backup |
| Edit lock | Wait/retry later; view-only meanwhile |
| Session timeout | Re-login; re-enter unsaved data |
| Search/report fail | Retry |

---

## 18. Alternative Flow Index (High-Value)

| ID | Alternative |
|----|-------------|
| Alt-1 | Remember Me login |
| Alt-2 | Demo role logins |
| Alt-3 | Save & New Work |
| Alt-4 | GST Included calculation path |
| Alt-5 | Bill without RA number (system number only) |
| Alt-6 | Multiple other deductions |
| Alt-7 | Partial payment status |
| Alt-8 | General expense then later assignment |
| Alt-9 | Reassign general expense |
| Alt-10 | Multi-document upload with partial failures |
| Alt-11 | Saved report filter reuse/default |
| Alt-12 | Alert drill-down to filtered lists |
| Alt-13 | Work delete blocked due to children |
| Alt-14 | Master delete blocked when in use |

---

## 19. Out-of-Scope Flows (Do Not Implement in Version 1.0)

- Offline queue/sync/conflict-resolution flows
- Excel data import wizards
- Company logo/name upload settings flows
- Document recycle bin restore flows
- BOQ line-item billing flows
- Multi-work expense split flows
- Gantt planning flows
- Native mobile-only flows

---

## 20. Open Functional Assumptions

| ID | Assumption |
|----|------------|
| FS-AUTH-01 | Session continues after own password change |
| FS-DASH-01 | All five alert types always visible with counts |
| FS-DOC-01 | Batch upload uses shared selected document type |
| FS-RPT-01 | One default saved filter per report per user |

---

## 21. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Senior Business Analyst | ☐ Behaviour complete for Version 1.0 | |
| Principal UX Designer | ☐ Interaction coverage sufficient for screens | |

---

## 22. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-03 |
| Title | Functional Specification |
| Next Document | `04-screen-specification.md` |

---

**End of Document 03 – Functional Specification**
