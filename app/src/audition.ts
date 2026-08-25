/**
 * Worker-loop model audition — #61 / experiments/005 follow-up.
 *
 * Runs once, autonomously, from the hourly heartbeat when the rolling
 * neuron window is cool (< 4000): a fixed deterministic task set
 * through the tool loop for each candidate, scored mechanically,
 * results recorded as events. Answers: which models can drive the
 * BOUNDED loop (single-shot tool calls — a different bar than heavy
 * sessions; qwen3-30b's BFCL-best score says it may excel here).
 */
import { counterStub } from "./telemetry";
import { runTask } from "./toolloop";

const CANDIDATES = [
  "@cf/qwen/qwen3-30b-a3b-fp8",
  "@cf/ibm-granite/granite-4.0-h-micro",
  "@cf/mistralai/mistral-small-3.1-24b-instruct",
];

const TASKS: Array<{ id: string; task: string; check(final: string | null): boolean }> = [
  {
    id: "arith",
    task: "Use the add tool to add 17 and 25. Finish with just the number.",
    check: (f) => (String(f ?? "").match(/\d+/g) ?? []).pop() === "42",
  },
  {
    id: "policy",
    task: "What is the active policy version? Use get_policy. Finish with just the version string.",
    check: (f) => /0\.5\.0/.test(String(f ?? "")),
  },
  {
    id: "registry",
    task: "How many objectives are in the objectives registry? Use count_objectives. Finish with just the number.",
    check: (f) => (String(f ?? "").match(/\d+/g) ?? []).pop() === "9",
  },
  {
    id: "counter",
    task: "What is today's value of the requests counter? Use get_counter. Finish with just the number.",
    check: (f) => /^\s*\d+\s*$/.test(String(f ?? "")),
  },
];

export async function maybeRunAudition(env: Env, ctx: ExecutionContext): Promise<void> {
  const stub = counterStub(env);
  const events = await stub.listEvents(200);
  if (events.some((e) => e.actor === "audition" && e.kind === "complete-v2")) return; // run once (v2: canary-gated)
  const { platformRolling24h } = await import("./reconcile");
  const rolling = await platformRolling24h(env);
  if (rolling === null || rolling > 4000) return; // analytics gate (necessary, not sufficient)
  // Canary: analytics and enforcement meters diverge (2026-08-25 —
  // analytics showed 1081 while enforcement still said exhausted).
  // Only the enforcement layer's own answer counts; abort silently and
  // retry next heartbeat rather than recording failures.
  try {
    const { workersAiProvider } = await import("./model");
    await workersAiProvider(env).generate({ prompt: "ok", maxTokens: 2 });
  } catch {
    return;
  }

  for (const model of CANDIDATES) {
    let pass = 0;
    const detail: string[] = [];
    let neurons = 0;
    for (const t of TASKS) {
      try {
        const r = await runTask(env, ctx, t.task, model);
        const ok = !("error" in r) && t.check(r.final);
        if (ok) pass++;
        if (!("error" in r)) neurons += r.neuronsEstimated;
        detail.push(`${t.id}:${ok ? "P" : "F"}`);
      } catch (e) {
        detail.push(`${t.id}:ERR`);
      }
    }
    await stub.recordEvent(
      "audition",
      model.split("/")[2] ?? model,
      `${pass}/${TASKS.length} [${detail.join(" ")}] ~${Math.round(neurons * 100) / 100} neurons (seam)`,
    );
  }
  await stub.recordEvent("audition", "complete-v2", "worker-loop audition done (#61) — per-model events above; feeds toolloop model routing");
}
