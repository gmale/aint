# Decision 007 — Policy v0.5.0: github-write class and the GitHub broker

- **Date:** 2026-08-21
- **Status:** active
- **Related:** #19, OBJ-009, decisions/005 (precedent), `bootstrap/SECURITY.md` §Secrets

## Context

The system needs hands: the ability to author changes to its own repository. The credential (`GITHUB_TOKEN_AINT`, fine-grained PAT: `gmale/aint` only, Contents+PRs read/write, ~120-day lease per the D5 pattern) was human-provisioned into Worker secrets.

## Decision

New action class **`github-write`** (policy v0.5.0): branch/commit/PR against our own repository, exclusively through `app/src/github.ts` (the broker). Budget: **5 PRs/UTC day**.

## Why this is safe against bad actors (threat analysis)

1. **Token exfiltration via prompt injection: not possible.** The token appears in no prompt, no model context, no log. Models request operations; broker code performs them (tool-broker pattern).
2. **Capability ceiling: PR-shaped.** The broker implements branch/commit/PR only — no merge, no close, no force-push, no admin, no other repo (hardcoded). Merging remains outside agent capability entirely; `main` keeps its protection (PR required, signed commits, no bypass).
3. **Every action is visible and revertible:** an agent gone wrong produces at most 5 open PRs/day for humans to see — not deployed code.
4. **Public surfaces have no path here:** the public `/api/agent/task` tool tier contains no GitHub tools; broker calls originate only from scheduled internal code (and, later, Access-gated endpoints).
5. **Signed-commit compliance:** commits via GraphQL `createCommitOnBranch` are signed by GitHub — agent PRs satisfy the same protection humans do.

## First exercise

`maybeAuthorFirstPr` (heartbeat-triggered, idempotent): a deterministic, evidence-based registry change — OBJ-007 → done, citing experiments/002. Chosen deliberately: the first cloud-authored PR should be verifiable by inspection, not model-generated code.

## Reversibility

Revoke the PAT (dashboard) and/or delete the Worker secret; remove the class in a version bump. Expiry ~120 days forces re-decision regardless.
