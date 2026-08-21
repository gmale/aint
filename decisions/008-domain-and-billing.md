# Decision 008 — Domain identity and the account becoming billable

- **Date:** 2026-08-21
- **Status:** active
- **Related:** decisions/006 (semi-private posture), `bootstrap/ECONOMICS.md`, `bootstrap/CHARTER.md` §Initial hard constraints

## What changed

The human registered **aintservice.com** and **aintservice.org** via Cloudflare Registrar. This required adding a payment method, so the account moved from *structurally unbillable* (no instrument) to *policy-protected* (instrument exists; billing requires explicit paid-plan activation).

## Invariants that still hold

- Every product remains on a Free plan; free plans fail closed regardless of card presence (experiments/000 §14).
- Paid activation remains forbidden by policy and asserted hourly by the self-test.
- Domain registration renews annually through Registrar billing — a known, bounded, human-approved cost *outside* the "$0 incremental Cloudflare spend" envelope, which refers to metered usage. Interpretation recorded: the founder pays for identity; the system still runs free.

## What the domain unlocks

1. **Canonical identity:** Console at `https://aintservice.com` (Worker custom domain; workers.dev retained as fallback).
2. **Email**: Email Routing enabled on the zone; catch-all `*@aintservice.com` → verified personal inbox. Registrar contact `admin@aintservice.com` now lives under the organization's own name — identity hygiene. Email *Sending* (the Worker sending mail) is a future governed capability.
3. A zone we own, making path-scoped Cloudflare Access clean if/when adopted (the card objection is now moot; the *need* question from decision-time remains).

## Zone-verification deadline

Registrar contact verification must complete within ~14 days of registration or the domain suspends. Tracked as the immediate action; failure mode is loud (domain stops resolving) and recoverable (verify late).

## Reversibility

Domains lapse if unrenewed (annual decision point — a natural lease). Custom domain detaches by config. Email Routing disables per zone.
