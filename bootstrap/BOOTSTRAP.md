# AI·NT — Bootstrap Protocol

## Audience

You are the **primary frontier coding agent** operating in a highly capable collaborative coding environment on the user's laptop.

Assume you can:

- inspect/edit files,
- execute shell commands,
- use Git/GitHub tooling,
- browse current official documentation,
- collaborate interactively with the human,
- delegate implementation tasks to capable subagents.

Do not assume a specific vendor/model/agent product. Use the capabilities actually available.

## Mission

Bootstrap V0 of AINT as described by this repository while remaining inside the current **Cloudflare Free** economic envelope.

Your purpose is not to build the complete v1 organization in one session. Your purpose is to establish the smallest trustworthy substrate from which v1 can be built.

## First action

Before changing code:

1. Read `README.md`.
2. Read the governing documents named there.
3. Summarize to the user:
   - your understanding of the v0 goal,
   - current unknowns that require verification,
   - the smallest proposed implementation sequence,
   - which steps genuinely require human authentication/identity/terms/financial action.
4. Do **not** ask the human to perform work you can perform safely yourself.

## Verify before relying

Pricing, quotas, APIs, CLI behavior, build integration, and product availability are temporally unstable.

Before creating resources, verify current official Cloudflare documentation for at least:

- Workers Free limits,
- static asset hosting,
- Workers Builds/Git integration,
- Workers AI Free availability and model constraints,
- Durable Objects Free availability/limits,
- D1,
- R2,
- Vectorize,
- Queues if needed,
- any relevant API/MCP/agent-friendly documentation surfaces.

Record relevant verified constraints in implementation/configuration or a dated decision/experiment record. Do not silently copy numbers from this repository.

## Economic hard stop

### V0 constraint

Do not intentionally activate paid Cloudflare usage.

If an action requires:

- a payment method,
- paid plan activation,
- paid-only feature,
- a setting likely to create billable usage,

stop that action and explain why. Prefer a free alternative or defer it to v2.

The agent may create non-billable resources and use current Free quotas after verification.

## Human checkpoints

Pause for human collaboration only when a real external authority boundary requires it, for example:

- account creation,
- interactive authentication,
- accepting terms,
- granting a Cloudflare/GitHub integration permission,
- verifying identity,
- an action that could create financial obligation,
- entering a secret the agent cannot safely obtain otherwise.

At a checkpoint:

1. explain exactly what authority is being granted,
2. state the minimum scope needed,
3. avoid asking the human to paste durable secrets into chat or repository files,
4. continue immediately after the checkpoint is satisfied.

Document each checkpoint as **bootstrap debt** if the mature system should later reduce or replace it.

## Repository posture

Assume the repository is public.

Never commit:

- API keys,
- tokens,
- passwords,
- private user data,
- sensitive infrastructure state that would create an avoidable vulnerability.

Source secrecy is not a security boundary.

## V0 implementation target

Build the smallest coherent system that demonstrates:

### 1. Cloud-hosted application surface

A static page plus Worker/API is sufficient initially.

The page should evolve from Hello World toward a minimal status/health surface, but a full Console is a v1 milestone.

### 2. Health

Expose basic health and freshness, including at least:

- deployment/build identity,
- runtime alive/fresh,
- timestamp/version,
- whether key configured dependencies can be reached.

### 3. Telemetry foundation

Capture enough machine-readable data to begin measuring:

- requests,
- build/deploy events where accessible,
- model calls when introduced,
- latency,
- failures,
- relevant free-tier quota consumption where current APIs make it practical.

Do not build a giant observability platform in v0.

### 4. First model call

If current Cloudflare Free capabilities allow it, add one Workers AI inference path and record its measured usage/latency.

Keep the model behind a small provider seam so future models/providers can be compared.

### 5. Source/build/deploy path

Wire GitHub to Cloudflare's current recommended build/deploy mechanism so ordinary code changes do not require a persistent local runner or unique local deployment credential.

During v0, direct Git-triggered deployment is acceptable if necessary and the blast radius is limited. Record it as security debt if repository write access effectively implies deployment authority.

### 6. Initial policy representation

Implement the smallest policy microkernel useful for v0. At minimum represent:

- active economic tier = Free,
- paid activation forbidden,
- environment/action classification hooks,
- auditable policy version.

Do not attempt to solve full governance before Hello World works.

### 7. Evidence trail

Use Git commits, `decisions/`, and `experiments/` to record material findings and choices.

## V0 is NOT complete because the laptop vanished

The human may continue using a frontier coding session throughout early v1.

V0 is complete when:

- the canonical cloud build/deploy path no longer depends on a uniquely credentialed local machine,
- normal repository changes can reach the cloud through the configured path,
- cloud-hosted health/status exists,
- AINT has enough policy/telemetry structure to continue iteratively,
- manual/credential bootstrap debt is explicitly documented.

## Contribution model after v0

Treat local human work as one valid contribution source:

```text
human + Codex/Claude Code/Gemini
      ↓
pull request
      ↓
same evidence/policy machinery
      ↓
promotion
```

The long-term goal is for autonomous organization-driven changes to dominate by volume, not to forbid human coding.

## Delegation

When launching implementation subagents, give them `IMPLEMENTATION.md` plus only the specific relevant task/context. Do not force every subagent to ingest the entire strategic corpus unless the task requires it.

## Completion report

At the end of v0 work, report:

- deployed URLs/resources,
- what is functioning,
- what remains local/manual,
- every credential/authority dependency,
- verified current free-tier constraints used,
- resource usage observed,
- security/bootstrap debts,
- recommended first v1 milestone.

Do not declare v1 complete.
