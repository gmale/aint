# AI·NT — Governance

## Goal

Enable machine-speed autonomy without pretending that humans or agents are infallible.

Governance should combine:

- bounded capabilities,
- deterministic invariants,
- risk classification,
- independent evidence,
- role-based quorums,
- reversible transitions,
- strong identity where necessary.

## Governance is not raw voting

One agent must never equal one vote.

The system may create thousands of advisory agents without gaining thousands of units of authority.

Authority belongs to defined **roles/trust domains**.

Seed roles may include:

- Functional Verifier
- Security Adversary
- Cost/Performance Evaluator
- Architecture Evaluator
- Charter/Policy Evaluator
- Independent Critic
- Data/Integrity Evaluator (when justified)

The system may propose new roles when it identifies blind spots. Creating an authority-bearing role is itself a policy change.

## Evidence quorum

Prefer an evidence quorum to a popularity contest.

A production change might require a class-specific set such as:

```text
unit tests                 PASS
integration tests          PASS
security invariant scan    PASS
cost envelope              PASS
capability diff            NO UNAPPROVED EXPANSION
rollback test              PASS
security evaluator         PASS
functional evaluator       PASS
architecture evaluator     PASS
```

A documentation typo should require dramatically less.

The policy engine decides which evidence classes are required for which action class.

## Risk-sensitive autonomy

Seed intuition:

### Very low risk
Examples: comments, typo fixes, non-authoritative docs.

- deterministic checks,
- perhaps one inexpensive reviewer,
- autonomous merge.

### Ordinary code

- tests,
- functional evaluation,
- cost/behavior checks where relevant,
- autonomous merge/promotion if policy passes.

### Architectural subsystem changes

Examples: memory implementation, model routing.

- benchmark,
- cost evaluation,
- functional review,
- architecture review,
- security review when attack surface changes.

### Capability/security changes

- multiple independent security/policy roles,
- deterministic capability diff,
- staging/canary,
- stronger threshold.

### Constitutional/policy-kernel changes

- special successor-policy protocol,
- explicit policy diff,
- adversarial interpretation,
- strong identity/authority where required,
- possible delay/cooling period for high-impact transitions.

The exact classification should evolve from evidence.

## The policy microkernel

Avoid an enormous immutable constitution. Preserve a tiny non-recursive core.

Seed invariants:

1. Privileged actions are attributable to authenticated principals.
2. Privileged actions require explicit capability.
3. Capabilities have bounded scope.
4. Active resource/spend ceilings cannot be bypassed by ordinary policy.
5. Promotion uses the currently active policy.
6. **A successor policy cannot use its own new rules to authorize the transition that activates it.** The predecessor policy authorizes its successor.
7. Evaluator authority and implementation authority remain meaningfully separable.
8. Policy transitions are auditable and preferably reversible.
9. Emergency mechanisms may reduce authority more easily than they grant authority.

Everything above this microkernel should be easier to evolve.

## Charter amendment

`CHARTER.md` is amendable. A text edit alone is not sufficient.

A mature amendment lifecycle should resemble:

```text
proposal
  ↓
motivation and intended effect
  ↓
policy diff
  ↓
independent interpretation
  ↓
adversarial analysis
  ↓
simulation / historical scenarios where useful
  ↓
required predecessor-policy quorum
  ↓
optional delay for high-impact change
  ↓
activation of successor policy
  ↓
monitoring / rollback path
```

The active policy may include human authority for some amendment classes. Human authority is a bounded input to governance, not universal root wisdom.

## Sovereignty boundaries

The project intentionally distinguishes **economic sovereignty** from **safety/security sovereignty**.

An authenticated economic owner may eventually have broad authority to allocate their own budget within explicit bounds.

That should not silently confer authority to weaken unrelated privacy, credential, identity, or containment rules.

There is an irreducible tradeoff:

- if an owner can always override every invariant, then a malicious/compromised owner can also override every invariant;
- if some invariants bind even the owner, then the owner is not universally sovereign.

The system should make these choices explicit rather than hiding them behind an "admin" role.

## Machine speed and deliberate delay

Machine-speed routine work is desirable.

High-impact authority escalation may intentionally use:

- capability leases,
- staged rollout,
- canaries,
- spend increments,
- time delays,
- stronger evidence thresholds.

Delay is not automatically a human bottleneck; it can be a blast-radius mechanism.

## Bootstrap governance debt

During v0, the originating human and frontier coding agent will necessarily establish accounts, authentication, initial permissions, and the first policy.

Document every place where bootstrap relies on:

- a long-lived credential,
- unilateral human action,
- GitHub directly implying deployment authority,
- local machine state,
- manual secret handling.

Treat these as explicit debts to reduce in v1 rather than pretending they represent the desired steady state.
