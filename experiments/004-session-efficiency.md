# Experiment 004 — Session efficiency program (#61)

- **Started:** 2026-08-24 · **Status:** in progress (Phase 0 shipped; measurements pending quota drain)
- **Baseline (measured):** one mini-swe-agent doc-edit session = **28,856 platform neurons ≈ $0.32 ≈ ~800k tokens**, quadratic transcript growth. Free tier at this shape: ~1 heavy session per 3 rolling days.
- **CORRECTION (2026-08-24):** the "~80x per-path billing discrepancy" claimed earlier is **retracted** — it was a model-mix arithmetic error (mistral measurements compared against granite-priced estimates). Verified: platform neurons match list prices exactly (85+27-token mistral call → 4.08 computed vs 4.07 measured; ~800k-token session → ~26-29k computed vs 28,856 measured). There is no surcharge; the cost is pure quadratic token volume at advertised rates. Mechanics: stateless serverless inference re-prefills the full transcript every turn (KV cache discarded between requests), unlike a local model whose persistent KV cache makes the same session linear in unique tokens. Prompt caching = renting that persistence; the queued probe determines whether Workers AI discounts cached prefixes.
- **Targets:** doc benchmark < 3,000 neurons via peripheral; < 100 via Worker loop.

## Phase 0 — shipped (model-free)

- **Pacing gate**: agent-task dispatch aborts when rolling-24h > 5,000 or unknown — burst lockouts now mechanically impossible from the peripheral. (Response to the unnoticed 3× overdraft of 2026-08-24.)
- **Step cap 12** in mini config — bounds worst-case session cost (late steps are the quadratic-expensive ones).
- **Token instrumentation**: every run prints trajectory-summed prompt/completion tokens (fast per-variant metric; platform hour-buckets stay the slow ground truth).
- **`/api/envelope?fresh=1`** (60s cooldown) for experiment-grade readings.
- **Worker-native editing**: tool loop gains `read_repo_file` + `submit_edit_pr` (broker-signed, PR-gated, 48KB cap; output ceiling raised 256→2000 for file-bearing tool calls). Bounded context by construction — the AINT-native alternative to transcript-accumulating sessions.
- Caching probe added to compat-check (two identical-prefix calls; compare `usage.neurons` + `cached_tokens`).

## Benchmarks (fixed)

B1 doc-edit: fix the duplicated item-4 lines in `automation/ACTIVATION.md` (real defect from PR #60). B2 code-edit: `--version` flag in `gen-build-info.mjs`.

## Substrate economics: the "Linux instance vs GitHub route" question (analysis, 2026-08-24)

The founder asked what a Linux-based route would cost versus Actions. The decomposition:

| Cost center | GitHub Actions route | CF Containers/Sandbox (paid plan) | Own VPS/GPU |
|---|---|---|---|
| Harness compute | **$0** (public repo) | ~pennies (paid plan required, ~$5/mo base) | $5–20/mo (CPU VPS) |
| Inference | Workers AI: $0.011/1k neurons ($0.32/session today; ~$0.03 post-10×) | **identical** — same Workers AI | Self-hosted: 24B needs ~24GB VRAM → GPU rental $150–350/mo always-on; CPU inference of 24B ≈ 1–3 tok/s (unusable) |
| Ops burden | none | low | high |

**Refinement (2026-08-24, founder exploration):** the VPS/GPU column above assumed always-on rental. **Serverless per-second GPU** (RunPod/Modal-class) changes it: a 24B quantized to ~14GB runs agent-adequate (20-50 tok/s) on a $0.35-0.90/hr card; a 30-min session ≈ $0.25 — rough parity with Workers AI *plus* persistent in-VRAM KV (no quadratic re-prefill) and no rolling-quota lockouts. Below the API line the founder's KV-export idea is productized (vLLM prefix caching + LMCache-style offload tiers; llama.cpp session files); quantized KV (~1-1.5GB for 35k ctx) restores from fast storage in seconds, beating recompute on cheap cards. Notable synthesis: **R2's free egress makes it a strong external weights/KV store** — Worker orchestrates, rented GPU computes, R2 persists. Costs are non-monetary: cold starts (1-5 min), ops surface, a new credential+billing domain, and crossing the Cloudflare-only experiment boundary (governance decision, not config). Sequencing unchanged: caching probe + pruning + Worker-loop first; serverless GPU is now the *well-shaped* escape hatch if Workers AI declines to rent us statefulness.

**Conclusion (as amended):** the substrate does not change the binding cost — inference tokens do. Workers AI overage is the *cheapest* inference available to us at this scale; a GPU box loses by an order of magnitude below ~30 sessions/day, and a CPU box can't run our model class. A Cloudflare container (the V2 "earned Linux") buys *latency and filesystem ergonomics*, not economics — a fine future reason, never a cost fix. **Token efficiency dominates every substrate decision**, which is this experiment's charter. Corollary: the evidence bar for the founder's $5–10/mo escape hatch is already met *in dollars* ($0.32/session — even unoptimized, ~30 sessions/mo for $10); the free-tier constraint is a self-imposed research boundary, not an economic necessity.

## Pending measurements (fire when rolling < 5k; peripheral runs gated regardless)

- P2 caching check (near-free, auto-dispatches on recovery)
- P1a/1b/1c: baseline-instrumented, capped+disciplined, granite-routed — one B1 run each
- Worker-loop B1 attempt (expect single-digit neurons)
