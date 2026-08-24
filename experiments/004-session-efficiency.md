# Experiment 004 — Session efficiency program (#61)

- **Started:** 2026-08-24 · **Status:** in progress (Phase 0 shipped; measurements pending quota drain)
- **Baseline (measured):** one mini-swe-agent doc-edit session = **28,856 platform neurons ≈ $0.32 ≈ ~800k tokens**, quadratic transcript growth. Free tier at this shape: ~1 heavy session per 3 rolling days.
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

**Conclusion:** the substrate does not change the binding cost — inference tokens do. Workers AI overage is the *cheapest* inference available to us at this scale; a GPU box loses by an order of magnitude below ~30 sessions/day, and a CPU box can't run our model class. A Cloudflare container (the V2 "earned Linux") buys *latency and filesystem ergonomics*, not economics — a fine future reason, never a cost fix. **Token efficiency dominates every substrate decision**, which is this experiment's charter. Corollary: the evidence bar for the founder's $5–10/mo escape hatch is already met *in dollars* ($0.32/session — even unoptimized, ~30 sessions/mo for $10); the free-tier constraint is a self-imposed research boundary, not an economic necessity.

## Pending measurements (fire when rolling < 5k; peripheral runs gated regardless)

- P2 caching check (near-free, auto-dispatches on recovery)
- P1a/1b/1c: baseline-instrumented, capped+disciplined, granite-routed — one B1 run each
- Worker-loop B1 attempt (expect single-digit neurons)
