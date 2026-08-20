/**
 * AI·NT application surface — static UI + Worker API.
 *
 * V0 scope (bootstrap/BOOTSTRAP.md §V0 implementation target):
 * routes under /api/* are handled by the Worker; everything else
 * falls through to static assets. Every request emits telemetry
 * (decisions/001) without being able to fail on it.
 */
import { healthReport } from "./health";
import { counterStub, recordRequest } from "./telemetry";

export { TelemetryCounters } from "./telemetry";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const isApi = url.pathname.startsWith("/api/");
    const start = Date.now();
    let response: Response;
    try {
      response = isApi ? await handleApi(url, request, env) : await env.ASSETS.fetch(request);
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

async function handleApi(url: URL, _request: Request, env: Env): Promise<Response> {
  switch (url.pathname) {
    case "/api/health": {
      const report = await healthReport(url.origin, env);
      return Response.json(report, { status: report.status === "ok" ? 200 : 503 });
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
