# Development Environment — Bill of Materials (DEV BOM)

> **Document ID**: ARPL-BOM-DEV-2026-09-25  
> **Status**: APPROVED & AUDITED  
> **Environment**: Development / Non-Production Testing (`arpl-ehs-dev`)  
> **Target Region**: Primary: `asia-south1` (Mumbai, Maharashtra, India)  
> **Pricing Verification**: 2026-09-25 | Live Spot FX: **1 USD = ₹95.90 INR**  
> **Dedicated Cloud Tenant**: `arpl-ehs-dev` (Completely isolated from Production)  

---

## 1. DEV Workload Profile & Operating Policy

The Development environment supports feature engineering, automated unit/integration testing (25 test suites), QA role persona verification, and CI/CD deployment pipelines:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DEV WORKLOAD PARAMETERS                                   │
│                                                                                        │
│  • Core Engineering Team:            3 Full-time Developers                            │
│  • Simulated Role Persona Accounts:   16 Test User Accounts (1 per RBAC role)          │
│  • Total Registered Accounts:         19 User Accounts                                 │
│  • DEV Monthly Active Users (MAU):    10 MAU                                           │
│  • Daily Test Permits Created:        10 Permits / Day                                 │
│  • Monthly Test Permits Created:      250 Permits / Month                              │
│  • Compute Scaling Policy:            100% Scale-to-Zero (min-instances = 0)           │
│  • Primary Development Mode:          Firebase Local Emulator Suite (Zero Cloud Cost)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DEV Itemized Bill of Materials

| BOM ID | Category | Service | Resource / Metric | Region | SKU / Meter Family | Billing Unit | Monthly Usage | Free Quota | Billable Usage | Unit Rate (USD) | Unit Rate (INR @ ₹95.90) | Monthly Cost (INR) | Annualized Cost (INR) | Source & Confidence | Explicit Modeling Assumption |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| **DEV-001** | 07. Identity | Firebase Auth | Email/Password Accounts | global | `Firebase Auth Free Tier` | MAU | 10 | 50,000 | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Firebase Pricing [HIGH] | 10 active test accounts |
| **DEV-002** | 01. Firebase | Firebase Hosting | SPA Asset Storage | global | `Hosting Storage` | GB | 0.5 | 10.0 | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Firebase Pricing [HIGH] | Static SPA files |
| **DEV-003** | 01. Firebase | Firebase Hosting | CDN Data Transfer | global | `Hosting Transfer` | GB | 1.0 | 10.8 | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Firebase Pricing [HIGH] | Dev web testing traffic |
| **DEV-004** | 03. Database | Cloud Firestore | Document Reads | asia-south1 | `Firestore Doc Reads` | per 100K | 125,000 | 1,500,000 | 0 | $0.036 | ₹3.45 | **₹0.00** | **₹0.00** | Firestore Docs [HIGH] | ~4,166 reads/day (within 50k free) |
| **DEV-005** | 03. Database | Cloud Firestore | Document Writes | asia-south1 | `Firestore Doc Writes` | per 100K | 35,000 | 600,000 | 0 | $0.108 | ₹10.36 | **₹0.00** | **₹0.00** | Firestore Docs [HIGH] | ~1,166 writes/day (within 20k free) |
| **DEV-006** | 03. Database | Cloud Firestore | Document Deletes | asia-south1 | `Firestore Doc Deletes` | per 100K | 10,000 | 600,000 | 0 | $0.012 | ₹1.15 | **₹0.00** | **₹0.00** | Firestore Docs [HIGH] | Test cleanup executions |
| **DEV-007** | 03. Database | Cloud Firestore | Test Data Storage | asia-south1 | `Firestore Storage` | GiB | 0.2 | 1.0 | 0 | $0.207 | ₹19.85 | **₹0.00** | **₹0.00** | Firestore Docs [HIGH] | Seed datasets & fixtures |
| **DEV-008** | 04. Storage | Firebase Storage | Test Photos & Sigs | asia-south1 | `Cloud Storage Standard` | GB | 0.5 | 5.0 | 0 | $0.026 | ₹2.49 | **₹0.00** | **₹0.00** | GCS Pricing [HIGH] | 150 test uploads @ 710 KB |
| **DEV-009** | 04. Storage | Firebase Storage | Upload Operations | asia-south1 | `Storage Class A Ops` | per 10K | 1,500 | 50,000 | 0 | $0.050 | ₹4.80 | **₹0.00** | **₹0.00** | GCS Pricing [HIGH] | Test upload operations |
| **DEV-010** | 02. Compute | Google Cloud Run | API Invocations | asia-south1 | `Cloud Run Requests` | per 1M | 15,000 | 2,000,000 | 0 | $0.400 | ₹38.36 | **₹0.00** | **₹0.00** | Cloud Run Docs [HIGH] | Automated API test suites |
| **DEV-011** | 02. Compute | Google Cloud Run | Active vCPU Runtime | asia-south1 | `Cloud Run Active CPU` | vCPU-sec | 3,000 | 180,000 | 0 | $0.000024 | ₹0.0023 | **₹0.00** | **₹0.00** | Cloud Run Docs [HIGH] | 15,000 calls @ 200ms |
| **DEV-012** | 02. Compute | Google Cloud Run | Active RAM Runtime | asia-south1 | `Cloud Run Active RAM` | GiB-sec | 3,000 | 360,000 | 0 | $0.0000025| ₹0.00024| **₹0.00** | **₹0.00** | Cloud Run Docs [HIGH] | 1 GiB RAM container |
| **DEV-013** | 06. Security | Secret Manager | Active Secret Versions| global | `SM Active Version` | version | 4 | 6 | 0 | $0.060 | ₹5.75 | **₹0.00** | **₹0.00** | Secret Mgr [HIGH] | DEV environment keys |
| **DEV-014** | 06. Security | Secret Manager | Secret Access Ops | global | `SM Access Operation` | per 10K | 2,500 | 10,000 | 0 | $0.030 | ₹2.88 | **₹0.00** | **₹0.00** | Secret Mgr [HIGH] | Cached in container RAM |
| **DEV-015** | 12. CI/CD | Google Cloud Build| Container Build Min | asia-south1 | `Cloud Build e2-std-2` | minutes | 150 | 2,500 | 0 | $0.003 | ₹0.29 | **₹0.00** | **₹0.00** | Cloud Build [HIGH] | 30 test builds @ 5 min |
| **DEV-016** | 12. CI/CD | Artifact Registry| Container Image Store | asia-south1 | `Artifact Registry Store` | GB | 0.5 | 0.0 | 0.5 | $0.100 | ₹9.59 | **₹4.80** | **₹57.60** | Artifact Reg [HIGH] | Storing 2 DEV revisions |
| **DEV-017** | 10. Logging | Cloud Logging | Debug Log Ingestion | global | `Logging Ingestion` | GiB | 1.0 | 50.0 | 0 | $0.500 | ₹47.95 | **₹0.00** | **₹0.00** | Cloud Logging [HIGH] | DEV error & debug traces |
| **DEV-018** | 11. Monitoring | Cloud Monitoring| Container Health Checks| global | `Monitoring Ingestion` | metrics | Standard | Included | 0 | $0.00 | ₹0.00 | **₹0.00** | **₹0.00** | Monitoring [HIGH] | Free basic uptime checks |
| **DEV-019** | 05. Networking | Internet Egress | Test Outbound Data | asia-south1 | `Internet Egress` | GB | 1.5 | 10.0 | 0 | $0.120 | ₹11.51 | **₹0.00** | **₹0.00** | Network Pricing [HIGH] | Dev downloads & testing |

---

## 3. DEV Cost Summary & Financial Recapitulation

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DEV FINANCIAL SUMMARY (INR)                               │
│                                                                                        │
│  • Recurring Monthly Pre-Tax Cost:              ₹4.80 INR / month                      │
│  • Applicable GST @ 18.00% (SAC 998315):        ₹0.86 INR / month                      │
│  • Total Monthly Post-Tax Payable:             ₹5.66 INR / month                       │
│                                                                                        │
│  • Annualized Pre-Tax Total (12 Months):       ₹57.60 INR / year                       │
│  • Annualized GST @ 18.00%:                    ₹10.37 INR / year                       │
│  • Annualized Post-Tax Total:                  ₹67.97 INR / year                       │
│                                                                                        │
│  • One-Time Setup / Provisioning Cost:          ₹0.00 INR (Fully Automated Scripts)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 DEV Cost Analysis
1. **99.9% Free-Tier Operation**: Because DEV usage scales completely to zero during idle hours and operates well below Always Free monthly allowances, **18 out of 19 billable categories cost exactly ₹0.00**.
2. **Only Billable Line Item**: The only non-zero cost is **Artifact Registry container image storage (₹4.80/month)**, which has no free tier in regional locations.
3. **Budget Alert Policy**: A programmatic Google Cloud Budget Alert is established at **₹500.00 / month** with automated email notifications to the Lead DevOps Engineer to detect any unintended test infinite loops.
