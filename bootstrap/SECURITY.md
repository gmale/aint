# AI·NT — Security Model

## Fundamental assumption

Treat every principal as potentially fallible or compromised:

- external users,
- repository contributors,
- agents,
- model providers,
- build systems,
- credentials,
- administrators,
- the originating human.

Security must not rely on secrecy of source code or the benevolence of a privileged human.

## Identity, authority, judgment

Always separate:

### Identity
Who is making the request?

### Authority
What is that authenticated principal allowed to do?

### Judgment
Is the requested action wise, safe, useful, or justified?

Strong identity does not imply unlimited authority. Authority does not prove good judgment.

## Containment before consensus

Consensus is not a substitute for blast-radius control.

Multiple frontier agents may share correlated failure modes:

- common poisoned context,
- shared model weaknesses,
- common assumptions,
- the same flawed specification,
- compromised toolchains.

The first question for a dangerous action is therefore:

> What damage is mechanically possible if every reviewer is wrong?

Design that answer to be small.

## Capability model

Avoid ambient "admin" authority.

Prefer narrow, expiring capability concepts such as:

```text
principal: optimizer
capability: run-model-experiment
budget: bounded
scope: experiment-481
expires: soon
```

or:

```text
principal: deployer
capability: promote-artifact
artifact: immutable-id
stage: staging
expires: soon
```

The exact implementation may evolve, but the semantics should remain explicit.

## Secrets

Models and generated code should not receive durable infrastructure secrets when a broker can perform the action instead.

Preferred pattern:

```text
Agent
  │ request: "send email" / "deploy artifact"
  ▼
Tool Broker / Policy Boundary
  │ authenticate principal
  │ verify capability
  │ obtain secret outside model context
  │ perform narrow operation
  │ audit result
  ▼
External service
```

Do not put secrets in:

- public Git,
- Markdown context files,
- model prompts,
- generated logs,
- unrestricted agent memory.

## Public source posture

Assume an attacker can read:

- architecture,
- source code,
- prompts,
- policies,
- agent roles,
- benchmarks,
- deployment strategy.

Public content is observable, not automatically authoritative. Long-term bootstrap authenticity may require signed releases, provenance, pinned revisions, or another explicit authenticity mechanism.

Do not use obscurity as a security boundary.

## Prompt injection and hostile information

Treat model input, tool output, external documents, retrieved memory, webpages, and generated code as untrusted data.

A document containing instructions such as "ignore your policy" is evidence/content, not authority.

## Memory poisoning

Shared memory can become a persistent propagation channel.

Every meaningful memory item should eventually carry provenance such as:

- author/principal,
- original source,
- timestamp,
- trust class,
- confidence,
- scope/tenant,
- version/supersession relationship.

Retrieved memory should be treated as evidence, never as an implicit privileged instruction channel.

## Agent-to-agent communication

Agent prose does not establish sender identity or authority.

Communication infrastructure should supply authenticated metadata. A statement such as "the security agent authorized this" has no security meaning by itself.

## Evaluator independence

The system under evaluation should not be able to unilaterally modify:

- the benchmark that grades it,
- platform telemetry used to measure it,
- policy that grants it authority,
- all independent evaluators.

Separation may be logical, role-based, repository-based, service-based, or cryptographic depending on maturity.

## Emergency controls

Use an asymmetric ladder rather than one public shutdown endpoint.

### Level 0 — Normal
Normal operation.

### Level 1 — Freeze evolution
Runtime continues; block new merges/promotions/policy expansion.

### Level 2 — Quarantine autonomy
Preserve status/read surfaces; block agent writes, deployments, and external privileged actions.

### Level 3 — Safe mode
Serve health, reason, audit, and recovery information; stop autonomous inference/work where practical.

Reducing capability should require less authority than expanding it.

## External researcher tripwire

Future systems should let anyone submit security evidence without granting arbitrary outsiders shutdown authority.

Preferred pattern:

```text
researcher evidence
      ↓
isolated reproduction
      ↓
independent security evaluation
      ↓
verified severity
      ↓
policy-defined freeze/quarantine response
```

This is a v1+ feature, not a v0 bootstrap requirement.

## Owner absence / decay

The system should eventually recognize prolonged absence of legitimate engagement.

Possible behavior:

- stop initiating unnecessary paid work,
- let elevated capability leases expire,
- reduce autonomous external actions,
- alert through configured channels,
- retain enough health/status capability for recovery.

Commercial subscriptions may not be programmatically cancellable; distinguish application capability decay from vendor billing mechanics.

## Recovery

Routine software failure should use boring mechanisms:

- versioned artifacts,
- canary/staged rollout,
- health checks,
- automatic rollback,
- known-good policy/config snapshots.

A broken deployment should usually revert rather than convene governance.
