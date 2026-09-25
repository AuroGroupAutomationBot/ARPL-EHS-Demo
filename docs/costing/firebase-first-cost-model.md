# Firebase-First Cost Model

> **Date**: 2026-09-25
> **Region**: asia-south1
> **Currency Reference**: USD mapped to INR at ₹84/USD

---

## Database Cost Model (Firestore)

Firestore pricing is primarily usage-based (document operations) rather than capacity-based. 

### Pricing Variables
- **Reads**: $0.036 per 100,000 (after 50K/day free)
- **Writes**: $0.108 per 100,000 (after 20K/day free)
- **Deletes**: $0.012 per 100,000 (after 20K/day free)
- **Storage**: $0.18 per GiB/month (after 1 GiB free)

### Calculation Formula
```text
( (Reads_Per_Month - 1,500,000) / 100,000 ) × $0.036
+ ( (Writes_Per_Month - 600,000) / 100,000 ) × $0.108
+ ( (Deletes_Per_Month - 600,000) / 100,000 ) × $0.012
+ ( (Storage_GiB - 1) ) × $0.18
= Estimated Monthly Database Cost
```

---

## Compute Cost Model (Cloud Functions / Cloud Run Functions)

Cloud Functions 2nd Gen charges based on invocations, compute time, and memory allocated.

### Pricing Variables
- **Invocations**: $0.40 per million (after 2M free)
- **vCPU-seconds**: $0.0000024/sec (after 180K free)
- **GiB-seconds**: $0.0000025/sec (after 360K free)

### Calculation Formula
```text
( (Invocations_Per_Month - 2,000,000) / 1,000,000 ) × $0.40
+ ( (Invocations_Per_Month × Avg_Duration_Sec - 180,000) ) × $0.0000024
+ ( (Invocations_Per_Month × Avg_Duration_Sec × RAM_GiB - 360,000) ) × $0.0000025
= Estimated Monthly Compute Cost
```
*Note: Negative values in free tier subtractions equal 0.*

---

## Monthly Cost Table

### Workload Assumptions
- **MVP (100 users)**: 60 permits/day, 1.5M reads/mo, 300K writes/mo, 1 GiB storage, 48K functions invocations/mo.
- **Production (5,000 users)**: 3,000 permits/day, 75M reads/mo, 15M writes/mo, 100 GiB storage, 2.4M functions invocations/mo.
- **High Usage (100,000 users)**: 60,000 permits/day, 1.5B reads/mo, 300M writes/mo, 2,000 GiB storage, 48M functions invocations/mo.

| Service | MVP (100 Users) | Production (5K Users) | High Usage (100K Users) | Cost Driver |
|---|---:|---:|---:|---|
| Hosting | ₹0 | ₹0 | ₹5,000 | Bandwidth (Free 10GB/mo) |
| Authentication | ₹0 | ₹0 | ₹0 | Free < 50K MAU (Email/PW) |
| Backend (Compute) | ₹0 | ₹200 | ₹6,300 | Function Invocations & vCPU |
| Database (Firestore) | ₹0 | ₹5,040 | ₹102,800 | Document Reads/Writes |
| Storage (Files) | ₹0 | ₹1,500 | ₹30,000 | Firebase Storage GiB |
| Networking | ₹0 | ₹1,000 | ₹20,000 | Internet Egress |
| Logging | ₹0 | ₹0 | ₹4,000 | Log Ingestion GiB |
| Monitoring | ₹0 | ₹0 | ₹0 | Basic Metrics |
| AI | ₹0 | ₹0 | ₹0 | Not Applicable |
| CI/CD | ₹50 | ₹200 | ₹1,000 | Artifact Registry Storage |
| Security (Secrets) | ₹20 | ₹50 | ₹500 | Access Operations |
| **Total (INR)** | **₹70 / month** | **₹7,990 / month** | **₹169,600 / month** | |

### Conclusion for Firebase-First
- **Strengths**: True scale-to-zero. At MVP scale, the operational cost is near ₹0.
- **Weaknesses**: At High Usage scale (100,000 users), Firestore read/write costs become extremely expensive (~₹100K/month) because the cost scales linearly per operation, punishing chatty interfaces or heavy dashboard queries.
