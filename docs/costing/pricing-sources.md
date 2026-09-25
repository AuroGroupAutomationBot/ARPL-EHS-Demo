# Pricing Sources & Currency Reference — ARPL EHS Platform

> **Document ID**: ARPL-FIN-PRICING-2026-09-25  
> **Status**: VERIFIED & AUDITED  
> **Pricing Verification Date**: 2026-09-25  
> **Target Region**: `asia-south1` (Mumbai, India)  
> **Legal Billing Entity**: Google Cloud India Private Limited (Contracting Entity)  

---

## 1. Live Exchange Rate & Currency Conversion Standard

For all Google Cloud and Firebase services where public list pricing is published in United States Dollars (USD), the following live reference exchange rate is established:

| Currency Metric | Reference Value |
|---|---|
| **Base Currency** | United States Dollar (USD / $) |
| **Billing & Settlement Currency** | Indian Rupee (INR / ₹) |
| **Live Spot Exchange Rate** | **1 USD = ₹95.90 INR** |
| **Pricing Verification Timestamp** | **2026-09-25 12:33:00 IST** |
| **Exchange Rate Verification Sources** | [XE.com Live Currency Data](https://www.xe.com), [Wise Currency Exchange](https://wise.com), [BookMyForex](https://www.bookmyforex.com) |
| **Note on Previous Anomaly** | The draft costing utilized an outdated fixed rate of ₹84.00/USD, which understated all USD-denominated infrastructure costs by approximately **14.16%**. The ₹84 rate is strictly superseded. |

*Official Direct INR Rule*: Where Google Cloud India Private Limited or an authorized Google Cloud Billing Partner publishes or contracts direct INR pricing for an enterprise SKU, that direct INR contract rate shall take precedence over currency conversions.

---

## 2. Invoicing, Contracting Entity & GST Tax Treatment

- **Contracting Entity**: **Google Cloud India Private Limited** (CIN: U72900KA2019FTC126046), registered office in Bengaluru, Karnataka, India.
- **Tax Classification**: Online Information and Database Access or Retrieval (OIDAR) / IT Cloud Infrastructure Services.
- **Harmonized System of Nomenclature (HSN) / Service Accounting Code (SAC)**: **998315** (Hosting and Information Technology Infrastructure Provisioning Services).
- **Goods and Services Tax (GST)**:
  - Applicable Rate: **18.00% GST** (composed of **9% CGST + 9% SGST** for billing entities in Karnataka, or **18% IGST** for inter-state billing across India).
  - **Input Tax Credit (ITC)**: If ARPL provides a valid, active Goods and Services Tax Identification Number (GSTIN) under the reverse charge / regular B2B tax mechanism, the 18% GST charged is 100% creditable as an Input Tax Credit against ARPL's outward commercial tax liabilities.
  - **Commercial Presentation Standard**: In all BOM tables, **Pre-Tax List Price** and **Post-Tax Amount (inclusive of 18% GST)** are presented distinctly to ensure total transparency for procurement and finance audits.

---

## 3. Official Service Pricing Catalog (`asia-south1` Mumbai)

All rates below reflect Google Cloud's official published list prices for the **`asia-south1` (Mumbai)** region as of September 2026.

### 3.1 Cloud Firestore (Standard Edition, Regional `asia-south1`)
*Source: [Google Cloud Firestore Pricing Documentation](https://cloud.google.com/firestore/pricing)*

| Billing Meter | Free Tier Quota (Per Project/Day) | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Document Reads** | 50,000 reads / day | $0.036 per 100,000 | ₹3.45 per 100,000 | `Firestore Document Reads (asia-south1)` | HIGH |
| **Document Writes** | 20,000 writes / day | $0.108 per 100,000 | ₹10.36 per 100,000 | `Firestore Document Writes (asia-south1)` | HIGH |
| **Document Deletes** | 20,000 deletes / day | $0.012 per 100,000 | ₹1.15 per 100,000 | `Firestore Document Deletes (asia-south1)` | HIGH |
| **Database Storage** | 1.0 GiB total storage | $0.207 per GiB / month | ₹19.85 per GiB / month | `Firestore Storage (asia-south1)` | HIGH |
| **Index Storage** | 0.0 GiB free quota | $0.207 per GiB / month | ₹19.85 per GiB / month | `Firestore Index Storage (asia-south1)` | HIGH |
| **Point-in-Time Recovery (PITR)** | None | $0.120 per GiB / month | ₹11.51 per GiB / month | `Firestore PITR Storage (asia-south1)` | HIGH |
| **Network Egress** | 10.0 GiB / month | $0.120 per GB | ₹11.51 per GB | `Firestore Outbound Internet Egress` | HIGH |

---

### 3.2 Google Cloud Run (Fully Managed, `asia-south1`)
*Source: [Google Cloud Run Pricing Documentation](https://cloud.google.com/run/pricing)*

| Billing Meter | Always Free Allowance (Per Month) | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Requests** | 2,000,000 requests / month | $0.40 per 1,000,000 | ₹38.36 per 1,000,000 | `Cloud Run Requests (asia-south1)` | HIGH |
| **vCPU-Seconds (Active)** | 180,000 vCPU-seconds / month | $0.00002400 / vCPU-sec | ₹0.0023016 / vCPU-sec | `Cloud Run CPU Allocation (Active)` | HIGH |
| **Memory (GiB-Seconds Active)**| 360,000 GiB-seconds / month | $0.00000250 / GiB-sec | ₹0.0002398 / GiB-sec | `Cloud Run Memory Allocation (Active)` | HIGH |
| **vCPU-Seconds (Idle - Min Inst)**| None | $0.00000450 / vCPU-sec | ₹0.0004316 / vCPU-sec | `Cloud Run CPU Allocation (Idle)` | HIGH |
| **Memory (GiB-Sec Idle - Min Inst)**| None | $0.00000090 / GiB-sec | ₹0.0000863 / GiB-sec | `Cloud Run Memory Allocation (Idle)` | HIGH |
| **Outbound Data Transfer** | 1.0 GB / month | $0.120 per GB | ₹11.51 per GB | `Cloud Run Outbound Network Egress` | HIGH |

---

### 3.3 Firebase Authentication
*Source: [Firebase Authentication Pricing Documentation](https://firebase.google.com/pricing)*

| Billing Meter | Free Tier Quota | List Rate (USD) | List Rate (INR) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Email/Password MAU** | 50,000 MAU / month | $0.00 (100% Free) | ₹0.00 | `Firebase Authentication Free Tier` | HIGH |
| **Phone Authentication (India)** | 10 SMS verifications / day | ~$0.015 – $0.020 / SMS | ₹1.44 – ₹1.92 / SMS | `Identity Platform Phone Auth (IN)` | MEDIUM |

*Note*: Baseline authentication is strictly **Email/Password with Custom Claims**, which is 100% free up to 50,000 Monthly Active Users. Phone auth is not in the baseline.

---

### 3.4 Google Cloud Storage / Firebase Storage (`asia-south1` Mumbai)
*Source: [Google Cloud Storage Pricing Documentation](https://cloud.google.com/storage/pricing)*

| Billing Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Standard Storage** | 5.0 GB total storage | $0.026 per GB / month | ₹2.49 per GB / month | `Cloud Storage Standard (asia-south1)` | HIGH |
| **Nearline Storage (Archive)** | None | $0.010 per GB / month | ₹0.96 per GB / month | `Cloud Storage Nearline (asia-south1)` | HIGH |
| **Class A Operations (Uploads)**| 50,000 operations / month | $0.050 per 10,000 | ₹4.80 per 10,000 | `Storage Class A Ops (asia-south1)` | HIGH |
| **Class B Operations (Reads)** | 50,000 operations / month | $0.004 per 10,000 | ₹0.38 per 10,000 | `Storage Class B Ops (asia-south1)` | HIGH |
| **Data Retrieval (Nearline)** | None | $0.010 per GB | ₹0.96 per GB | `Storage Retrieval (Nearline)` | HIGH |

---

### 3.5 Firebase Hosting
*Source: [Firebase Hosting Documentation](https://firebase.google.com/pricing)*

| Billing Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Storage Capacity** | 10.0 GB storage | $0.026 per GB / month | ₹2.49 per GB / month | `Firebase Hosting Storage` | HIGH |
| **Data Transfer** | 360 MB / day (~10.8 GB/mo) | $0.150 per GB | ₹14.39 per GB | `Firebase Hosting CDN Egress` | HIGH |

---

### 3.6 Google Cloud Scheduler & Cloud Tasks
*Source: [Cloud Scheduler Pricing](https://cloud.google.com/scheduler/pricing) & [Cloud Tasks Pricing](https://cloud.google.com/tasks/pricing)*

| Service & Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Cloud Scheduler (Jobs)** | 3 jobs per billing account | $0.10 per job / month | ₹9.59 per job / month | `Cloud Scheduler Active Job` | HIGH |
| **Cloud Tasks (Operations)** | 1,000,000 operations / month | $0.40 per 1,000,000 | ₹38.36 per 1,000,000 | `Cloud Tasks Dispatches` | HIGH |

---

### 3.7 Google Secret Manager
*Source: [Secret Manager Pricing Documentation](https://cloud.google.com/secret-manager/pricing)*

| Billing Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Active Secret Versions** | 6 active versions total | $0.06 per version / month| ₹5.75 per version / month | `Secret Manager Active Version` | HIGH |
| **Secret Access Operations** | 10,000 operations / month | $0.03 per 10,000 ops | ₹2.88 per 10,000 ops | `Secret Manager Access Operation` | HIGH |

---

### 3.8 Google Cloud Build & Artifact Registry
*Source: [Cloud Build Pricing](https://cloud.google.com/build/pricing) & [Artifact Registry Pricing](https://cloud.google.com/artifact-registry/pricing)*

| Service & Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Cloud Build (Build Minutes)** | 2,500 minutes / month | $0.003 per minute | ₹0.29 per minute | `Cloud Build (e2-standard-2)` | HIGH |
| **Artifact Registry (Storage)** | 0.5 GB storage | $0.100 per GB / month | ₹9.59 per GB / month | `Artifact Registry Storage` | HIGH |

---

### 3.9 Google Cloud Logging & Monitoring
*Source: [Google Cloud Operations Suite Pricing](https://cloud.google.com/stackdriver/pricing)*

| Service & Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Cloud Logging (Ingestion)** | 50.0 GiB / month | $0.500 per GiB | ₹47.95 per GiB | `Logging Ingestion` | HIGH |
| **Log Storage (30 Days)** | Free for 30-day retention | $0.00 (Default Retention) | ₹0.00 | `Logging Retention (Default)` | HIGH |
| **Cloud Monitoring (Metrics)** | 150 MB metrics storage free | Standard metrics free | ₹0.00 | `Monitoring Metric Ingestion` | HIGH |

---

### 3.10 Optional AI / Machine Learning: Vertex AI (Gemini 1.5 Flash in `asia-south1`)
*Source: [Vertex AI Gemini Pricing Documentation](https://cloud.google.com/vertex-ai/pricing)*

| Meter | Free Tier Quota | List Rate (USD) | List Rate (INR @ ₹95.90) | SKU Reference Family | Confidence |
|---|---|---|---|---|---|
| **Image Input Processing** | None | $0.000020 per image | ₹0.001918 per image | `Vertex AI Gemini 1.5 Flash Image` | HIGH |
| **Text Prompt Tokens** | None | $0.075 per 1,000,000 | ₹7.19 per 1,000,000 | `Vertex AI Gemini 1.5 Flash In-Tokens`| HIGH |
| **Text Output Tokens** | None | $0.300 per 1,000,000 | ₹28.77 per 1,000,000 | `Vertex AI Gemini 1.5 Flash Out-Tokens`| HIGH |

---

> **Pricing Sign-Off**: All rates documented above are sourced directly from Google Cloud’s official regional catalog for Mumbai (`asia-south1`) and converted transparently using live market rates.
