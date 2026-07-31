# CWMS – Construction Work Management System  
## 12 – Version Roadmap

**Document Type:** Product Design Package – Version Roadmap  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen) + planned later tracks  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–11 + `dialog.md` + Product Owner amendments 2026-07-31  
**Depends On:** Documents 00–11  
**Audience:** Product, Engineering, Stakeholders  

---

## 0. Purpose

This roadmap separates:

1. **Frozen Version 1.0** delivery scope  
2. **Version 1.0.x / 1.1** hardening and minor improvements  
3. **Version 2.0** major deferred enhancements  
4. **Later vision** (3.0+)  

Only Version 1.0 is the current build commitment of this design package.

---

## 1. Versioning Policy

| Version pattern | Meaning |
|-----------------|---------|
| **v1.0.0** | Initial production release of frozen core |
| **v1.0.x** | Patch: defect fixes, security/hotfix, no feature scope growth |
| **v1.1.0** | Minor improvements within architecture; small UX/report refinements |
| **v1.5** (optional track from discovery) | Intermediate productivity enhancements if prioritized later |
| **v2.0.0** | Major enhancements and previously deferred modules |
| **v3.0.0+** | Broader construction ERP expansion |

### 1.1 Change Control Rules

1. Version 1.0 requirements are **frozen** except essential defect/clarity corrections.  
2. New ideas discovered during build go to the **Feature Request Register** for Version 1.1+ or 2.0.  
3. Version upgrades MUST preserve existing Version 1.0 data.  
4. Maintain a **CHANGELOG** from first release.  

---

## 2. Version 1.0 – Frozen Scope (Delivery Commitment)

### 2.1 Platform (Amended)

| Item | Version 1.0 decision |
|------|----------------------|
| Client | **Web application** |
| Access | Online-only; any place; any browser |
| Hosting | **Public cloud** |
| Concurrent users (initial) | ~50 |
| Volume target | ~200 works/year |
| Offline mode | **Out** |
| Synchronization module | **Out** |
| Desktop installer / local DB-first | **Out** (superseded) |

### 2.2 Modules In Scope

1. Login & User Management (incl. Remember Me, password rules, demo accounts)  
2. Dashboard (KPIs, traffic lights, five simple alerts, quick actions)  
3. Work Register (digital work file; GST Extra/Included; light projects)  
4. Estimate Management  
5. Schedule Management  
6. Document Management (PDF/images, 20 MB, permanent delete)  
7. Billing Management (single-total RA/Final; flexible other deductions; system bill number)  
8. Expenditure Management (work-specific + general + 100% assign)  
9. Reports (nine reports; saved filters; PDF/Excel export)  
10. Search & Filters  
11. Backup & Restore (weekly automatic; 30-day retention; Admin restore)  
12. Administration – Users  
13. Masters / Option Lists (separate page; Admin CRUD)  

### 2.3 Explicitly Included Decisions (Frozen)

| Topic | Decision |
|-------|----------|
| Roles | Administrator, Data Entry Operator, Engineer, Accounts, Viewer |
| Permissions | Viewer view-only; other four full access (interim); Admin-only masters/users/restore |
| Work statuses | Planned, In Progress, Hold, Completed |
| Parties | Client/Contractor/Vendor free text |
| Projects | Light: free text + dropdown of existing names |
| Financial progress/balance | **Gross Bills Raised** |
| GST % | Free number input |
| FY | April–March |
| Demo users | Username = role; password `Password@123` |
| Password rules | ≥8; upper+lower; number; symbol; no personal details |
| Documents | PDF/images; copy to CWMS storage; max 20 MB; no recycle bin |
| Report branding | System defaults only |
| Excel | Export yes; **import no** |
| Alerts | Pending bills; Overdue/delayed schedule; Outstanding payments; Missing key documents; Works on Hold |
| Concurrency | Work edit lock + message |
| Settings module (vague global) | **Out** of Version 1.0 |
| Theme | UI/UX designer decision |

### 2.4 Version 1.0 Deliverables (Product Package)

- Deployed web application on public cloud  
- Seeded demo accounts  
- User/Admin documentation  
- Backup/restore capability as specified  
- Sample/training data capability  
- Source package / data documentation / changelog (delivery set)  

### 2.5 Version 1.0 Success Gate

Acceptance per Document 11; no open S1 defects; PO UAT sign-off.

---

## 3. Version 1.0.x – Patch Track

### 3.1 Intent

Stabilize production after 1.0.0 without expanding scope.

### 3.2 Allowed Changes

- Defect fixes (calculations, locks, uploads, permissions, report errors)  
- Security patches  
- Performance fixes for ~50-user / multi-year data  
- Clarifying validation messages  
- Data migration fixes if upgrade issues appear  

### 3.3 Not Allowed

- New modules  
- Pulling Version 2.0 features “because they are small”  
- Offline/sync  
- Excel import  
- Logo upload  
- BOQ billing  

---

## 4. Version 1.1 – Minor Improvements

### 4.1 Intent

Usability and reporting polish on the frozen core.

### 4.2 Candidate Items (Prioritize Later)

| Candidate | Notes |
|-----------|-------|
| Additional reports / columns | Within existing data model |
| Faster search refinements | No new domain |
| Optional keyboard accelerators | Explicitly deferred from 1.0 screen spec |
| Finer alert thresholds configuration | Without full Notification Centre |
| Work delete policy refinements | If PO requests cascade options |
| Stronger login rate-limiting | Security hardening |
| Expanded browser QA matrix documentation | Still “allow all” product intent |
| UI polish from UX designer backlog | Theme already UX-owned |

### 4.3 Exit Criteria

- No breaking data changes without migration  
- Changelog published  
- Regression suite from Document 11 still green  

---

## 5. Version 1.5 – Optional Intermediate Track (From Discovery)

Discovery mentioned a possible 1.5 track for reminders/calendar/email-class features. **Not committed.**

| Possible items | Status |
|----------------|--------|
| Reminder system | Candidate only |
| Email/SMS notifications | Candidate only |
| Calendar views | Candidate only |

These MUST NOT be treated as Version 1.0 or automatic 1.1 scope.

---

## 6. Version 2.0 – Major Enhancements (Deferred)

### 6.1 Intent

Expand CWMS after Version 1.0 is stable in production.

### 6.2 Confirmed Deferred Items (From Discovery + PO Amendments)

| Area | Version 2.0 item |
|------|------------------|
| Data | Excel **data import** |
| Branding | Company/office name + **logo upload** |
| Documents | Recycle bin / soft-delete recovery |
| Documents | Broader file types (Office/AutoCAD/ZIP) if prioritized |
| Projects | Full Projects management module |
| Billing | Item-wise BOQ / MB quantity billing, running quantities, abstracts |
| Expenditure | Split one general expense across multiple works (%) |
| Collaboration | Work Diary / Remarks History |
| Notifications | Full Notification Centre / advanced notifications |
| Security | Finer module permission matrix beyond Viewer vs full access |
| Field | Mobile application |
| Field | GPS / map integration |
| Field | Advanced site inspection / photo progress modules |
| Identity | QR code work-file access |
| Ops | Barcode document tracking (discovery future) |
| Integration | Accounting software integration |
| Formats | Deeper client-specific billing format engines / workflow customization |
| Masters | Broader configurability beyond Version 1.0 five lists (if needed) |
| Sync | Multi-office advanced sync topologies (only if ever needed beyond central web) |
| Offline | Offline-capable web/client (only if PO revisits; currently rejected for 1.0) |

### 6.3 Version 2.0 Principles

- Preserve Version 1.0 data and Work-centric model  
- Prefer additive modules  
- Re-open feature register and re-estimate before committing  

---

## 7. Version 3.0+ – Long-Term Vision (Non-Binding)

From discovery long-term ERP vision (not scheduled):

- Tender Management  
- Full BOQ Management suite  
- Material Inventory / Stores  
- Plant & Machinery  
- Employee Attendance  
- Purchase Orders  
- Quality Control  
- Safety Inspections  
- Correspondence / Letter Management (advanced)  
- GIS / richer map operations  
- Digital signatures  
- Cloud analytics dashboards beyond operational reports  

These are **vision only** until a future charter.

---

## 8. Frozen vs Future Separation Matrix

| Capability | v1.0 | v1.1 | v2.0 | Later |
|------------|------|------|------|-------|
| Web app online | ✓ | | | |
| Work digital file | ✓ | | | |
| GST Extra/Included | ✓ | | | |
| RA billing single total | ✓ | | | |
| Flexible other deductions | ✓ | | | |
| Gross-based progress | ✓ | | | |
| Documents PDF/images | ✓ | | | |
| Masters 5 lists Admin CRUD | ✓ | | | |
| Weekly backup / 30-day / Admin restore | ✓ | | | |
| 9 reports + saved filters | ✓ | | | |
| Traffic lights + 5 alerts | ✓ | | | |
| Edit lock | ✓ | | | |
| Offline / Sync | — | — | Maybe | |
| Excel import | — | — | ✓ | |
| Logo upload | — | — | ✓ | |
| Recycle bin | — | — | ✓ | |
| Full Projects module | — | — | ✓ | |
| BOQ/MB billing | — | — | ✓ | |
| Expense multi-split | — | — | ✓ | |
| Work diary | — | — | ✓ | |
| Notification Centre | — | — | ✓ | |
| Fine permissions | — | Maybe light | ✓ | |
| Mobile app | — | — | ✓ | |
| GPS / QR | — | — | ✓ | |
| Inventory / attendance / stores | — | — | — | ✓ |

---

## 9. Suggested Delivery Sequence (Historical Discovery Alignment)

Discovery proposed sprints; adapted to web delivery without prescribing technology:

| Phase | Focus |
|-------|--------|
| Sprint/Phase 1 | Auth, users, shell, dashboard |
| Phase 2 | Work Register + light projects + financial standard |
| Phase 3 | Estimate + Schedule |
| Phase 4 | Billing + deductions + payments |
| Phase 5 | Expenditure + assignment |
| Phase 6 | Documents + storage |
| Phase 7 | Reports + saved filters |
| Phase 8 | Masters, backup/restore, hardening |
| Phase 9 | UAT with ~200-work scale sample + release 1.0.0 |

---

## 10. Feature Request Register (Process)

During Version 1.0 build/UAT:

1. Log request with date, requester, description  
2. Classify: Defect (1.0.x) / Minor (1.1) / Major (2.0) / Vision (3.0+)  
3. PO approves classification  
4. Do not implement Major/Vision inside 1.0  

---

## 11. Data Compatibility Commitment

| Upgrade path | Commitment |
|--------------|------------|
| 1.0.0 → 1.0.x | No data loss |
| 1.0.x → 1.1 | Migration scripts/additive fields; no wipe |
| 1.x → 2.0 | Compatibility plan required before development; Work IDs and financial history preserved |

---

## 12. Roadmap Risks

| Risk | Mitigation |
|------|------------|
| Scope creep into 1.0 | Frozen list + feature register |
| Stakeholders expect offline/sync from early discovery | Document 00 amendments; training |
| Version 2.0 expectations delay 1.0 sign-off | Separate charters |
| Permission model too coarse | Accept interim; plan 2.0 fine matrix |

---

## 13. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Principal Product Manager | ☐ Frozen vs future separation clear | |

---

## 14. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-12 |
| Title | Version Roadmap |
| Next Document | `13-assumptions.md` |

---

**End of Document 12 – Version Roadmap**
