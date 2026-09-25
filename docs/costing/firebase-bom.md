# Firebase Bill of Materials & Service Breakdown — ARPL EHS Platform

> **Document ID**: ARPL-BOM-FIREBASE-2026-09-25  
> **Status**: AUDITED & VERIFIED  
> **Target Region**: Primary: `asia-south1` (Mumbai) | Global Edge CDN  
> **Pricing Verification**: 2026-09-25 | Live FX Rate: **1 USD = ₹95.90 INR**  
> **Billing Plan**: Firebase Blaze Plan (Pay-as-you-go)  

---

## 1. Firebase Service Evaluation & Technical Necessity

In strict accordance with Phase 20 requirements, every candidate Firebase service is independently evaluated for necessity, underlying GCP mapping, and billable impact.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FIREBASE SERVICES PORTFOLIO                               │
│                                                                                        │
│  [REQUIRED]     • Firebase Authentication    • Cloud Firestore     • Firebase Storage  │
│                 • Firebase Hosting           • Firebase App Check                      │
│                                                                                        │
│  [PARTIAL/EVENT]• Cloud Functions for Firebase (2nd Gen - Firestore Triggers Only)     │
│                                                                                        │
│  [NOT REQUIRED] • Firebase Realtime DB       • Firebase Extensions • Remote Config     │
│                 • Crashlytics                • Performance Monitor • Firebase ML       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Itemized Firebase Services Breakdown

### 2.1 Firebase Authentication
- **Required**: **YES**
- **Why**: Handles secure user identity management, closed-registration authentication, password resets, and cryptographically signs JWT ID tokens containing Custom Claims (`role`, `projectIds[]`).
- **Monthly Usage**: 360 registered users, 360 Monthly Active Users (MAU).
- **Free Quota**: 50,000 MAU per month for Email/Password accounts.
- **Billable Usage**: **0 MAU**.
- **Billing Mechanism**: Per active authenticated user beyond free tier ($0.0055/MAU).
- **Underlying Google Cloud Service**: Google Cloud Identity Platform.
- **Monthly Cost (INR)**: **₹0.00**

---

### 2.2 Cloud Firestore (Native Mode, `asia-south1`)
- **Required**: **YES**
- **Why**: Primary operational database. Provides client-side offline persistence (`IndexedDB`), real-time synchronization (`onSnapshot`), document polymorphism for 10 distinct permit types, and atomic multi-document transactions.
- **Monthly Usage (Baseline: 9,000 permits/mo)**:
  - Document Reads: 1,241,640 reads/month (~41,388 reads/day average).
  - Document Writes: 204,000 writes/month (~6,800 writes/day average).
  - Document Deletes: 5,000 deletes/month.
  - Storage: 0.1 GiB (Month 1) $\rightarrow$ 0.65 GiB (Month 12).
- **Free Quotas**: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, 1.0 GiB stored data.
- **Billable Usage**:
  - Reads: ~44,000 reads/month (peak weekday overages above 50,000/day).
  - Writes: 0 writes (100% within free quota).
  - Storage: 0 GiB (100% within 1.0 GiB free quota).
- **Billing Mechanism**: Billed per operation unit (Reads: $0.036/100k; Writes: $0.108/100k).
- **Underlying Google Cloud Service**: Google Cloud Firestore.
- **Monthly Cost (INR)**: **₹1.52 / month**

---

### 2.3 Firebase Storage (Cloud Storage for Firebase, `asia-south1`)
- **Required**: **YES**
- **Why**: Enables direct, authenticated client-side uploads of on-site inspection photos and high-DPI canvas digital signatures directly to Google Cloud Storage with declarative security rules.
- **Monthly Usage (Baseline: 9,000 permits/mo)**:
  - Ingestion: 6.24 GB new data / month.
  - Cumulative Stored: 6.24 GB (Month 1) $\rightarrow$ 74.88 GB (Month 12).
  - Class A Upload Ops: 54,000 ops / month.
  - Class B Read Ops: 30,000 ops / month.
- **Free Quotas**: 5.0 GB storage, 50,000 Class A ops/month, 50,000 Class B ops/month.
- **Billable Usage**:
  - Storage Month 1: 1.24 GB billable (6.24 - 5.0).
  - Storage Month 12: 69.88 GB billable (74.88 - 5.0).
  - Class A Ops: 4,000 ops billable (54,000 - 50,000).
- **Billing Mechanism**: Billed per GB stored ($0.026/GB/mo) and per 10k Class A operations ($0.05/10k).
- **Underlying Google Cloud Service**: Google Cloud Storage Standard Class (`asia-south1`).
- **Monthly Cost (INR)**:
  - Month 1: ₹3.09 (Storage) + ₹1.92 (Class A) = **₹5.01 / month**
  - Month 12: ₹174.00 (Storage) + ₹1.92 (Class A) = **₹175.92 / month**

---

### 2.4 Firebase Hosting
- **Required**: **YES**
- **Why**: Serves the zero-build Single Page Application (SPA), CSS stylesheets, and client-side JavaScript assets globally with sub-second latency, automated SSL certificate issuance, and HTTP/2 compression.
- **Monthly Usage**: 0.5 GB asset storage, ~2.5 GB transfer / month.
- **Free Quotas**: 10.0 GB storage, 360 MB / day transfer (~10.8 GB / month).
- **Billable Usage**: **0 GB**.
- **Billing Mechanism**: Billed per GB transfer beyond free quota ($0.15/GB).
- **Underlying Google Cloud Service**: Google Cloud CDN and Edge Infrastructure.
- **Monthly Cost (INR)**: **₹0.00**

---

### 2.5 Firebase App Check
- **Required**: **YES**
- **Why**: Protects backend APIs and Firestore from API scraping, replay attacks, and unauthorized bots using device attestation (reCAPTCHA Enterprise / Play Integrity).
- **Monthly Usage**: ~95,000 verifications / month.
- **Free Quotas**: 10,000 verifications/day free (reCAPTCHA Enterprise).
- **Billable Usage**: **0 verifications**.
- **Billing Mechanism**: Billed per 1,000 verifications beyond free quota ($1.00/10k).
- **Underlying Google Cloud Service**: Google Cloud reCAPTCHA Enterprise.
- **Monthly Cost (INR)**: **₹0.00**

---

### 2.6 Cloud Functions for Firebase (2nd Gen)
- **Required**: **PARTIAL**
- **Why**: Strictly restricted to reactive Firestore triggers (`onDocumentWritten`) for notification dispatch and indexing. All HTTP API endpoints, PDF compilation, and SLA schedulers are assigned to **Google Cloud Run** (see [ADR-002](file:///c:/Users/MohithSai.G/Downloads/ARPL-EHS-Demo/docs/architecture/adr/ADR-002-cloud-run-core-backend.md)).
- **Monthly Usage**: ~189,000 trigger invocations / month, ~7,087 active vCPU-seconds.
- **Free Quotas**: 2,000,000 invocations, 180,000 vCPU-seconds, 360,000 GiB-seconds per month.
- **Billable Usage**: **0 units**.
- **Billing Mechanism**: Billed per million invocations ($0.40/M) and CPU/memory runtime.
- **Underlying Google Cloud Service**: Google Cloud Run Functions.
- **Monthly Cost (INR)**: **₹0.00**

---

### 2.7 Firebase Services Evaluated & NOT Required

| Service | Why Evaluated | Technical Justification for Rejection | Billable Cost |
|---|---|---|---|
| **Firebase Realtime Database** | Legacy NoSQL store | Firestore is modern, structured, and supports subcollections and complex queries. | ₹0.00 |
| **Firebase Crashlytics** | Mobile app crash reporter | The application is a web-based responsive Single Page Application (PWA); standard browser telemetry and Cloud Logging are utilized instead. | ₹0.00 |
| **Firebase Remote Config** | Dynamic A/B testing & feature flags | Workflows and form schemas are statically governed by `APP_CONFIG` and stored in Firestore. | ₹0.00 |
| **Firebase Performance Monitoring** | Network trace analysis | Standard Cloud Monitoring and browser Performance API provide sufficient observability. | ₹0.00 |
| **Firebase Cloud Messaging (FCM)** | Mobile push notification delivery | All notifications in the ARPL EHS application are role-targeted in-app notifications delivered live via Firestore `onSnapshot`. SMS/Push gateways are not in current scope. | ₹0.00 |
| **Firebase Extensions** | Pre-packaged backend integrations | Custom logic is cleanly implemented in Cloud Run and Cloud Functions; no paid third-party extensions required. | ₹0.00 |

---

## 3. Firebase Bill of Materials Summary (Baseline PROD)

| BOM ID | Firebase Service | Meter / Resource | Free Allowance | Monthly Usage | Billable Qty | INR Rate | Month 1 INR | Month 12 INR |
|---|---|---|---|---|---|---|---:|---:|
| FB-001 | Firebase Auth | Email/Password MAU | 50,000 MAU | 360 MAU | 0 | ₹0.00 | ₹0.00 | ₹0.00 |
| FB-002 | Cloud Firestore | Document Reads | 50,000 / day | 1,241,640 / mo | 44,000 | ₹3.45 / 100k | ₹1.52 | ₹1.52 |
| FB-003 | Cloud Firestore | Document Writes | 20,000 / day | 204,000 / mo | 0 | ₹10.36 / 100k | ₹0.00 | ₹0.00 |
| FB-004 | Cloud Firestore | Database Storage | 1.0 GiB | 0.65 GiB (M12) | 0 | ₹19.85 / GiB | ₹0.00 | ₹0.00 |
| FB-005 | Firebase Storage | GCS Standard Storage | 5.0 GB | 6.24 GB (M1) $\rightarrow$ 74.88 GB (M12) | 1.24 GB (M1) $\rightarrow$ 69.88 GB (M12) | ₹2.49 / GB | ₹3.09 | ₹174.00 |
| FB-006 | Firebase Storage | Class A Upload Ops | 50,000 / mo | 54,000 / mo | 4,000 | ₹4.80 / 10k | ₹1.92 | ₹1.92 |
| FB-007 | Firebase Hosting | Storage & CDN Transfer | 10 GB / 10.8 GB | 0.5 GB / 2.5 GB | 0 | ₹0.00 | ₹0.00 | ₹0.00 |
| FB-008 | Firebase App Check | Device Attestation | 10,000 / day | 95,000 / mo | 0 | ₹0.00 | ₹0.00 | ₹0.00 |
| FB-009 | Cloud Functions | Firestore Triggers | 2M / 180k vCPU-s | 189k / 7k vCPU-s | 0 | ₹0.00 | ₹0.00 | ₹0.00 |
| **TOTAL** | **Firebase Services** | **Pre-Tax Subtotal** | — | — | — | — | **₹6.53** | **₹177.44** |

---

> **Firebase BOM Sign-off**: Every Firebase line item is mapped to its underlying GCP infrastructure meter. The Firebase layer operates with extreme financial efficiency, incurring only **₹6.53 in Month 1** and **₹177.44 in Month 12** for the entire enterprise.
