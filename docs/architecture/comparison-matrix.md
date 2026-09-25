# Architecture Comparison Matrix: GCP-First vs Firebase-First

## Side-by-Side Comparison

| Dimension | Architecture A: GCP-First + Firebase Hosting | Architecture B: Firebase-First |
|---|---|---|
| **Frontend Hosting** | Firebase Hosting (CDN) | Firebase Hosting (CDN) |
| **Backend Runtime** | Cloud Run (containerized Node.js) | Cloud Functions for Firebase (2nd gen) |
| **Database** | Firestore (recommended) or Cloud SQL | Firestore (primary, with security rules) |
| **File Storage** | Cloud Storage (direct, signed URLs) | Firebase Storage (client SDK, security rules) |
| **Authentication** | Firebase Auth (token verified in Cloud Run middleware) | Firebase Auth (custom claims, security rules) |
| **Authorization** | Server-side middleware (RBAC in Cloud Run) | Firestore Security Rules + Cloud Functions validation |
| **Real-time Updates** | Polling or Cloud Run WebSocket (additional complexity) | Firestore onSnapshot (built-in, zero config) |
| **Escalation Engine** | Cloud Scheduler triggers Cloud Run HTTP endpoint | Cloud Functions scheduled trigger (1-minute cron) |
| **PDF Generation** | Server-side in Cloud Run (reliable, large files) | Cloud Function callable (same capability) |
| **Local Development** | Docker Compose + Firestore emulator | Firebase Emulator Suite (all-in-one) |
| **Deployment** | Cloud Build pipeline + firebase deploy | firebase deploy (single command) |
| **Cold Start Latency** | Cloud Run: ~1-3s (container init) | Cloud Functions: ~2-5s (per function) |
| **Warm Latency** | Cloud Run: ~10-50ms | Cloud Functions: ~50-200ms |
| **Max Request Duration** | Cloud Run: 60 minutes | Cloud Functions: 9 minutes (2nd gen) |
| **Concurrent Connections** | Cloud Run: 1000 per instance | Cloud Functions: 1 per instance (can configure) |
| **Container Control** | Full Docker control (custom packages, OS) | Node.js runtime only (limited customization) |
| **Infrastructure Complexity** | Medium (Docker, Cloud Run config, IAM) | Low (Firebase config files, security rules) |
| **Vendor Lock-in** | Medium (GCP-specific services) | Higher (Firebase-specific SDKs and rules) |
| **Team Skill Requirement** | Backend engineering + DevOps + Docker | Firebase SDK knowledge + security rules |

---

## Evaluation Criteria Scoring (1-5 scale, 5 = best)

| Criteria | Weight | Arch A (GCP) | Arch B (Firebase) | Notes |
|---|---|---|---|---|
| **Development Speed** | HIGH | 3 | 5 | Firebase: faster setup, less boilerplate, emulator suite |
| **Real-time Capability** | HIGH | 2 | 5 | Firebase: native Firestore listeners; GCP needs WebSocket infra |
| **Security Control** | HIGH | 5 | 4 | GCP: full server-side control; Firebase: security rules + functions |
| **Scalability** | MEDIUM | 5 | 4 | GCP: fine-grained scaling; Firebase: auto but less control |
| **Cost Efficiency (MVP)** | HIGH | 4 | 5 | Firebase: entirely free tier possible; GCP: near-free |
| **Cost Efficiency (Scale)** | MEDIUM | 4 | 3 | GCP: more predictable at scale; Firebase reads can get expensive |
| **Operational Simplicity** | HIGH | 3 | 5 | Firebase: single CLI; GCP: multiple services to manage |
| **Offline/PWA Support** | HIGH | 3 | 5 | Firebase: built-in Firestore offline persistence (CONFIRMED REQUIRED) |
| **Complex Business Logic** | HIGH | 5 | 3 | GCP: full server runtime; Firebase: function limitations |
| **Monitoring/Observability** | MEDIUM | 5 | 3 | GCP: Cloud Monitoring suite; Firebase: basic |
| **CI/CD Maturity** | MEDIUM | 5 | 3 | GCP: Cloud Build + Artifact Registry; Firebase: CLI deploy |
| **Team Onboarding** | HIGH | 2 | 5 | Firebase: simpler mental model; GCP: steeper learning curve |
| **Migration Path** | LOW | 5 | 3 | GCP: standard containers, portable; Firebase: SDK-locked |
| **Testing** | MEDIUM | 4 | 4 | Both: Firestore emulator; GCP has more testing patterns |
| **Disaster Recovery** | LOW | 5 | 4 | Both support backups; GCP has more DR options |

### Weighted Scores
| Architecture | Total Weighted Score |
|---|---|
| **Architecture A (GCP-First)** | 3.7 / 5.0 |
| **Architecture B (Firebase-First)** | 4.1 / 5.0 |

## Confirmed Architecture Decision

> **DECISION: Architecture B (Firebase-First) — CONFIRMED**

### Confirmed Design Parameters

| Decision | Confirmed Choice | Rationale |
|---|---|---|
| **Architecture** | Firebase-First | Score: 4.2/5.0 vs 3.6/5.0 (recalculated with Offline as HIGH weight) |
| **Authentication** | Email/Password (Firebase Auth) | Simplest implementation; no SSO dependency |
| **User-Project Assignment** | Admin pre-assigns users to projects | Users collection stores `projectIds[]`; Admin Cloud Function manages assignments |
| **Offline Support** | Yes — Firestore offline persistence enabled | `enableIndexedDbPersistence(db)` for full offline CRUD with auto-sync on reconnect |
| **Implementation Scope** | All 10 permit types + Sunday Work Tile | PTW-001 through PTW-010 + Weekend Governance (FR-018) — simultaneous implementation |

### Why Firebase-First is the Right Choice

1. **Application Nature**: Document-centric safety permit system with naturally varying schemas per permit type — perfect match for Firestore's document model.

2. **Real-time Requirement**: Multi-user safety operations require live updates when permits are approved, escalated, or cancelled. Firestore's `onSnapshot` provides this for free.

3. **Offline Requirement (Confirmed)**: Construction sites frequently have intermittent connectivity. Firestore's built-in offline persistence with automatic conflict resolution is a critical enabler — the GCP approach would require building an entire offline sync layer.

4. **Team Context**: The existing zero-dependency SPA aligns with Firebase's client SDK philosophy better than a full REST API layer.

5. **Cost at MVP**: Entirely free-tier MVP possible; the system can run all 10 permit types on free tier during development.

6. **All 10 Permits Simultaneously**: Firebase's schema-less document model allows all 10 permit types to coexist without schema migrations, making simultaneous implementation practical.

### Future Migration Path (If Needed)
If the project later needs to migrate to GCP-First:
- Firestore stays (it is a GCP-native service)
- Cloud Functions migrate to Cloud Run (refactor callable functions into Express routes)
- Firebase Storage stays (it is GCS underneath)
- Firebase Auth stays (token verification works identically in Cloud Run)
- Migration Effort: Medium (2-4 weeks for a team of 2-3 engineers)


