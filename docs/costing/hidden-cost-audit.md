# Hidden Cost Audit — ARPL EHS PTW System

> **Date**: 2026-09-25

---

## Purpose
Audit every potential hidden cost that is frequently missed in cloud estimates.

---

## Audit Checklist

| # | Category | Potential Hidden Cost | Status | Finding |
|---:|---|---|---|---|
| 1 | **Networking** | Firestore → Cloud Functions data transfer | ✅ VERIFIED | Same-region (asia-south1) = FREE |
| 2 | **Networking** | Cloud Functions → Firestore data transfer | ✅ VERIFIED | Same-region = FREE |
| 3 | **Networking** | Cloud Functions → Firebase Storage data transfer | ✅ VERIFIED | Same-region = FREE |
| 4 | **Networking** | Firebase Hosting → Client (CDN egress) | ✅ VERIFIED | Within 360MB/day free tier |
| 5 | **Networking** | Firestore → Client (real-time listener data) | ✅ VERIFIED | Within 10 GiB free egress tier |
| 6 | **Networking** | Cross-region traffic | ✅ VERIFIED | All resources in asia-south1; NO cross-region |
| 7 | **Networking** | VPC/NAT costs | ✅ VERIFIED | No VPC used; serverless-only architecture |
| 8 | **Database** | Firestore index storage | ⚠️ NOTED | Composite indexes ~0.5 GiB; included in storage estimate |
| 9 | **Database** | Firestore metadata reads (security rule evaluations) | ✅ VERIFIED | Billed as document reads; included in estimate |
| 10 | **Database** | Firestore listener reconnection overhead | ⚠️ NOTED | Offline-first may cause burst reads on reconnect; estimated +10% overhead |
| 11 | **Storage** | Firebase Storage object listing operations | ✅ VERIFIED | Minimal; within free quota |
| 12 | **Storage** | Firebase Storage metadata operations | ✅ VERIFIED | Minimal; within free quota |
| 13 | **Compute** | Cloud Functions cold start overhead | ⚠️ NOTED | Cold starts consume vCPU-sec; included in average 0.4s per invocation |
| 14 | **Compute** | Cloud Functions minimum billing granularity | ✅ VERIFIED | 100ms minimum; accounted for |
| 15 | **Compute** | Escalation scheduler overhead | ✅ VERIFIED | 43,200 invocations/month; within 2M free tier |
| 16 | **Backup** | Firestore export operation cost | ✅ VERIFIED | Export reads billed as document reads; ~4 full exports/month |
| 17 | **Backup** | Backup storage in Cloud Storage | ✅ VERIFIED | Included as PRD-022 (~₹4/month) |
| 18 | **CI/CD** | Container image accumulation | ⚠️ NOTED | Artifact Registry grows with each build; lifecycle policy recommended |
| 19 | **CI/CD** | Firebase CLI deployment overhead | ✅ VERIFIED | Firebase deploys via CLI; no separate hosting cost beyond free tier |
| 20 | **Logging** | Verbose Cloud Functions logs | ⚠️ NOTED | Production should use structured INFO-level logging; DEBUG disabled |
| 21 | **Logging** | Firestore audit logs | ✅ VERIFIED | Admin activity logs free; data access logs optional |
| 22 | **Auth** | Firebase Auth per-SMS cost | ✅ VERIFIED | NOT APPLICABLE — email/password only; no SMS/phone auth |
| 23 | **Auth** | Identity Platform upgrade trigger | ✅ VERIFIED | NOT APPLICABLE — staying on Firebase Auth; no Identity Platform |
| 24 | **Security** | Secret Manager rotation notifications | ✅ VERIFIED | $0.05/rotation; not using auto-rotation initially |
| 25 | **Domain** | Custom domain SSL | ✅ VERIFIED | Firebase Hosting provides free SSL; no separate certificate cost |
| 26 | **Domain** | Domain registration/renewal | ⚠️ EXTERNAL | Domain cost not a Google Cloud cost; customer bears separately |
| 27 | **Support** | Google Cloud support plan | ⚠️ NOT INCLUDED | Support plan cost should be quoted by billing partner |
| 28 | **Compliance** | App Check attestation | ✅ VERIFIED | Free service; no cost |
| 29 | **Offline** | Sync burst after prolonged offline | ⚠️ NOTED | Batch sync may cause momentary spike in writes; daily free quota should absorb |

---

## Risk Assessment

| Risk Level | Count | Items |
|---|---:|---|
| ✅ No risk | 21 | Verified free or included |
| ⚠️ Low risk | 7 | Noted but manageable |
| ❌ High risk | 0 | None identified |

---

## Recommendations

1. **Set up budget alerts** at ₹500/month for PROD to catch unexpected spikes
2. **Enable Artifact Registry cleanup** policy to remove old container images
3. **Configure Cloud Logging** to INFO level in production (disable DEBUG)
4. **Monitor Firestore storage** growth — first cost driver to activate (~month 3)
5. **Review Firestore read patterns** quarterly to ensure daily reads stay within 50K/day free quota
