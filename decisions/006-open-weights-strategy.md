# Decision 006 — Open-weights-only model strategy

- **Date:** 2026-08-21
- **Status:** active (human steer, recorded verbatim in intent)
- **Related:** #14, OBJ-003, decisions/005, `bootstrap/ECONOMICS.md`, `bootstrap/SELF_IMPROVEMENT.md`

## The steer (from the founder)

AINT will **not** use frontier models. Frontier-assisted coding already exists (Claude Code, Codex, Cursor, Gemini); AINT is testing something else: whether a Cloudflare ecosystem — rather than a Mac mini — can host semi-private, semi-self-hosted AI work using open-weight models, with data not flowing to frontier providers. Hypothesis: an **excellent harness + many specialized agents** can reach reasonable competence on open models, for **< $10/month**, and open models are improving fast enough that this bet strengthens over time.

Escape hatch: if the goal is provably unreachable without frontier help, a $5–10/month frontier sprinkle may be considered — but only after a strong OSS-first effort, with evidence.

## Implications

1. **The harness is the product.** Weak models demand: tiny bounded steps, strict JSON tool protocols, deterministic validation with retry, aggressive decomposition, and verification that never trusts prose. Engineering effort shifts from prompting to scaffolding.
2. **Tool-use measurement (#14) is now the critical experiment** — it decides harness design, not model procurement.
3. **Specialization over generality.** Ten narrow agents with checked outputs beat one general agent that must be smart. Role design (ORGANIZATION.md) becomes load-bearing.
4. **Semi-private posture:** conversation and organizational data stay within the Cloudflare account boundary (Workers AI runs open models in-account; AI Gateway logs stay in-account).
5. The `external-call` prohibition gains a second rationale: privacy boundary, not just blast radius.

## Policy change (v0.4.0, shipped with this record)

- `dailyInferenceBudget` 500 → **1000**: harness experiments need multi-step call headroom; worst-case cost remains ≤ ~1/3 of the free neuron day at granite-class prices.
- New `dailyMessageBudget` **200**: bounds public Console conversation writes (M2), same lease-lite pattern.

## Revisit when

- experiments/002 (tool-use gauntlet) results are in — the harness roadmap follows its data.
- A materially stronger open model lands in the Workers AI catalog (rerun tournaments).
- Two consecutive quarters of evidence that a specific capability is unreachable → escape-hatch discussion.
