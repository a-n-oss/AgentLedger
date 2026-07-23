import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    demoMode: process.env.AGENTLEDGER_DEMO_MODE === "true" ? "true" : "false",
    time: new Date().toISOString(),
  };

  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
    checks.status = "degraded";
  }

  return Response.json(checks, {
    status: checks.status === "ok" ? 200 : 503,
  });
}
