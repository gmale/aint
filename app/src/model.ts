/**
 * Model provider seam — V0.5 (issue #5).
 *
 * Small on purpose (bootstrap/MEMORY.md §Replaceable provider
 * interface): enough to swap models/providers and compare them later,
 * no speculative abstraction. Default model chosen from verified
 * free-tier candidates in experiments/000 §4.
 */

export interface GenerateRequest {
  prompt: string;
  maxTokens?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
  latencyMs: number;
  usage: { promptTokens: number | null; completionTokens: number | null };
}

export interface ModelProvider {
  readonly model: string;
  generate(req: GenerateRequest): Promise<GenerateResult>;
}

export const DEFAULT_MODEL = "@cf/meta/llama-3.2-1b-instruct";
const MAX_TOKENS_CAP = 256;

export function workersAiProvider(env: Env, model: string = DEFAULT_MODEL): ModelProvider {
  return {
    model,
    async generate(req: GenerateRequest): Promise<GenerateResult> {
      const start = Date.now();
      const result = (await env.AI.run(model as Parameters<Env["AI"]["run"]>[0], {
        prompt: req.prompt,
        max_tokens: Math.min(req.maxTokens ?? MAX_TOKENS_CAP, MAX_TOKENS_CAP),
      })) as { response?: string; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      return {
        text: result.response ?? "",
        model,
        latencyMs: Date.now() - start,
        usage: {
          promptTokens: result.usage?.prompt_tokens ?? null,
          completionTokens: result.usage?.completion_tokens ?? null,
        },
      };
    },
  };
}
