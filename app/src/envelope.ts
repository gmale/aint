/**
 * Resource envelope report — deterministic-first (no model prose).
 *
 * Answers "where are we constrained?" as arithmetic against verified
 * limits (experiments/000) and active policy budgets. Replaces the
 * model-written daily report: counters in, percentages out. Neuron
 * figures are seam estimates, reconciled daily against platform truth.
 */
import { POLICY } from "./policy";
import { counterStub } from "./telemetry";

export interface EnvelopeLine {
  resource: string;
  used: number;
  limit: number;
  pct: number;
  source: string;
}

export async function envelopeReport(env: Env) {
  const stub = counterStub(env);
  const [requests, modelCalls, neuronsMilli, messages, prs] = await Promise.all([
    stub.todayCount("requests"),
    stub.todayCount("model_calls"),
    stub.todayCount("neurons_milli"),
    stub.todayCount("messages"),
    stub.todayCount("github_prs"),
  ]);

  const line = (resource: string, used: number, limit: number, source: string): EnvelopeLine => ({
    resource,
    used: Math.round(used * 100) / 100,
    limit,
    pct: Math.round((used / limit) * 1000) / 10,
    source,
  });

  const lines = [
    line("worker_requests_day", requests, 100_000, "platform limit, verified experiments/000 §1"),
    line("neurons_day", neuronsMilli / 1000, 10_000, "platform limit §4; seam estimate, reconciled daily"),
    line("model_calls_day", modelCalls, POLICY.dailyInferenceBudget, `policy v${POLICY.version} budget`),
    line("messages_day", messages, POLICY.dailyMessageBudget, `policy v${POLICY.version} budget`),
    line("agent_prs_day", prs, POLICY.dailyPrBudget, `policy v${POLICY.version} budget`),
    line("cron_slots", 2, 5, "account-wide, static allocation §10"),
  ].sort((a, b) => b.pct - a.pct);

  return {
    utcDay: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    bindsFirst: lines[0].resource,
    lines,
    notInstrumented:
      "D1 rows, DO requests, AE writes, KV, build minutes — usage far below limits; instrument before relying (experiments/000 §5-§12)",
  };
}
