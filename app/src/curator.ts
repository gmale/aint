/**
 * Curator — #27. Objectives carry machine-checkable `done_when`
 * probes; the curator evaluates them deterministically (no model) and
 * reconciles registry drift through governed PRs (the PR #25 shape,
 * generalized). One curator PR per UTC day at most; flapping checks
 * cannot spam.
 */
import { authorPullRequest, branchExists, githubConfigured } from "./github";
import { counterStub } from "./telemetry";

export interface DoneWhen {
  url: string;
  /** Dot-path into the JSON response; omit to check HTTP status only. */
  path?: string;
  /** Expected extracted value (string compare) — or expected HTTP status when path omitted. */
  expect: string | number;
}

interface Objective {
  id: string;
  status: string;
  done_when?: DoneWhen;
  [k: string]: unknown;
}

async function probe(env: Env, check: DoneWhen): Promise<{ pass: boolean; observed: string }> {
  try {
    const headers: Record<string, string> = { "user-agent": "aint-curator" };
    if (check.url.startsWith("https://api.github.com/") && githubConfigured(env)) {
      headers.authorization = `Bearer ${env.GITHUB_TOKEN_AINT.trim()}`;
    }
    const res = await fetch(check.url, { headers, signal: AbortSignal.timeout(8000) });
    if (check.path === undefined) {
      return { pass: res.status === Number(check.expect), observed: `status ${res.status}` };
    }
    if (!res.ok) return { pass: false, observed: `status ${res.status}` };
    let value: unknown = await res.json();
    for (const key of check.path.split(".")) {
      value = (value as Record<string, unknown> | undefined)?.[key];
    }
    return { pass: String(value) === String(check.expect), observed: String(value).slice(0, 80) };
  } catch (e) {
    return { pass: false, observed: `probe error: ${String(e).slice(0, 80)}` };
  }
}

export async function runCurator(env: Env): Promise<void> {
  if (!githubConfigured(env)) return;
  const stub = counterStub(env);
  const branch = `curator/${new Date().toISOString().slice(0, 10)}`;
  if (await branchExists(env, branch)) return; // one reconciliation/day

  const res = await env.ASSETS.fetch(new Request("https://internal/objectives.json"));
  const registry = (await res.json()) as { objectives: Objective[]; [k: string]: unknown };

  const drifts: string[] = [];
  for (const obj of registry.objectives) {
    if (!obj.done_when) continue;
    const { pass, observed } = await probe(env, obj.done_when);
    if (pass && obj.status !== "done") {
      drifts.push(`${obj.id}: ${obj.status} -> done (observed: ${observed})`);
      obj.status = "done";
    } else if (!pass && obj.status === "done") {
      drifts.push(`${obj.id}: done -> regressed (observed: ${observed}; expected ${obj.done_when.expect})`);
      obj.status = "regressed";
    }
  }
  if (drifts.length === 0) return;

  const content = JSON.stringify(registry, null, 2) + "\n";
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(content)));
  try {
    const pr = await authorPullRequest(env, {
      branch,
      title: `curator: reconcile ${drifts.length} objective status(es) with reality`,
      body: `Deterministic done_when probes disagreed with the registry:\n\n${drifts.map((d) => `- ${d}`).join("\n")}\n\nAuthored autonomously by the curator (hourly heartbeat). No model was involved in these judgments; every check is reproducible from the done_when spec in the diff.`,
      commitMessage: `curator: reconcile objective statuses (${drifts.length} drift(s))`,
      files: [{ path: "app/public/objectives.json", contentsBase64: b64 }],
    });
    await stub.recordEvent("curator", "pr-opened", `${pr.url} — ${drifts.join("; ")}`.slice(0, 500));
  } catch (e) {
    await stub.recordEvent("curator", "pr-failed", String(e).slice(0, 300));
  }
}
