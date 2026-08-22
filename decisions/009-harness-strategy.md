# Decision 009 — Harness strategy: homegrown brain, adopted hands

- **Date:** 2026-08-22
- **Status:** active
- **Related:** experiments/003, decisions/006/007, #28, OBJ-007

## Decision

1. **The Worker loop (`toolloop.ts` + policy kernel) remains the organization's brain.** No framework adoption there: nothing external can execute in the Worker, and the loop's policy/budget fusion is the differentiating asset decision 006 bet on. (The Cloudflare Agents SDK may later be adopted as Durable-Object plumbing/MCP transport — it complements custom loops, not replaces them.)
2. **Heavy coding becomes an Actions-hosted peripheral** (two-tier architecture): the Worker authors a task spec through the existing GitHub broker → a public-repo Actions workflow runs a headless OSS agent pointed at our Workers AI OpenAI-compat endpoint (via AI Gateway, keeping in-account logging) → output is a branch + PR → the existing PR budget and branch protection remain the enforcement boundary → the Worker reads back results, never trusting exit codes alone.
3. **Pilot with mini-swe-agent** (MIT, ~100 auditable lines, bash-only, no native-tool-calling dependency, doubles as the eval harness #14 wants). **goose** is the fuller-featured second track; **opencode** the upgrade path if 24B native tool-calling proves reliable in our own gauntlet.

## Why

Aligned with charter §3 (research before reinvention — adopt proven blocks where they win) *and* decision 006 (the harness-as-product IP is the Worker loop, not a terminal coding agent). Every candidate sits behind the same thin contract (compat endpoint in, PR out), so the choice is reversible by swapping one workflow file.

## Constraints carried into the pilot

- Neurons bound Actions coding (~1–3 heavy sessions/day free) — sessions must be budgeted like inference, and the policy kernel gains an actions-session budget when the pilot lands.
- First pilot step: empirically verify `tools` pass-through on the compat endpoint (mini-swe-agent is immune either way).
- Keys live in Actions secrets, never in model context; scoped API token for Workers AI is a new lease (D-series entry when minted).

## Revisit when

Pilot evidence lands (experiments/004); a Devstral-class coder appears in the Workers AI catalog; or the loop's task success rate stalls below usefulness on registry/config-class work.
