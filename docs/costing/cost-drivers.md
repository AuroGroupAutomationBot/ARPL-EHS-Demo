# Cost Drivers — ARPL EHS PTW System

> **Pricing Checked On**: 2026-09-25

---

## Top 10 Cost Drivers (Ranked by Sensitivity)

### 1. Firestore Document Storage (GiB)
| Field | Value |
|---|---|
| Service | Cloud Firestore |
| Cost Driver | Stored data volume beyond 1 GiB free quota |
| Current Assumption | 1 GiB Month 1 → 5 GiB Month 12 |
| Unit Rate | $0.18/GiB/month (~₹15.12/GiB) |
| Effect of 2× usage | ₹60 → ₹120/month (+₹60) |
| Effect of 5× usage | ₹60 → ₹360/month (+₹300) |
| Effect of 10× usage | ₹60 → ₹756/month (+₹696) |
| Mitigation | Data lifecycle: archive old closed permits; delete old notifications |

### 2. Firebase Storage Volume (Photos/Signatures)
| Field | Value |
|---|---|
| Service | Firebase Storage (Cloud Storage) |
| Cost Driver | Accumulated site photos, signatures, drawings |
| Current Assumption | 0.5 GB Month 1 → 5 GB Month 12 |
| Unit Rate | ~$0.023/GB/month (~₹1.93/GB) for Standard storage |
| Effect of 2× usage | Minimal — still near free tier |
| Effect of 5× usage | +₹50/month (25 GB) |
| Effect of 10× usage | +₹100/month (50 GB) |
| Mitigation | Image compression before upload; lifecycle policy for old photos |

### 3. Firestore Document Reads (Spike Risk)
| Field | Value |
|---|---|
| Service | Cloud Firestore |
| Cost Driver | Real-time listeners, dashboard loads, register queries |
| Current Assumption | 25,000 reads/day (within 50K/day free) |
| Unit Rate | $0.036/100K reads (~₹3.02/100K) |
| Effect of 2× usage | Still within free tier (50K/day) |
| Effect of 5× usage | Exceeds free tier; +₹100/month |
| Effect of 10× usage | Exceeds free tier; +₹500/month |
| Mitigation | Query optimization; local caching; pagination limits |

### 4. Firestore Document Writes
| Field | Value |
|---|---|
| Service | Cloud Firestore |
| Cost Driver | Permit creation, approvals, notification dispatch |
| Current Assumption | 5,000 writes/day (within 20K/day free) |
| Unit Rate | $0.108/100K writes (~₹9.07/100K) |
| Effect of 2× usage | Still within free tier (10K/day) |
| Effect of 5× usage | Exceeds free tier; +₹100/month |
| Effect of 10× usage | Exceeds free tier; +₹600/month |
| Mitigation | Batch writes; reduce notification granularity |

### 5. Cloud Functions Invocations (Escalation Engine)
| Field | Value |
|---|---|
| Service | Cloud Functions for Firebase |
| Cost Driver | Escalation scheduler runs every 60 seconds |
| Current Assumption | 43,200 scheduled + 20,000 callable = 63,200/month |
| Unit Rate | $0.40/million (~₹33.60/million) |
| Effect of 2× usage | Still within 2M free tier |
| Effect of 5× usage | Still within 2M free tier (316K/month) |
| Effect of 10× usage | Still within 2M free tier (632K/month) |
| Mitigation | Not a cost risk at foreseeable scale |

### 6. Cloud Functions Compute (vCPU-seconds)
| Field | Value |
|---|---|
| Service | Cloud Functions for Firebase |
| Cost Driver | Function execution time for state machine, PDF generation |
| Current Assumption | 25,000 vCPU-sec/month (within 180K free) |
| Unit Rate | $0.0000024/vCPU-sec (~₹0.0002/vCPU-sec) |
| Effect of 2× usage | Still within free tier |
| Effect of 5× usage | Still within free tier (125K) |
| Effect of 10× usage | Exceeds free tier; +₹40/month |
| Mitigation | Optimize function execution time; minimize cold starts |

### 7. Secret Manager Access Operations
| Field | Value |
|---|---|
| Service | Secret Manager |
| Cost Driver | Function cold starts accessing secrets |
| Current Assumption | 50,000 ops/month (40K beyond free) |
| Unit Rate | $0.03/10K ops (~₹2.52/10K) |
| Effect of 2× usage | +₹10/month |
| Effect of 5× usage | +₹50/month |
| Effect of 10× usage | +₹110/month |
| Mitigation | Cache secrets in function global scope; use environment variables |

### 8. Internet Egress (Client Download)
| Field | Value |
|---|---|
| Service | Internet Egress |
| Cost Driver | Users downloading permit photos, PDFs |
| Current Assumption | 5 GB/month (within 10 GiB free) |
| Unit Rate | $0.12/GB (~₹10.08/GB) beyond 10 GiB |
| Effect of 2× usage | Exceeds free tier; +₹50/month |
| Effect of 5× usage | +₹150/month |
| Effect of 10× usage | +₹400/month |
| Mitigation | Client-side caching; lazy loading; Firestore offline persistence |

### 9. Cloud Logging Ingestion
| Field | Value |
|---|---|
| Service | Cloud Logging |
| Cost Driver | Structured logs from Cloud Functions, Firestore |
| Current Assumption | 2 GiB/month (within 50 GiB free) |
| Unit Rate | $0.50/GiB (~₹42/GiB) beyond 50 GiB |
| Effect of 2× usage | Still within free tier |
| Effect of 5× usage | Still within free tier |
| Effect of 10× usage | Still within free tier (20 GiB) |
| Mitigation | Not a risk unless verbose debug logging is left on |

### 10. Artifact Registry Storage
| Field | Value |
|---|---|
| Service | Artifact Registry |
| Cost Driver | Container image versions stored |
| Current Assumption | 1 GB (builds accumulate images) |
| Unit Rate | $0.10/GB (~₹8.40/GB) |
| Effect of 2× usage | +₹8/month |
| Effect of 5× usage | +₹34/month |
| Effect of 10× usage | +₹76/month |
| Mitigation | Image cleanup policy; keep only last 5 versions |

---

## Cost Driver Summary

At the **baseline production workload** (50 users, 30 permits/day), the system operates almost entirely within Google Cloud free tiers. The **first cost driver to activate** is:

1. **Firestore storage** (exceeds 1 GiB free around month 3) — ₹15/month per additional GiB
2. **Firebase Storage** (approaches 5 GB free limit around month 10) — ₹2/month per additional GB

The system can scale to **5× the current workload** (250 users, 150 permits/day) before any operation-based costs (reads/writes/invocations) exceed free tiers.
