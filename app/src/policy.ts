/**
 * Policy microkernel — V0.6 (issue #6).
 *
 * The smallest useful policy representation for V0
 * (bootstrap/BOOTSTRAP.md §V0 target 6, bootstrap/GOVERNANCE.md).
 * Policy is versioned data plus a deterministic check; changing it
 * requires a reviewed commit through the canonical build path — a
 * Markdown edit alone can never expand authority.
 */

export type ActionClass =
  | "read" // read-only; consumes nothing beyond the request
  | "inference" // model call within verified free quota
  | "storage-write" // durable state mutation (DO/D1/KV/R2)
  | "external-call" // outbound call to a non-Cloudflare service
  | "resource-provision"; // creating/altering platform resources

export interface ActionRequest {
  class: ActionClass;
  /** True if the action could create billable usage. */
  paid?: boolean;
  detail?: string;
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  policyVersion: string;
}

export const POLICY = {
  version: "0.2.0",
  economicTier: "free",
  paidActivationForbidden: true,
  allowedActionClasses: ["read", "inference", "storage-write"] satisfies ActionClass[],
  /**
   * Lease-lite blast-radius bound for the public inference endpoint
   * (SECURITY.md §Capability model): at most this many model calls per
   * UTC day, enforced against the telemetry counters. ~500 calls at the
   * observed <1 neuron/call stays well under 10% of the 10k-neuron/day
   * free allocation. True signed capability leases are an M4 concern.
   */
  dailyInferenceBudget: 500,
} as const;

export function checkInferenceBudget(usedToday: number): PolicyDecision {
  if (usedToday >= POLICY.dailyInferenceBudget) {
    return deny(
      `daily inference budget exhausted (${usedToday}/${POLICY.dailyInferenceBudget}); resets 00:00 UTC`,
    );
  }
  return { allowed: true, reason: "within budget", policyVersion: POLICY.version };
}

export function checkAction(action: ActionRequest): PolicyDecision {
  if (action.paid && POLICY.paidActivationForbidden) {
    return deny(`paid usage is forbidden in economic tier "${POLICY.economicTier}"`);
  }
  if (!(POLICY.allowedActionClasses as readonly string[]).includes(action.class)) {
    return deny(`action class "${action.class}" is not allowed by policy v${POLICY.version}`);
  }
  return { allowed: true, reason: "permitted", policyVersion: POLICY.version };
}

function deny(reason: string): PolicyDecision {
  return { allowed: false, reason, policyVersion: POLICY.version };
}
