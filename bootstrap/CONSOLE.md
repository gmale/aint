# AI·NT — Console

## Name

Use **Console**, not "cockpit."

The Console is the primary long-term human-system interface. It is more than an operations dashboard and more than a chatbot.

## Purpose

The Console should let a user:

- discuss ideas with the organization,
- provide external purpose,
- refine objectives,
- inspect health,
- see autonomous work,
- review evidence and disagreements,
- understand resource usage,
- intervene when genuinely necessary,
- contribute without needing a privileged developer shell.

GitHub remains source/history. The Console becomes the organizational interface.

## Initial surfaces

### Converse

Free-form organizational discussion.

The system may involve multiple role perspectives when their participation adds information value.

Discussion should be durable and mineable later.

### Purpose / Objectives

Show active and proposed objectives, their constraints, success criteria, and lineage from discussion.

### Health

Health belongs at the top.

Example:

```text
SYSTEM HEALTH                HEALTHY

Runtime                      healthy   fresh
Agent scheduler              healthy   fresh
Git/build integration        healthy   fresh
Memory                       healthy   fresh
Model inference              healthy   fresh
Telemetry                    healthy   fresh

Last autonomous work         14m ago
Last successful deployment   3h ago
Last recovery exercise       2d ago
```

Freshness is itself a health signal. A green metric that has not updated for twelve hours may be stale, not healthy.

### Resource envelope

Show current usage relative to the active cost/quota constraints.

Examples:

- free inference allocation,
- Worker/API requests,
- build minutes,
- database reads/writes,
- semantic retrieval,
- storage,
- paid budget if/when activated.

Do not hardcode stale vendor limits into UX. Obtain current verified limits/configuration where practical.

### Autonomous activity

Show:

- active work,
- recent experiments,
- rejected candidates,
- promotions,
- rollbacks,
- unresolved disagreements.

### Evidence

For a proposed or completed change, make it easy to answer:

- What changed?
- Why?
- Which objective does it serve?
- What did it cost?
- Which benchmark moved?
- Which reviewers disagreed?
- What was the risk/capability diff?
- Can it be rolled back?

### Attention

A concise section such as:

```text
Needs your attention           1
Interesting developments       3
Working autonomously           7
Dormant objectives             4
```

"Needs your attention" should be rare.

## Input should not require bureaucracy

A user should be able to write:

> "Hey, Mem0 released something interesting. Might be worth looking at."

The organization can decide whether that becomes:

- discussion only,
- research note,
- roadmap candidate,
- experiment,
- objective.

Do not force the human to perfectly classify every thought at entry time.

## Console milestone

A full usable Console is **not a v0 exit condition**.

During early v1, GitHub plus an external frontier coding session may remain the practical way to make changes. The Console should progressively absorb:

1. health/telemetry,
2. organizational discussion,
3. objective creation,
4. work visibility,
5. evidence/review,
6. governance/intervention.

The laptop becomes less necessary over time rather than disappearing at an artificial version boundary.
