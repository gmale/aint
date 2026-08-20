/**
 * AI·NT application surface — static UI + Worker API.
 *
 * V0 scope (bootstrap/BOOTSTRAP.md §V0 implementation target):
 * routes under /api/* are handled by the Worker; everything else
 * falls through to static assets.
 */

const SERVICE = "aint";
const VERSION = "0.0.1";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(url, request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

function handleApi(url: URL, _request: Request, _env: Env): Response {
  switch (url.pathname) {
    case "/api/health":
      // Minimal V0.2 health; build identity and dependency
      // reachability land with V0.3 (issue #3).
      return Response.json({
        service: SERVICE,
        version: VERSION,
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    default:
      return Response.json({ error: "not found" }, { status: 404 });
  }
}
