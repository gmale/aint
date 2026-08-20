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

## D3 — Repo write implies production deploy

- **Authority:** Cloudflare GitHub App watches `main` of `gmale/aint`, path `app/`; any push to `main` builds and deploys to production.
- **Why:** V0's accepted simplification (`bootstrap/ARCHITECTURE.md` §Source is not deployment authority).
- **Risk:** a compromised GitHub account or approved-but-malicious commit deploys immediately. No branch protection is configured on `main`.
- **Reduction:** V1 M3/M4 — branch protection + PR evidence path, then artifact promotion so merge ≠ deploy.

## D4 — Human-held platform accounts

- **Authority:** GitHub account `gmale` and Cloudflare account (owner-held email) are unilaterally human-controlled; both were created/authorized manually (account creation, terms acceptance, GitHub↔Cloudflare OAuth grant, Analytics Engine enablement, build-caching opt-in).
- **Why:** external authority boundaries only a human can cross (`bootstrap/BOOTSTRAP.md` §Human checkpoints).
- **Risk:** owner absence or compromise affects everything; no second identity exists.
- **Reduction:** V1 M4 should define owner-absence behavior and consider recovery paths; child systems get independent identities (`bootstrap/VISION.md`).

## D5 — Deliberately unprovisioned: Analytics Engine read token

- **Authority:** none (this is an anti-debt entry).
- **Why:** reading AE from the Worker requires an API token secret; V0 avoided its first durable secret by serving reads from the counters DO instead (decisions/001).
- **Reduction:** when Console (M1) needs richer queries, provision a minimal read-only token as a governed secret via `wrangler secret put` — never in source.

## D6 — Single production environment

- **Authority/gap:** no staging environment; every deploy is production.
- **Why:** V0 blast radius is free-tier and non-sensitive.
- **Reduction:** V1 M4 introduces Autonomy Cell / staging / production zones (`bootstrap/ARCHITECTURE.md` §Environments).
