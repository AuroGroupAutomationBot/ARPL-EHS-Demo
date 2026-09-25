# Partner Input Required — ARPL EHS PTW System

> **Document Purpose**: Items requiring validation or quotation by the Google Cloud Billing Partner
> **Date**: 2026-09-25

---

## Partner Request Table

| # | Item | Required Information from Google/Billing Partner |
|---:|---|---|
| 1 | **Contracting Entity** | Confirm Google Cloud India Private Limited as contracting entity |
| 2 | **Billing Currency** | Confirm INR billing with standard Google Cloud India invoice |
| 3 | **GSTIN** | Confirm Google Cloud India Pvt Ltd GSTIN for tax invoice |
| 4 | **GST Rate** | Confirm 18% GST applicable; confirm ITC eligibility |
| 5 | **Exact Firestore SKU (asia-south1)** | Confirm exact per-100K read/write/delete rates for asia-south1 in INR |
| 6 | **Exact Cloud Functions SKU (asia-south1)** | Confirm per-vCPU-second and per-GiB-second rates for asia-south1 |
| 7 | **Firebase Hosting SKU** | Confirm hosting storage and bandwidth rates beyond free tier |
| 8 | **Firebase Storage SKU (asia-south1)** | Confirm per-GB storage and operation rates for asia-south1 |
| 9 | **Secret Manager SKU** | Confirm per-version and per-10K-ops rates in INR |
| 10 | **Artifact Registry SKU** | Confirm per-GB-month storage rate in INR |
| 11 | **Cloud Logging SKU** | Confirm per-GiB ingestion rate beyond 50 GiB free in INR |
| 12 | **Internet Egress SKU (asia-south1 to India)** | Confirm per-GB rate for asia-south1 → India internet egress |
| 13 | **Cloud Build SKU (asia-south1)** | Confirm per-minute rate for e2-standard-2 beyond free tier |
| 14 | **Partner Discount** | Provide applicable partner/reseller discount percentage |
| 15 | **CUD Availability** | Confirm if committed-use discounts apply to Firebase/serverless services |
| 16 | **CUD Rate** | If CUD available, provide 1-year and 3-year discount rates |
| 17 | **Partner Markup** | Disclose any reseller markup applied to list prices |
| 18 | **Support Plan** | Recommend and price appropriate Google Cloud support plan |
| 19 | **Enterprise Agreement** | Confirm if enterprise agreement pricing is available at this scale |
| 20 | **Minimum Commitment** | Confirm if any minimum monthly commitment is required |
| 21 | **Billing Frequency** | Confirm monthly billing cycle |
| 22 | **Payment Terms** | Provide standard payment terms (Net 30, etc.) |
| 23 | **Firebase Blaze Plan Verification** | Confirm free tier quotas are current and applicable for asia-south1 |
| 24 | **Regional Pricing Variance** | Confirm whether asia-south1 has any pricing premium vs. US regions |

---

## Commercial Fields (To Be Completed by Partner)

```
Cloud Usage Subtotal (INR):          ₹_________
Partner Discount:                    _____%
Partner Markup:                      _____%
CUD Discount:                        _____%
Other Commercial Adjustments:        ₹_________
Pre-Tax Subtotal (INR):             ₹_________
GST @ 18%:                          ₹_________
Final Payable Amount (INR):          ₹_________

Support Plan Selected:               _________
Support Plan Monthly Cost (INR):     ₹_________
```

---

## Pricing Confidence Matrix

| Service | List Price Confidence | Partner Price |
|---|---|---|
| Firebase Auth (email/password) | HIGH — clearly documented as free <50K MAU | TBD |
| Firestore Operations | MEDIUM — USD rates confirmed; INR conversion approximate | TBD |
| Firestore Storage | MEDIUM — USD rates confirmed; INR conversion approximate | TBD |
| Firebase Hosting | HIGH — free tier clearly documented | TBD |
| Firebase Storage | MEDIUM — standard GCS pricing; regional rate to confirm | TBD |
| Cloud Functions | MEDIUM — 2nd gen pricing via Cloud Run functions; regional rate to confirm | TBD |
| Secret Manager | HIGH — well-documented pricing | TBD |
| Cloud Build | HIGH — free tier clearly documented | TBD |
| Artifact Registry | MEDIUM — $0.10/GB documented but regional rate to confirm | TBD |
| Cloud Logging | HIGH — 50 GiB free tier clearly documented | TBD |
| Internet Egress | MEDIUM — tiered pricing; exact India rate to confirm | TBD |
| GST Treatment | HIGH — 18% confirmed for Google Cloud India Pvt Ltd | TBD |
