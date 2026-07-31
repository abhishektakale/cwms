# CWMS – Construction Work Management System  
## 15 – Product Risks

**Document Type:** Product Design Package – Product Risk Register  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–14 + discovery + platform amendments  
**Depends On:** Entire design package  
**Audience:** Product Owner, Engineering Leadership, Operations, QA  

---

## 0. Purpose

This register identifies product and delivery risks for CWMS Version 1.0 across:

- Data integrity  
- Scalability  
- Usability  
- Operational risks  
- Adoption risks  

It also notes security, scope, and financial-trust risks that can undermine Version 1.0 success.

### 0.1 Rating Scales

**Impact**

| Level | Meaning |
|-------|---------|
| High | Major financial/trust failure, data loss, or blocked go-live |
| Medium | Significant rework, partial outage, or user rejection risk |
| Low | Contained inconvenience |

**Likelihood**

| Level | Meaning |
|-------|---------|
| High | Probable without active mitigation |
| Medium | Possible under normal use |
| Low | Unlikely if controls hold |

**Risk score** = qualitative High / Medium / Low from Impact × Likelihood judgment.

---

## 1. Data Integrity Risks

| ID | Risk | Impact | Likelihood | Score | Why it matters | Mitigation |
|----|------|--------|------------|-------|----------------|------------|
| R-DI-01 | Incorrect Balance/Progress if Net or Payments used instead of Gross | High | Medium | High | PO confirmed Gross basis; wrong formula destroys trust | Freeze Doc 06; acceptance tests AT-WORK-010 / AT-BILL-008; code review financial module |
| R-DI-02 | Partial save (bill saved, work rollup not updated) | High | Medium | High | Silent inconsistent financials | Transactional save; fail entire operation; AT-X-002 |
| R-DI-03 | Orphan records (bill/doc without work) | High | Low | Medium | Breaks digital work file model | Referential validations; DB constraints at implementation; delete blocks |
| R-DI-04 | Edit overwrite without lock | High | Medium | High | Lost updates between Operator/Accounts/Engineer | Work edit lock; EC-LOCK tests |
| R-DI-05 | Permanent document delete with no recycle bin | High | Medium | High | Accidental loss of WO/drawings | Strong warning; training; Admin restore from weekly backup |
| R-DI-06 | Object storage file missing while metadata remains | High | Low | Medium | Documents open fails; audit gaps | Integrity checks; backup includes files; restore path |
| R-DI-07 | GST Extra/Included mis-calc / rounding drift | High | Medium | High | Wrong contract totals | Worked examples in Doc 06; dual-mode UAT |
| R-DI-08 | Restore applied to wrong backup point | High | Low | Medium | Mass rollback of good work | Double confirm; backup labels/dates clear; test-env practice |
| R-DI-09 | Master rename misunderstood as historical rewrite | Medium | Medium | Medium | Users think old reports “change” | Document rename behaviour; train Admins |
| R-DI-10 | Open questions on P/L formula left unresolved | High | Medium | High | Dashboard/work P/L disputed | Resolve OQ-14-001 before go-live |
| R-DI-11 | Demo/shared passwords on production | High | Medium | High | Unauthorized access / data tampering | Force password change; disable demos in prod (OQ-14-017) |
| R-DI-12 | Unexpected shutdown mid-write | High | Low | Medium | Corruption risk | Transaction boundaries; backups |

---

## 2. Scalability Risks

| ID | Risk | Impact | Likelihood | Score | Why it matters | Mitigation |
|----|------|--------|------------|-------|----------------|------------|
| R-SC-01 | Document storage growth (unlimited docs × 20 MB) | Medium | High | High | Cost and backup size explode | Monitor storage; retention policy later; compress guidance; cost alerts |
| R-SC-02 | 50 concurrent users underestimated | Medium | Medium | Medium | Slowness / timeouts | Load smoke tests; scale cloud tier; plan 1.1 perf |
| R-SC-03 | Multi-year history slows reports | Medium | Medium | Medium | Meeting reports fail/time out | FY filters default guidance; indexes; async export if needed later |
| R-SC-04 | Multi-upload of very large batches | Medium | Medium | Medium | Timeouts / partial uploads | Progress UI; retry failed; size limits already 20 MB |
| R-SC-05 | Backup window grows beyond weekly comfort | Medium | Medium | Medium | Backup failures / long restore | Monitor backup duration; optimize artifact strategy |
| R-SC-06 | Search quality degrades as volume grows | Low | Medium | Low | Users fall back to spreadsheets | Search assumptions tested; 1.1 search hardening |
| R-SC-07 | Public cloud cost surprise | Medium | Medium | Medium | Budget pressure | Cost-saving weekly backups already chosen; monitor storage/egress |

---

## 3. Usability Risks

| ID | Risk | Impact | Likelihood | Score | Why it matters | Mitigation |
|----|------|--------|------------|-------|----------------|------------|
| R-UX-01 | Gross vs Net confusion | High | High | High | Users dispute balances | Labels on Work Summary; training; tooltips; UAT emphasis |
| R-UX-02 | Interim permissions too coarse (Engineer=Accounts=Operator) | Medium | High | High | Accidental edits outside role comfort | Train; plan v2 fine matrix; audit trail |
| R-UX-03 | Light projects cause naming duplicates (“NH-66” vs “NH 66”) | Medium | High | Medium | Fragmented filters/reports | Naming convention guide; later full Projects module |
| R-UX-04 | Free-text Client/Contractor/Vendor inconsistency | Medium | High | Medium | Weak grouping in reports | Entry conventions; v2 masters if needed |
| R-UX-05 | Learnability target (~30 minutes) missed | Medium | Medium | Medium | Slow adoption | Demo accounts; guided journeys Doc 05; short training script |
| R-UX-06 | Any-browser / any-device expectation vs desktop-first layout | Medium | Medium | Medium | Mobile users frustrated | Set expectation: desktop primary; improve responsive later |
| R-UX-07 | No custom keyboard shortcuts (by design) | Low | Low | Low | Power users slower | Accept for v1; optional 1.1 accelerators |
| R-UX-08 | Alert noise (zeros always shown / thresholds wrong) | Medium | Medium | Medium | Users ignore alerts | Resolve OQ-14-008/012; tune thresholds |
| R-UX-09 | Theme undecided until UX designer finishes | Low | Medium | Low | Visual inconsistency during build | UX owns theme; freeze before UAT cosmetics |
| R-UX-10 | Default report branding looks “generic” | Low | High | Low | Less official appearance | Accept v1 defaults; logo upload in v2 |
| R-UX-11 | Permanent delete anxiety | Medium | Medium | Medium | Users afraid to clean docs / or delete too freely | Warning copy; backup education |
| R-UX-12 | Edit lock frustration | Medium | Medium | Medium | “System is stuck” perception | Clear message naming locker; timeout release |

---

## 4. Operational Risks

| ID | Risk | Impact | Likelihood | Score | Why it matters | Mitigation |
|----|------|--------|------------|-------|----------------|------------|
| R-OPS-01 | Public cloud outage | High | Low | Medium | Whole office blocked (online-only) | Status communication; vendor SLA; no offline fallback by design—set expectations |
| R-OPS-02 | Weekly backup failure unnoticed | High | Medium | High | Restore point missing when needed | Admin weekly check; failed status visible; alerting if possible |
| R-OPS-03 | Restore untested until disaster | High | Medium | High | Restore fails under pressure | Mandatory restore drill in test env before go-live (AT-BAK-003) |
| R-OPS-04 | Storage credentials/misconfig | High | Low | Medium | Uploads fail or public exposure risk | Secure config; least privilege; smoke upload checks |
| R-OPS-05 | Open questions unresolved at go-live | Medium | Medium | Medium | Conflicting behaviour vs stakeholder expectation | Close P0 OQs in Doc 14 before release |
| R-OPS-06 | Vague Settings exclusion leaves timeout/branding ops awkward | Medium | Medium | Medium | Hard to change defaults without release | Document defaults; 1.1 small admin config if needed |
| R-OPS-07 | Support burden from 5 full-access roles | Medium | Medium | Medium | “Who changed my bill?” disputes | Audit log; process ownership |
| R-OPS-08 | Timezone/server clock skew | Medium | Low | Medium | Wrong Days Pending / overdue alerts | Standardize cloud TZ; monitor NTP |
| R-OPS-09 | Cost growth (storage + egress + DB) | Medium | Medium | Medium | Budget overrun | Monitor; retention; weekly backup already cost-oriented |
| R-OPS-10 | Single Admin dependency | Medium | Medium | Medium | Restore/masters blocked if Admin unavailable | At least two Administrator users |

---

## 5. Adoption Risks

| ID | Risk | Impact | Likelihood | Score | Why it matters | Mitigation |
|----|------|--------|------------|-------|----------------|------------|
| R-AD-01 | Parallel spreadsheets continue | High | High | High | CWMS never becomes system of record | Mandate CWMS for works in scope; make reports faster than Excel rebuild |
| R-AD-02 | Expectation of offline/desktop from early discovery | High | Medium | High | “This isn’t what we agreed” | Communicate Doc 00 amendments clearly; training kickoff |
| R-AD-03 | Expectation of sync module | Medium | Medium | Medium | Perceived missing feature | Roadmap Doc 12; explain central web replaces sync |
| R-AD-04 | Accounts distrust automatic calculations | High | Medium | High | Manual shadow ledgers | Side-by-side UAT with real bills; worked examples |
| R-AD-05 | Engineers underuse system if uploads awkward | Medium | Medium | Medium | Incomplete documents/alerts noisy | Multi-upload UX; PDF/image guidance |
| R-AD-06 | Viewer role unused; managers keep asking for screenshots | Medium | Medium | Medium | Extra work for operators | Train managers on Viewer + reports |
| R-AD-07 | Scope creep during build delays release | High | High | High | 1.0 never ships | Frozen scope; Feature Request Register |
| R-AD-08 | Training only on demos, not real data | Medium | Medium | Medium | Weak confidence | UAT with realistic ~200-work sample |
| R-AD-09 | Fear of restore / backup not understood | Medium | Medium | Medium | Panic in incidents | Run restore drill; simple Admin runbook |
| R-AD-10 | Version 2.0 wishlist blocks 1.0 sign-off | Medium | Medium | Medium | Delay value delivery | Separate 2.0 charter; ship 1.0 core |

---

## 6. Security & Compliance Risks

| ID | Risk | Impact | Likelihood | Score | Mitigation |
|----|------|--------|------------|-------|------------|
| R-SEC-01 | Weak production passwords / unchanged demos | High | Medium | Change demos; enforce password rules; OQ-14-017 |
| R-SEC-02 | Remember Me on shared PCs | Medium | Medium | Train logout; shared-PC policy |
| R-SEC-03 | Viewer export of sensitive financials | Medium | Medium | Resolve OQ-14-010; audit exports later if needed |
| R-SEC-04 | Coarse full-access roles | Medium | High | Process controls + audit; finer matrix in v2 |
| R-SEC-05 | Malicious file upload (no AV guarantee in v1) | Medium | Low | Perimeter scanning if available; PDF/image only reduces surface |
| R-SEC-06 | Privilege escalation via client tampering | High | Low | Server-side authorization always |

---

## 7. Scope & Delivery Risks

| ID | Risk | Impact | Likelihood | Score | Mitigation |
|----|------|--------|------------|-------|------------|
| R-DEL-01 | Discovery tech stack treated as mandatory | Medium | Medium | Keep product docs tech-agnostic; architecture ADR separate |
| R-DEL-02 | Design package vs implementation drift | High | Medium | Traceability; change control; update docs when PO answers OQs |
| R-DEL-03 | Incomplete Backup/Sync depth historically | Medium | Low (sync removed) | Backup rules now specified; sync out of scope |
| R-DEL-04 | Assumption defaults quietly shipped without PO review | Medium | Medium | Doc 13 triage + Doc 14 P0 answers before go-live |
| R-DEL-05 | UAT not run with real-volume data | High | Medium | Require Document 11 volume scenarios |

---

## 8. Top 10 Risks to Manage Before Go-Live

| Rank | ID | Risk | Owner suggestion |
|------|----|------|------------------|
| 1 | R-DI-01 / R-UX-01 | Gross vs Net financial trust | Product + Accounts + Engineering |
| 2 | R-DI-02 | Partial save / rollup integrity | Engineering |
| 3 | R-AD-01 | Parallel spreadsheet adoption failure | Product Owner / Management |
| 4 | R-AD-02 | Web/online expectation mismatch | Product Owner |
| 5 | R-OPS-02 / R-OPS-03 | Backup failure / untested restore | Admin + Engineering |
| 6 | R-DI-05 | Permanent document delete | Product + Training |
| 7 | R-UX-02 | Coarse permissions | Product Owner |
| 8 | R-SC-01 | Storage/backup cost growth | Operations |
| 9 | R-DI-10 / Doc 14 P0 | Open financial/delete/timeout questions | Product Owner |
| 10 | R-AD-07 | Scope creep | Product Manager |

---

## 9. Risk Acceptance (Product Owner)

Some risks are accepted by Version 1.0 design choices:

| Accepted risk | Why accepted |
|---------------|--------------|
| No offline continuity | PO chose online-only web |
| No sync module | Central web app |
| No document recycle bin | PO decision; mitigate via backup |
| No Excel import | Deferred to v2 |
| Default report branding only | Deferred logo upload to v2 |
| Coarse role permissions | Interim model for v1 speed |
| No custom keyboard shortcuts | Web click-driven UX |

---

## 10. Monitoring Signals After Go-Live

Watch for:

- Support tickets about “wrong balance”  
- Upload failure rates / storage growth  
- Backup Success/Failed weekly  
- Duplicate project/client strings fragmenting reports  
- Frequency of edit-lock complaints  
- Continued use of parallel Excel registers  
- Restore drill completion (quarterly recommended)  

---

## 11. Contingency Themes

| If this happens | Contingency |
|-----------------|-------------|
| Financial trust crisis | Freeze billing module changes; reconcile with Doc 06 examples; hotfix |
| Storage cost spike | Tighten upload guidance; archive strategy in 1.1/2.0 |
| Major data loss event | Admin restore from last good weekly backup; incident review |
| Adoption stall | Management mandate + targeted training on Work Summary/reports |
| Cloud outage | Communicate ETA; no offline mode—manual paper/Excel temporary only if business requires |

---

## 12. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Risks accepted ☐ Mitigations agreed | |
| Engineering Lead | ☐ Technical mitigations feasible | |
| Operations / Admin | ☐ Backup/restore ownership accepted | |

---

## 13. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-15 |
| Title | Product Risks |
| Next Document | None — design package complete |

---

## 14. Design Package Completion Index

| Doc | Title | Path |
|-----|-------|------|
| 00 | Executive Summary | `docs/00-executive-summary.md` |
| 01 | Product Vision | `docs/01-product-vision.md` |
| 02 | Product Requirements Document | `docs/02-product-requirements-document.md` |
| 03 | Functional Specification | `docs/03-functional-specification.md` |
| 04 | Screen Specification | `docs/04-screen-specification.md` |
| 05 | User Journeys | `docs/05-user-journeys.md` |
| 06 | Business Rules | `docs/06-business-rules.md` |
| 07 | Domain Model | `docs/07-domain-model.md` |
| 08 | Validation Catalogue | `docs/08-validation-catalogue.md` |
| 09 | Edge Case Catalogue | `docs/09-edge-case-catalogue.md` |
| 10 | Reporting Catalogue | `docs/10-reporting-catalogue.md` |
| 11 | Acceptance Test Specification | `docs/11-acceptance-test-specification.md` |
| 12 | Version Roadmap | `docs/12-version-roadmap.md` |
| 13 | Assumptions | `docs/13-assumptions.md` |
| 14 | Open Questions | `docs/14-open-questions.md` |
| 15 | Product Risks | `docs/15-product-risks.md` |

Together these documents are the **single source of truth** for CWMS Version 1.0 product definition prior to engineering build-out.

---

**End of Document 15 – Product Risks**

**End of CWMS Version 1.0 Product Design Package**
