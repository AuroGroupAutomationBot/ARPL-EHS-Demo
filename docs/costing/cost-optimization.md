# Cost Optimization & Billing Controls

> **Date**: 2026-09-25

## 1. Technical Cost-Reduction Opportunities

### Optimization 1: Firestore Listener Throttling
- **Current design**: `onSnapshot` runs globally on the Permits collection for live updates.
- **Proposed change**: Scope `onSnapshot` queries strictly using `.where('status', '==', 'ACTIVE')` and `.limit(50)`. Use standard one-time `get()` for historical permits.
- **Expected cost impact**: Reduces Firestore read costs by 40-60% at scale.
- **Performance impact**: Faster initial client load.
- **Reliability impact**: None.
- **Security impact**: None.
- **Complexity impact**: Minimal. Requires minor UI pagination adjustments.

### Optimization 2: Secret Manager Caching
- **Current design**: Secrets fetched on every Cloud Function cold start.
- **Proposed change**: Cache secrets in the Cloud Function global execution scope so warm instances reuse them.
- **Expected cost impact**: Eliminates 90% of Secret Manager access operation costs.
- **Performance impact**: Reduces function latency by ~50ms.
- **Reliability impact**: None.
- **Security impact**: Safe, provided global variables do not leak to client payloads.
- **Complexity impact**: Minimal.

### Optimization 3: Artifact Registry Cleanup
- **Current design**: Cloud Build pushes a new container image for every deployment, accumulating storage forever.
- **Proposed change**: Implement an Artifact Registry lifecycle policy to retain only the last 5 images.
- **Expected cost impact**: Caps CI/CD storage cost at ~₹10/month indefinitely.
- **Performance impact**: None.
- **Reliability impact**: Still allows rollback to recent versions.
- **Security impact**: None.
- **Complexity impact**: One-time Terraform/CLI configuration.

### Optimization 4: Client-Side Egress Caching
- **Current design**: Images (Firebase Storage) load dynamically in the browser.
- **Proposed change**: Implement aggressive `Cache-Control` headers and local ServiceWorker caching for permit photos.
- **Expected cost impact**: Reduces internet egress bandwidth by 70%.
- **Performance impact**: Vastly improves offline and intermittent connection UX.
- **Reliability impact**: High positive impact.
- **Security impact**: None.
- **Complexity impact**: Moderate. Requires ServiceWorker lifecycle management.

---

## 2. Billing Controls & Runaway Prevention

To prevent unexpected billing spikes (especially crucial in serverless architectures like Firebase), implement the following controls:

### A. GCP Budgets & Alerts
1. Navigate to **Billing > Budgets & alerts**.
2. Create a budget for `arpl-ehs-production` set to ₹5,000 / month.
3. Configure alerts at 50%, 90%, and 100% threshold.
4. Link the alert to a Pub/Sub topic to ping a Slack/Teams channel or email the admin directly.

### B. API Quotas
1. Navigate to **IAM & Admin > Quotas**.
2. Search for **Cloud Firestore API**.
3. Set a hard limit on `Read requests per minute` to prevent infinite loops in client-side React hooks from generating thousands of dollars in reads overnight.

### C. Function Concurrency Limits
1. Cloud Functions 2nd gen can scale to 1000 instances rapidly.
2. Set `maxInstances: 50` on non-critical functions to cap concurrent compute spend during a DDoS or rogue script attack.

### D. App Check Enforcement
1. Enable **Firebase App Check** using reCAPTCHA v3 or DeviceCheck.
2. This ensures only your legitimate frontend code can make calls to Firestore or Cloud Functions, preventing script-kiddies from curling your endpoints and racking up billable invocations.

### E. Monitoring Dashboards
1. Create a custom dashboard in **Cloud Monitoring**.
2. Track: `Firestore Document Reads/sec`, `Cloud Function Execution Time`, and `Network Egress Bytes`.
3. An unexpected sustained spike in any of these three metrics is a leading indicator of a billing anomaly.
