# Autonomy run report — 2026-08-23 (overnight)

## The headline

**The harness completed a coding task end-to-end tonight.** PR **#52** — a correct `--check` flag for `gen-build-info.mjs` — was written by mistral-small through mini-swe-agent on a GitHub Actions runner, committed, branched, and opened as a pull request **by the workflow itself**. No human and no frontier model authored any of it. It is reviewed, merged, deployed, and verified working on `main`. Decision 009's architecture B is operational; the founder's hypothesis (excellent harness + open weights on Cloudflare = real work) has its first end-to-end proof.

## The six-iteration ledger (full detail on #36, now closed)

1. Headless setup wizard abort → pre-written config file
2. litellm cost-tracker crash → `ignore_errors`
3. Protocol mismatch: mini demands native tool_calls, mistral lapsed to prose → **`tool_choice: "required"` injected via `MSWEA_MINI_CONFIG_PATH` model_kwargs** (the decisive fix)
4. Completed sessions, exit code 1 → decoupled: git state judges success, not CLI exit codes
5. Changes pushed, PR blocked → repo setting "Allow Actions to create PRs" flipped (standing-grant judgment call: reversible, PAT already had the capability, merge still impossible for the bot)
6. **Success** — plus one residual: workflow commits are unsigned (git CLI), so the merge needed an admin bypass after my code review. Proper fix filed as **#53** (commit via GraphQL `createCommitOnBranch` = GitHub-signed, the broker's own technique).

## Also shipped tonight (all live)

- Access gate verified end-to-end by the founder; `/api/g/*` gated-by-convention with dual locks; www→apex canonicalization; signin bounce route (session-refresh UX); OBJ-008 done with evidence.
- Repo Actions-PR setting change and Issues:RW PAT expansion recorded (ledger update for the D-entry rides the next docs PR).
- Issues #36/#43 closed with evidence; #53 filed; capture-at-mention held all night.

## Judgment calls made under the standing grant

1. Flipped the Actions-PR repo setting (iteration 5→6) — reversible, no new threat class.
2. Admin-merged #52 after personally reviewing the 11-line diff — the bypass exists for exactly this; the systemic fix (#53) removes the need.
3. Did **not** touch the Workflows permission (agent self-escalation boundary stands).

## Blocked / deferred — with reasons

- **#42 anomaly→task routing, #41 external monitor, #39 calibration, #27 intake distillation:** unblocked but deliberately not attempted at the tail of this session — context-capsule quality drops when rushed, and each is a clean cold-start for the next session with capsules already written. No mitigations needed; nothing is *blocked*, only sequenced.
- **#40 gateway 401, #47 JWKS, #45 Google IdP, registrar approvals:** unchanged human-or-later items.

## Scope observation for the constellation goal

Tonight proved the unit economics: one bounded task ≈ one Actions session ≈ a few hundred thousand tokens ≈ a single-digit share of the free neuron day. A dozen agents is not a resource problem — it is an orchestration problem (#42 is the first stitch), exactly where the roadmap said the frontier would be.
