# CWMS – Construction Work Management System  
## 10 – Reporting Catalogue

**Document Type:** Product Design Package – Reporting Catalogue  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–09 + `dialog.md`  
**Depends On:** Documents 00–09 especially Business Rules & PRD  
**Audience:** Product, BA, Engineering, QA, Operations  

---

## 0. Introduction

### 0.1 Purpose

This catalogue specifies every Version 1.0 report:

- Purpose  
- Filters  
- Columns  
- Grouping  
- Sorting  
- Calculations  
- Totals  
- Export  
- Print layout  

### 0.2 Common Capabilities (All Reports)

| Capability | Version 1.0 rule |
|------------|------------------|
| Print | Yes |
| Print Preview | Yes |
| Export PDF | Yes |
| Export Excel | Yes |
| Search within results | Yes |
| Sort | Yes (column sort where tabular) |
| Filter | Yes |
| Date range | Yes (where applicable) |
| Financial Year | Yes — **April–March** |
| Saved Filters | Yes — save / rename / set default / delete (per user) |
| Excel data import | **No** (Version 2.0) |

### 0.3 Common Filters (Standard Set)

Unless a report notes otherwise, these filters are available:

| Filter | Type |
|--------|------|
| Project | Text / select distinct project names |
| Client | Text / contains |
| Contractor | Text / contains |
| Work Status | Planned / In Progress / Hold / Completed |
| Work Code | Text |
| Work Name | Text / contains |
| Date From | Date |
| Date To | Date |
| Financial Year | Apr–Mar period selector |

**Date field mapped per report** (bill date, expense date, work order date, upload date) is defined in each report section.

### 0.4 Common Print / PDF Layout

Every printed/PDF page MUST include:

| Header/Footer element | Version 1.0 source |
|-----------------------|--------------------|
| Company/Office Name | **System default** (upload in Version 2.0) |
| Logo | **System default** |
| Report Name | Fixed per report |
| Project Name | When filter/single-work context applies |
| Date & Time generated | System clock |
| Page Number | Page X of Y |
| User Name | Signed-in user |
| Filters Used | Summary of applied filters |

Body: tabular or sectioned content as specified.  
Empty results: header/footer still print; body shows “No records found for the selected filters.”

### 0.5 Common Excel Export Layout

- Row 1: Report name  
- Row 2: Generated date/time, user  
- Row 3: Filters summary  
- Blank row  
- Column headers  
- Data rows  
- Totals row(s) where specified  
- Currency values as numbers (formatted in Excel as appropriate)  
- No macros required  

### 0.6 Financial Consistency

Any report showing Balance Work Value or Financial Progress MUST use:

- **Gross Bills Raised** basis (not Net, not Payments)  
per Document 06.

### 0.7 Report Index

| ID | Report |
|----|--------|
| RPT-01 | Work Register Report |
| RPT-02 | Billing Report |
| RPT-03 | Expenditure Report |
| RPT-04 | Financial Summary Report |
| RPT-05 | Work-wise Summary Report |
| RPT-06 | Pending Payment Report |
| RPT-07 | Document Register |
| RPT-08 | General Expense Report |
| RPT-09 | Dashboard Summary Report |

---

## 1. RPT-01 – Work Register Report

### 1.1 Purpose

Provide an official register of works with financial values and status for portfolio monitoring and record keeping.

### 1.2 Filters

Standard set, plus:

| Filter | Notes |
|--------|-------|
| Work Category | From masters |
| Traffic Light | Green / Yellow / Red (optional) |
| Date field basis | **Work Order Date** (default); optional Start Date |

### 1.3 Columns

| Column | Source |
|--------|--------|
| Work Code | Work |
| Work Order No. | Work |
| Work Order Date | Work |
| Work Name | Work |
| Project | Work |
| Client | Work |
| Contractor | Work |
| Work Category | Work |
| Work Portion Value | Work |
| GST Amount | Work |
| Total Work Value | Work |
| Gross Bills Raised | Derived |
| Balance Work Value | Derived |
| Financial Progress % | Derived |
| Status | Work |
| Traffic Light | Derived |

### 1.4 Grouping

- Default: none (flat list)  
- Optional group by: Project, Client, Status, or Category  

### 1.5 Sorting

Default: Work Code ascending.  
User may sort by Work Order Date, Work Name, Balance, Status, Total Work Value.

### 1.6 Calculations

- Balance Work Value = Total Work Value − Gross Bills Raised  
- Financial Progress % = (Gross Bills Raised ÷ Total Work Value) × 100 (0 if Total = 0)  
- Gross Bills Raised = Σ bill gross for work  

### 1.7 Totals

Footer totals for:

- Work Portion Value  
- GST Amount  
- Total Work Value  
- Gross Bills Raised  
- Balance Work Value  
- Count of works  

### 1.8 Export

PDF + Excel of current filtered result; Excel includes totals row.

### 1.9 Print Layout

Landscape recommended for column width.  
Header/footer per §0.4.  
Grouped mode prints group headers with subtotals.

---

## 2. RPT-02 – Billing Report

### 2.1 Purpose

List RA/Final bills with deductions, net amounts, and payment status for accounts review.

### 2.2 Filters

Standard set (Work-linked attributes), plus:

| Filter | Notes |
|--------|-------|
| Bill Status | If used |
| Payment Status | Pending / Partially Received / Fully Received |
| Bill Type | RA Bill / Final Bill |
| Date field basis | **Bill Date** |
| System Bill Number | Search |
| RA Bill No. | Search |

### 2.3 Columns

| Column | Source |
|--------|--------|
| Work Code | Work |
| Work Name | Work |
| Client | Work |
| System Bill Number | Bill |
| RA Bill No. | Bill |
| Bill Type | Bill |
| Bill Date | Bill |
| Period From / To | Bill |
| Gross Bill Amount | Bill |
| Total Deductions | Bill |
| Net Bill Amount | Bill |
| Amount Received | Bill |
| Outstanding Amount | Net − Received (display rules per Doc 06) |
| Payment Status | Bill |

### 2.4 Grouping

- Optional: by Work, Client, Payment Status, Month of Bill Date  

### 2.5 Sorting

Default: Bill Date descending.  
Sortable: Net, Outstanding, Work Code, Payment Status.

### 2.6 Calculations

- Outstanding Amount per bill = Net − Amount Received (clamp/display per BR-FIN-12A)  
- Group/report totals sum Gross, Deductions, Net, Received, Outstanding  

### 2.7 Totals

- Count of bills  
- Σ Gross Bill Amount  
- Σ Total Deductions  
- Σ Net Bill Amount  
- Σ Amount Received  
- Σ Outstanding Amount  

### 2.8 Export

PDF + Excel.

### 2.9 Print Layout

Landscape.  
Header/footer §0.4.  
Payment Status may be emphasized in print styling (UX choice).

---

## 3. RPT-03 – Expenditure Report

### 3.1 Purpose

Show expenses across works (and optionally general) for cost control and audit.

### 3.2 Filters

| Filter | Notes |
|--------|-------|
| Standard work filters | When work-linked |
| Expense Type | Work-Specific / General / All |
| Vendor | Contains |
| Expense Head | Masters |
| Payment Mode | Cash / Bank Transfer / Cheque / UPI |
| Status | Draft / Paid / Assigned to Work / Cancelled |
| Date field basis | **Expense Date** |

### 3.3 Columns

| Column | Source |
|--------|--------|
| Expense Date | Expense |
| Expense Code (if any) | Expense |
| Work Code | Work or blank |
| Work Name | Work or blank |
| Expense Type | Expense |
| Expense Head | Expense |
| Vendor | Expense |
| Description | Expense |
| Expense Value (excl. GST) | Expense |
| GST Amount | Expense |
| Total Expense | Expense |
| Payment Mode | Expense |
| Payment Reference | Expense |
| Status | Expense |

### 3.4 Grouping

- Optional: Work, Expense Head, Vendor, Month, Expense Type  

### 3.5 Sorting

Default: Expense Date descending.

### 3.6 Calculations

- Line Total = Value + GST  
- Totals exclude Cancelled; Draft excluded from financial totals (per BR-EXP-07)  
- When Status filter includes Draft/Cancelled, those rows MAY still list but totals footnote which statuses are summed  

**Binding for default totals:** Sum Paid + Assigned to Work only.

### 3.7 Totals

- Count of expenses (in total set)  
- Σ Expense Value  
- Σ GST  
- Σ Total Expense (qualifying statuses)

### 3.8 Export

PDF + Excel.

### 3.9 Print Layout

Portrait or landscape; header/footer §0.4.

---

## 4. RPT-04 – Financial Summary Report

### 4.1 Purpose

Management-level financial snapshot across the filtered portfolio.

### 4.2 Filters

Standard set; Date basis typically Work Order Date or include-all with FY on bill/expense dates as dual scope.

**Assumption RPT-04-A:**  
- Work value metrics filtered by Work Order Date / FY membership of works  
- Bills Raised / Payments filtered by Bill Date in range/FY  
- Expenditure filtered by Expense Date in range/FY  
Filter panel MUST state which date applies to which metric, or use a single “As of / FY” portfolio mode.

**Preferred Version 1.0 mode:** Financial Year + optional Project/Client/Status filters; metrics computed for works in filter and their bills/expenses in same FY (bills/expenses outside FY excluded from flow metrics; work values for works existing in FY included). Document exact algorithm in implementation notes consistently with this catalogue.

### 4.3 Columns / Layout (Sectioned, not only grid)

Report body sections:

1. **Work Value Summary**  
   - Total Work Portion Value  
   - Total GST  
   - Total Work Value  
2. **Billing Summary**  
   - Total Gross Bills Raised  
   - Total Net Bills  
   - Total Payments Received  
   - Total Outstanding  
3. **Expenditure Summary**  
   - Total Expenditure (qualifying)  
   - Work-Specific vs Assigned General breakdown (optional)  
4. **Result**  
   - Estimated Profit/Loss = Gross Bills Raised − Total Expenditure (for filtered set)

Optional supporting table: top works by outstanding or by expenditure.

### 4.4 Grouping

- Optional breakdown table by Project or Client with same metric columns  

### 4.5 Sorting

- Breakdown table: by Total Work Value or Outstanding descending  

### 4.6 Calculations

Per Document 06 rollups at portfolio filter scope.

### 4.7 Totals

Section totals as listed in §4.3 (the report is primarily totals).

### 4.8 Export

PDF (sectioned) + Excel (metrics as key-value sheet and optional breakdown sheet).

### 4.9 Print Layout

Portrait.  
Clear section headings.  
Header/footer §0.4 with FY prominently shown.

---

## 5. RPT-05 – Work-wise Summary Report

### 5.1 Purpose

One-page (or short multi-page) management summary for a **single work** for review meetings.

### 5.2 Filters

| Filter | Notes |
|--------|-------|
| Work | **Required** (Work Code/Name selector) |
| Other standard filters | Not primary; work selection dominates |

### 5.3 Content Sections / Columns

**A. Work Details**  
Work Code, Work Order No./Date, Name, Project, Client, Contractor, Category, Status, Location/Chainage/Side/Structure, Traffic Light  

**B. Financial Details**  
Work Portion Value, GST %, GST Amount, Total Work Value, Gross Bills Raised, Payments Received, Outstanding, Balance Work Value, Financial Progress %, Total Expenditure, Estimated Profit/Loss  

**C. Bill Summary Table**  
RA Bill No., System Bill No., Date, Gross, Deductions, Net, Received, Payment Status  

**D. Expenditure Summary Table**  
Date, Head, Vendor, Total, Status  

**E. Document Count**  
Count by Document Type; total documents  

**F. Schedule Details**  
Work-level dates + activity table (Activity, Start, Finish, Actuals, Progress)  

### 5.4 Grouping

- N/A (single work); bill/expense tables flat  

### 5.5 Sorting

- Bills by Bill Date ascending  
- Expenses by Expense Date ascending  
- Activities by Start Date ascending  

### 5.6 Calculations

Same as Work Summary card + child sums for listed tables.

### 5.7 Totals

- Bills table: Σ Gross, Σ Deduction, Σ Net, Σ Received  
- Expenses table: Σ Total  
- Document total count  

### 5.8 Export

PDF (primary for meetings) + Excel (multi-section sheets or stacked tables).

### 5.9 Print Layout

Portrait.  
Section A/B on first page when possible.  
Header/footer §0.4 including Work Code and Work Name as project/context line.

---

## 6. RPT-06 – Pending Payment Report

### 6.1 Purpose

Identify bills with outstanding amounts for follow-up and cash collection.

### 6.2 Filters

| Filter | Notes |
|--------|-------|
| Standard work filters | Yes |
| Payment Status | Defaults to Pending + Partially Received |
| Min Days Pending | Optional number |
| Min Outstanding Amount | Optional |
| Date field basis | **Bill Date** |

### 6.3 Columns

| Column | Source |
|--------|--------|
| Work Code | Work |
| Work Name | Work |
| Client | Work |
| System Bill Number | Bill |
| RA Bill No. / Bill No. | Bill |
| Bill Date | Bill |
| Net Bill Amount | Bill |
| Amount Received | Bill |
| Outstanding Amount | Calculated |
| Payment Status | Bill |
| Days Pending | Current Date − Bill Date (≥ 0) |

### 6.4 Grouping

- Optional: Client, Work, Days Pending bucket (0–30, 31–60, 61+)  

### 6.5 Sorting

Default: Days Pending descending, then Outstanding descending.

### 6.6 Calculations

- Outstanding = Net − Received (display per Doc 06)  
- Days Pending = max(Today − Bill Date, 0)  
- Include only rows with Outstanding > 0 (default)

### 6.7 Totals

- Count of pending bills  
- Σ Net  
- Σ Received  
- Σ Outstanding  

### 6.8 Export

PDF + Excel.

### 6.9 Print Layout

Portrait or landscape.  
Header/footer §0.4.  
Aging buckets emphasized if grouped.

---

## 7. RPT-07 – Document Register

### 7.1 Purpose

Catalogue uploaded documents for audit, retrieval, and completeness checks.

### 7.2 Filters

| Filter | Notes |
|--------|-------|
| Standard work filters | Yes |
| Document Type | Masters |
| Document Number | Contains |
| File Name / Title | Contains |
| Uploaded By | User |
| Date field basis | **Upload Date** |

### 7.3 Columns

| Column | Source |
|--------|--------|
| Work Code | Work |
| Work Name | Work |
| Document Type | Document |
| Document Number | Document |
| Document Title | Document |
| File Name | Document |
| File Type | Document |
| Upload Date | Document |
| Uploaded By | User |
| Remarks | Document |

### 7.4 Grouping

- Optional: Work, Document Type  

### 7.5 Sorting

Default: Upload Date descending.

### 7.6 Calculations

- Count of documents  
- Optional counts per type in group footers  

### 7.7 Totals

- Total document count for filter  

### 7.8 Export

PDF + Excel (paths/URLs not required; metadata only).

### 7.9 Print Layout

Portrait.  
Header/footer §0.4.

### 7.10 Related: Missing Document view

When opened from Dashboard **Missing key documents** alert, apply preset filter logic from BR-STAT-07A (works missing Work Order and/or Estimate documents). May be a preset saved filter or linked mode of this report / work list.

---

## 8. RPT-08 – General Expense Report

### 8.1 Purpose

Track expenses not initially tied to a work and their assignment status.

### 8.2 Filters

| Filter | Notes |
|--------|-------|
| Date From/To | Expense Date |
| FY | Apr–Mar |
| Expense Head | Masters |
| Vendor | Contains |
| Assigned to Work | Yes / No / All |
| Status | Draft / Paid / Assigned / Cancelled |
| Work (if assigned) | Optional |

### 8.3 Columns

| Column | Source |
|--------|--------|
| Expense Date | Expense |
| Expense Head | Expense |
| Vendor | Expense |
| Description | Expense |
| Expense Value | Expense |
| GST | Expense |
| Total | Expense |
| Status | Expense |
| Assigned to Work (Yes/No) | Derived |
| Work Code | If assigned |
| Work Name | If assigned |

### 8.4 Grouping

- Optional: Assigned Yes/No, Expense Head, Month  

### 8.5 Sorting

Default: Expense Date descending.

### 8.6 Calculations

- Assigned Yes if Work reference present  
- Totals for qualifying statuses (default Paid + Assigned)  

### 8.7 Totals

- Count  
- Σ Total for unassigned qualifying  
- Σ Total for assigned qualifying  
- Grand Σ Total  

### 8.8 Export

PDF + Excel.

### 8.9 Print Layout

Portrait.  
Header/footer §0.4.

---

## 9. RPT-09 – Dashboard Summary Report

### 9.1 Purpose

Printable/exportable management snapshot corresponding to Dashboard KPIs and alert counts for meetings.

### 9.2 Filters

| Filter | Notes |
|--------|-------|
| Financial Year | Primary |
| Project | Optional |
| Client | Optional |
| Work Status | Optional |

### 9.3 Content (KPI Blocks)

| Metric | Definition |
|--------|------------|
| Total Works | Count |
| Planned Works | Count Status=Planned |
| In Progress Works | Count |
| Hold Works | Count |
| Completed Works | Count |
| Total Projects | Distinct project names |
| Total Work Portion Value | Sum |
| Total GST | Sum |
| Total Work Value | Sum |
| Gross Bills Raised | Sum |
| Payments Received | Sum |
| Outstanding | Sum |
| Total Expenditure | Sum qualifying |
| Estimated Profit/Loss | Gross Bills − Expenditure |
| Alert: Pending bills | Count |
| Alert: Overdue/delayed schedule | Count |
| Alert: Outstanding payments | Count |
| Alert: Missing key documents | Count |
| Alert: Works on Hold | Count |
| Traffic light counts | Green / Yellow / Red counts |

### 9.4 Grouping

- None required; optional Project breakdown appendix  

### 9.5 Sorting

- N/A for KPI blocks; breakdown by Project name ascending  

### 9.6 Calculations

Per Documents 06 and Dashboard definitions.

### 9.7 Totals

The report is a totals dashboard; appendix table has per-project subtotals if included.

### 9.8 Export

PDF (primary) + Excel (KPI key-value list).

### 9.9 Print Layout

Portrait, single page preferred for KPI blocks.  
Header/footer §0.4 with “Dashboard Summary” title and FY.

---

## 10. Saved Report Filters (Cross-Cutting)

### 10.1 Purpose

Let users reuse frequent filter combinations in one click.

### 10.2 Functions

| Function | Behaviour |
|----------|-----------|
| Save Current Filter | Name + store filter payload for current report + user |
| Apply Saved Filter | Load and apply; run/refresh results |
| Rename | Change display name |
| Set as Default | One default per report per user; opens with these filters |
| Delete | Remove saved filter |

### 10.3 Example Saved Filters (Seed Suggestions, Not Mandatory)

- Current Financial Year  
- Previous Financial Year  
- Active / In Progress Works  
- Completed Works  
- Pending Bills  
- Pending Payments  
- General Expenses  
- Works on Hold  

### 10.4 Scope

- Per user (not global) in Version 1.0  
- No Excel import of filter definitions  

---

## 11. Export & Print Behaviour Matrix

| Report | PDF | Excel | Print Preview | Typical Orientation |
|--------|-----|-------|---------------|---------------------|
| RPT-01 Work Register | Y | Y | Y | Landscape |
| RPT-02 Billing | Y | Y | Y | Landscape |
| RPT-03 Expenditure | Y | Y | Y | Landscape |
| RPT-04 Financial Summary | Y | Y | Y | Portrait |
| RPT-05 Work-wise Summary | Y | Y | Y | Portrait |
| RPT-06 Pending Payment | Y | Y | Y | Portrait/Landscape |
| RPT-07 Document Register | Y | Y | Y | Portrait |
| RPT-08 General Expense | Y | Y | Y | Portrait |
| RPT-09 Dashboard Summary | Y | Y | Y | Portrait |

---

## 12. Permissions

| Role | Run / Preview / Print / Export |
|------|--------------------------------|
| Administrator | Yes |
| Data Entry Operator | Yes |
| Engineer | Yes |
| Accounts | Yes |
| Viewer | Yes (read-only; no data mutation) |

---

## 13. Non-Functional Expectations (Product Level)

- Reports must complete for ~200 works/year scale and multi-year history with reasonable filters  
- Timeouts must show error, not corrupt downloads  
- Numbers must match on-screen Work Summary / Dashboard for same filter scope  

---

## 14. Out of Scope (Version 1.0 Reporting)

- Scheduled emailed reports  
- Custom uploaded company logo/name  
- Excel data import  
- Pixel-perfect statutory tax forms beyond operational registers  
- Gantt prints  

---

## 15. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Senior Business Analyst | ☐ Catalogue complete | |
| Accounts stakeholder (optional) | ☐ Billing/pending columns sufficient | |

---

## 16. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-10 |
| Title | Reporting Catalogue |
| Next Document | `11-acceptance-test-specification.md` |

---

**End of Document 10 – Reporting Catalogue**
