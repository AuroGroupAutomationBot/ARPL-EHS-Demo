# Executive Cost Summary — ARPL EHS PTW System

> **Date**: 2026-09-25

---

## 1. Architecture Summary

The system uses a **Firebase-First Serverless Architecture** designed for offline-first capabilities at construction sites.
- **Frontend**: Firebase Hosting
- **Identity**: Firebase Auth (Email/Password)
- **Database**: Cloud Firestore (NoSQL, offline persistence enabled)
- **Storage**: Firebase Storage (Photos/Signatures)
- **Backend Logic**: Cloud Functions for Firebase (2nd gen)
- **CI/CD & Operations**: Cloud Build, Secret Manager, Cloud Logging

This architecture intentionally avoids heavy infrastructure (Cloud Run, Cloud SQL, VPCs) because the application is a responsive web SPA where business logic operates via Cloud Functions and client-side offline rendering.

---

## 2. DEV BOM Summary

| Environment | Monthly Cost (INR) | Annual Cost (INR) |
|---|---:|---:|
| DEV | ₹4 | ₹50 |

The DEV environment operates almost entirely within the Google Cloud / Firebase Free Tier quotas. The only projected cost is a nominal charge for Artifact Registry storage (~₹4/month).

---

## 3. PROD BOM Summary

| Environment | Monthly Cost (Month 1) | Monthly Cost (Month 12) | Annual Cost |
|---|---:|---:|---:|
| PROD | ₹32 | ₹92 | ₹650 |

The PROD environment operates mostly within the Free Tier for the first 3 months. As data (Firestore documents and Firebase Storage images) accumulates, modest storage costs begin to accrue, stabilizing around ₹92/month by month 12.

---

## 4. Combined Cost (DEV + PROD)

| Cost Category | Monthly (Initial) | Monthly (Month 12) | Annual Projection |
|---|---:|---:|---:|
| DEV | ₹4 | ₹4 | ₹50 |
| PROD | ₹32 | ₹92 | ₹650 |
| **Combined Pre-Tax Total** | **₹36** | **₹96** | **₹700** |
| GST @ 18% | ₹6 | ₹17 | ₹126 |
| **Combined Post-Tax Total** | **₹42** | **₹113** | **₹826** |

---

## 5. Firebase Cost Breakdown

| Component | Cost Profile |
|---|---|
| Firebase Auth | Free (<50K MAU) |
| Firebase Hosting | Free (<10GB storage, <360MB/day transfer) |
| Firestore Operations | Free (<50K reads/day, <20K writes/day) |
| Firestore Storage | ₹0 initially, grows to ~₹60/month by Month 12 |
| Firebase Storage | Free initially (<5GB), begins billing ~Month 10 |
| Cloud Functions | Free (<2M invocations/month) |
| **Firebase Subtotal** | **₹0 to ₹60/month** |

---

## 6. GCP Cost Breakdown

| Component | Cost Profile |
|---|---|
| Secret Manager | ~₹20/month (2 active versions + 40K ops beyond free tier) |
| Artifact Registry | ~₹12/month (DEV + PROD image storage) |
| Cloud Storage (Backups) | ~₹4/month (Firestore exports) |
| Cloud Logging | Free (<50 GiB/month) |
| Cloud Build | Free (<2,500 minutes/month) |
| Internet Egress | Free (<10 GiB/month) |
| **GCP Subtotal** | **₹36/month** |

---

## 7. Major Cost Drivers

1. **Firestore Document Storage (GiB)**: Scales linearly with accumulated permit data.
2. **Firebase Storage Volume (GB)**: Scales with accumulated site photos and signatures.
3. **Secret Manager Access Operations**: Scales with Cloud Function invocations.
4. **Artifact Registry Storage**: Scales with CI/CD build frequency.

*Note: The most sensitive operational vectors—Firestore Reads/Writes and Cloud Function Invocations—have high free tier ceilings that the baseline usage (50 users, 30 permits/day) will not exceed.*

---

## 8. Free / No-Cost Components

- **Firebase Auth**: 100% free for this workload size (Email/Password only).
- **Firebase Hosting**: 100% free for this SPA size.
- **Firestore Operations**: 100% free (reads/writes/deletes within daily quotas).
- **Cloud Functions Compute**: 100% free (invocations, vCPU, memory within monthly quotas).
- **Cloud Build**: 100% free (build minutes within monthly quota).
- **Cloud Logging**: 100% free (ingestion within monthly quota).
- **Internet Egress**: 100% free (transfer within monthly quota).
- **FCM (Push Notifications)**: Not used; no cost.
- **AI / GenAI**: Not used; no cost.

---

## 9. Billing Partner Inputs Required

1. **Exact SKU Validation**: Confirm SKUs for asia-south1 (Mumbai) in INR.
2. **Regional Pricing**: Confirm any premium rates for asia-south1 vs. US standard rates.
3. **GSTIN & Contracting**: Verify Google Cloud India Private Limited contracting and 18% GST / ITC applicability.
4. **Commercial Terms**: Provide Partner Discount, Markup (if any), and Support Plan pricing.

---

## 10. Pricing Confidence

| Area | Confidence Level | Note |
|---|---|---|
| Workload Assumptions | HIGH | Based on detailed requirement specification |
| Architecture Suitability | HIGH | Firebase-first offline design validated |
| Free Tier Eligibility | HIGH | Documented limits cross-referenced with workload |
| USD List Prices | HIGH | Sourced directly from official Google Cloud pages |
| **INR Exchange Rate** | **MEDIUM** | Used ₹84/USD; requires actual partner INR quote |
| **Regional Multipliers** | **MEDIUM** | asia-south1 may have slight deviations from global baseline |
| **Commercial Quote** | **PARTNER REQ'D** | Partner must supply final discount/markup |

---

## 11. Important Assumptions

- 50 registered users across 3 active project sites.
- 30 permits created per day system-wide.
- Offline sync operations occur within normal data traffic patterns.
- No AI, ML, ERP, or heavy external integrations.
- All testing and development activities respect emulator boundaries to minimize cloud costs.
- Billing is in INR via Google Cloud India Private Limited.

---

## 12. Final Procurement Table (Pre-Tax Baseline)

| Environment | Category | Service | Resource | Region | SKU | Unit | Monthly Qty | INR Rate | Monthly INR | Annual INR |
|---|---|---|---|---|---|---|---:|---:|---:|---:|
| DEV | CI/CD | Artifact Registry | Container Images | asia-south1 | TBC | GB | 0.5 | ₹8.40 | ₹4 | ₹50 |
| PROD | Security | Secret Manager | Active Versions | global | TBC | version | 2 | ₹5.04 | ₹10 | ₹121 |
| PROD | Security | Secret Manager | Access Ops | global | TBC | 10K | 4 | ₹2.52 | ₹10 | ₹121 |
| PROD | CI/CD | Artifact Registry | Container Images | asia-south1 | TBC | GB | 1.0 | ₹8.40 | ₹8 | ₹101 |
| PROD | Backup | Cloud Storage | Firestore Exports | asia-south1 | TBC | GB | 2.0 | ₹1.93 | ₹4 | ₹46 |
| PROD (M12) | Database | Firestore | Storage | asia-south1 | TBC | GiB | 4.0 | ₹15.12 | ₹60 | ₹720 |
