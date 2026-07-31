# CWMS – Construction Work Management System  
## 09 – Edge Case Catalogue

**Document Type:** Product Design Package – Edge Case Catalogue  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source:** Documents 00–08 + `dialog.md`  
**Depends On:** Documents 00–08  
**Audience:** QA, Engineering, BA, Product, Operations  

---

## 0. Introduction

### 0.1 Purpose

This catalogue lists edge cases, exceptional situations, and failure modes that Version 1.0 must handle safely. For each case it states:

- Trigger
- Expected system behaviour
- User/Admin recovery
- Related rules/validations

### 0.2 Severity

| Severity | Meaning |
|----------|---------|
| **S1 Critical** | Data loss, security breach, or unrecoverable inconsistency risk |
| **S2 High** | Major function blocked or incorrect financials if mishandled |
| **S3 Medium** | Confusing UX or recoverable operational issue |
| **S4 Low** | Rare annoyance; workaround exists |

### 0.3 ID Scheme

`EC-<AREA>-<nnn>`

---

## 1. Work & Identity Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-WORK-001 | Duplicate work order number | S2 | User saves work with existing WO No. | Block save; show uniqueness error | Change WO No. |
| EC-WORK-002 | Duplicate submit create work | S2 | Double-click Save | Single work created; button disabled while saving | Use existing record |
| EC-WORK-003 | Work Code year rollover | S3 | First work in new calendar year | New year sequence in `CWMS-YYYY-####` | None |
| EC-WORK-004 | Empty project name | S4 | Save without project | Allowed; project dropdown omits blanks | Add project later |
| EC-WORK-005 | New project name typo variant | S3 | “NH-66” vs “NH 66” | Treated as distinct light project names | Admin/users standardize naming manually |
| EC-WORK-006 | Delete work with children | S2 | Delete work that has bills/docs/etc. | Block with explanation | Remove/reassign children or keep work |
| EC-WORK-007 | Delete work race | S2 | Children added while delete attempted | Block or fail safely; no orphaning | Refresh and retry |
| EC-WORK-008 | Status Completed, no actual date | S3 | Mark Completed without Actual Completion | Warn; allow save | Enter date |
| EC-WORK-009 | Status Hold with active billing | S3 | Bill posted while Hold | Allowed; Hold alert remains | Business decision |
| EC-WORK-010 | Planned → Completed jump | S4 | Direct status change | Allowed in Version 1.0 | Prefer staged updates operationally |
| EC-WORK-011 | Very long work name/chainage | S3 | Extremely long text | Accept within reasonable limits or truncate display | Shorten text |
| EC-WORK-012 | Special characters in WO No. | S3 | Slashes/spaces in WO No. | Allowed if unique | None |
| EC-WORK-013 | GST % = 0 | S3 | Zero GST | GST Amount 0; Portion/Total consistent | None |
| EC-WORK-014 | GST % high (e.g. 100) | S3 | Boundary GST | Calculate per formula if ≤100 allowed | Correct % if mistaken |
| EC-WORK-015 | Switch GST Extra ↔ Included after bills | S2 | Change GST type on work with bills | Recalc work header values; historic bills unchanged; warn if balance/progress odd | Review bills |
| EC-WORK-016 | Edit work financials after many bills | S2 | Change Total Work Value | Balance/Progress recalculate from existing Gross Bills | Confirm intentional |

---

## 2. Concurrency & Lock Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-LOCK-001 | Two users edit same work | S2 | User B edits while User A holds lock | B denied with in-progress message | B waits; A saves/cancels |
| EC-LOCK-002 | Lock holder browser crash | S2 | A closes browser without unlock | Lock expires on session timeout | B retries after timeout |
| EC-LOCK-003 | Lock holder idle timeout | S2 | Session expires mid-edit | Lock released; unsaved data lost | Re-enter data |
| EC-LOCK-004 | User A locks; Admin restores | S1 | Restore during active sessions | Writes blocked during restore; sessions see restored state afterward | Re-login/refresh |
| EC-LOCK-005 | Simultaneous bill save on same work | S2 | Two bills saved near-instantly | Both save if valid; aggregates consistent (transactional recalculation) | Refresh summary |
| EC-LOCK-006 | Stale form overwrite | S2 | User saves outdated screen after another update | Prefer lock/conflict detection; no silent corruption | Reload and reapply |

---

## 3. Financial Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-FIN-001 | Negative balance (over-billing) | S2 | Σ Gross Bills > Total Work Value | Show negative Balance; traffic light Red; warn | Revise work value or bills |
| EC-FIN-002 | Financial progress > 100% | S2 | Same as over-billing | Show >100% or cap display with true underlying ratio per rules — **display actual %** | Correct data |
| EC-FIN-003 | Total Work Value = 0 | S2 | Zero total | Progress = 0; avoid divide-by-zero | Enter values |
| EC-FIN-004 | Gross vs Net confusion | S2 | User expects Balance to use Net | Balance uses **Gross Bills Raised** only | Training / UI labels |
| EC-FIN-005 | Partial payment | S2 | Amount Received < Net | Status Partially Received; Outstanding alert | Collect remainder |
| EC-FIN-006 | Overpayment | S3 | Amount Received > Net | Warn; outstanding clamp 0 at work rollup | Adjust payment |
| EC-FIN-007 | Zero deduction bill | S3 | All deductions 0 | Net = Gross | None |
| EC-FIN-008 | Deductions > Gross | S2 | Net negative | Warn; allow save | Correct deductions |
| EC-FIN-009 | Bill without RA number | S3 | RA No. blank | System Bill Number still assigned | Optional add RA later |
| EC-FIN-010 | Duplicate RA No. same work | S2 | Reuse RA No. on work | Block | Change RA No. |
| EC-FIN-011 | Final Bill while balance remains | S3 | Final Bill posted early | Allowed; balance may remain >0 | Operational review |
| EC-FIN-012 | Delete bill after payments recorded | S2 | Delete bill | Cascades; rollups recalc; audit | Recreate if mistake (no recycle) |
| EC-FIN-013 | Multiple other deduction lines | S3 | Many custom deductions | All summed | None |
| EC-FIN-014 | Rounding half-paisa | S3 | Repeating decimals in GST reverse | Round to 2 decimals half-up | None |
| EC-FIN-015 | GST Included reverse with odd totals | S3 | Inclusive amount not cleanly divisible | Rounded Portion/GST; sum may need penny adjust — keep Total authoritative | Review |
| EC-FIN-016 | Estimated P/L negative | S3 | Expenditure > Gross Bills | Show loss | Cost control |
| EC-FIN-017 | Draft expense included wrongly | S2 | Draft sitting on work | Draft excluded from totals | Mark Paid when real |
| EC-FIN-018 | Cancelled expense still showing in totals | S2 | Cancelled not excluded (bug if happens) | Must exclude | Fix status/data |
| EC-FIN-019 | Reassign general expense | S3 | Move assignment Work A→B | A decreases, B increases; audit | None |
| EC-FIN-020 | General paid never assigned | S3 | Remains general | In general reports only; not work P/L | Assign when known |

---

## 4. Document Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-DOC-001 | Missing key documents | S3 | In Progress/Hold/Completed without WO/Estimate docs | Missing key documents alert increments | Upload PDFs |
| EC-DOC-002 | Upload Word/Excel/DWG | S2 | Disallowed type | Reject | Convert to PDF/image |
| EC-DOC-003 | File exactly 20 MB | S3 | Boundary size | Accept | None |
| EC-DOC-004 | File 20 MB + 1 byte | S2 | Over limit | Reject | Compress/split |
| EC-DOC-005 | Multi-upload 100 files | S3 | Large batch | Process with progress; partial failures reported | Retry failed |
| EC-DOC-006 | Duplicate file names | S3 | Two `drawing.pdf` | Both stored with unique storage keys; original names displayed | None |
| EC-DOC-007 | Interrupted upload | S2 | Network drop mid-upload | No partial committed doc for failed file | Retry |
| EC-DOC-008 | Storage outage | S1 | Object storage down | Upload fails clearly; no fake success | Retry later / ops |
| EC-DOC-009 | Metadata exists, blob missing | S1 | Storage object lost | Open fails with unavailable message | Restore from backup |
| EC-DOC-010 | Permanent delete mistake | S2 | User confirms delete | Gone; no recycle bin | Restore system backup if critical (Admin) |
| EC-DOC-011 | Delete cancel | S4 | User cancels warning | No delete | None |
| EC-DOC-012 | Corrupted file uploaded | S2 | Damaged PDF/image | Stored as-is; open may fail in browser | Re-upload good file; delete bad |
| EC-DOC-013 | Virus/malware file | S2 | Malicious upload | Version 1.0 has no guaranteed AV; ops may add gateway scanning later | Block at perimeter if available |
| EC-DOC-014 | Viewer tries delete | S2 | Viewer delete | Denied | Use Full-access role |
| EC-DOC-015 | Open document after local original moved | S3 | User deleted PC copy | CWMS copy still opens | None (by design) |

---

## 5. Expenditure Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-EXP-001 | General expense assign to deleted work | S2 | Assign target missing | Block; work not found | Pick valid work |
| EC-EXP-002 | Assign already assigned expense | S3 | Reassign | Allowed with audit; totals move | None |
| EC-EXP-003 | Split across works requested | S3 | User wants 40/60 | Not available in Version 1.0 | Two expenses or wait Version 2.0 |
| EC-EXP-004 | Cancel after assignment | S2 | Status Cancelled | Excluded from totals | Reactivate if allowed |
| EC-EXP-005 | Attachment on expense fails type check | S3 | Upload .xlsx | Reject | PDF/image only |
| EC-EXP-006 | Vendor free-text duplicates | S4 | Same vendor different spellings | Allowed | Manual consistency |

---

## 6. Schedule & Alert Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-SCH-001 | Overdue activity, work Completed | S3 | Completed but old activity dates | Overdue alert excludes Completed works | None |
| EC-SCH-002 | No finish date on activity | S3 | Finish blank | Not overdue via that activity finish rule | Enter finish |
| EC-SCH-003 | Clock skew / timezone | S3 | Server vs user TZ near midnight | Use consistent server date rules for alerts | Ops TZ config |
| EC-SCH-004 | All five alerts zero | S4 | Healthy portfolio | Show zeros / “No alerts” | None |
| EC-SCH-005 | Traffic light Red and Yellow both true | S3 | Multiple conditions | Show Red (highest severity) | Address critical issues |
| EC-SCH-006 | Hold work also overdue | S3 | Both | Red via Hold; still overdue for schedule alert count | Resume/replan |

---

## 7. Permissions & Security Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-SEC-001 | Permission denial Viewer mutate | S2 | Viewer save/delete | Denied; no data change | Use permitted role |
| EC-SEC-002 | Direct URL to Masters as Operator | S2 | Deep link | Access denied | Admin only |
| EC-SEC-003 | Inactive user login | S2 | Deactivated account | Login blocked | Admin reactivates |
| EC-SEC-004 | Brute force / many failed logins | S2 | Repeated bad passwords | Version 1.0 may not lockout unless added; still no access on failure | Ops may add rate limit later |
| EC-SEC-005 | Password with personal name | S2 | Fails personal-detail rule | Rejected | Choose compliant password |
| EC-SEC-006 | Demo password on production | S2 | Unchanged `Password@123` | Technically works; operational risk | Admin changes passwords |
| EC-SEC-007 | Remember Me on shared computer | S3 | Public PC | Session may persist | Do not use Remember Me; logout |
| EC-SEC-008 | Session timeout with dirty form | S2 | Idle past timeout | Data loss of unsaved form | Re-enter |
| EC-SEC-009 | Privilege escalation attempt | S1 | Tampered role client-side | Server enforces role; deny | Audit review |
| EC-SEC-010 | Restore by non-Admin | S1 | Operator restore attempt | Denied | Admin only |

---

## 8. Network, Browser, and Availability Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-NET-001 | Network interruption on save | S1 | Connection drop | No partial totals; error; retry | Reconnect; retry save |
| EC-NET-002 | Network interruption on multi-upload | S2 | Drop mid-batch | Completed files kept; failed listed | Retry failed |
| EC-NET-003 | Offline user expectation | S2 | User goes offline | App not usable for mutations; online-only product | Restore connectivity |
| EC-NET-004 | Slow network timeout | S3 | Long request | Clear timeout/error; no silent success | Retry |
| EC-NET-005 | Browser refresh mid-form | S3 | F5 on dirty form | Browser may warn; unsaved data lost if proceeded | Re-enter |
| EC-NET-006 | Browser back mid-wizard/tabs | S3 | Back button | Dirty discard rules / reshow form safely | Resume carefully |
| EC-NET-007 | Multiple tabs same user edit work | S2 | Two tabs lock/edit | One lock; second denied or same user contention handled safely | Use one tab |
| EC-NET-008 | Unexpected browser crash | S2 | Crash | Unsaved lost; lock expires | Retry later |
| EC-NET-009 | Unexpected shutdown of user machine | S2 | Power loss on client PC | Same as crash; server data last successful save intact | Resume online |
| EC-NET-010 | Cloud service outage | S1 | Public cloud down | Login/use unavailable with clear message | Wait/retry; status page if any |
| EC-NET-011 | Partial API failure on Dashboard | S3 | One widget fails | Other widgets show; failed widget Retry | Retry widget |
| EC-NET-012 | Report generation timeout | S3 | Heavy filter | Error; no corrupt file | Narrow filters; retry |

---

## 9. Backup, Restore, and Corruption Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-BAK-001 | Weekly backup failure | S1 | Job fails | History Status=Failed; prior backups kept | Ops fix; next run |
| EC-BAK-002 | Retention purge | S3 | Backup older than 30 days | Removed; not restorable | None |
| EC-BAK-003 | Restore wrong backup | S1 | Admin selects old point | Double confirm; after restore data matches that point | Restore newer backup if needed |
| EC-BAK-004 | Restore during active users | S1 | Users online | Writes blocked; users may be disrupted | Notify users; refresh/relogin |
| EC-BAK-005 | Corrupted backup artifact | S1 | Artifact unreadable | Restore fails; previous live state retained | Use another backup |
| EC-BAK-006 | Corrupted live DB/files | S1 | Storage corruption | Detect via errors; Admin restores last good backup | Restore |
| EC-BAK-007 | Backup succeeds but files incomplete | S1 | Partial artifact | Should mark Failed if integrity check fails | Rerun backup |
| EC-BAK-008 | Initial deploy no backup yet | S3 | Brand-new system | Empty history until initial/first weekly backup | Wait for initial backup assumption |
| EC-BAK-009 | Admin cancels restore confirm | S4 | Cancel | No changes | None |

---

## 10. Masters & Reference Data Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-MST-001 | Delete in-use category | S2 | Delete referenced Work Category | Block | Keep; create new; stop using old |
| EC-MST-002 | Rename category | S3 | Rename “Drain” → “Road Drain” | Future dropdown shows new name; old works keep saved value | Edit old works if needed |
| EC-MST-003 | Empty masters list | S3 | All deleted (if possible) | Forms show empty dropdown; Admin guidance | Re-add seeds |
| EC-MST-004 | Duplicate master names differing by case | S3 | “tds” vs “TDS” | Treat as duplicate (case-insensitive) | Use one |
| EC-MST-005 | Concurrent Admin edits same master | S4 | Two Admins | Last successful save wins; audited | Review audit |

---

## 11. Reporting Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-RPT-001 | Filters yield zero rows | S4 | Tight filters | Header + no records | Clear filters |
| EC-RPT-002 | FY boundary dates | S3 | 31 Mar / 1 Apr | Correct Apr–Mar membership | Verify FY |
| EC-RPT-003 | Saved filter owned by other user | S3 | Invisible to others | Per-user filters only | Recreate |
| EC-RPT-004 | Default filter missing | S4 | Deleted default | Open report with blank/default system filters | Set new default |
| EC-RPT-005 | Excel export large volume | S3 | Multi-year data | Completes or times out gracefully | Narrow range |
| EC-RPT-006 | Default branding only | S4 | Customer wants logo | Version 1.0 defaults; upload in Version 2.0 | Wait Version 2.0 |

---

## 12. Search Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-SRCH-001 | No matches | S4 | Odd query | Empty state | Clear search |
| EC-SRCH-002 | Partial chainage match | S3 | Query `104+6` | Returns matching works (partial match assumption) | Refine query |
| EC-SRCH-003 | Case differences | S3 | lower/upper | Case-insensitive match | None |
| EC-SRCH-004 | Leading/trailing spaces | S3 | Spaced query | Trim; still match | None |

---

## 13. Role Collaboration Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-ROLE-001 | Accounts bills while Engineer edits work | S2 | Concurrent | Work lock may block work edit; bill save recalculates aggregates safely | Coordinate; retry |
| EC-ROLE-002 | Operator deletes doc Accounts needs | S2 | Permanent delete | Gone | Restore backup if critical |
| EC-ROLE-003 | Viewer exports sensitive report | S3 | Viewer export allowed in interim model | Allowed read export | Tighten permissions in later version if needed |
| EC-ROLE-004 | Demo accounts used in live data | S2 | Training on production | Data pollution risk | Separate training discipline; change passwords |

---

## 14. Data Integrity Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-INT-001 | Orphan bill without work | S1 | Referential break | Must be impossible via validations/constraints | Repair via Admin/ops + backup |
| EC-INT-002 | Totals mismatch UI vs sum of bills | S1 | Recalc bug | Treat as defect; recalculation rules authoritative | Recalc job/fix; bugfix |
| EC-INT-003 | Partial save bill without rollup | S1 | Mid-transaction failure | Entire operation fails; no partial | Retry |
| EC-INT-004 | Unexpected server shutdown mid-save | S1 | Process kill | Transaction rolls back; last consistent state | Retry; check backup |
| EC-INT-005 | Clock jump affects days pending | S3 | Bad server time | Wrong days pending/alerts | Fix server time |

---

## 15. Localization / Format Edge Cases

| ID | Case | Sev | Trigger | Expected behaviour | Recovery |
|----|------|-----|---------|--------------------|----------|
| EC-FMT-001 | ₹ formatting large amounts | S3 | Crores values | Readable grouping | None |
| EC-FMT-002 | Decimal comma typed | S3 | Locale input | Reject or normalize per product input rules | Use `.` decimal |
| EC-FMT-003 | Date format ambiguity | S3 | DD/MM vs MM/DD | Consistent office format in UI | Follow UI format hints |

---

## 16. Explicitly Out-of-Scope Edge Cases (Version 1.0)

Do not design Version 1.0 handling for:

- Offline edit queues and sync merge conflicts  
- Multi-device offline last-write sync storms  
- Excel import row failures  
- BOQ line quantity mismatches  
- Recycle-bin restore races  
- Native mobile background upload agents  

(Online web failure modes above still apply.)

---

## 17. QA Priority Shortlist (Must-Test Edge Cases)

1. EC-WORK-001 Duplicate work order  
2. EC-LOCK-001 Edit lock  
3. EC-FIN-001 Negative balance  
4. EC-FIN-005 Partial payment  
5. EC-FIN-004 Gross vs Net balance basis  
6. EC-DOC-002/004 Type & size rejects  
7. EC-DOC-010 Permanent delete  
8. EC-NET-001 Save during network drop  
9. EC-BAK-003/006 Restore path  
10. EC-SEC-001 Viewer denial  
11. EC-WORK-006 Delete work with children  
12. EC-INT-003 No partial bill rollup  

---

## 18. Approval Record

| Role | Decision | Date |
|------|----------|------|
| Product Owner | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| QA Lead | ☐ Coverage sufficient for Version 1.0 | |
| Senior Business Analyst | ☐ Aligned to rules/validations | |

---

## 19. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-09 |
| Title | Edge Case Catalogue |
| Next Document | `10-reporting-catalogue.md` |

---

**End of Document 09 – Edge Case Catalogue**
