# Firebase BOM — ARPL EHS PTW System

> **Pricing Checked On**: 2026-09-25
> **Firebase Plan**: Blaze (Pay-as-you-go)

---

## Firebase Services Used

### Firebase Authentication
| Field | Value |
|---|---|
| Auth Method | Email/Password |
| MAU (PROD) | 40 |
| Free Tier | 50,000 MAU |
| Monthly Cost | ₹0 |
| Phone/SMS Auth | NOT USED (no per-SMS charges) |
| Identity Platform | NOT USED (not upgrading) |

### Firebase Hosting
| Field | Value |
|---|---|
| Content | Static SPA (HTML/CSS/JS) |
| Storage Used | <1 GB |
| Free Storage | 10 GB |
| Daily Transfer | ~70 MB |
| Free Transfer | 360 MB/day |
| Custom Domain | Yes (SSL provided free) |
| Sites/Projects | 2 (DEV + PROD) |
| Monthly Cost | ₹0 |

### Cloud Firestore
| Field | DEV | PROD |
|---|---|---|
| Region | asia-south1 | asia-south1 |
| Reads/month | 125,000 | 625,000 |
| Free reads/day | 50,000 | 50,000 |
| Within free? | YES | YES (25K/day < 50K) |
| Writes/month | 50,000 | 125,000 |
| Free writes/day | 20,000 | 20,000 |
| Within free? | YES | YES (5K/day < 20K) |
| Storage | 0.5 GiB | 1-5 GiB |
| Free storage | 1 GiB | 1 GiB |
| Storage cost | ₹0 | ₹0-60/month |
| Index storage | minimal | ~0.5 GiB |
| Backups | None | 4/month via Cloud Storage |
| PITR | Not enabled | Not enabled (can be added) |

### Firebase Storage (Cloud Storage for Firebase)
| Field | DEV | PROD |
|---|---|---|
| Region | asia-south1 | asia-south1 |
| Stored GB | 0.2 | 0.5-5 |
| Free storage | 5 GB | 5 GB |
| Within free? | YES | YES (Year 1) |
| Upload ops/month | 100 | 750 |
| Download GB/month | 0.5 | 2 |
| Within free? | YES | YES |
| Bucket purpose | Test photos | Site photos, signatures, drawings, PDFs |

### Cloud Functions for Firebase (2nd gen)
| Field | DEV | PROD |
|---|---|---|
| Region | asia-south1 | asia-south1 |
| Invocations/month | 12,500 | 65,000 |
| Free invocations | 2,000,000 | 2,000,000 |
| Within free? | YES | YES (3.25% of free tier) |
| vCPU-sec/month | 5,000 | 25,000 |
| Free vCPU-sec | 180,000 | 180,000 |
| Within free? | YES | YES (13.9% of free tier) |
| GiB-sec/month | 5,000 | 25,000 |
| Free GiB-sec | 360,000 | 360,000 |
| Within free? | YES | YES (6.9% of free tier) |
| Functions count | ~15 | ~20 |
| Memory per function | 256 MB | 256 MB |
| Timeout per function | 30s | 60s |

### Firebase Cloud Messaging (FCM)
| Field | Value |
|---|---|
| Used | NO — in-app notifications via Firestore onSnapshot |
| Push Notifications | NOT REQUIRED |
| Monthly Cost | ₹0 |

### App Check
| Field | Value |
|---|---|
| Used | Optional (recommended for PROD) |
| Cost | No-cost service |

### Crashlytics
| Field | Value |
|---|---|
| Used | Not in initial scope |
| Cost | No-cost service |

### Remote Config
| Field | Value |
|---|---|
| Used | No — APP_CONFIG stored in Firestore config/app document |
| Cost | ₹0 |

### Firebase Extensions
| Field | Value |
|---|---|
| Extensions Used | NONE |
| Underlying GCP charges | N/A |

---

## Firebase Total Monthly Cost

| Service | DEV (INR) | PROD Month 1 (INR) | PROD Month 12 (INR) |
|---|---:|---:|---:|
| Firebase Auth | ₹0 | ₹0 | ₹0 |
| Firebase Hosting | ₹0 | ₹0 | ₹0 |
| Firestore Operations | ₹0 | ₹0 | ₹0 |
| Firestore Storage | ₹0 | ₹0 | ₹60 |
| Firebase Storage | ₹0 | ₹0 | ₹0 |
| Cloud Functions | ₹0 | ₹0 | ₹0 |
| FCM | ₹0 | ₹0 | ₹0 |
| App Check | ₹0 | ₹0 | ₹0 |
| **Firebase Total** | **₹0** | **₹0** | **₹60** |
