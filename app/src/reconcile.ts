/**
 * Neuron reconciliation — M1/#13 (decisions/005, OBJ-005).
 *
 * Anti-Goodhart check (SELF_IMPROVEMENT.md): our seam-estimated
 * neuron accounting must reconcile against platform-measured truth
 * via the GraphQL Analytics API, read with a scoped, expiring token
 * that lives only in Worker secrets. Every call is policy-gated as
 * class "platform-read".
 *
 * Assumption recorded: the Cloudflare account is AINT-only, so
 * account-level Workers AI totals are comparable to our counters.
 */
import { checkAction } from "./policy";
import { counterStub } from "./telemetry";

const GQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
export const ACCOUNT_TAG = "237ac99e90351553143c5a40f9019b0d";
const DRIFT_THRESHOLD = 0.1;
const DATASET = "aiInferenceAdaptiveGroups";

async function gql(env: Env, query: string, variables: Record<string, unknown>) {
  const res = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()) as { data?: unknown; errors?: Array<{ message: string }> };
}

/**
 * Introspection probe: without a type name, lists account-level
 * dataset fields matching /ai/i; with one, lists that type's fields
 * (one level deep) so query field names can be confirmed empirically.
 */
export async function probe(env: Env, typeName: string | null): Promise<unknown> {
  const decision = checkAction({ class: "platform-read", detail: "gql-introspection" });
  if (!decision.allowed) return { error: decision.reason };
  if (typeName) {
    const r = await gql(
      env,
      "query($n: String!) { __type(name: $n) { name fields { name type { name ofType { name fields { name } } fields { name } } } } }",
      { n: typeName },
    );
    return r.errors ?? r.data;
  }
  const r = await gql(env, '{ __type(name: "account") { fields { name } } }', {});
  const fields =
    ((r.data as { __type?: { fields?: Array<{ name: string }> } })?.__type?.fields ?? [])
      .map((f) => f.name)
      .filter((n) => /ai/i.test(n));
  return r.errors ?? { aiRelatedDatasets: fields };
}

/**
 * Rolling-24h platform-measured neurons across ALL consumers/paths
 * (Worker binding + Actions compat) — the number the platform actually
 * enforces its rolling quota against. Cached via the caller.
 */
export async function platformRolling24h(env: Env): Promise<number | null> {
  const decision = checkAction({ class: "platform-read", detail: "rolling-neurons" });
  if (!decision.allowed) return null;
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const query = `query($t: String!, $d: Time!) { viewer { accounts(filter: {accountTag: $t}) {
    usage: aiInferenceAdaptiveGroups(limit: 500, filter: {datetimeHour_geq: $d}) { sum { totalNeurons } }
  } } }`;
  const r = await gql(env, query, { t: ACCOUNT_TAG, d: since });
  if (r.errors?.length) return null;
  const accounts = (r.data as { viewer?: { accounts?: Array<{ usage?: Array<{ sum?: { totalNeurons?: number } }> }> } })
    ?.viewer?.accounts;
  return (accounts?.[0]?.usage ?? []).reduce((a, g) => a + (g.sum?.totalNeurons ?? 0), 0);
}

export interface ReconcileResult {
  ok: boolean;
  kind: string;
  detail: string;
}

export async function reconcile(env: Env): Promise<ReconcileResult> {
  const stub = counterStub(env);
  const decision = checkAction({ class: "platform-read", detail: "neuron-reconciliation" });
  if (!decision.allowed) {
    return { ok: false, kind: "denied", detail: decision.reason };
  }
  const date = new Date().toISOString().slice(0, 10);
  const query = `query($t: String!, $d: String!) { viewer { accounts(filter: {accountTag: $t}) {
    usage: ${DATASET}(limit: 100, filter: {date: $d}) { sum { totalNeurons } dimensions { modelId } }
  } } }`;
  const r = await gql(env, query, { t: ACCOUNT_TAG, d: date });
  let result: ReconcileResult;
  if (r.errors?.length) {
    // GraphQL errors name valid fields — self-describing for followup.
    result = { ok: false, kind: "query-error", detail: r.errors.map((e) => e.message).join(" | ").slice(0, 600) };
  } else {
    const accounts = (r.data as { viewer?: { accounts?: Array<{ usage?: Array<{ sum?: { totalNeurons?: number } }> }> } })
      ?.viewer?.accounts;
    const platform = (accounts?.[0]?.usage ?? []).reduce((a, g) => a + (g.sum?.totalNeurons ?? 0), 0);
    const oursMilli = await stub.todayCount("neurons_milli");
    const ours = oursMilli / 1000;
    const drift = Math.abs(platform - ours) / Math.max(platform, 0.001);
    const summary = JSON.stringify({
      date,
      platformNeurons: Math.round(platform * 1000) / 1000,
      seamEstimate: ours,
      driftPct: Math.round(drift * 1000) / 10,
    });
    result =
      drift > DRIFT_THRESHOLD
        ? { ok: false, kind: "drift", detail: summary }
        : { ok: true, kind: "reconciled", detail: summary };
  }
  await stub.recordEvent("reconciliation", result.kind, result.detail);
  if (!result.ok && (result.kind === "drift" || result.kind === "query-error")) {
    // Anomaly -> task routing (#42): the organization files its own work.
    const { createIssue, githubConfigured } = await import("./github");
    if (githubConfigured(env)) {
      try {
        const url = await createIssue(
          env,
          `anomaly: reconciliation ${result.kind}`,
          `Autonomously filed by the reconciliation routine.\n\n**Observation:** ${result.detail}\n\n**Context for the assignee (agent or human):** seam estimates come from app/src/model.ts estimateNeurons; platform truth via GraphQL aiInferenceAdaptiveGroups (app/src/reconcile.ts). Known open questions: per-path billing discrepancy (compat endpoint >> binding estimates) and quota reset boundary != 00:00 UTC — see issue #39 capsule. Verify before changing budget math.`,
          ["agent-task"],
        );
        if (url) await stub.recordEvent("anomaly-router", "issue-filed", url);
      } catch (e) {
        await stub.recordEvent("anomaly-router", "issue-failed", String(e).slice(0, 200));
      }
    }
  }
  return result;
}

/** Cooldown: skip if a reconciliation event exists in the last 5 minutes. */
export async function recentlyReconciled(env: Env): Promise<boolean> {
  const events = await counterStub(env).listEvents(20);
  const last = events.find((e) => e.actor === "reconciliation");
  return !!last && Date.now() - Date.parse(last.ts) < 5 * 60 * 1000;
}
