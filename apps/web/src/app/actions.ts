"use server";

import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  agents,
  alertChannels,
  apiKeys,
  budgets,
  events,
  organizations,
  projects,
  providerSecrets,
  runs,
} from "@agentledger/db";
import {
  CreateAlertChannelSchema,
  CreateBudgetSchema,
  CreateProjectSchema,
  UpsertProviderSecretSchema,
} from "@agentledger/shared";
import { generateApiKey } from "@/lib/api-keys";
import { isDemoSession, requireAppSession } from "@/lib/auth-session";
import { revalidateConsole } from "@/lib/console";
import { getDb } from "@/lib/db";
import { sendBudgetAlertsInline } from "@/lib/alerts";
import {
  encryptSecret,
  keyHint,
  listProviderSecretHints,
  secretsKeyConfigured,
} from "@/lib/secrets";
import { appUrl, getStripe, stripeConfigured } from "@/lib/stripe";

export async function createProjectAction(formData: FormData) {
  const session = await requireAppSession();
  const parsed = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    retainPayloads: formData.get("retainPayloads") === "on",
  });
  if (!parsed.success) throw new Error("Invalid project");

  const db = getDb();
  const existing = await db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
  });
  if (existing.length >= session.plan.maxProjects) {
    throw new Error(`Plan limit: max ${session.plan.maxProjects} projects`);
  }

  if (parsed.data.retainPayloads && !session.plan.retainPayloads) {
    throw new Error("Payload retention requires Team plan");
  }

  const [project] = await db
    .insert(projects)
    .values({
      organizationId: session.orgId,
      name: parsed.data.name,
      retainPayloads: parsed.data.retainPayloads ?? false,
    })
    .returning();

  const key = generateApiKey();
  await db.insert(apiKeys).values({
    projectId: project.id,
    name: "Default",
    keyPrefix: key.prefix,
    keyHash: key.hash,
  });

  revalidateConsole("/projects");
  return { projectId: project.id, apiKey: key.raw };
}

export async function rotateApiKeyAction(projectId: string) {
  const session = await requireAppSession();
  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, session.orgId)),
  });
  if (!project) throw new Error("Project not found");

  const key = generateApiKey();
  await db.insert(apiKeys).values({
    projectId,
    name: `Rotated ${new Date().toISOString().slice(0, 10)}`,
    keyPrefix: key.prefix,
    keyHash: key.hash,
  });
  revalidateConsole(`/projects/${projectId}`);
  return { apiKey: key.raw };
}

export async function revokeApiKeyAction(keyId: string, projectId: string) {
  const session = await requireAppSession();
  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, session.orgId)),
  });
  if (!project) throw new Error("Project not found");
  await db.update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, keyId));
  revalidateConsole(`/projects/${projectId}`);
}

export async function createBudgetAction(formData: FormData) {
  const session = await requireAppSession();
  const hard = formData.get("hard") === "on";
  if (hard && !session.plan.hardBudgets) {
    throw new Error("Hard budgets require Pro or Team");
  }

  const parsed = CreateBudgetSchema.safeParse({
    name: formData.get("name"),
    scope: formData.get("scope"),
    agentId: formData.get("agentId") || undefined,
    period: formData.get("period"),
    amountUsd: Number(formData.get("amountUsd")),
    hard,
    alertThresholds: String(formData.get("alertThresholds") ?? "50,80,100")
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n)),
  });
  if (!parsed.success) throw new Error("Invalid budget");

  const db = getDb();
  const projectId = String(formData.get("projectId"));
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, session.orgId)),
  });
  if (!project) throw new Error("Project not found");

  await db.insert(budgets).values({
    projectId,
    agentId: parsed.data.scope === "agent" ? parsed.data.agentId : null,
    name: parsed.data.name,
    scope: parsed.data.scope,
    period: parsed.data.period,
    amountUsd: parsed.data.amountUsd,
    hard: parsed.data.hard,
    alertThresholds: parsed.data.alertThresholds,
  });
  revalidateConsole("/budgets");
}

export async function createAlertChannelAction(formData: FormData) {
  const session = await requireAppSession();
  const type = String(formData.get("type"));
  if (type === "slack" && !session.plan.slackAlerts) {
    throw new Error("Slack alerts require Pro or Team");
  }
  const parsed = CreateAlertChannelSchema.safeParse({
    type,
    target: String(formData.get("target") ?? "").trim(),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid alert channel");

  const db = getDb();
  await db.insert(alertChannels).values({
    organizationId: session.orgId,
    type: parsed.data.type,
    target: parsed.data.target,
  });
  revalidateConsole("/alerts");
}

export async function deleteAlertChannelAction(id: string) {
  const session = await requireAppSession();
  const db = getDb();
  await db
    .delete(alertChannels)
    .where(and(eq(alertChannels.id, id), eq(alertChannels.organizationId, session.orgId)));
  revalidateConsole("/alerts");
}

export async function sendTestAlertAction() {
  const session = await requireAppSession();
  const result = await sendBudgetAlertsInline({
    organizationId: session.orgId,
    budgetName: "Test alert",
    threshold: 80,
    spentUsd: 80,
    amountUsd: 100,
    hard: false,
  });
  revalidateConsole("/alerts");
  if (result.emailed === 0 && result.slacked === 0) {
    const detail = [...result.errors, ...result.skipped].join("; ") || "No channels delivered";
    throw new Error(detail);
  }
  return {
    ok: true as const,
    emailed: result.emailed,
    slacked: result.slacked,
  };
}

export async function upsertProviderSecretAction(formData: FormData) {
  const session = await requireAppSession();
  if (!secretsKeyConfigured()) {
    throw new Error(
      "AGENTLEDGER_SECRETS_KEY is not configured. Generate with: openssl rand -base64 32",
    );
  }
  const parsed = UpsertProviderSecretSchema.safeParse({
    projectId: formData.get("projectId"),
    provider: formData.get("provider"),
    secret: formData.get("secret"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid provider key");

  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, parsed.data.projectId), eq(projects.organizationId, session.orgId)),
  });
  if (!project) throw new Error("Project not found");

  const { ciphertext, iv } = encryptSecret(parsed.data.secret);
  const hint = keyHint(parsed.data.secret);
  const existing = await db.query.providerSecrets.findFirst({
    where: and(
      eq(providerSecrets.projectId, parsed.data.projectId),
      eq(providerSecrets.provider, parsed.data.provider),
    ),
  });

  if (existing) {
    await db
      .update(providerSecrets)
      .set({ ciphertext, iv, keyHint: hint, updatedAt: new Date() })
      .where(eq(providerSecrets.id, existing.id));
  } else {
    await db.insert(providerSecrets).values({
      projectId: parsed.data.projectId,
      provider: parsed.data.provider,
      ciphertext,
      iv,
      keyHint: hint,
    });
  }

  revalidateConsole(`/projects/${parsed.data.projectId}`);
}

export async function deleteProviderSecretAction(projectId: string, provider: string) {
  const session = await requireAppSession();
  if (
    provider !== "openai" &&
    provider !== "anthropic" &&
    provider !== "google" &&
    provider !== "xai"
  ) {
    throw new Error("Invalid provider");
  }
  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, session.orgId)),
  });
  if (!project) throw new Error("Project not found");

  await db
    .delete(providerSecrets)
    .where(
      and(eq(providerSecrets.projectId, projectId), eq(providerSecrets.provider, provider)),
    );
  revalidateConsole(`/projects/${projectId}`);
}

export async function createCheckoutSessionAction(plan: "pro" | "team") {
  const session = await requireAppSession();
  const billingBase = session.surface === "demo" ? "/demo" : "/app";

  if (isDemoSession(session)) {
    return { url: `${billingBase}/settings/billing?demo=1` };
  }
  if (!stripeConfigured()) {
    throw new Error(
      "Stripe is not fully configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, and STRIPE_PRICE_TEAM.",
    );
  }

  const priceId = plan === "pro" ? process.env.STRIPE_PRICE_PRO! : process.env.STRIPE_PRICE_TEAM!;
  const stripe = getStripe();
  const db = getDb();
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, session.orgId),
  });
  if (!organization) throw new Error("Org not found");

  let customerId = organization.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email ?? undefined,
      name: session.orgName,
      metadata: { organizationId: session.orgId, clerkOrgId: session.clerkOrgId },
    });
    customerId = customer.id;
    await db
      .update(organizations)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(organizations.id, session.orgId));
  }

  const lineItems: { price: string; quantity?: number }[] = [{ price: priceId, quantity: 1 }];
  if (process.env.STRIPE_METERED_PRICE) {
    lineItems.push({ price: process.env.STRIPE_METERED_PRICE });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: lineItems,
    allow_promotion_codes: true,
    success_url: appUrl(`${billingBase}/settings/billing?success=1`),
    cancel_url: appUrl(`${billingBase}/settings/billing?canceled=1`),
    metadata: { organizationId: session.orgId, plan },
    subscription_data: {
      metadata: { organizationId: session.orgId, plan },
    },
  });

  if (!checkout.url) throw new Error("Stripe Checkout did not return a URL");
  return { url: checkout.url };
}

export async function createPortalSessionAction() {
  const session = await requireAppSession();
  const billingBase = session.surface === "demo" ? "/demo" : "/app";

  if (isDemoSession(session)) {
    return { url: `${billingBase}/settings/billing?demo=1` };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const db = getDb();
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, session.orgId),
  });
  if (!organization?.stripeCustomerId) {
    throw new Error("No Stripe customer yet — upgrade to Pro or Team first");
  }
  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: appUrl(`${billingBase}/settings/billing`),
  });
  return { url: portal.url };
}

export async function getOverviewStats() {
  const session = await requireAppSession();
  const db = getDb();
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
  });
  const projectIds = orgProjects.map((p) => p.id);
  if (projectIds.length === 0) {
    return {
      spend30d: 0,
      events30d: 0,
      agents: 0,
      runs: 0,
      series: [] as { day: string; spend: number }[],
      topAgents: [] as { name: string; spend: number }[],
      topModels: [] as { model: string; spend: number }[],
      errorRate: 0,
    };
  }

  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  const spendRows = await db
    .select({
      spend: sql<number>`coalesce(sum(${events.costUsd}), 0)`,
      count: sql<number>`count(*)::int`,
      errors: sql<number>`count(*) filter (where ${events.type} = 'error')::int`,
    })
    .from(events)
    .where(and(inArray(events.projectId, projectIds), gte(events.createdAt, since)));

  const seriesRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${events.createdAt}), 'YYYY-MM-DD')`,
      spend: sql<number>`coalesce(sum(${events.costUsd}), 0)`,
    })
    .from(events)
    .where(and(inArray(events.projectId, projectIds), gte(events.createdAt, since)))
    .groupBy(sql`date_trunc('day', ${events.createdAt})`)
    .orderBy(sql`date_trunc('day', ${events.createdAt})`);

  const topAgentRows = await db
    .select({
      name: agents.name,
      spend: sql<number>`coalesce(sum(${events.costUsd}), 0)`,
    })
    .from(events)
    .leftJoin(agents, eq(events.agentId, agents.id))
    .where(and(inArray(events.projectId, projectIds), gte(events.createdAt, since)))
    .groupBy(agents.name)
    .orderBy(sql`sum(${events.costUsd}) desc`)
    .limit(5);

  const topModelRows = await db
    .select({
      model: events.model,
      spend: sql<number>`coalesce(sum(${events.costUsd}), 0)`,
    })
    .from(events)
    .where(and(inArray(events.projectId, projectIds), gte(events.createdAt, since)))
    .groupBy(events.model)
    .orderBy(sql`sum(${events.costUsd}) desc`)
    .limit(5);

  const agentCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agents)
    .where(inArray(agents.projectId, projectIds));

  const runCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(runs)
    .where(and(inArray(runs.projectId, projectIds), gte(runs.startedAt, since)));

  const spend30d = Number(spendRows[0]?.spend ?? 0);
  const events30d = Number(spendRows[0]?.count ?? 0);
  const errors = Number(spendRows[0]?.errors ?? 0);

  return {
    spend30d,
    events30d,
    agents: Number(agentCount[0]?.count ?? 0),
    runs: Number(runCount[0]?.count ?? 0),
    series: seriesRows.map((r) => ({ day: r.day, spend: Number(r.spend) })),
    topAgents: topAgentRows.map((r) => ({ name: r.name ?? "unknown", spend: Number(r.spend) })),
    topModels: topModelRows.map((r) => ({ model: r.model ?? "unknown", spend: Number(r.spend) })),
    errorRate: events30d === 0 ? 0 : errors / events30d,
  };
}

export async function listProjects() {
  const session = await requireAppSession();
  const db = getDb();
  return db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
    orderBy: [desc(projects.createdAt)],
  });
}

export async function getProject(projectId: string) {
  const session = await requireAppSession();
  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, session.orgId)),
  });
  if (!project) return null;
  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.projectId, projectId),
    orderBy: [desc(apiKeys.createdAt)],
  });
  const providerKeys = await listProviderSecretHints(projectId);
  return { project, keys, providerKeys, secretsKeyConfigured: secretsKeyConfigured() };
}

export async function listAgents() {
  const session = await requireAppSession();
  const db = getDb();
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
  });
  const projectIds = orgProjects.map((p) => p.id);
  if (projectIds.length === 0) return [];

  const rows = await db
    .select({
      id: agents.id,
      name: agents.name,
      projectId: agents.projectId,
      projectName: projects.name,
      spend: sql<number>`coalesce(sum(${events.costUsd}), 0)`,
      events: sql<number>`count(${events.id})::int`,
    })
    .from(agents)
    .innerJoin(projects, eq(agents.projectId, projects.id))
    .leftJoin(events, eq(events.agentId, agents.id))
    .where(inArray(agents.projectId, projectIds))
    .groupBy(agents.id, agents.name, agents.projectId, projects.name)
    .orderBy(sql`sum(${events.costUsd}) desc nulls last`);

  return rows.map((r) => ({
    ...r,
    spend: Number(r.spend),
    events: Number(r.events),
  }));
}

export async function listRuns() {
  const session = await requireAppSession();
  const db = getDb();
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
  });
  const projectIds = orgProjects.map((p) => p.id);
  if (projectIds.length === 0) return [];

  return db
    .select({
      id: runs.id,
      status: runs.status,
      totalCostUsd: runs.totalCostUsd,
      team: runs.team,
      startedAt: runs.startedAt,
      endedAt: runs.endedAt,
      agentName: agents.name,
      projectName: projects.name,
    })
    .from(runs)
    .leftJoin(agents, eq(runs.agentId, agents.id))
    .innerJoin(projects, eq(runs.projectId, projects.id))
    .where(inArray(runs.projectId, projectIds))
    .orderBy(desc(runs.startedAt))
    .limit(100);
}

export async function listBudgets() {
  const session = await requireAppSession();
  const db = getDb();
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
  });
  const projectIds = orgProjects.map((p) => p.id);
  if (projectIds.length === 0) return [];
  return db
    .select({
      id: budgets.id,
      name: budgets.name,
      scope: budgets.scope,
      period: budgets.period,
      amountUsd: budgets.amountUsd,
      hard: budgets.hard,
      projectName: projects.name,
      agentName: agents.name,
    })
    .from(budgets)
    .innerJoin(projects, eq(budgets.projectId, projects.id))
    .leftJoin(agents, eq(budgets.agentId, agents.id))
    .where(inArray(budgets.projectId, projectIds))
    .orderBy(desc(budgets.createdAt));
}

export async function listAlertChannels() {
  const session = await requireAppSession();
  const db = getDb();
  return db.query.alertChannels.findMany({
    where: eq(alertChannels.organizationId, session.orgId),
    orderBy: [desc(alertChannels.createdAt)],
  });
}

export async function exportEventsAction(format: "csv" | "json", days: number) {
  const session = await requireAppSession();
  if (!session.plan.auditExport) {
    throw new Error("Audit export requires Team plan");
  }
  const db = getDb();
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, session.orgId),
  });
  const projectIds = orgProjects.map((p) => p.id);
  const since = new Date(Date.now() - days * 24 * 3600_000);
  const rows = projectIds.length
    ? await db
        .select()
        .from(events)
        .where(and(inArray(events.projectId, projectIds), gte(events.createdAt, since)))
        .orderBy(desc(events.createdAt))
        .limit(10_000)
    : [];

  if (format === "json") {
    return { contentType: "application/json", body: JSON.stringify(rows, null, 2) };
  }

  const header = [
    "id",
    "createdAt",
    "type",
    "provider",
    "model",
    "tokensIn",
    "tokensOut",
    "costUsd",
    "team",
    "toolName",
    "requestId",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.createdAt.toISOString(),
        r.type,
        r.provider ?? "",
        r.model ?? "",
        r.tokensIn,
        r.tokensOut,
        r.costUsd,
        r.team ?? "",
        r.toolName ?? "",
        r.requestId,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    ),
  ];
  return { contentType: "text/csv", body: lines.join("\n") };
}
