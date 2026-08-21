/**
 * Heartbeat — M1.3. Scheduled autonomous work, deliberately small:
 *
 *  - hourly: record a health snapshot event and run the policy-kernel
 *    self-test (forbidden actions MUST be denied; a kernel that says
 *    yes is itself a reportable failure);
 *  - daily: one policy- and budget-checked model call summarizing the
 *    day's counters into a status report event.
 *
 * Uses 2 of the account's 5 free Cron Triggers (experiments/000 §10).
 */
import { healthReport } from "./health";
import { workersAiProvider } from "./model";
import { checkAction, checkInferenceBudget } from "./policy";
import { counterStub, recordModelCall } from "./telemetry";

export const HOURLY_CRON = "17 * * * *";
export const DAILY_CRON = "43 6 * * *";

export async function runScheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  const stub = counterStub(env);
  if (controller.cron === DAILY_CRON) {
    const { reconcile } = await import("./reconcile");
    await reconcile(env).catch(() => {});
    await dailyReport(env, ctx);
    return;
  }
  // Hourly heartbeat (also the default for unknown crons).
  const report = await healthReport("https://heartbeat.internal", env);
  await stub.recordEvent(
    "heartbeat",
    report.status === "ok" ? "health-ok" : "health-degraded",
    JSON.stringify({
      commit: report.build.commit.slice(0, 7),
      deployAgeSeconds: report.deployment.ageSeconds,
      failing: report.dependencies.filter((d) => !d.ok).map((d) => d.name),
    }),
  );
  await policySelfTest(stub);
  const { maybeAuthorFirstPr } = await import("./github");
  await maybeAuthorFirstPr(env).catch(() => {});
}

/** Forbidden actions must be denied; record the outcome either way. */
async function policySelfTest(stub: ReturnType<typeof counterStub>): Promise<void> {
  const mustDeny = [
    { class: "inference" as const, paid: true, detail: "selftest: paid inference" },
    { class: "external-call" as const, detail: "selftest: external call" },
    { class: "resource-provision" as const, detail: "selftest: resource provision" },
  ];
  const wronglyAllowed = mustDeny.filter((a) => checkAction(a).allowed).map((a) => a.detail);
  const overBudget = checkInferenceBudget(Number.MAX_SAFE_INTEGER).allowed;
  if (wronglyAllowed.length > 0 || overBudget) {
    await stub.recordEvent(
      "policy-selftest",
      "FAILED",
      JSON.stringify({ wronglyAllowed, budgetCheckBroken: overBudget }),
    );
  } else {
    await stub.recordEvent("policy-selftest", "pass", "all forbidden actions denied");
  }
}

async function dailyReport(env: Env, ctx: ExecutionContext): Promise<void> {
  const stub = counterStub(env);
  const decision = checkAction({ class: "inference", paid: false, detail: "daily-report" });
  const used = await stub.todayCount("model_calls");
  const budget = checkInferenceBudget(used);
  if (!decision.allowed || !budget.allowed) {
    await stub.recordEvent(
      "daily-report",
      "skipped",
      `policy denied: ${decision.allowed ? budget.reason : decision.reason}`,
    );
    return;
  }
  const days = await stub.snapshot(2);
  const provider = workersAiProvider(env);
  try {
    const result = await provider.generate({
      prompt: `You are AINT's daily status reporter. Given these daily counters (requests, api_requests, model_calls, errors, neurons_milli = neurons x1000), write a 2-3 sentence factual status report. No speculation, no advice. Data: ${JSON.stringify(days)}`,
      maxTokens: 150,
    });
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
    await stub.recordEvent("daily-report", "generated", result.text.slice(0, 800));
  } catch (e) {
    recordModelCall(env, ctx, {
      model: provider.model,
      ok: false,
      latencyMs: 0,
      totalTokens: null,
      neuronsEstimated: null,
    });
    await stub.recordEvent("daily-report", "failed", String(e).slice(0, 300));
  }
}
