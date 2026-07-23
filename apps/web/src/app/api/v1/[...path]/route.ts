import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { events, runs } from "@agentledger/db";
import { authenticateApiKey } from "@/lib/auth-api";
import { ensureAgent, checkBudgets, recordSpend } from "@/lib/budgets";
import { getDb } from "@/lib/db";
import {
  costFromUsage,
  detectProvider,
  extractUsage,
  parseAttribution,
  providerAuthHeaders,
  providerBaseUrl,
} from "@/lib/proxy";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleProxy(req: Request, path: string[]) {
  const started = Date.now();
  const requestId = randomUUID();
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const rl = rateLimit(`proxy:${auth.apiKeyId}`, 120, 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": String(rl.resetAt),
        },
      },
    );
  }

  if (auth.org.eventsUsedThisPeriod >= auth.org.eventQuota && !auth.plan.overageMetered) {
    return Response.json(
      { error: "Event quota exceeded for current plan", quota: auth.org.eventQuota },
      { status: 402 },
    );
  }

  const attribution = parseAttribution(req.headers);
  const agentName = attribution.agent ?? "default";
  const agent = await ensureAgent(auth.projectId, agentName);

  const budget = await checkBudgets({
    projectId: auth.projectId,
    agentId: agent.id,
    organizationId: auth.organizationId,
    planId: auth.org.plan,
  });
  if (!budget.allowed) {
    return Response.json(
      {
        error: budget.reason,
        budgetId: budget.budgetId,
        spentUsd: budget.spentUsd,
        amountUsd: budget.amountUsd,
      },
      { status: 402 },
    );
  }

  const bodyText = await req.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const model = typeof parsed.model === "string" ? parsed.model : "gpt-4o-mini";
  const stream = Boolean(parsed.stream);
  const providerHeader = req.headers.get("x-al-provider");
  const provider = detectProvider(model, providerHeader);

  let upstreamHeaders: HeadersInit;
  try {
    upstreamHeaders = {
      ...providerAuthHeaders(provider),
      "content-type": "application/json",
      accept: req.headers.get("accept") ?? "application/json",
    };
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Provider not configured" },
      { status: 503 },
    );
  }

  const upstreamUrl = `${providerBaseUrl(provider)}/${path.join("/")}`;
  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: upstreamHeaders,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : bodyText,
  });

  const db = getDb();
  const runId = attribution.runId;

  if (stream) {
    // Log a provisional event; token usage may be incomplete for streams
    const estimated = costFromUsage(model, 500, 500);
    await db.insert(events).values({
      projectId: auth.projectId,
      runId: runId ?? null,
      agentId: agent.id,
      requestId,
      type: "llm",
      provider,
      model,
      tokensIn: 500,
      tokensOut: 500,
      costUsd: estimated.costUsd,
      costEstimated: true,
      latencyMs: Date.now() - started,
      team: attribution.team,
      userLabel: attribution.user,
      metadata: { stream: true, path: path.join("/") },
    });
    await recordSpend({
      projectId: auth.projectId,
      organizationId: auth.organizationId,
      agentId: agent.id,
      costUsd: estimated.costUsd,
    });
    if (runId) {
      await db
        .update(runs)
        .set({ totalCostUsd: sql`${runs.totalCostUsd} + ${estimated.costUsd}` })
        .where(eq(runs.id, runId));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "text/event-stream",
        "cache-control": "no-cache",
        "x-al-request-id": requestId,
        "x-al-cost-estimated": "true",
      },
    });
  }

  const responseText = await upstream.text();
  let responseJson: unknown = null;
  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseJson = null;
  }

  const usage = extractUsage(responseJson);
  const usedModel = usage.model ?? model;
  const cost = costFromUsage(usedModel, usage.tokensIn, usage.tokensOut);

  let payloadRef: string | null = null;
  if (auth.retainPayloads && auth.plan.retainPayloads) {
    payloadRef = `inline:${Buffer.from(JSON.stringify({ request: parsed, response: responseJson })).toString("base64url").slice(0, 2000)}`;
  }

  await db.insert(events).values({
    projectId: auth.projectId,
    runId: runId ?? null,
    agentId: agent.id,
    requestId,
    type: upstream.ok ? "llm" : "error",
    provider,
    model: usedModel,
    tokensIn: usage.tokensIn,
    tokensOut: usage.tokensOut,
    costUsd: cost.costUsd,
    costEstimated: cost.estimated,
    latencyMs: Date.now() - started,
    team: attribution.team,
    userLabel: attribution.user,
    errorMessage: upstream.ok ? null : responseText.slice(0, 500),
    payloadRef,
    metadata: { path: path.join("/") },
  });

  await recordSpend({
    projectId: auth.projectId,
    organizationId: auth.organizationId,
    agentId: agent.id,
    costUsd: cost.costUsd,
  });

  if (runId) {
    await db
      .update(runs)
      .set({ totalCostUsd: sql`${runs.totalCostUsd} + ${cost.costUsd}` })
      .where(eq(runs.id, runId));
  }

  return new Response(responseText, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "x-al-request-id": requestId,
      "x-al-cost-usd": String(cost.costUsd),
      "x-al-cost-estimated": String(cost.estimated),
      "x-ratelimit-remaining": String(rl.remaining),
    },
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handleProxy(req, path);
}

export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handleProxy(req, path);
}

export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handleProxy(req, path);
}
