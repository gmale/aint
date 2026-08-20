# Decision 004 — M1 Console foundation design

- **Date:** 2026-08-21
- **Status:** active
- **Related:** issue #10 (scope), #11–#14 (remaining), decisions/001, `bootstrap/CONSOLE.md`

## Context

M1 needs a Console foundation: health, resource envelope, build/deploy status, and the first visible autonomous activity — on the free tier, without prematurely building M2's memory or a frontend stack.

## Decisions

1. **Console = static page, no build step.** Vanilla HTML/JS reading existing APIs (`/api/health`, `/api/telemetry`, `/api/events`, `/objectives.json`). Static assets are free/unlimited; a framework would be complexity without evidence it earns its place. Revisit when interactivity (M2 discussion input) demands it.
2. **Objectives live in a git-versioned file** (`app/public/objectives.json`), not a database. Changes arrive as reviewed commits through the canonical path — auditable, PR-able by humans and agents, zero new infrastructure. This is the seed of "the system creates tasks for itself" (4 of the 6 seed objectives are agent-created). M2 migrates live state to organizational memory with this file as the auditable origin.
3. **Events extend the existing counters DO** rather than a new class/store: an `events` table (capped at 500 rows) with `recordEvent`/`listEvents`. Smallest thing that feeds the activity panel; M2 designs the real schema with provenance.
4. **Heartbeat crons (2 of 5 free slots):** hourly health snapshot + policy-kernel self-test; daily budget-checked model call summarizing counters into a status event. The self-test asserts forbidden actions are DENIED and records a loud `FAILED` event if the kernel ever answers yes — the kernel is itself under test.
5. **Neuron accounting as `neurons_milli` counter** (integer milli-neurons) per model call, from verified per-model prices; displayed against the 10k/day allocation. Reconciliation against platform truth is #13 (needs a human token decision).

## Cost / blast radius

$0; ~25 cron invocations/day; 1 autonomous model call/day (~0.1–0.3 neurons), policy- and budget-checked like any other. Fail-closed everywhere.

## Reversibility

Every piece is independently removable: delete crons from wrangler.jsonc, drop the events table, revert the page. No new credentials, no new resources.
