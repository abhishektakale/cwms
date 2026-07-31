# CWMS – Construction Work Management System  
## 01 – Product Vision

**Document Type:** Product Design Package – Product Vision  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Requirements Frozen, as amended)  
**Document Status:** Draft for Engineering Handoff  
**Source of Truth Basis:** Product discovery conversation (`dialog.md`) dated 2026-07-30, as amended by Product Owner decisions recorded in `00-executive-summary.md` dated 2026-07-31  
**Depends On:** `00-executive-summary.md`  
**Audience:** Product Owner, Engineering Leadership, UX, Business Analysis, Solution Architecture, Delivery Management  

---

## 1. Document Purpose

This Product Vision defines **why CWMS exists**, **who it serves**, **how those people use it**, and **how the product is intended to evolve** beyond Version 1.0.

It expands the Executive Summary into a product-facing vision suitable for design and delivery teams. It does not specify every field, screen control, or calculation formula; those appear in later documents (PRD, Functional Specification, Screen Specification, Business Rules, and related catalogues).

This document must remain consistent with:

- Frozen Version 1.0 functional scope from discovery
- Platform amendment: **online-only public-cloud web application**
- All Product Owner decisions recorded in Document 00 (roles, financial basis, masters, backup, documents, alerts, permissions, and deferred items)

---

## 2. Product Philosophy

### 2.1 Core Philosophy Statement

> **One Work → Everything Related to That Work in One Place**

CWMS treats each construction work as a complete **digital work file**. When a user opens a work, they should be able to reach:

- Work order and identity details
- Work value, GST treatment, balance, and financial progress
- Estimate information
- Schedule and progress
- Documents
- Billing and payments
- Expenditure
- Financial summary for that work

Users should not need to assemble a work’s story from disconnected spreadsheets, folders, and registers.

### 2.2 Design Philosophy Pillars

| Pillar | Meaning for CWMS |
|--------|------------------|
| Work-centric | The Work Register is the heart of the product. Billing, expenditure, estimates, schedules, and documents attach to a work. |
| Simple for daily office use | A competent office user should be able to learn core operations quickly (discovery target: about 30 minutes for basic use). |
| Professional for highway/civil work | Terminology, billing deductions, chainage/location concepts, RA bills, and financial standards match construction practice. |
| Automatic where possible | GST, totals, deductions totals, balances, and financial progress calculate automatically. |
| Consistent financial language | Work Portion Value, GST Amount, Total Work Value, Balance Work Value, Gross Bills, Net Bill, Payments, Outstanding, and Expenditure mean the same thing everywhere. |
| Modular and future-ready | Version 1.0 is a stable core. Version 2.0 and later can grow toward a broader construction management platform without discarding Version 1.0 data. |
| Controlled scope | Version 1.0 prefers a reliable core over advanced configurability and secondary modules that were explicitly deferred. |
| Online shared access | Version 1.0 is a central web application. Anyone with credentials and internet access can use it from any place on any browser. |

### 2.3 What CWMS Is

CWMS Version 1.0 is a **construction work management web system** for civil and highway project offices. It is purpose-built to manage works, documents, RA billing, expenditure, schedules, estimates, and management reports in one product.

It behaves like a lightweight, construction-specific operational system with ERP-like coverage of the work lifecycle, without claiming to be a full enterprise ERP.

### 2.4 What CWMS Is Not (Version 1.0)

CWMS Version 1.0 is **not**:

- A desktop installer product (superseded by web amendment)
- An offline-first local database client
- A synchronization product between offline copies
- A quantity-based BOQ / Measurement Book billing engine
- A full Notification Centre / reminder platform
- A mobile native application
- An inventory, plant & machinery, attendance, or stores system
- An accounting-package replacement
- A tendering suite
- A GIS / GPS field platform

Those belong to later vision stages unless a formal scope change revises Version 1.0.

### 2.5 Experience Principles

1. **Open a work, see the whole file.** Navigation and information architecture reinforce the digital work file.
2. **Prefer clarity over cleverness.** Screens and labels use construction office language.
3. **Prevent avoidable errors.** Duplicate work-order checks, date validation, financial auto-calculation, edit locking, and delete warnings protect data quality.
4. **Make management visibility immediate.** Dashboard KPIs, traffic lights, and a small set of simple alerts surface attention items without requiring report construction first.
5. **Keep administration intentional.** Version 1.0 excludes a vague catch-all Settings module. Administration capabilities that are in scope (users/demo roles, restore, masters page, backup visibility as applicable) are explicit.
6. **Support learning with demo accounts.** First-run includes one demo account per role so teams can explore safely.

---

## 3. Vision Statement

### 3.1 Version 1.0 Vision

CWMS Version 1.0 will be the organization’s **central online system of record for construction works**, enabling office and remote users to create and maintain works, attach documents, enter RA bills and expenses, track balances and progress, and produce official PDF/Excel reports—securely, consistently, and without depending on fragmented files.

### 3.2 Long-Term Vision

Over successive versions, CWMS is intended to grow into a broader **construction management platform** for the same organization, potentially including:

- Richer configurability and client-format depth
- Quantity-based billing with BOQ and Measurement Book support
- Work diary / remarks history
- Mobile field capabilities
- GPS / map and site inspection enrichment
- Advanced notifications and reminders
- QR / barcode work-file access
- Inventory, machinery, attendance, purchase, and stores modules
- Correspondence and quality/safety modules
- Accounting integrations

The long-term vision is aspirational. It must not enlarge Version 1.0 scope.

---

## 4. Users

### 4.1 Official Version 1.0 Roles

| Role | Product Intent | Version 1.0 Access Rule |
|------|----------------|-------------------------|
| **Administrator** | Owns system integrity, users, restore, and maintainable option lists | Full access |
| **Data Entry Operator** | Performs day-to-day creation and update of operational records | Full access |
| **Engineer** | Works with works, schedules, documents, and project execution data | Full access |
| **Accounts** | Works with billing, payments, expenditure, and financial reporting | Full access |
| **Viewer** | Reviews information and reports without changing data | **View only** |

Version 1.0 uses an **interim permission model**: four operational/admin roles have full access to all modules; Viewer is restricted to view-only. A finer permission matrix may be introduced in a later version.

### 4.2 User Communities

| Community | How they use CWMS |
|-----------|-------------------|
| Office operations staff | Create and maintain works, upload documents, enter bills and expenses, run registers |
| Engineering / site coordination users | Check work status, schedules, documents, progress, and hold conditions from any location |
| Accounts / billing users | Enter RA bills, deductions, payments; monitor outstanding amounts and financial summaries |
| Managers / reviewers | Use dashboard, traffic lights, alerts, and reports for oversight |
| System administrator | Maintain masters, restore from backup when needed, oversee user readiness |

### 4.3 Access Context

Users may open CWMS:

- From **any place** with internet access
- On **any browser**
- With approximately **50 concurrent users** as the initial Version 1.0 target
- Against an expected volume of about **200 works per year**, growing over multiple years

---

## 5. Stakeholders

### 5.1 Business Stakeholders

| Stakeholder | Interest in CWMS |
|-------------|------------------|
| Product Owner / Domain Expert | Defines workflow truth for highway/civil operations; approves scope and amendments |
| Office management | Needs portfolio visibility: works, values, bills, expenditure, outstanding, holds, delays |
| Accounts leadership | Needs trustworthy billing, deduction, payment, and outstanding reporting |
| Engineering leadership | Needs work status, schedule, document completeness, and progress visibility |
| Operations / IT support (organizational) | Needs backup/restore readiness and stable public-cloud access |

### 5.2 Delivery Stakeholders

| Stakeholder | Responsibility |
|-------------|----------------|
| Principal Product Manager | Scope integrity, prioritization, Version 1.0 vs Version 2.0 boundary |
| Principal Software Architect | Product-consistent architecture that satisfies online web, multi-user, backup, and file-storage constraints |
| Principal UX Designer | Interaction model, visual theme decisions, learnability, work-centric navigation |
| Enterprise Solution Architect | Hosting, identity, storage, backup, and enterprise fit for public-cloud deployment |
| Senior Business Analyst | Requirements traceability from discovery and Product Owner decisions into specifications |
| Engineering implementation team | Build Version 1.0 against the design package |
| Testing / acceptance team | Prove acceptance criteria with realistic volume and role scenarios |

### 5.3 Stakeholder Success Definition

Stakeholders succeed when:

- Works are entered once and reused everywhere
- Financial figures match the official CWMS financial standard
- Documents are findable and openable from the work
- RA billing and expenditure are auditable
- Reports are meeting-ready
- The system remains available online without an offline/sync operational model
- Version 2.0 ideas are parked without destabilizing Version 1.0

---

## 6. Personas

Personas below are product-level composites derived from discovery roles and workflow. They are not named individuals from the Product Owner’s organization.

### 6.1 Persona A – Priya, Administrator

**Role in CWMS:** Administrator  

**Goals**
- Keep CWMS usable for the office
- Maintain dropdown option lists as department practice changes
- Restore data if a serious error occurs
- Ensure demo and real users can sign in safely

**Typical activities**
- Sign in as Administrator
- Maintain Work Categories, Document Types, Deduction Heads, Expense Categories, Client/Department Formats on the Masters page
- Perform restore when authorized and required
- Review backup history readiness
- Support password rule compliance

**Pain points without CWMS**
- Option lists buried in spreadsheets
- No controlled restore path
- Inconsistent categories across users

**Version 1.0 success for Priya**
- Masters page is clear and safe
- Restore is Administrator-only and understandable
- Demo accounts exist for training

### 6.2 Persona B – Ramesh, Data Entry Operator

**Role in CWMS:** Data Entry Operator  

**Goals**
- Enter new works quickly and correctly
- Attach documents without folder chaos
- Avoid retyping the same work details into billing and expenditure

**Typical activities**
- Create works with project name (typed or selected from existing names)
- Enter GST Extra / GST Included financial details
- Upload PDF/image documents
- Create bills and expenses linked to works
- Search and update existing records

**Pain points without CWMS**
- Duplicate registers
- Lost files
- Manual balance mistakes

**Version 1.0 success for Ramesh**
- One work entry feeds all related modules
- Automatic calculations reduce arithmetic errors
- Multi-file upload is straightforward

### 6.3 Persona C – Ananya, Engineer

**Role in CWMS:** Engineer  

**Goals**
- Know work status, schedule, and document completeness
- Identify delayed or on-hold works quickly
- Access drawings/PDFs and work details from site or office

**Typical activities**
- Open Work Summary / work details
- Update schedule and physical progress
- Check traffic lights and dashboard alerts
- Open PDF/image documents for a chainage or structure

**Pain points without CWMS**
- Status known only through phone calls and scattered files
- Difficult to see which works are delayed or missing documents

**Version 1.0 success for Ananya**
- Traffic lights and alerts highlight problem works
- Work-centric document access works from any browser/location

### 6.4 Persona D – Suresh, Accounts

**Role in CWMS:** Accounts  

**Goals**
- Enter RA bills and deductions accurately
- Track net payable, payments, and outstanding amounts
- Produce billing and pending payment reports

**Typical activities**
- Create RA / Final bills with standard and flexible other deductions
- Record payment status and payment details
- Compare Gross Bills Raised against Total Work Value
- Export/print billing and outstanding reports

**Pain points without CWMS**
- Deduction formats vary by client/department and are hard to standardize in spreadsheets
- Outstanding tracking is manual

**Version 1.0 success for Suresh**
- Flexible deductions support real bill formats
- Gross-bill-based balance and progress are clear
- Payments and outstanding remain visible as separate figures

### 6.5 Persona E – Meera, Viewer (Management Reviewer)

**Role in CWMS:** Viewer  

**Goals**
- Review portfolio and work financials without risk of accidental edits
- Use dashboard and reports in review meetings

**Typical activities**
- Sign in as Viewer
- View dashboard KPIs, alerts, and traffic lights
- Open works and reports in read-only mode
- Export/print where view permissions allow read-only outputs as specified later

**Pain points without CWMS**
- Depends on others to prepare ad-hoc summaries
- No safe read-only system role

**Version 1.0 success for Meera**
- View-only access is enforced
- Dashboard and reports answer management questions quickly

---

## 7. Use Cases

Use cases below are Version 1.0 product use cases. Detailed interaction steps appear in Document 03 and Document 05.

### 7.1 Authentication and Access

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-01 | Sign in | Any role | Authenticate with username and password |
| UC-02 | Use Remember Me | Any role | Remain signed in on the browser according to Remember Me behaviour |
| UC-03 | Change password | Any role (as permitted) | Set a new password that meets password rules |
| UC-04 | Sign in with demo account | Trainee / reviewer | Explore CWMS using seeded role demos |
| UC-05 | Session timeout | System / Any role | End inactive sessions according to product security behaviour defined in later specs |

**Password rules (binding):**
- Minimum 8 characters
- Mix of uppercase and lowercase letters
- Numbers and symbols required
- Avoid personal details

**Demo accounts (binding):**

| Username | Password | Role |
|----------|----------|------|
| Administrator | Password@123 | Administrator |
| Data Entry Operator | Password@123 | Data Entry Operator |
| Engineer | Password@123 | Engineer |
| Accounts | Password@123 | Accounts |
| Viewer | Password@123 | Viewer |

### 7.2 Dashboard and Oversight

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-06 | View dashboard KPIs | Any role | See totals for works, values, bills, payments, outstanding, expenditure |
| UC-07 | Use quick actions | Full-access roles | Start New Work, Billing, Expenditure, Documents, Reports, Backup-related navigation as available |
| UC-08 | Review traffic lights | Any role | Identify green / yellow / red work attention states |
| UC-09 | Review simple alerts | Any role | See Pending bills, Overdue/delayed schedule, Outstanding payments, Missing key documents, Works on Hold |
| UC-10 | Open recent works / activities | Any role | Jump into recently touched work context |

### 7.3 Work Register and Digital Work File

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-11 | Create work | Full-access roles | Register a new work with auto Work Code |
| UC-12 | Assign/select project (light) | Full-access roles | Enter project name free text or choose from existing project names |
| UC-13 | Enter financials (GST Extra / Included) | Full-access roles | Capture Work Portion Value, GST %, GST Amount, Total Work Value correctly |
| UC-14 | Enter location / chainage details | Full-access roles | Capture location and structure context for highway/civil works |
| UC-15 | Set work status | Full-access roles | Use Planned / In Progress / Hold / Completed |
| UC-16 | Edit work | Full-access roles | Update work details under edit lock rules |
| UC-17 | View work summary | Any role | See one-screen financial and navigation summary for a work |
| UC-18 | Search / filter works | Any role | Find works by work order, name, client, contractor, chainage, project, date, status, work code |
| UC-19 | Export work register | Full-access / as permitted | Export register outputs |
| UC-20 | Detect duplicate work order | System / Full-access roles | Prevent or warn on duplicate Work Order Numbers |

**Edit concurrency (binding):**  
If another user is editing the same work, the system locks editing and shows a message that edit is in progress by another user.

### 7.4 Estimate and Schedule

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-21 | Maintain estimate for a work | Full-access roles | Record estimate number, date, amount, related details/documents as specified |
| UC-22 | Maintain schedule activities | Full-access roles | Record activities, planned/actual dates, progress |
| UC-23 | Update physical/financial progress indicators | Full-access roles | Keep progress visible at work level (financial progress driven by Gross Bills Raised) |

### 7.5 Document Management

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-24 | Upload one document | Full-access roles | Store a PDF/image copy against a work and document type |
| UC-25 | Upload multiple documents | Full-access roles | Add many files in one operation |
| UC-26 | Open / download / print document | Any role (view/open as permitted) | Retrieve stored file from CWMS storage |
| UC-27 | Delete document | Full-access roles | Permanently delete after warning confirmation |
| UC-28 | Search documents | Any role | Find by work, type, number, title, date |
| UC-29 | Review missing documents | Any role | Use missing-document reporting/alert support |

**Document constraints (binding):**
- File types: PDF and images only
- Max size: 20 MB per file
- Storage: copied into CWMS-managed cloud file/object storage
- No recycle bin in Version 1.0
- Delete is permanent with warning

### 7.6 Billing

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-30 | Create RA / Final bill | Full-access roles | Enter bill against a work using single-total-amount model |
| UC-31 | Enter standard deductions | Full-access roles | Capture Security Deposit, TDS, GST TDS, Labour Cess, Royalty, Recovery, etc. |
| UC-32 | Enter flexible other deductions | Full-access roles | Add multiple custom deduction lines |
| UC-33 | Record payment details | Full-access roles | Track Pending / Partially Received / Fully Received and payment references |
| UC-34 | View bill history for a work | Any role | See chronological bill and payment status |
| UC-35 | Rely on system bill number | System | Always assign background System Bill Number for audit; user RA Bill No. when available |

### 7.7 Expenditure

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-36 | Create work-specific expense | Full-access roles | Link expense to one work |
| UC-37 | Create general expense | Full-access roles | Record expense without immediate work link |
| UC-38 | Assign general expense to one work | Full-access roles | Assign 100% of a general expense to one work |
| UC-39 | Attach expense supporting files | Full-access roles | Upload allowed PDF/image attachments where expenditure attachments are in scope |
| UC-40 | Review work expenditure and estimated profit/loss | Any role | See expenditure contribution in work financial summary |

### 7.8 Masters / Option Lists

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-41 | Maintain Work Categories | Administrator | Add/edit/delete categories used on forms |
| UC-42 | Maintain Document Types | Administrator | Add/edit/delete document types |
| UC-43 | Maintain Deduction Heads | Administrator | Add/edit/delete deduction heads |
| UC-44 | Maintain Expense Categories | Administrator | Add/edit/delete expense categories |
| UC-45 | Maintain Client/Department Formats | Administrator | Add/edit/delete format options selectable on forms |

Initial seeded examples from Product Owner / discovery include:

- **Work Categories:** Drain, Bridge, RE Wall, Service Road, PQC, Safety Work, etc.
- **Document Types:** Work Order, Estimate, Drawing, BOQ, Letter, MB, Site Photos, etc.
- **Deduction Heads:** TDS, GST, Security Deposit, Labour Cess, Royalty, Retention, plus custom deductions in billing
- **Expense Categories:** Labour, Material, Fuel, Machinery, Transport, Office Expenses, etc.
- **Client/Department Formats:** selectable format options for different clients/departments

### 7.9 Reports

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-46 | Run Work Register Report | Any role as permitted | Produce filtered work register |
| UC-47 | Run Billing Report | Any role as permitted | Produce bill register with payment status |
| UC-48 | Run Expenditure Report | Any role as permitted | Produce expense register |
| UC-49 | Run Financial Summary | Any role as permitted | Produce portfolio financial summary |
| UC-50 | Run Work-wise Summary | Any role as permitted | Produce one-work management summary |
| UC-51 | Run Pending Payment Report | Any role as permitted | Identify outstanding bill payments |
| UC-52 | Run Document Register | Any role as permitted | List documents |
| UC-53 | Run General Expense Report | Any role as permitted | Review general expenses and assignment state |
| UC-54 | Run Dashboard Summary Report | Any role as permitted | Management snapshot |
| UC-55 | Save / reuse report filters | Full-access roles | Save, rename, set default, delete saved filters |
| UC-56 | Print / PDF / Excel export | Any role as permitted | Produce official outputs |

**Report branding (Version 1.0):** default company/office name and logo only. Custom upload deferred to Version 2.0.

**Financial year filters:** April–March.

### 7.10 Backup and Restore

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-57 | Automatic weekly backup | System | Protect business data and stored documents |
| UC-58 | Retain backups 30 days | System | Keep restore points for 30 days |
| UC-59 | View backup history | Administrator / as specified | Confirm backups exist |
| UC-60 | Restore from backup | Administrator only | Restore CWMS system data after approved recovery need |

### 7.11 Search

| ID | Use Case | Primary Actor | Goal |
|----|----------|---------------|------|
| UC-61 | Global / module search | Any role | Find works and related records by approved attributes |

---

## 8. Product Narrative: How Version 1.0 Fits Daily Work

### 8.1 A Day in the Office

1. User signs in from office or remote browser.
2. Dashboard shows portfolio KPIs, traffic lights, and simple alerts.
3. Data Entry Operator creates a new RE Wall work under an existing project name, enters GST Included values, and uploads the work-order PDF.
4. Engineer updates schedule dates and physical progress.
5. Accounts enters RA Bill with deductions and marks payment pending.
6. Manager (Viewer) opens Pending Payment and Work-wise Summary reports for a review meeting.
7. System performs weekly backup automatically; Administrator can restore if ever required.

### 8.2 The Digital Work File Journey

```text
Create Work
   → Add Estimate
   → Plan Schedule
   → Upload Documents
   → Raise RA Bills / Record Payments
   → Record Expenditure
   → Monitor Balance & Financial Progress (Gross Bills)
   → Review Reports / Alerts / Traffic Lights
   → Mark Completed
```

Every step remains attached to the same Work Code / Work ID.

---

## 9. Financial Vision (Product Level)

CWMS Version 1.0 standardizes construction financial language:

| Term | Meaning |
|------|---------|
| Work Portion Value | Value excluding GST |
| GST % | Free-number percentage input |
| GST Amount | Calculated (forward or reverse by GST Extra / Included) |
| Total Work Value | Work Portion Value + GST Amount |
| Gross Bills Raised | Basis for Balance Work Value and Financial Progress |
| Net Bill | After deductions |
| Payments Received | Separate tracked figure |
| Outstanding | Separate tracked figure |
| Expenditure | Cost against work and/or general expenses |
| Estimated Profit/Loss | Work-level financial outcome view |

**Binding calculation basis:**  
Balance Work Value and Financial Progress use **Gross Bills Raised**. Payments, Outstanding, and Net Bill are shown separately and do not redefine the progress denominator.

---

## 10. Long-Term Vision Roadmap (Non-Binding Beyond Version 1.0)

### 10.1 Version 1.0 – Stable Core (Binding Delivery Scope)

Online web CWMS with:

- Login and roles
- Dashboard, traffic lights, simple alerts
- Work Register (digital work file)
- Light project association
- Estimate and Schedule
- Documents (PDF/images)
- Billing (single-total RA model) and Expenditure
- Reports with saved filters
- Masters page for option lists
- Weekly automatic backup with 30-day retention
- Administrator restore
- Audit logging as required by discovery

### 10.2 Version 1.1 – Harden and Refine

- Bug fixes
- Minor usability improvements
- Additional report/search refinements without major scope expansion

### 10.3 Version 2.0 – Major Enhancements (Deferred)

Including, as directed or deferred by discovery and later Product Owner decisions:

- Excel data import
- Company/logo upload and custom report branding
- Full Notification Centre
- Work Diary / Remarks History
- Quantity-based BOQ / MB billing
- Multi-work split of general expenses
- Mobile application
- GPS / site inspection enrichment
- QR code work-file access
- Finer role permission matrix
- Document recycle bin
- Full Projects module
- Broader workflow / format engines beyond Version 1.0 masters

### 10.4 Later Vision (Version 3.0 and Beyond)

- Inventory and stores
- Plant & machinery
- Employee attendance
- Purchase orders
- Quality and safety modules
- Advanced correspondence
- Accounting integrations
- Broader construction ERP capabilities

---

## 11. Product Differentiation

CWMS differentiates itself from generic spreadsheets or generic ERP by:

1. Being **work-file centric** for highway/civil operations
2. Supporting **GST Extra and GST Included** work orders under one standard
3. Supporting **RA bill deductions** with flexible other deductions
4. Combining **documents + billing + expenditure + schedule** on one work
5. Providing **construction-relevant alerts and traffic lights**
6. Remaining **simple enough for daily office use** while staying expandable

---

## 12. Adoption Vision

### 12.1 Adoption Goals

- Replace fragmented work registers and ad-hoc folders as the primary operational record for works in scope
- Make demo accounts the training on-ramp
- Make Viewer-safe review possible for management
- Keep Version 1.0 narrow enough that the office can trust it quickly

### 12.2 Adoption Risks to Manage

| Risk | Vision Response |
|------|-----------------|
| Users keep parallel spreadsheets | Ensure Work Summary and reports are faster than manual assembly |
| Fear of breaking data | Edit locks, validations, weekly backups, Admin restore |
| Role confusion | Five named roles with Viewer clearly read-only |
| Scope creep | Strict Version 2.0 deferral list |

---

## 13. Alignment to Discovery Philosophy and Amendments

| Discovery Idea | Version 1.0 Vision Position |
|----------------|-----------------------------|
| Desktop offline-first app | Amended to online-only public-cloud web app |
| Server synchronization | Removed from Version 1.0 |
| One Work → everything in one place | Retained as core philosophy |
| Configurable masters in Version 2.0 | Amended: selected option lists are Admin-maintainable in Version 1.0 on a separate Masters page |
| Settings module | Vague Settings module excluded; explicit admin capabilities retained |
| Chainage / structure fields | Retained in work location concept |
| Gantt / advanced planning | Deferred |
| Mobile / GPS / QR | Deferred |
| Quantity billing | Deferred |

---

## 14. Vision Success Criteria

The Product Vision is realized for Version 1.0 when:

1. Users describe CWMS as “the place we open a work and find everything.”
2. Financial discussions use one shared vocabulary and Gross-Bills-based progress.
3. Documents are retrieved from CWMS storage, not personal folders.
4. Dashboard alerts and traffic lights drive daily attention.
5. Reports for meetings are produced from CWMS, not rebuilt in spreadsheets.
6. Administrators can maintain option lists and restore when needed.
7. The organization can grow into Version 2.0 without replacing Version 1.0 data.

---

## 15. Out-of-Vision Reminders for Delivery Teams

Delivery teams must not interpret long-term vision as Version 1.0 authorization.

Especially do **not** pull into Version 1.0:

- Offline mode or sync
- Excel data import
- Company/logo upload
- Recycle bin
- Full Projects module
- Native mobile app
- BOQ/MB quantity billing
- Full Notification Centre
- Finer permission matrix beyond Viewer vs full access

---

## 16. Approval Record

| Role | Name | Decision | Date |
|------|------|----------|------|
| Product Owner | | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Principal Product Manager (Documentation) | | ☐ Complete for handoff | |
| Principal UX Designer (Product-level review) | | ☐ Personas/use cases support UX design | |
| Senior Business Analyst (Product-level review) | | ☐ Traceable to discovery + Document 00 decisions | |

---

## 17. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-01 |
| Title | Product Vision |
| Product | CWMS – Construction Work Management System |
| Version covered | 1.0 (Frozen Scope, as amended) |
| Source | `dialog.md` + `00-executive-summary.md` decisions |
| Dependency | Document 00 – Executive Summary |
| Next Document | `02-product-requirements-document.md` |

---

**End of Document 01 – Product Vision**
