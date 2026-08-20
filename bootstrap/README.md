# AI·NT — Bootstrap Context Capsule

This directory is the **zero-context seed** for bootstrapping AINT.

A sufficiently capable frontier coding agent should be able to begin here, understand the project's purpose and constraints, collaborate with a human only where bootstrap authority is genuinely required, and construct the first working substrate.

These files are **genesis material**. They record the best current synthesis of intent, hypotheses, and initial policy. They are not automatically authoritative descriptions of the future running system.

## Start here

If you are the primary bootstrap agent:

1. Read this file completely.
2. Read `CHARTER.md`, `ECONOMICS.md`, `SECURITY.md`, `GOVERNANCE.md`, `ARCHITECTURE.md`, and `ROADMAP.md` before making consequential architectural decisions.
3. Read `BOOTSTRAP.md` and execute it.
4. Use `IMPLEMENTATION.md` when delegating bounded implementation work to subagents.
5. Record material architectural decisions and empirical work in the live structures created during bootstrap.

Do not assume pricing, quotas, APIs, or Cloudflare product availability in these documents are current. **Verify temporally unstable facts against current official Cloudflare/GitHub documentation before depending on them.** Prefer official machine-friendly documentation and supported API/MCP surfaces where appropriate.

## Project identity

**AINT Is Not Transient.**

AINT is meant to persist beyond any one model, agent session, human contributor, provider, or implementation. Durable organizational memory, evidence, objectives, policy, and capability should survive turnover in the actors that use them.

The display form **AI·NT** may be used in titles and headings. Use **AINT** elsewhere unless typography specifically calls for the display name.

## Core thesis

> **Spend money on intelligence. Commoditize infrastructure.**

A sufficiently capable system should use mature infrastructure primitives instead of rebuilding solved foundations, test whether each dependency earns its cost and complexity, and push the marginal operating budget toward useful inference rather than per-seat software or avoidable platform overhead.

This is not an instruction to reinvent Git, databases, queues, object stores, authentication, or cryptographic foundations. Before building substantial machinery, AINT should research relevant prior art and treat existing systems as accumulated experimental evidence.

## How humans fit

Humans are principals, contributors, users, and providers of external purpose—not magical security oracles.

The originating human begins as inventor and bootstrap authority. Over time, their role should become less operationally central as AINT gains durable interfaces and autonomous capability. Human contributions remain first-class indefinitely: a person may implement an issue with any capable local coding environment and submit a pull request through the same evidence path as organization-generated work.

The goal is not to eliminate laptops or human coding sessions. The goal is to eliminate **unique dependency** on any one of them.

## Document classes

### Governing intent

- `CHARTER.md` — core principles and invariants.
- `ECONOMICS.md` — cost philosophy and spending envelopes.
- `SECURITY.md` — threat model and security principles.
- `GOVERNANCE.md` — identity, authority, judgment, evidence, and policy evolution.

These are important but not infallible scripture. A Markdown edit alone must never silently expand authority.

### Product and organizational intent

- `VISION.md` — long-term destination.
- `MISSION.md` — disaster-response origin and broader applicability.
- `ORGANIZATION.md` — discussions, objectives, projects, roles, and attention.
- `CONSOLE.md` — long-term human-system interface.

### Technical direction

- `ARCHITECTURE.md` — phased technical architecture.
- `MEMORY.md` — memory and document strategy.
- `SELF_IMPROVEMENT.md` — experimental optimization, adjacent-system research, and anti-Goodhart measures.
- `ROADMAP.md` — V0 and V1/V2 milestone hypotheses.

### Execution

- `BOOTSTRAP.md` — primary bootstrap runbook.
- `IMPLEMENTATION.md` — compact instructions for implementation subagents.
- `BOOTSTRAP_PROMPT.md` — minimal bootstrap-session prompt.

### Research questions

- `OPEN_QUESTIONS.md` — unresolved issues that should remain visibly unresolved until evidence answers them.
- `EXPERIMENTS.md` — evidence-recording convention.
- `DECISIONS.md` — architectural/governance decision-record convention.

## Seed, not dogma

These documents intentionally distinguish:

- **invariants** that should be difficult to weaken,
- **current decisions** that can change through governed transitions,
- **seed hypotheses** meant to be tested,
- **open questions** the organization should investigate.

AINT is expected to become more knowledgeable than its creator about many implementation details. It should use evidence to improve its documents and architecture while preserving the distinction between **learning** and **self-authorizing**.
