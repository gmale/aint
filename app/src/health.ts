/**
 * Health report — V0.3 (issue #3).
 *
 * Reports build identity (git commit via generated build-info),
 * deployment identity (version_metadata binding), and reachability
 * of every configured dependency. Freshness rule: values that cannot
 * be computed live must be reported as unknown, never as healthy.
 */
import { BUILD_INFO } from "../generated/build-info";

export const SERVICE = "aint";
export const APP_VERSION = "0.1.0";

interface DependencyReport {
  name: string;
  ok: boolean;
  latencyMs: number;
  detail?: string;
}

export async function healthReport(origin: string, env: Env) {
  const dependencies: DependencyReport[] = [await checkAssets(origin, env)];
  const ok = dependencies.every((d) => d.ok);

  const meta = env.CF_VERSION_METADATA;
  const deployedAtMs = meta.timestamp ? Date.parse(meta.timestamp) : NaN;

  return {
    service: SERVICE,
    status: ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    build: BUILD_INFO,
    deployment: {
      versionId: meta.id || "unknown",
      tag: meta.tag || null,
      deployedAt: meta.timestamp || "unknown",
      ageSeconds: Number.isFinite(deployedAtMs)
        ? Math.round((Date.now() - deployedAtMs) / 1000)
        : null,
    },
    dependencies,
  };
}

async function checkAssets(origin: string, env: Env): Promise<DependencyReport> {
  const start = Date.now();
  try {
    const res = await env.ASSETS.fetch(
      new Request(new URL("/index.html", origin), { method: "HEAD" }),
    );
    const report: DependencyReport = {
      name: "assets",
      ok: res.ok,
      latencyMs: Date.now() - start,
    };
    if (!res.ok) report.detail = `status ${res.status}`;
    return report;
  } catch (e) {
    return { name: "assets", ok: false, latencyMs: Date.now() - start, detail: String(e) };
  }
}
