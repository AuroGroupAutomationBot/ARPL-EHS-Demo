# CONFIRMED Architecture: Firebase-First

> **STATUS: CONFIRMED** — This is the selected production architecture.

## Confirmed Design Parameters

| Decision | Confirmed Choice |
|---|---|
| **Architecture** | Firebase-First |
| **Authentication** | Email/Password (Firebase Auth) |
| **User-Project Assignment** | Admin pre-assigns users to projects |
| **Offline Support** | Enabled (Firestore offline persistence) |
| **Implementation Scope** | All 10 permit types (PTW-001 to PTW-010) + Sunday Work Tile |

## 1. Architecture Overview

This architecture uses **Firebase as the primary backend**, leveraging Firestore, Firebase Auth (email/password), Firebase Storage, and Cloud Functions for Firebase. Offline persistence is enabled via Firestore's `enableIndexedDbPersistence()` for construction site connectivity resilience.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Firebase Hosting (CDN)                       │
│              Static SPA (HTML/CSS/JS) + Service Worker           │
└──────────┬──────────────────────┬───────────────────────────────┘
           │                      │
     Client SDK              Client SDK
           │                      │
           ▼                      ▼
┌──────────────────┐    ┌─────────────────────┐
│ Firebase Auth    │    │ Cloud Firestore     │
│ (Identity)       │    │ (Primary Database)  │
│                  │    │                     │
│ Email/Password   │    │ permits/            │
│ Custom Claims    │    │ notifications/      │
│ (role, project)  │    │ projects/           │
└──────────────────┘    │ users/              │
                        └────────┬────────────┘
                                 │
                    Security Rules (Server-Side RBAC)
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│              Cloud Functions for Firebase (2nd gen)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ Permit   │  │ Approval │  │ Escalation│  │ PDF             │ │
│  │ Triggers │  │ Validator│  │ Scheduler │  │ Generator       │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘ │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ Notif    │  │ GPS      │                                     │
│  │ Dispatch │  │ Validator│                                     │
│  └──────────┘  └──────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                      ┌──────────────────┐
                      │ Firebase Storage  │
                      │ (Photos, Sigs,   │
                      │  Drawings, PDFs) │
                      └──────────────────┘
```

## 2. Key Architectural Differences from GCP-First

| Aspect | Firebase-First | GCP-First |
|---|---|---|
| **Database Access** | Direct client SDK + Security Rules | API calls to Cloud Run |
| **Backend Logic** | Cloud Functions (event-triggered) | Cloud Run (request-driven) |
| **Authorization** | Firestore Security Rules + Functions | Middleware in Cloud Run |
| **Real-time Updates** | Firestore onSnapshot listeners | Polling or WebSocket from Cloud Run |
| **File Storage** | Firebase Storage SDK (client direct upload) | Signed URLs from Cloud Run API |

## 3. Database Design (Firestore)

### Collection: `permits`
```
permits/{permitId}
  ├── ptype: "excavation" | "hotwork" | ... 
  ├── status: "Draft" | "Pending Site Engineer..." | ...
  ├── projectId: "PRJ-AGR"
  ├── createdBy: <uid>
  ├── createdByRole: "site-supervisor"
  ├── approvals: { kind: "exc", mep: {...}, pm: {...}, ... }
  ├── signatories: { "site-engineer": {...}, ... }
  ├── checklist: [{ ans: "yes", comment: "" }, ...]
  ├── observation: null | { status: "Open", ... }
  ├── extension: null | { status: "pending", ... }
  ├── activityLog: [{ at: "...", text: "...", by: "..." }, ...]
  ├── metadata: { validFrom, validTill, startTime, ... }
  ├── location: { mode, tower, floor, manual, area }
  ├── media: { sitePhoto: "gs://...", drawing: "gs://..." }
  ├── escalation: { stage1: false, stage2: false }
  ├── sundayWork: false
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

### Collection: `notifications`
```
notifications/{notifId}
  ├── roles: ["hw-section-head", "ehs-manager"]
  ├── message: "..."
  ├── severity: "warn"
  ├── permitId: "EXC-2026-000001"
  ├── createdAt: Timestamp
  └── readBy: ["uid1", "uid2"]
```

### Collection: `projects`
```
projects/{projectId}
  ├── name: "Auro Grand Residency"
  ├── towers: ["Tower A", "Tower B", ...]
  ├── site: { lat: 17.4239, lng: 78.4738 }
  ├── radius: 150
  ├── configured: true
  └── tagMethod: "On-Site Tagged"
```

### Collection: `users`
```
users/{uid}
  ├── displayName: "Mohith"
  ├── email: "mohith@arpl.com"
  ├── role: "site-engineer"
  ├── projectIds: ["PRJ-AGR", "PRJ-ABP"]   // Admin pre-assigned
  ├── assignedBy: "admin-uid-001"           // Admin who assigned projects
  ├── assignedAt: Timestamp
  ├── createdAt: Timestamp
  └── lastLogin: Timestamp
```

> **Note**: Users cannot self-select projects. The Administrator uses a dedicated Cloud Function (`assignUserToProject`) to manage the `projectIds[]` array and update Firebase Auth custom claims accordingly.

## 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Get user role from custom claims
    function userRole() {
      return request.auth.token.role;
    }
    
    // Helper: Check if user is stakeholder for a permit
    function isStakeholder(permit) {
      let role = userRole();
      return role == 'admin' 
        || role == 'ehs-manager' 
        || role == 'ehs-officer'
        || role in permit.data.stakeholders;
    }
    
    // Permits: Read restricted to stakeholders, Write via Cloud Functions only
    match /permits/{permitId} {
      allow read: if request.auth != null && isStakeholder(resource);
      allow create: if request.auth != null 
        && userRole() in ['site-supervisor', 'electrician', 'blasting-incharge', 'lift-supervisor']
        && request.resource.data.status == 'Draft';
      // State transitions MUST go through Cloud Functions for validation
      allow update: if false; // Enforced via Cloud Functions callable
      allow delete: if false;
    }
    
    // Notifications: Read by targeted roles only
    match /notifications/{notifId} {
      allow read: if request.auth != null 
        && userRole() in resource.data.roles;
      allow update: if request.auth != null; // For marking read
      allow create, delete: if false; // Only Cloud Functions
    }
    
    // Projects: Read by all authenticated, Write by admin only
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && userRole() == 'admin';
    }
    
    // Users: Read own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Admin API only
    }
  }
}
```

## 5. Cloud Functions Architecture

### Critical Design Decision
**State transitions and approval logic MUST execute in Cloud Functions, not client-side.** This prevents:
- Client-side RBAC bypass
- State machine manipulation
- Signature forgery
- Unauthorized approval injection

### Function Catalog

#### Callable Functions (Client-invoked)
```typescript
// Permit lifecycle operations
exports.submitPermit = onCall(async (data, context) => { ... });
exports.approvePermitStage = onCall(async (data, context) => { ... });
exports.rejectPermitStage = onCall(async (data, context) => { ... });
exports.acknowledgeSiteEngineer = onCall(async (data, context) => { ... });
exports.acknowledgeBlastingIncharge = onCall(async (data, context) => { ... });
exports.closeAndSurrenderPermit = onCall(async (data, context) => { ... });

// Observation operations
exports.raiseObservation = onCall(async (data, context) => { ... });
exports.respondToObservation = onCall(async (data, context) => { ... });
exports.resolveObservation = onCall(async (data, context) => { ... });

// Extension operations
exports.requestExtension = onCall(async (data, context) => { ... });
exports.approveExtension = onCall(async (data, context) => { ... });

// PDF generation
exports.generatePermitPDF = onCall(async (data, context) => { ... });

// Admin operations
exports.configureGeofence = onCall(async (data, context) => { ... });
```

#### Triggered Functions (Event-driven)
```typescript
// On permit status change, dispatch notifications
exports.onPermitUpdate = onDocumentUpdated("permits/{permitId}", async (event) => {
  // Compare before/after status
  // Dispatch role-targeted notifications
  // Update dashboard counters
});

// Scheduled: Escalation engine (every 60 seconds)
exports.escalationTick = onSchedule("every 1 minutes", async (event) => {
  // Scan all Pending permits for SLA breaches
  // Scan all Active permits for expiry
  // Dispatch escalation notifications
});

// On user creation, set custom claims
exports.onUserCreate = beforeUserCreated(async (event) => {
  // Look up user role from users collection
  // Set custom claims
});
```

## 6. Authentication Flow (Email/Password — Confirmed)

```
Admin creates user via Cloud Function:
  createUser({ email, displayName, role, projectIds })
        │
        ▼
Firebase Auth creates account + sets custom claims:
  { role: "site-engineer", projectIds: ["PRJ-AGR"] }
        │
        ▼
User receives credentials → logs in:
  signInWithEmailAndPassword(auth, email, password)
        │
        ▼
Firebase returns ID Token with custom claims
        │
        ├─── Firestore Security Rules validate on every read/write
        │
        ├─── Cloud Functions verify via context.auth on every call
        │
        └─── Client reads user.projectIds to scope project selector
```

### Admin User Management Cloud Functions
```typescript
// Create a new user with role and project assignment
exports.createUser = onCall(async (data, context) => {
  // Verify caller is admin
  if (context.auth?.token.role !== 'admin') throw new HttpsError('permission-denied');
  
  // Create Firebase Auth user
  const user = await auth.createUser({ email: data.email, password: data.tempPassword });
  
  // Set custom claims (role + projects)
  await auth.setCustomUserClaims(user.uid, {
    role: data.role,
    projectIds: data.projectIds
  });
  
  // Create user document in Firestore
  await db.collection('users').doc(user.uid).set({
    displayName: data.displayName,
    email: data.email,
    role: data.role,
    projectIds: data.projectIds,
    assignedBy: context.auth.uid,
    assignedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  });
});

// Assign/reassign user to projects
exports.assignUserToProject = onCall(async (data, context) => {
  if (context.auth?.token.role !== 'admin') throw new HttpsError('permission-denied');
  
  // Update custom claims
  await auth.setCustomUserClaims(data.uid, {
    ...existingClaims,
    projectIds: data.projectIds
  });
  
  // Update Firestore
  await db.collection('users').doc(data.uid).update({
    projectIds: data.projectIds,
    assignedBy: context.auth.uid,
    assignedAt: FieldValue.serverTimestamp()
  });
});
```

## 7. Real-Time Updates (Key Firebase Advantage)

```javascript
// Client-side: Live permit updates
const q = query(
  collection(db, 'permits'),
  where('stakeholders', 'array-contains', currentUser.role),
  orderBy('updatedAt', 'desc')
);

onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'modified') {
      // Re-render permit in register/dashboard
      updatePermitUI(change.doc.data());
    }
  });
});

// Client-side: Live notifications
const nq = query(
  collection(db, 'notifications'),
  where('roles', 'array-contains', currentUser.role),
  orderBy('createdAt', 'desc'),
  limit(50)
);

onSnapshot(nq, (snapshot) => {
  // Update notification badge count
  // Render new notifications in drawer
});
```

This is a **significant advantage** of the Firebase-first architecture: real-time multi-user synchronization without WebSocket infrastructure.

## 7.1 Offline Persistence (Confirmed Required)

Construction sites frequently experience intermittent connectivity. Firestore's built-in offline persistence ensures the system remains fully operational:

### Initialization
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence on app initialization
try {
  await enableIndexedDbPersistence(db);
  console.log('Offline persistence enabled');
} catch (err) {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open; persistence can only be enabled in one tab at a time
    console.warn('Offline persistence unavailable: multiple tabs detected');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Offline persistence unavailable: browser not supported');
  }
}
```

### Offline Behavior
| Operation | Offline Behavior | On Reconnect |
|---|---|---|
| **Read permits** | Served from IndexedDB cache | Auto-refreshed with server state |
| **Create draft permit** | Written to local cache immediately | Auto-synced to Firestore |
| **Approve/reject** (via Cloud Function) | Queued; user notified of pending sync | Executed on reconnect; conflicts resolved |
| **View notifications** | Cached notifications displayed | New notifications streamed in |
| **Photo upload** | Queued in Firebase Storage offline queue | Auto-uploaded on reconnect |
| **GPS capture** | Captured and stored locally | Attached to permit on sync |

### Conflict Resolution
- Firestore uses **last-writer-wins** for document fields
- Cloud Functions enforce state machine validation on sync — if an offline approval conflicts with a server state change, the Cloud Function rejects it and the user is prompted to refresh
- Activity logs use `arrayUnion()` to merge offline and online entries without data loss

## 8. File Upload Flow (Firebase Storage)

```javascript
// Client-side direct upload
const storageRef = ref(storage, `permits/${permitId}/site-photo.jpg`);

// Upload with progress tracking
const uploadTask = uploadBytesResumable(storageRef, file, {
  customMetadata: { uploadedBy: currentUser.uid, permitId }
});

uploadTask.on('state_changed', 
  (snapshot) => { /* progress */ },
  (error) => { /* handle error */ },
  async () => {
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    // Record URL in permit document via Cloud Function
  }
);
```

### Firebase Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /permits/{permitId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024  // 5MB max
        && request.resource.contentType.matches('image/.*');
    }
    match /pdfs/{permitId}/{fileName} {
      allow read: if request.auth != null
        && request.auth.token.role in ['ehs-manager', 'ehs-officer'];
      allow write: if false; // Only Cloud Functions
    }
  }
}
```

## 9. Error Handling
- Cloud Functions return structured errors via `HttpsError`
- Client SDK catches and displays user-friendly messages
- All errors logged to Cloud Logging automatically

## 10. Logging and Monitoring
- **Cloud Logging** — automatic for all Cloud Functions
- **Firebase Performance Monitoring** — client-side latency tracking
- **Firebase Crashlytics** — client-side error reporting (if using Firebase JS SDK)
- **Cloud Monitoring** — Cloud Functions metrics (invocations, errors, latency)

## 11. Security
- Firebase Auth with custom claims for RBAC
- Firestore Security Rules as first-line defense
- Cloud Functions as second-line validation (business logic)
- Firebase App Check for API abuse prevention
- Firebase Storage Security Rules for file access
- No direct Firestore writes for state transitions (enforced via security rules blocking updates)
- All sensitive operations in Cloud Functions

## 12. Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and select project
firebase login
firebase use arpl-ehs-prod

# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting      # Frontend
firebase deploy --only functions    # Backend logic
firebase deploy --only firestore    # Security rules
firebase deploy --only storage      # Storage rules
```

## 13. Local Development (Firebase Emulator Suite)

```bash
# Start all emulators
firebase emulators:start

# Available emulators:
# - Auth Emulator (localhost:9099)
# - Firestore Emulator (localhost:8080)
# - Functions Emulator (localhost:5001)
# - Storage Emulator (localhost:9199)
# - Hosting Emulator (localhost:5000)
# - Emulator UI (localhost:4000)
```

**Key advantage**: Complete local development without cloud costs or internet connectivity.

## 14. Cost Considerations

### MVP (Low Traffic: <100 permits/day)
| Service | Estimated Monthly Cost |
|---|---|
| Firebase Hosting | Free tier |
| Firebase Auth | Free tier (50K MAU) |
| Cloud Firestore | Free tier (50K reads, 20K writes/day) |
| Firebase Storage | Free tier (5 GB storage, 1 GB/day download) |
| Cloud Functions | Free tier (2M invocations, 400K GB-seconds) |
| **Total MVP** | **$0/month (entirely free tier)** |

### Production (Moderate: 100-1000 permits/day)
| Service | Estimated Monthly Cost |
|---|---|
| Firestore reads/writes | $5-20 |
| Cloud Functions | $5-15 |
| Firebase Storage | $1-5 |
| **Total Production** | **~$11-40/month** |

### Scale (High: 1000+ permits/day)
| Service | Estimated Monthly Cost |
|---|---|
| Firestore | $20-100 |
| Cloud Functions | $15-50 |
| Firebase Storage | $5-20 |
| **Total Scale** | **~$40-170/month** |

## 15. Service Selection Details

### Cloud Firestore
- **Purpose**: Primary database for permits, notifications, projects, users
- **Requirement**: Store 10 permit types with varying schema structures
- **Why selected**: Document model perfectly matches permit objects with type-varying approval chains; real-time listeners enable live multi-user dashboard updates; security rules provide built-in RBAC; automatic scaling with zero configuration
- **Alternative**: Cloud SQL (PostgreSQL)
- **Why not**: Permit schema varies significantly per type; document model eliminates JOIN complexity; real-time sync is a core requirement for multi-user safety operations
- **MVP required**: Yes
- **Cost driver**: Read/write operations

### Cloud Functions for Firebase (2nd gen)
- **Purpose**: Server-side business logic, state machine transitions, RBAC enforcement
- **Requirement**: Secure execution of approval chains, notifications, escalation
- **Why selected**: Native Firebase integration; event-driven triggers for Firestore changes; scheduled functions for escalation; callable functions for client operations
- **Alternative**: Cloud Run
- **Why not**: Cloud Functions provides tighter Firestore integration, simpler deployment (firebase deploy), and event-triggered execution without HTTP routing
- **MVP required**: Yes
- **Cost driver**: Invocation count and compute time

### Firebase Storage
- **Purpose**: Store photos, digital signatures, drawings, generated PDFs
- **Requirement**: Secure file upload/download with access control
- **Why selected**: Client SDK enables direct uploads with progress tracking; security rules enforce access; integrates with Firebase Auth claims
- **Alternative**: Cloud Storage (direct)
- **Why not**: Firebase Storage provides client SDK, security rules, and simpler integration; it wraps GCS anyway
- **MVP required**: Yes
- **Cost driver**: Storage and download bandwidth

### Firebase Auth
- **Purpose**: User authentication and role management
- **Requirement**: Secure login for 16 role types
- **Why selected**: Native Firebase service; custom claims for roles; supports multiple auth providers
- **MVP required**: Yes
- **Cost driver**: Free up to 50K MAU

### Firebase App Check (Future)
- **Purpose**: Protect backend from unauthorized API access
- **Requirement**: Prevent automated attacks and API abuse
- **Why selected**: Native Firebase protection; attestation-based verification
- **MVP required**: No (future hardening)
- **Cost driver**: Free
