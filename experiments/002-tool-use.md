# Experiment 002 — Open-Weights Tool-Use Gauntlet

- **Date:** 2026-08-21 (overnight run)
- **Status:** complete
- **Runner + raw traces:** [`002-tool-use/`](./002-tool-use/)
- **Related:** decisions/006 (open-weights-only), OBJ-003/OBJ-007, #14

## Objective and hypothesis

Decision 006's core bet: an excellent harness lets open-weight models do real multi-step work. Test: 5 verifiable tasks (counter lookup, tool arithmetic, policy read, registry count, 3-step multi-hop with a write) × 2 reps × 5 models, through the strict-JSON tool loop (`app/src/toolloop.ts`) against production. Scoring is deterministic: correct final answer AND required tool calls actually made.

## Results

| Model | Passes | Avg steps | Repairs | Neurons (10 tasks) |
|---|---|---|---|---|
| **mistral-small-3.1-24b** | **10/10** | 2.2 | **0** | 182.3 |
| granite-4.0-h-micro | 5/10 | 1.9 | 2 | 10.1 |
| gpt-oss-20b | 4/10 | 2.4 | 12 | 195.2 |
| qwen3-30b-a3b-fp8 | 3/10 | 1.6 | 3 | 63.4 |
| llama-3.2-1b | 1/10 | 1.4 | 1 | 10.8 |

## Findings

1. **The hypothesis holds at n=1 model:** mistral-small completed every task, zero malformed outputs, including get→write→report chains. Free-tier cost ≈ 18 neurons/task → **~550 tool-tasks/day inside the free allocation**.
2. **Complementary specialization is real:** granite aces cheap lookups/arithmetic (1 neuron/task) but guessed instead of calling tools on policy/registry reads; gpt-oss aced exactly those but emitted JSON-protocol violations elsewhere (reasoning models resist "reply with only JSON"); the union of models covers ~9/10. A **task-class router** beats any single model — strength in numbers, literally.
3. **Infrastructure failure mode found:** AI Gateway rate limiting (`2003`) zeroed mistral's first run entirely. Lesson shipped: backoff-and-retry in the tool loop. Harness engineering > model choice, exactly as decision 006 predicts.
4. gpt-oss's repairs suggest a model-specific protocol adapter (e.g., tolerate reasoning preamble, extract last JSON) could recover it cheaply — future harness work, not model work.

## Decision

- Tool-loop default model → **mistral-small-3.1-24b** (evidence: only 10/10). Cheap text generation (converse, summaries) stays on granite.
- Next: model-per-task-class routing in the harness; protocol adapters for reasoning models; rerun with ≥3 reps + harder tasks (#14).

## Uncertainty / limitations

- 2 reps; small task set; single harness protocol (strict JSON) — gpt-oss/qwen scores partly measure protocol fit, not capability.
- Rate-limit contamination possible in qwen's run (its zero-neuron step-1 failures resemble mistral's); rerun before treating its rank as final.
- Neuron figures are seam estimates (reconciliation runs daily).
