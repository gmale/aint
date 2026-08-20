/**
 * AI·NT application surface — static UI + Worker API.
 *
 * V0 scope (bootstrap/BOOTSTRAP.md §V0 implementation target):
 * routes under /api/* are handled by the Worker; everything else
 * falls through to static assets.
 */
import { healthReport } from "./health";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(url, request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleApi(url: URL, _request: Request, env: Env): Promise<Response> {
  switch (url.pathname) {
    case "/api/health": {
      const report = await healthReport(url.origin, env);
      return Response.json(report, { status: report.status === "ok" ? 200 : 503 });
    }
    default:
      return Response.json({ error: "not found" }, { status: 404 });
  }
}
