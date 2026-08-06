import { PLANS, getPlan, type PlanEntitlements } from "@agentledger/shared";

/**
 * SaaS Stripe subscriptions are deferred (pre-monetization).
 * Opt in later with AGENTLEDGER_BILLING_ENABLED=true.
 */
export function isBillingEnabled() {
  return process.env.AGENTLEDGER_BILLING_ENABLED === "true";
}

/** Self-host / private installs get full Team entitlements until billing ships. */
export function resolveEntitlements(planId: string | null | undefined): PlanEntitlements {
  if (!isBillingEnabled()) {
    return PLANS.team;
  }
  return getPlan(planId);
}

export const BILLING_UNAVAILABLE_MESSAGE =
  "Billing is not available on this AgentLedger instance. Self-host entitlements are unlocked; SaaS subscriptions are deferred.";
