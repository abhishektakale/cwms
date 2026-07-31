# CWMS – Construction Work Management System  
## 05 – User Journeys

**Document Type:** Product Design Package – User Journeys  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–04 + `dialog.md`  
**Depends On:** Documents 00–04  
**Audience:** Product, UX, BA, QA, Training  

---

## 0. Introduction

### 0.1 Purpose

This document describes complete end-to-end user journeys for Version 1.0 roles. Each journey includes intent, preconditions, step-by-step workflow, decision points, success outcomes, and failure/recovery paths.

### 0.2 Role Mapping

| Journey Actor | CWMS Role | Access |
|---------------|-----------|--------|
| Administrator | Administrator | Full access + Masters + Users + Restore |
| Operator | Data Entry Operator | Full operational access |
| Engineer | Engineer | Full operational access (engineering-weighted journeys) |
| Accounts | Accounts | Full operational access (finance-weighted journeys) |
| Viewer | Viewer | View only |

Version 1.0 interim permission model: Operator, Engineer, and Accounts have the same mutation rights; journeys differ by **typical goals**, not by hard module locks.

### 0.3 Shared Preconditions (All Authenticated Journeys)

- CWMS public-cloud web app is reachable
- User has valid credentials
- Browser session is active (or user can log in)
- Demo credentials available for training:
  - Username = role name
  - Password = `Password@123`

---

## 1. Administrator Journeys

### Journey A1 – First Login and Orientation

**Goal:** Sign in as Administrator and confirm the system is ready for the office.

**Preconditions:** Demo or real Administrator account exists.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Opens CWMS URL | Shows Login |
| 2 | Enters `Administrator` / `Password@123` (or real admin credentials), optional Remember Me | Validates |
| 3 | Clicks Login | Opens Dashboard with KPIs, alerts, traffic lights |
| 4 | Scans alerts and KPI totals | Displays portfolio state |
| 5 | Opens Users from nav | Sees seeded demo users |
| 6 | Opens Masters | Sees seeded option lists |
| 7 | Opens Backup & Restore | Sees backup history / schedule info (weekly, 30-day retention) |

**Success:** Admin understands Dashboard, Users, Masters, and Backup entry points.  
**Failure/Recovery:** Invalid login → correct credentials; cloud unavailable → retry later.

---

### Journey A2 – Onboard a Real User

**Goal:** Create a production user and assign a role.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Navigate to Users → New User | Opens user form |
| 2 | Enters Name, Login ID, Password meeting rules, Role, Mobile/Email, Active | Live password checklist updates |
| 3 | Saves | User created; audit recorded |
| 4 | Instructs user to log in | New user can authenticate |
| 5 | Optional: deactivate a leaving employee | User blocked on next login |

**Decision points:** Role selection among five roles.  
**Success:** New user logs in with correct access (Viewer cannot mutate).  
**Cancel:** Admin cancels form → no user created.  
**Failure:** Duplicate Login ID / weak password → fix and resave.

---

### Journey A3 – Maintain Masters for Office Practice

**Goal:** Add a new Work Category and Deduction Head used on forms.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Opens Masters | Shows master type list |
| 2 | Selects Work Categories → Add | Dialog opens |
| 3 | Enters e.g. “Box Culvert” → Save | Category available on Work form |
| 4 | Selects Deduction Heads → Add “Mobilization Recovery” | Saved |
| 5 | Asks Operator to open New Work / New Bill | New values appear in dropdowns |

**Success:** Forms show updated options immediately for future selections.  
**Failure:** Delete in-use value → system blocks with explanation.  
**Recovery:** Deactivate/stop using value; keep historical records.

---

### Journey A4 – Restore After Serious Data Error

**Goal:** Restore CWMS to a known good weekly backup.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Confirms with management that restore is required | (offline process) |
| 2 | Opens Backup & Restore | Shows history |
| 3 | Selects a Successful backup within 30 days | Enables Restore |
| 4 | Clicks Restore and completes double confirmation | Warns destructive overwrite |
| 5 | Confirms | Blocks writes; restores data + documents; audits action |
| 6 | Verifies Dashboard/Work Register after restore | Restored state visible |

**Cancel:** Admin cancels confirmation → no restore.  
**Failure:** Restore fails → prior state retained if possible; Admin retries another backup.  
**Success:** System matches selected backup point.

---

### Journey A5 – Weekly Backup Oversight

**Goal:** Confirm automatic backups are healthy.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Weekly, opens Backup history | Lists automatic weekly jobs |
| 2 | Checks latest Status = Success | Displays retention window |
| 3 | If Failed, notes date and escalates ops | Failed row visible |

**Success:** Latest backup success within expected weekly cadence.  
**Recovery:** Investigate failure; wait for next run or ops intervention.

---

### Journey A6 – Change Own Password

**Goal:** Replace demo password with personal admin password.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Opens Change Password | Shows rules checklist |
| 2 | Enters current `Password@123`, new compliant password | Validates |
| 3 | Saves | Password updated |

**Failure:** Missing symbol/length → rejected with guidance.

---

## 2. Operator (Data Entry Operator) Journeys

### Journey O1 – Create a New Work End-to-End

**Goal:** Register a new highway work as a digital file.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Logs in as Data Entry Operator | Dashboard |
| 2 | Quick Action **New Work** (or Work Register → New) | Work form opens |
| 3 | Tab General: selects/types Project, enters Work Name, Category, Client, Contractor, Work Order No./Date, Status Planned or In Progress | Validates required fields |
| 4 | Tab Financial: chooses GST Extra or Included; enters values & GST % | Auto GST Amount, Total, Balance |
| 5 | Tab Location: enters chainage, side, structure type, village/district as known | Stored |
| 6 | Tab Schedule: enters start & scheduled completion | Stored |
| 7 | Tab Documents: uploads Work Order PDF (≤20 MB) | Stored in CWMS file storage |
| 8 | Tab Summary: reviews → Save | Assigns Work Code `CWMS-YYYY-####`; success |
| 9 | Opens Work Summary | Sees financial card and section navigation |

**Alt:** Save & New for batch entry days.  
**Cancel:** Cancel with discard → no work.  
**Failure:** Duplicate Work Order No. → correct number.  
**Success:** Work appears in register with Balance = Total Work Value.

---

### Journey O2 – Upload Multiple Drawings to an Existing Work

**Goal:** Attach many site/drawing images or PDFs at once.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Opens Work → Documents | List shown |
| 2 | Add Multiple Documents; type = Drawing | Picker opens |
| 3 | Selects 10 PDF/image files | Validates type/size |
| 4 | Uploads | Per-file progress; records created |
| 5 | Reviews list | All successful files visible |

**Alt:** Some files fail type/size → summary shows failures; retry those.  
**Cancel mid-upload:** Completed files remain; pending aborted.  
**Success:** Documents open from CWMS storage even if local originals move.

---

### Journey O3 – Correct a Work Under Edit Lock Conflict

**Goal:** Edit a work while another user may be editing.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Selects work → Edit | If free, lock acquired; form opens |
| 2 | If locked by Engineer | Message: edit in progress by other user |
| 3 | Opens View instead; waits | Read-only summary |
| 4 | Retries Edit later | Lock available; edits and saves |

**Success:** No silent overwrite; data saved by one editor at a time.

---

### Journey O4 – Search and Update Status to Hold

**Goal:** Find a delayed site work and mark Hold.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Work Register search by chainage/name | Matching rows |
| 2 | Opens work → Edit → Status = Hold → Save | Status updated; audit |
| 3 | Returns to Dashboard | “Works on Hold” alert count increases |

**Success:** Management sees Hold via alert/traffic lights.

---

### Journey O5 – Delete Document with Warning

**Goal:** Remove a wrong upload permanently.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Documents → selects file → Delete | Permanent delete warning (no recycle bin) |
| 2 | Confirms | File/record removed |
| 3 | Cancels instead | No change |

**Success:** Wrong file gone; intentional deletes only after warning.

---

### Journey O6 – Day-End Reporting Support

**Goal:** Export filtered work list for supervisor.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Filters Work Register to In Progress + project | Filtered grid |
| 2 | Export | Downloads file |
| 3 | Optional: opens Work Register Report with same filters / saved filter | Print/PDF/Excel |

**Success:** Supervisor receives current in-progress list without spreadsheet rebuild.

---

## 3. Engineer Journeys

### Journey E1 – Review Portfolio Attention Items

**Goal:** Start the day from alerts and traffic lights.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Login as Engineer | Dashboard |
| 2 | Reviews Red/Yellow traffic light works | Attention list |
| 3 | Opens Overdue/delayed schedule alert | Filtered delayed works |
| 4 | Opens a work summary | Sees schedule + documents + financials |
| 5 | Updates schedule actuals / physical progress % | Saves; financial progress remains system-calculated from gross bills |
| 6 | Checks Missing key documents alert | Uploads missing Work Order/Estimate PDF if responsible |

**Success:** Delayed/missing-doc works get updated the same day.

---

### Journey E2 – Work File Review Before Site Visit

**Goal:** Open one work digital file remotely from site/travel.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Logs in from any browser/location | Dashboard |
| 2 | Searches Work Code / chainage | Finds work |
| 3 | Opens Documents; views drawings/PDFs | Streams CWMS-stored files |
| 4 | Reviews Schedule and Status | Read/update as needed |
| 5 | Logs out or leaves session | Session ends per timeout/Remember Me |

**Success:** Engineer accesses the full work file without VPN desktop install.

---

### Journey E3 – Collaborate with Accounts on a Work

**Goal:** Confirm work values before bill preparation.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Opens Work Summary financial card | Shows Portion/GST/Total/Balance |
| 2 | Confirms GST type correct | Edits work financials if needed (lock permitting) |
| 3 | Messages Accounts offline that work is ready for RA bill | (human step) |
| 4 | Later verifies bill history after Accounts posts RA | Sees new bill; Balance reduced by Gross Bills |

**Success:** Shared single work record prevents conflicting spreadsheets.

---

## 4. Accounts Journeys

### Journey C1 – Enter RA Bill with Flexible Deductions

**Goal:** Post RA Bill No. 3 with department deductions and other recoveries.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Login as Accounts | Dashboard; may see Pending bills / Outstanding alerts |
| 2 | Billing → New Bill → selects Work | Auto-fills work financials |
| 3 | Enters RA Bill No., dates, period, current amount, GST | Gross auto-calculated |
| 4 | Enters standard deductions + Other Deduction lines via Add More | Totals update |
| 5 | Sets Payment Status Pending → Save | System Bill Number assigned; work Gross Bills/Balance/Progress update |
| 6 | Opens Work Bill History | New row visible |

**Alt:** RA number unavailable → leave blank; system number still assigned.  
**Cancel:** Discard → no bill; totals unchanged.  
**Success:** Net payable correct; Balance uses Gross not Net.

---

### Journey C2 – Record Partial Payment

**Goal:** Update payment when part amount received.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Opens bill → Edit payment | Form shows Net |
| 2 | Sets Partially Received; Amount Received; UTR/Bank/Date | Validates |
| 3 | Saves | Outstanding reduces; Outstanding payments alert updates |
| 4 | Runs Pending Payment Report | Bill still listed with remaining amount / days pending |

**Success:** Partial collections visible without closing the bill fully.

---

### Journey C3 – Record Work Expense and Review Profitability

**Goal:** Post machinery expense against a work and review estimated P/L.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Expenditure → New → Work-Specific | Work selected |
| 2 | Enters head Machinery, vendor free text, amounts, GST, mode Bank Transfer | Totals auto |
| 3 | Attaches invoice PDF → Status Paid → Save | Work expenditure updates |
| 4 | Opens Work Summary | Estimated Profit/Loss updates (Gross Bills − Expenditure assumption) |

**Success:** Accounts sees cost vs billing on the same work file.

---

### Journey C4 – Assign General Office Expense Later

**Goal:** Capture fuel as general expense, later assign to one work.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | New Expense → General → save Paid fuel expense | No work link |
| 2 | Later opens expense → Assign to Work | Dialog |
| 3 | Selects work → confirms 100% assignment | Status Assigned; work expenditure includes amount |
| 4 | Runs General Expense Report | Shows Assigned = Yes |

**Success:** Expense captured immediately; allocation deferred without multi-work split.

---

### Journey C5 – Month-End Reporting Pack

**Goal:** Produce meeting-ready PDF/Excel outputs for FY April–March filters.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Reports → Billing Report; set FY + Pending payment saved filter | Results |
| 2 | Export Excel + PDF | Downloads with default company header/logo |
| 3 | Runs Financial Summary and Pending Payment Report | Totals |
| 4 | Saves filter “Pending Payments – FY ####–##” | Reusable next time |

**Success:** Reports generated without rebuilding spreadsheets; branding defaults applied.

---

## 5. Viewer Journeys

### Journey V1 – Management Morning Review

**Goal:** Understand portfolio health without editing risk.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Login as Viewer | Dashboard |
| 2 | Reviews KPIs, alerts, traffic lights | View only; no New Work quick action |
| 3 | Opens Red works | Work Summary read-only |
| 4 | Attempts Edit (if UI somehow invoked) | Permission denied / control absent |
| 5 | Opens Dashboard Summary / Pending Payment reports | View/print/export allowed |
| 6 | Logs out | Session ends |

**Success:** Manager gets oversight without accidental mutation.

---

### Journey V2 – Meeting Drill-Down on One Work

**Goal:** Review one work’s financial and document completeness in a meeting.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Search Work Code | Opens summary |
| 2 | Reviews financial card | Gross bills, payments, outstanding, expenditure, balance, P/L |
| 3 | Opens Documents list; opens PDF | Read-only open/download |
| 4 | Opens Bill History | Payment statuses visible |
| 5 | Runs Work-wise Summary Report → Print Preview | Default branded print view |

**Success:** Single digital work file supports the meeting agenda.

---

### Journey V3 – Viewer Denied Admin Functions

**Goal:** Confirm least-privilege boundaries.

| Step | Actor Action | System Response |
|------|--------------|-----------------|
| 1 | Looks for Masters / Users / Restore in nav | Not available |
| 2 | Direct URL attempt (if tried) | Access denied |
| 3 | Continues with Dashboard/Reports | Allowed |

**Success:** Viewer cannot administer or restore.

---

## 6. Cross-Role Collaboration Journeys

### Journey X1 – Work Life Cycle Across Roles

**Goal:** Take a work from creation to completion using multiple roles.

| Phase | Role | Actions |
|-------|------|---------|
| 1 Create | Operator | Creates work, uploads Work Order, status In Progress |
| 2 Plan | Engineer | Adds schedule activities, physical progress |
| 3 Estimate | Operator/Engineer | Adds estimate + estimate PDF |
| 4 Bill | Accounts | Posts RA bills/deductions/payments |
| 5 Cost | Accounts/Operator | Posts expenses; assigns general costs when known |
| 6 Oversight | Viewer/Admin | Monitors alerts, reports, traffic lights |
| 7 Close | Engineer/Operator | Sets Actual Completion, Status Completed |
| 8 Govern | Administrator | Masters kept current; backups healthy |

**Success:** One Work Code links every artifact; Completed work shows Balance/Progress consistent with Gross Bills.

---

### Journey X2 – Hold and Resume

| Step | Role | Action | System |
|------|------|--------|--------|
| 1 | Engineer | Sets Status Hold; notes delay in schedule | Hold alert increments |
| 2 | Viewer | Sees Works on Hold alert in meeting | Drill-down list |
| 3 | Operator | Later sets In Progress | Alert decreases |
| 4 | Accounts | Continues billing when appropriate | Bills post normally |

---

### Journey X3 – Training with Demo Accounts

**Goal:** Train staff without production risk (or on training tenant).

| Step | Actor | Action |
|------|-------|--------|
| 1 | Admin/Trainer | Shares demo usernames (= role names) and `Password@123` |
| 2 | Trainee | Logs in as each role to experience menus |
| 3 | Trainee as Operator | Creates sample work + document |
| 4 | Trainee as Accounts | Creates sample bill |
| 5 | Trainee as Viewer | Confirms cannot delete |
| 6 | Admin | Later changes demo passwords in production |

**Success:** Users learn CWMS in ~30 minutes for basic paths.

---

## 7. Exception Journeys

### Journey EX1 – Session Timeout Mid-Form

| Step | Result |
|------|--------|
| User idle beyond timeout on Work form | Session expires |
| User clicks Save | Redirected to Login |
| User logs in again | Returns per auth gate; unsaved data may be lost |
| User re-enters and saves | Success |

---

### Journey EX2 – Network Drop on Upload

| Step | Result |
|------|--------|
| Multi-upload in progress; network drops | Failed files reported |
| User reconnects and retries failed files | Remaining documents stored |

---

### Journey EX3 – Gross Bills Exceed Total Work Value

| Step | Result |
|------|--------|
| Accounts posts bills whose gross sum > Total Work Value | Balance negative or over-billed display |
| Dashboard/Work Summary shows actual figures + attention (yellow/red per rules) | Users investigate revision/final bill practice |

---

### Journey EX4 – Attempt to Delete Work with Children

| Step | Result |
|------|--------|
| Operator deletes work with bills/docs | System blocks with explanation |
| Operator must remove/reassign children first (or keep work) | Integrity preserved |

---

## 8. Journey-to-Screen Traceability

| Journey | Primary Screens |
|---------|-----------------|
| A1–A6 | Login, Dashboard, Users, Masters, Backup, Change Password |
| O1–O6 | Work Form, Work Summary, Documents, Work List, Reports |
| E1–E3 | Dashboard, Work Summary, Schedule, Documents |
| C1–C5 | Billing Form, Expenditure Form, Reports, Work Summary |
| V1–V3 | Dashboard, Work Summary, Reports |
| X1–X3 | Cross-module |

---

## 9. Acceptance Journey Checklist (UAT Smoke)

| ID | Journey Smoke Test | Pass Criteria |
|----|--------------------|---------------|
| UAT-J-01 | Admin login + Masters add | New category on Work form |
| UAT-J-02 | Operator create work + upload PDF | Work Code + document openable |
| UAT-J-03 | Accounts RA bill with other deductions | Net correct; Balance uses Gross |
| UAT-J-04 | Accounts partial payment | Outstanding alert updates |
| UAT-J-05 | General expense assign | Work expenditure includes amount |
| UAT-J-06 | Engineer delay update | Overdue alert reflects |
| UAT-J-07 | Viewer cannot edit/delete | Controls absent/denied |
| UAT-J-08 | Edit lock | Second editor sees message |
| UAT-J-09 | Admin restore (test env) | Data returns to backup point |
| UAT-J-10 | Report saved filter + Excel/PDF export | Outputs generated with default branding |

---

## 10. Out-of-Scope Journeys (Version 1.0)

Do not author or test as Version 1.0 journeys:

- Offline field entry later synced
- Excel bulk import of works
- Uploading custom company logo
- Restoring documents from recycle bin
- BOQ quantity-based bill preparation
- Splitting one expense across many works
- Native mobile app workflows

---

## 11. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Principal UX Designer | ☐ Journeys cover primary role goals | |
| Senior Business Analyst | ☐ Traceable to roles and modules | |

---

## 12. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-05 |
| Title | User Journeys |
| Next Document | `06-business-rules.md` |

---

**End of Document 05 – User Journeys**
