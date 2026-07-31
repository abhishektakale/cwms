# CWMS – Construction Work Management System  
## 00 – Executive Summary

**Document Type:** Product Design Package – Executive Summary  
**Product Name:** CWMS – Construction Work Management System  
**Version Scope Covered:** Version 1.0 (Requirements Frozen)  
**Document Status:** Draft for Engineering Handoff (Platform amended)  
**Source of Truth Basis:** Product discovery conversation (`dialog.md`) dated 2026-07-30, as amended by Product Owner direction dated 2026-07-31  
**Audience:** Product Owner, Engineering Leadership, UX, Business Analysis, Solution Architecture, Delivery Management  

### Amendment Record

| Date | Change | Authority |
|------|--------|-----------|
| 2026-07-31 | Platform changed from Windows Desktop Application to **Web Application**. Related deployment, offline, sync, backup, and deliverable statements in this document are amended or flagged as Open Questions where discovery detail is no longer sufficient. | Product Owner |
| 2026-07-31 | Operating model confirmed: **online-only web application**; **no offline mode**; **Synchronization module removed from Version 1.0**. Hosting confirmed as **cloud**, with private vs public to be finalized later. | Product Owner |
| 2026-07-31 | Access model confirmed: users may open CWMS from **any place** on **any browser** (internet-connected). | Product Owner |
| 2026-07-31 | Document storage: **cloud/server-managed only**. Concurrent users target: **50** initially. Cloud type: **public**. Browser policy: **allow all**. | Product Owner |
| 2026-07-31 | Backup: **system automatic** only. Frequency to be chosen for **best cost saving** (amends discovery “daily backup” wording; exact cadence is an operational parameter, not a fixed Product Owner mandate of daily). | Product Owner |
| 2026-07-31 | Restore: **Administrator only**. File handling: **copy** into CWMS-managed file storage (dedicated file/object storage; Product Owner indicated likely S3). Roles: **Administrator, Data Entry Operator, Engineer, Accounts, Viewer**. Dashboard: **traffic lights + a few simple alerts** in Version 1.0. Settings: **system/global settings** only; discovery “master” lists are **form field options** in Version 1.0 (see DEC-WEB-16+). | Product Owner |
| 2026-07-31 | Administrator may **add / edit / delete** Version 1.0 option lists: Work Categories, Document Types, Deduction Heads, Expense Categories, Client/Department Formats. (Pulls maintainable masters into Version 1.0; amends earlier discovery deferral of configurable masters to Version 2.0 for these lists.) | Product Owner |
| 2026-07-31 | System/global **Settings module excluded from Version 1.0** due to lack of clarity. Option-list maintenance on a **separate page**. Work statuses: Planned/In Progress/Hold/Completed. Clients/Contractors/Vendors: **free text**. Bills: user RA Bill No. when available + **system Bill Number** for audit. Concurrent edit: **lock with message**. Documents: **PDF/images** only. Report header: user-uploadable company/office name and logo. FY: **April–March**. GST %: **free number**. Theme: UI/UX designer decision. **Excel data import in Version 1.0**. Permissions: all roles full access except **Viewer (view only)**. | Product Owner |
| 2026-07-31 | Projects: **light** model in Version 1.0. Document recycle bin: **not required**. Login: **Remember Me** + **password rules**; first run seeds **one demo account per role**. Financial progress/balance based on **Gross Bills Raised**. Max upload: **20 MB per file**. Backup retention: **30 days**. | Product Owner |
| 2026-07-31 | Dashboard alerts confirmed. Password rules: globally accepted standards. Demo usernames = role names. Projects light: free text + dropdown of existing names. Company name/logo: **defaults in Version 1.0**, upload in Version 2.0. Excel data import moved to **Version 2.0**. Backup frequency: **weekly**. Document delete: **permanent with warning**. | Product Owner |
| 2026-07-31 | Password rules finalized: minimum **8 characters**; mix of **upper and lower case**, **numbers**, and **symbols**; **avoid personal details**. | Product Owner |
| 2026-07-31 | Demo account password for all five role demos: **Password@123**. | Product Owner |

---

## 1. Document Purpose

This Executive Summary establishes the official product charter for **CWMS – Construction Work Management System**. It converts the product discovery conversation into a formal, enterprise-grade statement of:

- Why the product exists
- What business problem it solves
- What outcomes Version 1.0 must deliver
- What is in scope and what is explicitly deferred
- What constraints govern delivery
- How success will be measured

This document is **not** a technical design. It does not prescribe programming languages, frameworks, APIs, or implementation patterns. It defines the product commitment that subsequent specification documents will expand into complete functional, screen, domain, validation, reporting, and acceptance detail.

All subsequent documents in this design package must remain consistent with this Executive Summary. Where later documents expand detail, they must not contradict Version 1.0 frozen scope.

---

## 2. Project Overview

### 2.1 Product Identity

| Attribute | Definition |
|-----------|------------|
| Product Name | CWMS – Construction Work Management System |
| Product Short Name | CWMS |
| Product Category | Construction / Highway Work Management Web System |
| Primary Deployment Form | Web Application (browser-accessed) |
| Operating Model | Online-only central web application; users require internet connectivity; accessible from any place on any browser; no offline mode; no client/server synchronization module in Version 1.0 |
| Initial Release Target | Version 1.0 |
| Subsequent Minor Release Track | Version 1.1 (bug fixes and minor improvements) |
| Major Enhancement Track | Version 2.0 (deferred enhancements and configurability) |

The product name **CWMS – Construction Work Management System** was selected and confirmed by the Product Owner during discovery. An alternative name (NH Project Management System / NHPMS) was considered and rejected in favour of CWMS because CWMS is professional, generic, and suitable for all future civil and highway projects.

### 2.2 Organizational Context

CWMS is intended for use by a **civil / highway construction company** (or equivalent project office) that manages a substantial volume of works each year. Discovery established an expected operating volume of approximately **200 works per year**.

The organization currently needs a structured digital system to manage:

- Works and work orders
- Estimates
- Schedules
- Billing (including Running Account / RA bills and deductions)
- Expenditure
- Documents
- Reports
- Backup

The system must support day-to-day operations through an **online-only web application** accessible from **any place** over the internet using **any browser**. Version 1.0 does **not** include offline working and does **not** include a Synchronization module. Hosting is **public cloud**.

### 2.3 Product Philosophy (Summary)

CWMS is founded on the principle:

> **One Work → Everything Related to That Work in One Place**

When a user opens a work record, the system must present the complete digital file for that work: work order, values and balances, estimate, schedule, documents, bills, expenditure, and financial summary. Users should not need to search across disconnected modules or folders to assemble a complete picture of a single work.

Version 1.0 deliberately prioritizes a **stable, reliable core** over advanced configurability and secondary productivity features. Advanced customization and enrichment features are deferred to Version 2.0 under formal change control.

### 2.4 Nature of the System

CWMS Version 1.0 is a **lightweight, construction-specific work management system** with ERP-like characteristics for works, billing, expenditure, documents, and reporting. It is not a full enterprise ERP, tendering suite, inventory system, accounting package, or mobile field operations platform. Those capabilities belong to future versions unless explicitly included in Version 1.0 frozen scope.

---

## 3. Problem Statement

### 3.1 Current Business Problem

The Product Owner needs to manage construction works and their associated financial, documentary, and scheduling information in a single controlled system. Without such a system, work information is fragmented across:

- Manual registers or spreadsheets
- Physical files and folders
- Disconnected billing records
- Separate expenditure tracking
- Unstructured document storage

This fragmentation creates the following operational problems:

1. **Incomplete work visibility**  
   A single work’s order, estimate, schedule, bills, expenditure, and documents are not available as one coherent digital file.

2. **Financial ambiguity**  
   Work order amounts may be GST-extra or GST-included. Without a standard financial model, balances, GST, billed amounts, and outstanding amounts become inconsistent across registers and reports.

3. **Billing complexity**  
   Running Account (RA) bills require department/client-format deductions (security deposit, TDS, GST TDS, labour cess, royalty, recovery, and other flexible deductions). Manual handling of these deductions increases error risk and slows payment tracking.

4. **Weak expenditure control**  
   Expenses may be work-specific or general. Without a controlled way to record both, and later assign general expenses to works, profit/loss and cost visibility remain incomplete.

5. **Document retrieval difficulty**  
   Construction works accumulate many documents of the same type (multiple drawings, revised estimates, letters, amendments). Searching folders manually is slow and error-prone.

6. **Reporting burden**  
   Management needs work registers, bill registers, expenditure registers, pending payment views, financial summaries, and work-wise summaries in printable and exportable formats. Producing these manually is time-consuming and inconsistent.

7. **Shared online access need**  
   Office staff need reliable access to a shared system for daily operations. Version 1.0 addresses this through an online-only web application. Continuity therefore depends on internet connectivity and cloud availability rather than local offline operation.

8. **Multi-user / any-location access need**  
   More than one user may need access to the same works, bills, documents, and reports from any place with internet access. A central cloud web application provides that shared access model.

### 3.2 Consequence of Not Solving the Problem

If CWMS is not delivered:

- Work records remain fragmented and difficult to audit
- Financial balances and GST handling remain inconsistent
- Billing deductions remain error-prone
- Document retrieval remains slow
- Management reporting remains manual
- Offline continuity remains unreliable
- Future synchronization and expansion become more expensive

### 3.3 Opportunity Statement

By delivering CWMS Version 1.0, the organization gains a dedicated web system that:

- Treats each work as a complete digital file
- Standardizes financial terminology and calculations
- Automates balances, GST, deductions, and financial progress
- Stores and retrieves unlimited documents per work and category
- Produces official reports in PDF and Excel
- Operates as an online-only web application with controlled backup/restore
- Provides a stable foundation for Version 2.0 enhancements without redesigning core data relationships

---

## 4. Business Goals

The following business goals were established and confirmed during discovery. They define the commercial and operational purpose of CWMS Version 1.0.

### 4.1 Primary Business Goals

| ID | Business Goal | Description |
|----|---------------|-------------|
| BG-01 | Centralize work management | Maintain all works in one controlled register with unique work identity and linked child records. |
| BG-02 | Digitize the work file | Ensure every work has its work order, estimate, schedule, documents, bills, expenditure, and financial summary available from one place. |
| BG-03 | Standardize financial handling | Apply one official financial standard for Work Portion Value, GST, Total Work Value, Balance Work Value, billing, and dashboard reporting. |
| BG-04 | Control billing and deductions | Capture RA Bills / Final Bills, standard deductions, flexible other deductions, net payable, and payment status accurately. |
| BG-05 | Track expenditure against works | Record work-specific and general expenses, allow assignment of general expenses to works, and support estimated profit/loss visibility. |
| BG-06 | Organize project documents | Store unlimited documents per category per work, with automatic folder organization and safe file retention. |
| BG-07 | Enable management reporting | Produce printable and exportable registers and financial reports suitable for office records and review meetings. |
| BG-08 | Ensure operational continuity | Provide reliable online web access for daily office use, with backup/restore appropriate to the cloud hosting model. |
| BG-09 | Protect data integrity | Prevent partial saves, support restore from backup, maintain audit history of important changes, and preserve data across version upgrades. |
| BG-10 | Establish a future-ready foundation | Deliver a modular Version 1.0 that can accept Version 2.0 enhancements without breaking existing project data. |

### 4.2 Supporting Business Goals

| ID | Supporting Goal | Description |
|----|-----------------|-------------|
| BG-11 | Reduce training burden | Design the product so office users can learn core operations quickly (discovery target: approximately 30 minutes for basic use). |
| BG-12 | Support multi-project growth | Structure works under projects so multiple projects can be managed without later database redesign. |
| BG-13 | Support realistic volume | Reliably manage approximately 200 works per year, with multiple bills, expenses, and documents per work, and remain usable as historical volume grows over years. |
| BG-14 | Maintain professional governance | Use version numbering, change control, changelog, and frozen requirements discipline as in commercial software products. |

---

## 5. Objectives

Objectives translate business goals into measurable product outcomes for Version 1.0.

### 5.1 Product Objectives – Version 1.0

| ID | Objective | Success Orientation |
|----|-----------|---------------------|
| PO-01 | Deliver a web application accessible from supported browsers for office use. | Users can sign in and operate CWMS through the browser according to the approved hosting and access model. |
| PO-02 | Provide secure multi-user login with role-based access. | Different users can access the system according to assigned role permissions. |
| PO-03 | Provide a dashboard showing operational and financial KPIs with quick-action shortcuts. | Users can understand portfolio status immediately after login. |
| PO-04 | Provide a complete Work Register with create, edit, view, delete, search, and export capabilities. | All works can be maintained as structured master records. |
| PO-05 | Support project-based organization of works. | Every work belongs to a project; projects can contain many works. |
| PO-06 | Implement the official CWMS financial standard for GST Extra and GST Included work orders. | Financial values remain consistent across Work Register, Billing, Dashboard, and Reports. |
| PO-07 | Manage estimates linked to works. | Estimate details and related documents can be maintained per work. |
| PO-08 | Manage schedule activities linked to works. | Planned/actual dates and progress can be maintained per work. |
| PO-09 | Manage billing based on single total work amount (not item-wise BOQ in Version 1.0). | RA Bills and Final Bills can be entered, deducted, netted, and payment-tracked. |
| PO-10 | Support flexible billing deductions, including multiple custom other deductions. | Department/client-specific deduction heads can be captured without software redesign. |
| PO-11 | Manage expenditure as work-specific or general, with optional later assignment of general expenses to a work. | Cost visibility is available without forcing immediate work allocation. |
| PO-12 | Manage unlimited documents per work and category, including multi-file upload. | All work documents are stored, searchable, openable, printable, downloadable, and recoverable from recycle bin. |
| PO-13 | Deliver the approved Version 1.0 report catalogue with print, PDF, Excel, filter, sort, search, date range, financial year, saved filters, and print preview. | Management and office users can produce official reports without manual assembly. |
| PO-14 | Deliver backup, restore, and backup history appropriate to the web deployment model. | Data can be protected and recovered by authorized users/administrators. |
| PO-15 | Exclude offline mode and Synchronization from Version 1.0. | Users work only while connected; there is no offline page/data retention model and no sync module. |
| PO-16 | Maintain audit logging of important user actions. | The organization can determine who changed what and when. |
| PO-17 | Preserve upgrade safety so future versions do not lose existing data. | Version 1.1 and Version 2.0 can extend the product without discarding Version 1.0 data. |

### 5.2 Delivery Objectives

| ID | Delivery Objective | Description |
|----|--------------------|-------------|
| DO-01 | Freeze Version 1.0 requirements before implementation. | No new features enter Version 1.0 unless essential for stability or bug correction. |
| DO-02 | Record enhancement ideas in a Feature Request Register for Version 2.0. | Scope creep is controlled through formal deferral. |
| DO-03 | Deliver Version 1.0 as a complete web product package. | Deliverables include deployed web application, administrator/user documentation, backup/restore capability appropriate to the hosting model, sample training data, source materials, data documentation, and changelog. Exact deployment artifacts depend on Open Question answers. |
| DO-04 | Validate using realistic operational volume. | Testing must include approximately 200 works per year scale, multiple documents per work, multiple bills per work, and both general and work-specific expenses. |

### 5.3 Non-Objectives for Version 1.0

The following are explicitly **not** objectives of Version 1.0:

- Building a mobile application
- Providing GPS / map integration
- Providing item-wise BOQ / Measurement Book quantity billing
- Providing fully configurable masters (custom categories, document types, deduction heads, expense categories, client-specific billing format engines)
- Providing work diary / remarks history module
- Providing advanced notification systems beyond what is necessary for frozen dashboard/alert concepts already approved
- Providing QR code / barcode systems
- Providing accounting software integration
- Providing inventory, plant & machinery, attendance, purchase order, or store management
- Providing multi-office advanced sync topologies beyond the Version 1.0 offline-to-server sync commitment
- Native mobile applications in Version 1.0 (mobile browser support remains an Open Question)
- Reintroducing a Windows desktop installer / offline desktop client as the primary Version 1.0 product form, unless the Product Owner later reverses the web-application amendment

These belong to later versions unless a later formal scope change revises this document.

---

## 6. Scope

### 6.1 In Scope – Version 1.0 (Frozen)

The following modules and capabilities are included in Version 1.0 and are treated as frozen requirements:

#### 6.1.1 Platform and Architecture (Product Level)

- **Web Application** (Product Owner amendment dated 2026-07-31)
- **Online-only** operation; internet connectivity required for use
- Browser-based access for authorized users from **any place** with internet connectivity
- Intended to be usable on **any browser**
- Multi-user login
- Centralized **public cloud** hosting model
- Backup and restore capability appropriate to the public cloud hosting model
- Document storage under **cloud/server-managed storage only**
- Uploaded files **copied** into CWMS-managed file/object storage (dedicated file storage; Product Owner indicated likely S3)
- Initial concurrent-user target: approximately **50**
- Browser policy: **allow all browsers**
- Roles: Administrator, Data Entry Operator, Engineer, Accounts, Viewer
- Dashboard: traffic lights + simple alerts
- No general system/global Settings module in Version 1.0
- Form option lists in Version 1.0 for Work Categories, Document Types, Deduction Heads, Expense Categories, Client/Department Formats
- Administrator can **add / edit / delete** those option lists on a **separate Masters page**
- Work statuses: Planned, In Progress, Hold, Completed
- Clients / Contractors / Vendors as free text
- Document uploads: PDF and images only; max **20 MB per file**; permanent delete with warning; no recycle bin
- Projects: **light** — free text + dropdown of existing project names on Work form
- Report branding: **defaults** in Version 1.0 (custom upload in Version 2.0)
- Excel **export** in Version 1.0; Excel **data import** deferred to Version 2.0
- Viewer = view only; other roles = full access (interim)
- Login: Remember Me; passwords min 8 chars with upper+lower+number+symbol and no personal details; one demo account per role (username = role name, password = Password@123)
- Balance Work Value and Financial Progress based on **Gross Bills Raised**
- Backup: **weekly**, retained **30 days**
- Dashboard alerts: Pending bills, Overdue/delayed schedule, Outstanding payments, Missing key documents, Works on Hold + traffic lights
- **No offline mode** in Version 1.0
- **No Synchronization module** in Version 1.0

> **Discovery conflict note:** The original discovery froze a Windows desktop, offline-first, local-database-plus-server-sync model, including installer/`CWMS.exe` style deliverables. That platform model is superseded. Functional modules (Work Register, Billing, Expenditure, Documents, Reports, Backup, etc.) remain in scope. Offline operation and Synchronization are explicitly removed from Version 1.0 by Product Owner decision dated 2026-07-31.

#### 6.1.2 Core Modules

1. **Login & User Management**
2. **Dashboard**
3. **Work Register**
4. **Estimate Management**
5. **Schedule Management**
6. **Document Management**
7. **Billing Management**
8. **Expenditure Management**
9. **Reports**
10. **Search & Filters**
11. **Backup & Restore**
12. **Administration** capabilities necessary for users, security, restore, report branding, and maintainable option lists
13. **Masters / Option Lists** separate page (Administrator maintainable)
> **Removed from Version 1.0 by Product Owner decision:** Offline Synchronization / Sync module; vague system/global Settings module; Excel data import (deferred to Version 2.0); company/logo upload (defaults only in Version 1.0).

#### 6.1.3 Functional Capability Summary by Domain

**Work Management**
- Auto-generated Work Code (example format confirmed: `CWMS-YYYY-####`)
- Project linkage
- Work identity and descriptive fields
- Client and contractor association
- Work order details
- Location and chainage-related fields
- Work status and progress fields
- Financial value fields under the official GST Extra / GST Included standard
- Automatic balance and financial progress calculations
- Duplicate work order detection
- Work Register list with New / Edit / Delete / View / Search / Export

**Estimate Management**
- Estimate records linked to works
- Estimate number, date, amount, and related document association as designed in discovery

**Schedule Management**
- Schedule/activity records linked to works
- Planned and actual dates
- Progress tracking
- Work-level schedule dates and physical/financial progress indicators

**Billing Management**
- Bill types: RA Bill and Final Bill
- Single total amount billing model for Version 1.0 (not item-wise BOQ)
- Previous bill amount, current work portion amount, GST, gross bill, deductions, net bill
- Standard deduction heads plus multiple flexible other deductions
- Payment status: Pending / Partially Received / Fully Received
- Payment details (date, amount received, UTR/Cheque, bank, remarks)
- Automatic update of work financial totals and progress
- Bill history per work

**Expenditure Management**
- Work-specific expenses
- General expenses
- Optional assignment of a general expense 100% to one work
- Expense financial details including GST
- Payment mode and references
- Attachments for invoices/receipts/supporting documents
- Expense statuses as defined in discovery
- Estimated profit/loss contribution at work summary level

**Document Management**
- Documents belong to one work
- Document types from Administrator-maintainable option lists
- Unlimited documents per category
- Single and multiple file upload
- Document number, title, file metadata, upload user/date, remarks
- Files copied into CWMS-managed cloud file/object storage (not merely linked)
- Open, download, delete, print
- Delete is **permanent**, with warning confirmation; no in-app recycle bin
- Supported upload types in Version 1.0: **PDF and images** only
- Maximum upload size: **20 MB per file**
- Document register and missing document reporting

**Reports**
- Work Register Report
- Billing Report
- Expenditure Report
- Financial Summary Report
- Work-wise Summary Report
- Pending Payment Report
- Document Register
- General Expense Report
- Dashboard Summary Report
- Print, PDF export, Excel export
- Search, sort, filter, date range, financial year
- Saved report filters (save, rename, set default, delete)
- Print preview
- Official print header metadata (company/office, report name, project, date/time, page number, user, filters used)

**Backup & Restore**
- Backup capability retained as a Version 1.0 business need
- Restore capability retained as a Version 1.0 business need
- Backup history retained as a Version 1.0 business need
- Backup execution: **system automatic jobs**
- Backup frequency: **weekly**
- Backup retention: **30 days**
- Backup contents: CWMS business data and cloud-stored documents
- Restore: **Administrator only**
- Uploaded files are **copied** into CWMS-managed file/object storage (dedicated file storage; Product Owner indicated likely S3); max **20 MB per file**; document recycle bin **not** in Version 1.0

**Synchronization / Offline Continuity — Out of Scope for Version 1.0**
- Original discovery included offline operation, automatic/manual sync, and conflict detection
- Product Owner decision (2026-07-31): Version 1.0 is online-only; Synchronization is not present
- Rationale recorded by Product Owner: the application is actively connected to the internet; offline page data retention after browser close or machine restart is not a Version 1.0 requirement

**Security and Governance**
- Password-protected login
- Encrypted password storage (product requirement; mechanism is an engineering concern)
- Role-based access
- Audit log of important actions
- Session timeout after inactivity (configurable)
- Change control discipline for Version 1.0 vs Version 2.0

**Search**
- Search across key identifiers and attributes including Work Order, Client, Contractor, Chainage, Project, Date, Status, Work Code, Work Name, and document attributes as applicable

### 6.2 Out of Scope – Version 1.0 (Deferred)

The following were discussed during discovery and explicitly deferred, primarily to Version 2.0 or later:

#### 6.2.1 Deferred to Version 2.0 (Confirmed)

- Offline working / offline-capable web client (explicitly excluded from Version 1.0)
- Synchronization module / conflict detection between offline and online copies (explicitly excluded from Version 1.0)
- Full Notification Centre beyond Version 1.0 traffic lights and simple dashboard alerts
- Document recycle bin / soft-delete recovery (explicitly excluded from Version 1.0)
- Company/office name and logo upload/customization (Version 1.0 uses defaults only)
- Excel data import (Version 1.0 has Excel export for reports only)
- Full Projects management module (Version 1.0 uses light project association only)
- Broader workflow customization engines beyond Administrator-maintained option lists and Client/Department Format selection already included in Version 1.0
- Deep client-specific billing format engines beyond the Version 1.0 Client/Department Format master/options capability
- Finer role permission matrix beyond Viewer vs full-access roles
- Work Diary / Remarks History
- QR Code system for work file numbers
- Mobile application
- GPS integration
- Site Photos as a dedicated advanced module beyond basic document category support already included
- Advanced Notifications / Notification Centre enrichment beyond frozen Version 1.0 essentials
- Item-wise BOQ measurement billing
- Measurement Book (MB) quantity-based billing
- Running quantities and abstract generation from measured quantities
- Splitting one general expense across multiple works (percentage split)
- Any other enhancement identified during Version 1.0 development and placed in the Feature Request Register

#### 6.2.2 Later / Long-Term Vision (Not Version 1.0)

- Tender Management
- Full BOQ Management as a major module
- Material Inventory
- Plant & Machinery management
- Employee Attendance
- Purchase Orders
- Store Management
- Quality Control
- Safety Inspections
- Client Correspondence / Letter Management as advanced modules
- GIS / Map integration
- Digital signatures
- Accounting software integration
- Cloud dashboard beyond Version 1.0 server sync commitment
- Multi-office synchronization as an advanced topology
- Barcode-based document tracking
- Email / SMS notification systems
- Calendar module
- Reminder system as a major Version 1.5-class enhancement track
- Linux / macOS support

### 6.3 Scope Boundary Rules

1. **Version 1.0 requirements are frozen.**  
   New ideas discovered during implementation are recorded for Version 2.0 unless essential to Version 1.0 stability or correctness.

2. **No silent scope expansion.**  
   If an implied behaviour is necessary for a frozen Version 1.0 feature to function, it must be documented as an Assumption or raised as an Open Question. It must not be implemented as an undocumented enhancement.

3. **No Version 2.0 features in Version 1.0.**  
   Engineering must not pull deferred features forward without formal Product Owner approval and an update to this design package.

4. **Discovery conflicts must be preserved, not silently resolved.**  
   Where the discovery conversation contains conflicting statements, later specification documents must list them explicitly. This Executive Summary identifies known conflicts at a high level in Section 10.

---

## 7. Constraints

### 7.1 Platform Constraints

| ID | Constraint |
|----|------------|
| C-01 | Version 1.0 is a **web application**. |
| C-02 | Users may access CWMS from **any place** on **any browser** with internet connectivity. An official acceptance/test browser matrix may still be defined for quality control without narrowing the Product Owner’s access intent. |
| C-03 | Version 1.0 is **online-only**; internet connectivity is required for use. |
| C-04 | Version 1.0 does **not** include offline mode and does **not** include a Synchronization module. |
| C-05 | Ordinary users access CWMS through the browser; they do not install a local desktop database to use the product. |
| C-05A | Version 1.0 hosting is **public cloud**. |
| C-05B | Version 1.0 document storage is **cloud/server-managed only**. |
| C-05C | Version 1.0 initial concurrent-user target is approximately **50**. |
| C-05D | Version 1.0 browser policy is **allow all browsers**. |

### 7.2 Product and Scope Constraints

| ID | Constraint |
|----|------------|
| C-06 | Version 1.0 requirements are frozen; non-essential new features are deferred. |
| C-07 | Billing in Version 1.0 is limited to **single total amount** entry; item-wise quantity billing is out of scope. |
| C-08 | Master data configurability engines are deferred to Version 2.0. |
| C-09 | General expense multi-work percentage splitting is deferred to Version 2.0. |
| C-10 | Work Diary / Remarks History is deferred to Version 2.0. |
| C-11 | The system must remain modular so future modules can be added without redesigning existing work-centric relationships. |

### 7.3 Operational Constraints

| ID | Constraint |
|----|------------|
| C-12 | Expected volume is approximately **200 works per year**, with growth over multiple years. |
| C-13 | Users must be able to learn basic operation quickly for daily office use. |
| C-14 | Reports must be suitable for official records and meetings. |
| C-15 | Documents must remain usable after upload through CWMS-managed storage (discovery required copies rather than fragile links; exact storage topology for web is an Open Question). |
| C-16 | Backup and restore are mandatory operational capabilities, not optional utilities. |

### 7.4 Data and Integrity Constraints

| ID | Constraint |
|----|------------|
| C-17 | Work Register is the central parent; related records link through Work identity. |
| C-18 | No duplicate storage of core work information across child modules. |
| C-19 | Financial calculations must update automatically when relevant billing or value data changes. |
| C-20 | Save operations must protect against partial writes / incomplete commits. |
| C-21 | Future version upgrades must preserve existing data. |
| C-22 | Important changes must be auditable. |

### 7.5 Security Constraints

| ID | Constraint |
|----|------------|
| C-23 | Access requires authenticated login. |
| C-24 | Passwords must be stored using secure one-way protection (encrypted/hashed as implemented by engineering; product requirement is non-reversible secure storage). |
| C-25 | Permissions are role-based. |
| C-26 | Inactive sessions must time out according to configurable policy. |

### 7.6 Delivery Constraints

| ID | Constraint |
|----|------------|
| C-27 | Final Version 1.0 delivery must include the web application, backup/restore capability appropriate to hosting, user/admin documentation, sample training data, source package, data documentation, and changelog. Exact hosting artifacts remain subject to Open Questions. |
| C-28 | Testing must include realistic project data at expected annual volume. |
| C-29 | Design package documentation is the single source of truth prior to engineering implementation. |
| C-30 | Discovery statements that assumed a Windows desktop executable/installer are superseded by the web-application amendment for Version 1.0 product definition. |

### 7.7 Explicit Non-Constraints / Deferred Technical Preferences

During discovery, specific technical implementation preferences were discussed (for example, particular programming languages, UI toolkits, and database engines), originally in a desktop context. Those discussions are **not restated here as product mandates**, because this design package remains at product level. Product constraints that matter to the business after the amendment are:

- Web application access via browser
- Online-only operation
- Cloud hosting (private vs public later)
- Multi-user login and role-based access
- Managed document storage
- Export to PDF and Excel
- Secure login and auditability
- Backup and restore
- No offline mode and no Synchronization module in Version 1.0

Engineering may select implementation technologies that satisfy these product constraints, subject to any separately approved technical architecture decision records outside this product package.

---

## 8. Success Metrics

Success metrics define how the organization will determine whether CWMS Version 1.0 has achieved its purpose.

### 8.1 Business Success Metrics

| ID | Metric | Target / Evaluation Basis |
|----|--------|---------------------------|
| SM-01 | Work centralization | 100% of active office works intended for CWMS are maintainable in the Work Register. |
| SM-02 | Digital work file completeness | For a selected work, users can access work details, estimate, schedule, documents, billing, expenditure, and financial summary without leaving the work-centric navigation model. |
| SM-03 | Financial consistency | Work Portion Value, GST Amount, Total Work Value, Balance Work Value, Bills Raised, Payments Received, Outstanding, Expenditure, and Profit/Loss use one standard terminology and calculation model across modules. |
| SM-04 | GST handling correctness | Both GST Extra and GST Included work orders calculate correctly according to the official financial standard. |
| SM-05 | Billing usability | Users can enter RA/Final bills with standard and multiple flexible deductions and obtain correct net payable and payment status. |
| SM-06 | Expenditure coverage | Users can record both work-specific and general expenses and assign a general expense wholly to one work when required. |
| SM-07 | Document retrievability | Users can upload multiple documents under the same category, find them by search, open them from CWMS, and recover accidental deletes from recycle bin. |
| SM-08 | Reporting readiness | All approved Version 1.0 reports can be filtered, previewed, printed, and exported to PDF and Excel. |
| SM-09 | Online access continuity | While connected to the internet and the cloud service is available, users can perform core create/read/update operations. |
| SM-10 | Backup recoverability | A backup can be created and restored successfully by authorized roles/processes, and backup history is visible. |
| SM-11 | Multi-user concurrency readiness | Concurrent use by multiple signed-in users remains safe and understandable without a Synchronization module. |
| SM-12 | Volume readiness | System remains usable with approximately 200 works/year scale and multi-year accumulation during acceptance testing. |
| SM-13 | Learnability | New office users can perform basic create/search/report operations after short familiarization consistent with the discovery target of approximately 30 minutes. |
| SM-14 | Upgrade safety posture | Version packaging, changelog discipline, and data-preserving upgrade approach are in place for post-1.0 evolution. |

### 8.2 Quality Success Metrics

| ID | Metric | Target / Evaluation Basis |
|----|--------|---------------------------|
| SM-15 | Stability | Accepted builds demonstrate no crashes during defined acceptance scenarios. |
| SM-16 | Data loss prevention | Accepted builds demonstrate no data loss during normal save, backup, restore, and upgrade-simulation scenarios. |
| SM-17 | Calculation accuracy | Financial calculations match the approved business rules for representative GST Extra, GST Included, multi-bill, partial payment, and expenditure cases. |
| SM-18 | Search effectiveness | Users can locate works and documents by the approved search attributes within normal office use. |
| SM-19 | Auditability | Important create/update/delete/login actions produce audit records sufficient for office accountability. |
| SM-20 | Professional usability | Screens follow a consistent application layout model (title/toolbar or equivalent header actions, navigation, content, status) adapted for web use while preserving discovery navigation intent. |

### 8.3 Delivery Success Metrics

| ID | Metric | Target / Evaluation Basis |
|----|--------|---------------------------|
| SM-21 | Scope control | Version 1.0 release contains only frozen Version 1.0 capabilities plus essential defect corrections. |
| SM-22 | Deferred feature discipline | Version 2.0 ideas are recorded in the Feature Request Register rather than absorbed into Version 1.0. |
| SM-23 | Acceptance completeness | Every frozen module has passing happy-path, alternative-path, and failure-path acceptance coverage as defined in the Acceptance Test Specification. |
| SM-24 | Release package completeness | Final delivery includes web application deployment package/artifacts, manuals, sample data, source package, data documentation, and changelog. |

---

## 9. Stakeholders and Users (Executive View)

Detailed personas and journeys are specified in later documents. At executive level, the product serves:

### 9.1 Primary Users

Official Version 1.0 roles (Product Owner decision):

- **Administrator** – system/global settings, user management, restore, maintenance of form option lists (Work Categories, Document Types, Deduction Heads, Expense Categories, Client/Department Formats), operational oversight
- **Data Entry Operator** – day-to-day data entry across permitted modules
- **Engineer** – engineering-oriented work, schedule, document, and related operational use
- **Accounts** – billing, payment, expenditure, and financial reporting use
- **Viewer** – view only

Version 1.0 interim permission rule: Viewer is view-only; Administrator, Data Entry Operator, Engineer, and Accounts have full access to all modules. A finer matrix may come later.

### 9.2 Business Stakeholders

- Product Owner / Domain Expert (construction and highway project workflow authority)
- Office management requiring financial and progress visibility
- Accounts / billing staff requiring RA bill and payment tracking
- Engineering / site coordination staff requiring work and document access
- Future IT / operations staff responsible for backup, restore, and synchronization

### 9.3 Delivery Stakeholders

- Product management
- Solution / software architecture
- UX design
- Business analysis
- Engineering implementation team
- Testing / acceptance team

---

## 10. Known Conflicts and Ambiguities (Executive Level)

The discovery conversation contains some unresolved or evolving statements. This Executive Summary does not silently choose winners. Detailed conflict registers appear in later documents; the executive-level conflicts are:

### 10.1 User Role Model – Resolved

Discovery contained two role sets. Product Owner resolved Version 1.0 roles as the merged set:

**Administrator · Data Entry Operator · Engineer · Accounts · Viewer**

### 10.2 Backup Design Depth / Sync Removal

Backup & Restore and Offline Synchronization were marked approved/frozen in original discovery. Product Owner later confirmed Version 1.0 is an online-only web application with **no Synchronization module**. Backup is system-automatic (cost-optimized frequency). Restore is Administrator-only. Remaining backup/restore detail (retention period, exact cadence, restore confirmation UX) will be expanded in later documents.

### 10.5 Platform Model Supersession

Discovery froze a Windows desktop offline-first product with installer deliverables. The Product Owner later directed that the product should be a **web application**. For this design package, the web platform supersedes the desktop platform statements. Functional module scope remains; platform-dependent behaviours that were not re-confirmed are Open Questions (Section 18).

### 10.3 Dashboard Alert / Traffic Light Depth

Discovery proposed traffic-light work status indicators and notification/alert concepts. Some advanced notification concepts were later deferred to Version 2.0, while dashboard KPIs and certain alert ideas remain in earlier approved material. Exact Version 1.0 boundary for alerts versus deferred notification centre capability requires careful specification and Open Question listing in later documents.

### 10.4 Settings Depth – Clarified by Product Owner

- **Settings** = system/global settings only.
- Work Categories, Document Types, Deduction Heads, Expense Categories, and Client/Department Formats are Version 1.0 **form field options**.
- Administrators can **add / edit / delete** those lists in Version 1.0 (DEC-WEB-22). This amends the earlier discovery deferral that placed all configurable masters exclusively in Version 2.0.
- Exact UI placement for list maintenance (Settings vs Administration vs Masters) remains Open Question OQ-07.

### 10.6 Dashboard Alerts – Clarified by Product Owner

Version 1.0 includes traffic-light indicators plus a few simple dashboard alerts. Full Notification Centre remains Version 2.0. Exact alert catalogue remains Open Question OQ-05.

---

## 11. Assumptions (Executive Level)

The following assumptions are necessary to interpret discovery into an executive product charter. A full Assumptions catalogue appears in Document 13.

| ID | Assumption |
|----|------------|
| A-01 | The Product Owner’s affirmations (“Yes”, “Ok”, “Go ahead”, “All ok”, “Done”, “Add this in this module”) constitute approval of the immediately preceding proposed design unless later explicitly deferred or revised. |
| A-02 | Approximate volume of 200 works per year is the primary sizing assumption for Version 1.0 acceptance. |
| A-03 | Currency presentation is Indian Rupees (₹), based on discovery examples. |
| A-04 | The primary Version 1.0 operating context is organizational use of a web application; desktop-installer deployment is no longer assumed. |
| A-05 | “One Work → Everything Related to That Work in One Place” is a binding UX and information-architecture principle for Version 1.0. |
| A-06 | Official financial standard (Work Portion Value + GST = Total Work Value, with GST Extra / GST Included modes) is binding across all financial surfaces. |
| A-06A | Balance Work Value and Financial Progress use Gross Bills Raised as the billing basis; Payments/Outstanding/Net Bill are separate. |
| A-07 | Version 1.0 billing intentionally stores summary bill amounts, not measurement-item breakdowns. |
| A-08 | Documents are first-class controlled records, not optional attachments. |
| A-09 | Saved Report Filters are in Version 1.0 because the Product Owner explicitly instructed inclusion. |
| A-10 | Project-based architecture is in Version 1.0 because the Product Owner approved it as a foundational design decision. |

---

## 12. Risks (Executive Level)

A full risk register appears in Document 15. Executive risks that must be managed from day one:

| ID | Risk | Why It Matters |
|----|------|----------------|
| R-01 | Scope creep during implementation | Discovery repeatedly required freezing Version 1.0; failure to maintain freeze threatens delivery stability. |
| R-02 | Incomplete Backup/Sync business rules after web amendment | Modules were frozen at high level for desktop offline sync; web hosting changes who backs up what and whether sync still exists. |
| R-03 | Role-model ambiguity | Conflicting role sets can produce incorrect permission design. |
| R-04 | Financial calculation errors | GST Extra/Included, balances, deductions, partial payments, and profit/loss are central to trust. |
| R-05 | Document storage growth | Unlimited documents per work can create large local storage and backup burdens. |
| R-06 | Concurrency / sync conflict complexity | Concurrent edits by multiple web users (and any retained offline sync) can create conflicting or confusing work states if rules are undefined. |
| R-07 | Adoption friction | If daily workflows feel slower than current spreadsheet/file habits, users may resist. |
| R-08 | Over-promising Version 2.0 expectations | Long-term ERP vision must not distort Version 1.0 delivery priorities. |

---

## 13. Version Strategy Overview

| Version | Purpose |
|---------|---------|
| **v1.0** | Frozen core product: login, dashboard, work register, estimate, schedule, documents, billing, expenditure, reports, backup/restore, offline sync, search/filters, security/audit. |
| **v1.0.x** | Defect corrections after release. |
| **v1.1** | Minor improvements and additional report/search refinements without major architectural change. |
| **v1.5** (discussed in discovery as a possible intermediate track) | Reminder/calendar/email-class enhancements; not part of Version 1.0 frozen scope. |
| **v2.0** | Major enhancements: configurability, quantity-based billing, diary, mobile, GPS, advanced notifications, QR, multi-work expense split, and other deferred items. |
| **v3.0** (vision only) | Broader construction ERP capabilities such as inventory, machinery, attendance, purchase, and stores. |

Version 1.0 is the sole delivery commitment of this design package’s implementation phase.

---

## 14. Intended Deliverables of the Design Package

This Executive Summary is Document 00 of the CWMS product design package. The complete package will include:

| Doc No. | Title | Purpose |
|---------|-------|---------|
| 00 | Executive Summary | Project charter, goals, scope, constraints, success metrics |
| 01 | Product Vision | Philosophy, users, personas, use cases, long-term vision |
| 02 | Product Requirements Document | Module-by-module product requirements |
| 03 | Functional Specification | Feature and interaction-level behaviour |
| 04 | Screen Specification | Screen layouts, controls, states, shortcuts |
| 05 | User Journeys | Administrator, Operator, Viewer workflows |
| 06 | Business Rules | Calculations, status transitions, sync/backup/document rules |
| 07 | Domain Model | Entities, relationships, ownership, lifecycle |
| 08 | Validation Catalogue | Field, business, and cross-module validations |
| 09 | Edge Case Catalogue | Failure and exceptional conditions |
| 10 | Reporting Catalogue | All reports and output specifications |
| 11 | Acceptance Test Specification | Happy, alternative, failure, regression coverage |
| 12 | Version Roadmap | Frozen vs deferred release plan |
| 13 | Assumptions | Explicit assumption register |
| 14 | Open Questions | Unresolved decisions for Product Owner |
| 15 | Product Risks | Risk register and mitigation orientation |

Together, these documents become the **single source of truth** for CWMS Version 1.0 product definition prior to engineering build-out.

---

## 15. Executive Recommendation

Proceed with CWMS Version 1.0 as a **frozen-scope, online-only, cloud-hosted web application** centered on the Work Register, with tightly linked Estimate, Schedule, Document, Billing, Expenditure, Reporting, and Backup capabilities. Do **not** include offline mode or a Synchronization module in Version 1.0.

Do **not** expand Version 1.0 to absorb deferred Version 2.0 ambitions.  
Do **not** begin implementation against incomplete backup ownership, browser-support, user-location, or Role-model decisions without resolving remaining Open Questions.  
Do treat the official financial standard and the “one work digital file” philosophy as non-negotiable product pillars.

This Executive Summary authorizes preparation of the remaining design-package documents and, after full package approval and resolution of critical Open Questions, engineering implementation of Version 1.0 only.

---

## 16. Approval Record

| Role | Name | Decision | Date |
|------|------|----------|------|
| Product Owner | | ☐ Approved ☐ Approved with changes ☐ Rejected | |
| Principal Product Manager (Documentation) | | ☐ Complete for handoff | |
| Principal Software Architect (Product-level review) | | ☐ Consistent with architecture constraints | |
| Principal UX Designer (Product-level review) | | ☐ Consistent with UX principles | |
| Enterprise Solution Architect (Product-level review) | | ☐ Consistent with enterprise constraints | |
| Senior Business Analyst (Product-level review) | | ☐ Traceable to discovery | |

---

## 17. Document Control

| Item | Value |
|------|-------|
| Document ID | CWMS-DOC-00 |
| Title | Executive Summary |
| Product | CWMS – Construction Work Management System |
| Version covered | 1.0 (Frozen Scope, platform amended to Web Application) |
| Source | `dialog.md` discovery conversation + Product Owner amendment 2026-07-31 |
| Dependency | None (root charter document) |
| Next Document | `01-product-vision.md` |

---

## 18. Platform Decisions and Remaining Open Questions

### 18.1 Decisions Confirmed by Product Owner (2026-07-31)

| ID | Decision |
|----|----------|
| DEC-WEB-01 | Version 1.0 is **online-only**. Users use CWMS while connected to the internet. |
| DEC-WEB-02 | **No offline mode** in Version 1.0. Offline edit/view behaviour is not applicable. |
| DEC-WEB-03 | **Synchronization module is not present** in Version 1.0. A central online web application replaces the earlier offline-to-server sync concept. |
| DEC-WEB-04 | Sync topology questions are closed as not applicable. |
| DEC-WEB-05 | Hosting is **public cloud**. |
| DEC-WEB-06 | Users may open CWMS from **any place** (office, home, site, travel, or other location with internet). |
| DEC-WEB-07 | Users may open CWMS on **any browser**. Product intent is location- and browser-agnostic access. |
| DEC-WEB-08 | Internet access from outside a single company office/network is expected and required for the intended access model. |
| DEC-WEB-09 | Uploaded documents are stored in **cloud/server-managed storage only**. No local workstation folder model is expected for Version 1.0 document storage. |
| DEC-WEB-10 | Browser access policy: **allow all browsers**. No restricted official browser allow-list for product use. |
| DEC-WEB-11 | Initial concurrent-user target for Version 1.0: approximately **50**. Higher scale may be addressed in later versions if required. |
| DEC-WEB-12 | Cloud type: **public cloud**. |
| DEC-WEB-13 | Backup is performed by **system automatic jobs** (not Administrator-triggered as the primary model). |
| DEC-WEB-14 | Backup frequency is **weekly** (aligned with Product Owner cost-saving preference). |
| DEC-WEB-15 | A backup includes CWMS business data and uploaded documents stored in cloud/server-managed storage (system data protection, not end-user PC backup). |
| DEC-WEB-16 | Restore is available to **Administrator only**. |
| DEC-WEB-17 | Uploaded files are **copied** into CWMS-managed file storage (CWMS has its own file/object storage). Product Owner indicated likely S3-compatible object storage; exact storage product remains an implementation choice consistent with that intent. |
| DEC-WEB-18 | Official Version 1.0 roles are: **Administrator**, **Data Entry Operator**, **Engineer**, **Accounts**, **Viewer**. |
| DEC-WEB-19 | Version 1.0 includes **traffic-light status indicators** on works plus a **small set of simple dashboard alerts**. A full Notification Centre remains deferred to Version 2.0. |
| DEC-WEB-20 | A vague system/global **Settings module is excluded from Version 1.0** due to lack of clarity. Required admin capabilities are specified separately (masters page, restore, company identity for reports, etc.). |
| DEC-WEB-21 | Lists described in discovery under configurable masters are Version 1.0 **form field options** (values users select while filling forms), with initial option sets including Work Categories, Document Types, Deduction Heads, Expense Categories, and Client/Department Formats as stated by the Product Owner. |
| DEC-WEB-22 | In Version 1.0, the **Administrator** can **add, edit, and delete** the option lists for Work Categories, Document Types, Deduction Heads, Expense Categories, and Client/Department Formats. These are maintainable masters used by forms, not permanently fixed seed-only dropdowns. |
| DEC-WEB-23 | Option-list maintenance is provided on a **separate page** (Masters / Option Lists area), not inside a general Settings module. |
| DEC-WEB-24 | Work Status values in Version 1.0: **Planned**, **In Progress**, **Hold**, **Completed**. |
| DEC-WEB-25 | Clients, Contractors, and Vendors are entered as **free text** in Version 1.0 (no mandatory master registers). |
| DEC-WEB-26 | Each bill has a user-entered **RA Bill No.** when available, and the system always assigns a background **System Bill Number** for audit. |
| DEC-WEB-27 | When two users attempt to edit the same work, the system uses an **edit lock** and shows a message that edit is in progress by another user. |
| DEC-WEB-28 | Version 1.0 document upload file types are limited to **PDF and images**. |
| DEC-WEB-29 | Report headers use **default company/office name and logo** in Version 1.0. User upload of company name/logo is deferred to **Version 2.0**. |
| DEC-WEB-30 | Financial Year is **April–March**. |
| DEC-WEB-31 | GST % is a **free number input** (not restricted to a fixed pick-list). |
| DEC-WEB-32 | Visual theme (including light/dark) will be decided by the **UI/UX designer**; not frozen as a Product Owner mandate in this charter. |
| DEC-WEB-33 | **Excel data import** is deferred to **Version 2.0**. Version 1.0 retains report **Excel export** only. (Amends earlier interim inclusion of Excel import in Version 1.0.) |
| DEC-WEB-34 | Permission model for Version 1.0 (interim): **Viewer = view only**; **Administrator, Data Entry Operator, Engineer, and Accounts = full access** to all modules. A finer permission matrix may be introduced in a later version. |
| DEC-WEB-35 | Version 1.0 simple dashboard alerts are confirmed: **Pending bills**, **Overdue / delayed schedule**, **Outstanding payments**, **Missing key documents**, **Works on Hold**, plus **traffic-light** indicators. |
| DEC-WEB-36 | Projects in Version 1.0 use a **light** model: on the Work form, **free text** entry plus a **simple dropdown of existing project names**, without a full Projects management module. |
| DEC-WEB-37 | Document **recycle bin is not required** in Version 1.0. |
| DEC-WEB-37A | Document delete in Version 1.0 is **permanent delete with warning confirmation** only. |
| DEC-WEB-38 | Login includes **Remember Me** and password rules: minimum **8 characters**; must use a mix of **uppercase and lowercase** letters, **numbers**, and **symbols**; must **avoid personal details**. |
| DEC-WEB-39 | First-run / demo data includes **one demo account for each role**. Demo **usernames equal the role names** (Administrator, Data Entry Operator, Engineer, Accounts, Viewer). Default demo password for all five accounts: **Password@123**. |
| DEC-WEB-40 | **Balance Work Value** and **Financial Progress** are calculated from **Gross Bills Raised**. Payments Received, Outstanding, and Net Bill remain separate figures and are not used as the progress denominator. |
| DEC-WEB-41 | Maximum document upload size is **20 MB per file**. |
| DEC-WEB-42 | Automatic backups run **weekly** and are retained for **30 days**. |
| DEC-WEB-43 | Company/office name and logo for reports use **system defaults** in Version 1.0; upload/customization moves to Version 2.0. |
| DEC-WEB-44 | **Excel data import** is out of Version 1.0 and deferred to Version 2.0. |

### 18.2 Remaining Open / Clarification Items

| ID | Topic | Status |
|----|-------|--------|
| OQ-05 through OQ-13 and branding/import/frequency items | Previously open platform and product clarifications | **Closed** by DEC-WEB-35 through DEC-WEB-44 |
| OQ-14 | Exact default demo password strings | **Closed** by DEC-WEB-39 (`Password@123` for all five demo accounts) |
| OQ-15 | Exact password-policy parameters | **Closed** by DEC-WEB-38 |

> **Version 1.0 open questions that block Document 00 charter intent:** none remaining.  
> **Demo logins (Version 1.0):** Administrator / Data Entry Operator / Engineer / Accounts / Viewer — password **Password@123** for each.

---

**End of Document 00 – Executive Summary**
