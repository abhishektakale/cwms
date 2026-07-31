# CWMS – Construction Work Management System  
## 14 – Open Questions

**Document Type:** Product Design Package – Open Questions Register  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–13 + discovery gaps  
**Depends On:** Documents 00–13 especially `13-assumptions.md`  
**Audience:** Product Owner (primary), BA, Engineering  

---

## 0. Purpose and Rules

### 0.1 Purpose

This register lists questions that remain ambiguous or need Product Owner confirmation before behaviour is treated as final law.

### 0.2 Rules

1. **Ask questions. Do not answer them in this document.**  
2. Closed questions are retained in Section 4 for traceability only.  
3. High-impact open assumptions from Document 13 are restated here as questions.  
4. Engineering may use Document 13 defaults temporarily, but PO answers here supersede those defaults.

### 0.3 Priority

| Priority | Meaning |
|----------|---------|
| **P0** | Affects core financials, security, or delete/restore integrity |
| **P1** | Affects alerts, UX defaults, or reporting interpretation |
| **P2** | Nice to harden before release; workaround exists |

---

## 1. Open Questions – P0 (Please Answer)

### OQ-14-001 — Estimated Profit/Loss formula
What should Estimated Profit/Loss equal at work and dashboard level?

- Gross Bills Raised − Expenditure?  
- Payments Received − Expenditure?  
- Net Bills − Expenditure?  
- Something else?  

### OQ-14-002 — Work delete with children
When a work has bills/documents/expenses/estimates/schedules, should Version 1.0:

- Always block delete?  
- Allow Administrator cascade delete?  
- Allow delete only after children are removed manually?  

### OQ-14-003 — Session timeout duration
What inactivity timeout should Version 1.0 use (Settings module is out of scope)?

- 15 minutes?  
- 30 minutes?  
- 60 minutes?  
- Other?  

### OQ-14-004 — Billing completed works
May users post new bills against a work in Status = Completed?

- Yes, with warning?  
- Yes, silently?  
- No, blocked?  

### OQ-14-005 — Payment due date
For Days Pending on Pending Payment Report, is **Bill Date** acceptable as the start of aging, or must Version 1.0 include a separate **Payment Due Date** field?

---

## 2. Open Questions – P1

### OQ-14-006 — Dashboard default scope
Should the Dashboard default to:

- All-time portfolio totals?  
- Current Financial Year (Apr–Mar) only?  
- User-selectable default?  

### OQ-14-007 — Missing key documents definition
Which document types make a work “missing key documents” for the alert?

- Work Order and Estimate only?  
- Work Order only?  
- Admin-defined key types?  
- Other list?  

Does Status = Planned raise this alert, or only In Progress / Hold / Completed?

### OQ-14-008 — Traffic light day thresholds
Confirm or replace the documentation defaults:

- Yellow when overdue or outstanding aging **> 30 days**?  
- Red when overdue **> 30 days** past due and/or outstanding **> 60 days**?  
- Different numbers?  

### OQ-14-009 — Multi-document upload typing
When uploading many files at once, must all files share one Document Type selected for the batch, or must each file allow its own type in Version 1.0?

### OQ-14-010 — Viewer report export
Under the interim permission model, may Viewer **export PDF/Excel** and print reports, or view on screen only?

### OQ-14-011 — Financial Summary date bases
For RPT-04 Financial Summary, how should filters apply?

- One FY/date filter for everything?  
- Work values by work-order date, bills by bill date, expenses by expense date (as assumed)?  
- Other rule?  

### OQ-14-012 — Alert display when count is zero
Should the five dashboard alerts always show (including 0), or hide alerts with zero count?

### OQ-14-013 — Default work status on create
Should New Work default Status be **Planned** or **In Progress**?

### OQ-14-014 — GST type change after bills exist
After bills are posted, may users still change Work GST Type / header financials?

- Yes, with warning?  
- No, locked after first bill?  

### OQ-14-015 — Net bill negative
If deductions exceed gross, should save be:

- Allowed with warning?  
- Blocked?  

---

## 3. Open Questions – P2

### OQ-14-016 — Remember Me duration
How long should Remember Me keep a browser signed in?

### OQ-14-017 — Demo accounts in production
Should demo accounts remain enabled in production, be force-password-changed on first login, or be disabled outside training environments?

### OQ-14-018 — Login rate limiting
Must Version 1.0 lock or throttle after N failed login attempts? If yes, what N and what lock duration?

### OQ-14-019 — Initial backup on deploy
Must the system take a backup immediately on first deployment, or is the first weekly backup enough?

### OQ-14-020 — Image formats
Beyond JPG/JPEG/PNG, which image types must be accepted in Version 1.0 (e.g., WEBP, HEIC, GIF, TIFF)?

### OQ-14-021 — Work Code year basis
Should `CWMS-YYYY-####` use calendar year or Financial Year (Apr–Mar)?

### OQ-14-022 — RA Bill No. uniqueness scope
Must RA Bill No. be unique only within a work, or unique across the whole system?

### OQ-14-023 — Master rename cascade
When an Admin renames a master value, should historical records keep the old saved text, or update everywhere?

### OQ-14-024 — Same user multiple tabs
If the same user opens the same work for edit in two browser tabs, should the second tab be locked out, or allowed?

### OQ-14-025 — Default company name/logo content
What exact default company/office name and logo asset should ship in Version 1.0 report headers?

### OQ-14-026 — Global search scope
Must global search return only Works, or also Bills, Documents, and Expenses in Version 1.0?

### OQ-14-027 — Status workflow hardness
Should Version 1.0 allow any status transition freely (with warnings), or enforce a stricter path (e.g., cannot jump Planned → Completed)?

### OQ-14-028 — Expense cancel terminal state
Can a Cancelled expense be reactivated, or is Cancelled final?

### OQ-14-029 — Overpayment display
If Amount Received > Net Bill, should the UI show a credit/negative outstanding on the bill, or clamp to zero everywhere?

### OQ-14-030 — Backup history visibility
Is Backup history Admin-only, or may other roles see history without restore rights?

---

## 4. Closed Questions (Traceability)

These were answered during discovery / Product Owner sessions and are **not open**.

| Topic | Resolution |
|-------|------------|
| Desktop vs web | Web application |
| Offline | Online-only |
| Sync module | Removed from v1 |
| Hosting | Public cloud |
| Access location/browser | Any place, any browser |
| Concurrent users | ~50 initially |
| Document storage | Cloud/server-managed; copy uploads |
| Backup who/frequency/retention | System automatic; weekly; 30 days |
| Restore who | Admin only |
| Roles | Admin, Data Entry Operator, Engineer, Accounts, Viewer |
| Permissions interim | Viewer view-only; others full; Admin masters/users/restore |
| Alerts | Five listed + traffic lights |
| Masters maintainability | Admin add/edit/delete on separate page |
| Settings module | Excluded from v1 |
| Work statuses | Planned / In Progress / Hold / Completed |
| Parties | Free text |
| Projects | Light free text + existing dropdown |
| Bill identity | RA No. optional + system bill number |
| Edit conflict | Lock + message |
| Document types/size/delete | PDF/images; 20 MB; permanent with warning; no recycle bin |
| Branding | Defaults in v1; upload v2 |
| FY | Apr–Mar |
| GST % | Free number |
| Theme | UX designer |
| Excel import | v2 |
| Balance/progress basis | Gross Bills Raised |
| Demo credentials | Role usernames / Password@123 |
| Password rules | 8+; upper/lower; number; symbol; no personal details |
| Remember Me | Required (duration still open as OQ-14-016) |
| Custom keyboard shortcuts | Not required for v1 web app |

---

## 5. Question Response Template (For Product Owner)

Copy and fill:

```text
OQ-14-001: 
OQ-14-002: 
OQ-14-003: 
OQ-14-004: 
OQ-14-005: 
OQ-14-006: 
OQ-14-007: 
OQ-14-008: 
OQ-14-009: 
OQ-14-010: 
OQ-14-011: 
OQ-14-012: 
OQ-14-013: 
OQ-14-014: 
OQ-14-015: 
OQ-14-016: 
OQ-14-017: 
OQ-14-018: 
OQ-14-019: 
OQ-14-020: 
OQ-14-021: 
OQ-14-022: 
OQ-14-023: 
OQ-14-024: 
OQ-14-025: 
OQ-14-026: 
OQ-14-027: 
OQ-14-028: 
OQ-14-029: 
OQ-14-030: 
```

---

## 6. Handling Answers

When answers are provided:

1. Update this register (move to Closed).  
2. Update Document 13 assumption statuses.  
3. Patch Documents 02 / 06 / 08 / 10 / 11 if behaviour changes.  
4. Do not leave conflicting text across the package.

---

## 7. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Questions reviewed ☐ Answers provided | |
| Senior Business Analyst | ☐ Register complete | |

---

## 8. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-14 |
| Title | Open Questions |
| Next Document | `15-product-risks.md` |

---

**End of Document 14 – Open Questions**
