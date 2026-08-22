# Activating the Actions coding peripheral (decision 009)

Blocked-on-human checklist — each item is a lease-pattern credential or a one-time setting:

1. **Mint a Workers AI API token** (dashboard → My Profile → API Tokens → Create → Custom): permission `Account | Workers AI | Read` (the compat endpoint runs inference under Read), account-scoped, ~120-day expiry. Never paste into chat.
2. **Store it as a repo Actions secret** (terminal): `gh secret set CF_AI_TOKEN -R gmale/aint` (paste at prompt). Ledger entry D-series on completion.
3. Optional but recommended one-curl check (experiments/003 open question): does the compat endpoint pass the `tools` array through? mini-swe-agent doesn't need it; goose/opencode do.
4. **Pilot run**: create an issue whose body is a small, bounded task ("add a --version flag to scripts/gen-build-info.mjs and document it"), label it `agent-task`, watch the Actions run, review the PR. **Squash-merge only** (branch commits are unsigned; main requires signed).
5. Budget note: each heavy session ≈ hundreds of thousands of tokens ≈ a meaningful slice of the 10k free neurons/day. Policy kernel gains an `actions_sessions_day` budget when the pilot proves out (curator/registry-class work stays in the Worker loop).

Verification stance: the exact `mini` CLI flags and litellm model string are best-effort from experiments/003 sources and MUST be verified on first activation run — expect one iteration.
