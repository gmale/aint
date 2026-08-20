# Experiment 000 — Cloudflare Free-Tier Verification

- **Date:** 2026-08-20
- **Performed by:** research subagent (web verification against official docs), reviewed by primary bootstrap agent
- **Status:** complete
- **Related issue:** [#1](https://github.com/gmale/aint/issues/1)

## Objective and hypothesis

Per `bootstrap/BOOTSTRAP.md` §Verify before relying: verify every temporally unstable Cloudflare fact V0 depends on against current official documentation before creating resources. Hypothesis: the free envelope is sufficient for the full V0 target (static UI, Worker API, health, telemetry, one model call, Git-triggered deploys).

**Result: hypothesis confirmed.** Every V0 component fits the verified free tier with large margins.

## Method

All facts read directly from `developers.cloudflare.com` on **2026-08-20**. No third-party sources. Facts that could not be verified are listed at the end and must not be relied upon.

## Verified constraints

### 1. Workers Free plan
- Requests: **100,000/day** (resets 00:00 UTC). Exceeding → Error 1027; fail open/closed configurable.
- CPU: **10 ms per invocation**. Memory: 128 MB. Worker size: 3 MB gzip. Subrequests: 50/request; 6 simultaneous connections. 100 Workers/account.
- Sources: <https://developers.cloudflare.com/workers/platform/limits/>, <https://developers.cloudflare.com/workers/platform/pricing/>

### 2. Static assets on Workers
- Recommended mechanism: **Workers Static Assets** (`assets` block in wrangler config). Static asset requests are **free and unlimited**; no storage cost. 20,000 files/version, 25 MiB/file.
- Pages is not deprecated, but official guidance: *"If you are starting a new project, use Workers instead of Pages."* → **V0 uses Workers Static Assets, not Pages.**
- On Free plan, exhausted Worker limits on `run_worker_first` routes return 429 rather than falling back to assets.
- Sources: <https://developers.cloudflare.com/workers/static-assets/>, <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>, <https://developers.cloudflare.com/workers/best-practices/workers-best-practices/>

### 3. Workers Builds (Git integration)
- **Free plan: available.** 3,000 build minutes/month, 1 concurrent build, 20-minute build timeout.
- Deploys on push to the connected branch; other branches get preview builds (`wrangler versions upload`).
- **Monorepo/subdirectory supported**: per-Worker root directory (location of `wrangler.jsonc`) + build watch paths. → Our app can live in a subdirectory of this repo.
- Sources: <https://developers.cloudflare.com/workers/ci-cd/builds/>, <https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/>, <https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/>

### 4. Workers AI
- **10,000 Neurons/day free** (both plans). On Workers Free, exhaustion = **hard error, no billing**.
- Verified small text-gen candidates: `@cf/meta/llama-3.2-1b-instruct` ($0.027/M in, $0.20/M out), `@cf/meta/llama-3.2-3b-instruct` ($0.051/M in, $0.34/M out), `@cf/ibm-granite/granite-4.0-h-micro` ($0.017/M in, $0.11/M out), `@cf/meta/llama-3.1-8b-instruct-fast` (price unverified).
- Some catalog models are paid-only (e.g. `@cf/moonshotai/kimi-k2.6`, `@cf/zai-org/glm-5.2`, `@cf/deepseek-ai/deepseek-v4-*`) — **excluded from V0**.
- Sources: <https://developers.cloudflare.com/workers-ai/platform/pricing/>, <https://developers.cloudflare.com/workers-ai/models/>

### 5. Durable Objects
- **Free plan: available, SQLite backend only.** 100,000 requests/day; 13,000 GB-s duration/day; 5M rows read/day; 100k rows written/day; 5 GB storage.
- Source: <https://developers.cloudflare.com/durable-objects/platform/pricing/>

### 6. D1
- 5M rows read/day; 100k rows written/day; 5 GB storage. Exceeding → queries fail (hard stop).
- Source: <https://developers.cloudflare.com/d1/platform/pricing/>

### 7. R2
- 10 GB-month storage; 1M Class A + 10M Class B ops/month; **egress free**.
- Source: <https://developers.cloudflare.com/r2/pricing/>

### 8. Vectorize
- 30M queried vector dimensions/month; 5M stored dimensions; 100 indexes. Included in Workers Free.
- Sources: <https://developers.cloudflare.com/vectorize/platform/pricing/>, <https://developers.cloudflare.com/vectorize/platform/limits/>

### 9. Queues
- **Now available on Free plan** (formerly paid-only): 10,000 operations/day; retention fixed at 24 h.
- Sources: <https://developers.cloudflare.com/queues/platform/pricing/>, <https://developers.cloudflare.com/queues/platform/limits/>

### 10. Cron Triggers
- Free plan: **5 Cron Triggers per account** (not per Worker) — budget these carefully. Changes propagate in ≤15 min.
- Sources: <https://developers.cloudflare.com/workers/platform/limits/>, <https://developers.cloudflare.com/workers/configuration/cron-triggers/>

### 11. Workers KV
- 100k reads/day but only **1,000 writes/day**, 1 GB storage. → **Unsuitable for telemetry writes.**
- Source: <https://developers.cloudflare.com/kv/platform/pricing/>

### 12. Workers Analytics Engine
- Currently unbilled. Free plan: **100,000 data points written/day**, 10,000 read queries/day; 250 points/invocation; 20 blobs + 20 doubles + 1 index per point; 3-month retention.
- → **Primary telemetry candidate** (100× KV's write budget at $0).
- Sources: <https://developers.cloudflare.com/analytics/analytics-engine/pricing/>, <https://developers.cloudflare.com/analytics/analytics-engine/limits/>

### 13. Machine-friendly documentation surfaces
- `llms.txt` / `llms-full.txt` site-wide and per-product (e.g. <https://developers.cloudflare.com/workers/llms.txt>).
- Any docs page as Markdown: append `/index.md` or send `Accept: text/markdown`.
- Docs MCP server: `https://docs.mcp.cloudflare.com/mcp`; full-API MCP: `https://mcp.cloudflare.com/mcp`; domain-specific servers (bindings, builds, observability). Catalog: <https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/>
- Hub: <https://developers.cloudflare.com/docs-for-agents/>

### 14. Free-plan overage behavior
- No single blanket statement exists, but per-product docs consistently document **fail-closed** behavior (operations error out; no automatic billing). Paid features require explicit upgrade ($5/month minimum).
- → Matches `bootstrap/ECONOMICS.md` Phase Free requirement to fail closed rather than bill.

## Implications for V0 (input to decisions)

1. **App layout:** Worker + Workers Static Assets in a repo subdirectory; Workers Builds with root-directory config (no Pages).
2. **Telemetry:** Analytics Engine for high-volume events; D1/DO-SQLite for small durable state. KV write cap disqualifies it.
3. **Model:** start with `@cf/meta/llama-3.2-1b-instruct` or `granite-4.0-h-micro` behind the provider seam; policy kernel treats Workers AI exhaustion as a normal fail-closed condition.
4. **Cron:** only 5/account — treat cron slots as a scarce resource in policy.
5. **Docs access for agents:** prefer `llms.txt` / `/index.md` surfaces and the docs MCP server for future autonomous research.

## Uncertainty / limitations

Not verifiable from official sources on 2026-08-20 (do not rely on these):

- Price of `@cf/meta/llama-3.1-8b-instruct-fast`.
- Behavior when Free-plan Workers Builds minutes (3,000/month) are exhausted.
- Whether R2 activation requires a payment method on file for free accounts.
- Minimum cron interval; D1 database-count limit on Free.
- A global guarantee that free accounts can never be billed (documented per-product only).

## Decision / next

Proceed to V0.2 scaffold using the layout in Implications §1. Re-verify any constraint before a component starts depending on it in a new way; this record supersedes any numbers implied elsewhere in the repository as of its date.
