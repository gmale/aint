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

export interface ModelCallEvent {
  model: string;
  ok: boolean;
  latencyMs: number;
  totalTokens: number | null;
  neuronsEstimated: number | null;
}

export function recordModelCall(env: Env, ctx: ExecutionContext, ev: ModelCallEvent): void {
  try {
    env.TELEMETRY_EVENTS.writeDataPoint({
      blobs: [ev.model, "inference", ev.ok ? "ok" : "error"],
      doubles: [ev.latencyMs, ev.totalTokens ?? -1],
      indexes: ["model"],
    });
  } catch {
    // Never fail the request on telemetry.
  }
  ctx.waitUntil(
    (async () => {
      const stub = counterStub(env);
      await stub.increment(ev.ok ? ["model_calls"] : ["model_calls", "model_errors"]);
      if (ev.neuronsEstimated !== null) {
        await stub.incrementBy("neurons_milli", Math.round(ev.neuronsEstimated * 1000));
      }
    })().catch(() => {}),
  );
}

export function counterStub(env: Env) {
  return env.TELEMETRY.get(env.TELEMETRY.idFromName("global"));
}

export type OrgEvent = {
  id: number;
  ts: string;
  actor: string;
  kind: string;
  detail: string;
};

export class TelemetryCounters extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS counters (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))",
    );
    // Agent/health events (MEMORY.md §shared structured memory, seed
    // form). M2 will design the real schema; this feeds the Console
    // activity panel until then.
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, actor TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '')",
    );
  }

  /** Add an amount to today's counter (used for milli-neuron accounting). */
  incrementBy(key: string, amount: number): void {
    const day = new Date().toISOString().slice(0, 10);
    this.ctx.storage.sql.exec(
      "INSERT INTO counters (day, key, n) VALUES (?, ?, ?) ON CONFLICT (day, key) DO UPDATE SET n = n + ?",
      day,
      key,
      amount,
      amount,
    );
  }

  recordEvent(actor: string, kind: string, detail: string): void {
    this.ctx.storage.sql.exec(
      "INSERT INTO events (ts, actor, kind, detail) VALUES (?, ?, ?, ?)",
      new Date().toISOString(),
      actor,
      kind,
      detail.slice(0, 2000),
    );
    // Bound growth: keep the most recent 500 events.
    this.ctx.storage.sql.exec(
      "DELETE FROM events WHERE id NOT IN (SELECT id FROM events ORDER BY id DESC LIMIT 500)",
    );
  }

  listEvents(limit = 50): OrgEvent[] {
    return this.ctx.storage.sql
      .exec<OrgEvent>(
        "SELECT id, ts, actor, kind, detail FROM events ORDER BY id DESC LIMIT ?",
        Math.min(limit, 200),
      )
      .toArray();
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

  /** Today's count for one counter key (0 if absent). */
  todayCount(key: string): number {
    const day = new Date().toISOString().slice(0, 10);
    const rows = this.ctx.storage.sql
      .exec<{ n: number }>("SELECT n FROM counters WHERE day = ? AND key = ?", day, key)
      .toArray();
    return rows[0]?.n ?? 0;
  }

  ping(): string {
    return "ok";
  }
}
