/**
 * Telemetry foundation — V0.4 (issue #4, decisions/001).
 *
 * Two halves:
 *  - Analytics Engine (`TELEMETRY_EVENTS`): one data point per request,
 *    granular, write-only from the Worker, 3-month retention.
 *  - TelemetryCounters Durable Object: daily aggregate counters in
 *    SQLite, secretless read path for /api/telemetry and the Console.
 *
 * Telemetry must never fail a user request: all writes are deferred
 * via waitUntil and swallow their own errors.
 */
import { DurableObject } from "cloudflare:workers";

export interface RequestEvent {
  /** Normalized path: exact path for /api/*, "static" for assets. */
  path: string;
  method: string;
  status: number;
  latencyMs: number;
}

export function recordRequest(env: Env, ctx: ExecutionContext, ev: RequestEvent): void {
  try {
    env.TELEMETRY_EVENTS.writeDataPoint({
      blobs: [ev.path, ev.method, outcome(ev.status)],
      doubles: [ev.status, ev.latencyMs],
      indexes: [ev.path === "static" ? "asset" : "api"],
    });
  } catch {
    // Analytics Engine unavailability is never a request failure.
  }
  ctx.waitUntil(incrementCounters(env, ev).catch(() => {}));
}

function outcome(status: number): string {
  if (status >= 500) return "error";
  if (status >= 400) return "client-error";
  return "ok";
}

async function incrementCounters(env: Env, ev: RequestEvent): Promise<void> {
  const keys = ["requests"];
  if (ev.path !== "static") keys.push("api_requests");
  if (ev.status >= 500) keys.push("errors");
  await counterStub(env).increment(keys);
}

export function counterStub(env: Env) {
  return env.TELEMETRY.get(env.TELEMETRY.idFromName("global"));
}

export class TelemetryCounters extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS counters (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))",
    );
  }

  increment(keys: string[]): void {
    const day = new Date().toISOString().slice(0, 10);
    for (const key of keys) {
      this.ctx.storage.sql.exec(
        "INSERT INTO counters (day, key, n) VALUES (?, ?, 1) ON CONFLICT (day, key) DO UPDATE SET n = n + 1",
        day,
        key,
      );
    }
  }

  /** Daily counters for the last `days` days, newest first. */
  snapshot(days = 7): Record<string, Record<string, number>> {
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const rows = this.ctx.storage.sql
      .exec<{ day: string; key: string; n: number }>(
        "SELECT day, key, n FROM counters WHERE day >= ? ORDER BY day DESC, key",
        cutoff,
      )
      .toArray();
    const out: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      (out[row.day] ??= {})[row.key] = row.n;
    }
    return out;
  }

  ping(): string {
    return "ok";
  }
}
