# AI·NT — Self-Improvement

## Principle

The system should improve through **measured experiments**, not self-congratulation.

A good loop is:

```text
observe
  ↓
identify candidate improvement
  ↓
state hypothesis and expected ROI
  ↓
implement candidate in bounded environment
  ↓
benchmark / attack / evaluate
  ↓
compare with baseline
  ↓
policy/evidence decision
  ↓
promote or reject
  ↓
measure after deployment
  ↓
retain evidence
```

## Avoid vague objectives

"Optimize yourself" is too gameable.

Prefer concrete hills such as:

- improve memory recall under a fixed benchmark,
- reduce inference per correct task while maintaining quality,
- improve alert precision/recall,
- reduce deployment recovery time,
- improve health freshness,
- reduce context load without benchmark regression,
- improve model routing total lifecycle cost.

## Early recommended tournament: adjacent systems research

Before assuming AINT's organizational machinery provides leverage, test it.

Give AINT a concrete research objective such as:

> Research adjacent self-improving agent organizations and identify concepts we should adopt, benchmark, or avoid before implementing our next subsystem.

Run the same objective against a **fresh frontier-agent baseline** with an equivalent or explicitly recorded inference/time budget.

Compare outputs on metrics such as:

- recall of important relevant projects and papers,
- citation/source accuracy,
- important architectural concepts extracted,
- useful negative lessons and failure modes,
- duplication avoided,
- decision usefulness for the next engineering step,
- novelty of synthesis,
- total inference cost,
- correction cost.

The point is not to prove that more agents produce more text. The point is to test whether persistence, specialization, shared memory, adversarial review, and organizational context produce **more decision-useful knowledge per unit of inference** than a strong frontier agent working alone.

Research outputs should feed back into architecture decisions and future tournaments. Adjacent systems remain candidates for adoption or adaptation; AINT should not reproduce equivalent components merely to preserve architectural purity.

## Recommended capability tournament: memory

The first substantial autonomous research project should likely be a **Memory Tournament** because it creates a clear fitness landscape and benefits the organization itself.

Define a stable interface such as:

```text
MemoryProvider
  put(memory)
  recall(query)
  forget(id)
  summarize(scope)
```

Create a benchmark containing:

- facts,
- conversations,
- irrelevant context,
- contradictory updates,
- temporal changes,
- malicious/poisoned content,
- retrieval queries,
- downstream tasks requiring correct recall.

Candidate implementations might include:

- Durable Object SQLite only,
- D1 structured/keyword retrieval,
- Vectorize semantic retrieval,
- summarized memory + Vectorize,
- Mem0-style extraction,
- other open-source adapters discovered later.

Test multiple viable models where useful.

Measure:

- recall accuracy,
- false recall,
- temporal correctness,
- poison resistance,
- latency,
- input/output tokens or normalized inference units,
- storage/queries,
- correction cost,
- implementation complexity.

The winner is not necessarily the implementation with the cheapest model call.

## Model diversity

Model/provider abstraction is essential because the frontier changes.

The system should be able to compare:

- cheap open-weight models,
- stronger open-weight models,
- frontier hosted models,
- deterministic code where reasoning is unnecessary.

Prefer the most intelligent viable option according to measured **total lifecycle cost per correct objective**, not brand loyalty.

## Anti-Goodhart architecture

A component must not control both its implementation and the score by which it is judged.

Separate authority for:

- implementation,
- benchmarks,
- telemetry,
- evaluation,
- policy.

Possible techniques:

- fixed benchmark versions,
- hidden or freshly generated test cases,
- independent benchmark curator role,
- telemetry reconciled against platform/provider data,
- immutable experiment manifests,
- adversarial evaluators.

If a change reduces telemetry emission rather than resource consumption, it is not an optimization.

If a change deletes functionality to make tests pass, it is not an optimization.

## ROI threshold

Self-improvement consumes intelligence too.

Early on, prioritize improvements with large expected movement (seed heuristic: around 10%+) unless they address material safety/reliability or unlock important capability.

As the system matures, it may lower the threshold with evidence.

The system should consider:

```text
expected benefit
- implementation inference
- evaluation inference
- correction risk
- complexity burden
- regression probability
```

before spending substantial effort on an optimization.

## Recursive dogfooding

Use the system itself to improve:

- governance role selection,
- benchmark design,
- model routing,
- memory,
- telemetry,
- alerting,
- policy efficiency.

But recursion stops at the policy microkernel boundary: successor rules are authorized by predecessor rules, not by themselves.

## Twelve-Hour Test

A major v1 acceptance test:

1. Give the organization a meaningful bounded objective.
2. Leave it unattended for roughly twelve hours.
3. Return.

Success looks like useful autonomous progress with evidence, not a queue of routine approval requests.

Example report:

```text
23 experiments performed
7 candidate implementations
4 rejected by benchmark
2 rejected by security review
1 promoted

quality improved
cost/correct-task improved
no detected regression
system healthy
remaining disagreements surfaced
```

If normal progress blocks on human approval for hours, autonomy policy is too conservative or containment is too weak.

## Evidence retention

Use the conventions in `EXPERIMENTS.md` and `DECISIONS.md` so tournaments and architectural choices remain reproducible and challengeable.
