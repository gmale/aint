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
  version: "0.1.0",
  economicTier: "free",
  paidActivationForbidden: true,
  allowedActionClasses: ["read", "inference", "storage-write"] satisfies ActionClass[],
} as const;

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
