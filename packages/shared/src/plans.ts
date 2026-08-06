import { z } from "zod";

export const PlanId = z.enum(["free", "pro", "team"]);
export type PlanId = z.infer<typeof PlanId>;

export type PlanEntitlements = {
  id: PlanId;
  name: string;
  priceMonthlyUsd: number;
  eventQuota: number;
  maxProjects: number;
  hardBudgets: boolean;
  slackAlerts: boolean;
  approvalGates: boolean;
  auditExport: boolean;
  retainPayloads: boolean;
  overageMetered: boolean;
};

/**
 * Plan catalog for a future SaaS path. While AGENTLEDGER_BILLING_ENABLED is unset,
 * the web app resolves Team entitlements for all orgs (see apps/web/src/lib/billing.ts).
 */
export const PLANS: Record<PlanId, PlanEntitlements> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyUsd: 0,
    eventQuota: 10_000,
    maxProjects: 1,
    hardBudgets: false,
    slackAlerts: false,
    approvalGates: false,
    auditExport: false,
    retainPayloads: false,
    overageMetered: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 99,
    eventQuota: 250_000,
    maxProjects: 5,
    hardBudgets: true,
    slackAlerts: true,
    approvalGates: false,
    auditExport: false,
    retainPayloads: false,
    overageMetered: true,
  },
  team: {
    id: "team",
    name: "Team",
    priceMonthlyUsd: 299,
    eventQuota: 1_000_000,
    maxProjects: 50,
    hardBudgets: true,
    slackAlerts: true,
    approvalGates: true,
    auditExport: true,
    retainPayloads: true,
    overageMetered: true,
  },
};

export function getPlan(planId: string | null | undefined): PlanEntitlements {
  if (planId === "pro" || planId === "team" || planId === "free") {
    return PLANS[planId];
  }
  return PLANS.free;
}
