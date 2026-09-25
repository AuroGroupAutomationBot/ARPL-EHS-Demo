# Usage Assumptions — ARPL EHS Permit-to-Work System

> **Pricing Checked On**: 2026-09-25
> **Currency**: USD (list price) → INR (converted at ₹84/USD reference rate)
> **Note**: Google Cloud India bills in INR via Google Cloud India Private Limited. Exact INR rates from billing partner may differ from USD→INR conversion.

---

## Workload Profile

### Application Description
Construction site safety Permit-to-Work (PTW) system. 10 permit types, 16 RBAC roles, offline-first architecture. Users are on-site construction personnel using mobile/tablet devices with intermittent connectivity.

### Operating Characteristics
- **Business hours**: 06:00–22:00 IST (construction sites)
- **Night shift**: 20:30–06:00 IST (PTW-010 only)
- **Weekend**: Saturday prep + Sunday restricted operations
- **Peak period**: Weekday mornings 07:00–10:00 IST (permit creation spike)
- **Offline frequency**: ~30% of operations occur offline and sync later

---

## DEV Environment Usage Assumptions

| Variable | Value | Basis |
|---|---:|---|
| Developers | 3 | Small team building the application |
| Test users (simulated roles) | 16 | One per role for testing |
| Total users (dev accounts) | 19 | Developers + test users |
| MAU (Monthly Active Users) | 10 | Active devs + periodic QA |
| DAU (Daily Active Users) | 5 | Core dev team |
| Permits created/day | 10 | Testing/development flow |
| Permits created/month | 250 | ~25 working days × 10 |
| API requests/day (Cloud Functions) | 500 | CRUD + testing |
| API requests/month | 12,500 | 25 days × 500 |
| Firestore reads/day | 5,000 | Testing queries, dashboard loads |
| Firestore reads/month | 125,000 | 25 days × 5,000 |
| Firestore writes/day | 2,000 | Creating/updating permits, tests |
| Firestore writes/month | 50,000 | 25 days × 2,000 |
| Firestore deletes/day | 200 | Test cleanup |
| Firestore deletes/month | 5,000 | 25 days × 200 |
| Firestore storage | 0.5 GiB | Test data, small dataset |
| Firebase Storage uploads/month | 100 | Test photos/signatures |
| Firebase Storage stored | 0.2 GB | Test images |
| Firebase Storage download GB/month | 0.5 GB | Previewing test images |
| Internet egress/month | 1 GB | Dev traffic, API testing |
| Cloud Functions invocations/month | 12,500 | Same as API requests |
| Cloud Functions compute (vCPU-sec/month) | 5,000 | 12,500 × 0.4s avg |
| Cloud Functions memory (GiB-sec/month) | 5,000 | 12,500 × 0.4s × 256MB |
| Escalation scheduled runs/month | 43,200 | 1/min × 60 × 24 × 30 (but scale to zero dev) |
| CI/CD builds/month | 60 | ~3/day for 20 working days |
| CI/CD build minutes/month | 300 | ~5 min/build |
| Secret Manager active versions | 5 | Firebase config, API keys |
| Secret Manager access ops/month | 5,000 | Function deployments + access |
| Cloud Logging ingestion/month | 0.5 GiB | Dev logs |
| Notifications created/month | 500 | Test notifications |
| PDF generations/month | 50 | Testing PDF generation |

### DEV Rationale
- **Firebase Emulator Suite** handles most local development — cloud usage is for integration testing only
- **Escalation scheduler**: In DEV, runs at reduced frequency or uses emulator; cloud cost assumes emulator for most dev work
- **CI/CD**: GitHub Actions preferred for builds; Cloud Build used only for Firebase deployment
- **No minimum instances**: Everything scales to zero in DEV

---

## PROD Environment Usage Assumptions

| Variable | Value | Basis |
|---|---:|---|
| Total registered users | 50 | 3 project sites × ~17 roles (some overlap) |
| MAU (Monthly Active Users) | 40 | Most users active monthly |
| DAU (Daily Active Users) | 25 | Active construction staff |
| Peak concurrent users | 15 | Morning permit creation surge |
| Projects (construction sites) | 3 | PRJ-AGR, PRJ-ABP, PRJ-ART |
| Permits created/day | 30 | ~10 per project site |
| Permits created/month | 750 | 25 working days × 30 |
| Active permits (concurrent) | 60 | ~2 days average active life |
| Total permits (cumulative, 12 months) | 9,000 | 750 × 12 |
| Approval actions/day | 120 | 30 permits × 4 stages avg |
| API requests/day (Cloud Functions callable) | 800 | Creates + approvals + queries + extensions + observations |
| API requests/month | 20,000 | 25 days × 800 |
| Firestore reads/day | 25,000 | Dashboard loads, register queries, real-time listeners |
| Firestore reads/month | 625,000 | 25 days × 25,000 |
| Firestore writes/day | 5,000 | Permits, approvals, notifications, activity logs |
| Firestore writes/month | 125,000 | 25 days × 5,000 |
| Firestore deletes/day | 100 | Notification cleanup |
| Firestore deletes/month | 2,500 | 25 days × 100 |
| Firestore storage (month 1) | 1 GiB | Permit documents + notifications |
| Firestore storage (month 12) | 5 GiB | Cumulative growth |
| Firestore index storage | 0.5 GiB | Composite indexes |
| Firebase Storage uploads/month | 750 | 1 site photo per permit |
| Firebase Storage stored (month 1) | 0.5 GB | Photos ~500KB each |
| Firebase Storage stored (month 12) | 5 GB | Cumulative growth |
| Firebase Storage download GB/month | 2 GB | Viewing permit photos |
| Signatures stored/month | 750 | Digital signatures (~50KB each) |
| Drawings stored/month | 50 | PTW-001 excavation drawings |
| PDF generated/month | 100 | EHS statutory reports |
| PDF storage/month | 0.1 GB | ~100KB per PDF |
| Internet egress/month | 5 GB | Client traffic, mobile data |
| Cloud Functions invocations/month | 65,000 | 20K callable + 43.2K scheduled + triggers |
| Cloud Functions compute (vCPU-sec/month) | 25,000 | Avg 0.4s per invocation |
| Cloud Functions memory (GiB-sec/month) | 25,000 | 256MB allocation |
| Escalation scheduler invocations/month | 43,200 | 1 per minute × 60 × 24 × 30 |
| Notifications created/month | 3,000 | ~4 per permit lifecycle |
| Real-time listeners (concurrent) | 25 | DAU × 1 listener avg |
| Snapshot events/day | 5,000 | Real-time updates |
| CI/CD builds/month | 20 | ~5 per week |
| CI/CD build minutes/month | 100 | 5 min/build |
| Secret Manager active versions | 8 | Production secrets |
| Secret Manager access ops/month | 50,000 | Function cold starts + access |
| Cloud Logging ingestion/month | 2 GiB | Production structured logs |
| Cloud Logging retention | 30 days | Default retention |
| Firestore backups/month | 4 | Weekly export to Cloud Storage |
| Backup storage/month | 2 GiB | 4 exports × ~0.5 GiB |

### PROD Rationale
- **50 users across 3 sites**: Typical ARPL construction operation scale
- **30 permits/day**: Based on 10 permits/site/day across 10 permit types
- **25K Firestore reads/day**: Each user loads dashboard (50 reads), permit register (100 reads), detail views (20 reads each) plus real-time listener overhead
- **Escalation engine**: Runs every 60 seconds (43,200/month), queries pending permits (~10ms per run)
- **Firestore storage**: Permit documents average ~2KB each; 9,000/year = ~18MB data + indexes
- **Photos**: Each site photo ~500KB; 750/month = ~375MB/month upload
- **No AI/ML**: Application has no AI/GenAI requirements — sling stress calculation and gas detection are deterministic formulas, not ML models
- **No external integrations**: No ERP, HR, or third-party API calls

---

## Free Tier Applicability (Firebase Blaze Plan)

| Resource | Daily Free Quota | Monthly Equiv. | PROD Monthly Usage | Within Free Tier? |
|---|---:|---:|---:|---|
| Firestore reads | 50,000/day | ~1,500,000/month | 625,000 | **YES** — within daily quota |
| Firestore writes | 20,000/day | ~600,000/month | 125,000 | **YES** — within daily quota |
| Firestore deletes | 20,000/day | ~600,000/month | 2,500 | **YES** — within daily quota |
| Firestore storage | 1 GiB total | 1 GiB | 1-5 GiB | **PARTIAL** — exceeds after ~month 3 |
| Firebase Auth MAU | 50,000 | 50,000 | 40 | **YES** |
| Firebase Hosting storage | 10 GB | 10 GB | <1 GB | **YES** |
| Firebase Hosting transfer | 360 MB/day | ~10.8 GB/month | ~2 GB | **YES** |
| Firebase Storage | 5 GB | 5 GB | 0.5-5 GB | **PARTIAL** — exceeds after ~month 10 |
| Cloud Functions invocations | — | 2,000,000/month | 65,000 | **YES** |
| Cloud Functions vCPU-sec | — | 180,000/month | 25,000 | **YES** |
| Cloud Functions GiB-sec | — | 360,000/month | 25,000 | **YES** |
| Cloud Build minutes | — | 2,500/month | 100 | **YES** |
| Secret Manager versions | — | 6 active versions | 8 | **NO** — 2 versions billable |
| Secret Manager access | — | 10,000/month | 50,000 | **NO** — 40,000 ops billable |
| Cloud Logging | — | 50 GiB/month | 2 GiB | **YES** |

### Key Insight
At the projected production workload of 50 users / 30 permits per day, **the vast majority of Firebase/GCP usage falls within free tier quotas**. The primary paid costs are:
1. Firestore storage beyond 1 GiB (starts ~month 3)
2. Firebase Storage beyond 5 GB (starts ~month 10)
3. Secret Manager (minimal cost)
4. Domain/SSL (if custom domain)

---

## Scaling Scenarios

| Scenario | Users | Permits/Day | Firestore Reads/Month | Est. Monthly Cost Delta |
|---|---:|---:|---:|---|
| **Baseline** | 50 | 30 | 625,000 | Baseline |
| **2× Scale** | 100 | 60 | 1,250,000 | +₹0 (still within free tier) |
| **5× Scale** | 250 | 150 | 3,125,000 | +₹200-500 (exceeds daily read quota) |
| **10× Scale** | 500 | 300 | 6,250,000 | +₹500-1,500 (consistent paid reads) |
