/**
 * GitHub broker — M3/#19 (decisions/007).
 *
 * The ONLY code path that touches GITHUB_TOKEN_AINT. Models never see
 * the token and never call this directly: agent code invokes narrow,
 * policy-gated operations (SECURITY.md §Secrets, tool-broker pattern).
 *
 * Capabilities: create branch, commit files (GraphQL
 * createCommitOnBranch — commits are signed by GitHub and satisfy
 * branch protection), open PR. Deliberately absent: merge, close,
 * force-push, admin. Budget: POLICY.dailyPrBudget via github_prs
 * counter. Repo is hardcoded — this broker cannot touch anything else.
 */
import { checkAction, checkPrBudget } from "./policy";
import { counterStub } from "./telemetry";

const REPO = "gmale/aint";
const API = "https://api.github.com";
const GQL = "https://api.github.com/graphql";

function headers(env: Env): Record<string, string> {
  // trim(): a trailing newline in a pasted secret produces 401s.
  return {
    authorization: `Bearer ${env.GITHUB_TOKEN_AINT.trim()}`,
    accept: "application/vnd.github+json",
    "user-agent": "aint-agent",
    "content-type": "application/json",
  };
}

export function githubConfigured(env: Env): boolean {
  return typeof env.GITHUB_TOKEN_AINT === "string" && env.GITHUB_TOKEN_AINT.length > 20;
}

export async function branchExists(env: Env, branch: string): Promise<boolean> {
  const res = await fetch(`${API}/repos/${REPO}/git/ref/${encodeURIComponent(`heads/${branch}`)}`, {
    headers: headers(env),
  });
  return res.ok;
}

async function mainHeadOid(env: Env): Promise<string> {
  const res = await fetch(`${API}/repos/${REPO}/git/ref/heads/main`, { headers: headers(env) });
  if (!res.ok) throw new Error(`get main head: ${res.status} ${(await res.text()).slice(0, 100)}`);
  const data = (await res.json()) as { object: { sha: string } };
  return data.object.sha;
}

/**
 * Read-only diagnosis: token validity and repo visibility, never the
 * token itself. Safe to expose (worst case a stranger learns whether
 * our token works).
 */
export async function selfTest(env: Env): Promise<Record<string, unknown>> {
  if (!githubConfigured(env)) return { configured: false };
  const out: Record<string, unknown> = { configured: true, tokenLength: env.GITHUB_TOKEN_AINT.trim().length };
  const who = await fetch(`${API}/user`, { headers: headers(env) });
  out.userEndpoint = `${who.status} ${who.ok ? ((await who.json()) as { login: string }).login : (await who.text()).slice(0, 80)}`;
  const ref = await fetch(`${API}/repos/${REPO}/git/ref/heads/main`, { headers: headers(env) });
  out.refEndpoint = `${ref.status}${ref.ok ? "" : " " + (await ref.text()).slice(0, 80)}`;
  return out;
}

export interface PrRequest {
  branch: string;
  title: string;
  body: string;
  commitMessage: string;
  files: Array<{ path: string; contentsBase64: string }>;
}

export interface PrResult {
  url: string;
  number: number;
}

/** Branch from main, commit files (GitHub-signed), open a PR. */
export async function authorPullRequest(env: Env, req: PrRequest): Promise<PrResult> {
  const decision = checkAction({ class: "github-write", detail: `pr:${req.branch}` });
  if (!decision.allowed) throw new Error(`policy: ${decision.reason}`);
  const stub = counterStub(env);
  const budget = checkPrBudget(await stub.todayCount("github_prs"));
  if (!budget.allowed) throw new Error(`policy: ${budget.reason}`);

  const head = await mainHeadOid(env);
  const ref = await fetch(`${API}/repos/${REPO}/git/refs`, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify({ ref: `refs/heads/${req.branch}`, sha: head }),
  });
  if (!ref.ok && ref.status !== 422) throw new Error(`create branch: ${ref.status}`); // 422 = exists

  const commit = await fetch(GQL, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify({
      query: `mutation($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) { commit { oid } } }`,
      variables: {
        input: {
          branch: { repositoryNameWithOwner: REPO, branchName: req.branch },
          message: { headline: req.commitMessage },
          expectedHeadOid: head,
          fileChanges: { additions: req.files.map((f) => ({ path: f.path, contents: f.contentsBase64 })) },
        },
      },
    }),
  });
  const commitData = (await commit.json()) as { data?: unknown; errors?: Array<{ message: string }> };
  if (commitData.errors?.length) throw new Error(`commit: ${commitData.errors[0].message.slice(0, 200)}`);

  const pr = await fetch(`${API}/repos/${REPO}/pulls`, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify({ title: req.title, head: req.branch, base: "main", body: req.body }),
  });
  if (!pr.ok) throw new Error(`open pr: ${pr.status} ${(await pr.text()).slice(0, 150)}`);
  const prData = (await pr.json()) as { html_url: string; number: number };
  await stub.increment(["github_prs"]);
  return { url: prData.html_url, number: prData.number };
}

/**
 * First cloud-authored PR: a deterministic, evidence-based change —
 * mark OBJ-007 done (its success criteria were met by
 * experiments/002). Runs from the hourly heartbeat; idempotent via
 * branch existence.
 */
export const FIRST_PR_BRANCH = "agent/obj-007-done";

export async function maybeAuthorFirstPr(env: Env): Promise<void> {
  if (!githubConfigured(env)) return;
  const stub = counterStub(env);
  if (await branchExists(env, FIRST_PR_BRANCH)) return;

  const res = await env.ASSETS.fetch(new Request("https://internal/objectives.json"));
  const registry = (await res.json()) as {
    objectives: Array<{ id: string; status: string; [k: string]: unknown }>;
  };
  const obj = registry.objectives.find((o) => o.id === "OBJ-007");
  if (!obj || obj.status === "done") return;
  obj.status = "done";

  const content = JSON.stringify(registry, null, 2) + "\n";
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(content)));
  try {
    const pr = await authorPullRequest(env, {
      branch: FIRST_PR_BRANCH,
      title: "agent: mark OBJ-007 done (evidence: experiments/002)",
      body: "Authored autonomously by the AINT Worker via the GitHub broker.\n\nOBJ-007 (tool-use harness for open-weight models) defines success as: experiments/002 reports per-model task completion, step efficiency, and malformed-output rates through the harness. That record shipped in `experiments/002-tool-use.md` (mistral-small 10/10). This PR updates the registry to match the evidence.\n\nBroker guarantees: commit signed by GitHub, no merge capability, policy class `github-write`, daily PR budget enforced.",
      commitMessage: "agent: mark OBJ-007 done (evidence: experiments/002)",
      files: [{ path: "app/public/objectives.json", contentsBase64: b64 }],
    });
    await stub.recordEvent("github-broker", "pr-opened", `${pr.url} — first cloud-authored PR`);
  } catch (e) {
    await stub.recordEvent("github-broker", "pr-failed", String(e).slice(0, 300));
  }
}
