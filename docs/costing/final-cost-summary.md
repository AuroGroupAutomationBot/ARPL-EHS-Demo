# Executive Cost Summary & Procurement Presentation — ARPL EHS Platform

> **Document ID**: ARPL-FIN-EXEC-2026-09-25  
> **Status**: FINAL EXECUTIVE AUDIT  
> **Target Deployment**: Primary: `asia-south1` (Mumbai, Maharashtra, India)  
> **Currency Standard**: Indian Rupee (INR / ₹) converted at live rate **1 USD = ₹95.90 INR** (Checked 2026-09-25 12:33 IST)  
> **Confirmed Workload**: 6 Business Construction Projects · 360 Unique Users · 300 Permits/Day Total (9,000/mo)  

---

## 1. Executive Cost Dashboard

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ARPL EHS INFRASTRUCTURE INVESTMENT                        │
│                                                                                        │
│  DEVELOPMENT ENVIRONMENT (Recurring):                                                  │
│  • Monthly Pre-Tax Cost:                      ₹4.80 INR / month                        │
│  • Annualized Pre-Tax Total:                  ₹57.60 INR / year                        │
│  • Annualized Post-Tax Total (incl. 18% GST): ₹67.97 INR / year                        │
│                                                                                        │
│  PRODUCTION ENVIRONMENT (Confirmed Primary Baseline — 9,000 Permits/Month):           │
│  • Month 1 Initial Go-Live (Pre-Tax):         ₹26.67 INR / month                       │
│  • Month 12 Cumulative (Pre-Tax):             ₹197.58 INR / month                      │
│  • Blended Monthly Average (Year 1 Pre-Tax):  ~₹112.08 INR / month                     │
│  • Annualized Pre-Tax Total (Year 1):         ₹1,344.96 INR / year                     │
│  • Annualized GST @ 18.00% (SAC 998315):      ₹242.09 INR / year (100% ITC Creditable) │
│  • Annualized Post-Tax Total (Year 1):        ₹1,587.05 INR / year                     │
│                                                                                        │
│  COMBINED DEV + PROD INFRASTRUCTURE (Year 1):                                          │
│  • Total Annual Pre-Tax Investment:           ₹1,402.56 INR / year (~$14.62 USD/year)  │
│  • Total Annual GST @ 18.00%:                 ₹252.46 INR / year                       │
│  • Total Annual Outflow (Post-Tax):           ₹1,655.02 INR / year                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cost Trajectory Across Growth & Scale Scenarios

| Operating Scenario | Scope Description | Monthly Permits | Monthly Pre-Tax Cost (M1) | Monthly Pre-Tax Cost (M12) | Blended Monthly (Yr 1) | Annual Pre-Tax Total | Annual Post-Tax (incl. 18% GST) |
|---|---|---:|---:|---:|---:|---:|---:|
| **DEV Environment** | Non-prod testing & CI/CD | 250 | ₹4.80 | ₹4.80 | ₹4.80 | **₹57.60** | **₹67.97** |
| **Scenario A (Baseline)**| **6 Sites · 360 Users · 300/Day** | **9,000** | **₹26.67** | **₹197.58** | **₹112.08** | **₹1,344.96** | **₹1,587.05** |
| **Scenario B (Growth)** | 12 Sites · 720 Users · 600/Day | 18,000 | ₹187.95 | ₹529.77 | ₹355.00 | **₹4,260.00** | **₹5,026.80** |
| **Scenario C (High Scale)**| 30 Sites · 1,800 Users · 1,500/Day | 45,000 | ₹542.45 | ₹1,694.13 | ₹1,120.00 | **₹13,440.00** | **₹15,859.20** |
| **Special Sensitivity** | **6 Sites · 300/Site/Day = 1,800/Day**| **54,000** | **₹889.55** | **₹1,999.55** | **₹1,435.00** | **₹17,220.00** | **₹20,319.60** |

---

## 3. Financial Analysis: Identification of Real Cost Drivers

In sharp contrast to conventional monolithic applications where virtual servers and relational databases dominate IT budgets, the ARPL EHS platform exhibits a fundamentally different cost distribution:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              YEAR 1 COST DRIVER BREAKDOWN                              │
│                                                                                        │
│  1. Object Media Storage (Photos/Signatures/PDFs in GCS):     78.9% (₹1,062 / year)    │
│  2. Statutory Database Protection (Firestore PITR 7-Day):      6.7% (₹90 / year)       │
│  3. Disaster Recovery Storage Bucket:                          4.4% (₹60 / year)       │
│  4. Container Repository (Artifact Registry):                  4.3% (₹58 / year)       │
│  5. Security Credentials (Secret Manager Access Ops):          2.6% (₹35 / year)       │
│  6. Database Operations (Firestore Reads & Writes):            3.1% (₹41 / year)       │
│  7. Backend Compute (Cloud Run Core API & Cloud Functions):    0.0% (₹0 / year - Free) │
│  8. Networking Egress & Static Delivery (CDN):                 0.0% (₹0 / year - Free) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Takeaways for Procurement
1. **Compute is NOT the Cost Driver**: Due to Google Cloud Run's high concurrency (80 req/instance) and generous Always Free allowances (2M requests, 180,000 vCPU-sec/month), compute incurs **₹0.00 / month** in baseline scale-to-zero mode.
2. **Media Storage is the Primary Driver**: As statutory site photos, high-DPI signatures, and generated PDF compliance certificates accumulate across 109,500 permits/year, Cloud Storage represents ~79% of total expenditure.
3. **Lifecycle Rule Optimization**: By transitioning closed permits past 90 days from Standard Storage ($0.026/GB) to Nearline Storage ($0.010/GB), Year 1 media storage costs can be further compressed by over 40%.
4. **Extreme Economic Feasibility**: For less than **₹1,600 INR / year (~$16.50 USD / year)**, ARPL achieves a full production deployment supporting 6 major construction sites, 360 active safety personnel, and over 100,000 digital safety permits annually.
