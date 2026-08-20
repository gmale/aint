// Model tournament runner (experiments/001). Usage:
//   node run.mjs [base-url]
// Runs 6 deterministic tasks against each allowlisted model via
// POST /api/generate and writes results.json alongside this script.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "https://aint.aint-app.workers.dev";

const MODELS = [
  "@cf/meta/llama-3.2-1b-instruct",
  "@cf/ibm-granite/granite-4.0-h-micro",
  "@cf/qwen/qwen3-30b-a3b-fp8",
  "@cf/openai/gpt-oss-20b",
  "@cf/mistralai/mistral-small-3.1-24b-instruct",
];

// Strip reasoning blocks (qwen-style) and markdown fences before checks.
function normalize(text) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/```(?:json)?/g, "")
    .trim();
}

const TASKS = [
  {
    id: "exact-compliance",
    prompt: 'Reply with exactly this text and nothing else: AINT lives',
    check: (t) => t.replace(/[.!]$/, "") === "AINT lives",
  },
  {
    id: "factual",
    prompt: "What is the capital of Australia? Reply with only the city name.",
    check: (t) => /canberra/i.test(t) && t.split(/\s+/).length <= 3,
  },
  {
    id: "trap-arithmetic",
    prompt:
      "A farmer has 17 sheep. All but 9 run away. How many sheep are left? Reply with only the number.",
    check: (t) => (t.match(/\d+/g) ?? [])[0] === "9",
  },
  {
    id: "json-output",
    prompt:
      'Return only a JSON object with keys "name" (string) and "version" (number) describing a project called AINT at version 0. No other text.',
    check: (t) => {
      try {
        const o = JSON.parse(t);
        return typeof o.name === "string" && typeof o.version === "number";
      } catch {
        return false;
      }
    },
  },
  {
    id: "constrained-list",
    prompt:
      "Name three Cloudflare storage products as a comma-separated list. Reply with only the list.",
    check: (t) => {
      const hits = new Set(
        (t.toLowerCase().match(/\b(d1|r2|kv|durable objects?|vectorize|queues|hyperdrive)\b/g) ?? []),
      );
      return hits.size >= 3 && t.split("\n").length <= 2;
    },
  },
  {
    id: "brevity",
    prompt:
      "Summarize in one sentence of at most 12 words: The AINT project builds a persistent agent organization on Cloudflare that remembers its discussions, turns ideas into objectives, and improves itself under strict cost and security constraints.",
    check: (t) => t.split(/\s+/).length <= 14 && t.length > 0,
  },
];

async function call(model, prompt) {
  const started = Date.now();
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });
  const body = await res.json().catch(() => ({}));
  return { httpStatus: res.status, wallMs: Date.now() - started, ...body };
}

const results = [];
for (const model of MODELS) {
  for (const task of TASKS) {
    const r = await call(model, task.prompt);
    const text = typeof r.text === "string" ? normalize(r.text) : "";
    const pass = r.httpStatus === 200 && task.check(text);
    results.push({
      model,
      task: task.id,
      pass,
      httpStatus: r.httpStatus,
      latencyMs: r.latencyMs ?? null,
      usage: r.usage ?? null,
      neuronsEstimated: r.neuronsEstimated ?? null,
      text: text.slice(0, 200),
      error: r.error ?? null,
    });
    console.log(`${pass ? "PASS" : "FAIL"} ${model} ${task.id} (${r.httpStatus}, ${r.latencyMs}ms)`);
    await new Promise((s) => setTimeout(s, 400));
  }
}

const summary = MODELS.map((model) => {
  const rows = results.filter((r) => r.model === model);
  const ok = rows.filter((r) => r.pass).length;
  const lat = rows.filter((r) => r.latencyMs !== null).map((r) => r.latencyMs);
  return {
    model,
    passes: `${ok}/${TASKS.length}`,
    passCount: ok,
    avgLatencyMs: lat.length ? Math.round(lat.reduce((a, b) => a + b) / lat.length) : null,
    totalNeurons: Math.round(rows.reduce((a, r) => a + (r.neuronsEstimated ?? 0), 0) * 1000) / 1000,
  };
}).sort((a, b) => b.passCount - a.passCount || a.totalNeurons - b.totalNeurons);

console.table(summary);
const out = join(dirname(fileURLToPath(import.meta.url)), "results.json");
writeFileSync(out, JSON.stringify({ base: BASE, ranAt: new Date().toISOString(), summary, results }, null, 2));
console.log(`wrote ${out}`);
