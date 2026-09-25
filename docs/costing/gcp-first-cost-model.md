# GCP-First Cost Model (Cloud Run + Cloud SQL)

> **Date**: 2026-09-25
> **Region**: asia-south1
> **Currency Reference**: USD mapped to INR at ₹84/USD

---

## Database Cost Model (Cloud SQL - PostgreSQL)

Cloud SQL pricing is capacity-based (fixed cost for allocated CPU/RAM/Storage), unlike Firestore's usage-based model.

### Pricing Variables (asia-south1)
- **vCPU**: ~$30.00 / vCPU / month
- **Memory**: ~$5.00 / GB / month
- **Storage**: ~$0.17 / GB / month (SSD)
- **High Availability**: Multiplies base instance cost by ~2x

### Calculation Formula
```text
( Allocated_vCPUs × $30.00 )
+ ( Allocated_RAM_GB × $5.00 )
+ ( Allocated_Storage_GB × $0.17 )
= Estimated Monthly Database Base Cost

If HA Enabled: Base Cost × 2
```
*Note: Read/write operations (queries) do not incur additional charges; you only pay for provisioned capacity.*

---

## Compute Cost Model (Cloud Run)

Cloud Run charges based on allocated CPU/Memory during active request processing, but highly benefits from concurrency (1 container handles up to 1000 concurrent requests).

### Pricing Variables (Tier 1 / asia-south1)
- **vCPU-seconds**: $0.0000240
- **GiB-seconds**: $0.0000025
- **Requests**: $0.40 / million (after 2M free)
- **Concurrency**: Typical 80 requests per container

### Calculation Formula
```text
( (Total_Requests - 2,000,000) / 1,000,000 ) × $0.40
+ ( Active_Container_Time_Sec × Provisioned_vCPUs ) × $0.0000240
+ ( Active_Container_Time_Sec × Provisioned_RAM_GiB ) × $0.0000025
= Estimated Monthly Compute Cost
```
*Note: Because of concurrency, 80 simultaneous requests share the cost of 1 container, drastically reducing cost at high scale compared to Cloud Functions.*

---

## Monthly Cost Table

### Workload Assumptions
- **MVP (100 users)**: Cloud SQL `db-f1-micro` (1 vCPU, 0.6 GB RAM) or smallest standard instance. Cloud Run scales to zero.
- **Production (5,000 users)**: Cloud SQL Standard (2 vCPU, 8 GB RAM, HA enabled). Cloud Run averages 5 concurrent containers.
- **High Usage (100,000 users)**: Cloud SQL Enterprise Plus (8 vCPU, 32 GB RAM, HA, Read Replicas). Cloud Run averages 50 concurrent containers.

| Service | MVP (100 Users) | Production (5K Users) | High Usage (100K Users) | Cost Driver |
|---|---:|---:|---:|---|
| Hosting (Firebase) | ₹0 | ₹0 | ₹5,000 | CDN Bandwidth |
| Authentication | ₹0 | ₹0 | ₹0 | Free < 50K MAU |
| Backend (Cloud Run) | ₹0 | ₹1,500 | ₹12,000 | Container Uptime (Concurrency) |
| Database (Cloud SQL) | ₹1,200 | ₹16,800 | ₹84,000 | Provisioned CPU/RAM/HA |
| Storage (GCS) | ₹0 | ₹1,500 | ₹30,000 | Cloud Storage GiB |
| Networking | ₹0 | ₹1,000 | ₹20,000 | Egress + Cloud SQL network |
| Logging | ₹0 | ₹500 | ₹8,000 | Container logs & SQL logs |
| Monitoring | ₹0 | ₹0 | ₹2,000 | Custom Metrics |
| AI | ₹0 | ₹0 | ₹0 | Not Applicable |
| CI/CD | ₹200 | ₹800 | ₹2,500 | Artifact Registry (Containers) |
| Security (Secrets) | ₹20 | ₹100 | ₹1,000 | Access Operations |
| **Total (INR)** | **₹1,420 / month** | **₹22,200 / month** | **₹164,500 / month** | |

### Conclusion for GCP-First
- **Strengths**: Highly predictable costs at scale. Cloud SQL costs are fixed regardless of query volume, making it extremely cost-efficient for chatty applications at 100K+ users.
- **Weaknesses**: Cannot scale to zero. Even with zero users, a Cloud SQL database incurs a fixed baseline cost (~₹1,200 - ₹2,000/month), making it strictly more expensive than Firebase-First for MVPs.
