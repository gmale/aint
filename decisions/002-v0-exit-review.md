# Decision 002 — V0 Exit Review and Completion Report

- **Date:** 2026-08-20
- **Status:** active
- **Decision:** V0 exit conditions are met. V0 is complete. V1 is **not** declared.

## Exit conditions verified (`bootstrap/ROADMAP.md`, `bootstrap/ARCHITECTURE.md`)

| Condition | Evidence |
|---|---|
| Normal source changes flow through the canonical repo/build path | Commit `024ec72` pushed to `main` → Workers Builds → live in ~30 s |
| Cloud deployment needs no uniquely credentialed local machine | Live health reports `builder: workers-builds` (was `local` for manual deploys); laptop token unused in the canonical path |
| Cloud-hosted health/status exists | `GET /api/health`: build identity, deployment identity, policy version, per-dependency reachability, 503 on degraded |
| Humans and agents share a common source/evidence path | Public repo; PRs available; issues #1–#9 carry the evidence trail; direct-push-to-main remains as debt D3 |
| Remaining manual/credentialed bootstrap documented | `decisions/BOOTSTRAP_DEBT.md` (D1–D6) |

## Completion report (`bootstrap/BOOTSTRAP.md` §Completion report)

### Deployed URLs / resources

- Worker `aint` on account `KVG Cloudflare` (237ac99e…): <https://aint.aint-app.workers.dev>
- Endpoints: `/` (static status page), `/api/health`, `/api/telemetry`, `POST /api/generate`
- Resources: Workers Static Assets; Durable Object `TelemetryCounters` (SQLite); Analytics Engine dataset `aint_requests`; Workers AI (`@cf/meta/llama-3.2-1b-instruct`); Workers Builds ↔ `gmale/aint` path `app/`, build caching on.

### Functioning

Push-to-deploy pipeline; health with build/deploy identity; request + model-call telemetry (AE events + DO counters, secretless read path); policy microkernel v0.1.0 (tier=free, paid denied, consulted before inference) surfaced in health; production inference measured (301 ms, 77 tokens).

### Remaining local/manual

Strategic work happens in a local frontier-agent session (expected during early V1). Break-glass deploys possible via laptop wrangler OAuth (D2). GitHub/Cloudflare dashboards remain human-operated (D1/D4).

### Credential/authority dependencies

See `decisions/BOOTSTRAP_DEBT.md` D1–D6. No durable secrets exist in source, prompts, or Worker config; the first secret (AE read token, D5) was deliberately deferred.

### Verified free-tier constraints used

`experiments/000-cloudflare-free-tier-verification.md` (2026-08-20). Load-bearing: Workers 100k req/day and 10 ms CPU; AE 100k points/day; DO-SQLite free availability; Workers AI 10k neurons/day hard-stop; Workers Builds 3,000 min/month; all overages fail closed.

### Resource usage observed

Rounding error on every quota: single-digit requests/day, 3 model calls (~200 neurons total), 3 builds (≈3 build-minutes), storage a few KB. $0 spent; no paid activation.

### Security/bootstrap debts

D1–D6 in the ledger. Most significant: **D3** (push to `main` = production deploy, no branch protection) and **D4** (single human owner for both platform accounts).

### Recommended first V1 milestone

**M1 — Console foundation** (`bootstrap/ROADMAP.md`), scoped in issue #10: evolve the static page into health + freshness + resource envelope + build/deploy status, backed by the existing health/telemetry APIs. Suggested first M1 decisions: whether to provision the AE read token (D5) and whether to add branch protection (start of D3 reduction) — both small, high-leverage, and evidence-backed.

## Reversibility

This record declares state, grants nothing, and changes no authority. Reversal is a successor record with contrary evidence.
