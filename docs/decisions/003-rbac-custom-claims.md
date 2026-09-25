# ADR 003: RBAC via Firebase Custom Claims

## Status
**Accepted**

## Context
The system has 16 distinct roles (Site Engineer, Tower Incharge, EHS Manager, etc.). We need a secure, un-forgeable method to ensure a Site Supervisor cannot approve their own permit by hacking the client-side JavaScript.

## Decision
We decided to enforce Role-Based Access Control (RBAC) using **Firebase Custom Claims** appended to the user's JWT (JSON Web Token), rather than looking up the user's role in a Firestore `users` collection on every request.

## Rationale
1. **Security**: Custom Claims are cryptographically signed by Google. A malicious user cannot alter their token to elevate their privileges.
2. **Performance**: Evaluating Security Rules based on `request.auth.token.role` is instantaneous and costs nothing. If we had to perform a `get()` on a `users` document to check permissions for every permit read/write, our Firestore bill would literally double (one auth read for every data read).
3. **Offline Reliability**: The JWT is cached locally. The user retains their role identity even when the device goes offline.

## Consequences
- **Positive**: Highly secure, massive cost savings on database reads, and perfect offline compatibility.
- **Negative**: Custom claims have a hard 1000-byte size limit. We must be careful not to stuff too much data into them (e.g., storing an array of 50 `projectIds` might hit the limit; we must use project grouping if ARPL scales massively).
- **Negative**: Updating a custom claim (e.g., promoting a user) requires the user to force-refresh their token (log out and log back in) before the new permissions take effect.
