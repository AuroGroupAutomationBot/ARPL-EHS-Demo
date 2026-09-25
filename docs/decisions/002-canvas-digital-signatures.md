# ADR 002: HTML5 Canvas Digital Signatures

## Status
**Accepted**

## Context
The PTW workflow requires high-fidelity, legally auditable digital signatures from field personnel (Site Supervisors, Electricians, Crane Operators) directly on their mobile devices. Standard text-based "I Agree" buttons do not satisfy ARPL's stringent health and safety governance requirements.

## Decision
We decided to implement a custom digital signature engine using HTML5 `<canvas>` and `PointerEvents` instead of using a third-party paid signature vendor (like DocuSign) or native mobile code. 

## Rationale
1. **Device Agnostic**: `PointerEvents` natively handle touch, stylus (Apple Pencil), and mouse inputs smoothly across iOS, Android, and Desktop without requiring device-specific libraries.
2. **Cost**: Eliminates per-envelope billing completely. Generating 30 permits a day with 5 signatures each (4,500 signatures/month) via a commercial API would be prohibitively expensive.
3. **Data Sovereignty**: Signatures are captured, converted to `Base64` PNG strings, and uploaded directly to ARPL's Firebase Storage bucket. No third-party system holds the biometric stroke data.
4. **Auditability**: The signature URL is bound to the permit document along with a server-enforced timestamp and the user's GPS coordinates at the time of signing.

## Consequences
- **Positive**: Zero recurring operational cost for capturing signatures. Total data control.
- **Negative**: Engineering overhead to implement high-DPI scaling and stroke interpolation (to prevent jagged lines on high-refresh-rate tablets).
- **Negative**: Canvas context must be carefully managed in the Single Page App memory to avoid leaks when modals are rapidly opened and closed.
