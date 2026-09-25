# Google Cloud BOM — ARPL EHS PTW System

> **Pricing Checked On**: 2026-09-25

---

## GCP Services Used

### Compute
| Field | Value |
|---|---|
| Cloud Run Services | NOT REQUIRED (Cloud Functions sufficient) |
| Cloud Run Jobs | NOT REQUIRED (Cloud Scheduler + Functions sufficient) |
| Compute Engine | NOT REQUIRED |
| **Compute Total** | **₹0** |

### Database
| Field | Value |
|---|---|
| Cloud SQL | NOT REQUIRED (Firestore sufficient) |
| Memorystore | NOT REQUIRED |
| Bigtable | NOT REQUIRED |
| BigQuery | NOT REQUIRED |
| **Database Total** | **₹0** (Firestore billed under Firebase BOM) |

### Storage
| Field | Value |
|---|---|
| Cloud Storage | Used for Firestore backups |
| Artifact Registry Storage | Used for CI/CD container images |
| Backup Storage Amount | 2 GiB/month |
| AR Storage Amount | 1 GiB/month |
| **Storage Total** | **₹12/month** (PROD) |

### Networking
| Field | Value |
|---|---|
| Internet Egress | Client downloads |
| Free Tier | 10 GiB/month |
| Monthly Egress | 5 GiB/month |
| Load Balancer | NOT REQUIRED (Firebase Hosting CDN) |
| Cloud NAT | NOT REQUIRED |
| VPC / Serverless VPC Access | NOT REQUIRED |
| VPN / PSC | NOT REQUIRED |
| **Networking Total** | **₹0** (Within free tier) |

### Security
| Field | Value |
|---|---|
| Secret Manager | API keys, service account keys |
| Active Versions | 8 (2 billable) |
| Access Operations | 50,000 (40K billable) |
| Cloud KMS | NOT REQUIRED |
| Identity Platform | NOT REQUIRED (Using base Firebase Auth) |
| Security Command Center | NOT REQUIRED |
| Cloud Armor | NOT REQUIRED |
| **Security Total** | **₹20/month** (PROD) |

### Observability
| Field | Value |
|---|---|
| Cloud Logging | Structured logs |
| Log Ingestion | 2 GiB/month |
| Free Tier | 50 GiB/month |
| Cloud Monitoring | Basic metrics |
| Cloud Trace | NOT REQUIRED |
| **Observability Total** | **₹0** (Within free tier) |

### CI/CD
| Field | Value |
|---|---|
| Cloud Build | Function deployments, Firebase Hosting deploys |
| Build Minutes | 100 minutes/month |
| Free Tier | 2,500 minutes/month |
| Artifact Registry | Container images |
| **CI/CD Total** | **₹8/month** (AR Storage) |

### AI / GenAI
| Field | Value |
|---|---|
| Vertex AI / Gemini | NOT REQUIRED |
| **AI Total** | **₹0** |

---

## GCP Total Monthly Cost

| Service | DEV (INR) | PROD Month 1 (INR) | PROD Month 12 (INR) |
|---|---:|---:|---:|
| Compute | ₹0 | ₹0 | ₹0 |
| Database | ₹0 | ₹0 | ₹0 |
| Storage (Backups) | ₹0 | ₹4 | ₹4 |
| Networking | ₹0 | ₹0 | ₹0 |
| Security (Secret Manager) | ₹0 | ₹20 | ₹20 |
| Observability | ₹0 | ₹0 | ₹0 |
| CI/CD (Cloud Build + AR) | ₹4 | ₹8 | ₹8 |
| AI / GenAI | ₹0 | ₹0 | ₹0 |
| **GCP Total** | **₹4** | **₹32** | **₹32** |
