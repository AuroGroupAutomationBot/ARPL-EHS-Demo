# DEV Environment — Bill of Materials

> **Pricing Checked On**: 2026-09-25
> **Region**: asia-south1 (Mumbai)
> **Currency**: INR (₹) — converted from USD list price at ₹84/USD reference
> **Environment**: Development / Non-Production
> **Firebase Project**: arpl-ehs-dev
> **GCP Project**: arpl-ehs-dev

---

## Service Duplication Check

| Check | Result |
|---|---|
| Cloud Functions + Cloud Run | Cloud Functions ONLY — no Cloud Run needed |
| Firestore + Cloud SQL | Firestore ONLY — no relational requirements |
| Firebase Storage + Cloud Storage | Firebase Storage ONLY (wraps GCS) |
| Firebase Hosting + Cloud CDN | Firebase Hosting ONLY |
| Firebase Auth + Identity Platform | Firebase Auth ONLY (email/password sufficient) |

---

## Regional Design

| Service | Region | Region ID | Mumbai Available | Selected | Reason |
|---|---|---|---|---|---|
| Firestore | Mumbai | asia-south1 | Yes | asia-south1 | Data residency, lowest latency |
| Cloud Functions (2nd gen) | Mumbai | asia-south1 | Yes | asia-south1 | Same region as Firestore |
| Firebase Storage | Mumbai | asia-south1 | Yes | asia-south1 | Collocated with Functions |
| Firebase Hosting | Global CDN | global | Yes | global | CDN is inherently global |
| Firebase Auth | Global | global | Yes | global | Auth is a global service |
| Secret Manager | Global | global | Yes | global | Global service |
| Cloud Build | Mumbai | asia-south1 | Yes | asia-south1 | Build in same region |
| Cloud Logging | Global | global | Yes | global | Global service |
| Cloud Scheduler | Mumbai | asia-south1 | Yes | asia-south1 | Scheduler region |

---

## DEV BOM

| BOM ID | Category | Service | Resource | Region | SKU / SKU Family | Billing Unit | Qty/Month | Unit Price (USD) | Unit Price (INR) | Monthly Cost (INR) | Annual Cost (INR) | Pricing Source | Confidence |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| DEV-001 | 01. Firebase | Firebase Auth | Email/Password MAU | global | Firebase Authentication | MAU | 10 | $0.00 | ₹0.00 | ₹0 | ₹0 | Firebase Pricing Page | HIGH |
| DEV-002 | 01. Firebase | Firebase Hosting | Storage | global | Firebase Hosting Storage | GB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Firebase Pricing (10GB free) | HIGH |
| DEV-003 | 01. Firebase | Firebase Hosting | Transfer | global | Firebase Hosting Transfer | GB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Firebase Pricing (360MB/day free) | HIGH |
| DEV-004 | 03. Database | Firestore | Document Reads | asia-south1 | Firestore Doc Reads | per 100K | 1.25 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 50K/day free quota | HIGH |
| DEV-005 | 03. Database | Firestore | Document Writes | asia-south1 | Firestore Doc Writes | per 100K | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 20K/day free quota | HIGH |
| DEV-006 | 03. Database | Firestore | Document Deletes | asia-south1 | Firestore Doc Deletes | per 100K | 0.05 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 20K/day free quota | HIGH |
| DEV-007 | 03. Database | Firestore | Storage | asia-south1 | Firestore Storage | GiB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 1 GiB free quota | HIGH |
| DEV-008 | 04. Storage | Firebase Storage | Stored Data | asia-south1 | Cloud Storage Standard | GB | 0.2 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 5 GB free quota | HIGH |
| DEV-009 | 04. Storage | Firebase Storage | Upload Operations | asia-south1 | Class A Operations | per 10K | 0.01 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within free quota | HIGH |
| DEV-010 | 04. Storage | Firebase Storage | Download Transfer | asia-south1 | Data Transfer | GB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within free quota | HIGH |
| DEV-011 | 02. Compute | Cloud Functions | Invocations | asia-south1 | CF Invocations | per million | 0.0125 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 2M free tier | HIGH |
| DEV-012 | 02. Compute | Cloud Functions | vCPU-seconds | asia-south1 | CF vCPU-second | vCPU-sec | 5,000 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 180K free tier | HIGH |
| DEV-013 | 02. Compute | Cloud Functions | Memory (GiB-sec) | asia-south1 | CF GiB-second | GiB-sec | 5,000 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 360K free tier | HIGH |
| DEV-014 | 02. Compute | Cloud Functions | Networking Egress | asia-south1 | CF Outbound Data | GB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 5 GB free tier | MEDIUM |
| DEV-015 | 05. Networking | Internet Egress | Client Data Transfer | asia-south1 | Internet Egress | GB | 1 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 10 GiB free tier | HIGH |
| DEV-016 | 06. Security | Secret Manager | Active Versions | global | SM Active Version | version | 5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 6 free versions | HIGH |
| DEV-017 | 06. Security | Secret Manager | Access Operations | global | SM Access Op | per 10K | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 10K free ops | HIGH |
| DEV-018 | 12. CI/CD | Cloud Build | Build Minutes | asia-south1 | Cloud Build e2-standard-2 | minutes | 300 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 2,500 free min | HIGH |
| DEV-019 | 10. Logging | Cloud Logging | Log Ingestion | global | Cloud Logging Ingestion | GiB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 50 GiB free tier | HIGH |
| DEV-020 | 11. Monitoring | Cloud Monitoring | Metrics & Alerts | global | Cloud Monitoring | — | — | $0.00 | ₹0.00 | ₹0 | ₹0 | Basic monitoring free | HIGH |
| DEV-021 | 12. CI/CD | Artifact Registry | Container Images | asia-south1 | AR Storage | GB | 0.5 | $0.10/GB | ₹8.40 | ₹4 | ₹50 | cloud.google.com/artifact-registry/pricing | MEDIUM |

---

## DEV BOM Summary

| Category | Monthly Cost (INR) | Annual Cost (INR) |
|---|---:|---:|
| 01. Firebase | ₹0 | ₹0 |
| 02. Compute | ₹0 | ₹0 |
| 03. Database | ₹0 | ₹0 |
| 04. Storage | ₹0 | ₹0 |
| 05. Networking | ₹0 | ₹0 |
| 06. Security | ₹0 | ₹0 |
| 07. Identity & Auth | ₹0 | ₹0 |
| 10. Logging | ₹0 | ₹0 |
| 11. Monitoring | ₹0 | ₹0 |
| 12. CI/CD | ₹4 | ₹50 |
| **TOTAL (Pre-Tax)** | **₹4** | **₹50** |
| GST @ 18% | ₹1 | ₹9 |
| **TOTAL (Post-Tax)** | **₹5** | **₹59** |

### DEV Cost Notes
- **Entire DEV environment runs within free tier** except Artifact Registry storage (₹4/month)
- **Firebase Emulator Suite** is recommended for local development (zero cloud cost)
- No minimum instances; everything scales to zero
- DEV project should use separate Firebase project and GCP project from PROD
- Budget alert recommended at ₹500/month to catch unexpected usage

---

## No-Cost / Free Quota Items (DEV)

| BOM ID | Service | Resource | Cost Status | Reason |
|---|---|---|---|---|
| DEV-001 | Firebase Auth | 10 MAU | No-cost | Within 50K MAU free tier |
| DEV-002/003 | Firebase Hosting | Storage + Transfer | No-cost | Within 10GB + 360MB/day free |
| DEV-004/005/006 | Firestore | Reads/Writes/Deletes | No-cost | Within daily free quotas |
| DEV-007 | Firestore | Storage 0.5 GiB | No-cost | Within 1 GiB free quota |
| DEV-008/009/010 | Firebase Storage | All operations | No-cost | Within 5GB free quota |
| DEV-011/012/013/014 | Cloud Functions | All compute | No-cost | Within free tier (2M inv, 180K vCPU-s) |
| DEV-015 | Internet Egress | 1 GB | No-cost | Within 10 GiB free tier |
| DEV-016/017 | Secret Manager | 5 versions, 5K ops | No-cost | Within 6 versions + 10K ops free |
| DEV-018 | Cloud Build | 300 minutes | No-cost | Within 2,500 free minutes |
| DEV-019 | Cloud Logging | 0.5 GiB | No-cost | Within 50 GiB free tier |
| DEV-020 | Cloud Monitoring | Basic | No-cost | Basic monitoring included |
