# AI·NT — Economics

## Governing thesis

> **Spend money on intelligence. Commoditize infrastructure.**

The organization should push the marginal cost of useful growth toward model inference and away from per-seat SaaS pricing, avoidable managed-platform premiums, permanently running idle compute, and complexity that can be replaced by mature low-cost primitives.

This is a thesis to test continuously, not a license to build every infrastructure component from scratch.

## Cost is an architectural constraint

The initial experiment works backwards from the resource envelope:

1. understand what is actually free,
2. build useful capability within it,
3. measure where the limits bind,
4. optimize before paying,
5. spend only when the next tier produces evidence-backed value.

Cloudflare pricing, free quotas, and product availability change. The bootstrap agent must verify current official documentation before implementation and record the verified values in telemetry/configuration rather than assuming this repository is current.

## Initial economic phases

### Phase Free

**Hard target: $0/month of incremental Cloudflare spend.**

The system may consume free-tier resources but should fail closed, defer work, degrade gracefully, or wait for quota renewal rather than silently producing a bill.

This phase exists to discover how much capability fits inside a truly free envelope.

### First paid capability phase

**Initial target: approximately $5/month total Cloudflare commitment**, if and only if the free system produces an evidence-backed case that the paid tier unlocks valuable capabilities such as isolated Linux execution or materially larger runtime envelopes.

The free system should ideally be able to explain why it has "earned Linux."

### Root organization long-term ceiling

**Hard architectural ceiling: $100/month for the root organization unless governance explicitly changes this constraint.**

The creator currently spends substantially more than this across other AI systems and does not want the root substrate to grow into an unbounded cost center. This ceiling is intended to remain useful for years, not days.

A workload that reasonably requires more than the root ceiling should normally be treated as evidence that it deserves a separate budget/trust domain.

Example:

```text
Root organization              <= $100/month

Disaster-response child        dedicated ~$20/month
Commercial child               independent budget
Research child                 independent budget
```

The exact child budget is purpose-specific.

## Economic sovereignty vs security sovereignty

Strongly authenticated economic owners may be granted authority to increase spending within defined bounds without requiring agents to agree the purchase is intellectually interesting.

That spending authority must **not** implicitly grant authority to weaken unrelated security invariants.

For example:

- increasing a model budget does not imply permission to expose secrets,
- paying for a larger compute tier does not imply permission to broaden production credentials,
- ownership of a billing account does not automatically mean unilateral authority over every safety boundary.

## Preferred cost metric

Do not optimize primarily for token price, request price, or cost per build.

Prefer:

> **total lifecycle cost per correctly completed useful objective**

This can include:

- inference,
- correction/rework,
- retries,
- evaluation,
- infrastructure,
- operational complexity,
- regressions,
- latency where it matters,
- human attention.

A cheap model that causes enough correction can be more expensive than a stronger one.

## Optimization ROI

Optimization itself consumes resources.

Early in the system's life, prefer large expected improvements. A reasonable seed heuristic is to prioritize changes expected to produce roughly **10% or greater meaningful movement** in a target metric, unless they address material security/reliability risk or unlock new capability.

As low-hanging fruit is exhausted, the organization may propose progressively lower thresholds (for example 5%, 1%, eventually fractions of a percent) if the evaluation cost justifies it.

This is a heuristic, not a permanent constant.

## Desired mature cost profile

For hundreds of mostly event-driven agents:

```text
agent identity / idle existence      ~negligible
message passing                       very low
structured memory                     very low
semantic retrieval                    low
files                                 low
static delivery                       negligible
build plumbing                        negligible/commodity
basic runtime                         low
model inference                       dominant variable expense
```

The system should measure this premise empirically rather than assuming it is true.
