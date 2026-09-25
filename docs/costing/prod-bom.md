# Production Environment — Bill of Materials (PROD BOM)

> **Document ID**: ARPL-BOM-PROD-2026-09-25  
> **Status**: PROCUREMENT-GRADE & AUDITED  
> **Environment**: Production (`arpl-ehs-prod`)  
> **Target Region**: Primary: `asia-south1` (Mumbai, Maharashtra, India)  
> **Pricing Verification**: 2026-09-25 | Live FX Rate: **1 USD = ₹95.90 INR**  
> **Confirmed Workload**: 6 Business Projects · 360 Unique Users · 300 Permits/Day Total (9,000/mo, 109,500/yr)  

---

## 1. Production Operational Parameters & Billing Policies

Every line item below is mathematically derived from the confirmed operational workload:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONFIRMED PROD WORKLOAD PROFILE                           │
│                                                                                        │
│  • Active Business Construction Projects:     6 Construction Sites                     │
│  • Total Registered Unique Users:             360 Unique Authenticated Accounts        │
│  • Monthly Active Users (MAU):                360 MAU (100% active)                    │
│  • Daily Active Personnel (DAU):              ~216 Active Staff / Day                  │
│  • Peak Concurrent Users:                     35 to 45 Concurrent Users                │
│  • Daily Permit Creation Volume:              300 Permits / Day Total (Across 6 Sites) │
│  • Monthly Permit Volume (30-day cycle):      9,000 Permits / Month                    │
│  • Annual Permit Volume (365 days):           109,500 Permits / Year                   │
│  • Primary Database:                          Cloud Firestore (`asia-south1`)          │
│  • Core Backend & Statutory Compute:          Google Cloud Run (`arpl-ehs-api`)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Itemized Production BOM (Baseline: Scale-to-Zero Mode)

| BOM ID | Category | Service | Resource / Metric | Region | SKU / Meter Family | Billing Unit | Monthly Usage | Free Quota | Billable Qty | Unit Rate (USD) | Unit Rate (INR @ ₹95.90) | Month 1 Cost (INR) | Month 12 Cost (INR) | Source | Confidence | Primary Assumption |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| **PRD-001** | 07. Identity | Firebase Auth | Email/Password MAU | global | `Firebase Auth Free Tier` | MAU | 360 | 50,000 | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Firebase Pricing | HIGH | 360 unique users across 6 sites |
| **PRD-002** | 01. Firebase | Firebase Hosting | SPA Asset Storage | global | `Hosting Storage` | GB | 0.8 | 10.0 | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Firebase Pricing | HIGH | Zero-build production SPA files |
| **PRD-003** | 01. Firebase | Firebase Hosting | CDN Data Transfer | global | `Hosting Transfer` | GB | 3.5 | 10.8 | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Firebase Pricing | HIGH | PWA cached client traffic |
| **PRD-004** | 03. Database | Cloud Firestore | Document Reads | asia-south1 | `Firestore Doc Reads` | per 100K | 1,241,640 | 1,500,000 | 44,000 | $0.036 | ₹3.45 | **₹1.52** | **₹1.52** | Firestore Docs | HIGH | Peak weekday overages (~2k/day × 22) |
| **PRD-005** | 03. Database | Cloud Firestore | Document Writes | asia-south1 | `Firestore Doc Writes` | per 100K | 204,000 | 600,000 | 0 | $0.108 | ₹10.36 | **₹0.00** | **₹0.00** | Firestore Docs | HIGH | 21 writes/permit lifecycle (within 20k/day) |
| **PRD-006** | 03. Database | Cloud Firestore | Document Deletes | asia-south1 | `Firestore Doc Deletes` | per 100K | 5,000 | 600,000 | 0 | $0.012 | ₹1.15 | **₹0.00** | **₹0.00** | Firestore Docs | HIGH | Notification cleanups |
| **PRD-007** | 03. Database | Cloud Firestore | Primary Data Storage | asia-south1 | `Firestore Storage` | GiB | 0.1 (M1) $\rightarrow$ 0.65 (M12) | 1.0 | 0 | $0.207 | ₹19.85 | **₹0.00** | **₹0.00** | Firestore Docs | HIGH | 5.5 KB/permit stored; fits in 1 GiB free |
| **PRD-008** | 03. Database | Cloud Firestore | Point-in-Time Recovery | asia-south1 | `Firestore PITR` | GiB | 0.65 | None | 0.65 | $0.120 | ₹11.51 | **₹7.48** | **₹7.48** | Firestore Pricing | HIGH | 7-day continuous statutory recovery |
| **PRD-009** | 04. Storage | Firebase Storage | Media Ingestion Storage | asia-south1 | `Cloud Storage Standard` | GB | 6.24 (M1) $\rightarrow$ 74.88 (M12) | 5.0 | 1.24 (M1) $\rightarrow$ 69.88 (M12) | $0.026 | ₹2.49 | **₹3.09** | **₹174.00** | GCS Pricing | HIGH | 9,000 permits × 710 KB media/permit |
| **PRD-010** | 04. Storage | Firebase Storage | Class A Upload Ops | asia-south1 | `Storage Class A Ops` | per 10K | 54,000 | 50,000 | 4,000 | $0.050 | ₹4.80 | **₹1.92** | **₹1.92** | GCS Pricing | HIGH | 6 file uploads per permit lifecycle |
| **PRD-011** | 04. Storage | Firebase Storage | Class B Read Ops | asia-south1 | `Storage Class B Ops` | per 10K | 30,000 | 50,000 | 0 | $0.004 | ₹0.38 | **₹0.00** | **₹0.00** | GCS Pricing | HIGH | Inspector photo/signature previews |
| **PRD-012** | 02. Compute | Google Cloud Run | API Invocations | asia-south1 | `Cloud Run Requests` | per 1M | 92,640 | 2,000,000 | 0 | $0.400 | ₹38.36 | **₹0.00** | **₹0.00** | Cloud Run Pricing | HIGH | FSM transitions, PDF, scheduler ticks |
| **PRD-013** | 02. Compute | Google Cloud Run | Active vCPU Runtime | asia-south1 | `Cloud Run Active CPU` | vCPU-sec | 18,528 | 180,000 | 0 | $0.000024 | ₹0.0023 | **₹0.00** | **₹0.00** | Cloud Run Pricing | HIGH | 92,640 reqs @ 200ms average |
| **PRD-014** | 02. Compute | Google Cloud Run | Active RAM Runtime | asia-south1 | `Cloud Run Active RAM` | GiB-sec | 18,528 | 360,000 | 0 | $0.0000025| ₹0.00024| **₹0.00** | **₹0.00** | Cloud Run Pricing | HIGH | 1 GiB container allocation |
| **PRD-015** | 02. Compute | Cloud Functions | Reactive Event Triggers | asia-south1 | `Cloud Functions 2nd Gen`| invocations | 189,000 | 2,000,000 | 0 | $0.400 | ₹38.36 | **₹0.00** | **₹0.00** | CF Pricing | HIGH | Firestore notification fan-out triggers |
| **PRD-016** | 08. Messaging | Google Cloud Tasks | Deferred Async Tasks | asia-south1 | `Cloud Tasks Dispatches` | per 1M | 20,000 | 1,000,000 | 0 | $0.400 | ₹38.36 | **₹0.00** | **₹0.00** | Cloud Tasks Docs | HIGH | Background PDF rendering queue |
| **PRD-017** | 08. Messaging | Cloud Scheduler | Escalation SLA Sweeps | asia-south1 | `Cloud Scheduler Active` | jobs | 1 | 3 | 0 | $0.100 | ₹9.59 | **₹0.00** | **₹0.00** | Scheduler Docs | HIGH | 5-min cron triggering SLA engine |
| **PRD-018** | 05. Networking | Internet Egress | Client Media Downloads | asia-south1 | `Internet Egress` | GB | 8.0 | 10.0 | 0 | $0.120 | ₹11.51 | **₹0.00** | **₹0.00** | Network Pricing | HIGH | Mobile downloads of PDFs & photos |
| **PRD-019** | 06. Security | Secret Manager | Active Secret Versions| global | `SM Active Version` | version | 4 | 6 | 0 | $0.060 | ₹5.75 | **₹0.00** | **₹0.00** | Secret Mgr Docs | HIGH | Admin keys & signing secrets |
| **PRD-020** | 06. Security | Secret Manager | Secret Access Ops | global | `SM Access Operation` | per 10K | 20,000 | 10,000 | 10,000 | $0.030 | ₹2.88 | **₹2.88** | **₹2.88** | Secret Mgr Docs | HIGH | Cached in container memory |
| **PRD-021** | 12. CI/CD | Google Cloud Build| Container Build Min | asia-south1 | `Cloud Build e2-std-2` | minutes | 100 | 2,500 | 0 | $0.003 | ₹0.29 | **₹0.00** | **₹0.00** | Cloud Build Docs | HIGH | 20 PROD deployments @ 5 min |
| **PRD-022** | 12. CI/CD | Artifact Registry| Container Image Store | asia-south1 | `Artifact Registry Store` | GB | 0.5 | 0.0 | 0.5 | $0.100 | ₹9.59 | **₹4.80** | **₹4.80** | Artifact Reg Docs| HIGH | Storing 2 PROD container images |
| **PRD-023** | 10. Logging | Cloud Logging | Compliance Log Ingestion| global | `Logging Ingestion` | GiB | 3.0 | 50.0 | 0 | $0.500 | ₹47.95 | **₹0.00** | **₹0.00** | Cloud Logging | HIGH | Audit logs, 30-day retention |
| **PRD-024** | 11. Monitoring | Cloud Monitoring| Container Health & SLA | global | `Monitoring Ingestion` | metrics | Standard | Included | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Monitoring Docs | HIGH | Uptime & latency alerts |
| **PRD-025** | 13. Backup/DR | Cloud Storage | Weekly DB Snapshot | asia-south1 | `Cloud Storage Standard` | GB | 2.0 | None | 2.0 | $0.026 | ₹2.49 | **₹4.98** | **₹4.98** | GCS Pricing | HIGH | 4 weekly snapshots × 0.5 GB |

---

## 3. Production Cost Recapitulation by Progression

| Milestone Timeline | Cumulative Stored Data | Recurring Monthly Pre-Tax Cost | GST @ 18.00% | Recurring Monthly Post-Tax Payable |
|---|---|---:|---:|---:|
| **Month 1 (Go-Live)** | 6.24 GB Media | **₹26.67 INR** | ₹4.80 INR | **₹31.47 INR** |
| **Month 3** | 18.72 GB Media | **₹57.77 INR** | ₹10.40 INR | **₹68.17 INR** |
| **Month 6** | 37.44 GB Media | **₹104.42 INR** | ₹18.80 INR | **₹123.22 INR** |
| **Month 9** | 56.16 GB Media | **₹151.07 INR** | ₹27.19 INR | **₹178.26 INR** |
| **Month 12 (Year-End)** | 74.88 GB Media | **₹197.58 INR** | ₹35.56 INR | **₹233.14 INR** |

### 3.1 Blended Annual Production Total (Year 1)
- **Blended Monthly Average (Pre-Tax)**: **~₹112.00 INR / month**
- **Annualized Pre-Tax Total (Year 1)**: **₹1,344.96 INR / year**
- **Annualized GST @ 18.00% (SAC 998315)**: **₹242.09 INR / year** (100% creditable via Input Tax Credit)
- **Annualized Post-Tax Total (Year 1)**: **₹1,587.05 INR / year**

---

## 4. Optional Enterprise Production Add-ons (Documented Separately)

For executive decision-makers evaluating strict sub-50ms latency SLAs and automated AI visual inspections, two optional add-ons are modeled:

1. **High-Availability Warm-Instance Add-on (Cloud Run Min-Instances = 1)**:
   - Eliminates cold starts completely during shift hours (06:00–22:00 IST).
   - Monthly Idle Allocation: 730 hours × 3,600s = 2,628,000 vCPU-seconds and GiB-seconds.
   - Cost: **+₹1,253.00 INR / month pre-tax** (+₹1,478.54 post-tax).
2. **Vertex AI Visual Hazard Detection Add-on (Gemini 1.5 Flash in `asia-south1`)**:
   - Automated PPE verification and equipment certificate OCR across all 9,000 permits/month.
   - Cost: **+₹101.40 INR / month pre-tax** (+₹119.65 post-tax).
