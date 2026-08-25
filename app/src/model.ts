/**
 * Model provider seam — V0.5 (issue #5).
 *
 * Small on purpose (bootstrap/MEMORY.md §Replaceable provider
 * interface): enough to swap models/providers and compare them later,
 * no speculative abstraction.
 *
 * MODELS is the allowlist of verified free-tier candidates with
 * per-token pricing (experiments/000 §4 + official model pages,
 * verified 2026-08-20). Neuron estimates derive from the verified
 * $0.011-per-1,000-neurons rate; the dashboard meter remains ground
 * truth (anti-Goodhart: our estimate must reconcile against it).
 */

export interface ModelInfo {
  /** USD per million input tokens (verified). */
  inPerM: number;
  /** USD per million output tokens (verified). */
  outPerM: number;
}

export const MODELS: Record<string, ModelInfo> = {
  "@cf/meta/llama-3.2-1b-instruct": { inPerM: 0.027, outPerM: 0.2 },
  "@cf/ibm-granite/granite-4.0-h-micro": { inPerM: 0.017, outPerM: 0.11 },
  "@cf/qwen/qwen3-30b-a3b-fp8": { inPerM: 0.051, outPerM: 0.34 },
  "@cf/openai/gpt-oss-20b": { inPerM: 0.2, outPerM: 0.3 },
  "@cf/mistralai/mistral-small-3.1-24b-instruct": { inPerM: 0.35, outPerM: 0.56 },
};

// Evidence-based default: experiments/001 (5/6 tasks at ~0.2 neurons/call).
export const DEFAULT_MODEL = "@cf/ibm-granite/granite-4.0-h-micro";

/**
 * All Workers AI calls route through this AI Gateway for free
 * request/response logging and analytics (decisions/003). The gateway
 * must exist in the account or calls fail closed.
 */
export const AI_GATEWAY_ID = "aint";
const NEURONS_PER_USD = 1000 / 0.011;
const DEFAULT_MAX_TOKENS = 256;
const MAX_TOKENS_CAP = 4096;

export function estimateNeurons(
  model: string,
  promptTokens: number | null,
  completionTokens: number | null,
): number | null {
  const info = MODELS[model];
  if (!info || promptTokens === null || completionTokens === null) return null;
  const usd = (promptTokens * info.inPerM + completionTokens * info.outPerM) / 1_000_000;
  return Math.round(usd * NEURONS_PER_USD * 1000) / 1000;
}

export interface GenerateRequest {
  prompt: string;
  maxTokens?: number;
  /** x-session-affinity key: pins turns to one instance for prefix-cache reuse. */
  sessionId?: string;
}

export interface GenerateResult {
  text: string;
  model: string;
  latencyMs: number;
  usage: { promptTokens: number | null; completionTokens: number | null };
  /** Estimated from verified pricing; null when usage is unreported. */
  neuronsEstimated: number | null;
}

export interface ModelProvider {
  readonly model: string;
  generate(req: GenerateRequest): Promise<GenerateResult>;
}

/**
 * Workers AI response shapes vary by model family (experiments/001):
 * llama returns `{response: string}`; granite/gpt-oss/qwen return
 * OpenAI chat-completions `{choices: [{message: {content}}]}` (with
 * reasoning in a separate field); responses-style `{output: [...]}`
 * kept as a fallback.
 */
function extractText(result: Record<string, unknown>): string {
  if (typeof result.response === "string") return result.response;
  if (Array.isArray(result.choices)) {
    const message = (result.choices[0] as { message?: { content?: unknown } } | undefined)?.message;
    if (typeof message?.content === "string") return message.content;
  }
  if (Array.isArray(result.output)) {
    return result.output
      .filter((item): item is { type?: string; content?: unknown } => typeof item === "object" && item !== null)
      .filter((item) => item.type === "message" && Array.isArray(item.content))
      .flatMap((item) => item.content as Array<{ text?: unknown }>)
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("");
  }
  return "";
}

export function workersAiProvider(env: Env, model: string = DEFAULT_MODEL): ModelProvider {
  if (!(model in MODELS)) {
    throw new Error(`model not in verified allowlist: ${model}`);
  }
  return {
    model,
    async generate(req: GenerateRequest): Promise<GenerateResult> {
      const start = Date.now();
      // Chat-messages input, not raw prompt: instruct models need their
      // chat template applied, and raw-prompt continuation produced
      // empty/rambling output for 3 of 5 verified models
      // (experiments/001 run 1).
      const result = (await env.AI.run(
        model as Parameters<Env["AI"]["run"]>[0],
        {
          messages: [{ role: "user", content: req.prompt }],
          max_tokens: Math.min(req.maxTokens ?? DEFAULT_MAX_TOKENS, MAX_TOKENS_CAP),
        },
        {
          gateway: { id: AI_GATEWAY_ID },
          ...(req.sessionId ? { extraHeaders: { "x-session-affinity": req.sessionId } } : {}),
        } as Parameters<Env["AI"]["run"]>[2],
      )) as Record<string, unknown>;
      const usage = (result.usage ?? {}) as { prompt_tokens?: number; completion_tokens?: number };
      const promptTokens = usage.prompt_tokens ?? null;
      const completionTokens = usage.completion_tokens ?? null;
      return {
        text: extractText(result),
        model,
        latencyMs: Date.now() - start,
        usage: { promptTokens, completionTokens },
        neuronsEstimated: estimateNeurons(model, promptTokens, completionTokens),
      };
    },
  };
}
