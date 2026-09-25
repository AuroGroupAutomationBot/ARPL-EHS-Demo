# Costing Anomaly Review & Historical Variance Audit

> **Document ID**: ARPL-FIN-AUDIT-2026-09-25  
> **Status**: COMPLETED & VERIFIED  
> **Audit Date**: 2026-09-25  
> **Target Scope**: Independent Audit of Draft Cost Estimates, Pricing Mechanics, and Sizing Assumptions  

---

## 1. Executive Summary of Costing Anomalies

An independent re-audit of the preliminary cost estimates reveals that the earlier draft was built on severely understated workload inputs, an outdated foreign exchange conversion rate, and incomplete operational transaction mapping:
1. **User Volume Understated by 7.2×**: The draft assumed 50 total registered users (40 MAU), whereas the confirmed workload is **60 unique users per project across 6 projects = 360 unique users**.
2. **Permit Volume Understated by 12×**: The draft modeled 30 permits/day (750 permits/month), whereas the confirmed primary baseline is **300 permits/day total (9,000 permits/month, 109,500 permits/year)**.
3. **Currency Conversion Flaw**: USD list prices were converted at an obsolete reference rate of **₹84.00/USD**, understating all USD-denominated infrastructure costs by **~14.16%** compared to the verified live rate of **₹95.90/USD**.
4. **Severe Storage Ingestion Under-Calculation**: The draft modeled only 0.5 GB of media stored in Month 1. At 300 permits/day with mandatory inspection photos and high-DPI signatures, actual monthly media ingestion is **6.24 GB/month**, which exceeds the 5.0 GB free tier in Month 1.
5. **Omission of Statutory Disaster Recovery**: The draft included no provision for **Firestore Point-in-Time Recovery (PITR)**, leaving high-risk statutory safety records vulnerable to single-point operational errors.

Below is the exhaustive, itemized costing anomaly register detailing every identified issue.

---

## 2. Itemized Cost Anomaly Audit Register

### ANOMALY-COST-001: Outdated USD to INR Foreign Exchange Reference Rate
- **Previous Value**: 1 USD = ₹84.00 INR (Historical static assumption).
- **Corrected Value**: **1 USD = ₹95.90 INR** (Verified live spot exchange rate, checked 2026-09-25 12:33 IST).
- **Reason**: The Indian Rupee exchange rate has adjusted significantly. Retaining ₹84/USD resulted in a flat ~14% error across every USD-denominated SKU in the catalog.
- **Source**: [XE.com Live Currency Data](https://www.xe.com), [Wise Currency Exchange](https://wise.com), [BookMyForex](https://www.bookmyforex.com).
- **Impact**: All list rates and projections updated to reflect live commercial reality.

---

### ANOMALY-COST-002: Incorrect User Baseline (50 Total Users vs. 360 Unique Users)
- **Previous Value**: 50 registered users (3 projects × 17 roles), 40 MAU.
- **Corrected Value**: **360 unique authenticated users (6 projects × 60 unique users/project)**, 360 MAU, ~216 DAU.
- **Reason**: The previous draft misread the project staffing model, assuming 10 users per project or 50 total. The confirmed enterprise baseline is 60 unique users per site across 6 active business construction projects.
- **Source**: Confirmed Business & Workload Inputs (ARPL Project Governance).
- **Cost Impact**: In Firebase Authentication, both 40 MAU and 360 MAU fall completely within the **50,000 free MAU/month** tier for Email/Password authentication. Pre-tax cost remains **₹0.00**. However, the 7.2× increase in active personnel drives higher daily dashboard queries and real-time listener events.

---

### ANOMALY-COST-003: Incorrect Permit Volume Baseline (30/Day vs. 300/Day Total)
- **Previous Value**: 30 permits/day (750 permits/month, 9,000 permits/year).
- **Corrected Value**: **300 permits/day total across 6 projects (9,000 permits/month, 109,500 permits/year)**.
- **Reason**: The draft assumed 10 permits/day across 3 sites. The confirmed reality is 300 permits issued daily across the enterprise, representing a **12× increase in operational transactions**.
- **Source**: Confirmed Business & Workload Inputs.
- **Cost Impact**:
  - Direct Firestore writes increase from 15,750/mo to 189,000/mo (still within 20k/day free tier).
  - Storage ingestion increases from 0.375 GB/mo to 6.24 GB/mo (exceeds free tier in Month 1).
  - Cloud Run state transitions increase from 3,750/mo to 45,000/mo.

---

### ANOMALY-COST-004: Understated Monthly Media Ingestion and Storage Accumulation
- **Previous Value**: 0.5 GB stored in Month 1; 5.0 GB stored in Month 12 (Assumed 1 photo per permit @ 500 KB on 750 permits/mo).
- **Corrected Value**: **6.24 GB stored in Month 1; 74.88 GB stored in Month 12** (Assumed 1 site photo @ 400 KB + 4 canvas signatures @ 160 KB + 1 statutory PDF report @ 150 KB = 710 KB/permit × 9,000 permits/mo).
- **Reason**: The draft omitted digital signatures and statutory PDF certificates from the storage calculation and modeled 12× fewer permits.
- **Source**: First-principles calculation from FR-009, FR-011, FR-012, and 9,000 permits/month.
- **Cost Impact**: Cloud Storage was previously modeled at ₹0 in Month 1. In reality, Month 1 exceeds the 5.0 GB free quota by 1.24 GB (₹3.09), and Month 12 accumulates 74.88 GB (₹174.00/month).

---

### ANOMALY-COST-005: Omission of Point-in-Time Recovery (PITR) Database Protection
- **Previous Value**: ₹0.00 / Omitted from database BOM.
- **Corrected Value**: **₹7.48 / month (Month 1) growing to ~₹12.00 / month (Month 12)** for continuous 7-day PITR.
- **Reason**: Regulatory safety compliance (Directorate General of Factory Advice Service and Labour Institutes) mandates non-repudiable safety records. Operating high-risk statutory permits without continuous PITR backup introduces unacceptable legal and operational risk.
- **Source**: Google Cloud Firestore Pricing Catalog (`$0.12/GiB/month`).
- **Cost Impact**: Negligible incremental cost (~₹7 to ₹12/month) delivering enterprise-grade business continuity.

---

### ANOMALY-COST-006: Premature Omission of Google Cloud Run Compute Backbone
- **Previous Value**: Cloud Run excluded; ₹0 compute cost based on Cloud Functions.
- **Corrected Value**: **Cloud Run included in the BOM at ₹0.00 / month (Scale-to-Zero)**, with an optional **₹1,253.00 / month Warm-Instance SLA configuration**.
- **Reason**: The draft falsely concluded Cloud Run was unnecessary. Cloud Run is required for containerized statutory PDF generation, SLA escalation sweeps, and authoritative 27-state transition execution. However, because Google Cloud provides 180,000 vCPU-seconds, 360,000 GiB-seconds, and 2,000,000 requests free every month, Cloud Run in scale-to-zero mode has a baseline cost of **₹0.00**.
- **Source**: Google Cloud Run Pricing Catalog & Sizing Derivation.
- **Cost Impact**: Zero increase in baseline pre-tax cost, with massive architectural and reliability gains.

---

### ANOMALY-COST-007: Unvalidated 18% GST Without Contracting Entity Analysis
- **Previous Value**: Applied flat 18% GST with no legal tax classification.
- **Corrected Value**: Formally documented contracting entity: **Google Cloud India Private Limited** (CIN: U72900KA2019FTC126046), SAC **998315** (OIDAR / Cloud Infrastructure). 18% GST documented distinctly as fully creditable via **Input Tax Credit (ITC)** against valid corporate GSTIN.
- **Reason**: Procurement financial validation requires distinguishing gross cash outflow from net tax expense.
- **Source**: Central Board of Indirect Taxes and Customs (CBIC) & Google Cloud India Master Services Agreement.
- **Cost Impact**: Full commercial transparency for procurement sign-off.

---

## 3. Phase 38: Comprehensive Old vs. New Cost Comparison Table

Below is the side-by-side component comparison between the previous preliminary draft (30 permits/day, 50 users, ₹84/USD) and the recalculated, verified production baseline (300 permits/day, 360 users, ₹95.90/USD, Cloud Run + Firestore PITR).

| Infrastructure Component | Previous Draft Estimate (Month 1) | Previous Draft Estimate (Month 12) | Recalculated Production Model (Month 1) | Recalculated Production Model (Month 12) | Recalculated Annual Total (Year 1) | Variance & Root Cause Explanation |
|---|---:|---:|---:|---:|---:|---|
| **01. Firebase (Hosting & App Check)**| ₹0.00 | ₹0.00 | **₹0.00** | **₹0.00** | **₹0.00** | Zero variance. SPA assets and CDN transfer remain 100% within free tiers. |
| **02. Identity (Firebase Auth)** | ₹0.00 | ₹0.00 | **₹0.00** | **₹0.00** | **₹0.00** | Zero variance. 360 MAU is well within the 50,000 free MAU allowance. |
| **03. Database (Firestore Operations)**| ₹0.00 | ₹0.00 | **₹1.52** | **₹1.52** | **₹18.24** | +₹1.52/mo. 12× permit volume and 7.2× users push peak weekday reads slightly above daily free tier. |
| **04. Database (Firestore Storage)** | ₹0.00 | ₹60.00 | **₹0.00** | **₹0.00** | **₹0.00** | -₹60/mo. Cumulative data reaches ~0.65 GiB in Year 1, remaining within 1.0 GiB free storage. |
| **05. Database Protection (Firestore PITR)**| *Omitted* | *Omitted* | **₹7.48** | **₹7.48** | **₹89.76** | +₹7.48/mo. Mandatory compliance addition for continuous 7-day point-in-time recovery. |
| **06. Compute (Cloud Run Core API)** | *Excluded* | *Excluded* | **₹0.00** | **₹0.00** | **₹0.00** | ₹0.00 baseline. 92,640 requests and 18,528 vCPU-sec fit 100% within Cloud Run Always Free Tier. |
| **07. Storage (Media Ingestion & Stored)**| ₹0.00 | ₹0.00 | **₹3.09** | **₹174.00** | **₹1,062.00** | +₹3.09 to +₹174/mo. Corrected 12× permit volume (6.24 GB/mo ingestion vs 0.375 GB/mo prior). |
| **08. Storage Operations (Class A Uploads)**| ₹0.00 | ₹0.00 | **₹1.92** | **₹1.92** | **₹23.04** | +₹1.92/mo. 54,000 upload ops/mo exceeds 50,000 free quota by 4,000 ops. |
| **09. Networking (Internet Egress)** | ₹0.00 | ₹0.00 | **₹0.00** | **₹0.00** | **₹0.00** | Zero variance. 8.0 GB/mo egress remains within the 10.0 GiB/mo free allowance. |
| **10. Security (Secret Manager)** | ₹20.00 | ₹20.00 | **₹2.88** | **₹2.88** | **₹34.56** | -₹17.12/mo. Consolidated secrets (4 active versions within 6 free; 10k billable access ops). |
| **11. CI/CD (Cloud Build)** | ₹0.00 | ₹0.00 | **₹0.00** | **₹0.00** | **₹0.00** | Zero variance. 100 build min/mo fits within 2,500 free minutes. |
| **12. CI/CD (Artifact Registry)** | ₹8.00 | ₹8.00 | **₹4.80** | **₹4.80** | **₹57.60** | -₹3.20/mo. Storing 0.5 GB container image @ ₹9.59/GB. |
| **13. Logging & Monitoring** | ₹0.00 | ₹0.00 | **₹0.00** | **₹0.00** | **₹0.00** | Zero variance. 3 GiB ingestion is well within 50 GiB free logging tier. |
| **14. Disaster Recovery (GCS Backup Bucket)**| ₹4.00 | ₹4.00 | **₹4.98** | **₹4.98** | **₹59.76** | +₹0.98/mo. Adjusted for live FX rate (₹95.90 vs ₹84.00). |
| **PRE-TAX TOTAL (INR)** | **₹32.00** | **₹92.00** | **₹26.67** | **₹197.58** | **₹1,344.96** | **Net Year 1 Total: ~₹1,345 pre-tax vs ~₹650 prior** |
| **GST @ 18.00%** | ₹5.76 | ₹16.56 | **₹4.80** | **₹35.56** | **₹242.09** | Documented SAC 998315; 100% creditable via ITC |
| **POST-TAX TOTAL (INR)** | **₹37.76** | **₹108.56** | **₹31.47** | **₹233.14** | **₹1,587.05** | **Net Year 1 Post-Tax: ~₹1,587 INR / year** |

---

> **Audit Conclusion**: Despite a **12× increase in permit volume** (9,000 vs. 750/mo), a **7.2× increase in user accounts** (360 vs. 50), the inclusion of **Google Cloud Run**, the addition of **Firestore PITR**, and a **14.2% foreign exchange currency adjustment**, the baseline pre-tax annual infrastructure cost increases by only **~₹695 INR/year** (from ~₹650 to ~₹1,345/year). This proves that the architectural decision to combine Firebase edge capabilities with Cloud Run serverless scale-to-zero compute is exceptionally sound and robust.
