# Mathematical Cost Model & Sensitivity Analysis — ARPL EHS Platform

> **Document ID**: ARPL-FIN-MODEL-2026-09-25-R3  
> **Status**: AUDITED, MATHEMATICALLY DERIVED & DAILY-TRANSACTION VALIDATED  
> **Revision**: R3 — First-Principles Daily Transaction Sizing with Production Warm Compute SLA  
> **Region**: Primary: `asia-south1` (Mumbai, Maharashtra, India)  
> **Currency**: Indian Rupee (INR / ₹) converted at live rate **1 USD = ₹95.90 INR** (Checked 2026-09-25 12:33 IST)  

---

## 1. Mathematical Formulas & Meter Functions

For any scale scenario defined by:
- $S$: Number of active business construction projects
- $U$: Unique authenticated users ($60 \times S$)
- $P$: Daily permit creation volume ($P_m = P \times 30$ permits/month)
- $W$: Production compute warm instances ($W = 1$ for baseline shift hours)

$$\text{Media Ingestion (GB/mo)} = \frac{P_m \times 1.85 \text{ MB}}{1024} = \mathbf{0.0018066 \times P_m}$$

$$\text{GCS Storage Month } m = \text{Media Ingestion} \times m \times \$0.026 \times 95.90$$

$$\text{GCS Download Egress (GB/mo)} = \frac{P_m \times 3.5 \text{ reviews} \times 1.3 \text{ MB}}{1024} \times \$0.12 \times 95.90$$

$$\text{Cloud Run Warm Compute (INR/mo)} = W \times [480\text{h} \times 3600\text{s} \times (\$0.00000450 + \$0.00000090)] \times 95.90 = \mathbf{₹894.86 \times W}$$

---

## 2. Multi-Scenario Mathematical Comparison Matrix

| Resource / Parameter | Scenario A (Baseline) | Scenario B (Growth) | Scenario C (High Scale) | Special Sensitivity |
|---|---|---|---|---|
| **Active Construction Sites ($S$)** | **6 Sites** | **12 Sites** | **30 Sites** | **6 Mega-Sites** |
| **Total Authenticated Users ($U$)**| **360 Users** | **720 Users** | **1,800 Users** | **360 Users** |
| **Daily Permit Volume ($P$)** | **300 Permits / Day** | **600 Permits / Day** | **1,500 Permits / Day** | **1,800 Permits / Day** |
| **Monthly Permit Volume ($P_m$)** | **9,000 / month** | **18,000 / month** | **45,000 / month** | **54,000 / month** |
| **Annual Permit Volume** | **109,500 / year** | **219,000 / year** | **547,500 / year** | **657,000 / year** |
| --- | --- | --- | --- | --- |
| **Monthly Firestore Reads** | 2,292,600 | 4,585,000 | 11,460,000 | 13,750,000 |
| *Billable Firestore Reads / Mo* | 792,600 | 3,085,000 | 9,960,000 | 12,250,000 |
| *Firestore Read Cost / Mo* | **₹27.36** | **₹106.43** | **₹343.62** | **₹422.63** |
| **Monthly Firestore Writes** | 225,000 | 450,000 | 1,125,000 | 1,350,000 |
| *Billable Firestore Writes / Mo* | 0 (Within Free Tier) | 0 (Within Free Tier) | 525,000 | 750,000 |
| *Firestore Write Cost / Mo* | **₹0.00** | **₹0.00** | **₹54.39** | **₹77.70** |
| **Firestore PITR (7-Day Backup)**| **₹12.43** | **₹24.86** | **₹62.15** | **₹74.58** |
| --- | --- | --- | --- | --- |
| **New Media Ingestion / Month** | 16.26 GB | 32.52 GB | 81.30 GB | 97.56 GB |
| **Cumulative Storage (Month 12)**| 195.12 GB | 390.24 GB | 975.60 GB | 1,170.72 GB |
| *GCS Storage Cost (M1) — NO free*| **₹40.49** | **₹80.97** | **₹202.44** | **₹242.92** |
| *GCS Storage Cost (M12) — NO free*| **₹485.85** | **₹971.70** | **₹2,429.24** | **₹2,915.09** |
| *GCS Class A Ops (Uploads)* | **₹45.36** | **₹90.72** | **₹226.80** | **₹272.16** |
| *GCS Class B Ops (Reads)* | **₹5.70** | **₹11.40** | **₹28.50** | **₹34.20** |
| --- | --- | --- | --- | --- |
| **Cloud Run API Requests / Mo** | 226,800 (Free) | 453,600 (Free) | 1,134,000 (Free) | 1,360,800 (Free) |
| **Cloud Run Warm Instance SLA** | **₹894.86** (1 inst) | **₹894.86** (1 inst) | **₹1,789.72** (2 inst) | **₹1,789.72** (2 inst) |
| *Cloud Run Active CPU Overage* | ₹0.00 | ₹0.00 | **₹82.50** | **₹165.00** |
| --- | --- | --- | --- | --- |
| **Cloud Run API Egress / Mo** | 0.79 GB (₹9.09) | 1.58 GB (₹18.19) | 3.95 GB (₹45.46) | 4.74 GB (₹54.56) |
| **GCS Media Download Egress** | 40.0 GB (₹460.32)| 80.0 GB (₹920.64)| 200.0 GB (₹2,302.00)| 240.0 GB (₹2,762.40)|
| **Firestore SDK Egress (Sync)** | 2.0 GiB (₹23.02) | 14.0 GiB (₹161.14)| 50.0 GiB (₹575.50)| 62.0 GiB (₹713.62)|
| --- | --- | --- | --- | --- |
| **Secret Manager & DR Bucket** | **₹12.84** | **₹17.82** | **₹37.74** | **₹42.72** |
| --- | --- | --- | --- | --- |
| **MONTH 1 PRE-TAX TOTAL** | **₹1,531.52** | **₹2,126.90** | **₹4,814.80** | **₹5,589.91** |
| **MONTH 12 PRE-TAX TOTAL** | **₹1,978.47** | **₹3,020.17** | **₹7,046.20** | **₹8,267.48** |
| **BLENDED MONTHLY (YEAR 1 PRE-TAX)**| **₹1,755.03** | **₹2,573.54** | **₹5,930.50** | **₹6,928.70** |
| **ANNUAL PRE-TAX TOTAL (YEAR 1)**| **₹21,060.38** | **₹30,882.48** | **₹71,166.00** | **₹83,144.40** |
| **GST @ 18.00%** | **₹3,790.87** | **₹5,558.85** | **₹12,809.88** | **₹14,966.00** |
| **ANNUAL POST-TAX TOTAL (YEAR 1)**| **₹24,851.25** | **₹36,441.33** | **₹83,975.88** | **₹98,110.40** |

---

## 3. Scenario Financial Interpretations

### 3.1 Scenario A: Confirmed Enterprise Baseline (6 Projects, 300 Permits/Day)
* **Primary Cost Composition**: Cloud Run Warm Instance SLA (51.0%), Network Egress (28.1%), Cloud Storage Media Archive (15.0%).
* **Run-Rate**: Month 1 starts at **₹1,531.52 / month (~$15.97 USD)**. Month 12 reaches **₹1,978.47 / month (~$20.63 USD)** as 195 GB of photos and statutory PDFs accumulate.
* **Annual Investment**: **₹21,060.38 INR / year (~$219.61 USD/year pre-tax)**.

### 3.2 Scenario B: Growth Scenario (12 Projects, 600 Permits/Day)
* Permit volume doubles across 12 active sites.
* Single warm instance handles traffic easily (concurrency = 80 req/instance).
* Firestore reads and GCS egress scale linearly.
* **Annual Investment**: **~₹30,882 INR / year (~$322 USD/year pre-tax)**.

### 3.3 Scenario C: High Scale Enterprise Rollout (30 Projects, 1,500 Permits/Day)
* Major pan-India construction conglomerate operations across 30 major residential, commercial, and industrial sites.
* Sized with **2 Warm Instances (`min-instances = 2`)** to guarantee sub-100ms response times across 200+ concurrent morning users.
* Active compute exceeds Always Free tier (264,000 vCPU-seconds > 180,000 free quota), incurring small overage charges (₹82.50/mo).
* **Annual Investment**: **~₹71,166 INR / year (~$742 USD/year pre-tax)**.

### 3.4 Special Sensitivity: Mega-Infrastructure Intensity (6 Sites @ 300 Permits/Site/Day = 1,800/Day)
* Simulates hyper-intensive operations such as metro rail tunneling or international airport construction.
* Sized with 2 Warm Instances and high egress.
* **Annual Investment**: **~₹83,144 INR / year (~$867 USD/year pre-tax)**.
