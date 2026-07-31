# CWMS – Construction Work Management System  
## 16 – Stitch Design Prompt

**Document Type:** Product Design Package – Stitch UI/UX Prompt  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Ready for Stitch / UX handoff  
**Source:** Documents 00–15 + architecture package (distilled for design intent)  
**Depends On:** Documents 00–12 (especially 00, 01, 02, 04, 05, 06, 10)  
**Audience:** UX, Product, Stitch / AI design tools, Engineering visual reference  

### Purpose

This document stores the single production-quality **Stitch prompt** generated from the CWMS Version 1.0 design package. It captures design intent for UI/UX generation without inventing features, changing workflows, or expanding frozen scope.

**Usage:** Copy the prompt block below into Stitch (or similar UI generators). Do not treat this as a substitute for the formal specifications; those remain the source of truth for engineering and acceptance.

---

## Stitch Prompt (copy from here)

```text
# STITCH DESIGN BRIEF — CWMS (Construction Work Management System) v1.0

Design a complete, premium, high-fidelity UI/UX system for **CWMS – Construction Work Management System**, an online-only public-cloud web application for Indian civil/highway construction offices.

Do NOT invent new business features. Do NOT simplify Version 1.0 workflows. Do NOT add offline mode, sync, Settings module, Excel import, recycle bin, company logo upload, BOQ quantity billing, mobile native app, or notification centre. Theme is a UX decision — make it exceptional.

Visual inspiration (unique synthesis, not clones): Linear + Stripe Dashboard + Notion + Airtable + GitHub + Vercel. Avoid Bootstrap admin templates, dated ERP chrome, purple-gradient SaaS clichés, and cluttered widget walls.

Primary users: office staff on desktop browsers (~50 concurrent, ~200 works/year). Must remain usable on any browser/location. Learnability target: core flows in ~30 minutes.

---

## 1. PRODUCT INTENT

**Philosophy:** One Work → Everything Related to That Work in One Place.

CWMS is a lightweight construction-specific operational system (ERP-like for works, billing, expenditure, documents, reports) — not a full ERP, not a tendering suite, not accounting software.

**Design principles**
1. Work-centric information architecture — every child record hangs off a Work.
2. Clarity over cleverness — construction office language (RA Bill, chainage, Work Order, Gross Bills, Balance Work Value).
3. Automatic finance — GST, totals, deductions, balances, financial progress calculate live; never ask users to re-enter derived numbers.
4. Prevent avoidable errors — duplicate Work Order checks, date validation, edit locks, permanent-delete warnings, discard confirms.
5. Management visibility in seconds — KPIs, traffic lights, five simple alerts.
6. Administration is intentional — no vague Settings; explicit Masters, Users, Backup screens for Admin only.
7. Consistent financial language everywhere (lists, forms, dashboard, reports, work summary).

**Currency / locale cues:** Indian Rupees (₹), Financial Year April–March, professional civil-engineering office tone.

---

## 2. USERS & PERMISSIONS (INTERIM V1 MODEL)

| Role | Intent | UI behaviour |
|------|--------|--------------|
| Administrator | Integrity, users, masters, restore | Full access + Admin-only nav |
| Data Entry Operator | Daily create/update | Full operational mutation |
| Engineer | Status, schedule, documents, progress | Full operational mutation |
| Accounts | Bills, payments, expenses, financial reports | Full operational mutation |
| Viewer | Oversight / meetings | View only — hide or disable all mutate CTAs; tooltip “View only” |

Roles Operator/Engineer/Accounts share mutation rights; journeys differ by typical goals. Admin-only: Masters, Users, Restore.

**Typical session:** Login → Dashboard scan → deep work in Work Register / Billing / Documents → occasional Reports → Logout. Remote engineers open one Work Summary + documents. Managers (Viewer) stay on Dashboard + Reports.

Seeded demo accounts exist (usernames = role names) for training — optional subtle login footer note only; do not dominate the brand.

---

## 3. APPLICATION SHELL

Authenticated layout:
- **Left rail:** primary navigation
- **Top header:** CWMS wordmark, page title, global search, user name + role chip, Logout
- **Center:** module content (lists, forms, workspaces)
- **Bottom status bar:** user, role, online/cloud connected cue, optional “Last backup” for Admin

**Nav items (in order)**
1. Dashboard  
2. Work Register  
3. Billing  
4. Expenditure  
5. Documents  
6. Reports  
7. Masters (Admin only)  
8. Users (Admin only)  
9. Backup & Restore (Admin; restore Admin-only)  

Viewer sees same operational modules without mutate affordances; no Masters/Users/Restore.

**Density:** management-console / modern ERP-lite — dense but calm. Comfortable row height for numeric tables; generous form whitespace in multi-section editors. Desktop-first; tables may horizontal-scroll on narrow widths; no separate mobile UI project.

---

## 4. DESIGN SYSTEM (CREATE A COHESIVE PREMIUM SYSTEM)

Define design tokens for:
- Color (light professional theme preferred for office printing adjacency; optional refined dark secondary — do not force dark-first)
- Typography (expressive but readable; avoid Inter/Roboto/Arial defaults — choose a distinctive UI sans + clear tabular numerals for money)
- Spacing scale (4/8-based)
- Radius, borders, elevation (subtle — Stripe/Linear restraint, not heavy shadows)
- Iconography (consistent line icons; traffic lights as clear Green/Yellow/Red status dots)
- Component density variants: compact (tables), default (forms), comfortable (dashboard)

**Component kit to design**
Buttons (primary/secondary/ghost/destructive), inputs, selects, combobox (free text + existing options), radio, checkbox, date picker, badges/chips (status, role, payment), tabs, segment control, KPI cards, alert list rows, data tables (sortable headers, selection, pagination “Showing X–Y of Z”), filter bars, sticky form footers, modals/confirm dialogs, drawers (optional for filters on reports), toasts/banners, empty states, skeletons, progress bars (uploads), lock banners, password rules checklist, file upload dropzone, print preview chrome, nav + command-search overlay.

**Motion:** restrained — 150–250ms fades/slides for overlays; skeleton shimmer; button spinner on save; upload progress; no decorative noise.

**Accessibility:** WCAG-minded contrast; visible focus rings; keyboard Tab order through forms; screen-reader labels on icon buttons; don’t rely on color alone for traffic lights (include text/legend); Viewer disabled controls announced; confirm dialogs focus-trapped.

---

## 5. INFORMATION ARCHITECTURE & DATA DENSITY BY SCREEN

| Screen family | Density metaphor | Pattern |
|---------------|------------------|---------|
| Login | Focused auth card | Centered brand + form |
| Dashboard | Oversight cockpit | KPI row → alerts → traffic list → quick actions → recent |
| Work Register list | Spreadsheet / register | Toolbar + filters + dense table |
| Work form | Multi-tab editor | Tabbed workspace + sticky Save footer |
| Work Summary | Digital file home | Identity header + financial card + section switcher |
| Estimate / Schedule (in work) | Nested list-detail | Compact table + form |
| Documents | File explorer + register | Filters + table + upload dialogs |
| Billing list | CRM/register | Dense financial table |
| Bill form | Structured finance editor | Vertical sections A–F + live totals |
| Expenditure list/form | Expense console | Type toggle + sections |
| Reports home | Catalogue | Report cards/list |
| Report runner | BI filter + grid | Filter panel + results + export toolbar |
| Masters | Admin split pane | Left master types / right list+editor |
| Users | Admin table | CRUD table + password checklist |
| Backup | Ops console | Info + history table + destructive restore wizard |

---

## 6. SCREENS TO GENERATE (COMPLETE PRODUCT)

### 6.1 SCR-LOGIN
Full-viewport, no shell. Strong brand: **CWMS – Construction Work Management System**. Fields: Username, Password (show/hide), Remember Me, primary Login. Inline validation; in-card error banner for invalid credentials / inactive / service down. Loading disables button + spinner. Success → Dashboard.

### 6.2 SCR-DASH — Dashboard (post-login home)
Composition (top → bottom):
1. **KPI cards** (wrap gracefully): Total Works; status breakdown Planned / In Progress / Hold / Completed; Total Work Portion Value; Total GST; Total Work Value; Gross Bills Raised; Payments Received; Outstanding; Total Expenditure; Estimated Profit/Loss. Optional distinct project-name count.
2. **Alert panel** — always show all five with counts (including zero): Pending bills; Overdue/delayed schedule; Outstanding payments; Missing key documents; Works on Hold. Rows drill to filtered lists.
3. **Traffic light attention table:** Work Code, Work Name, Status, Indicator (Green/Yellow/Red with legend).
4. **Quick actions** (Full-access only; hide for Viewer): New Work, Billing, Expenditure, Documents, Reports, Backup.
5. **Recent works / activities** — open Work Summary on row click.

States: card skeletons; empty portfolio zeros + “No works yet” + New Work; per-widget error + Retry; positive “No alerts”.

### 6.3 SCR-WORK-LIST — Work Register
Toolbar: New Work | Edit | Delete | View | Export (+ always-visible search).  
Filters: search; Status (Planned/In Progress/Hold/Completed); Project; Client; Contractor; Category; date range; FY Apr–Mar; Apply/Clear.  
Table columns: Traffic Light, Work Code, Work Order No., Work Name, Client, Project, Status, Balance Work Value (sortable). Pagination. Row → View Summary; selection for Edit/Delete.  
Dialogs: delete confirm; delete blocked when children exist; edit-lock message.

### 6.4 SCR-WORK-FORM — New / Edit / View Work (heart of product)
Page title reflects mode. **Tab strip:**
1. General Information — Work Code (read-only auto `CWMS-YYYY-####`); Project combobox (type new OR pick existing); Work Name*; Category (masters); Client/Contractor free text; Work Order No.* / Date; Status; optional Client/Department Format.
2. Financial Details — GST Type radio (GST Extra / GST Included); Portion / GST% / GST Amount (computed) / Total / Balance / Financial Progress% (computed, read-only). Live recalculation. ₹ formatting.
3. Location — State, District, Taluka, Village, Existing/Design Chainage, Side (LHS/RHS/Both), Structure Type.
4. Schedule — Start, Scheduled Completion, Actual Completion, Physical Progress 0–100, Financial Progress read-only.
5. Documents — embedded mini list + upload entry points.
6. Summary — read-only review + financial card.

Footer sticky: Save | Save & New | Cancel | Print Work Summary (view). Dirty-tab indicators. Lock banner if another user editing. Default new status = Planned.

### 6.5 SCR-WORK-SUMMARY — Digital Work File Home (hero IA screen)
Read-only identity header (Code, Project, Name, Client, Contractor, WO No., Status, Traffic Light).  
**Financial Summary card:** Portion, GST, Total, Gross Bills Raised, Payments, Outstanding, Expenditure, Balance, Estimated P/L.  
Section switcher: Work Details | Estimate | Schedule | Documents | Billing | Expenditure | Reports.  
Actions: Edit Work | Print Work Summary | Back to Register. This screen must feel like opening a complete project file — calm, authoritative, one composition.

### 6.6 SCR-EST / SCR-SCH (work-context)
Estimate table: No., Date, Amount, Revised, Approved By, Document — Add/Edit/Delete/View/Open Doc.  
Schedule table: Activity, Start/Finish, Actual Start/Finish, Progress% — overdue row highlight. Empty CTAs when none.

### 6.7 SCR-DOC-LIST (+ work-context variant)
Toolbar: Upload | Add Multiple | Open | Download | Print | Delete.  
Filters: Work, Type, File Name, Document Number, date range.  
Columns: Work Code, Type, Doc No., Title, File Name, Upload Date, Uploaded By.  
Upload single dialog: Work, Type, Number, Title, Remarks, file picker.  
Multi-upload: Type + multi-file + per-file progress.  
Constraints in UI copy: PDF/images only; max 20 MB; delete is permanent (no recycle bin) — strong warning dialog “Delete Permanently”.

### 6.8 SCR-BILL-LIST / SCR-BILL-FORM / SCR-BILL-HISTORY
List: New/Edit/Delete/View/Print/Export; filters Work/Client/Status/Payment/FY; columns Work Code/Name, RA Bill No., System Bill No., Date, Bill Status, Net Amount, Payment Status.

**Bill form — vertical sections with sticky footer (critical density screen):**
- A Work Details (read-only autofill from selected work)
- B Bill Details — RA/Final; optional RA Bill No.; read-only System Bill Number (`BILL-YYYY-####`); dates; period
- C Amounts — Previous (info), Current Work Portion, GST, Gross (auto)
- D Deductions — standard fields (Security Deposit, TDS, GST TDS, Labour Cess, Royalty, Recovery) + **Other deductions table** (Name | Amount | Add/Remove lines); Total Deductions auto
- E Net — Gross − Deductions auto
- F Payment — Pending / Partially Received / Fully Received; date; amount received; UTR/Cheque; Bank; Remarks

Live recalc on change. Balance/progress elsewhere use **Gross Bills Raised**, never Net — UI should make Gross vs Net visually distinct.

Work Bill History table inside work context: RA, System No., Date, Gross, Deductions, Net, Payment.

### 6.9 SCR-EXP-LIST / SCR-EXP-FORM
List dense expense register with filters (Work, Vendor, Type Work-Specific/General, Head, Payment Mode, dates).  
Form: Expense Type radio toggles layout. Work-Specific shows work selector + identity. Sections for details, financials (excl GST, GST%, GST auto, Total auto), payment (Cash/Bank/Cheque/UPI), attachments (PDF/image ≤20MB), status Draft/Paid/Assigned/Cancelled.  
**Assign to Work** action for General expenses → dialog (100% to one work only — no multi-work split).

### 6.10 SCR-RPT-HOME + SCR-RPT-RUN
Home lists exactly nine reports as polished catalogue entries:
1. Work Register Report  
2. Billing Report  
3. Expenditure Report  
4. Financial Summary Report  
5. Work-wise Summary Report  
6. Pending Payment Report  
7. Document Register  
8. General Expense Report  
9. Dashboard Summary Report  

Shared Report Runner: filter panel (Project, Client, Contractor, Status, Work Code/Name, Date From/To, FY Apr–Mar + report-specific) → sortable results grid with totals row → toolbar Run | Print Preview | Print | Export PDF | Export Excel | Clear.  
Saved Filters: dropdown, Save, Rename, Set Default, Delete.  
Print Preview: default company name + default logo, report name, project if any, datetime, user, filters used, page X of Y. Work-wise Summary requires work selector and multi-section single-work layout.

### 6.11 SCR-SEARCH
Global search overlay from header: debounced results grouped (Works primary; Bills/Documents secondary); click navigates; empty/loading/no-match states.

### 6.12 SCR-BAK — Backup & Restore (Admin)
Info: automatic weekly backups; 30-day retention. History table: datetime, id, Automatic, Status, retention expiry. Restore Selected → **double confirmation** (overwrite warning + type CONFIRM / “I understand”). Blocking progress modal during restore. Failed rows visually distinct.

### 6.13 SCR-USR / SCR-CHG-PWD / SCR-MST
Users: Name, Login ID, Role (5), Mobile, Email, Active — New/Edit/Activate-Deactivate/Reset Password. Live password rules checklist: ≥8, upper+lower, number, symbol, avoid personal details.  
Masters split view for: Work Categories; Document Types; Deduction Heads; Expense Categories; Client/Department Formats. Add/Edit/Delete; block delete when in use. Seeded examples visible (Drain, Bridge, RE Wall…; Work Order, Estimate, Drawing…; Labour, Material, Fuel…).

### 6.14 Common dialogs
Discard unsaved; delete work/bill/expense/doc/master; cannot delete work with children; master in use; edit lock; assign expense; restore; save/delete filter.

---

## 7. VISUAL HIERARCHY & CTA RULES

**Primary CTAs (right/sticky footer or toolbar start):** Save, Login, Upload, Run Report, Restore (destructive primary after confirm).  
**Secondary:** Cancel, Export, Print, View.  
**Contextual/row:** Open, Download, Edit, Assign.  
**Destructive:** always confirm; permanent document delete uses strongest warning language.  
**Computed fields:** visually quieter (muted background / lock icon) vs editable inputs.  
**Money columns:** right-aligned tabular figures with ₹.  
**Status chips:** Planned (neutral), In Progress (info), Hold (warning), Completed (success). Payment: Pending / Partial / Fully Received.  
**Traffic lights:** never decorative — actionable attention system with accessible labels.

---

## 8. INTERACTION & STATE SYSTEM

- Loading: skeletons in content; shell stays usable  
- Empty: illustration/message + primary CTA if permitted  
- Error: banner + Retry; never blank whole shell  
- Dirty form navigate-away: discard confirm  
- Saving: disable primary + spinner (no double-submit)  
- Success: toast/banner  
- Locked edit: top banner naming condition  
- Viewer: mutate controls absent or disabled  
- Upload: per-file progress + batch summary; reject non-PDF/image and >20MB with clear reason  
- Network failure on save: no partial totals applied  

No custom app shortcut-key schemes required; rely on standard browser Tab/Enter.

---

## 9. KEY WORKFLOWS TO DESIGN FOR (HAPPY + ALTERNATES)

1. **Create Work end-to-end** — tabs → upload WO PDF → Summary → Save → land on Work Summary with auto Work Code. Alt: Save & New. Fail: duplicate WO No.  
2. **Multi-document upload** — drawings batch with partial failure summary.  
3. **Edit lock conflict** — second editor sees message; View still available.  
4. **RA Bill with flexible other deductions** — live Net; System Bill Number always assigned even if RA No. blank; work Balance uses Gross.  
5. **Partial payment** — Outstanding updates; Pending Payment report still lists remainder.  
6. **General expense later assigned 100% to one work.**  
7. **Engineer morning** — alerts/traffic lights → update schedule/progress → fix missing docs.  
8. **Viewer meeting** — Dashboard + read-only Work Summary + Work-wise Summary print preview; cannot edit.  
9. **Admin masters** — add category → immediately available on Work form.  
10. **Admin restore** — double confirm, blocking progress, audit-feeling seriousness.  
11. **Month-end reporting pack** — saved FY filters → PDF + Excel with default branding.

---

## 10. OUT OF SCOPE (DO NOT DESIGN)

Offline/sync UI • Settings/preferences module • Excel import • Document recycle bin • Custom company logo upload UI • Item-wise BOQ/MB billing • Multi-work expense split • Notification centre • Native mobile app • Inventory/HR/tender modules • Dark chaotic dashboards with 20+ widgets • Card-soup marketing layouts inside operational screens.

---

## 11. DELIVERABLE EXPECTATIONS FOR STITCH

Produce a cohesive product design, not isolated mockups:
1. Design system / tokens / component gallery  
2. Login  
3. Dashboard  
4. Work Register list  
5. New Work form (show key tabs, especially General + Financial + Summary)  
6. Work Summary (digital file home) — prioritize this as the signature screen  
7. Billing form (full sections A–F)  
8. Documents list + upload dialog  
9. Expenditure form (Work-Specific vs General)  
10. Reports home + Report Runner with print preview  
11. Masters admin  
12. Backup & Restore  
13. Viewer vs Full-access state variants on Dashboard and Work Summary  
14. Empty, loading, error, lock, and delete-confirm states for core flows  

Aesthetic goal: a calm, precise, modern construction operations product that feels as polished as Stripe Dashboard and as work-file-centric as Notion — uniquely CWMS, India office-ready, print/report-aware, financially trustworthy, and immediately understandable to engineers, accounts, and managers.
```

---

## Follow-up Commands for Stitch (Iteration)

**Model:** Thinking with 3.1 Pro for each command below. Use 3 Flash only for tiny visual tweaks after a screen is locked.

**Order:** 1 → 2 → 3 → 4 → 5 → 6, then run Cleanup if old and new screens are mixed.

### Command 1 — Global correction (run first)

```text
Keep the existing Industrial Precision visual system (Geist, navy left rail, hairline cards, ₹ tabular numbers, blue primary).

Fix ALL screens to frozen CWMS Version 1.0 scope. Do not invent modules.

Replace sidebar with EXACTLY:
Dashboard, Work Register, Billing, Expenditure, Documents, Reports, Masters (Admin), Users (Admin), Backup & Restore (Admin).

REMOVE: Materials, Vendors, Settings, “+ New Project”, notification centre, marketing footer Terms/Privacy, “Add Entry”, Department Hierarchy.

Roles: Administrator / Data Entry Operator / Engineer / Accounts = full access; Viewer = view only (hide mutate CTAs).

Philosophy: One Work → everything related in one place.
Currency ₹. FY April–March. Work Code format CWMS-YYYY-####.
```

### Command 2 — Dashboard fix

```text
Redesign Dashboard for CWMS V1.0.

KPI row: Total Works; Planned / In Progress / Hold / Completed; Work Portion Value; GST; Total Work Value; Gross Bills Raised; Payments Received; Outstanding; Total Expenditure; Estimated Profit/Loss.

Alert panel MUST show all 5 with counts (incl. 0): Pending bills; Overdue/delayed schedule; Outstanding payments; Missing key documents; Works on Hold. Rows drill to filtered lists.

Traffic light attention table: Work Code, Work Name, Status, Indicator = Green / Yellow / Red only (with legend). No free-text severity labels.

Quick actions (full-access only): New Work, Billing, Expenditure, Documents, Reports, Backup.
Add Recent Works. Viewer: no mutate quick actions.
Empty: zeros + “No works yet” + New Work.
```

### Command 3 — Work Summary (signature screen)

```text
Redesign Work Summary as the digital work-file home.

Header: Work Code, Project, Work Name, Client, Contractor, WO No., Status chip, traffic light.
Primary financial summary card: Portion, GST, Total, Gross Bills Raised, Payments, Outstanding, Expenditure, Balance Work Value, Estimated P/L.
Section switcher: Work Details | Estimate | Schedule | Documents | Billing | Expenditure | Reports.
Actions: Edit Work | Print Work Summary | Back to Register.

Remove blueprint/hero illustrations. Keep calm Stripe/Notion density. No invented modules.
```

### Command 4 — Complete RA Bill form

```text
Redesign New/Edit RA Bill with full sections A–F and sticky footer Save | Cancel | Print.

A Work Details (read-only autofill after work select)
B Bill Details: RA/Final; optional RA Bill No.; read-only System Bill Number BILL-YYYY-####; Bill Date; Period From/To
C Amounts: Previous (info); Current Work Portion; GST; Gross (auto)
D Deductions: Security Deposit, TDS, GST TDS, Labour Cess, Royalty, Recovery + Other deductions table (Name|Amount|+Add/Remove); Total Deductions auto
E Net = Gross − Deductions (auto)
F Payment: Pending / Partially Received / Fully Received; date; amount received; UTR/Cheque; Bank; Remarks

Live recalculation. Visually distinguish Gross vs Net. Balance elsewhere uses Gross Bills Raised, never Net.
```

### Command 5 — Missing screens

```text
Generate these missing CWMS V1.0 screens in the same Industrial Precision system:

1) Login — centered brand “CWMS – Construction Work Management System”; Username, Password (show/hide), Remember Me, Login; error banner states.
2) New/Edit Work — tabs: General | Financial (GST Extra/Included live calc) | Location | Schedule | Documents | Summary; sticky Save | Save & New | Cancel; Work Code read-only; Project combobox free-text+existing.
3) Report Runner — filter panel (Project, Client, Contractor, Status, Work Code/Name, Date, FY Apr–Mar, saved filters) + results grid + totals + Run | Print Preview | Print | Export PDF | Export Excel.
4) Users Admin — table Name/Login/Role/Mobile/Email/Active; password rules checklist ≥8 upper+lower+number+symbol.
5) Edit-lock banner + permanent document delete confirm + Viewer read-only variants of Dashboard and Work Summary.
```

### Command 6 — Nav/module cleanup on existing screens

```text
Update Work Register, Documents, Expenditure, Reports Catalog, Masters, and Backup screens:

- Correct sidebar (no Materials/Vendors/Settings/New Project).
- Documents: codes CWMS-YYYY-####; PDF/images only; max 20MB; actions Upload / Add Multiple / Open / Download / Print / Delete Permanently.
- Masters left list ONLY: Work Categories, Document Types, Deduction Heads, Expense Categories, Client/Department Formats.
- Backup: automatic weekly, 30-day retention; Admin restore with double confirmation; no recycle bin; remove manual backup if shown; Restore only on successful backups.
- Reports Catalog: keep the 9 report names; each card opens Report Runner, not “View History”.
- Work Register columns: Traffic Light, Work Code, WO No., Name, Client, Project, Status (Planned/In Progress/Hold/Completed), Balance Work Value; filters + pagination + Export.
```

---

## Cleanup Commands (Old + New Screens Mixed)

Stitch often **keeps old frames and adds new ones**, so the canvas mixes V1.0-correct screens with earlier invents (Materials, Vendors, Settings, New Project, incomplete RA Bill, etc.). Use these after Commands 1–6.

### What to do manually in Stitch (before/while prompting)

1. **Select only the latest correct frame** for each screen before asking for edits — do not multi-select old + new.
2. **Rename** winning frames clearly, e.g. `V1 Dashboard`, `V1 Work Summary`, `V1 RA Bill A-F`.
3. **Delete or archive** older duplicates once a V1 frame is accepted (Materials, Vendors, Settings, incomplete bill, blueprint Work Summary).
4. Prefer **Redesign** or “update this selected screen” over regenerating the whole product from scratch.
5. Export a fresh zip only after cleanup so review packages are not mixed.

### Command 7 — Deduplicate and lock V1 set

```text
This project has mixed OLD and NEW screens. Do not merge them.

Treat ONLY screens that follow this V1.0 navigation as canonical:
Dashboard, Work Register, Billing, Expenditure, Documents, Reports, Masters, Users, Backup & Restore.

Ignore / do not update any screen that still shows Materials, Vendors, Settings, “+ New Project”, Department Hierarchy, notification centre, marketing footer, or incomplete RA Bill placeholders.

For each canonical screen name, keep a single latest Industrial Precision version. If duplicates exist, regenerate ONE clean replacement labeled “CWMS V1 – [Screen Name]” and do not recreate the old invents.

Canonical screen list to keep (one each):
1. CWMS V1 – Login
2. CWMS V1 – Dashboard
3. CWMS V1 – Work Register
4. CWMS V1 – Work Form
5. CWMS V1 – Work Summary
6. CWMS V1 – New RA Bill (full A–F)
7. CWMS V1 – Documents
8. CWMS V1 – Expenditure List
9. CWMS V1 – New Expense
10. CWMS V1 – Reports Catalog
11. CWMS V1 – Report Runner
12. CWMS V1 – Masters
13. CWMS V1 – Users
14. CWMS V1 – Backup & Restore

Do not invent additional modules. Keep Industrial Precision design tokens.
```

### Command 8 — Per-screen replace (paste while ONE old/wrong frame is selected)

```text
Replace THIS selected screen only. Do not create a second copy on the canvas if avoidable — overwrite/upgrade this frame in place.

Apply CWMS V1.0 rules:
- Sidebar exactly: Dashboard, Work Register, Billing, Expenditure, Documents, Reports, Masters, Users, Backup & Restore
- Remove Materials, Vendors, Settings, New Project, Add Entry, notification clutter
- Keep Industrial Precision styling
- Match frozen CWMS content for this screen type only

After updating, title this frame: “CWMS V1 – [exact screen name]”
```

### Command 9 — Final consistency pass (after duplicates deleted)

```text
Audit the remaining CWMS V1–labeled screens only.

Enforce one shell everywhere: same navy rail, same nav order, same header (CWMS, page title, global search, user + role chip, Logout), same status bar cues.

Remove any leftover Materials / Vendors / Settings / New Project / Department Hierarchy / blueprint hero / incomplete “[omitted]” form sections.

Confirm Gross vs Net distinction on billing and Work Summary; Balance uses Gross Bills Raised.

Output nothing new except fixes to the existing V1 frames.
```

---

## Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-16 |
| Title | Stitch Design Prompt |
| Previous Document | `15-product-risks.md` |
| Location | `docs/16-stitch-design-prompt.md` |
| Amended | 2026-07-31 — added Follow-up Commands + Cleanup Commands for mixed old/new Stitch frames |

---

**End of Document 16 – Stitch Design Prompt**
