# Decision 001 — Telemetry mechanism for V0

- **Date:** 2026-08-20
- **Status:** active
- **Related:** issue [#4](https://github.com/gmale/aint/issues/4), [experiments/000](../experiments/000-cloudflare-free-tier-verification.md)

## Context / problem

V0 needs machine-readable telemetry (requests, latency, failures, model calls, quota-relevant counts) at $0, without building an observability platform (`bootstrap/BOOTSTRAP.md` §V0 target 3).

## Alternatives considered

| Option | Verdict | Reason (verified free limits, 2026-08-20) |
|---|---|---|
| Workers KV counters | rejected | 1,000 writes/day — disqualifying for per-request writes |
| D1 event rows | rejected for events | 100k writes/day is shared budget future org state (M2) will need; row-per-request burns it |
| Workers Analytics Engine | **adopted for events** | purpose-built, 100k data points/day free, currently unbilled, 3-month retention |
| Durable Object (SQLite) counters | **adopted for aggregates** | free plan, durable daily counters, enables a read endpoint without secrets |
| Workers Logs / observability flag | kept enabled | free tier; logs are diagnostics, not metrics |

## Decision

Hybrid: **Analytics Engine** dataset (`aint_requests`) captures one data point per request (path, method, outcome, status, latency). A single **Durable Object** (`TelemetryCounters`, SQLite) keeps small daily aggregate counters and serves `/api/telemetry`.

Rationale for the hybrid: Analytics Engine is write-only from a Worker — reading it requires the SQL-over-REST API with an API token we have not provisioned (deliberately: fewer secrets in V0). The DO gives a live, secretless read path; AE retains the granular events for later analysis once a scoped read token is justified (recorded as bootstrap-debt candidate for #8).

## Cost / blast radius

$0 at V0 traffic. Both mechanisms fail closed per experiments/000 §14. Telemetry writes are `waitUntil`-deferred and error-swallowed: telemetry failure must never fail a user request.

## Reversibility

Both sit behind `app/src/telemetry.ts` (`recordRequest` seam). Either half can be replaced independently; AE data expires in 3 months by design.

## Revisit when

- Console (M1) needs richer queries than daily counters → provision a scoped AE read token (governed secret addition).
- Traffic approaches 100k requests/day (AE point-per-request and DO request limits begin to bind).
- Model-call telemetry (V0.5) or build events need structure the current schema can't hold.
