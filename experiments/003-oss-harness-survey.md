# Experiment 003 — OSS Agent Harness Survey

- **Date:** 2026-08-22
- **Status:** complete (desk research; pilot pending)
- **Method:** research agent survey of official repos/docs, GitHub API activity pulled 2026-08-22; grounded against our toolloop/policy/broker code and decisions 006/007
- **Related:** #28, decisions/009

## Gating facts (verified first-party)

- **Workers AI exposes OpenAI-compatible endpoints** (`/v1/chat/completions`, `/v1/embeddings`, and `/v1/responses`) at `api.cloudflare.com/client/v4/accounts/{id}/ai/v1/...`, Bearer-token authenticated — callable from any external tool, including a GitHub Actions runner. AI Gateway offers a compat URL that preserves our in-account logging. Sources: developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/ (2026-04-21), /ai-gateway/usage/chat-completion/.
- **GitHub Actions is free on public repos** (standard runners, no minute cap). The binding constraint on Actions-hosted coding agents is therefore **neurons, not minutes**: a heavy coding session burns 300k–1M+ tokens ≈ the free day supports ~1–3 such sessions.
- **Nothing external can run inside the Worker** (all credible agents need subprocess+filesystem; smolagents' only WASM path was removed 2026-05-29). Worker-compatible options are libraries only (Cloudflare Agents SDK, Vercel AI SDK) — plumbing, not harnesses.

## Field summary (activity as of 2026-08-22)

| Candidate | Verdict | Key facts |
|---|---|---|
| **mini-swe-agent** | **pilot first** | MIT, ~100 auditable lines, bash-only ReAct — no native tool-calling dependency (immune to the compat `tools` question); litellm→any endpoint; `--yolo` CI mode; doubles as standardized eval harness (SWE-rebench standard) |
| **goose** (aaif-goose, Linux Foundation) | second track | Apache-2.0, v1.47.0, weekly releases; single Rust binary; headless JSON + documented exit codes; richest externally-imposable policy surface (GOOSE_MODE, permission.yaml, allowlist); toolshim for weak tool-callers |
| **opencode** (anomalyco) | upgrade path | MIT, extremely active, first-party GH Action, per-tool allow/ask/deny; hard dependency on native tool-calling reliability at 24B; org churn already broke Action paths once |
| aider | reject upstream | dormant since 2026-05 ("Where is Paul?"); best weak-model architecture (diff edits, no tool calls) lives on in the cecli fork |
| OpenHands | reject | churning reorg; headless approves everything; docs explicitly pessimistic about open-weight tool use |
| smolagents | reject | nothing our loop lacks, minus policy; not a security sandbox |
| crush / qwen-code / codex CLI | backups | FSL license caveat / qwen-affinity / gpt-oss-affinity respectively |
| Cloudflare Agents SDK | complement | MIT, active; DO plumbing + MCP transport; explicitly supports custom loops — does not compete with ours |

## Structural finding

The survey splits exactly along our substrate boundary: the Worker keeps the brain (no external harness can live there, and our 600 policy-fused lines are the differentiating IP per decision 006); Actions can host any of them as a **peripheral** — every credible option speaks OpenAI-compat with env-var keys, satisfying the decision-007 broker invariant (secrets never in model context; runner holds keys in Actions secrets).

## Supporting capability evidence

Devstral Small (24B, fine-tuned from the same Mistral Small base as our tool model) scores 46.8→53.6% SWE-bench Verified under an agent scaffold (mistral.ai/news/devstral/). Standing watch: if a Devstral-class coder lands in the Workers AI catalog, the ceiling of this architecture jumps.

## Not verified (pilot must check)

`tools` array pass-through on the compat endpoint (one curl; mini-swe-agent doesn't need it); opencode/OpenHands headless exit-code contracts; 24B-in-harness benchmarks beyond field reports; mini-swe-agent's README "74% SWE-bench" model attribution.

## Decision

→ `decisions/009-harness-strategy.md`.
