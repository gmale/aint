# Experiment 001 — Model Tournament (default for /api/generate)

- **Date:** 2026-08-20
- **Status:** complete
- **Runner + raw results:** [`001-model-tournament/`](./001-model-tournament/) (reproducible: `node run.mjs`)
- **Related:** decisions/001, experiments/000 §4

## Objective and hypothesis

Replace the mechanically-chosen `llama-3.2-1b-instruct` default with an evidence-based pick from the five verified free-tier candidates. Winner rule (pre-stated): most deterministic task passes; ties broken by total estimated neurons, then latency.

## Method

Six deterministic tasks (exact compliance, factual recall, trap arithmetic, JSON output, constrained list, brevity), one rep each, run against production `/api/generate` (256-token output cap, prod latency included). Scoring is mechanical string/JSON checks — no LLM judge. Model IDs and prices verified from official model pages 2026-08-20.

## Negative results first (the harness was wrong twice)

- **Run 1** (raw `prompt` input): granite/gpt-oss returned empty, qwen rambled — instruct models were serving without their chat template. *Raw-prompt completion is the wrong input shape for this catalog.*
- **Run 2** (chat `messages`): granite/gpt-oss/qwen still empty — they return OpenAI chat-completions `choices[0].message.content`, not Workers-AI-classic `{response}`. Captured raw shapes, extended the seam.
- Both defects would have silently corrupted any future benchmark; the tournament paid for itself before producing a ranking. Provider-seam fixes: commits `7884965`, `ab39453`.

## Results (run 3, valid)

| Model | Passes | Avg latency | Est. neurons (6 calls) | Only failure |
|---|---|---|---|---|
| **granite-4.0-h-micro** | **5/6** | 488 ms | **1.08** | constrained-list (near-miss: "Cloudflare Storage") |
| mistral-small-3.1-24b | 5/6 | 342 ms | 8.70 | trap-arithmetic (answered 8) |
| gpt-oss-20b | 5/6 | 879 ms | 28.5 | brevity (reasoning consumed token cap) |
| qwen3-30b-a3b-fp8 | 3/6 | 2086 ms | 36.6 | 3 empties — reasoning eats the 256 cap |
| llama-3.2-1b (incumbent) | 1/6 | 216 ms | 1.60 | wrong facts, trap, invalid JSON, hallucinated products |

## Decision

**Default model → `@cf/ibm-granite/granite-4.0-h-micro`**: tied on quality, ~8× cheaper than mistral and ~26× cheaper than gpt-oss per call, comfortably inside the latency envelope. The incumbent llama-3.2-1b is confirmed weak (1/6) and demoted to allowlist-only.

Runner-up note: mistral-small is the quality/latency alternative if granite's ceiling binds; it costs ~8× more neurons.

## Uncertainty / limitations

- Small sample: 6 tasks × 1 rep; differences of one pass are not strongly significant. Rerun with more reps before high-stakes conclusions.
- The 256-token output cap structurally penalizes reasoning-mode models (qwen, gpt-oss brevity): their scores measure fit-to-our-constraints, not raw capability. A future tournament should vary the cap as a dimension.
- Neuron figures are seam estimates from verified prices, not the dashboard meter; reconcile against **AI → Workers AI** before treating them as billing truth.
- Single-turn tasks only; no long-context, no tool use, no multi-turn.

## Next

Rerun (more reps, cap variations, task diversity) when M1 Console work needs a quality bar; candidates refresh as the verified catalog changes.
