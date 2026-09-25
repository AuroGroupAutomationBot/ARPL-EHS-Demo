# PROD Environment — Bill of Materials

> **Pricing Checked On**: 2026-09-25
> **Region**: asia-south1 (Mumbai)
> **Currency**: INR (₹) — converted from USD list price at ₹84/USD reference
> **Environment**: Production
> **Firebase Project**: arpl-ehs-production
> **GCP Project**: arpl-ehs-production

---

## Cloud Run Analysis — Is Cloud Run Required?

| Evaluation Criteria | Finding |
|---|---|
| Long-running requests | No — permit operations complete in <5s |
| Complex backend APIs | No — Cloud Functions callable handles all operations |
| Containerized workloads | No — Node.js Cloud Functions sufficient |
| Custom runtime requirements | No — standard Node.js 18 |
| Heavy libraries | Moderate — jsPDF for PDF generation (~2MB) |
| AI orchestration | No — no AI/ML in application |
| External integrations | No — no ERP/HR/third-party APIs |
| CPU-intensive processing | No — all operations are lightweight CRUD/validation |
| Memory requirements | Low — PDF generation peaks at ~128MB |
| Request timeout | No — all operations complete in <30s |
| Concurrency requirements | Low — 15 peak concurrent users |
| Background jobs | Yes — but escalation scheduler handled by Cloud Scheduler + Functions |

**DECISION: Cloud Run is NOT required.** All backend workloads are adequately served by Cloud Functions for Firebase (2nd gen). The escalation scheduler runs as a Cloud Scheduler-triggered Cloud Function. PDF generation (jsPDF) runs within Cloud Function memory/timeout limits.

---

## Service Duplication Check

| Check | Result | Justification |
|---|---|---|
| Cloud Functions + Cloud Run | **Cloud Functions ONLY** | No workload requires containers, long-running requests, or custom runtimes |
| Firestore + Cloud SQL | **Firestore ONLY** | Document model fits permit schema; no complex joins/reporting requiring SQL |
| Firebase Storage + Cloud Storage | **Firebase Storage ONLY** | Firebase Storage wraps GCS; client SDK for direct uploads; security rules for access |
| Firebase Hosting + Cloud CDN | **Firebase Hosting ONLY** | SPA with CDN included; no need for separate CDN |
| Firebase Auth + Identity Platform | **Firebase Auth ONLY** | Email/password + custom claims sufficient; Identity Platform features not needed |
| Cloud Scheduler + Cloud Tasks | **Cloud Scheduler ONLY** | Escalation runs batch scan every 60s; no individual task queuing needed |

---

## Offline-First Architecture Analysis

| Offline Mechanism | Implementation | Service | BOM Impact |
|---|---|---|---|
| Offline data storage | Firestore IndexedDB persistence | Firestore | No additional cost (client-side) |
| Sync strategy | Firestore automatic sync on reconnect | Firestore | Counted as normal reads/writes |
| Pending writes queue | Firestore client SDK queues locally | Firestore | Writes billed when sync completes |
| Conflict resolution | Last-writer-wins + Cloud Function validation | Firestore + Functions | Function invocations on sync |
| Connectivity detection | Navigator.onLine + Firestore snapshot status | Client-side | No cloud cost |
| File uploads while offline | Queued in Firebase Storage offline queue | Firebase Storage | Upload billed when sync completes |
| Authentication offline | Firebase Auth caches credentials locally | Firebase Auth | No additional cost |
| Duplicate prevention | Transaction-based permit ID generation | Firestore Transactions | Normal write cost |

**Key BOM Impact**: Offline-first does NOT add additional services. All offline operations eventually sync through the same Firestore/Functions/Storage pipeline. The usage assumptions already account for sync traffic.

---

## PROD BOM — Month 1 (Initial)

| BOM ID | Category | Service | Resource | Region | SKU / SKU Family | Billing Unit | Qty/Month | Unit Price (USD) | Unit Price (INR) | Monthly Cost (INR) | Annual Cost (INR) | Source | Confidence |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| PRD-001 | 07. Identity | Firebase Auth | Email/Password MAU | global | Firebase Auth MAU | MAU | 40 | $0.00 | ₹0.00 | ₹0 | ₹0 | 50K MAU free | HIGH |
| PRD-002 | 01. Firebase | Firebase Hosting | Storage | global | Hosting Storage | GB | 0.8 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 10 GB free | HIGH |
| PRD-003 | 01. Firebase | Firebase Hosting | Transfer (CDN) | global | Hosting Transfer | GB | 2 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within ~10.8 GB/mo free | HIGH |
| PRD-004 | 03. Database | Firestore | Document Reads | asia-south1 | Firestore Reads | per 100K | 6.25 | $0.00 | ₹0.00 | ₹0 | ₹0 | 625K/mo; within 50K/day free | HIGH |
| PRD-005 | 03. Database | Firestore | Document Writes | asia-south1 | Firestore Writes | per 100K | 1.25 | $0.00 | ₹0.00 | ₹0 | ₹0 | 125K/mo; within 20K/day free | HIGH |
| PRD-006 | 03. Database | Firestore | Document Deletes | asia-south1 | Firestore Deletes | per 100K | 0.025 | $0.00 | ₹0.00 | ₹0 | ₹0 | 2.5K/mo; within 20K/day free | HIGH |
| PRD-007 | 03. Database | Firestore | Storage (Month 1) | asia-south1 | Firestore Storage | GiB | 1 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 1 GiB free (Month 1) | HIGH |
| PRD-007a | 03. Database | Firestore | Storage (Month 12 est.) | asia-south1 | Firestore Storage | GiB | 5 | $0.18/GiB | ₹15.12 | ₹60 | — | 4 GiB beyond free tier | MEDIUM |
| PRD-008 | 04. Storage | Firebase Storage | Stored Data (Month 1) | asia-south1 | Cloud Storage Std | GB | 0.5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 5 GB free | HIGH |
| PRD-008a | 04. Storage | Firebase Storage | Stored Data (Month 12 est.) | asia-south1 | Cloud Storage Std | GB | 5 | $0.00 | ₹0.00 | ₹0 | — | At 5 GB free limit | MEDIUM |
| PRD-009 | 04. Storage | Firebase Storage | Upload Ops (Class A) | asia-south1 | Class A Operations | per 10K | 0.075 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within free quota | HIGH |
| PRD-010 | 04. Storage | Firebase Storage | Download Transfer | asia-south1 | Data Transfer | GB | 2 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within free quota | HIGH |
| PRD-011 | 02. Compute | Cloud Functions | Invocations | asia-south1 | CF Invocations | per million | 0.065 | $0.00 | ₹0.00 | ₹0 | ₹0 | 65K/mo; within 2M free | HIGH |
| PRD-012 | 02. Compute | Cloud Functions | vCPU-seconds | asia-south1 | CF vCPU-second | vCPU-sec | 25,000 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 180K free tier | HIGH |
| PRD-013 | 02. Compute | Cloud Functions | Memory (GiB-sec) | asia-south1 | CF GiB-second | GiB-sec | 25,000 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 360K free tier | HIGH |
| PRD-014 | 02. Compute | Cloud Functions | Networking Egress | asia-south1 | CF Outbound Data | GB | 2 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 5 GB free tier | MEDIUM |
| PRD-015 | 05. Networking | Internet Egress | Client Data Transfer | asia-south1 | Internet Egress | GB | 5 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 10 GiB free tier | HIGH |
| PRD-016 | 06. Security | Secret Manager | Active Versions | global | SM Active Version | version | 8 | $0.06/ver | ₹5.04 | ₹10 | ₹121 | 2 versions beyond 6 free | HIGH |
| PRD-017 | 06. Security | Secret Manager | Access Operations | global | SM Access Op | per 10K | 5 | $0.03/10K | ₹2.52 | ₹10 | ₹121 | 40K ops beyond 10K free | MEDIUM |
| PRD-018 | 12. CI/CD | Cloud Build | Build Minutes | asia-south1 | Cloud Build e2-std-2 | minutes | 100 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 2,500 free min | HIGH |
| PRD-019 | 12. CI/CD | Artifact Registry | Container Images | asia-south1 | AR Storage | GB | 1 | $0.10/GB | ₹8.40 | ₹8 | ₹101 | GCR/AR storage | MEDIUM |
| PRD-020 | 10. Logging | Cloud Logging | Log Ingestion | global | Logging Ingestion | GiB | 2 | $0.00 | ₹0.00 | ₹0 | ₹0 | Within 50 GiB free | HIGH |
| PRD-021 | 11. Monitoring | Cloud Monitoring | Metrics & Alerts | global | Cloud Monitoring | — | — | $0.00 | ₹0.00 | ₹0 | ₹0 | Basic monitoring free | HIGH |
| PRD-022 | 13. Backup/DR | Cloud Storage | Firestore Exports | asia-south1 | Cloud Storage Std | GB | 2 | $0.023/GB | ₹1.93 | ₹4 | ₹46 | 4 weekly backups × 0.5 GiB | MEDIUM |
| PRD-023 | 08. Messaging | FCM | Push Notifications | global | FCM | messages | 0 | $0.00 | ₹0.00 | ₹0 | ₹0 | Not used; in-app notif via Firestore | HIGH |

---

## PROD BOM Summary — Month 1

| Category | Monthly Cost (INR) | Annual Cost (INR) |
|---|---:|---:|
| 01. Firebase (Hosting) | ₹0 | ₹0 |
| 02. Compute (Cloud Functions) | ₹0 | ₹0 |
| 03. Database (Firestore) | ₹0 | ₹0 |
| 04. Storage (Firebase Storage) | ₹0 | ₹0 |
| 05. Networking | ₹0 | ₹0 |
| 06. Security (Secret Manager) | ₹20 | ₹242 |
| 07. Identity (Firebase Auth) | ₹0 | ₹0 |
| 08. Messaging | ₹0 | ₹0 |
| 09. AI/GenAI | ₹0 (not used) | ₹0 |
| 10. Logging | ₹0 | ₹0 |
| 11. Monitoring | ₹0 | ₹0 |
| 12. CI/CD | ₹8 | ₹101 |
| 13. Backup/DR | ₹4 | ₹46 |
| 14. Integration | ₹0 (no external) | ₹0 |
| **TOTAL (Pre-Tax)** | **₹32** | **₹389** |
| GST @ 18% | ₹6 | ₹70 |
| **TOTAL (Post-Tax)** | **₹38** | **₹459** |

---

## PROD BOM — Month 12 (Projected Growth)

As data accumulates, Firestore and Firebase Storage begin exceeding free tiers:

| Category | Month 1 | Month 6 | Month 12 |
|---|---:|---:|---:|
| Firestore Storage (beyond 1 GiB free) | ₹0 | ₹27 | ₹60 |
| Firebase Storage (beyond 5 GB free) | ₹0 | ₹0 | ₹0 |
| Secret Manager | ₹20 | ₹20 | ₹20 |
| CI/CD (Artifact Registry) | ₹8 | ₹8 | ₹8 |
| Backup Storage | ₹4 | ₹4 | ₹4 |
| **Monthly Pre-Tax Total** | **₹32** | **₹59** | **₹92** |
| **Monthly Post-Tax Total** | **₹38** | **₹70** | **₹109** |

### Year 1 Annual Estimate (Blended)
- **Month 1-3**: ~₹32/month (within free tiers)
- **Month 4-9**: ~₹50/month (Firestore storage growing)
- **Month 10-12**: ~₹92/month (Firestore + approaching Firebase Storage limits)
- **Year 1 Pre-Tax Total**: ~₹650
- **Year 1 Post-Tax Total (incl. 18% GST)**: ~₹767

---

## No-Cost / Free Quota Items (PROD)

| BOM ID | Service | Resource | Cost Status | Reason |
|---|---|---|---|---|
| PRD-001 | Firebase Auth | 40 MAU | No-cost | Within 50K MAU free tier |
| PRD-002/003 | Firebase Hosting | All usage | No-cost | Within free tier for SPA |
| PRD-004/005/006 | Firestore | All operations | No-cost | 25K reads/day within 50K free; 5K writes/day within 20K free |
| PRD-007 | Firestore | 1 GiB storage | No-cost | First 1 GiB free (exceeded by ~month 3) |
| PRD-008/009/010 | Firebase Storage | All operations | No-cost | Within 5 GB free storage |
| PRD-011/012/013 | Cloud Functions | All compute | No-cost | 65K invocations within 2M free; compute within free tier |
| PRD-015 | Internet Egress | 5 GB | No-cost | Within 10 GiB free tier |
| PRD-018 | Cloud Build | 100 minutes | No-cost | Within 2,500 free minutes |
| PRD-020 | Cloud Logging | 2 GiB | No-cost | Within 50 GiB free tier |
| PRD-023 | FCM | Not used | No-cost | In-app notifications via Firestore; no push notifications |

---

## Services NOT Included (with Justification)

| Service | Why NOT Included |
|---|---|
| Cloud Run | No workload requires containers or long-running requests |
| Cloud SQL | No relational data requirements; Firestore handles all data |
| Pub/Sub | No async messaging needed; Firestore triggers + scheduled functions sufficient |
| Cloud Tasks | No individual task queueing needed; batch escalation via scheduler |
| BigQuery | No analytics/reporting pipeline required |
| Vertex AI / Gemini | No AI/ML requirements; all calculations are deterministic formulas |
| API Gateway | No external API exposure needed |
| Load Balancer | Firebase Hosting CDN handles load distribution |
| Memorystore | No caching layer needed at this scale |
| VPC / Serverless VPC Access | No VPC-internal resources; all services are serverless |
| Cloud KMS | Secret Manager sufficient; no encryption key management needed |
| Cloud Armor | No WAF needed; Firebase Security Rules + App Check sufficient |
| Security Command Center | Enterprise security scanning not required for this scale |
| Firebase Extensions | No extensions used |
| Firebase Crashlytics | Can be added at no cost but not in scope |
| Firebase Remote Config | Not required |
| Firebase Performance Monitoring | Optional; can be added at no cost |
| Cloud NAT | No VPC resources requiring NAT |
| Cloud CDN | Firebase Hosting CDN included |
| Eventarc | Cloud Functions Firestore triggers used instead |
| Workflows | No multi-step orchestration beyond approval chains (handled in code) |
