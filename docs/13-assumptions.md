# CWMS – Construction Work Management System  
## 13 – Assumptions

**Document Type:** Product Design Package – Assumptions Register  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–12 + `dialog.md` + Product Owner decisions  
**Depends On:** Entire design package  
**Audience:** Product Owner, BA, Engineering, QA  

---

## 0. Purpose and Rules

### 0.1 Purpose

This register lists **assumptions** used to complete the Version 1.0 design package where discovery or Product Owner decisions did not fully specify behaviour.

### 0.2 Rules

1. **Never silently invent behaviour in implementation.** If a behaviour is only an assumption here, confirm with the Product Owner before treating it as frozen law—or implement exactly as assumed and call it out in UAT.  
2. **Product Owner decisions are not assumptions.** They are recorded in Section 1 as **Confirmed Decisions**.  
3. **Assumptions remain visible** until explicitly confirmed, replaced, or rejected by the Product Owner.  
4. If an assumption conflicts with a later PO decision, the **PO decision wins** and this register must be updated.

### 0.3 Status Values

| Status | Meaning |
|--------|---------|
| **Confirmed** | Product Owner stated it (not an assumption) |
| **Open assumption** | Used by documentation; needs PO confirmation if disputed |
| **Implementation default** | Safe default for build; changeable without major redesign if PO amends |

---

## 1. Confirmed Decisions (Not Assumptions)

These are binding Product Owner / discovery freeze items. Listed so they are not mistaken for guesses.

| ID | Decision |
|----|----------|
| DEC-01 | Product is a **web application** |
| DEC-02 | **Online-only**; no offline mode |
| DEC-03 | **No Synchronization** module in Version 1.0 |
| DEC-04 | Hosting: **public cloud** |
| DEC-05 | Access from **any place** on **any browser** |
| DEC-06 | ~**50** concurrent users initially |
| DEC-07 | Documents: **cloud/server-managed only**; **copy** into CWMS storage (S3-like) |
| DEC-08 | Backup: **system automatic**, **weekly**, retain **30 days** |
| DEC-09 | Restore: **Administrator only** |
| DEC-10 | Roles: Administrator, Data Entry Operator, Engineer, Accounts, Viewer |
| DEC-11 | Permissions interim: Viewer view-only; other four full access; Admin-only masters/users/restore |
| DEC-12 | Traffic lights + five simple dashboard alerts |
| DEC-13 | Masters lists Admin **add/edit/delete** on a **separate page** |
| DEC-14 | Vague **Settings module excluded** from Version 1.0 |
| DEC-15 | Work statuses: Planned / In Progress / Hold / Completed |
| DEC-16 | Client / Contractor / Vendor: **free text** |
| DEC-17 | Projects: **light** — free text + dropdown of existing names |
| DEC-18 | Bill: user RA No. when available + **system bill number** |
| DEC-19 | Concurrent work edit: **lock + message** |
| DEC-20 | Documents: **PDF/images only**; **20 MB**; **permanent delete with warning**; no recycle bin |
| DEC-21 | Report branding: **defaults** in v1; upload in v2 |
| DEC-22 | FY: **April–March** |
| DEC-23 | GST %: **free number** |
| DEC-24 | Theme: **UI/UX designer** decides |
| DEC-25 | Excel **import → v2**; Excel **export in v1** |
| DEC-26 | Balance & Financial Progress based on **Gross Bills Raised** |
| DEC-27 | Demo usernames = role names; password **Password@123** |
| DEC-28 | Password rules: ≥8; upper+lower; number; symbol; avoid personal details |
| DEC-29 | Remember Me required |
| DEC-30 | Currency examples and office context: Indian construction / ₹ presentation from discovery |

---

## 2. Platform & Non-Functional Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-PLT-01 | “Any browser” is validated in practice against major evergreen browsers; obscure browsers may have degraded layout | Implementation default | Expand QA matrix |
| A-PLT-02 | Desktop browser is the primary UX; mobile browser is usable for view/light tasks without a separate mobile UI project | Open assumption | Need responsive redesign effort |
| A-PLT-03 | ~200 works/year remains the sizing basis for acceptance | Confirmed (discovery) | Re-performance test |
| A-PLT-04 | Multi-year history remains online in the same system (no forced archive in v1) | Open assumption | Need archive module |
| A-PLT-05 | Public cloud region/residency defaults are acceptable to the organisation until specified | Open assumption | Hosting constraint change |
| A-PLT-06 | S3-compatible object storage satisfies “CWMS file server” intent | Confirmed intent / impl choice | Swap storage product |

---

## 3. Authentication & Security Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-SEC-01 / FS-AUTH-01 | Session continues after user changes own password (no forced re-login) | Open assumption | Force re-login after change |
| A-SEC-02 / BR-SEC-06A | Default inactivity timeout = **30 minutes** (no Settings UI in v1) | Implementation default | Change default timeout |
| A-SEC-03 | “Avoid personal details” checks name, username, and obvious phone fragments when detectable; not an exhaustive identity graph | Implementation default | Stricter/weaker policy |
| A-SEC-04 | No mandatory login lockout/rate-limit in v1 beyond rejecting bad passwords | Open assumption | Add rate limiting in 1.0.x/1.1 |
| A-SEC-05 | Demo accounts remain enabled until Admin changes/disables them | Open assumption | Auto-disable demos in production |
| A-SEC-06 | Remember Me duration follows common web persistent-session practice unless PO sets days | Open assumption | Fix exact duration |

---

## 4. Dashboard Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-DASH-01 | Dashboard defaults to **portfolio-wide totals** (not only current FY) unless user filters | Open assumption | Default to current FY |
| FS-DASH-01 | All five alert types always visible including zero counts | Open assumption | Hide zero alerts |
| A-DASH-02 | “Active works” KPI maps primarily to Status = In Progress (Planned/Hold shown separately) | Open assumption | Different KPI mapping |
| A-DASH-03 | Profit/Loss on dashboard uses same Estimated formula as work level at portfolio scope | Open assumption | Different management formula |

---

## 5. Work Register Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-WORK-01 | Delete work is **prevented** when any children exist (no cascade delete in v1) | Open assumption | Allow Admin cascade |
| SCR-WORK-01 | New Work default Status = **Planned** | Open assumption | Default In Progress |
| A-WORK-02 | Work Code year uses **calendar year** of creation date | Open assumption | Use FY year |
| A-WORK-03 | Changing GST type after bills exist is allowed with recalculation of header fields; historic bills unchanged | Open assumption | Freeze GST type after first bill |
| A-WORK-04 | Negative Balance is allowed and displayed (not hard-blocked) | Aligned with rules | Hard-block overbilling |
| A-WORK-05 | Client/Department Format on work is optional | Open assumption | Make required |

---

## 6. Estimate & Schedule Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-EST-01 | Latest estimate by date is “current” for summary display | Open assumption | Explicit “current” flag |
| A-EST-02 | Multiple estimates per work allowed | Aligned with discovery | Single estimate only |
| BR-STAT-02A | Direct Planned → Completed allowed | Open assumption | Enforce workflow |
| BR-STAT-02B | Completed without Actual Completion = **Warn**, not Block | Open assumption | Hard-require date |
| BR-STAT-07A/B | Missing key docs = missing Work Order or Estimate docs for In Progress/Hold/Completed; Planned excluded | Open assumption | Different key set |
| A-SCH-01 | Financial Progress on work form is never manually editable | Confirmed by rules intent | Allow override |
| BR-TL thresholds | Red/Yellow day thresholds 30/60 are documentation defaults | Implementation default | PO sets different days |

---

## 7. Document Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-DOC-01 | Key document types for alerts = Work Order + Estimate | Open assumption | Configurable key flags |
| FS-DOC-01 | Multi-upload batch uses one selected Document Type for all files in the batch | Open assumption | Per-file type UI |
| A-DOC-02 | Image types include JPG/JPEG/PNG at minimum | Implementation default | Add WEBP/HEIC etc. |
| A-DOC-03 | No antivirus scanning required inside CWMS v1 | Open assumption | Add scanning |
| A-DOC-04 | Permanent delete removes metadata and storage object together from user perspective | Open assumption | Soft tombstone without recycle UX |

---

## 8. Billing Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-BILL-01 | Overpayment may show bill-level credit; work Outstanding clamps at 0 contribution | Open assumption | Allow negative outstanding at work |
| A-BILL-02 | RA Bill No. unique within the same work when provided | Open assumption | Unique globally |
| BR-BILL-04 clarifier | Previous Bill Amount is informational unless included in Current by user practice; Gross for rollup is saved Gross Bill Amount | Open assumption | Different RA continuity model |
| BR-BILL-08A | Net < 0 allowed with warning | Open assumption | Hard-block |
| BR-BILL-10A | When Net < 0, payment status manual with warning | Open assumption | Stricter automation |
| BR-BILL-11A | v1 may store payment fields on bill; if payment rows exist, Amount Received = sum | Implementation default | Always separate Payment entity UI |
| BR-BILL-15A | Days Pending uses Bill Date (no separate due date field in v1) | Open assumption | Add due date |
| A-BILL-03 | Billing a Completed work allowed with warning | Open assumption | Block billing completed works |
| A-BILL-04 | System auto-adjusts Payment Status from Amount Received when inconsistent | Implementation default | Strict manual status only |

---

## 9. Expenditure Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-EXP-01 | Estimated Profit/Loss = **Gross Bills Raised − Total Expenditure** | Open assumption | Use Payments or Net instead |
| A-EXP-02 | Reassignment of general expense to another work allowed with audit | Open assumption | Freeze after first assign |
| BR-EXP-07A | Draft expenses excluded from totals | Open assumption | Include drafts |
| BR-EXP-07B | Unassigned general Paid expenses excluded from work totals | Logical necessity | Different portfolio rules |
| BR-EXP-08A | Cancelled may be changed back via edit | Open assumption | Cancelled terminal |
| A-EXP-03 | Expense “Assigned to Work” status used when general expense linked | Aligned with discovery | Status naming change |

---

## 10. Masters, Nav, Admin Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-ADM-01 / BR-MST-02 | In-use master values cannot be deleted | Open assumption | Soft-deactivate instead |
| A-ADM-02 / BR-MST-03 | Rename does not rewrite historical record values | Open assumption | Cascade rename |
| SCR-NAV-01 | Masters and Users are top-level Admin nav items | Open assumption | Nested under Admin menu |
| SCR-BAK-01 | Non-Admin users do not see Restore | Aligned with PO | Show history read-only to others |
| A-ADM-03 | Seeded master example values are loaded on first run and then fully editable | Open assumption | Seeds optional |
| A-ADM-04 | Company report header defaults are system-provided strings/assets | Confirmed direction | Need PO-supplied default content |

---

## 11. Reports Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-RPT-01 / FS-RPT-01 | Saved filters are **per user**; one default per report per user | Open assumption | Shared org filters |
| RPT-04-A | Financial Summary uses FY/date rules as documented (works vs bills vs expenses date bases) | Open assumption | Single date basis for all metrics |
| A-RPT-02 | Viewer may print/export reports under interim permission model | Open assumption (interim perms) | Restrict exports |
| A-RPT-03 | Excel export is data-only (no macros) | Implementation default | Templated Excel |
| A-RPT-04 | Landscape vs portrait recommendations are guidance, not hard acceptance | Implementation default | UX final |

---

## 12. Search Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-SRCH-01 | Search is case-insensitive | Open assumption | Case-sensitive |
| A-SRCH-02 | Partial/contains match for text fields | Open assumption | Exact match only |
| A-SRCH-03 | Global search at minimum returns Works; bills/docs secondary if shown | Open assumption | Unified mixed results required |

---

## 13. Backup & Restore Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| A-BAK-01 | Restore requires **double confirmation** | Open assumption | Single confirm |
| A-BAK-02 | Restore blocks concurrent writes | Open assumption | Read-only mode messaging only |
| A-BAK-03 | Initial backup runs on first deployment/initialization | Open assumption | Wait until first weekly only |
| A-BAK-04 | Weekly schedule clock/timezone is server/cloud local standard | Implementation default | PO picks TZ |
| A-BAK-05 | Backup integrity failure marks status Failed (not Success) | Implementation default | Manual ops verify |

---

## 14. Concurrency Assumptions

| ID | Assumption | Status | Impact if wrong |
|----|------------|--------|-----------------|
| BR-CON-03A | Bills/expenses may use last-successful-save if not covered by work lock; prefer related lock/optimistic check when feasible | Open assumption | Always require work lock for bill edit |
| A-CON-01 | Lock releases on logout, timeout, save, cancel, discard navigate | Aligned with design | Admin force-unlock tool needed |
| A-CON-02 | Same user two browser tabs contend on one lock safely (second denied or managed) | Open assumption | Allow same-user multi-tab |

---

## 15. Functional Spec Assumptions

| ID | Assumption | Status |
|----|------------|--------|
| FS-AUTH-01 | Session continues after password change | Open assumption |
| FS-DASH-01 | Five alerts always shown with counts | Open assumption |
| FS-DOC-01 | Batch upload shared document type | Open assumption |
| FS-RPT-01 | One default saved filter per report per user | Open assumption |

---

## 16. Discovery Interpretation Assumptions

| ID | Assumption | Status | Notes |
|----|------------|--------|-------|
| A-DISC-01 | Product Owner affirmations (“Yes”, “Ok”, “Go ahead”, “Done”, “All ok”) approved the immediately preceding proposal unless later amended | Confirmed method | Used throughout package |
| A-DISC-02 | Desktop/offline/sync statements in discovery are superseded by web amendments | Confirmed | Doc 00 |
| A-DISC-03 | Technology stack names in discovery (languages/frameworks) are **not** product requirements | Confirmed by engagement rules | Engineering choice |
| A-DISC-04 | “Photos” in early discovery are covered in v1 via Document Type (e.g. Site Photo) as PDF/image files, not a separate Photos module | Open assumption | Separate module → v2 |
| A-DISC-05 | Chainage/location fields remain in v1 Work form even without GPS module | Aligned with discovery | — |

---

## 17. Assumption Triage for Product Owner (Recommended Confirm/Reject List)

Please especially confirm or reject these high-impact open assumptions:

1. **A-EXP-01** — P/L = Gross Bills − Expenditure  
2. **A-DASH-01** — Dashboard defaults to all-time portfolio (not FY-only)  
3. **A-WORK-01** — No cascade delete of work children  
4. **A-SEC-02** — 30-minute session timeout  
5. **BR-STAT-07A** — Missing key docs = Work Order or Estimate missing  
6. **BR-TL thresholds** — 30/60 day yellow/red thresholds  
7. **FS-DOC-01** — Batch upload one type for all files  
8. **A-BAK-03** — Initial backup on deploy  
9. **A-BILL-03** — Allow billing Completed works (warn)  
10. **A-RPT-02** — Viewer can export reports  

Until rejected, engineering may implement the stated defaults.

---

## 18. How Assumptions Become Requirements

| Step | Action |
|------|--------|
| 1 | PO marks assumption Confirmed or Rejected in this register |
| 2 | If Confirmed → promote wording into Business Rules / PRD as binding |
| 3 | If Rejected → replace with PO rule; update Docs 02/03/06/08/11 as needed |
| 4 | Do not leave rejected assumptions active in code |

---

## 19. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Assumptions reviewed ☐ High-impact list decided | |
| Senior Business Analyst | ☐ Register complete vs package | |

---

## 20. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-13 |
| Title | Assumptions |
| Next Document | `14-open-questions.md` |

---

**End of Document 13 – Assumptions**
