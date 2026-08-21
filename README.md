# AI·NT

**AINT Is Not Transient.**

AINT is an experiment in building a persistent, recursively self-improving **agent organization**: a system that can preserve institutional memory, turn discussion into objectives, research and build software, evaluate its own work, and improve its infrastructure under explicit security and cost constraints.

Unlike a coding-agent session, AINT is meant to persist. Agents, models, humans, and tools can come and go; the organization keeps its memory, evidence, objectives, policy, and ability to act.

> **Thesis:** as intelligence improves, commodity infrastructure should become cheaper. AINT aims to push the marginal operating cost toward useful inference while treating infrastructure services as replaceable building blocks that must earn their complexity.

## Status

**Pre-alpha / bootstrap.** The repository contains the genesis material for the first implementation, plus the V0 substrate under [`app/`](./app/).

Live Console: <https://aintservice.com> (health: [`/api/health`](https://aintservice.com/api/health), telemetry: [`/api/telemetry`](https://aintservice.com/api/telemetry); workers.dev fallback: <https://aint.aint-app.workers.dev>)

The initial experiment starts on Cloudflare's free tier. AINT must learn what it can build there before it earns a paid capability. The first paid escape hatch is expected to be roughly **$5/month**; the root organization has a long-lived architectural ceiling of **$100/month** unless governance deliberately changes it or a workload is spun into an independent system.

## What AINT is exploring

- **Organization over sessions** — durable discussion, objectives, roles, memory, evidence, and health.
- **Recursive self-improvement** — changes compete through benchmarks and experiments instead of self-asserted improvement.
- **Evidence over vote count** — deterministic checks, adversarial review, provenance, and role-based evidence quorums.
- **Research before reinvention** — study adjacent systems first; adopt or adapt proven building blocks when they win.
- **Inference-first economics** — optimize total cost per correctly completed objective, including correction cost.
- **Safe autonomy through containment** — routine work should proceed at machine speed because blast radius is bounded.
- **Human participation without human bottlenecks** — humans remain users, contributors, and providers of external purpose.
- **Eventually, system spawning** — mature AINT instances should be able to bootstrap bounded descendant systems with their own budgets, identities, and governance.

## Bootstrap

The [`bootstrap/`](./bootstrap/) directory is the project's **genesis material**: the initial vision, charter, architecture, security model, economic constraints, governance ideas, and execution protocol. It is intentionally detailed so a frontier coding agent can begin with zero conversational context.

If you are bootstrapping AINT with a capable coding agent, start with:

```text
Read bootstrap/README.md and execute bootstrap/BOOTSTRAP.md.
```

The bootstrap material is a seed, not eternal truth. AINT is expected to test its assumptions, preserve evidence, and evolve its operational knowledge through governed successor policies.

## Read next

- [`bootstrap/VISION.md`](./bootstrap/VISION.md) — where the project is headed
- [`bootstrap/CHARTER.md`](./bootstrap/CHARTER.md) — governing principles
- [`bootstrap/ROADMAP.md`](./bootstrap/ROADMAP.md) — V0 → V1 milestones → V2
- [`bootstrap/SELF_IMPROVEMENT.md`](./bootstrap/SELF_IMPROVEMENT.md) — experimental improvement loops
- [`bootstrap/SECURITY.md`](./bootstrap/SECURITY.md) — threat model and containment

## Name

**AINT** is the canonical name in prose and code. **AI·NT** is the display form used in titles and headings; the middle dot is `·` (U+00B7). The recursive expansion is **AINT Is Not Transient**.
