# AI·NT — Roadmap

## Status

This roadmap is an **initial hypothesis**. The organization should refine it as implementation reveals better milestone boundaries.

Do not optimize for version-label purity. Optimize for demonstrable capability.

## V0 — Bootstrap

### Goal

Establish the initial GitHub/Cloudflare trust and build path with a frontier coding agent and human collaborating locally.

### Expected work

- public Git repository,
- Cloudflare account/project connection,
- verify current free-tier capabilities from official docs,
- minimal static UI,
- minimal Worker/API,
- first health endpoint,
- first telemetry/usage collection,
- first Workers AI inference call if available on verified Free tier,
- initial policy microkernel representation,
- deploy/build path that does not require a persistent local runner,
- document credential/bootstrap debt.

### V0 exit condition

V0 exits when the local coding session is no longer the **uniquely privileged execution/deployment environment**.

Specifically:

- normal source changes can flow through the canonical repository/build path,
- cloud deployment does not require a developer laptop to retain unique production credentials,
- health/status exists in cloud-hosted form,
- both humans and future agents can contribute via a common source/evidence path,
- remaining credentialed/manual bootstrap actions are known and documented.

It is acceptable—and expected—that the human continues using Codex/Claude Code/Gemini locally during early v1. Human contribution is not a failure condition.

## V1 — Free autonomous organization

V1 is composed of milestones rather than one giant deliverable.

The exact sequence may change; some milestones can overlap.

### M1 — Console foundation

- health and freshness,
- resource envelope,
- build/deploy status,
- minimal conversational/objective input where feasible.

### M2 — Organizational memory

- durable discussion,
- searchable history,
- documents,
- basic objective extraction/linkage,
- provenance.

### M3 — Autonomous development loop

- objective/task → branch/change → build/test → evaluation → autonomous merge/promotion for low-risk work,
- human PRs follow comparable evaluation paths,
- routine changes do not block on the creator.

### M4 — Governance and safety hardening

- explicit capabilities,
- risk classes,
- evidence quorum,
- role/trust-domain model,
- Autonomy Cell / staging / production distinctions,
- freeze/quarantine/safe-mode controls,
- policy successor process.

### M5 — Health and resilience

Test failures such as:

- stale telemetry,
- broken deployment,
- bad model output,
- quota exhaustion,
- poisoned memory,
- unexpected latency,
- malicious external input,
- owner absence.

### M6 — Adjacent Systems Tournament

Use AINT itself to research neighboring projects, papers, and architectures, then compare its output against a fresh frontier-agent baseline under a recorded budget. Measure decision usefulness, important concepts recovered, citation quality, duplication avoided, and inference/correction cost.

This is an early test of whether the organization adds value over a single strong agent.

### M7 — Memory Tournament

Build multiple memory implementations, test multiple models, and compare quality/security/cost/correction/complexity. Let prior-art research influence the candidates; do not assume the best design must be invented locally.

### M8 — Twelve-Hour Test

Give the organization a meaningful bounded objective and leave for approximately twelve hours.

Success means useful autonomous progress with evidence and health, not a backlog of routine human approvals.

### V1 exit hypothesis

V1 is approximately complete when:

- the Console is the natural organizational interface,
- discussions and objectives live inside the organization,
- routine changes are autonomous,
- the system measures and reasons about its resource envelope,
- it can run real research and capability tournaments,
- it behaves safely under tested unhealthy conditions,
- it passes the Twelve-Hour Test on Free tier.

## V2 — Earn the first paid capability

V2 is intentionally not fully specified now.

The Free organization should determine what the paid tier actually unlocks under current Cloudflare offerings and produce evidence that the upgrade creates sufficient value.

Likely candidate: isolated Linux/container execution for general-purpose tasks.

The system should ideally be able to say:

> "Here are the workloads Free cannot perform, the optimizations attempted, the capability unlocked by the paid tier, and the expected return on approximately $5/month."

### V2 economic constraint

Respect the then-active hard ceiling. Initial hypothesis: approximately $5/month.

## Later

Potential later work:

- external security-research tripwire,
- mature policy evolution,
- short-lived capability leases,
- model/provider tournaments,
- child-system bootstrap and spin-off,
- stronger artifact provenance,
- long-term absence/degradation behavior,
- root organization growth up to but not silently beyond the $100/month architectural ceiling.
