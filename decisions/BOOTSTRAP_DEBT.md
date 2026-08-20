# Bootstrap Debt Ledger

Every credential, manual action, or unilateral authority the V0 bootstrap relied on
(`bootstrap/GOVERNANCE.md` §Bootstrap governance debt). Each entry names the authority,
why it was needed, its scope, and how V1+ should reduce it. Last updated: 2026-08-20.

## D1 — GitHub CLI OAuth token (human laptop)

- **Authority:** `gh` token for account `gmale`; scopes `repo`, `project`, `gist`, `admin:public_key`, `read:org`.
- **Why:** repo creation, issue/label/milestone management, project board automation during bootstrap.
- **Risk:** laptop compromise = full repository and project control.
- **Reduction:** V1 should move routine repo automation to organization-owned, narrowly scoped credentials (or GitHub App), leaving the human token for genuinely human actions.

## D2 — Wrangler OAuth token (human laptop)

- **Authority:** Cloudflare OAuth for account `KVG Cloudflare` (237ac99e…); workers/KV/routes/scripts write.
- **Why:** initial manual deploys (V0.2, V0.3) and local dev with remote AI binding before Workers Builds existed.
- **Risk:** laptop compromise = production Worker deploy/delete authority.
- **Reduction:** canonical deploys now flow through Workers Builds (#7). Token remains break-glass only; V1 should decide whether to revoke or formally scope it.

## D3 — Repo write implies production deploy (partially reduced 2026-08-21)

- **Authority:** Cloudflare GitHub App watches `main` of `gmale/aint`, path `app/`; any push to `main` builds and deploys to production.
- **Why:** V0's accepted simplification (`bootstrap/ARCHITECTURE.md` §Source is not deployment authority).
- **Reduced (issue #12):** branch protection on `main` — PRs required, 1 approving review, force pushes blocked. Non-admin write access no longer deploys directly.
- **Remaining risk:** "Do not allow bypassing" is off, so the admin credential (D1) can still push `main` directly and can admin-merge unapproved PRs — the laptop token retains full deploy authority. Also: 1-required-approval + a single human identity means agent PRs cannot merge without either human approval (blocks the autonomous loop) or admin bypass (defeats the control).
- **Further reduction:** near-term, decide between (a) approvals=0 + bypass disallowed — every change gets a PR evidence trail and direct pushes truly reject, autonomy preserved; or (b) keep 1 approval and accept human-gated merges until M3/M4 policy machinery (risk-classed autonomous merge, second identity) exists. Long-term: artifact promotion so merge ≠ deploy.

## D4 — Human-held platform accounts

- **Authority:** GitHub account `gmale` and Cloudflare account (owner-held email) are unilaterally human-controlled; both were created/authorized manually (account creation, terms acceptance, GitHub↔Cloudflare OAuth grant, Analytics Engine enablement, build-caching opt-in).
- **Why:** external authority boundaries only a human can cross (`bootstrap/BOOTSTRAP.md` §Human checkpoints).
- **Risk:** owner absence or compromise affects everything; no second identity exists.
- **Reduction:** V1 M4 should define owner-absence behavior and consider recovery paths; child systems get independent identities (`bootstrap/VISION.md`).

## D5 — Analytics read token (provisioned 2026-08-21 as a lease)

- **Authority:** `CF_ANALYTICS_TOKEN` Worker secret — "Read analytics and logs" template scope, account-limited, **expires ~2026-12-19** (120-day lease chosen by the human deliberately; renewal is an explicit decision, not an automatic event).
- **Why:** anti-Goodhart neuron reconciliation (#13, decisions/005). First durable secret; entered via `wrangler secret put` in a separate terminal — never chat, repo, or logs.
- **Risk:** read-only observability exposure on compromise, bounded by expiry.
- **Renewal watch:** reconciliation will start failing with auth errors near expiry — the `query-error` events are the tripwire. Decide renewal (or retire the capability) before 2026-12-19.

## D6 — Single production environment

- **Authority/gap:** no staging environment; every deploy is production.
- **Why:** V0 blast radius is free-tier and non-sensitive.
- **Reduction:** V1 M4 introduces Autonomy Cell / staging / production zones (`bootstrap/ARCHITECTURE.md` §Environments).
