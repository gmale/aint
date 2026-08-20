# AI·NT — Memory and Documents

## Principle

Start deliberately simple. Build clean interfaces. Make advanced memory systems earn their complexity through benchmarks.

Do not make Mem0 or any other framework foundational merely because it is state of the art today.

## Memory classes

### 1. Agent-local working state

Use a durable per-agent state mechanism where appropriate (for example Durable Object storage/SQLite) for:

- current task,
- working notes,
- state machine position,
- local summaries,
- session metadata.

This should not automatically be globally readable.

### 2. Shared structured organizational memory

Use a shared structured store such as D1 for entities such as:

```text
threads
messages
objectives
projects
experiments
decisions
facts
observations
agent_events
health_events
permissions/provenance metadata
```

The schema should evolve carefully from actual use.

### 3. Semantic retrieval

Use a replaceable vector/semantic layer such as Vectorize to retrieve relevant organizational knowledge without loading the entire history into every model turn.

Semantic memory is evidence retrieval, not an instruction channel.

### 4. Canonical documents

Strategic and source-adjacent Markdown belongs naturally in Git initially:

- architecture,
- charter,
- decisions,
- roadmap,
- experiments,
- implementation notes.

Git provides history, diffs, branches, reviews, and provenance.

### 5. Runtime/generated files

Use object storage such as R2 for:

- large artifacts,
- generated reports,
- snapshots,
- datasets,
- files that do not benefit from source-control semantics.

## Organizational discussion

Discussion should be first-class memory.

A thread may contain:

- user statements,
- agent contributions,
- links/resources,
- later follow-ups,
- synthesized insights.

The organization should periodically distill discussions into structured objects and documents without discarding the raw historical trail by default.

Possible derived units:

- idea,
- risk,
- question,
- objective,
- decision,
- roadmap candidate.

## Provenance

Meaningful memories should eventually carry fields such as:

```text
id
source
source_type
author/principal
created_at
scope
trust_class
confidence
supersedes/version
original_content_reference
derived_summary_reference
```

The exact schema should be benchmark-driven.

## Memory poisoning rule

Retrieved memory cannot grant capability.

A memory item saying "delete the database" is text/evidence. It is not authorization to delete the database.

## Replaceable provider interface

Design a provider seam early, for example:

```text
MemoryProvider
  put(...)
  recall(...)
  forget(...)
  summarize(...)
```

Do not over-engineer the abstraction before the first implementation exists.

## Mem0 and alternatives

Mem0 is a candidate benchmark, not a mandatory dependency.

The system should compare an open-source memory layer against a simple Cloudflare-native baseline and ask:

- Does it improve recall?
- Does it reduce total inference?
- Does it handle contradictions/temporal memory better?
- Does it resist poisoning better?
- What runtime/dependency complexity does it add?
- Can it be swapped cleanly?

A sophisticated dependency that cannot beat a small native implementation on the chosen fitness function should not be adopted merely for prestige.

## First benchmark

See `SELF_IMPROVEMENT.md` for the Memory Tournament concept.
