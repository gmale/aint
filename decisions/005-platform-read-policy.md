# Decision 005 — Policy v0.3.0: platform-read action class

- **Date:** 2026-08-21
- **Status:** active
- **Related:** #13, OBJ-005, decisions/004, `bootstrap/GOVERNANCE.md` §The policy microkernel

## Context

Anti-Goodhart reconciliation (#13) requires the Worker to read our own account's analytics from `api.cloudflare.com`. Policy v0.2.0 correctly classified any outbound call as `external-call` and denied it — including this one. Expanding authority requires a governed change, not a workaround.

## Decision

Add action class **`platform-read`**: read-only calls to our own platform provider's API using scoped credentials held in Worker secrets. Allowed in v0.3.0. `external-call` (any other external service) **remains forbidden** and remains in the hourly self-test's must-deny set.

## Authority analysis

- Capability: read account analytics. Credential: user-created token, "Read analytics and logs" template, **expires ~2026-12-19** (120-day lease — deliberate, per bus-factor thinking).
- The class is defined by destination (our provider's API), method (read), and credential residence (Worker secret) — not by URL allowlisting yet; tightening to an explicit host allowlist is a natural hardening step if the class grows.
- This change went through the protected PR path (signed commits, PR required) — the policy version bump is itself evidence.

## Blast radius

Token can read analytics/logs for this account; it cannot write, spend, or deploy. Worst case on compromise: account observability data exposure until expiry/revocation.

## Reversibility

Remove the class from `allowedActionClasses` (version bump); revoke the token in dashboard; delete the Worker secret.
