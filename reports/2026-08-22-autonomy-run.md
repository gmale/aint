# Autonomy run report — 2026-08-22

Requested: decompose decision 009 (+ open roadmap) into tasks and execute to the practical limit; where blocked, document goal, blocker, mitigations tried, and viable scope reductions.

## Executed this run (all live in production)

1. **Curator + done_when** (#27 deterministic half): objectives carry machine-checkable probes; hourly curator reconciles drift via ≤1 governed PR/day, no model in the judgment path. First autonomous catch expected at the next heartbeat (OBJ-004's probe already contradicts its recorded status).
2. **Registry hygiene**: probes on OBJ-001/004/008/009; OBJ-005 corrected to done (evidence #13).
3. **Decision-009 pilot staged end-to-end**: `.github/workflows/agent-task.yml` (issue-label trigger; mini-swe-agent against our AI Gateway compat endpoint; squash-only merge contract; fails closed without its secret) + `automation/ACTIVATION.md`. The feared workflow-scope push rejection did not occur — file is live on main.
4. **Console envelope panel** now renders `/api/envelope` (deterministic limits math, binds-first indicator).
5. Earlier same day: envelope report replacing model-prose daily report; Access identity attribution (dormant until the Access app exists); harness survey + decision 009 (experiments/003); issues #27/#28 filed, #28 closed.

## Blocked — with mitigations tried and scope reductions available

### B1. Actions peripheral cannot run (goal: first Actions-hosted coding task)
- **Blocker:** needs `CF_AI_TOKEN` (Workers AI API token) as a repo Actions secret. Minting a Cloudflare API token is dashboard-only, human-only.
- **Mitigations tried:** inventoried existing credentials — wrangler OAuth (not extractable by design), CF_ANALYTICS_TOKEN (analytics-read only, and lives in Worker secrets). Neither can authorize inference on the compat endpoint. Workflow written to fail closed with a self-explaining guard instead of erroring cryptically.
- **Scope reduction:** none needed — activation is a 3-minute human checklist (`automation/ACTIVATION.md`); everything after it is automated.

### B2. `tools` pass-through check on the compat endpoint (experiments/003 open question)
- **Blocker:** same missing token (the check is one authenticated curl).
- **Mitigation:** pilot choice (mini-swe-agent) is deliberately immune — bash-only, no native tool calling. The check gates only the goose/opencode upgrade path.

### B3. Access application (goal: gated Console, intake loop, private-work precondition)
- **Blocker:** human reported the Zero Trust UI didn't match the provided steps; left before completing. Cannot be created from here: no credential with Access:Edit exists (offered token-lease alternative remains open).
- **Mitigations tried:** verified docs pathway earlier; shipped the Worker-side identity code so activation is click-only; OBJ-008's done_when probe now watches for it, so the curator will detect and record the moment it goes live — no human report needed.
- **Scope reduction available:** pre-shared-key gate (~40 lines, no dashboard) — previously assessed as stage-appropriate; deliberately NOT built tonight to avoid preempting the near-complete Access setup. Say the word and it ships in one PR.

### B4. Registrar verification (goal: defuse suspension clock)
- **Blocker:** entirely inside the human's inbox/dashboard (contact-change approvals). Nothing server-side remains on our side; both zones' routing verified working by live test.
- **Mitigation if approvals also fail to arrive:** Cloudflare support ticket citing suppression-after-bounce; drafted wording available on request.

### B5. Model-assisted intake distillation (threads → proposed objectives)
- **Blocker:** deliberately sequenced behind Access (B3): distilling *public-writable* threads into objectives would let strangers inject workload.
- **Scope reduction:** could ship reading only `human-verified`-authored messages — but none can exist until Access is live, so the sequencing stands.

## Judgment note

Two candidate work items were considered and deferred within budget discipline: the #14 statistical gauntlet rerun (≈500 neurons; better run after the gpt-oss protocol adapter, together, once) and the PSK gate (B3 reduction). Both are one-command away.
