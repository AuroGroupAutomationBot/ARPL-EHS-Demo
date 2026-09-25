# GST and India Billing — ARPL EHS PTW System

> **Pricing Checked On**: 2026-09-25

---

## Contracting Entity

| Field | Value |
|---|---|
| **Google Contracting Entity** | Google Cloud India Private Limited |
| **Registered Office** | Bangalore, Karnataka, India |
| **GSTIN** | PARTNER TO CONFIRM |
| **Billing Currency** | INR (₹) |
| **Invoice Frequency** | Monthly |
| **Payment Terms** | As per billing partner agreement |

---

## GST Treatment

| Field | Value |
|---|---|
| **GST Rate** | 18% |
| **GST Applicability** | Applies to ALL Google Cloud services billed by Google Cloud India Pvt Ltd |
| **GSTIN Impact** | 18% GST applies regardless of customer GSTIN status |
| **SEZ Exception** | 0% GST for SEZ units (requires documentation + valid GSTIN) |
| **Input Tax Credit (ITC)** | Available — valid GST invoice provided; GST-registered businesses can claim ITC |
| **TDS Applicability** | TDS should NOT be deducted on GST component (per Indian tax circulars) |

### Important Notes
1. Google Cloud India Private Limited issues invoices in **INR** that include applicable 18% GST
2. The 18% GST is a **pass-through tax** — GST-registered businesses can claim **Input Tax Credit (ITC)**, making the effective GST cost ₹0 for businesses that can fully utilize ITC
3. Non-GST-registered entities bear the full 18% GST as an additional cost
4. SEZ customers should coordinate with the billing partner for 0% GST documentation

---

## Billing Structure

```
Cloud Usage Subtotal (INR)          ₹_________
+ Partner Markup                    TBD BY BILLING PARTNER
- Partner Discount                  TBD BY BILLING PARTNER
- Committed Use Discount (CUD)     TBD BY BILLING PARTNER
= Pre-Tax Subtotal (INR)           ₹_________
+ GST @ 18%                        ₹_________
= Final Payable Amount (INR)       ₹_________
```

---

## Currency Conversion Reference

| Field | Value |
|---|---|
| **Official Billing Currency** | INR (₹) |
| **Reference USD→INR Rate** | ₹84.00 per $1.00 |
| **Rate Basis** | Approximate market rate as of 2026-09-25 |
| **Actual Rate** | Applied by Google Cloud India at time of billing |
| **Note** | Google Cloud India bills in INR; the actual INR price may differ from USD list price × exchange rate |

### Pricing Methodology in This BOM
- All prices are sourced from **official Google Cloud pricing pages** which publish in **USD**
- INR conversion uses ₹84/USD reference rate for estimation
- The **billing partner should confirm actual INR rates** as Google's internal INR pricing may include rounding or regional adjustments
- Where Google Cloud SKUs publish INR prices directly, those take precedence over converted USD prices

---

## Tax Advisor Recommendation

> **IMPORTANT**: The GST and tax information in this document is based on publicly available Google Cloud documentation as of 2026-09-25. This is NOT tax advice. The customer and billing partner should consult with a qualified tax advisor regarding:
> - GSTIN registration requirements
> - ITC eligibility and filing procedures
> - TDS obligations
> - SEZ documentation if applicable
> - Any state-specific GST implications
