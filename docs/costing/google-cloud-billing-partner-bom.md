# Google Cloud Billing Partner BOM — ARPL EHS Permit-to-Work System

> **Prepared For**: Google Cloud Billing Partner / Google Cloud Sales / Reseller
> **Date**: 2026-09-25
> **Company**: ARPL (Auro Realty Private Limited)
> **Application**: EHS Permit-to-Work (PTW) System
> **Country**: India
> **Preferred Region**: asia-south1 (Mumbai)
> **Billing Currency**: INR (₹)

---

## 1. Application Overview

Construction site safety **Permit-to-Work** system for managing 10 types of work permits across 3 construction project sites. Features include multi-stage approval chains (3-8 stages), 16 RBAC roles, offline-first capability for construction sites with intermittent connectivity, digital signatures with DPDP Act 2023 compliance, GPS geofencing, real-time escalation engine, and statutory PDF generation.

**Key Characteristics**:
- Web application (responsive SPA) — no native mobile app
- Offline-first architecture using Firestore IndexedDB persistence
- 50 registered users across 3 construction sites
- ~30 permits created per business day
- Business hours: 06:00-22:00 IST + night shift operations

---

## 2. Architecture Summary

**Firebase-First** architecture with no additional GCP compute layer:

| Layer | Service |
|---|---|
| Frontend | Firebase Hosting (global CDN) |
| Authentication | Firebase Auth (email/password) |
| Database | Cloud Firestore (asia-south1) |
| Backend Logic | Cloud Functions for Firebase, 2nd gen (asia-south1) |
| File Storage | Firebase Storage / Cloud Storage for Firebase (asia-south1) |
| Scheduling | Cloud Scheduler (asia-south1) |
| Secrets | Secret Manager (global) |
| CI/CD | Cloud Build + Artifact Registry (asia-south1) |
| Logging | Cloud Logging (global) |
| Monitoring | Cloud Monitoring (global) |
| Backup | Cloud Storage for Firestore exports (asia-south1) |

**Not Required**: Cloud Run, Cloud SQL, Pub/Sub, Cloud Tasks, BigQuery, Vertex AI, API Gateway, Load Balancer, VPC, Cloud KMS, Cloud Armor, Memorystore.

---

## 3. Environments

| Field | DEV | PROD |
|---|---|---|
| Firebase Project | arpl-ehs-dev | arpl-ehs-production |
| GCP Project | arpl-ehs-dev | arpl-ehs-production |
| Region | asia-south1 | asia-south1 |
| Separation | Separate project, database, storage, secrets | Separate project, database, storage, secrets |
| Data Isolation | Complete — no shared data | Complete — no shared data |
| Billing Account | Can share billing account | Can share billing account |

---

## 4. Usage Assumptions

| Variable | DEV | PROD | Basis |
|---|---:|---:|---|
| Total Users | 19 | 50 | Dev team + test | 3 sites × ~17 roles |
| MAU | 10 | 40 | Active developers | Active construction staff |
| DAU | 5 | 25 | Core dev team | Daily operational users |
| Permits/day | 10 | 30 | Testing | 10/site × 3 sites |
| Firestore reads/month | 125,000 | 625,000 | Testing | Dashboard + register + listeners |
| Firestore writes/month | 50,000 | 125,000 | Testing | Permits + approvals + notifications |
| Firestore storage | 0.5 GiB | 1-5 GiB | Small test data | Growing over 12 months |
| Firebase Storage | 0.2 GB | 0.5-5 GB | Test images | Growing over 12 months |
| CF invocations/month | 12,500 | 65,000 | API testing | Callable + scheduled + triggers |
| Internet egress/month | 1 GB | 5 GB | Dev traffic | Client mobile data |
| CI/CD builds/month | 60 | 20 | Daily dev builds | Weekly production releases |

---

## 5. Complete BOM — DEV Environment

| BOM ID | Category | Service | Resource | Region | Billing Unit | Qty/Mo | Monthly (INR) | Annual (INR) | Free Tier? |
|---|---|---|---|---|---|---:|---:|---:|---|
| DEV-001 | Identity | Firebase Auth | 10 MAU | global | MAU | 10 | ₹0 | ₹0 | YES |
| DEV-002 | Firebase | Firebase Hosting | Storage + Transfer | global | GB | <1 | ₹0 | ₹0 | YES |
| DEV-004 | Database | Firestore | Reads 125K | asia-south1 | per 100K | 1.25 | ₹0 | ₹0 | YES |
| DEV-005 | Database | Firestore | Writes 50K | asia-south1 | per 100K | 0.5 | ₹0 | ₹0 | YES |
| DEV-007 | Database | Firestore | Storage 0.5 GiB | asia-south1 | GiB | 0.5 | ₹0 | ₹0 | YES |
| DEV-008 | Storage | Firebase Storage | 0.2 GB | asia-south1 | GB | 0.2 | ₹0 | ₹0 | YES |
| DEV-011 | Compute | Cloud Functions | 12.5K invocations | asia-south1 | per M | 0.013 | ₹0 | ₹0 | YES |
| DEV-012 | Compute | Cloud Functions | 5K vCPU-sec | asia-south1 | vCPU-sec | 5K | ₹0 | ₹0 | YES |
| DEV-016 | Security | Secret Manager | 5 versions | global | version | 5 | ₹0 | ₹0 | YES |
| DEV-018 | CI/CD | Cloud Build | 300 minutes | asia-south1 | minutes | 300 | ₹0 | ₹0 | YES |
| DEV-019 | Logging | Cloud Logging | 0.5 GiB | global | GiB | 0.5 | ₹0 | ₹0 | YES |
| DEV-021 | CI/CD | Artifact Registry | 0.5 GB images | asia-south1 | GB | 0.5 | ₹4 | ₹50 | NO |
| | | | | | | **DEV TOTAL** | **₹4** | **₹50** | |

---

## 6. Complete BOM — PROD Environment

| BOM ID | Category | Service | Resource | Region | Billing Unit | Qty/Mo | Monthly (INR) | Annual (INR) | Free Tier? |
|---|---|---|---|---|---|---:|---:|---:|---|
| PRD-001 | Identity | Firebase Auth | 40 MAU | global | MAU | 40 | ₹0 | ₹0 | YES |
| PRD-002 | Firebase | Firebase Hosting | Storage + Transfer | global | GB | <3 | ₹0 | ₹0 | YES |
| PRD-004 | Database | Firestore | Reads 625K | asia-south1 | per 100K | 6.25 | ₹0 | ₹0 | YES |
| PRD-005 | Database | Firestore | Writes 125K | asia-south1 | per 100K | 1.25 | ₹0 | ₹0 | YES |
| PRD-007 | Database | Firestore | Storage 1-5 GiB | asia-south1 | GiB | 1-5 | ₹0-60 | ₹0-720 | PARTIAL |
| PRD-008 | Storage | Firebase Storage | 0.5-5 GB | asia-south1 | GB | 0.5-5 | ₹0 | ₹0 | YES |
| PRD-011 | Compute | Cloud Functions | 65K invocations | asia-south1 | per M | 0.065 | ₹0 | ₹0 | YES |
| PRD-012 | Compute | Cloud Functions | 25K vCPU-sec | asia-south1 | vCPU-sec | 25K | ₹0 | ₹0 | YES |
| PRD-016 | Security | Secret Manager | 8 versions | global | version | 8 | ₹10 | ₹121 | NO |
| PRD-017 | Security | Secret Manager | 50K access ops | global | per 10K | 5 | ₹10 | ₹121 | NO |
| PRD-018 | CI/CD | Cloud Build | 100 minutes | asia-south1 | minutes | 100 | ₹0 | ₹0 | YES |
| PRD-019 | CI/CD | Artifact Registry | 1 GB images | asia-south1 | GB | 1 | ₹8 | ₹101 | NO |
| PRD-020 | Logging | Cloud Logging | 2 GiB | global | GiB | 2 | ₹0 | ₹0 | YES |
| PRD-022 | Backup | Cloud Storage | Firestore exports | asia-south1 | GB | 2 | ₹4 | ₹46 | NO |
| | | | | | | **PROD TOTAL (Mo 1)** | **₹32** | | |
| | | | | | | **PROD TOTAL (Mo 12)** | **₹92** | | |
| | | | | | | **PROD Annual Est.** | | **₹650** | |

---

## 7. Cost Summary

| Cost Line | DEV Monthly | PROD Monthly (Mo 1) | PROD Monthly (Mo 12) | Combined |
|---|---:|---:|---:|---:|
| Firebase (Hosting + Auth) | ₹0 | ₹0 | ₹0 | ₹0 |
| Compute (Cloud Functions) | ₹0 | ₹0 | ₹0 | ₹0 |
| Database (Firestore) | ₹0 | ₹0 | ₹60 | ₹60 |
| Storage (Firebase Storage) | ₹0 | ₹0 | ₹0 | ₹0 |
| Networking | ₹0 | ₹0 | ₹0 | ₹0 |
| Security (Secret Manager) | ₹0 | ₹20 | ₹20 | ₹20 |
| Identity (Firebase Auth) | ₹0 | ₹0 | ₹0 | ₹0 |
| AI/GenAI | ₹0 | ₹0 | ₹0 | ₹0 |
| Logging | ₹0 | ₹0 | ₹0 | ₹0 |
| Monitoring | ₹0 | ₹0 | ₹0 | ₹0 |
| CI/CD | ₹4 | ₹8 | ₹8 | ₹12 |
| Backup/DR | ₹0 | ₹4 | ₹4 | ₹4 |
| **Pre-Tax Monthly Total** | **₹4** | **₹32** | **₹92** | **₹96** |

### Annual Projection

| | DEV | PROD | Combined |
|---|---:|---:|---:|
| **Year 1 Pre-Tax** | ₹50 | ₹650 | ₹700 |
| **GST @ 18%** | ₹9 | ₹117 | ₹126 |
| **Year 1 Post-Tax** | ₹59 | ₹767 | ₹826 |

---

## 8. GST Treatment

| Field | Value |
|---|---|
| Contracting Entity | Google Cloud India Private Limited |
| GST Rate | 18% |
| Applicability | All services |
| ITC Eligible | Yes (for GST-registered businesses) |
| SEZ Exception | 0% GST with documentation |

---

## 9. Questions Requiring Partner Confirmation

| # | Question |
|---:|---|
| 1 | Confirm exact INR rates for Firestore reads/writes/storage in asia-south1 |
| 2 | Confirm exact INR rates for Cloud Functions (2nd gen) vCPU-sec / GiB-sec in asia-south1 |
| 3 | Confirm Cloud Scheduler pricing for asia-south1 (1 job, every-minute schedule) |
| 4 | Confirm partner/reseller discount availability for this workload size |
| 5 | Confirm if committed-use discounts apply to serverless/Firebase services |
| 6 | Recommend and price appropriate Google Cloud support plan |
| 7 | Confirm Firebase Blaze plan free tier quotas are current for asia-south1 |
| 8 | Confirm Artifact Registry per-GB rate in asia-south1 |
| 9 | Confirm internet egress rate from asia-south1 → India users |
| 10 | Provide standard payment terms and billing frequency |

---

## 10. Important Assumptions

1. All usage projections based on **50 users, 30 permits/day, 3 construction sites**
2. No AI/ML/GenAI requirements — all calculations are deterministic formulas
3. No external system integrations (ERP, HR, third-party APIs)
4. No native mobile app — responsive web PWA only
5. No Cloud Run, Cloud SQL, Pub/Sub, or BigQuery required
6. Exchange rate used: ₹84/USD (for reference only; actual billing in INR)
7. Firestore operations are distributed across the day and remain within daily free quotas
8. Firebase Storage growth is linear at ~375 MB/month (site photos)
9. Offline operations sync within the same billing period
10. No phone/SMS authentication — email/password only (no per-SMS charges)

---

## 11. Pricing Sources

| Source | URL | Date Checked |
|---|---|---|
| Firebase Pricing | https://firebase.google.com/pricing | 2026-09-25 |
| Firestore Pricing | https://cloud.google.com/firestore/pricing | 2026-09-25 |
| Cloud Functions Pricing | https://cloud.google.com/functions/pricing | 2026-09-25 |
| Secret Manager Pricing | https://cloud.google.com/secret-manager/pricing | 2026-09-25 |
| Cloud Build Pricing | https://cloud.google.com/build/pricing | 2026-09-25 |
| Cloud Logging Pricing | https://cloud.google.com/logging/pricing | 2026-09-25 |
| Cloud Storage Pricing | https://cloud.google.com/storage/pricing | 2026-09-25 |
| India Tax/Billing | https://cloud.google.com/billing/docs/resources/taxes | 2026-09-25 |
