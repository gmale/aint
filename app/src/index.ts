/**
 * AI·NT application surface — static UI + Worker API.
 *
 * V0 scope (bootstrap/BOOTSTRAP.md §V0 implementation target):
 * routes under /api/* are handled by the Worker; everything else
 * falls through to static assets. Every request emits telemetry
 * (decisions/001) without being able to fail on it.
 */
import { healthReport } from "./health";
import { MODELS, workersAiProvider } from "./model";
import { checkAction, checkInferenceBudget, POLICY } from "./policy";
import { counterStub, recordModelCall, recordRequest } from "./telemetry";

export { TelemetryCounters } from "./telemetry";

export default {
  async scheduled(controller, env, ctx): Promise<void> {
    const { runScheduled } = await import("./heartbeat");
    await runScheduled(controller, env, ctx);
  },

  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const isApi = url.pathname.startsWith("/api/");
    const start = Date.now();
    let response: Response;
    try {
      response = isApi ? await handleApi(url, request, env, ctx) : await env.ASSETS.fetch(request);
    } catch (e) {
      console.error("unhandled error", e);
      response = Response.json({ error: "internal error" }, { status: 500 });
    }
    recordRequest(env, ctx, {
      path: isApi ? url.pathname : "static",
      method: request.method,
      status: response.status,
      latencyMs: Date.now() - start,
    });
    return response;
  },
} satisfies ExportedHandler<Env>;

const MAX_PROMPT_CHARS = 2000;

async function handleApi(
  url: URL,
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  switch (url.pathname) {
    case "/api/health": {
      const report = await healthReport(url.origin, env);
      return Response.json(report, { status: report.status === "ok" ? 200 : 503 });
    }
    case "/api/generate": {
      if (request.method !== "POST") {
        return Response.json({ error: "POST only" }, { status: 405 });
      }
      const decision = checkAction({ class: "inference", paid: false, detail: "workers-ai" });
      if (!decision.allowed) {
        return Response.json({ error: decision.reason, policy: decision }, { status: 403 });
      }
      const usedToday = await counterStub(env)
        .todayCount("model_calls")
        .catch(() => Number.MAX_SAFE_INTEGER); // counter unreachable → fail closed
      const budget = checkInferenceBudget(usedToday);
      if (!budget.allowed) {
        return Response.json(
          { error: budget.reason, policy: budget, budget: POLICY.dailyInferenceBudget },
          { status: 429 },
        );
      }
      let prompt: unknown;
      let model: unknown;
      try {
        ({ prompt, model } = (await request.json()) as { prompt?: unknown; model?: unknown });
      } catch {
        return Response.json({ error: "body must be JSON: {\"prompt\": \"...\"}" }, { status: 400 });
      }
      if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > MAX_PROMPT_CHARS) {
        return Response.json(
          { error: `prompt must be a non-empty string of at most ${MAX_PROMPT_CHARS} chars` },
          { status: 400 },
        );
      }
      if (model !== undefined && (typeof model !== "string" || !(model in MODELS))) {
        return Response.json(
          { error: "model must be one of the verified allowlist", allowed: Object.keys(MODELS) },
          { status: 400 },
        );
      }
      const provider = workersAiProvider(env, model as string | undefined);
      try {
        const result = await provider.generate({ prompt });
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
        return Response.json({ ...result, policyVersion: decision.policyVersion });
      } catch (e) {
        // Free-tier quota exhaustion surfaces here as an error: report
        // it honestly and fail closed (experiments/000 §4, §14).
        recordModelCall(env, ctx, {
          model: provider.model,
          ok: false,
          latencyMs: 0,
          totalTokens: null,
          neuronsEstimated: null,
        });
        console.error("model call failed", e);
        return Response.json({ error: "model call failed" }, { status: 502 });
      }
    }
    case "/api/reconcile": {
      const { probe, reconcile, recentlyReconciled } = await import("./reconcile");
      if (url.searchParams.has("probe")) {
        return Response.json(await probe(env, url.searchParams.get("probe") || null));
      }
      if (await recentlyReconciled(env)) {
        return Response.json({ skipped: "reconciled within the last 5 minutes; see /api/events" }, { status: 429 });
      }
      return Response.json(await reconcile(env));
    }
    case "/api/events": {
      const events = await counterStub(env).listEvents(50);
      return Response.json({ events });
    }
    case "/api/telemetry": {
      const days = await counterStub(env).snapshot();
      return Response.json({
        counters: days,
        events: {
          dataset: "aint_requests",
          note: "granular events in Analytics Engine; readable via SQL API once a scoped read token is provisioned (decisions/001)",
        },
      });
    }
    default:
      return Response.json({ error: "not found" }, { status: 404 });
  }
}
