// Tool-use gauntlet runner (experiments/002). Usage:
//   node run.mjs <model-short-name>   (e.g. granite-4.0-h-micro)
// Runs 5 verifiable multi-step tasks x REPS through POST /api/agent/task
// and writes results-<short>.json next to this script.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://aint.aint-app.workers.dev";
const REPS = 2;
const MODELS = {
  "llama-3.2-1b-instruct": "@cf/meta/llama-3.2-1b-instruct",
  "granite-4.0-h-micro": "@cf/ibm-granite/granite-4.0-h-micro",
  "qwen3-30b-a3b-fp8": "@cf/qwen/qwen3-30b-a3b-fp8",
  "gpt-oss-20b": "@cf/openai/gpt-oss-20b",
  "mistral-small-3.1-24b-instruct": "@cf/mistralai/mistral-small-3.1-24b-instruct",
};
const short = process.argv[2];
const model = MODELS[short];
if (!model) {
  console.error(`usage: node run.mjs <${Object.keys(MODELS).join("|")}>`);
  process.exit(1);
}

const get = (p) => fetch(BASE + p).then((r) => r.json());
const counters = async () => (await get("/api/telemetry")).counters[new Date().toISOString().slice(0, 10)] ?? {};

function usedTool(result, name) {
  return (result.trace ?? []).some((s) => s.parsed?.tool === name && s.toolResult !== undefined);
}
const num = (s) => {
  const m = String(s ?? "").match(/-?\d+/g);
  return m ? Number(m[m.length - 1]) : NaN;
};

const TASKS = [
  {
    id: "counter-read",
    task: "What is today's value of the api_requests counter? Use get_counter to find out. Finish with just the number.",
    verify: async (r, pre, post) => {
      const v = num(r.final);
      return usedTool(r, "get_counter") && Number.isFinite(v) && v >= (pre.api_requests ?? 0) - 2 && v <= (post.api_requests ?? 0) + 2;
    },
  },
  {
    id: "tool-arithmetic",
    task: "Use the add tool to add 17 and 25. Finish with just the number.",
    verify: async (r) => usedTool(r, "add") && num(r.final) === 42,
  },
  {
    id: "policy-read",
    task: "What is the active policy version? Use get_policy to find out. Finish with just the version string.",
    verify: async (r) => usedTool(r, "get_policy") && /0\.4\.0/.test(String(r.final)),
  },
  {
    id: "registry-count",
    task: "How many objectives are in the objectives registry? Use count_objectives. Finish with just the number.",
    verify: async (r) => usedTool(r, "count_objectives") && num(r.final) === 9,
  },
  {
    id: "multi-hop",
    task: "Get today's value of the counter model_calls, then record a note containing exactly that number using record_note, then finish with that same number.",
    verify: async (r, pre, post) => {
      const v = num(r.final);
      return (
        usedTool(r, "get_counter") &&
        usedTool(r, "record_note") &&
        Number.isFinite(v) &&
        v >= (pre.model_calls ?? 0) - 1 &&
        v <= (post.model_calls ?? 0) + 1
      );
    },
  },
];

const results = [];
for (const t of TASKS) {
  for (let rep = 0; rep < REPS; rep++) {
    const pre = await counters();
    const started = Date.now();
    const r = await fetch(`${BASE}/api/agent/task`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: t.task, model }),
    }).then((x) => x.json()).catch((e) => ({ error: String(e) }));
    const post = await counters();
    const pass = r.error ? false : await t.verify(r, pre, post);
    results.push({
      task: t.id, rep, pass,
      final: r.final ?? null, stepsUsed: r.stepsUsed ?? null, repairs: r.repairs ?? null,
      neurons: r.neuronsEstimated ?? null, wallMs: Date.now() - started, error: r.error ?? null,
      trace: (r.trace ?? []).map((s) => ({ tool: s.parsed?.tool ?? (s.parsed?.final !== undefined ? "FINAL" : "MALFORMED"), err: s.error ?? null })),
    });
    console.log(`${pass ? "PASS" : "FAIL"} ${short} ${t.id}#${rep} steps=${r.stepsUsed} repairs=${r.repairs} final=${JSON.stringify(r.final ?? r.error ?? null).slice(0, 40)}`);
    await new Promise((s) => setTimeout(s, 500));
  }
}
const passes = results.filter((r) => r.pass).length;
const summary = {
  model, short, passes: `${passes}/${results.length}`,
  avgSteps: +(results.reduce((a, r) => a + (r.stepsUsed ?? 6), 0) / results.length).toFixed(1),
  totalRepairs: results.reduce((a, r) => a + (r.repairs ?? 0), 0),
  totalNeurons: +results.reduce((a, r) => a + (r.neurons ?? 0), 0).toFixed(2),
};
console.log(JSON.stringify(summary));
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), `results-${short}.json`), JSON.stringify({ summary, results }, null, 2));
