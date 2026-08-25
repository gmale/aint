# Experiment 005 — Model market survey (capability × cost, agentic workloads)

- **Date:** 2026-08-24 (research sweep; sources cited inline in the full report on issue #61)
- **Method:** desk research over independent leaderboards — Artificial Analysis Intelligence Index v4.1.1, SWE-rebench (contamination-free, May–Jul 2026 window), LiveBench 2026-06-25, arena.ai Elo, BFCL v4 — plus HF model cards; cost math from the Cloudflare pricing page (2026-08-18) using a 700k-input/15k-output session at 85% cache-hit where cached pricing exists.

## Leaderboard-state note

HF's Open LLM Leaderboard retired 2025-03-13; HF's successor is infrastructure (Community Evals, Feb 2026 — leaderboards attached to benchmark datasets, verified badges) not a ranking. The community's working set: arena.ai, Artificial Analysis, SWE-rebench, LiveBench, BFCL.

## Shortlist verdicts (Workers AI catalog, all on Cloudflare metal)

| Verdict | Model | Why |
|---|---|---|
| **Capability winner** | `glm-5.2` (paid-only) | Only shortlist model with a strong *independent* agentic result: SWE-rebench **62.9%** (best open model, #4 overall); best LiveBench coding (79.7) and WebDev arena of the list |
| **Cost winner (nominal)** | `qwen3-30b-a3b-fp8` (free) | $0.041/session — but AA *Agentic* Index 1.8: not credible for multi-step work. Oddly best BFCL (41.4%) → fine for single-shot tool calls |
| **Cost-per-capability winner** | `deepseek-v4-flash-0731` (paid-only) | **$0.074/session at near-frontier** (AA II 51.8, ~1pt behind the leaders) — ~$0.0014/AA-point vs $0.0070 for glm-5.2. The $0.014/M cached input does the work |

Tiering: near-frontier open = glm-5.2, ds-v4-pro, ds-v4-flash; mid = kimi-k2.6/2.7; **everything else — including mistral-small (AA agentic 5.3), gpt-oss-120b (indep SWE 26.0%), llama-4-scout (agentic 1.1), nemotron-3 (8.8), gemma-4 (11.0) — is not credible for serious multi-step agent work.**

## Structural findings

1. **Cached pricing exists only on the five paid-only models** (deepseek ×2, glm-5.2, kimi ×3 minus one) — cache economics and the paid tier are ONE decision.
2. **The free tier contains no agent-credible model.** Free-tier heavy sessions are inherently rationed AND capability-capped; our mistral results (fine on small bounded tasks) match its "trivial tool-calling" tier.
3. **Self-reported vs independent gaps are enormous this generation** (ds-v4-pro 80.6→40.2 SWE; gpt-oss-120b 62.4→26.0): discount SR numbers heavily — the anti-Goodhart rule applies to vendors too.
4. The "US-authored preference" option (gpt-oss-120b/nemotron/llama) currently costs a capability *class*, not just money.
5. Coding-branded ≠ good value: qwen2.5-coder-32b is the most expensive session at the lowest capability; kimi-k2.7-code has the thinnest evidence on the list.
6. Free-tier division of labor supported by data: Worker-loop single-shot tools → qwen3-30b (BFCL-best, $0.051/M) or granite; peripheral sessions → paid v4-flash if activated, else small-task-only mistral.

## Decision input

Combined with experiments/004: the paid case now reads — **$5-10/mo on v4-flash cached ≈ hundreds of near-frontier agent sessions** (25x today's cost at ~3.5x today's capability tier), MIT weights, Cloudflare metal, privacy posture unchanged. glm-5.2 available as the 5x-cost reliability escalation. Founder's call per charter.
