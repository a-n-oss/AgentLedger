import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { events, runs } from "@agentledger/db";
import { SpanSchema, calculateCostUsd } from "@agentledger/shared";
import { authenticateApiKey } from "@/lib/auth-api";
import { recordSpend } from "@/lib/budgets";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return Response.json({ error: "Invalid API key" }, { status: 401 });

  const rl = rateLimit(`ingest:${auth.apiKeyId}`, 300, 60_000);
  if (!rl.allowed) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

  const parsed = SpanSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const run = await db.query.runs.findFirst({ where: eq(runs.id, parsed.data.runId) });
  if (!run || run.projectId !== auth.projectId) {
    return Response.json({ error: "Run not found" }, { status: 404 });
  }

  let costUsd = parsed.data.costUsd ?? 0;
  let costEstimated = false;
  if (parsed.data.type === "llm" && parsed.data.model && parsed.data.costUsd == null) {
    const calc = calculateCostUsd({
      model: parsed.data.model,
      tokensIn: parsed.data.tokensIn ?? 0,
      tokensOut: parsed.data.tokensOut ?? 0,
    });
    costUsd = calc.costUsd;
    costEstimated = calc.estimated;
  }

  const [event] = await db
    .insert(events)
    .values({
      projectId: auth.projectId,
      runId: run.id,
      agentId: run.agentId,
      requestId: randomUUID(),
      type: parsed.data.type,
      provider: parsed.data.provider,
      model: parsed.data.model,
      tokensIn: parsed.data.tokensIn ?? 0,
      tokensOut: parsed.data.tokensOut ?? 0,
      costUsd,
      costEstimated,
      latencyMs: parsed.data.latencyMs,
      toolName: parsed.data.toolName,
      team: run.team,
      userLabel: run.userLabel,
      errorMessage: parsed.data.errorMessage,
      metadata: parsed.data.metadata,
    })
    .returning();

  if (costUsd > 0) {
    await recordSpend({
      projectId: auth.projectId,
      organizationId: auth.organizationId,
      agentId: run.agentId,
      costUsd,
    });
    await db
      .update(runs)
      .set({ totalCostUsd: sql`${runs.totalCostUsd} + ${costUsd}` })
      .where(eq(runs.id, run.id));
  }

  return Response.json({ eventId: event.id });
}
