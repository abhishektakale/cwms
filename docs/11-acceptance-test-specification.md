# CWMS – Construction Work Management System  
## 11 – Acceptance Test Specification

**Document Type:** Product Design Package – Acceptance Test Specification  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–10  
**Depends On:** Documents 00–10  
**Audience:** QA, Product Owner (UAT), Engineering  

---

## 0. Introduction

### 0.1 Purpose

This specification defines Version 1.0 acceptance tests. For each feature area it provides:

- Happy path  
- Alternative path  
- Failure path  
- Acceptance criteria  
- Regression checklist items  

### 0.2 Test Environment Assumptions

- Public-cloud web app URL available  
- Modern browsers available (product allows all; test at least Chromium + one other)  
- Seeded demo accounts:
  - `Administrator` / `Password@123`
  - `Data Entry Operator` / `Password@123`
  - `Engineer` / `Password@123`
  - `Accounts` / `Password@123`
  - `Viewer` / `Password@123`
- Object storage available for uploads  
- Weekly backup job can be triggered or simulated in test  

### 0.3 Result Legend

| Result | Meaning |
|--------|---------|
| Pass | Meets acceptance criteria |
| Fail | Does not meet; defect logged |
| Blocked | Cannot run due to environment/dependency |

### 0.4 ID Scheme

`AT-<AREA>-<nnn>`

---

## 1. Authentication & Users

### AT-AUTH-001 Login (Happy)
| Item | Detail |
|------|--------|
| Steps | Open app → enter Administrator / Password@123 → Login |
| Expected | Dashboard opens; user/role shown |
| Acceptance | Authenticated access only after valid login |

### AT-AUTH-002 Login (Alt – Remember Me)
| Item | Detail |
|------|--------|
| Steps | Login with Remember Me → close browser → reopen app URL |
| Expected | Session restored per Remember Me rules without full re-entry (or equivalent product behaviour) |
| Acceptance | Remember Me works as specified |

### AT-AUTH-003 Login (Failure – bad password)
| Item | Detail |
|------|--------|
| Steps | Valid username + wrong password |
| Expected | Error; no Dashboard |
| Acceptance | Invalid credentials blocked |

### AT-AUTH-004 Login (Failure – inactive)
| Item | Detail |
|------|--------|
| Steps | Admin deactivates a user → that user attempts login |
| Expected | Inactive message; no access |
| Acceptance | Inactive users cannot sign in |

### AT-AUTH-005 Password rules (Failure)
| Item | Detail |
|------|--------|
| Steps | Change password to `password` (no upper/number/symbol) |
| Expected | Rejected with rule guidance |
| Acceptance | Enforces ≥8, upper+lower, number, symbol, no personal details |

### AT-AUTH-006 Password rules (Happy)
| Item | Detail |
|------|--------|
| Steps | Change to compliant password e.g. `Secure#456` |
| Expected | Success |
| Acceptance | Compliant password accepted |

### AT-AUTH-007 Demo accounts (Happy)
| Item | Detail |
|------|--------|
| Steps | Login each of five demo usernames with Password@123 |
| Expected | Each lands with correct role experience |
| Acceptance | All five demos work |

### AT-AUTH-008 Viewer permission (Failure mutate)
| Item | Detail |
|------|--------|
| Steps | Login Viewer → attempt New Work / Delete / Masters |
| Expected | Controls absent or denied; no data change |
| Acceptance | Viewer is view-only |

### AT-AUTH-009 Session timeout (Failure/Recover)
| Item | Detail |
|------|--------|
| Steps | Login → idle past timeout → attempt Save |
| Expected | Session expired → Login; re-auth required |
| Acceptance | Timeout enforced |

**Auth acceptance criteria summary**
- Only active valid users enter the app  
- Password policy enforced on change/create  
- Demo seeds present  
- Viewer cannot mutate  
- Admin-only areas denied to non-Admin  

**Auth regression checklist**
- [ ] All 5 demo logins  
- [ ] Bad password  
- [ ] Inactive user  
- [ ] Weak password reject  
- [ ] Viewer mutate denied  
- [ ] Logout clears access  

---

## 2. Dashboard

### AT-DASH-001 KPI load (Happy)
| Steps | Login → Dashboard |
| Expected | KPI cards show numeric totals |
| Acceptance | Dashboard loads without error |

### AT-DASH-002 Alerts (Happy)
| Steps | Create data for each alert type → open Dashboard |
| Expected | Counts for Pending bills, Overdue/delayed schedule, Outstanding payments, Missing key documents, Works on Hold |
| Acceptance | All five alert types visible with correct counts |

### AT-DASH-003 Alert drill-down (Alt)
| Steps | Click Pending bills alert |
| Expected | Filtered list/report of pending bills |
| Acceptance | Drill-down works |

### AT-DASH-004 Traffic lights (Happy)
| Steps | Create Green/Yellow/Red condition works → Dashboard/list |
| Expected | Correct indicator colours per rules |
| Acceptance | Traffic lights reflect rules |

### AT-DASH-005 Quick actions (Happy / Failure Viewer)
| Steps | Full-access clicks New Work; Viewer checks quick actions |
| Expected | Full-access navigates; Viewer has no mutating shortcuts |
| Acceptance | Role-correct actions |

### AT-DASH-006 Empty portfolio (Alt)
| Steps | Fresh empty tenant/dashboard |
| Expected | Zeros / empty recent; New Work available to Full-access |
| Acceptance | Empty state usable |

**Dashboard regression checklist**
- [ ] KPIs populate  
- [ ] Five alerts  
- [ ] Traffic lights  
- [ ] Quick actions role-safe  
- [ ] Widget failure shows Retry without blanking page  

---

## 3. Work Register

### AT-WORK-001 Create work GST Extra (Happy)
| Steps | New Work → fill required → GST Extra Portion 1000000 GST% 18 → Save |
| Expected | Work Code assigned; GST 180000; Total 1180000; Balance 1180000; Progress 0% |
| Acceptance | GST Extra formula correct |

### AT-WORK-002 Create work GST Included (Alt)
| Steps | GST Included Total 1180000 GST% 18 → Save |
| Expected | GST 180000; Portion 1000000 |
| Acceptance | Reverse GST correct |

### AT-WORK-003 Project light field (Alt)
| Steps | Type new project name; create second work selecting project from dropdown |
| Expected | Dropdown shows existing name; both works associated |
| Acceptance | Free text + existing dropdown works |

### AT-WORK-004 Duplicate WO (Failure)
| Steps | Create two works with same Work Order No. |
| Expected | Second blocked |
| Acceptance | Uniqueness enforced |

### AT-WORK-005 Date validation (Failure)
| Steps | Actual Completion before Start |
| Expected | Blocked |
| Acceptance | Date order validated |

### AT-WORK-006 Edit lock (Failure/Alt)
| Steps | User A edits work; User B tries Edit |
| Expected | B sees in-progress message; cannot overwrite |
| Acceptance | Lock enforced |

### AT-WORK-007 Delete with children (Failure)
| Steps | Add bill to work → Delete work |
| Expected | Blocked |
| Acceptance | Referential integrity |

### AT-WORK-008 Status Hold alert (Happy)
| Steps | Set Status Hold → Dashboard |
| Expected | Works on Hold count increments |
| Acceptance | Hold alert works |

### AT-WORK-009 Search/filter/export (Happy)
| Steps | Filter In Progress → Export |
| Expected | Only matching rows; file downloads |
| Acceptance | Search/filter/export work |

### AT-WORK-010 Bill impact on balance (Happy)
| Steps | Work Total 1180000; add bill Gross 500000 |
| Expected | Balance 680000; Progress ≈ 42.37% |
| Acceptance | Gross-based Balance/Progress |

**Work acceptance criteria summary**
- CRUD (with delete rules)  
- Work Code auto  
- GST Extra/Included  
- Project light UX  
- Locking  
- Gross-based financials  
- Viewer read-only  

**Work regression checklist**
- [ ] GST Extra + Included examples  
- [ ] Duplicate WO  
- [ ] Lock  
- [ ] Delete blocked with children  
- [ ] Balance after bill  
- [ ] Status values only four allowed  

---

## 4. Estimate & Schedule

### AT-EST-001 Add estimate (Happy)
| Steps | Work → Estimate → Add → Save |
| Expected | Listed under work |
| Acceptance | Estimate linked to work |

### AT-EST-002 Delete estimate (Alt)
| Steps | Delete estimate confirm |
| Expected | Removed; work remains |
| Acceptance | Child delete safe |

### AT-SCH-001 Add activity (Happy)
| Steps | Add activity with dates/progress |
| Expected | Saved in schedule list |
| Acceptance | Schedule maintained |

### AT-SCH-002 Overdue alert (Happy)
| Steps | In Progress work with Scheduled Completion in past |
| Expected | Overdue/delayed alert increments |
| Acceptance | Alert rule works |

### AT-SCH-003 Progress bounds (Failure)
| Steps | Progress 120% |
| Expected | Rejected |
| Acceptance | 0–100 enforced |

### AT-SCH-004 Financial progress read-only (Failure)
| Steps | Attempt manual Financial Progress edit on work |
| Expected | Not editable / not saved as override |
| Acceptance | System-calculated only |

**Estimate/Schedule regression checklist**
- [ ] Add/edit/delete estimate  
- [ ] Add/edit/delete activity  
- [ ] Overdue alert  
- [ ] Progress validation  

---

## 5. Documents

### AT-DOC-001 Single PDF upload (Happy)
| Steps | Upload PDF ≤20MB as Work Order type |
| Expected | Listed; Open shows CWMS copy |
| Acceptance | Copy stored and openable |

### AT-DOC-002 Multi-upload images (Alt)
| Steps | Upload multiple JPG/PNG |
| Expected | One record per file; progress shown |
| Acceptance | Multi-upload works |

### AT-DOC-003 Reject Word/Excel (Failure)
| Steps | Upload .docx/.xlsx |
| Expected | Rejected |
| Acceptance | PDF/images only |

### AT-DOC-004 Reject oversize (Failure)
| Steps | Upload >20MB PDF |
| Expected | Rejected |
| Acceptance | Size limit enforced |

### AT-DOC-005 Permanent delete (Happy/Warn)
| Steps | Delete → confirm warning |
| Expected | Removed; cannot restore via recycle bin |
| Acceptance | Permanent delete with warning |

### AT-DOC-006 Delete cancel (Alt)
| Steps | Delete → Cancel |
| Expected | Still present |
| Acceptance | Cancel safe |

### AT-DOC-007 Missing key docs alert (Happy)
| Steps | In Progress work without Work Order/Estimate docs |
| Expected | Missing key documents alert > 0 |
| Acceptance | Alert works |

### AT-DOC-008 Open after local file moved (Alt)
| Steps | Upload → delete local original → Open in CWMS |
| Expected | Still opens |
| Acceptance | Storage copy independent of local path |

**Documents regression checklist**
- [ ] PDF upload/open  
- [ ] Image upload  
- [ ] Multi-upload  
- [ ] Type reject  
- [ ] Size reject  
- [ ] Permanent delete  
- [ ] Viewer cannot delete  

---

## 6. Billing

### AT-BILL-001 RA bill with other deductions (Happy)
| Steps | New Bill → amounts → standard + 2 other deductions → Save |
| Expected | Gross/Net correct; System Bill No. assigned; work Gross/Balance/Progress update |
| Acceptance | Flexible deductions + gross rollup |

### AT-BILL-002 Bill without RA No. (Alt)
| Steps | Leave RA blank → Save |
| Expected | System Bill No. present; save succeeds |
| Acceptance | Audit number always exists |

### AT-BILL-003 Partial payment (Alt)
| Steps | Net 100000; Received 40000 → Partially Received |
| Expected | Outstanding 60000; Outstanding alert updates |
| Acceptance | Partial payment works |

### AT-BILL-004 Full payment (Happy)
| Steps | Received ≥ Net → Fully Received |
| Expected | Outstanding 0 for bill; removed from pending defaults |
| Acceptance | Payment status consistency |

### AT-BILL-005 Net negative warning (Failure/Warn)
| Steps | Deductions > Gross |
| Expected | Warn; Net negative displayed |
| Acceptance | Warning path works |

### AT-BILL-006 Duplicate RA on same work (Failure)
| Steps | Two bills same RA No. on one work |
| Expected | Second blocked |
| Acceptance | Uniqueness within work |

### AT-BILL-007 Delete bill recalculation (Happy)
| Steps | Delete bill confirm |
| Expected | Work totals recalculated without that gross |
| Acceptance | Rollup integrity |

### AT-BILL-008 Balance uses Gross not Net (Happy)
| Steps | Bill Gross 500000 Net 455000 on Total 1180000 |
| Expected | Balance 680000 not 725000 |
| Acceptance | Gross basis confirmed |

**Billing regression checklist**
- [ ] RA + Final types  
- [ ] Other deductions Add More  
- [ ] System Bill No.  
- [ ] Pending/Partial/Full  
- [ ] Gross balance basis  
- [ ] Pending bills alert  
- [ ] Viewer cannot edit bills  

---

## 7. Expenditure

### AT-EXP-001 Work-specific expense (Happy)
| Steps | Work-Specific → Paid with GST → Save |
| Expected | Appears on work; expenditure & P/L update |
| Acceptance | Work expense works |

### AT-EXP-002 General expense (Alt)
| Steps | General → Save without work |
| Expected | In general list; not in work expenditure |
| Acceptance | General capture works |

### AT-EXP-003 Assign general 100% (Happy)
| Steps | Assign to one work |
| Expected | Assigned Yes; work expenditure includes amount |
| Acceptance | Single-work assignment |

### AT-EXP-004 No multi-split (Failure/Alt)
| Steps | Attempt split UI |
| Expected | Not available |
| Acceptance | Version 1.0 scope respected |

### AT-EXP-005 Cancelled excluded (Happy)
| Steps | Cancel expense |
| Expected | Excluded from totals |
| Acceptance | Status rules |

### AT-EXP-006 Attachment reject (Failure)
| Steps | Attach .xlsx |
| Expected | Rejected |
| Acceptance | PDF/images only |

**Expenditure regression checklist**
- [ ] Work-specific  
- [ ] General  
- [ ] Assign  
- [ ] Recalculation  
- [ ] Cancelled exclusion  
- [ ] Draft exclusion from totals  

---

## 8. Masters & Admin

### AT-MST-001 Add master value (Happy)
| Steps | Admin → Masters → Work Categories → Add “Box Culvert” |
| Expected | Appears on Work form dropdown |
| Acceptance | Admin maintainable lists |

### AT-MST-002 Delete in use (Failure)
| Steps | Delete category used by a work |
| Expected | Blocked |
| Acceptance | In-use protection |

### AT-MST-003 Non-Admin masters (Failure)
| Steps | Operator opens Masters mutate |
| Expected | Denied/hidden |
| Acceptance | Admin only |

### AT-USR-001 Create user (Happy)
| Steps | Admin creates Engineer user with compliant password |
| Expected | New user can login as Engineer |
| Acceptance | User admin works |

**Admin regression checklist**
- [ ] All 5 master types CRUD  
- [ ] In-use delete block  
- [ ] User create/deactivate  
- [ ] Non-Admin denied  

---

## 9. Reports

### AT-RPT-001 Each report runs (Happy)
| Steps | Run RPT-01 … RPT-09 with sample data |
| Expected | Each returns results or empty state without error |
| Acceptance | All nine reports available |

### AT-RPT-002 PDF/Excel export (Happy)
| Steps | Export PDF and Excel from Billing Report |
| Expected | Files download; headers include default company/logo metadata fields |
| Acceptance | Export works; default branding |

### AT-RPT-003 FY Apr–Mar (Alt)
| Steps | Filter FY spanning 1 Apr–31 Mar |
| Expected | Boundary dates classified correctly |
| Acceptance | FY calendar correct |

### AT-RPT-004 Saved filter (Happy)
| Steps | Save filter → reopen report → apply/default |
| Expected | Filters restored |
| Acceptance | Saved filters work |

### AT-RPT-005 Work-wise requires work (Failure)
| Steps | Run Work-wise Summary without work |
| Expected | Validation to select work |
| Acceptance | Required filter enforced |

### AT-RPT-006 No Excel import (Alt/Scope)
| Steps | Look for import |
| Expected | Not present in Version 1.0 |
| Acceptance | Import deferred |

**Reports regression checklist**
- [ ] All 9 reports  
- [ ] Print preview  
- [ ] PDF  
- [ ] Excel  
- [ ] Saved filters CRUD  
- [ ] Empty result rendering  
- [ ] Gross-based figures where shown  

---

## 10. Backup & Restore

### AT-BAK-001 Weekly backup history (Happy)
| Steps | Trigger/simulate weekly backup success |
| Expected | History row Success |
| Acceptance | Automatic backup recorded |

### AT-BAK-002 Retention 30 days (Alt)
| Steps | Presence of retention policy; aged backup not restorable after 30 days (simulate) |
| Expected | Purge/not available |
| Acceptance | 30-day retention |

### AT-BAK-003 Restore (Happy) — Test environment only
| Steps | Create marker work → backup → delete marker → Admin restore backup |
| Expected | Marker work returns; double confirm required |
| Acceptance | Admin restore works |

### AT-BAK-004 Restore denied (Failure)
| Steps | Non-Admin restore |
| Expected | Denied |
| Acceptance | Admin only |

### AT-BAK-005 Restore cancel (Alt)
| Steps | Start restore → cancel confirm |
| Expected | No data change |
| Acceptance | Cancel safe |

**Backup regression checklist**
- [ ] Backup history visible to Admin  
- [ ] Success/Failed statuses  
- [ ] Restore double confirm  
- [ ] Non-Admin denied  
- [ ] Post-restore consistency spot-check  

---

## 11. Cross-Cutting Acceptance Suites

### AT-X-001 Concurrent users (~50 readiness smoke)
| Steps | Multiple sessions (practical subset, e.g. 5–10) perform reads/writes |
| Expected | No crash; locks behave; data consistent |
| Acceptance | Multi-user safe for target scale smoke |

### AT-X-002 Network fail on save (Failure)
| Steps | Disconnect during Save |
| Expected | Error; no partial financials |
| Acceptance | Transactional integrity |

### AT-X-003 End-to-end work lifecycle (Happy)
| Steps | Operator creates work+doc → Engineer schedule → Accounts bill+expense → Viewer report |
| Expected | One Work Code links all; Viewer cannot mutate |
| Acceptance | Digital work file journey complete |

### AT-X-004 Gross vs Net regression battery
| Steps | Recreate Example C from Business Rules |
| Expected | Exact Balance/Progress match |
| Acceptance | Financial standard locked |

---

## 12. UAT Script (Product Owner – Short)

| # | Test | Pass? |
|---|------|-------|
| U1 | Login all 5 demos | ☐ |
| U2 | Create GST Extra work + upload WO PDF | ☐ |
| U3 | Create GST Included work | ☐ |
| U4 | Post RA bill with other deductions; verify Balance uses Gross | ☐ |
| U5 | Partial payment + Pending Payment report | ☐ |
| U6 | General expense assign to work | ☐ |
| U7 | Dashboard five alerts + traffic lights | ☐ |
| U8 | Viewer cannot edit/delete | ☐ |
| U9 | Second user edit lock message | ☐ |
| U10 | Admin add master value appears on form | ☐ |
| U11 | Export one PDF + one Excel report | ☐ |
| U12 | Admin restore in test env (optional) | ☐ |
| U13 | Reject .docx upload and >20MB file | ☐ |
| U14 | Delete document warning permanent | ☐ |
| U15 | Saved report filter reuse | ☐ |

**UAT exit criteria:** All mandatory U items Pass (U12 optional if restore env limited); no open S1 defects; S2 defects waived only with PO sign-off.

---

## 13. Master Regression Checklist (Release Gate)

### Functional
- [ ] Auth + password policy + demos  
- [ ] Dashboard KPIs/alerts/traffic lights  
- [ ] Work CRUD + GST both modes + project light  
- [ ] Estimate/Schedule  
- [ ] Documents PDF/image/20MB/multi/permanent delete  
- [ ] Billing deductions/payments/system bill no/gross rollup  
- [ ] Expenditure work/general/assign  
- [ ] Masters Admin  
- [ ] All 9 reports + saved filters + PDF/Excel  
- [ ] Backup history + Admin restore  
- [ ] Viewer restrictions  
- [ ] Edit lock  

### Data / Rules
- [ ] Balance & Progress Gross-based examples  
- [ ] FY Apr–Mar  
- [ ] No sync/offline features present  
- [ ] No Excel import  
- [ ] No recycle bin  
- [ ] Default report branding only  

### Quality
- [ ] No crashes on smoke paths  
- [ ] No data loss on save failure tests  
- [ ] Audit entries for major mutations (spot check)  

---

## 14. Out-of-Scope Tests (Do Not Require for Version 1.0 Acceptance)

- Offline/sync conflict suites  
- Excel import suites  
- BOQ quantity billing suites  
- Native mobile app suites  
- Custom logo upload suites  
- Multi-work expense split suites  

---

## 15. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner (UAT) | ☐ Accepted ☐ Accepted with waivers ☐ Rejected | |
| QA Lead | ☐ Test spec executable | |
| Engineering Lead | ☐ Build ready for UAT | |

---

## 16. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-11 |
| Title | Acceptance Test Specification |
| Next Document | `12-version-roadmap.md` |

---

**End of Document 11 – Acceptance Test Specification**
