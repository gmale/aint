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

export const DEFAULT_MODEL = "@cf/meta/llama-3.2-1b-instruct";
const NEURONS_PER_USD = 1000 / 0.011;
const MAX_TOKENS_CAP = 256;

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

export function workersAiProvider(env: Env, model: string = DEFAULT_MODEL): ModelProvider {
  if (!(model in MODELS)) {
    throw new Error(`model not in verified allowlist: ${model}`);
  }
  return {
    model,
    async generate(req: GenerateRequest): Promise<GenerateResult> {
      const start = Date.now();
      const result = (await env.AI.run(model as Parameters<Env["AI"]["run"]>[0], {
        prompt: req.prompt,
        max_tokens: Math.min(req.maxTokens ?? MAX_TOKENS_CAP, MAX_TOKENS_CAP),
      })) as { response?: string; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      const promptTokens = result.usage?.prompt_tokens ?? null;
      const completionTokens = result.usage?.completion_tokens ?? null;
      return {
        text: result.response ?? "",
        model,
        latencyMs: Date.now() - start,
        usage: { promptTokens, completionTokens },
        neuronsEstimated: estimateNeurons(model, promptTokens, completionTokens),
      };
    },
  };
}
