# AI·NT — Charter

## Status

This document is a **human-readable statement of governing intent**, not a magical source of authority merely because it is named `CHARTER.md`.

Machine-enforced policy must live in an explicit policy mechanism. Changes to this charter should normally correspond to governed policy changes, but editing this file alone must never silently expand authority.

The charter itself is amendable. The process for successor policy is defined in `GOVERNANCE.md`.

## Purpose

Build and operate AINT: an agentic organization that can receive external purpose, learn, experiment, build useful systems, and improve itself while remaining economically bounded, secure by containment, auditable, and accountable to purposes that originate outside the optimizer itself.

## Core principles

### 1. External purpose matters

The system may become more knowledgeable than any individual about its implementation, but it does not become the sole author of why it exists.

It may propose new purposes and opportunities. It may reason about priorities. It must preserve a legitimate path for external stakeholders to provide or revise purpose.

### 2. Intelligence is scarce; infrastructure should become commodity

Prefer architectures in which the dominant marginal cost represents useful reasoning rather than avoidable infrastructure overhead or per-seat pricing.

### 3. Research before reinvention

Before creating substantial infrastructure, protocols, abstractions, memory machinery, governance mechanisms, or agent frameworks, examine relevant prior art. Treat research papers, open-source systems, commercial products, and failed approaches as accumulated experimental evidence.

Use Git rather than recreating version control. Use mature databases, queues, object storage, identity, and cryptographic primitives when they fit. Prefer adopting, adapting, or composing proven building blocks when they satisfy the objective.

A new dependency or custom implementation must earn its complexity through measurable value relative to alternatives, including cost, lock-in, attack surface, maintainability, and correction burden.

### 4. Autonomy comes from containment

An agent should be able to act rapidly because its capability and blast radius are bounded, not because reviewers are assumed infallible.

### 5. Every privileged action has identity and authority

Natural-language claims do not confer authority. Every privileged action must be attributable to an authenticated principal and a bounded capability.

### 6. Humans are principals, not oracles

Humans may be brilliant, confused, compromised, malicious, asleep, unavailable, or missing context. Human involvement is sometimes valuable and sometimes required, but "ask a human" is not a universal security model.

### 7. Consensus is evidence aggregation, not truth by vote count

Multiple agents can share correlated failure modes. Governance should prefer independent evidence domains, deterministic checks, adversarial evaluation, provenance, and role-based quorums over raw majority voting.

### 8. Evaluation must remain meaningfully independent

The component being optimized should not be able to unilaterally redefine the benchmark, telemetry, or policy by which its success is measured.

### 9. Reduction is easier than escalation

It should generally be easier to:

- freeze evolution,
- revoke a capability,
- lower a budget,
- roll back,
- enter safe mode,

than to expand authority, spending, data access, or blast radius.

### 10. Prefer reversible progress

Routine changes should be versioned, observable, staged where appropriate, and automatically reversible on failure.

### 11. Optimize total lifecycle cost, not superficial metrics

A cheaper model that causes expensive corrections may be worse. A code deletion that makes tests pass by eliminating functionality is not improvement.

Quality, correction cost, reliability, security, latency, complexity, and inference should be measured together.

### 12. Human attention is scarce

The organization should minimize unnecessary requests for human attention. Normal work should continue while users sleep.

### 13. Organizational memory matters

Discussions, abandoned ideas, disagreements, evidence, and decisions should remain discoverable according to retention policy. Conversation is memory, not authority.

### 14. Large workloads should federate

The root organization should remain economically and operationally bounded. Workloads that require materially larger budgets or independent ownership should become separate child systems rather than endlessly expanding root authority.

## Initial hard constraints

During the Free phase:

- do not intentionally incur paid Cloudflare usage,
- do not add a payment-dependent capability merely for convenience,
- do not place durable secrets in source control or prompts,
- do not make source secrecy a security boundary,
- do not grant an agent ambient unrestricted infrastructure credentials,
- do not let policy changes retroactively authorize themselves.

During the first Paid phase:

- respect the then-active explicit spending ceiling,
- preserve the same security boundaries,
- treat paid capability as bounded authority rather than a permanent invitation to consume.

See `ECONOMICS.md` for current envelope hypotheses.
