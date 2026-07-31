# CWMS – Construction Work Management System  
## 04 – Screen Specification

**Document Type:** Product Design Package – Screen Specification  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** `dialog.md` + Documents 00–03  
**Depends On:** Documents 00–03  
**Audience:** UX, Engineering, Product, QA  

---

## 0. Introduction

### 0.1 Purpose

This document specifies every Version 1.0 screen:

- Layout structure
- Sections
- Buttons and controls
- Tables
- Dialogs
- Navigation
- Keyboard shortcuts
- Validation presentation
- User feedback
- UI states (empty, loading, error, locked, read-only)

Visual theme (including light/dark) is owned by the UI/UX designer and is **not** mandated here beyond structural clarity and discovery layout intent.

### 0.2 Global Shell Layout (All Authenticated Screens)

Discovery-approved consistency model adapted to web:

| Region | Content |
|--------|---------|
| **Top** | Product title **CWMS**, current page title, primary toolbar actions for the page |
| **Left** | Primary navigation menu |
| **Center** | Data entry form or data grid / summary |
| **Bottom** | Status bar: signed-in user name, role, environment/cloud status, last refresh time (optional) |

**Viewer presentation rule:** Mutating buttons hidden or disabled with tooltip “View only”.

### 0.3 Keyboard Interaction (Web App)

CWMS Version 1.0 is a **web application**. Custom application shortcut-key schemes (for example Ctrl+S, Alt+W, Ctrl+K) are **not required** for Version 1.0.

Users interact through:

- Pointer/touch clicks on buttons, links, and rows
- Standard browser form behaviour (`Tab` to move between fields, `Enter` to submit a focused primary control where the browser already does so)
- Browser-native dialogs/print behaviour where applicable

If keyboard accelerators are added later, they are a Version 1.1+ usability enhancement, not a Version 1.0 acceptance requirement.

### 0.4 Global Feedback Patterns

| Pattern | Use |
|---------|-----|
| Inline field error | Validation failures under/beside field |
| Toast / banner success | Save, upload, restore success |
| Toast / banner error | Save failure, permission denied |
| Modal confirm | Delete, restore, discard unsaved |
| Disable + spinner on primary button | Prevent double-submit |

### 0.5 Global States

| State | Behaviour |
|-------|-----------|
| Loading | Skeleton or spinner in center; nav usable |
| Empty | Illustration/message + primary CTA if permitted |
| Error | Message + Retry |
| Read-only | Viewer or View mode; inputs non-editable |
| Locked | Edit denied banner naming lock condition |
| Dirty | Navigate away prompts discard confirm |

---

## 1. SCR-LOGIN – Login Screen

### 1.1 Layout

Centered authentication card on full viewport (no left nav).

### 1.2 Sections

1. Product brand: **CWMS – Construction Work Management System**
2. Login form
3. Optional footer note for demo training accounts (non-production guidance)

### 1.3 Controls

| Control | Type | Notes |
|---------|------|-------|
| Username | Text | Required |
| Password | Password | Required; show/hide toggle recommended |
| Remember Me | Checkbox | |
| Login | Primary button | |
| Change Password | Link/button | May open after login or dedicated flow |

### 1.4 Dialogs

- None required on initial load
- Error banner inside card for failed login

### 1.5 Navigation

- Success → Dashboard
- No authenticated shell until success

### 1.6 Keyboard

- Standard browser behaviour only (`Tab` / `Enter` as provided by the browser)
- No custom shortcut-key requirement

### 1.7 Validation / Feedback

- Empty username/password → inline required
- Invalid credentials → banner “Invalid username or password”
- Inactive user → “Account is inactive”
- Service down → “Unable to sign in. Try again.”

### 1.8 States

| State | UI |
|-------|----|
| Default | Empty fields |
| Loading | Login disabled + spinner |
| Error | Banner + fields retained except password may clear |
| Success | Navigate away |

---

## 2. SCR-SHELL – Authenticated Application Shell

### 2.1 Left Navigation Items (Version 1.0)

1. Dashboard  
2. Work Register  
3. Billing  
4. Expenditure  
5. Documents  
6. Reports  
7. Masters (Administrator only)  
8. Users (Administrator only)  
9. Backup & Restore (Administrator for restore; history Admin-minimum)  
10. Logout (header or nav)

### 2.2 Header Controls

- Page title
- Global search field
- User display name + role chip
- Logout

### 2.3 Status Bar

- User
- Role
- Online/cloud connected indicator
- Optional “Last backup: &lt;date&gt;” for Admin

---

## 3. SCR-DASH – Dashboard

### 3.1 Layout

Top toolbar (page title only) → KPI row → Alerts + Traffic light attention → Quick actions → Recent works/activities.

### 3.2 Sections

1. **KPI Cards**
   - Total Works
   - Planned / In Progress / Hold / Completed (or grouped Active=In Progress)
   - Total Work Portion Value
   - Total GST
   - Total Work Value
   - Gross Bills Raised
   - Payments Received
   - Outstanding
   - Total Expenditure
   - Estimated Profit/Loss
2. **Alert Panel** (always show five types with counts)
   - Pending bills
   - Overdue/delayed schedule
   - Outstanding payments
   - Missing key documents
   - Works on Hold
3. **Traffic Light Attention List**
   - Work Code, Work Name, Status, Indicator (Green/Yellow/Red)
4. **Quick Actions** (Full-access)
   - New Work, Billing, Expenditure, Documents, Reports, Backup
5. **Recent Works / Activities**

### 3.3 Buttons

| Button | Action |
|--------|--------|
| Each Quick Action | Navigate |
| Alert row | Drill to filtered list/report |
| Recent row | Open Work Summary |
| Retry (widget) | Reload widget |

### 3.4 Tables

- Attention list table
- Recent works table

### 3.5 Dialogs

- None primary

### 3.6 Keyboard

- No custom shortcut-key requirement

### 3.7 Validation

- N/A (display)

### 3.8 Feedback / States

| State | UI |
|-------|----|
| Loading | Card skeletons |
| Empty portfolio | Zeros + “No works yet” + New Work |
| No alerts | Counts zero / “No alerts” |
| Widget error | Inline error + Retry |
| Viewer | Quick actions hidden |

---

## 4. SCR-WORK-LIST – Work Register List

### 4.1 Layout

Toolbar → Filter/search bar → Data grid → Pagination.

### 4.2 Toolbar Buttons

| Button | Roles |
|--------|-------|
| New Work | Full-access |
| Edit | Full-access, requires selection |
| Delete | Full-access, requires selection |
| View | All |
| Search | All (or search field always visible) |
| Export | All (view export allowed) |

### 4.3 Filter Controls

- Search text
- Status multi/single select: Planned, In Progress, Hold, Completed
- Project
- Client
- Contractor
- Category
- Date range
- Financial Year
- Apply / Clear

### 4.4 Table Columns

| Column | Sortable |
|--------|----------|
| Traffic Light | Optional |
| Work Code | Yes |
| Work Order No. | Yes |
| Work Name | Yes |
| Client | Yes |
| Project | Yes |
| Status | Yes |
| Balance Work Value | Yes |

Row click → View Summary (default); checkbox/selection for Edit/Delete.

### 4.5 Pagination

- “Showing X–Y of Z”
- Page size control (e.g., 20)

### 4.6 Dialogs

- Delete Work confirm
- Delete blocked dialog when children exist
- Edit lock message dialog/banner

### 4.7 Keyboard

- No custom shortcut-key requirement; actions are button/menu driven

### 4.8 Validation / Feedback

- Export failure toast
- Lock message when Edit denied

### 4.9 States

| State | UI |
|-------|----|
| Empty | “No works yet” + New Work |
| No matches | “No matches” + Clear filters |
| Loading | Table skeleton |
| Error | Retry banner |

---

## 5. SCR-WORK-FORM – New / Edit Work

### 5.1 Layout

Page title “New Work” / “Edit Work” / “View Work” → Tab strip → Tab body → Footer actions.

### 5.2 Tabs

1. General Information  
2. Financial Details  
3. Location Details  
4. Schedule  
5. Documents  
6. Summary  

### 5.3 Tab 1 – General Information Controls

| Field | Control |
|-------|---------|
| Work Code | Read-only text (auto) |
| Project | Combobox: free text + dropdown of existing names |
| Work Name | Text required |
| Work Category | Select (Masters) |
| Client | Text free text |
| Contractor | Text free text |
| Work Order No. | Text required |
| Work Order Date | Date |
| Work Status | Select: Planned / In Progress / Hold / Completed |
| Client/Department Format | Select (Masters), optional |

### 5.4 Tab 2 – Financial Details Controls

| Field | Control |
|-------|---------|
| GST Type | Radio: GST Extra / GST Included |
| Work Portion Value | Number |
| GST % | Number (free) |
| GST Amount | Read-only computed |
| Total Work Value | Read-only computed (or input when Included per rules) |
| Balance Work Value | Read-only computed |
| Financial Progress % | Read-only computed |

### 5.5 Tab 3 – Location Details Controls

State, District, Taluka, Village, Existing Chainage, Design Chainage, Side (LHS/RHS/Both), Structure Type — text/select as appropriate.

### 5.6 Tab 4 – Schedule Controls

| Field | Control |
|-------|---------|
| Start Date | Date |
| Scheduled Completion | Date |
| Actual Completion | Date |
| Physical Progress % | Number 0–100 |
| Financial Progress % | Read-only |

### 5.7 Tab 5 – Documents (Embedded)

Mini document list + Upload buttons launching document upload dialog for this Work.

### 5.8 Tab 6 – Summary

Read-only review of all entered values + financial card.

### 5.9 Footer Buttons

| Button | Visibility |
|--------|------------|
| Save | Full-access Edit/New |
| Save & New | Full-access New/Edit |
| Cancel | Always on form |
| Print Work Summary | View/Summary |

### 5.10 Dialogs

- Discard unsaved changes
- Validation summary (optional if many errors)
- Edit lock banner at top when locked

### 5.11 Keyboard

- No custom shortcut-key requirement; Save / Save & New / Cancel are explicit buttons
- Discard confirmation still applies when leaving a dirty form via Cancel or navigation

### 5.12 Validation Presentation

- Per-field inline errors
- Duplicate Work Order No. on Work Order field
- Date order errors on date fields
- Financial invalid numbers highlighted

### 5.13 States

| State | UI |
|-------|----|
| New | Empty defaults; Status default Planned (**Assumption SCR-WORK-01**) |
| Edit | Populated; lock held |
| View | All controls read-only; Edit button in toolbar |
| Saving | Footer buttons disabled + spinner |
| Dirty | Dot/indicator on tabs with changes (recommended) |

---

## 6. SCR-WORK-SUMMARY – Work Summary (Digital File Home)

### 6.1 Layout

Header identity → Financial Summary card → Section tabs/buttons → Child module content.

### 6.2 Header Fields (Read-only)

Work Code, Project, Work Name, Client, Contractor, Work Order No., Status, Traffic Light.

### 6.3 Financial Summary Card

- Work Portion Value  
- GST Amount  
- Total Work Value  
- Gross Bills Raised  
- Payments Received  
- Outstanding Payment  
- Total Expenditure  
- Balance Work Value  
- Estimated Profit / Loss  

### 6.4 Section Navigation Buttons

Work Details | Estimate | Schedule | Documents | Billing | Expenditure | Reports  

(Photos deferred as dedicated module; Site Photos may appear under Documents types.)

### 6.5 Buttons

| Button | Role |
|--------|------|
| Edit Work | Full-access |
| Print Work Summary | All |
| Back to Register | All |

### 6.6 States

- Loading summary skeleton
- Child empty states inside each section
- Locked banner if user tries Edit while locked

---

## 7. SCR-EST – Estimate List & Form (Work Context)

### 7.1 List Toolbar

Add Estimate | Edit | Delete | View | Open Document  

### 7.2 Table Columns

Estimate No. | Date | Amount | Revised Amount | Approved By | Document  

### 7.3 Form Fields

Estimate No., Estimate Date, Estimated Amount, Revised Estimate, Approved By, Remarks, Document upload/link control.

### 7.4 Footer

Save | Cancel  

### 7.5 Dialogs

Delete confirm; discard confirm  

### 7.6 States

Empty: “No estimates for this work” + Add Estimate  
Viewer: read-only  

---

## 8. SCR-SCH – Schedule List & Form (Work Context)

### 8.1 Toolbar

Add Activity | Edit | Delete  

### 8.2 Table Columns

Activity | Start Date | Finish Date | Actual Start | Actual Finish | Progress %  

### 8.3 Form Fields

Matching columns; Progress 0–100.

### 8.4 States

Empty activities message; overdue visual cue (row highlight) when delayed rule met.

---

## 9. SCR-DOC-LIST – Documents (Module & Work Context)

### 9.1 Layout

Toolbar → Filters → Table  

### 9.2 Toolbar Buttons

| Button | Notes |
|--------|-------|
| Upload | Single |
| Add Multiple Documents | Multi |
| Open | |
| Download | |
| Print | |
| Delete | Permanent warning |

### 9.3 Filters

Work Code/Name, Document Type, File Name, Document Number, Date range  

### 9.4 Table Columns

Work Code | Category/Type | Document Number | Title | File Name | Upload Date | Uploaded By  

### 9.5 Dialog: Upload Single

Fields: Work (prefilled in work context), Document Type, Document Number, Title, Remarks, File picker.  
Buttons: Upload | Cancel  

### 9.6 Dialog: Upload Multiple

Work, Document Type, multi-file picker, progress list, Close/Cancel  

### 9.7 Dialog: Delete Permanent

Warning text: permanent, no recycle bin.  
Buttons: Delete Permanently | Cancel  

### 9.8 Feedback

- Reject non-PDF/image
- Reject > 20 MB
- Per-file progress
- Batch summary toast

### 9.9 States

Empty documents; loading; storage error; Viewer without Delete/Upload  

---

## 10. SCR-BILL-LIST – Billing List

### 10.1 Toolbar

New Bill | Edit | Delete | View | Print | Export  

### 10.2 Search / Filters

Search box; Date; Client; Work; Bill Status; Payment Status; FY  

### 10.3 Table Columns

Work Code | Work Name | RA Bill No. | System Bill No. (optional column) | Bill Date | Bill Status | Net Bill Amount | Payment Status  

### 10.4 States

Empty bills; no matches; loading; Viewer read-only toolbar  

---

## 11. SCR-BILL-FORM – New / Edit Bill

### 11.1 Layout

Vertical sections A–F (discovery), sticky footer Save/Cancel.

### 11.2 Section A – Work Details (Read-only Auto-fill)

Work Code, Work Name, Client, Contractor, Work Order No., Work Portion Value, GST %, Total Work Value, Balance Work Value  

### 11.3 Section B – Bill Details

| Field | Control |
|-------|---------|
| Bill Type | Select/Radio: RA Bill / Final Bill |
| RA Bill No. | Text optional |
| System Bill Number | Read-only (assigned after save / preview placeholder) |
| Bill Date | Date |
| Period From | Date |
| Period To | Date |

### 11.4 Section C – Bill Amount

Previous Bill Amount, Current Work Portion Amount, GST Amount, Gross Bill Amount (read-only auto)

### 11.5 Section D – Deductions

Standard numeric fields: Security Deposit, TDS, GST TDS, Labour Cess, Royalty, Recovery  
Other deductions table: Deduction Name | Amount | Add More (+) | Remove line  

Total Deductions read-only auto.

### 11.6 Section E – Net Amount

Gross, Total Deductions, Net Bill Amount (read-only)

### 11.7 Section F – Payment Details

Payment Status select; Payment Date; Amount Received; UTR/Cheque No.; Bank Name; Remarks  

### 11.8 Footer Buttons

Save | Cancel | Print (edit/view)

### 11.9 Dialogs

Discard confirm; delete confirm (if delete from form)

### 11.10 Keyboard

- No custom shortcut-key requirement; Save / Cancel are explicit buttons

### 11.11 Validation UI

Inline on dates/amounts; total recalculation live on field blur/change  

### 11.12 States

New; Edit; View; Saving; Viewer read-only  

---

## 12. SCR-BILL-HISTORY – Work Bill History

### 12.1 Table

RA Bill | System Bill No. | Date | Gross | Deductions | Net | Payment  

### 12.2 Actions

View | Edit | New Bill  

---

## 13. SCR-EXP-LIST – Expenditure List

### 13.1 Toolbar

New Expense | Edit | Delete | Print | Export  

### 13.2 Filters

Search; Work; Vendor; Date; Expense Type (Work-Specific/General); Expense Head; Payment Mode  

### 13.3 Table Columns

Date | Work Code | Expense Head | Vendor | Amount | GST | Total | Payment Mode | Voucher/Ref | Status  

### 13.4 States

Empty; no matches; Viewer read-only  

---

## 14. SCR-EXP-FORM – New / Edit Expense

### 14.1 Top Control

Expense Type radio: Work-Specific | General  

### 14.2 Section A – Work Details

Visible when Work-Specific: Work selector + read-only work identity  

### 14.3 Section B – Expense Details

Expense Date, Expense Head (masters), Vendor (free text), Description, Invoice/Bill No., Invoice Date  

### 14.4 Section C – Financial

Expense Value excl. GST, GST %, GST Amount (auto), Total (auto)  

### 14.5 Section D – Payment

Mode: Cash | Bank Transfer | Cheque | UPI; Reference No.; Payment Date  

### 14.6 Section E – Attachments

Upload controls for invoice/receipt/other (PDF/image, 20 MB)  

### 14.7 Status

Draft | Paid | Assigned to Work | Cancelled  

### 14.8 Footer

Save | Cancel | Assign to Work (only for General, opens dialog)  

### 14.9 Dialog: Assign to Work

Work dropdown/search; note “100% assignment”; Confirm | Cancel  

### 14.10 States

General vs Work-Specific layouts toggle; Viewer read-only  

---

## 15. SCR-RPT-HOME – Reports Home

### 15.1 Layout

List/cards of nine reports → opens Report Runner  

### 15.2 Report Entries

1. Work Register Report  
2. Billing Report  
3. Expenditure Report  
4. Financial Summary Report  
5. Work-wise Summary Report  
6. Pending Payment Report  
7. Document Register  
8. General Expense Report  
9. Dashboard Summary Report  

---

## 16. SCR-RPT-RUN – Report Runner (Shared Template)

### 16.1 Layout

Left/top **Filter Panel** → **Results Grid** → Footer actions  

### 16.2 Common Filter Controls

Project, Client, Contractor, Work Status, Work Code, Work Name, Date From/To, Financial Year (Apr–Mar)  
Report-specific filters appear below common set.

### 16.3 Saved Filters Controls

| Control | Action |
|---------|--------|
| Saved Filters dropdown | Apply |
| Save Current Filter | Opens name dialog |
| Rename | |
| Set as Default | |
| Delete Filter | Confirm |

### 16.4 Results Area

Sortable columns per report catalogue (Document 10 alignment).  
Totals row where applicable.

### 16.5 Footer / Toolbar Buttons

Run/Apply | Print Preview | Print | Export PDF | Export Excel | Clear Filters  

### 16.6 Print Preview Dialog/Page

Shows default company name + default logo, report name, project (if any), date/time, user, filters used, page numbers, body.

### 16.7 Dialogs

- Save filter name
- Delete filter confirm
- Export failure

### 16.8 Keyboard

- No custom shortcut-key requirement; Run / Print Preview / Export are explicit buttons
- Browser print may still be used from Print Preview where applicable

### 16.9 States

| State | UI |
|-------|----|
| Initial | Filters empty/default FY optional |
| Loading | Grid spinner |
| Empty results | “No records” in body |
| Error | Banner + Retry |
| Ready | Grid populated |

### 16.10 Work-wise Summary Special

Requires Work selector before run; shows single-work multi-section layout (details, financials, bills, expenditure, document count, schedule).

---

## 17. SCR-SEARCH – Global Search Overlay / Page

### 17.1 Controls

Search input; results grouped list (Works primary; Bills/Documents secondary if shown).

### 17.2 Interaction

Type → debounced results → click → navigate.  
Close control dismisses overlay/page search.

### 17.3 States

Idle hint; loading; no matches; error  

---

## 18. SCR-BAK – Backup & Restore

### 18.1 Layout

Info panel (schedule: weekly; retention: 30 days) → History table → Restore action  

### 18.2 Table Columns

Backup Date/Time | Identifier/Name | Type (Automatic) | Status | Retention expiry  

### 18.3 Buttons

| Button | Role |
|--------|------|
| Refresh | Admin |
| Restore Selected | Admin only |
| View Details | Admin |

### 18.4 Dialog: Restore Confirm (Double)

Step 1: Warning about overwrite  
Step 2: Type CONFIRM or check “I understand” + Restore now  
Buttons: Restore | Cancel  

### 18.5 Feedback

- Success banner: restore completed; recommend refresh
- Failure banner
- Progress modal during restore (blocks navigation)

### 18.6 States

Empty history early lifecycle; Failed row styling; Viewer/non-Admin no restore  

---

## 19. SCR-USR – User Administration (Administrator)

### 19.1 Toolbar

New User | Edit | Activate/Deactivate | Reset/Change Password  

### 19.2 Table Columns

Name | Login ID | Role | Mobile | Email | Active  

### 19.3 Form Fields

Name, Login ID, Password (+ confirm), Role select (five roles), Mobile, Email, Active toggle  

### 19.4 Password Rules Helper Text

Visible checklist:
- At least 8 characters  
- Upper and lower case  
- Number  
- Symbol  
- Avoid personal details  

### 19.5 Dialogs

Deactivate confirm; discard confirm  

### 19.6 States

Empty users (should not happen after seed); validation errors; saving  

---

## 20. SCR-MST – Masters / Option Lists (Administrator, Separate Page)

### 20.1 Layout

Left sub-nav of master types → Right list + editor  

### 20.2 Master Types

1. Work Categories  
2. Document Types  
3. Deduction Heads  
4. Expense Categories  
5. Client / Department Formats  

### 20.3 Toolbar

Add | Edit | Delete  

### 20.4 Table

Name | Active/Usage count (optional) | Last Updated  

### 20.5 Dialog: Add/Edit Master Value

Name field; Save | Cancel  

### 20.6 Dialog: Delete

- If in use: blocking message with OK  
- If unused: confirm delete  

### 20.7 Seeded Examples (Display on first run)

Show initial values from Product Owner lists (Drain, Bridge, … etc.) editable thereafter.

### 20.8 States

Empty list CTA; non-Admin access denied page  

---

## 21. SCR-CHG-PWD – Change Password

### 21.1 Fields

Current Password (if self), New Password, Confirm Password, rules checklist  

### 21.2 Buttons

Update Password | Cancel  

### 21.3 States

Validation checklist live updates; success toast; error banner  

---

## 22. Common Dialogs Catalogue

| Dialog ID | Title | Buttons |
|-----------|-------|---------|
| DLG-DISCARD | Discard unsaved changes? | Discard / Keep Editing |
| DLG-DEL-WORK | Delete work? | Delete / Cancel |
| DLG-DEL-BLOCK | Cannot delete work | OK |
| DLG-DEL-DOC | Permanently delete document? | Delete Permanently / Cancel |
| DLG-DEL-BILL | Delete bill? | Delete / Cancel |
| DLG-DEL-EXP | Delete expense? | Delete / Cancel |
| DLG-DEL-MST | Delete master value? | Delete / Cancel |
| DLG-MST-INUSE | Value in use | OK |
| DLG-LOCK | Edit in progress by another user | OK |
| DLG-ASSIGN-EXP | Assign expense to work | Assign / Cancel |
| DLG-RESTORE | Restore backup (double step) | Restore / Cancel |
| DLG-SAVE-FILTER | Save filter | Save / Cancel |
| DLG-DEL-FILTER | Delete saved filter? | Delete / Cancel |

---

## 23. Screen-by-Role Visibility Matrix (Summary)

| Screen | Admin | Operator/Engineer/Accounts | Viewer |
|--------|-------|----------------------------|--------|
| Login | Y | Y | Y |
| Dashboard | Y | Y | Y (no mutate quick actions) |
| Work List/Form | Y | Y | View only |
| Billing | Y | Y | View only |
| Expenditure | Y | Y | View only |
| Documents | Y | Y | Open/Download/Print |
| Reports | Y | Y | Y |
| Masters | Y | N | N |
| Users | Y | N | N |
| Backup Restore | Y | N (or history hidden) | N |

---

## 24. Responsive / Browser Notes (Product Level)

- Primary design target: desktop browser office use  
- Product policy: any place, any browser  
- Tables may horizontal-scroll on smaller widths  
- Native mobile app not in Version 1.0; mobile browser should remain usable for view/light edit where practical without separate mobile UI project  

---

## 25. Assumptions

| ID | Assumption |
|----|------------|
| SCR-WORK-01 | New Work default status = Planned |
| SCR-NAV-01 | Masters and Users are top-level nav items for Admin |
| SCR-BAK-01 | Non-Admin users do not see Restore |

---

## 26. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Principal UX Designer | ☐ Structure accepted for visual design | |
| Senior Business Analyst | ☐ Covers all Version 1.0 screens | |

---

## 27. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-04 |
| Title | Screen Specification |
| Next Document | `05-user-journeys.md` |

---

**End of Document 04 – Screen Specification**
