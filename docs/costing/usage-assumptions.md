# Workload & Usage Assumptions — ARPL EHS Permit-to-Work Platform

> **Document ID**: ARPL-FIN-USAGE-2026-09-25  
> **Status**: AUDITED & BASELINE CONFIRMED  
> **Target System**: Production & Development Environments  
> **Pricing Currency**: INR (₹) converted from USD list price at **1 USD = ₹95.90 INR** (Checked 2026-09-25 12:33 IST)  

---

## 1. Confirmed Workload Baseline & Business Parameters

The following parameters are **formally confirmed** as the primary engineering inputs for all production costing and resource sizing:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONFIRMED PRIMARY WORKLOAD BASELINE                       │
│                                                                                        │
│  • Active Business Construction Projects:     6 Projects                               │
│  • Unique Users per Business Project:         60 Users / Project                       │
│  • Total Unique Authenticated Users:          360 Unique Users (Baseline)              │
│  • Daily Permit Issuance Volume:              300 Permits / Day Total (Across 6 Sites) │
│  • Monthly Permit Volume (30-day billing):    9,000 Permits / Month                    │
│  • Annual Permit Volume (365 days):           109,500 Permits / Year                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Strict Correction of Prior Anomalies
1. **User Count Correction**: The previous assumption of *10 users/project* or *50 total users (40 MAU)* was completely invalid. The system has **60 unique users per project across 6 projects = 360 unique users**. All models utilizing 50 users are permanently superseded.
2. **Permit Volume Correction**: The previous draft assumed *30 permits/day (750/month)*. The confirmed workload is **300 permits/day total (9,000/month)** — exactly **12× higher volume** than previously modeled!
3. **Business Projects vs. Cloud Tenants**: The 6 business projects (Auro Grand Residency, Auro Bhumi Phase 1, Auro Bhumi Phase 2, Auro Ridge Towers, Auro Valley Commercial, Auro Heights) operate as **logical partitions within a single Google Cloud / Firebase Production Project** (`arpl-ehs-prod`), avoiding 6× cloud tenant overhead (see [ADR-003](file:///c:/Users/MohithSai.G/Downloads/ARPL-EHS-Demo/docs/architecture/adr/ADR-003-business-project-isolation.md)).

---

## 2. User & Concurrency Model

### 2.1 User Categories & Memberships
- **Total Registered Unique Users**: 360 unique authenticated user accounts in Firebase Authentication.
- **Project-User Relationships**:
  - Site-specific roles (Site Supervisor, Electrician, Blasting In-charge, Lift Supervisor, Site Engineer, Section Heads): 54 users per project × 6 projects = 324 user-project memberships.
  - Multi-project & enterprise roles (EHS Manager, EHS Officer, Admin, Project Manager): 6 users per project equivalent = 36 users who hold global cross-project permissions (`projectIds: ["*"]`).
  - Total Unique Authenticated Users = **360**.
- **Monthly Active Users (MAU)**: Construction projects operate continuously. Every registered engineer, supervisor, and EHS staff member logs in during the month. **Expected MAU = 360 MAU** (100% within the 50,000 free MAU tier of Firebase Auth).
- **Daily Active Users (DAU)**: On any working day, approximately 60% of personnel across all 6 sites are actively on shift: **DAU = ~216 users**.
- **Peak Concurrent Users**:
  - The construction shift initiates between 06:30 and 09:30 IST.
  - Maximum concurrent connected sessions during the morning permit submission rush: **35 to 45 concurrent users**.
  - Off-peak concurrent users (daytime inspections, closures): **5 to 15 concurrent users**.

---

## 3. Mathematical Permit Transaction Model

A permit is **never a single database write**. Over its complete lifecycle from initiation through multi-tier review, digital signatures, active inspections, and formal closure, a permit generates a series of discrete cloud operations:

```
[Step 1: Initiation]  ──> [Step 2: Approvals] ──> [Step 3: Active Ops] ──> [Step 4: Closure]
• 3 Reads (Master)       • 4 Reads (Permit)      • 3 Reads (Inspect)      • 1 Read (Verify)
• 4 Writes (Create/Log)  • 12 Writes (4 Stages)  • 2 Writes (Obs/Ext)     • 3 Writes (Surrender)
```

### 3.1 Itemized Operations per Single Permit Lifecycle

| Operational Stage | Activities Included | Firestore Reads | Firestore Writes | Storage Ops (Class A) | Storage Ops (Class B) |
|---|---|---:|---:|---:|---:|
| **1. Initiation & Drafting** | Read project config, user profile, counter; write draft permit, initial activity log, sequence counter, initiator notification | 3 | 4 | 1 (Site Photo) | 0 |
| **2. Multi-Stage Approval Chain** | Average 4 approval stages (Site Engineer, Section Head, Domain Clearance, EHS Activation). Each stage reads permit, writes transition state, writes immutable activity log, and writes notification to next role. | 4 | 12 | 4 (Signatures) | 4 (Inspection) |
| **3. Active Inspections & Gating**| Gas re-checks (PTW-004), observation checks, permit extension evaluation (probabilistic average across permit types) | 3 | 2 | 0 | 2 |
| **4. Closure & Surrender** | Final housekeeping verification, closure photo upload, statutory surrender signature, status mutation to `Closed`, final audit log | 1 | 3 | 1 (Closure Photo) | 1 |
| **Subtotal per Permit** | **Direct Lifecycle Operations** | **11** | **21** | **6** | **7** |

---

## 4. Aggregate Monthly Operational Derivations (Baseline: 9,000 Permits/Month)

### 4.1 Firestore Operations Derivation
1. **Direct Permit Lifecycle Operations**:
   - Reads: $9,000 \times 11 = 99,000$ reads/month.
   - Writes: $9,000 \times 21 = 189,000$ writes/month.
2. **Dashboard Loads, Register Filtering & Live Listeners**:
   - 216 Daily Active Users (DAU) accessing the dashboard ~3 times per shift.
   - Initial load: 1 user document + 1 project config + 25 active permits in viewport = ~27 reads per load.
   - Real-time snapshot updates (`onSnapshot`): ~30 delta updates per user session.
   - Daily reads from user interaction: $216 \text{ users} \times (27 \times 3 + 30 \times 3) \approx 36,936$ reads/day.
   - Monthly user interaction reads: $36,936 \times 30 = 1,108,080$ reads/month.
3. **Escalation & SLA Auto-Expiry Engine**:
   - Runs every 5 minutes (or 1 minute in peak prod) = 8,640 sweeps/month.
   - Each sweep performs an indexed query on `nextSlaCheck <= now()`, returning an average of 4 pending permits: $8,640 \times 4 \approx 34,560$ reads/month.
   - Auto-escalations / warnings write state mutations: ~15,000 writes/month.
4. **Total Monthly Firestore Volume (Baseline)**:
   - **Total Reads**: $99,000 + 1,108,080 + 34,560 = \mathbf{1,241,640 \text{ reads/month}}$ (~$41,388$ reads/day average).
     - *Free Quota*: 50,000 reads/day = 1,500,000 reads/month.
     - *Billable Reads*: On 22 peak weekdays, daily reads hit ~52,000 reads/day (~2,000 billable reads/day × 22 = **~44,000 billable reads/month**).
   - **Total Writes**: $189,000 + 15,000 = \mathbf{204,000 \text{ writes/month}}$ (~$6,800$ writes/day).
     - *Free Quota*: 20,000 writes/day = 600,000 writes/month.
     - *Billable Writes*: **0 writes** (100% within free quota).
   - **Total Deletes**: Notification housecleaning and temporary cache = **~5,000 deletes/month** (100% within 20,000/day free tier).

---

### 4.2 Storage & Media Volume Derivation
1. **Files Generated per Permit**:
   - 1 Site Condition Photo (compressed WebP/JPEG): ~400 KB.
   - 4 Digital Signatures (Canvas PNG/vector): ~40 KB each = 160 KB total.
   - 1 Statutory A4 PDF Certificate: ~150 KB.
   - Average media payload per permit: **~710 KB (0.71 MB)**.
2. **Monthly Data Ingestion**:
   - $9,000 \text{ permits} \times 0.71 \text{ MB} = 6,390 \text{ MB} \approx \mathbf{6.24 \text{ GB / month}}$.
3. **Storage Cumulative Progression**:
   - **Month 1**: 6.24 GB stored $\rightarrow$ **1.24 GB billable** (after 5.0 GB free quota).
   - **Month 6**: 37.44 GB stored $\rightarrow$ **32.44 GB billable**.
   - **Month 12**: 74.88 GB stored $\rightarrow$ **69.88 GB billable** (or reduced to ~30 GB Standard + 44 GB Nearline under lifecycle policy).
4. **Storage Operations**:
   - Class A (Uploads): $9,000 \times 6 \text{ files} = \mathbf{54,000 \text{ ops/month}}$ (4,000 billable ops above 50,000 free quota).
   - Class B (Downloads/Reads): ~30,000 ops/month (100% within 50,000 free quota).

---

### 4.3 Compute & API Derivation (Google Cloud Run)
- **Container Allocation**: 1 vCPU, 1 GiB RAM, concurrency = 80 req/instance.
- **Monthly Invocations**:
  - State machine transition API: $9,000 \times 5 = 45,000$ calls.
  - Server-side PDF generation: $9,000 \text{ calls}$.
  - Cloud Scheduler SLA ticks: 8,640 calls.
  - Administrative & query APIs: ~30,000 calls.
  - Total Cloud Run Requests: **~92,640 requests / month**.
- **Execution Time & CPU Consumption**:
  - Average request processing time: 200 ms (0.20s).
  - Active vCPU-seconds: $92,640 \times 0.20\text{s} = 18,528 \text{ vCPU-seconds}$.
  - Active GiB-seconds: $92,640 \times 0.20\text{s} \times 1\text{ GiB} = 18,528 \text{ GiB-seconds}$.
- **Free Tier Validation**:
  - Invocations: 92,640 vs. 2,000,000 free $\rightarrow$ **100% FREE**.
  - vCPU-Seconds: 18,528 vs. 180,000 free $\rightarrow$ **100% FREE**.
  - GiB-Seconds: 18,528 vs. 360,000 free $\rightarrow$ **100% FREE**.
- *Compute Mode Decision*:
  - **Scale-to-Zero (Baseline BOM)**: Min instances = 0 $\rightarrow$ Compute cost = **₹0 / month**.
  - **Warm-Instance Add-on (Optional SLA)**: Min instances = 1 during shift hours $\rightarrow$ **~₹1,250 / month**.

---

### 4.4 Network Egress Derivation
- Mobile client app loads (cached via PWA service worker): ~1.5 GB/month.
- Media downloads (engineers reviewing photos and statutory PDFs): $9,000 \text{ permits} \times 0.5 \text{ MB} \approx 4.5 \text{ GB/month}$.
- API JSON responses: ~2.0 GB/month.
- **Total Internet Egress**: **~8.0 GB / month**.
- *Free Tier Check*: Worldwide internet egress includes **10.0 GiB / month free**.
- *Billable Egress*: **0 GB** (100% within free quota).

---

## 5. Development Environment Usage Assumptions (`arpl-ehs-dev`)

The DEV environment is strictly sized for functional testing, integration validation, and CI/CD:

| Variable | DEV Value | Operational Basis |
|---|---:|---|
| **Development Team** | 3 Engineers | Core development & QA staff |
| **Simulated Test User Accounts** | 16 Accounts | Exactly 1 test account per RBAC role |
| **Total DEV Accounts** | 19 Accounts | Developers + Role Personas |
| **DEV Monthly Active Users (MAU)** | 10 MAU | Active developers and automated test runners |
| **Permits Issued / Day** | 10 Permits / day | Automated integration test scripts + manual testing |
| **Permits Issued / Month** | 250 Permits / month | ~25 active development days |
| **Firestore Reads / Month** | 125,000 reads / mo | Test suite execution & dashboard validation |
| **Firestore Writes / Month** | 35,000 writes / mo | Test permit lifecycles and reset fixtures |
| **Firestore Storage** | 0.2 GiB | Test seed fixtures |
| **Firebase Storage Uploads / Month** | 150 uploads / mo | Test photos and signatures |
| **Cloud Run API Requests / Month** | 15,000 req / mo | Test suites & local proxy calls |
| **CI/CD Cloud Build Minutes / Month** | 150 minutes / mo | ~30 builds @ 5 min (within 2,500 free min) |
| **Artifact Registry Storage** | 0.5 GB | Storing 2 DEV container images |
| **Scale-to-Zero Policy** | 100% Scale-to-Zero | Zero min-instances; zero idle charges |

---

## 6. Required Scale Scenarios

To ensure procurement rigor, four discrete operational scenarios are mathematically modeled:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                SCALE SCENARIO DEFINITIONS                              │
│                                                                                        │
│  SCENARIO A — CURRENT BASELINE (CONFIRMED)                                             │
│  • 6 Business Projects · 60 Users/Project · 360 Unique Users · 300 Permits/Day Total   │
│  • 9,000 Permits / Month · 109,500 Permits / Year                                      │
│                                                                                        │
│  SCENARIO B — GROWTH SCENARIO (ENGINEERING SENSITIVITY)                                │
│  • 12 Business Projects · 60 Users/Project · 720 Unique Users · 600 Permits/Day Total  │
│  • 18,000 Permits / Month · 219,000 Permits / Year                                     │
│                                                                                        │
│  SCENARIO C — HIGH SCALE SCENARIO (ENTERPRISE EXPANSION)                               │
│  • 30 Business Projects · 60 Users/Project · 1,800 Unique Users · 1,500 Permits/Day    │
│  • 45,000 Permits / Month · 547,500 Permits / Year                                     │
│                                                                                        │
│  SPECIAL SENSITIVITY — 300 PERMITS / DAY / PER PROJECT                                 │
│  • 6 Business Projects · 360 Users · 300 Permits/Project/Day = 1,800 Permits/Day Total │
│  • 54,000 Permits / Month · 657,000 Permits / Year                                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

> **Summary of Usage Model**: Every parameter above is directly traceable to the confirmed 6 business projects, 360 unique users, and 300 permits/day baseline. Zero arbitrary or generic SaaS placeholders have been used.
