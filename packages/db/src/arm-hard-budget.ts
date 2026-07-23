import { eq } from "drizzle-orm";
import { createDb, budgetUsages, budgets, organizations, projects } from "./index.js";

async function main() {
  const db = createDb(process.env.DATABASE_URL!);
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkOrgId, "org_demo_agentledger"),
  });
  if (!org) throw new Error("missing org");
  const project = await db.query.projects.findFirst({
    where: eq(projects.organizationId, org.id),
  });
  if (!project) throw new Error("missing project");

  let budget = await db.query.budgets.findFirst({ where: eq(budgets.name, "Tiny hard") });
  if (!budget) {
    const [created] = await db
      .insert(budgets)
      .values({
        projectId: project.id,
        name: "Tiny hard",
        scope: "project",
        period: "daily",
        amountUsd: 0.000001,
        hard: true,
        alertThresholds: [100],
      })
      .returning();
    budget = created;
  }

  const start = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()),
  );
  const existing = await db.query.budgetUsages.findFirst({
    where: eq(budgetUsages.budgetId, budget.id),
  });
  if (!existing) {
    await db.insert(budgetUsages).values({
      budgetId: budget.id,
      periodStart: start,
      spentUsd: 1,
      eventCount: 1,
    });
  } else {
    await db
      .update(budgetUsages)
      .set({ spentUsd: 1, periodStart: start })
      .where(eq(budgetUsages.id, existing.id));
  }
  console.log("armed", budget.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
