# Decision 003 — Route Workers AI through AI Gateway

- **Date:** 2026-08-20
- **Status:** active
- **Related:** decisions/001 (telemetry), experiments/001 (tournament)

## Context / problem

We had no way to see model conversations: `/api/generate` returns text to the caller and deliberately persists only metadata. The question was whether AI Gateway's logging earns its keep or duplicates what M2 organizational memory will provide.

## Evidence (official pricing/limits pages, 2026-08-20)

Core features — request/response logging, analytics, caching, rate limiting — are free on all plans, no per-request fee; inference bills unchanged. Free allowance: 100,000 logs account-wide, 10 MB/log, configurable at cap (delete-oldest or stop-logging); requests never fail from log limits. Paid features (Logpush, Guardrails, Unified Billing) are not used. At the policy-capped 500 calls/day, 100k logs ≥ a 200-day rolling window.

## Decision

Adopt. Route all `env.AI.run` calls through gateway `aint` (one options argument in the provider seam). Configure the gateway to **delete oldest** at the cap. This is a debugging/observability window, not organizational memory — M2 remains the durable, provenance-carrying record; the gateway does not substitute for it.

## Cost / blast radius

$0. Gateway logs include prompts/responses from the public endpoint; these are operational logs in our own account, subject to the same posture as Workers Logs. No new secrets.

## Reversibility

Remove the options argument; calls revert to direct Workers AI. Logs expire with the rolling window.

## Revisit when

- Log volume approaches the account cap or a second gateway consumer appears.
- M2 lands: decide whether gateway logging remains useful or becomes noise.
- Caching/rate-limiting features become relevant (they'd get their own decision).

## Bootstrap debt note

Gateway creation is a dashboard action (human checkpoint D-series pattern): no public API path exists from our current credentials. One-time click; recorded here rather than a new ledger entry.
