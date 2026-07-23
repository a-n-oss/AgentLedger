import { and, eq, sql } from "drizzle-orm";
import { agents, budgetUsages, budgets, events, organizations } from "@agentledger/db";
import { getPlan } from "@agentledger/shared";
import { getDb } from "./db";
import { dispatchBudgetAlerts } from "./alerts";

function periodStart(period: "daily" | "monthly", now = new Date()) {
  if (period === "daily") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function ensureAgent(projectId: string, name: string) {
  const db = getDb();
  const existing = await db.query.agents.findFirst({
    where: and(eq(agents.projectId, projectId), eq(agents.name, name)),
  });
  if (existing) return existing;
  const [created] = await db.insert(agents).values({ projectId, name }).returning();
  return created;
}

export type BudgetCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; budgetId: string; spentUsd: number; amountUsd: number };

export async function checkBudgets(params: {
  projectId: string;
  agentId?: string | null;
  organizationId: string;
  planId: string;
}): Promise<BudgetCheckResult> {
  const db = getDb();
  const plan = getPlan(params.planId);
  const projectBudgets = await db.query.budgets.findMany({
    where: eq(budgets.projectId, params.projectId),
  });

  for (const budget of projectBudgets) {
    if (budget.scope === "agent" && budget.agentId !== params.agentId) continue;
    const start = periodStart(budget.period);
    const usage = await db.query.budgetUsages.findFirst({
      where: and(eq(budgetUsages.budgetId, budget.id), eq(budgetUsages.periodStart, start)),
    });
    const spent = usage?.spentUsd ?? 0;
    if (spent >= budget.amountUsd) {
      if (budget.hard && plan.hardBudgets) {
        return {
          allowed: false,
          reason: `Hard budget "${budget.name}" exceeded`,
          budgetId: budget.id,
          spentUsd: spent,
          amountUsd: budget.amountUsd,
        };
      }
    }
  }

  return { allowed: true };
}

export async function recordSpend(params: {
  projectId: string;
  organizationId: string;
  agentId?: string | null;
  costUsd: number;
  eventCount?: number;
}) {
  const db = getDb();
  const eventCount = params.eventCount ?? 1;

  await db
    .update(organizations)
    .set({
      eventsUsedThisPeriod: sql`${organizations.eventsUsedThisPeriod} + ${eventCount}`,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, params.organizationId));

  const projectBudgets = await db.query.budgets.findMany({
    where: eq(budgets.projectId, params.projectId),
  });

  for (const budget of projectBudgets) {
    if (budget.scope === "agent" && budget.agentId !== params.agentId) continue;
    const start = periodStart(budget.period);
    const existing = await db.query.budgetUsages.findFirst({
      where: and(eq(budgetUsages.budgetId, budget.id), eq(budgetUsages.periodStart, start)),
    });

    let spentUsd: number;
    const lastAlertThreshold = existing?.lastAlertThreshold ?? null;

    if (existing) {
      const [updated] = await db
        .update(budgetUsages)
        .set({
          spentUsd: sql`${budgetUsages.spentUsd} + ${params.costUsd}`,
          eventCount: sql`${budgetUsages.eventCount} + ${eventCount}`,
          updatedAt: new Date(),
        })
        .where(eq(budgetUsages.id, existing.id))
        .returning();
      spentUsd = updated.spentUsd;
    } else {
      const [created] = await db
        .insert(budgetUsages)
        .values({
          budgetId: budget.id,
          periodStart: start,
          spentUsd: params.costUsd,
          eventCount,
        })
        .returning();
      spentUsd = created.spentUsd;
    }

    const pct = budget.amountUsd > 0 ? (spentUsd / budget.amountUsd) * 100 : 0;
    const thresholds = [...budget.alertThresholds].sort((a, b) => a - b);
    const crossed = thresholds.filter((t) => pct >= t && (lastAlertThreshold == null || t > lastAlertThreshold));
    if (crossed.length > 0) {
      const highest = crossed[crossed.length - 1]!;
      await db
        .update(budgetUsages)
        .set({ lastAlertThreshold: highest })
        .where(
          and(eq(budgetUsages.budgetId, budget.id), eq(budgetUsages.periodStart, start)),
        );
      await dispatchBudgetAlerts({
        organizationId: params.organizationId,
        budgetName: budget.name,
        threshold: highest,
        spentUsd,
        amountUsd: budget.amountUsd,
        hard: budget.hard,
      });
    }
  }
}

export async function sumProjectSpend(projectId: string, since: Date) {
  const db = getDb();
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${events.costUsd}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .where(and(eq(events.projectId, projectId), sql`${events.createdAt} >= ${since}`));
  return { total: Number(rows[0]?.total ?? 0), count: Number(rows[0]?.count ?? 0) };
}
