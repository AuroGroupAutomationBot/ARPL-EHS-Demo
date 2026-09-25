# Pricing Sources — ARPL EHS PTW System

> **All prices checked on**: 2026-09-25

---

## Source Priority

| Priority | Source | Status |
|---:|---|---|
| 1 | Official Google Cloud Pricing Pages | Primary source |
| 2 | Official Firebase Pricing Page | Primary source |
| 3 | Google Cloud Billing Catalog / SKU | SKU TO BE CONFIRMED BY BILLING PARTNER |
| 4 | Google Cloud Pricing Calculator | Reference validation |
| 5 | Official Google Documentation (quotas/free) | Free tier validation |

---

## Prices Used in BOM

### Firestore (Standard Edition, asia-south1)
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| Document Reads | $0.036 per 100K | ₹3.02 per 100K | cloud.google.com/firestore/pricing |
| Document Writes | $0.108 per 100K | ₹9.07 per 100K | cloud.google.com/firestore/pricing |
| Document Deletes | $0.012 per 100K | ₹1.01 per 100K | cloud.google.com/firestore/pricing |
| Storage | $0.18 per GiB/month | ₹15.12 per GiB/month | cloud.google.com/firestore/pricing |
| Free: Reads | 50,000/day | — | firebase.google.com/pricing |
| Free: Writes | 20,000/day | — | firebase.google.com/pricing |
| Free: Deletes | 20,000/day | — | firebase.google.com/pricing |
| Free: Storage | 1 GiB total | — | firebase.google.com/pricing |

**Confidence**: MEDIUM — USD rates from official docs; exact INR from SKU catalog requires partner confirmation.

### Cloud Functions for Firebase (2nd gen = Cloud Run Functions)
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| Invocations | $0.40 per million | ₹33.60 per million | cloud.google.com/functions/pricing |
| vCPU-second | $0.0000024 | ₹0.0002016 | cloud.google.com/functions/pricing |
| GiB-second (memory) | $0.0000025 | ₹0.000210 | cloud.google.com/functions/pricing |
| Free: Invocations | 2,000,000/month | — | cloud.google.com/functions/pricing |
| Free: vCPU-seconds | 180,000/month | — | cloud.google.com/functions/pricing |
| Free: GiB-seconds | 360,000/month | — | cloud.google.com/functions/pricing |

**Confidence**: MEDIUM — base rates confirmed; asia-south1 regional rate may vary.

### Firebase Auth
| Meter | Rate | Source |
|---|---|---|
| Email/Password MAU | Free up to 50,000 MAU | firebase.google.com/pricing |

**Confidence**: HIGH — clearly documented.

### Firebase Hosting
| Meter | Rate | Source |
|---|---|---|
| Storage | Free up to 10 GB | firebase.google.com/pricing |
| Transfer | Free up to 360 MB/day | firebase.google.com/pricing |

**Confidence**: HIGH — clearly documented.

### Firebase Storage (Cloud Storage for Firebase)
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| Standard Storage | $0.026/GB/month | ₹2.18/GB/month | cloud.google.com/storage/pricing |
| Class A Operations | $0.05 per 10K | ₹4.20 per 10K | cloud.google.com/storage/pricing |
| Class B Operations | $0.004 per 10K | ₹0.34 per 10K | cloud.google.com/storage/pricing |
| Free: Storage | 5 GB | — | firebase.google.com/pricing |

**Confidence**: MEDIUM — standard GCS pricing; regional rate to confirm.

### Secret Manager
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| Active Version | $0.06/version/month | ₹5.04/version/month | cloud.google.com/secret-manager/pricing |
| Access Operation | $0.03 per 10K | ₹2.52 per 10K | cloud.google.com/secret-manager/pricing |
| Free: Versions | 6 active versions | — | cloud.google.com/secret-manager/pricing |
| Free: Access | 10,000 ops/month | — | cloud.google.com/secret-manager/pricing |

**Confidence**: HIGH — well-documented pricing.

### Cloud Build
| Meter | Rate | Source |
|---|---|---|
| e2-standard-2 | $0.006/minute | cloud.google.com/build/pricing |
| Free Tier | 2,500 min/month | cloud.google.com/build/pricing |

**Confidence**: HIGH.

### Artifact Registry
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| Storage | $0.10/GB/month | ₹8.40/GB/month | cloud.google.com/artifact-registry/pricing |

**Confidence**: MEDIUM — rate confirmed; regional adjustment possible.

### Cloud Logging
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| Ingestion | $0.50/GiB | ₹42.00/GiB | cloud.google.com/logging/pricing |
| Free Tier | 50 GiB/month | — | cloud.google.com/logging/pricing |

**Confidence**: HIGH.

### Internet Egress (asia-south1 → India/APAC)
| Meter | Rate (USD) | Rate (INR @₹84) | Source |
|---|---|---|---|
| 0-10 GiB | $0.00 (Free) | ₹0.00 | cloud.google.com/vpc/network-pricing |
| 10 GiB-1 TiB | $0.12/GiB | ₹10.08/GiB | cloud.google.com/vpc/network-pricing |

**Confidence**: MEDIUM — APAC rate used; India-specific rate to confirm with partner.

---

## SKU Identification Status

| Service | SKU Status |
|---|---|
| Firestore Reads (asia-south1) | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Firestore Writes (asia-south1) | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Firestore Storage (asia-south1) | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Cloud Functions Invocations | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Cloud Functions vCPU-sec | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Cloud Functions GiB-sec | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Secret Manager Version | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Secret Manager Access | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Artifact Registry Storage | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Cloud Storage Standard | SKU TO BE CONFIRMED BY BILLING PARTNER |
| Internet Egress APAC | SKU TO BE CONFIRMED BY BILLING PARTNER |

> **Note**: Exact SKU IDs were not fabricated. The billing partner has access to the Google Cloud Billing Catalog and can provide exact SKU IDs, Service IDs, and confirmed INR rates for each meter.
