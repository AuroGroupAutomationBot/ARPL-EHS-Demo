# Architecture A: GCP-First + Firebase Hosting

> **STATUS: NOT SELECTED** — Firebase-First was chosen as the production architecture. This document is retained as reference for future migration if scale demands it. See [comparison-matrix.md](file:///Users/techsavvy/Downloads/ARPL-EHS-Demo-main-2/docs/architecture/comparison-matrix.md) for the decision rationale.

## 1. Architecture Overview

This architecture uses **Google Cloud Platform** as the primary backend with **Firebase Hosting** serving only the frontend. It provides maximum control over backend infrastructure, stronger security boundaries, and clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Firebase Hosting (CDN)                       │
│              Static SPA (HTML/CSS/JS) + Service Worker           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    Cloud Run (Backend API)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ Auth     │  │ Permit   │  │ Approval │  │ Escalation      │ │
│  │ Middleware│  │ Service  │  │ Engine   │  │ Scheduler       │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ Notif    │  │ GPS      │  │ PDF      │  │ RBAC            │ │
│  │ Service  │  │ Service  │  │ Generator│  │ Enforcer        │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌──────────────┐  ┌──────────┐  ┌──────────────┐
│ Cloud SQL    │  │ Cloud    │  │ Secret       │
│ (PostgreSQL) │  │ Storage  │  │ Manager      │
│ or Firestore │  │ (Photos) │  │              │
└──────────────┘  └──────────┘  └──────────────┘
```

## 2. Component Diagram

### Frontend (Firebase Hosting)
- **Technology**: Vite + vanilla JS/HTML/CSS (preserving zero-framework philosophy)
- **Hosting**: Firebase Hosting with CDN, automatic SSL, custom domain
- **Purpose**: Serves the SPA; all business logic executes via API calls to Cloud Run

### Backend API (Cloud Run)
- **Technology**: Node.js (Express or Fastify)
- **Container**: Single Cloud Run service with automatic scaling (0 to N instances)
- **Modules**:
  - `auth/` — Firebase Auth token verification middleware
  - `permits/` — CRUD, state machine transitions, approval chain engine
  - `notifications/` — In-app notification dispatch and query
  - `escalation/` — Cloud Scheduler triggered SLA monitoring
  - `pdf/` — Server-side jsPDF generation (more reliable than client-side)
  - `geofence/` — Haversine validation and project site management
  - `rbac/` — Centralized permission engine (`can()`, `roleCanActOnChain()`)

### Database
- **Option A (Recommended): Cloud Firestore** — Document-based; natural fit for permit schema that varies per type; real-time listeners for notification updates
- **Option B: Cloud SQL (PostgreSQL)** — Relational; better for complex reporting queries; requires schema migrations

### Storage (Cloud Storage)
- **Bucket**: `arpl-ehs-media-{env}`
- **Structure**: `/{projectId}/{permitId}/site-photo.jpg`, `/signatures/`, `/drawings/`
- **Access**: Signed URLs for upload/download; IAM service account access from Cloud Run

## 3. Authentication Flow

```
User Login (Email/Password or SSO)
        │
        ▼
Firebase Authentication (Client SDK)
        │
        ▼
ID Token (JWT) → attached to every API request
        │
        ▼
Cloud Run Middleware → verifies token with Firebase Admin SDK
        │
        ▼
Extract uid + custom claims (role, projectId)
        │
        ▼
RBAC Enforcer → validates role against requested action
```

**Why Firebase Auth even in GCP-first**: Firebase Auth is the most cost-effective managed identity service in GCP ecosystem. It handles email/password, SSO, and custom claims without requiring a separate identity provider.

## 4. Authorization Flow

Custom claims set on Firebase Auth user tokens:
```json
{
  "role": "site-engineer",
  "projectIds": ["PRJ-AGR", "PRJ-ABP"],
  "org": "ARPL"
}
```

Every API endpoint validates:
1. Token is valid and not expired
2. User role matches required role for the operation
3. User has access to the target project
4. `roleCanActOnChain()` validates stage-specific authorization

## 5. Data Flow

```
SPA → API Request (POST /api/permits/:id/approve)
  │     Headers: Authorization: Bearer <Firebase ID Token>
  │     Body: { comment, gps: {lat, lng}, signature: <base64> }
  │
  ▼
Cloud Run → Validate Token → Extract Role → Check RBAC
  │
  ▼
Load Permit from Firestore/SQL → Validate State Machine Transition
  │
  ▼
Execute chainStage() → roleCanActOnChain() → actOnChain()
  │
  ▼
Write Updated Permit → Append Activity Log → Emit Notification
  │
  ▼
Return Updated Permit Status → SPA Re-renders
```

## 6. Background Processing

### Escalation Engine
- **Cloud Scheduler** triggers a Cloud Run endpoint every 60 seconds (production SLA)
- Endpoint scans all permits in `Pending` states
- Evaluates SLA thresholds (2h Stage 1, 4h Stage 2)
- Creates escalation notifications for appropriate roles
- Updates escalation flags on permit documents

### Auto-Expiry
- Same scheduled endpoint checks `Active` permits against `validTill`
- Triggers T-30 warning, natural expiry, or emergency auto-cancel

### Why Cloud Scheduler + Cloud Run (not Cloud Tasks)
- Simpler architecture; single cron job vs individual task queues
- The tick engine processes all permits in one pass (same as current implementation)
- Cloud Tasks would be needed only if per-permit individual timers are required at scale

## 7. File Upload Flow

```
SPA captures photo/signature → generates preview
  │
  ▼
Request signed upload URL from Cloud Run API
  │
  ▼
Cloud Run generates GCS Signed URL (PUT, 5min expiry)
  │
  ▼
SPA uploads directly to Cloud Storage via signed URL
  │
  ▼
Cloud Run records GCS object path in permit document
```

## 8. Error Handling
- All API endpoints return structured error responses: `{ error: string, code: string, details?: any }`
- HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden/RBAC), 404 (not found), 409 (state conflict), 500 (server)
- Activity log records all errors with IST timestamp

## 9. Logging
- **Cloud Logging** (Stackdriver) — automatic with Cloud Run
- Structured JSON logs with correlation IDs
- Log levels: DEBUG, INFO, WARN, ERROR

## 10. Monitoring
- **Cloud Monitoring** — automatic metrics for Cloud Run (latency, error rate, instance count)
- Custom metrics: permits created/day, approvals/day, escalation count, SLA breach rate
- Dashboard: Cloud Monitoring console

## 11. Security
- HTTPS enforced everywhere (Firebase Hosting + Cloud Run)
- Firebase Auth tokens verified server-side
- RBAC enforced in middleware before any business logic
- Input validation with schema validators (Joi/Zod)
- escapeHtml() for any user content rendered in PDFs
- CORS configured to allow only Firebase Hosting domain
- Cloud Storage IAM: service account access only (no public buckets)
- Secret Manager for API keys, database credentials
- No secrets in source code or environment variables

## 12. Deployment (CI/CD)

```
Code Push to GitHub
  ↓
Cloud Build Trigger
  ↓
Run Linting + Unit Tests
  ↓
Build Docker Image → Push to Artifact Registry
  ↓
Deploy to Cloud Run (Staging)
  ↓
Run Integration Tests against Staging
  ↓
Manual Approval Gate
  ↓
Deploy to Cloud Run (Production)
  ↓
Deploy Frontend to Firebase Hosting (Production)
```

## 13. Disaster Recovery
- Firestore: automatic 7-day point-in-time recovery
- Cloud SQL: automated backups, cross-region replicas (if needed)
- Cloud Storage: versioning enabled, lifecycle policies
- Cloud Run: multi-region deployment possible

## 14. Cost Considerations

### MVP (Low Traffic: <100 permits/day)
| Service | Estimated Monthly Cost |
|---|---|
| Firebase Hosting | Free tier (10 GB storage, 360 MB/day transfer) |
| Firebase Auth | Free tier (50K MAU) |
| Cloud Run | Free tier (2M requests, 360K vCPU-seconds) |
| Firestore | Free tier (50K reads, 20K writes, 1 GiB storage/day) |
| Cloud Storage | ~$0.02/GB/month |
| Cloud Scheduler | Free tier (3 jobs) |
| Secret Manager | Free tier (6 secret versions) |
| **Total MVP** | **~$0-5/month** |

### Production (Moderate: 100-1000 permits/day)
| Service | Estimated Monthly Cost |
|---|---|
| Cloud Run | $10-30 |
| Firestore | $5-25 |
| Cloud Storage (photos) | $2-10 |
| Cloud Scheduler | $0.10 |
| Cloud Logging | $0.50/GB |
| **Total Production** | **~$20-70/month** |

### Scale (High: 1000+ permits/day)
- Cloud Run auto-scales; costs proportional to request volume
- Firestore scales automatically; consider read optimization
- Total: $100-500/month depending on volume

---

## Service Selection Details

### Cloud Run
- **Purpose**: Run backend API
- **Requirement**: REST API, business logic, state machine, RBAC
- **Why selected**: Container-based serverless with auto-scaling 0-to-N; supports complex multi-module backend
- **Alternative**: Cloud Functions
- **Why not alternative**: Backend has 10+ interdependent modules sharing state; Cloud Functions better for isolated event handlers
- **MVP required**: Yes
- **Cost driver**: vCPU-seconds and request count

### Firestore (Recommended DB)
- **Purpose**: Primary permit and notification storage
- **Requirement**: Flexible schema for 10 different permit type structures
- **Why selected**: Document model naturally fits permit objects with type-varying approval chains; real-time listeners enable live notification updates; automatic scaling; no schema migrations
- **Alternative**: Cloud SQL (PostgreSQL)
- **Why not alternative**: Permit schema varies significantly per type (3-8 approval stages, different checklist lengths, type-specific parameters); relational model would require complex JSONB columns or excessive normalization
- **MVP required**: Yes
- **Cost driver**: Read/write operations and storage

### Cloud Storage
- **Purpose**: Photos, signatures, drawings, PDF storage
- **Requirement**: Secure file storage with controlled access
- **Why selected**: Native GCS; signed URLs; lifecycle management; cost-effective blob storage
- **Alternative**: Firebase Storage
- **Why not alternative**: Firebase Storage is a wrapper around GCS; in GCP-first approach, direct GCS provides more control
- **MVP required**: Yes
- **Cost driver**: Storage GB and egress

### Firebase Auth
- **Purpose**: User authentication and identity management
- **Requirement**: Secure login for 16 role types across multiple projects
- **Why selected**: Most cost-effective managed auth in GCP; supports email/password + SSO; custom claims for roles
- **Alternative**: Cloud Identity Platform (same underlying tech, enterprise features)
- **Why not alternative**: Identity Platform costs more; Firebase Auth sufficient for this scale
- **MVP required**: Yes
- **Cost driver**: Free up to 50K MAU

### Cloud Scheduler
- **Purpose**: Trigger escalation engine and auto-expiry checks
- **Requirement**: Periodic SLA monitoring (every 60s in production)
- **Why selected**: Managed cron service; invokes Cloud Run HTTP endpoint
- **Alternative**: Cloud Tasks for individual permit timers
- **Why not alternative**: Batch processing (scan all permits per tick) is simpler and sufficient
- **MVP required**: Yes
- **Cost driver**: Negligible ($0.10/month for 1 job)

### Secret Manager
- **Purpose**: Store API keys, service account credentials
- **Requirement**: No hardcoded secrets
- **Why selected**: Native GCP secret management; automatic rotation; Cloud Run integration
- **MVP required**: Yes
- **Cost driver**: Free tier covers needs
