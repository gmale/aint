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
import { checkAction, checkInferenceBudget } from "./policy";
import { counterStub } from "./telemetry";

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
  const { runCurator } = await import("./curator");
  await runCurator(env).catch(() => {});
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

async function dailyReport(env: Env, _ctx: ExecutionContext): Promise<void> {
  // Deterministic envelope, no model prose (the model-written report
  // produced confident nonsense; arithmetic doesn't).
  const stub = counterStub(env);
  const { envelopeReport } = await import("./envelope");
  const report = await envelopeReport(env);
  await stub.recordEvent(
    "daily-report",
    "envelope",
    JSON.stringify({
      bindsFirst: report.bindsFirst,
      top: report.lines.slice(0, 3).map((l) => `${l.resource} ${l.pct}%`),
    }),
  );
}
