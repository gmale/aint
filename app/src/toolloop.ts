/**
 * Tool loop harness — the seed of the agent runtime (M3) and the
 * instrument for experiments/002 (decisions/006: the harness is the
 * product).
 *
 * Protocol, designed for small open models: the model must reply with
 * ONLY a JSON object — {"tool": "<name>", "args": {...}} to act, or
 * {"final": "<answer>"} to finish. Malformed output gets one repair
 * prompt per step. Hard caps: MAX_STEPS steps, budget-checked
 * inference per step. All tools are deterministic; three are
 * read-only, one writes a bounded note event.
 */
import { authorPullRequest, githubConfigured, readRepoFile } from "./github";
import { workersAiProvider } from "./model";
import { checkAction, checkInferenceBudget, POLICY } from "./policy";
import { counterStub, recordModelCall } from "./telemetry";

const MAX_STEPS = 6;
const MAX_REPAIRS = 4;
/** Tool-driving default: only 10/10 model in experiments/002. */
export const TOOL_MODEL = "@cf/mistralai/mistral-small-3.1-24b-instruct";

interface ToolSpec {
  description: string;
  run(env: Env, args: Record<string, unknown>): Promise<string>;
}

const TOOLS: Record<string, ToolSpec> = {
  get_counter: {
    description: 'get_counter {"key": string} -> today\'s value of a telemetry counter (keys: requests, api_requests, model_calls, errors, messages)',
    async run(env, args) {
      const key = String(args.key ?? "");
      return String(await counterStub(env).todayCount(key));
    },
  },
  get_policy: {
    description: "get_policy {} -> active policy version and budgets",
    async run() {
      return JSON.stringify({
        version: POLICY.version,
        economicTier: POLICY.economicTier,
        dailyInferenceBudget: POLICY.dailyInferenceBudget,
        dailyMessageBudget: POLICY.dailyMessageBudget,
      });
    },
  },
  count_objectives: {
    description: "count_objectives {} -> number of objectives in the registry",
    async run(env) {
      const res = await env.ASSETS.fetch(new Request("https://internal/objectives.json"));
      const data = (await res.json()) as { objectives: unknown[] };
      return String(data.objectives.length);
    },
  },
  add: {
    description: 'add {"a": number, "b": number} -> arithmetic sum',
    async run(_env, args) {
      return String(Number(args.a) + Number(args.b));
    },
  },
  read_repo_file: {
    description: 'read_repo_file {"path": string} -> contents of a file on main (truncated at 20KB). Use exact paths; do not explore.',
    async run(env, args) {
      if (!githubConfigured(env)) return "github broker not configured";
      return await readRepoFile(env, String(args.path ?? ""));
    },
  },
  submit_edit_pr: {
    description:
      'submit_edit_pr {"path": string, "content": string, "title": string} -> replaces one file\'s full contents via a signed PR (protected main; humans/checks merge). Returns the PR URL. Max 48KB.',
    async run(env, args) {
      if (!githubConfigured(env)) return "github broker not configured";
      const path = String(args.path ?? "");
      const content = String(args.content ?? "");
      const title = String(args.title ?? "agent edit").slice(0, 70);
      if (!path || !content || content.length > 48_000) return "invalid path or content (max 48KB)";
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(content)));
      const pr = await authorPullRequest(env, {
        branch: `agent-edit/${Date.now()}`,
        title: `agent-edit: ${title}`,
        body: "Authored by the Worker-native tool loop (#61 lever: bounded-context editing — no Actions runner, no transcript accumulation). Single-file replacement; review the diff.",
        commitMessage: `agent-edit: ${title}`,
        files: [{ path, contentsBase64: b64 }],
      });
      return `PR opened: ${pr.url}`;
    },
  },
  record_note: {
    description: 'record_note {"text": string} -> records a note event (max 200 chars), returns "ok"',
    async run(env, args) {
      await counterStub(env).recordEvent("agent-task", "note", String(args.text ?? "").slice(0, 200));
      return "ok";
    },
  },
};

export interface StepTrace {
  raw: string;
  parsed: { tool?: string; args?: Record<string, unknown>; final?: string } | null;
  toolResult?: string;
  error?: string;
}

export interface TaskResult {
  final: string | null;
  stepsUsed: number;
  repairs: number;
  trace: StepTrace[];
  model: string;
  neuronsEstimated: number;
}

function systemPrompt(task: string): string {
  const toolList = Object.values(TOOLS).map((t) => `- ${t.description}`).join("\n");
  return `You are a tool-using agent. Complete the TASK using the tools.

Rules — follow them exactly:
1. Reply with ONLY one JSON object. No prose, no markdown, no explanation.
2. To use a tool: {"tool": "<name>", "args": {...}}
3. When you know the answer: {"final": "<answer>"}
4. Use tools to get facts. Never guess values a tool can provide.

Tools:
${toolList}

TASK: ${task}`;
}

function parseAction(text: string): StepTrace["parsed"] {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as Record<string, unknown>;
    if (typeof obj.final === "string" || typeof obj.final === "number") {
      return { final: String(obj.final) };
    }
    if (typeof obj.tool === "string") {
      return { tool: obj.tool, args: (obj.args ?? {}) as Record<string, unknown> };
    }
    return null;
  } catch {
    return null;
  }
}

export async function runTask(
  env: Env,
  ctx: ExecutionContext,
  task: string,
  model: string | undefined,
): Promise<TaskResult | { error: string; status: number }> {
  const decision = checkAction({ class: "inference", paid: false, detail: "tool-loop" });
  if (!decision.allowed) return { error: decision.reason, status: 403 };

  const provider = workersAiProvider(env, model ?? TOOL_MODEL);
  const sessionId = `task-${crypto.randomUUID().slice(0, 8)}`;
  const trace: StepTrace[] = [];
  let repairs = 0;
  let neurons = 0;
  let prompt = systemPrompt(task);

  for (let step = 0; step < MAX_STEPS; step++) {
    const used = await counterStub(env).todayCount("model_calls");
    if (!checkInferenceBudget(used).allowed) {
      return { error: "inference budget exhausted mid-task", status: 429 };
    }
    let result;
    try {
      result = await provider.generate({ prompt, maxTokens: 2000, sessionId });
    } catch (e) {
      // Backoff-and-retry once on gateway rate limiting — found the
      // hard way in experiments/002 (an entire model's run zeroed).
      if (/rate limit/i.test(String(e))) {
        await new Promise((r) => setTimeout(r, 2500));
        try {
          result = await provider.generate({ prompt, maxTokens: 2000, sessionId });
        } catch (e2) {
          trace.push({ raw: "", parsed: null, error: String(e2).slice(0, 200) });
          break;
        }
      } else {
        trace.push({ raw: "", parsed: null, error: String(e).slice(0, 200) });
        break;
      }
    }
    recordModelCall(env, ctx, {
      model: result.model,
      ok: true,
      latencyMs: result.latencyMs,
      totalTokens:
        result.usage.promptTokens !== null && result.usage.completionTokens !== null
          ? result.usage.promptTokens + result.usage.completionTokens
          : null,
      neuronsEstimated: result.neuronsEstimated,
    });
    neurons += result.neuronsEstimated ?? 0;

    const parsed = parseAction(result.text);
    const entry: StepTrace = { raw: result.text.slice(0, 300), parsed };
    trace.push(entry);

    if (!parsed) {
      repairs++;
      if (repairs > MAX_REPAIRS) break;
      prompt += `\n\nYour last reply was not a single valid JSON object. Reply with ONLY {"tool": ..., "args": ...} or {"final": ...}.`;
      continue;
    }
    if (parsed.final !== undefined) {
      return { final: parsed.final, stepsUsed: step + 1, repairs, trace, model: provider.model, neuronsEstimated: Math.round(neurons * 1000) / 1000 };
    }
    const tool = TOOLS[parsed.tool!];
    if (!tool) {
      entry.error = `unknown tool: ${parsed.tool}`;
      prompt += `\n\nYou called unknown tool "${parsed.tool}". Valid tools: ${Object.keys(TOOLS).join(", ")}.`;
      continue;
    }
    try {
      const toolResult = await tool.run(env, parsed.args ?? {});
      entry.toolResult = toolResult.slice(0, 300);
      prompt += `\n\nYou called ${parsed.tool}(${JSON.stringify(parsed.args)}). Result: ${toolResult}\nContinue. Reply with ONLY one JSON object.`;
    } catch (e) {
      entry.error = String(e).slice(0, 200);
      prompt += `\n\nTool ${parsed.tool} failed: ${entry.error}. Try a different approach.`;
    }
  }
  return { final: null, stepsUsed: trace.length, repairs, trace, model: provider.model, neuronsEstimated: Math.round(neurons * 1000) / 1000 };
}
