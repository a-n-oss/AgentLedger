import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { createDb, agents, apiKeys, budgets, events, organizations, projects, runs } from "./index.js";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/agentledger";

function hashKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

async function main() {
  const db = createDb(connectionString);
  const clerkOrgId = process.env.SEED_CLERK_ORG_ID ?? "org_demo_agentledger";

  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.clerkOrgId, clerkOrgId),
  });

  let orgId = existing?.id;
  if (!orgId) {
    const [org] = await db
      .insert(organizations)
      .values({
        clerkOrgId,
        name: "Demo Org",
        plan: "team",
        eventQuota: 1_000_000,
      })
      .returning();
    orgId = org.id;
  }

  const existingProject = await db.query.projects.findFirst({
    where: eq(projects.organizationId, orgId),
  });

  let projectId = existingProject?.id;
  if (!projectId) {
    const [project] = await db
      .insert(projects)
      .values({ organizationId: orgId, name: "Production Agents" })
      .returning();
    projectId = project.id;

    const rawKey = `al_live_${randomBytes(24).toString("hex")}`;
    await db.insert(apiKeys).values({
      projectId,
      name: "Demo key",
      keyPrefix: rawKey.slice(0, 12),
      keyHash: hashKey(rawKey),
    });
    console.log("Demo API key (save now):", rawKey);

    const [supportAgent] = await db
      .insert(agents)
      .values({ projectId, name: "support-triage" })
      .returning();
    const [researchAgent] = await db
      .insert(agents)
      .values({ projectId, name: "research-bot" })
      .returning();

    await db.insert(budgets).values({
      projectId,
      name: "Monthly project cap",
      scope: "project",
      period: "monthly",
      amountUsd: 500,
      hard: true,
      alertThresholds: [50, 80, 100],
    });

    const now = Date.now();
    const demoEvents = [];
    for (let i = 0; i < 40; i++) {
      const agent = i % 2 === 0 ? supportAgent : researchAgent;
      const tokensIn = 800 + Math.floor(Math.random() * 4000);
      const tokensOut = 200 + Math.floor(Math.random() * 1500);
      const costUsd = (tokensIn / 1e6) * 0.15 + (tokensOut / 1e6) * 0.6;
      demoEvents.push({
        projectId,
        agentId: agent.id,
        requestId: `seed_${i}_${randomBytes(4).toString("hex")}`,
        type: "llm" as const,
        provider: "openai",
        model: i % 3 === 0 ? "gpt-4o" : "gpt-4o-mini",
        tokensIn,
        tokensOut,
        costUsd,
        costEstimated: false,
        latencyMs: 400 + Math.floor(Math.random() * 2000),
        team: i % 2 === 0 ? "support" : "research",
        userLabel: `user_${(i % 5) + 1}`,
        createdAt: new Date(now - i * 3600_000 * 6),
      });
    }
    await db.insert(events).values(demoEvents);

    const [run] = await db
      .insert(runs)
      .values({
        projectId,
        agentId: supportAgent.id,
        team: "support",
        status: "completed",
        totalCostUsd: 0.12,
        startedAt: new Date(now - 7200_000),
        endedAt: new Date(now - 7100_000),
        metadata: { ticketId: "T-1042" },
      })
      .returning();

    await db.insert(events).values([
      {
        projectId,
        runId: run.id,
        agentId: supportAgent.id,
        requestId: `run_span_${randomBytes(4).toString("hex")}`,
        type: "llm",
        provider: "openai",
        model: "gpt-4o-mini",
        tokensIn: 1200,
        tokensOut: 400,
        costUsd: 0.00042,
        latencyMs: 900,
        team: "support",
      },
      {
        projectId,
        runId: run.id,
        agentId: supportAgent.id,
        requestId: `run_tool_${randomBytes(4).toString("hex")}`,
        type: "tool",
        toolName: "lookup_order",
        costUsd: 0,
        latencyMs: 120,
        team: "support",
      },
    ]);
  }

  console.log("Seed complete for org", orgId);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
