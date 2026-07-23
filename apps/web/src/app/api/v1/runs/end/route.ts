import { eq } from "drizzle-orm";
import { runs } from "@agentledger/db";
import { EndRunSchema } from "@agentledger/shared";
import { authenticateApiKey } from "@/lib/auth-api";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return Response.json({ error: "Invalid API key" }, { status: 401 });

  const parsed = EndRunSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const run = await db.query.runs.findFirst({ where: eq(runs.id, parsed.data.runId) });
  if (!run || run.projectId !== auth.projectId) {
    return Response.json({ error: "Run not found" }, { status: 404 });
  }

  await db
    .update(runs)
    .set({
      status: parsed.data.status,
      endedAt: new Date(),
      metadata: parsed.data.metadata ?? run.metadata,
    })
    .where(eq(runs.id, run.id));

  return Response.json({ ok: true });
}
