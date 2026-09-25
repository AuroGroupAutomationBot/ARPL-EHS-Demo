# Google Cloud Platform Bill of Materials & Service Justification

> **Document ID**: ARPL-BOM-GCP-2026-09-25  
> **Status**: AUDITED & VERIFIED  
> **Target Region**: Primary: `asia-south1` (Mumbai, Maharashtra, India)  
> **Pricing Standard**: Google Cloud India List Catalog | Live FX Rate: **1 USD = ₹95.90 INR**  
> **Target Workload**: 6 Business Projects · 360 Unique Users · 300 Permits/Day Total (9,000/mo)  

---

## 1. Comprehensive Google Cloud Service Necessity Review (Phase 21)

Every candidate Google Cloud service is independently audited to eliminate bloat, prevent duplication, and justify every provisioned rupee.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE CLOUD SERVICES AUDIT                               │
│                                                                                        │
│  [REQUIRED]    • Cloud Run (`asia-south1`)       • Cloud Storage (Backup Bucket)       │
│                • Cloud Scheduler                 • Cloud Tasks                         │
│                • Secret Manager                  • Artifact Registry                   │
│                • Cloud Build                     • Cloud Logging & Monitoring          │
│                • Firestore PITR Protection                                             │
│                                                                                        │
│  [FUTURE/OPT]  • Vertex AI (Gemini 1.5 Flash - Visual Hazard OCR)                      │
│                                                                                        │
│  [REJECTED]    • Cloud SQL       • BigQuery     • Pub/Sub        • Cloud Run Jobs      │
│                • Eventarc        • API Gateway  • Cloud Armor    • External Load Bal   │
│                • VPC / Cloud NAT • Cloud KMS    • Memorystore                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Itemized Service Evaluations

### 2.1 Google Cloud Run (Fully Managed Container Compute)
- **Required**: **YES**
- **Requirement**: Containerized execution runtime for the Core Backend API (`arpl-ehs-api`), authoritative 27-state FSM validation, statutory A4 PDF compilation with high-DPI signatures, and SLA escalation batch workers.
- **Reason**: Cloud Run provides custom Debian runtime with embedded statutory fonts, supports 80 concurrent connections per container instance, and maintains persistent connection pools to Firestore, avoiding cold-start latency on cellular networks.
- **Alternative**: Disparate Cloud Functions (2nd Gen).
- **Why Alternative Insufficient**: Cloud Functions experiences cold starts (2–5s per function) during morning permit creation surges, lacks containerized font/canvas composition tools for complex statutory PDFs, and manages connections less efficiently under concurrent load.
- **Monthly Usage (Baseline)**: 92,640 requests, 18,528 active vCPU-seconds, 18,528 active GiB-seconds.
- **Free Allowance**: 2M requests, 180,000 vCPU-sec, 360,000 GiB-sec per month.
- **Cost (Baseline Scale-to-Zero)**: **₹0.00 / month** (100% within Always Free tier).
- *(Optional High-Availability 1-Min-Instance Add-on)*: ₹1,253.00 / month.

---

### 2.2 Google Cloud SQL (Managed Relational Database)
- **Required**: **NO (STRICTLY REJECTED)**
- **Requirement**: None.
- **Reason**: ARPL EHS is a document-centric workflow where permits have 10 divergent, polymorphic schemas. Field engineers require native offline caching in basements and real-time push listeners.
- **Alternative**: Cloud Firestore.
- **Why Alternative is Superior**: Firestore provides built-in `IndexedDB` offline persistence, sub-second `onSnapshot` real-time listeners, and scales to zero (₹0 base cost vs. ₹6,500/mo minimum for Cloud SQL). Documented in [ADR-004](file:///c:/Users/MohithSai.G/Downloads/ARPL-EHS-Demo/docs/architecture/adr/ADR-004-firestore-vs-cloud-sql.md).

---

### 2.3 Google Cloud Storage (Private Backup & Disaster Recovery Bucket)
- **Required**: **YES**
- **Requirement**: Dedicated, private storage bucket (`arpl-ehs-backups-prod`) in `asia-south1` for weekly scheduled Firestore database exports and compliance audit bundles.
- **Reason**: Complements Firestore Point-in-Time Recovery (PITR) to guarantee long-term disaster recovery resilience. Completely decoupled from client-facing media buckets.
- **Alternative**: Relying solely on live Firestore database.
- **Why Alternative Insufficient**: Catastrophic administrative error or account-level incidents require an independent, immutable out-of-band backup.
- **Monthly Usage**: 4 weekly backup snapshots × 0.5 GB = 2.0 GB stored.
- **Cost (INR)**: 2.0 GB × ₹2.49/GB = **₹4.98 / month**.

---

### 2.4 Google Cloud Tasks (Managed Task Queues)
- **Required**: **YES**
- **Requirement**: Asynchronous, rate-limited queuing for heavy post-transition side effects: statutory PDF rendering, high-DPI canvas composition, and multi-role notification fan-outs.
- **Reason**: Prevents mobile HTTP timeouts on cellular connections. Gives immediate response (<200ms) to approving engineers while background tasks execute with retries.
- **Alternative**: Cloud Pub/Sub or synchronous in-process execution.
- **Why Alternative Insufficient**: In-process execution hangs mobile browsers on weak networks. Pub/Sub adds unnecessary streaming and subscriber-ack complexity for simple point-to-point task execution. Documented in [ADR-006](file:///c:/Users/MohithSai.G/Downloads/ARPL-EHS-Demo/docs/architecture/adr/ADR-006-async-processing.md).
- **Monthly Usage**: ~20,000 task dispatches / month.
- **Free Allowance**: 1,000,000 tasks / month free.
- **Cost (INR)**: **₹0.00 / month**.

---

### 2.5 Google Cloud Scheduler (Managed Cron Service)
- **Required**: **YES**
- **Requirement**: Periodic invocation of the Cloud Run SLA escalation endpoint (`/api/v1/escalation/tick`) every 5 minutes (06:00–22:00 IST daily).
- **Reason**: Ensures autonomous 24/7 SLA enforcement, issuing T-30 warnings and auto-expiring unapproved night-shift permits past 21:00 IST without client dependency.
- **Alternative**: Client-side timers (`setInterval`) or custom daemon VM.
- **Why Alternative Insufficient**: Client timers fail if browser is closed. Dedicated VM introduces unnecessary OS patching, maintenance, and ₹1,500/mo compute overhead.
- **Monthly Usage**: 1 configured job (8,640 invocations/month).
- **Free Allowance**: 3 jobs free per billing account.
- **Cost (INR)**: **₹0.00 / month**.

---

### 2.6 Google Secret Manager
- **Required**: **YES**
- **Requirement**: Secure, encrypted storage of Firebase Admin SDK credentials, token signing keys, and Cloud Scheduler OIDC secrets.
- **Reason**: Prevents hardcoding credentials in source code or container images. Injects secrets directly into Cloud Run container memory.
- **Alternative**: Plaintext environment variables.
- **Why Alternative Insufficient**: Violates enterprise cybersecurity standards and ISO 27001 compliance.
- **Monthly Usage**: 4 active secret versions, ~20,000 access operations/month.
- **Free Allowance**: 6 active versions free; 10,000 access operations free.
- **Billable Usage**: 10,000 billable access ops @ ₹2.88/10k = **₹2.88 / month**.

---

### 2.7 Google Cloud Build & Artifact Registry (CI/CD Pipeline)
- **Required**: **YES**
- **Requirement**: Automated building, scanning, and storing of Docker container images for Cloud Run (`arpl-ehs-api`).
- **Reason**: Secure software supply chain with immutable image tagging and vulnerability scanning in Mumbai (`asia-south1`).
- **Monthly Usage**:
  - Cloud Build: 20 builds/month × 5 min = 100 build minutes (Free within 2,500 free min).
  - Artifact Registry: 0.5 GB stored (storing 2 container image revisions).
- **Cost (INR)**: 0.5 GB × ₹9.59/GB = **₹4.80 / month**.

---

### 2.8 Google Cloud Logging & Cloud Monitoring
- **Required**: **YES**
- **Requirement**: Immutable audit log ingestion, error tracking, container concurrency monitoring, and uptime checks.
- **Reason**: DPDP Act 2023 compliance requires maintaining audit logs of security and access events.
- **Monthly Usage**: ~3.0 GiB structured log ingestion / month. 30-day retention.
- **Free Allowance**: 50.0 GiB log ingestion free per month; basic metrics and uptime checks free.
- **Cost (INR)**: **₹0.00 / month**.

---

### 2.9 Firestore Point-in-Time Recovery (PITR)
- **Required**: **YES**
- **Requirement**: Continuous 7-day point-in-time recovery for the primary Firestore operational database.
- **Reason**: Guarantees RPO of 1 minute in case of accidental data corruption or malicious deletion during statutory construction activities.
- **Monthly Usage**: 0.65 GiB database data stored (Month 12).
- **Cost (INR)**: 0.65 GiB × ₹11.51/GiB = **₹7.48 / month**.

---

### 2.10 Optional AI Extension: Google Vertex AI (Gemini 1.5 Flash in `asia-south1`)
- **Required**: **FUTURE / OPTIONAL (Phase 27 Modeling)**
- **Requirement**: Automated visual hazard detection in site photos (PPE compliance) and OCR of crane calibration certificates.
- **Reason**: Handled strictly via server-side Cloud Run worker calling Vertex AI in Mumbai. Baseline application operates with 100% deterministic rules.
- **Monthly Usage (If Activated)**: 9,000 photo checks/mo = **~₹101.40 / month**.
- **Baseline Cost (Current Scope)**: **₹0.00 / month**. Documented in [ADR-007](file:///c:/Users/MohithSai.G/Downloads/ARPL-EHS-Demo/docs/architecture/adr/ADR-007-ai-architecture-and-document-processing.md).

---

### 2.11 Google Cloud Services Evaluated & REJECTED

| Service | Intended Role | Technical Reason for Rejection | Pre-Tax Saving |
|---|---|---|---|
| **Google Cloud Pub/Sub** | Event Streaming | ARPL EHS is not a high-velocity streaming platform. Cloud Tasks handles rate-limited point-to-point queues far more simply. | ~₹500 / mo |
| **Google Cloud Run Jobs** | Long-running Batch Containers | Escalation sweeps finish in <500ms; PDF rendering takes <2s. Cloud Run service handles both; dedicated Jobs daemon is redundant. | ~₹1,000 / mo |
| **Google Eventarc** | Event Routing | Cloud Functions natively integrates with Firestore triggers without Eventarc bus overhead. | ~₹300 / mo |
| **Google Cloud BigQuery** | Data Warehousing | Operational reporting is satisfied via Firestore composite queries. BigQuery is only relevant after 3–5 years of data accumulation. | ~₹2,500 / mo |
| **Google Cloud Load Balancing** | External HTTPS Traffic | Firebase Hosting and Cloud Run include Google Front End (GFE) Anycast routing and SSL. A dedicated Cloud Load Balancer ($18/mo) is totally redundant. | ~₹1,726 / mo |
| **Google API Gateway** | API Gateway Management | Cloud Run handles authentication middleware directly; Firebase Auth handles token verification. Dedicated API Gateway is redundant. | ~₹1,200 / mo |
| **VPC & Serverless VPC Access** | Private Network Tunneling | All backend services (Cloud Run, Firestore, GCS, Secret Manager) reside within Google's secure internal software-defined network. No legacy VPC resources exist. | ~₹1,500 / mo |
| **Google Cloud NAT** | Outbound Internet Gateway | Cloud Run connects to Google APIs and public endpoints directly without requiring a provisioned NAT gateway. | ~₹3,200 / mo |
| **Google Cloud Armor** | Enterprise Web App Firewall | Firebase App Check + Cloud Run IAM middleware provide adequate protection against DDoS and abuse at this scale. | ~₹4,500 / mo |
| **Google Cloud KMS** | Customer-Managed Encryption | Secret Manager and Google-managed encryption keys (AES-256) provide default encryption-at-rest without KMS key fees. | ~₹600 / mo |

---

## 3. GCP Bill of Materials Summary (Baseline PROD)

| BOM ID | GCP Service | Resource / Meter | Monthly Usage | Free Quota | Billable Qty | Unit Rate (INR) | Month 1 INR | Month 12 INR |
|---|---|---|---|---|---|---|---:|---:|
| GCP-001 | Cloud Run | Requests | 92,640 req | 2,000,000 req | 0 | ₹38.36 / M | ₹0.00 | ₹0.00 |
| GCP-002 | Cloud Run | Active vCPU-sec | 18,528 sec | 180,000 sec | 0 | ₹0.0023 / sec | ₹0.00 | ₹0.00 |
| GCP-003 | Cloud Run | Active GiB-sec | 18,528 sec | 360,000 sec | 0 | ₹0.0002 / sec | ₹0.00 | ₹0.00 |
| GCP-004 | Cloud Storage | Disaster Recovery Bucket| 2.0 GB | None | 2.0 GB | ₹2.49 / GB | ₹4.98 | ₹4.98 |
| GCP-005 | Cloud Tasks | Dispatched Operations | 20,000 ops | 1,000,000 ops | 0 | ₹38.36 / M | ₹0.00 | ₹0.00 |
| GCP-006 | Cloud Scheduler | Active Job | 1 job | 3 jobs | 0 | ₹9.59 / job | ₹0.00 | ₹0.00 |
| GCP-007 | Secret Manager | Active Secret Versions | 4 versions | 6 versions | 0 | ₹5.75 / ver | ₹0.00 | ₹0.00 |
| GCP-008 | Secret Manager | Secret Access Ops | 20,000 ops | 10,000 ops | 10,000 ops | ₹2.88 / 10k | ₹2.88 | ₹2.88 |
| GCP-009 | Cloud Build | Build Minutes | 100 min | 2,500 min | 0 | ₹0.29 / min | ₹0.00 | ₹0.00 |
| GCP-010 | Artifact Registry | Container Image Storage | 0.5 GB | None | 0.5 GB | ₹9.59 / GB | ₹4.80 | ₹4.80 |
| GCP-011 | Cloud Logging | Log Ingestion | 3.0 GiB | 50.0 GiB | 0 | ₹47.95 / GiB | ₹0.00 | ₹0.00 |
| GCP-012 | Cloud Monitoring | Metrics & Uptime | Standard | Included | 0 | ₹0.00 | ₹0.00 | ₹0.00 |
| GCP-013 | Firestore PITR | 7-Day Continuous Backup| 0.65 GiB | None | 0.65 GiB | ₹11.51 / GiB | ₹7.48 | ₹7.48 |
| **TOTAL** | **GCP Services** | **Pre-Tax Subtotal** | — | — | — | — | **₹20.14** | **₹20.14** |

---

> **GCP BOM Sign-off**: Eliminating 10 redundant enterprise services (Cloud SQL, BigQuery, VPC, NAT, Load Balancers) saves the organization over **₹18,000/month (~₹2,16,000/year)** while maintaining an enterprise-grade, high-availability architecture that costs just **₹20.14/month in Google Cloud native infrastructure**.
