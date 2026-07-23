import { OpenRunSchema } from "@agentledger/shared";
import { runs } from "@agentledger/db";
import { authenticateApiKey } from "@/lib/auth-api";
import { checkBudgets, ensureAgent } from "@/lib/budgets";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return Response.json({ error: "Invalid API key" }, { status: 401 });

  const rl = rateLimit(`ingest:${auth.apiKeyId}`, 300, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = OpenRunSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const agent = await ensureAgent(auth.projectId, parsed.data.agent);
  const budget = await checkBudgets({
    projectId: auth.projectId,
    agentId: agent.id,
    organizationId: auth.organizationId,
    planId: auth.org.plan,
  });
  if (!budget.allowed) {
    return Response.json({ error: budget.reason }, { status: 402 });
  }

  const db = getDb();
  const [run] = await db
    .insert(runs)
    .values({
      projectId: auth.projectId,
      agentId: agent.id,
      team: parsed.data.team,
      userLabel: parsed.data.user,
      status: "running",
      metadata: parsed.data.metadata,
    })
    .returning();

  return Response.json({ runId: run.id });
}
