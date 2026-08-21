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
import { workersAiProvider } from "./model";
import { checkAction, checkInferenceBudget, POLICY } from "./policy";
import { counterStub, recordModelCall } from "./telemetry";

const MAX_STEPS = 6;
const MAX_REPAIRS = 4;

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

  const provider = workersAiProvider(env, model);
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
      result = await provider.generate({ prompt, maxTokens: 200 });
    } catch (e) {
      trace.push({ raw: "", parsed: null, error: String(e).slice(0, 200) });
      break;
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
