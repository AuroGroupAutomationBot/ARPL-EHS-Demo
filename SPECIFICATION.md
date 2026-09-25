# ARPL EHS Permit-to-Work — Normalized Specification

> **Source of truth**: [README.md](file:///Users/techsavvy/Downloads/ARPL-EHS-Demo-main-2/README.md), [index.html](file:///Users/techsavvy/Downloads/ARPL-EHS-Demo-main-2/index.html) (~20,708 LOC), [ptw_swimlanes.html](file:///Users/techsavvy/Downloads/ARPL-EHS-Demo-main-2/ptw_swimlanes.html), 25 test suites.

---

## 1. Functional Requirements

### FR-001 — Permit Lifecycle State Machine
| Field | Value |
|---|---|
| **ID** | FR-001 |
| **Description** | Enforce a finite-state machine (FSM) governing the complete permit lifecycle from Draft through multi-stage approvals to Active to Close/Surrender/Cancel/Expire |
| **Actors** | All 16 roles |
| **Preconditions** | User is authenticated with a valid role |
| **Inputs** | Permit form data, checklist responses, digital signatures, GPS coordinates, photos |
| **Processing** | State transitions validated by chainStage(), roleCanActOnChain(), and approvePermitStage() |
| **Outputs** | Status mutation, audit log entry, stakeholder notifications |
| **Business Rules** | 27 distinct operational states; transitions are strictly gated by role authorization |
| **Exceptions** | Invalid role = Access Denied; Missing signature = Blocked; Off-site GPS = Warning |
| **Dependencies** | GPS Engine (FR-011), Signature Engine (FR-012), Notification Engine (FR-010) |
| **Acceptance** | Every state transition documented in section 6 is enforceable; 920+ automated assertions confirm |

### FR-002 — 10 Permit Type Modules
Support 10 distinct permit types: PTW-001 Excavation, PTW-002 Hot Work, PTW-003 Guard Rail, PTW-004 Confined Space, PTW-005 Shaft Work, PTW-006 Electrical (HT/LT) with dual topology, PTW-007 Drilling and Blasting, PTW-008 General Work, PTW-009A Routine Lifting, PTW-009B Critical Lift Plan, PTW-010 Night Shift. Each type has unique checklist (9-21 items), unique approval chain topology (3-8 stages), unique closure/surrender declarations, and unique location mode restrictions.

### FR-003 — Role-Based Access Control (RBAC)
Implement 16 distinct functional roles with strict permission boundaries covering form activation matrix, visibility isolation matrix, and approval-flow gating.

### FR-004 — Multi-Stage Approval Chains
Support parallel gates (3-way for PTW-001), sequential spines, either/or gates (PTW-006 Site), and first-wins gates (EHS Manager OR Officer). Stale-approval retention and fast-track re-routing on rejection.

### FR-005 — Safety Observation Workflow
EHS can raise safety observations on active permits; observations block extension and closure until resolved through 4-stage rectification. Unresolved observation at expiry triggers emergency auto-cancel.

### FR-006 — Permit Extension Workflow
Permittees can request extensions within operational windows; 3-stage approval: Site Engineer to Section Head to EHS. 18:30 IST request cutoff; 20:30 IST max ceiling; PTW-007 Blasting extensions completely disabled.

### FR-007 — Escalation and Auto-Expiry Engine
Real-time tick engine (5s interval) monitoring SLA breaches and permit validity. Stage 1 SLA (45s demo / 2h prod), Stage 2 SLA (120s demo / 4h prod), T-30 min warning, auto-expire, auto-cancel on open observation.

### FR-008 — 4-Step Permit Creation Wizard
Guided wizard: Step 1 General Info, Step 2 Safety Checklist, Step 3 Permit Validity, Step 4 Review and Sign. Dynamic form fields per permit type; checklist gating; GPS captured on final submission.

### FR-009 — Statutory PDF Generation
Generate comprehensive A4 statutory PDF reports via jsPDF. Strictly restricted to EHS Manager/Officer. Includes full signatory chain, checklist, observations, extensions, and activity log.

### FR-010 — Notification Engine
Role-targeted in-app notification dispatch with severity levels (info, warn, error). Max 250 notifications; role-scoped filtering; mark-all-read; broadcast capability.

### FR-011 — GPS Geofencing and Proximity Verification
Haversine-based proximity verification ensuring signatories are within configured project site radius. 3 pre-configured projects. Admin can configure coordinates and radius. Canvas radar visualization.

### FR-012 — Digital Signature Engine
Canvas-based PointerEvents signature capture with High-DPI scaling, Bezier smoothing, file upload alternative, and auto-sign simulation. DPDP Act 2023 consent required; dynamic name binding; 10 cross-process signature points.

### FR-013 — Role-Specific Dashboards and KPIs
Dynamic dashboard per role with KPI cards, quick actions, and scoped permit feeds. Zero-state resilient; empty array safe; role-scoped filtering.

### FR-014 — Permit Register and Advanced Filtering
Tabular permit register with multi-field tokenized search, status/project/type filters, and newest-first sorting. Unified heading across all roles; approval-flow visibility isolation.

### FR-015 — Configuration-Driven Architecture
Centralized APP_CONFIG object governing all dynamic UI, workflows, statuses, form definitions, navigation, and dashboards.

### FR-016 — Confined Space Multi-Gas Detection
4-parameter atmospheric testing engine for PTW-004. O2: 19.5-21.0%, LEL: less than 10%, CO: less than 25 PPM, H2S: 5 PPM or less.

### FR-017 — Sling Stress Calculation Engine
Automated rigging geometry calculator for PTW-009. T = (W x L)/(H x N); N=2 safety clamping; greater than 80% SWL triggers auto-promotion to PTW-009B.

### FR-018 — Weekend Operations Governance (Sunday Work Tile)
Saturday advance preparation tile plus Sunday zero-creation lockout engine. PTW-010 hard exclusion from Sunday tile; IST calendar-driven activation; 3-layer enforcement.

### FR-019 — PTW-010 Night Shift Dual-Phase Handover
8-stage dual-phase governance: Day approval, Linked activity permit, 20:30 Night handover, PM inspection, EHS activation, Morning closure. Night supervisor qualification gate; 21:00 cutoff auto-cancel; strict prohibitions.

### FR-020 — Location Selection Mode and Safety Restriction Matrix
3-mode location selection (Tower, Basement/Podium, Manual) with per-permit-type restrictions. Excavation: no Tower; Guard Rail/Shaft: no Manual; Blasting: Manual only; Electrical BP: Manual only.

## 2. Non-Functional Requirements

| Category | Requirement | Implementation (Firebase-First) |
|---|---|---|
| **Performance** | Sub-second render for dashboards and register | Firestore real-time listeners + client-side rendering |
| **Scalability** | Support 100s of concurrent permits across multiple users | Firestore auto-scaling; Cloud Functions auto-scaling |
| **Availability** | Offline-capable with automatic sync on reconnect | CONFIRMED: Firestore offline persistence via `enableIndexedDbPersistence(db)` |
| **Reliability** | Zero data loss on connectivity loss | Firestore queues writes offline and syncs automatically |
| **Security** | XSS prevention | `escapeHtml()` on all dynamic content + Firestore Security Rules |
| **Authentication** | CONFIRMED: Email/Password login via Firebase Auth | `signInWithEmailAndPassword()` with custom claims for role and project assignment |
| **Authorization** | 16-role RBAC with server-side enforcement | Firestore Security Rules (read) + Cloud Functions (state transitions) |
| **User-Project Binding** | CONFIRMED: Users pre-assigned to projects by Administrator | Admin Cloud Function sets `projectIds[]` on user document and custom claims |
| **Auditability** | Immutable activity log per permit | Append-only `activityLog[]`; IST timestamps; GPS; Cloud Functions enforce immutability |
| **Accessibility** | WCAG 2.1 AA tap targets | 44px minimum; focus-visible outlines |
| **Mobile Responsiveness** | 6-tier responsive breakpoints | 360px to 4K; bottom-sheet modals; safe-area insets |
| **Compliance** | DPDP Act 2023 | Explicit consent; dynamic identity binding; purpose limitation |
| **Timezone** | IST strict enforcement (server-side validated) | `Asia/Kolkata` in both client and Cloud Functions |
| **Implementation Scope** | CONFIRMED: All 10 permit types + Sunday Work Tile | PTW-001 through PTW-010 + Weekend Governance simultaneously |

---

## 3. User Roles (16 Roles)

| Role | Key | Create | Approve | Cancel | View Scope |
|---|---|---|---|---|---|
| Site Supervisor | site-supervisor | PTW-001-05, 08 | No | No | Own flow |
| Permittee Electrician | electrician | PTW-006 | No | No | Own flow |
| Blasting In-charge | blasting-incharge | PTW-007 | No | No | Own flow |
| Lifting Supervisor | lift-supervisor | PTW-009A/B | No | No | Own flow |
| Night Site Supervisor | night-supervisor | No | Handover | No | Own flow |
| Site Engineer | site-engineer | No | Ack Step 2 | No | All except BP |
| MEP Engineer | mep | No | Domain clearance | No | PTW-001,05,06S |
| P and M Engineer | pm | No | Domain/LOTO | No | PTW-001,06,09 |
| IT Engineer | it | No | Parallel clearance | No | PTW-001 only |
| Quality Engineer | quality-engineer | No | Quality clearance | No | PTW-006 BP |
| Excavation Head | excavation-head | No | Section Head PTW-001 | Cancel | PTW-001 |
| Tower Incharge | hw-section-head | No | Section Head multi | Cancel | Multi-type |
| Project Manager | project-manager | No | Executive PTW-009B | No | PTW-009B |
| EHS Manager | ehs-manager | No | Final all | Cancel | All |
| EHS Officer | ehs-officer | No | Final all | Cancel | All |
| Administrator | admin | No | No | No | All + User/Project mgmt |

---

## 4. Core Data Entities

### Entity: Permit
Key fields: id, ptype, project, status (27 states), locationMode, location, contractor, supervisor, workerCount, validFrom, validTill, startTime, submittedAt, activatedAt, approvals (chain object per type), signatories, checklist (array), observation (nullable), extension (nullable), activityLog (append-only), sitePhoto, drawing (PTW-001 only), sundayWork flag, type-specific parameters (depth/slope for excavation, gas readings for confined space, LOTO fields for electrical, blast parameters for blasting, rigging specs for lifting, etc.)

### Entity: Notification
Key fields: id, roles (array), message, severity (info/warn/error), permitId, createdAt, readBy (array)

### Entity: Project
Key fields: id, name, towers (array), site.lat, site.lng, radius (meters), configured (boolean), tagMethod

### Entity: User (NEW — for Firebase Auth integration)
Key fields: uid (Firebase Auth UID), displayName, email, role (primary role key), projectIds (array — admin-assigned), org, createdAt, lastLogin

---

## 5. Confirmed Design Decisions

| Decision | Confirmed Choice | Impact |
|---|---|---|
| **Architecture** | Firebase-First | Firestore + Cloud Functions + Firebase Auth + Firebase Storage + Firebase Hosting |
| **Authentication** | Email/Password | Firebase Auth `signInWithEmailAndPassword()`; custom claims for role and projects |
| **User-Project Assignment** | Admin pre-assigns | Admin Cloud Function manages `projectIds[]` on user documents and custom claims |
| **Offline Support** | Enabled | Firestore `enableIndexedDbPersistence(db)` for full offline CRUD |
| **Implementation Scope** | All 10 permits + Sunday Work | PTW-001 to PTW-010, Weekend Governance, Night Shift — simultaneous |

---

## 6. Resolved Gap Analysis

### Previously Open — Now Resolved

| # | Original Gap | Resolution |
|---|---|---|
| 1 | ASSUMPTION: Multi-user concurrent access | RESOLVED: Firestore with real-time listeners provides multi-user state management |
| 2 | ASSUMPTION: Data persistence beyond LocalStorage | RESOLVED: Firestore as primary database with automatic backup/recovery |
| 3 | ASSUMPTION: Real-time notifications | RESOLVED: Firestore `onSnapshot` listeners for live notification updates |
| 4 | ASSUMPTION: File storage for photos/signatures | RESOLVED: Firebase Storage with client SDK direct upload |
| 5 | ASSUMPTION: Audit log immutability | RESOLVED: Cloud Functions enforce append-only writes; Firestore Security Rules block direct updates |
| 6 | CLARIFICATION: Authentication mechanism | RESOLVED: Email/password via Firebase Auth |
| 7 | CLARIFICATION: Multi-project user assignment | RESOLVED: Admin pre-assigns users; `projectIds[]` in user document and custom claims |
| 8 | CLARIFICATION: Mobile app vs PWA | RESOLVED: Responsive web with Firestore offline persistence (PWA-ready) |
| 9 | CLARIFICATION: Data migration | RESOLVED: Seed data generation via `seedPermits()` already exists; migration script for LocalStorage to Firestore documented in database schema |
| 10 | CLARIFICATION: External system integration | RESOLVED: No external ERP/HR integration required for initial deployment |

### Technical Decisions (Finalized)
1. Production system will maintain all business logic in Cloud Functions as source of truth
2. IST timezone enforcement will be both client-side and server-side (Cloud Functions) validated
3. GPS verification will remain advisory (not cryptographically enforced) in the initial deployment
4. Existing 23 test suites (920+ assertions) will be adapted for Firebase architecture
5. Firestore document model accommodates all 10 permit type schemas without migrations

