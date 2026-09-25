# Workload & Usage Assumptions — ARPL EHS Permit-to-Work Platform

> **Document ID**: ARPL-FIN-USAGE-2026-09-25-R3  
> **Status**: AUDITED, DAILY-TRANSACTION VALIDATED & REGIONALLY VERIFIED  
> **Revision**: R3 — First-Principles Daily Transaction Volume Derivation  
> **Target System**: Production & Development Environments  
> **Target Region**: Primary: `asia-south1` (Mumbai, Maharashtra, India)  
> **Pricing Currency**: INR (₹) converted from USD list price at **1 USD = ₹95.90 INR** (Checked 2026-09-25 12:33 IST)  

---

## 1. Confirmed Operational Workload Baseline

The following baseline parameters represent confirmed physical realities across ARPL's 6 active construction sites:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONFIRMED OPERATIONAL BASELINE                            │
│                                                                                        │
│  • Active Business Construction Projects:     6 Construction Sites                     │
│  • Unique Users per Construction Project:     60 Personnel / Site                      │
│  • Total Unique Authenticated Personnel:      360 Unique Authenticated Accounts        │
│  • Daily Active Users (DAU on Shift):         ~216 Active Staff / Day (60% on shift)   │
│  • Peak Concurrent Users (Morning Rush):      35 to 45 Concurrent Users (06:30–09:30)  │
│  • Daily Permit Issuance Volume:              300 Permits / Day Total (50/day/site)    │
│  • Monthly Permit Volume (30-day billing):    9,000 Permits / Month                    │
│  • Annual Permit Volume (365 days):           109,500 Permits / Year                   │
│  • Primary Database:                          Cloud Firestore Native (`asia-south1`)   │
│  • Core Compute Runtime:                      Google Cloud Run (`arpl-ehs-api`)        │
│  • Production Availability SLA:               Warm-Instance (`min-instances = 1`)      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Daily User Activity & Concurrency Patterns

### 2.1 Daily Shift Operations
* **Shift Timing**: Primary construction operations run from **06:00 to 22:00 IST** (16 operational hours/day). Night shifts and holiday work (PTW-010) operate between 21:00 and 06:00 under pre-authorized dual-phase handovers.
* **Peak Morning Gate Rush (06:30 – 09:30 IST)**:
  * Over 70% of daily permits (210 out of 300 permits) are initiated, reviewed, and authorized during this 3-hour window.
  * **35 to 45 concurrent supervisors and engineers** actively upload photos, enter gas readings, and affix digital signatures simultaneously.
  * **Requirement for Warm Compute**: To prevent connection timeouts on cellular networks (3G/4G) and eliminate cold-start delays (2–5 seconds), Cloud Run maintains **`min-instances = 1` warm** throughout operational shift hours.

---

## 3. Daily Transaction Breakdown per Single Permit Lifecycle

A permit undergoes a multi-stage lifecycle involving initiation, multi-tier approvals, active work gating, observations, and formal surrender:

```
[1. Initiation] ───> [2. Multi-Tier Review] ───> [3. Active Inspections] ───> [4. Closure & Surrender]
  • 2 Photos           • 4 Digital Signatures     • 0.5 Inspection Photos       • 1 Housekeeping Photo
  • 1 Signature        • 4 Review Downloads       • 1 Re-check Download         • 1 Surrender Signature
  • 4 DB Writes        • 12 DB Writes             • 4 DB Writes                 • 5 DB Writes
```

### 3.1 Itemized Physical Artifacts & Operations per Permit

| Lifecycle Step | Activities & Regulatory Invariants | Media Artifacts & Sizes | Firestore Reads | Firestore Writes | Storage Uploads (Class A) | Media Review Downloads |
|---|---|---|---:|---:|---:|---:|
| **1. Initiation & Drafting** | Pre-work hazard inspection photo, equipment/LOTO photo, Permittee digital signature | 2 Photos (~800 KB) + 1 Signature (~40 KB) = 840 KB | 4 | 4 | 3 | 0 |
| **2. Multi-Stage Review Chain** | Site Engineer review, Section Head review, Domain Clearance (Electrical/P&M), EHS Activation | 4 Signatures (~160 KB) + 1 Statutory PDF draft (~250 KB) = 410 KB | 6 | 12 | 5 | 3.5 (Approvers inspect photos/PDF) |
| **3. Active Inspections & Gating** | Gas tests (PTW-004), hazard observations, safety checklist audits | 0.5 Photos (probabilistic avg ~200 KB) | 4 | 4 | 0.5 | 1.0 (Auditors review permits) |
| **4. Closure & Surrender** | Post-work housekeeping restoration photo, surrender signature, final stamped statutory PDF | 1 Photo (~400 KB) + 1 Signature (~40 KB) = 440 KB | 2 | 5 | 2 | 1.0 (Final verification) |
| **Total per Single Permit** | **Complete Statutory Lifecycle** | **~1.85 MB Total Media** (3.5 Photos + 5 Sigs + 1 PDF) | **16 Reads** | **25 Writes** | **10.5 Uploads** | **5.5 Downloads (~1.3 MB)** |

---

## 4. First-Principles Derivation of Daily & Monthly Cloud Volumes

### 4.1 Storage & Media Ingestion (Google Cloud Storage in `asia-south1`)

> ⚠️ **Regional Free Tier Reality**: Google Cloud Storage Always Free quotas apply **ONLY to US regions**. In `asia-south1` (Mumbai), **all storage and operations are billable from byte zero**.

1. **Daily Media Ingestion**:
   - $300 \text{ permits/day} \times 1.85 \text{ MB/permit} = \mathbf{555 \text{ MB / day}}$ of photos, signatures, and statutory PDFs.
2. **Monthly Media Ingestion (30 days)**:
   - $555 \text{ MB/day} \times 30 \text{ days} = 16,650 \text{ MB} \approx \mathbf{16.26 \text{ GB / month}}$.
3. **Cumulative Storage Growth (at ₹2.49 / GB / month)**:
   - **Month 1 (Go-Live)**: $16.26 \text{ GB} \times ₹2.49 = \mathbf{₹40.49 / \text{month}}$.
   - **Month 3**: $48.78 \text{ GB} \times ₹2.49 = \mathbf{₹121.46 / \text{month}}$.
   - **Month 6**: $97.56 \text{ GB} \times ₹2.49 = \mathbf{₹242.92 / \text{month}}$.
   - **Month 9**: $146.34 \text{ GB} \times ₹2.49 = \mathbf{₹364.39 / \text{month}}$.
   - **Month 12 (Year-End)**: $195.12 \text{ GB} \times ₹2.49 = \mathbf{₹485.85 / \text{month}}$.
   - *12-Month Total Variable Storage Cost*: $16.26 \times (1 + 2 + \dots + 12) \times ₹2.49 = \mathbf{₹3,158.02 / \text{year}}$ (Blended: **₹263.17 / month**).
4. **Storage Operations**:
   - **Class A Uploads**: $300 \text{ permits/day} \times 10.5 \text{ uploads} = 3,150 \text{ uploads/day} \times 30 = \mathbf{94,500 \text{ ops/month}}$.
     - Billable in `asia-south1` @ $0.05/10k (₹4.80/10k): $9.45 \times ₹4.80 = \mathbf{₹45.36 / \text{month}}$.
   - **Class B Reads/Previews**: Field inspectors viewing photo thumbnails and signature vectors:
     - ~150,000 ops/month @ $0.004/10k (₹0.38/10k): $15.0 \times ₹0.38 = \mathbf{₹5.70 / \text{month}}$.
   - **Private Disaster Recovery Backup Bucket**:
     - 4 weekly database snapshots @ 1.0 GB = 4.0 GB stored @ ₹2.49/GB = **₹9.96 / month**.

---

### 4.2 Network Egress Derivation (Daily Field Review Traffic)

Network egress represents the physical data transfer over the internet to field users across India:

1. **GCS Media Download Egress (Field Inspector Reviews)**:
   - When supervisors, section heads, and EHS officers review permits on tablets, they download site photos, signatures, and PDF previews (~1.3 MB payload per review).
   - With 300 permits/day and an average of 3.5 reviews per permit:
     - Daily Egress: $300 \text{ permits/day} \times 3.5 \text{ reviews} \times 1.3 \text{ MB} = \mathbf{1,365 \text{ MB / day}} \approx \mathbf{1.33 \text{ GB / day}}$.
     - Monthly Egress: $1.33 \text{ GB/day} \times 30 = \mathbf{40.0 \text{ GB / month}}$.
     - Rate: In `asia-south1`, GCS internet egress is billable from byte zero at $0.12/GB (₹11.51/GB).
     - **Monthly Cost**: $40.0 \text{ GB} \times ₹11.51 = \mathbf{₹460.32 / \text{month}}$.
2. **Cloud Run API JSON Response Egress**:
   - 300 permits/day × 6 state transitions = 1,800 calls/day.
   - 216 Daily Active Users fetching permit lists, activity logs, and status updates: ~20 calls/user/day = 4,320 calls/day.
   - Scheduler ticks & background task dispatches: ~1,440 calls/day.
   - Total API Invocations: **7,560 requests/day = 226,800 requests/month**.
   - Average JSON response: ~3.5 KB.
   - Monthly Egress: $226,800 \times 3.5 \text{ KB} \approx \mathbf{0.79 \text{ GB / month}}$.
   - Rate: Cloud Run uses Premium Tier exclusively (no free tier in India).
     - **Monthly Cost**: $0.79 \text{ GB} \times ₹11.51 = \mathbf{₹9.09 / \text{month}}$.
3. **Firestore Client SDK Outbound Egress**:
   - Real-time `onSnapshot` listener updates streaming to active mobile clients = **~12.0 GiB / month**.
   - Free Quota: 10.0 GiB / month (Global Firestore free quota applies in Mumbai).
   - Billable: $12.0 - 10.0 = \mathbf{2.0 \text{ GiB / month}}$ @ $0.12/GB = **₹23.02 / month**.
4. **Firebase Hosting CDN Data Transfer**:
   - PWA client application code, stylesheets, and icons: ~4.5 GB / month.
   - Free Quota: 360 MB/day (~10.8 GB/month) global CDN transfer.
   - **Cost**: **₹0.00 / month** (100% within free quota).
5. **Total Monthly Network Egress Spend**:
   - GCS Media Downloads: ₹460.32
   - Cloud Run API Responses: ₹9.09
   - Firestore Client Sync: ₹23.02
   - Firebase Hosting CDN: ₹0.00
   - **Total Outbound Egress = ₹492.43 / month** (The #2 cost driver).

---

### 4.3 Compute & API Derivation (Google Cloud Run in `asia-south1`)

> **Why Cloud Run Compute is NOT Modeled as ₹0 in Enterprise Production**:
> While Cloud Run provides an Always Free allowance of 180,000 vCPU-seconds and 360,000 GiB-seconds for *active* execution, running high-risk construction safety systems on scale-to-zero in production is unacceptable to enterprise leadership due to **cold-start delays (2–5 seconds)** during morning gate rushes.
> Therefore, production includes a **Warm-Instance SLA (`min-instances = 1`)**.

1. **Daily & Monthly API Invocations**:
   - Daily Calls: 7,560 requests / day.
   - Monthly Calls: **226,800 requests / month** (Well within 2,000,000 free requests quota).
2. **Active Compute Workload**:
   - **Statutory PDF Generation**: Compiling 300 multi-page A4 PDFs/day with embedded high-DPI signatures and legal clauses requires ~2.0 seconds of CPU per PDF:
     - $300 \text{ PDFs/day} \times 2.0\text{s} = 600 \text{ vCPU-seconds / day} = \mathbf{18,000 \text{ vCPU-seconds / month}}$.
   - **State Machine Transitions & REST APIs**: 226,800 calls @ 150 ms average:
     - $226,800 \times 0.15\text{s} = \mathbf{34,020 \text{ vCPU-seconds / month}}$.
   - **SLA Escalation Engine**: 8,640 sweeps/month @ 100 ms:
     - $8,640 \times 0.10\text{s} = \mathbf{864 \text{ vCPU-seconds / month}}$.
   - **Total Active Compute**: $18,000 + 34,020 + 864 = \mathbf{52,884 \text{ vCPU-seconds / month}}$ (and 52,884 GiB-seconds).
   - *Active Compute Quota Comparison*: 52,884 vs. 180,000 free vCPU-sec $\rightarrow$ Active compute is **100% covered by the Always Free Tier** (29.4% quota utilized).
3. **Production Warm Instance SLA (`min-instances = 1`)**:
   - To guarantee zero cold starts and sub-100ms response times during operational shift hours (06:00 to 22:00 IST = 16 hours/day = 480 hours/month):
   - **Idle vCPU Allocation**:
     - $480 \text{ hrs} \times 3,600\text{s} \times 1 \text{ vCPU} = 1,728,000 \text{ idle vCPU-seconds}$.
     - Cost @ $0.00000450 / sec $\times ₹95.90 = \mathbf{₹745.72 / \text{month}}$.
   - **Idle RAM Allocation**:
     - $480 \text{ hrs} \times 3,600\text{s} \times 1 \text{ GiB} = 1,728,000 \text{ idle GiB-seconds}$.
     - Cost @ $0.00000090 / sec $\times ₹95.90 = \mathbf{₹149.14 / \text{month}}$.
   - **Total Warm-Instance SLA Compute Cost**: **₹894.86 / month** (~$9.33 USD/month).
   - *(Optional 24/7 Warm Instance for Continuous Night Shifts = 730 hrs/mo: ₹1,360.97 / month)*.

---

### 4.4 Cloud Firestore Database Operations (Daily User Load)

1. **Daily Operational Read Breakdown**:
   - 216 Daily Active Users (DAU) accessing active dashboards 4 times/shift: $216 \times 4 \times 30 \text{ permits} = 25,920 \text{ reads/day}$.
   - Real-time `onSnapshot` listener delta updates: ~30,000 reads/day.
   - Approver inspection of permit details and checklists: $300 \text{ permits} \times 4 \text{ stages} \times 15 \text{ sub-documents} = 18,000 \text{ reads/day}$.
   - SLA escalation query sweeps: ~2,500 reads/day.
   - **Total Daily Reads**: **~76,420 reads / day**.
   - **Monthly Reads**: $76,420 \times 30 = \mathbf{2,292,600 \text{ reads / month}}$.
   - *Free Quota*: 50,000 reads/day = 1,500,000 reads/month.
   - *Billable Reads*: $2,292,600 - 1,500,000 = \mathbf{792,600 \text{ billable reads/month}}$.
   - Cost @ $0.036 / 100k (₹3.45 / 100k): $7.926 \times ₹3.45 = \mathbf{₹27.35 / \text{month}}$.
2. **Daily Operational Write Breakdown**:
   - 300 permits/day × 25 lifecycle writes = **7,500 writes / day**.
   - Monthly Writes: $7,500 \times 30 = \mathbf{225,000 \text{ writes / month}}$.
   - *Free Quota*: 20,000 writes/day = 600,000 writes/month.
   - *Billable Writes*: **0 writes** (100% within free quota).
3. **Database Storage Accumulation**:
   - 300 permits/day × 10 KB JSON structured permit metadata = 3.0 MB/day = 90 MB/month.
   - Cumulative Month 12 data: **~1.08 GiB**.
   - *Free Quota*: 1.0 GiB free.
   - *Billable Month 12 Storage*: $1.08 - 1.0 = 0.08 \text{ GiB} @ \$0.207/\text{GiB} = \mathbf{₹1.59 / \text{month}}$.
4. **Point-in-Time Recovery (PITR)**:
   - Continuous 7-day backup: 1.08 GiB @ $0.12/GiB/mo = $\mathbf{₹12.43 / \text{month}}$.

---

## 5. Summary of Daily-Derived Production Monthly Costs

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              REVISED PRODUCTION MONTHLY RUN-RATE                       │
│                              (Based on 300 Permits/Day Physical Volume)                │
│                                                                                        │
│  MONTH 1 (Initial Go-Live):                                                            │
│  • Cloud Run (Warm Compute + API Egress):     ₹903.95 INR / month                      │
│  • Cloud Storage (Media, Ops, Egress, DR):    ₹556.95 INR / month                      │
│  • Cloud Firestore (Reads, PITR, Sync Egress):₹62.81 INR / month                       │
│  • Secret Manager & Security Operations:      ₹2.88 INR / month                        │
│  • Total Month 1 Pre-Tax:                     ₹1,526.59 INR / month (~$15.92 USD/mo)   │
│  • Applicable 18% GST (SAC 998315):           ₹274.79 INR / month                      │
│  • Total Month 1 Post-Tax Payable:            ₹1,801.38 INR / month                    │
│                                                                                        │
│  MONTH 12 (With 195 GB Cumulative Media Archive):                                      │
│  • Cloud Run (Warm Compute + API Egress):     ₹903.95 INR / month                      │
│  • Cloud Storage (195 GB Media + Ops + Egress):₹1,002.31 INR / month                   │
│  • Cloud Firestore (Reads, Storage, PITR, Egr):₹64.40 INR / month                      │
│  • Secret Manager & Security Operations:      ₹2.88 INR / month                        │
│  • Total Month 12 Pre-Tax:                    ₹1,973.54 INR / month (~$20.58 USD/mo)   │
│  • Applicable 18% GST (SAC 998315):           ₹355.24 INR / month                      │
│  • Total Month 12 Post-Tax Payable:           ₹2,328.78 INR / month                    │
│                                                                                        │
│  ANNUAL YEAR 1 FINANCIAL TOTAL:                                                        │
│  • Blended Monthly Pre-Tax Average:           ~₹1,750.10 INR / month (~$18.25 USD/mo)  │
│  • Annualized Pre-Tax Total (Year 1):         ₹21,001.22 INR / year (~$218.99 USD/yr)  │
│  • Annualized GST @ 18.00%:                   ₹3,780.22 INR / year (100% ITC Credit)   │
│  • Annualized Post-Tax Total (Year 1):        ₹24,781.44 INR / year (~$258.41 USD/yr)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
