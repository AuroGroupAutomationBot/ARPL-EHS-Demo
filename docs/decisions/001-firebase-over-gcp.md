# ADR 001: Firebase-First over GCP-First Architecture

## Status
**Accepted** (2026-09-25)

## Context
The ARPL EHS Permit-to-Work (PTW) system requires deployment at active construction sites. A critical constraint identified during requirements gathering is that construction environments (deep basements, lift shafts, remote earthworks) have highly intermittent and unreliable network connectivity. 

We evaluated two primary architectures:
1. **GCP-First**: Cloud Run backend (Node.js API) with Cloud SQL (PostgreSQL).
2. **Firebase-First**: Cloud Firestore with Cloud Functions for Firebase.

## Decision
We decided to adopt the **Firebase-First Architecture** utilizing Cloud Firestore, Firebase Auth, and Firebase Storage. 

## Rationale
1. **Offline Persistence**: Firestore's client SDKs (`enableIndexedDbPersistence()`) provide robust, out-of-the-box offline support. Users can load the app, walk into a basement without signal, fill out a 20-point safety checklist, sign it, and submit it. The SDK queues the mutation locally and automatically syncs it when the device reconnects to a cellular network. Building a reliable offline sync engine over a traditional REST API (GCP-First) would add months of engineering complexity.
2. **Real-Time Data**: The multi-stage approval workflows require immediate UI updates (e.g., when a Site Engineer approves, the Tower Incharge must instantly see it). Firestore's `onSnapshot` handles this natively without the need to provision, scale, and secure custom WebSocket servers.
3. **Cost Efficiency at Scale-to-Zero**: For a construction site MVP, the system operates entirely within the generous Firebase free tiers. Cloud SQL requires fixed, non-zero provisioning costs even when idle.

## Consequences
- **Positive**: Drastically reduced time-to-market. High reliability for site workers in low-connectivity zones. Zero idle database costs.
- **Negative**: Firestore document read costs scale linearly. We must heavily optimize read queries (limit sizes, avoid runaway listeners) to prevent massive billing spikes at high scale (100,000+ users).
- **Negative**: Vendor lock-in to Firebase's proprietary SDKs and NoSQL querying limitations (e.g., no complex `JOIN` queries).
