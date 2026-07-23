import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);
export const budgetScopeEnum = pgEnum("budget_scope", ["project", "agent"]);
export const budgetPeriodEnum = pgEnum("budget_period", ["daily", "monthly"]);
export const eventTypeEnum = pgEnum("event_type", ["llm", "tool", "mcp", "error"]);
export const runStatusEnum = pgEnum("run_status", ["running", "completed", "failed", "cancelled"]);
export const alertChannelTypeEnum = pgEnum("alert_channel_type", ["slack", "email"]);
export const membershipRoleEnum = pgEnum("membership_role", ["owner", "admin", "member"]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  eventQuota: integer("event_quota").notNull().default(10_000),
  eventsUsedThisPeriod: integer("events_used_this_period").notNull().default(0),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clerkUserId: text("clerk_user_id").notNull(),
    role: membershipRoleEnum("role").notNull().default("member"),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("memberships_org_user_uidx").on(t.organizationId, t.clerkUserId),
    index("memberships_user_idx").on(t.clerkUserId),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    retainPayloads: boolean("retain_payloads").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("projects_org_idx").on(t.organizationId)],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Default"),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("api_keys_hash_uidx").on(t.keyHash),
    index("api_keys_project_idx").on(t.projectId),
  ],
);

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("agents_project_name_uidx").on(t.projectId, t.name),
    index("agents_project_idx").on(t.projectId),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    scope: budgetScopeEnum("scope").notNull(),
    period: budgetPeriodEnum("period").notNull(),
    amountUsd: doublePrecision("amount_usd").notNull(),
    hard: boolean("hard").notNull().default(true),
    alertThresholds: jsonb("alert_thresholds").$type<number[]>().notNull().default([50, 80, 100]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("budgets_project_idx").on(t.projectId)],
);

export const budgetUsages = pgTable(
  "budget_usages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    spentUsd: doublePrecision("spent_usd").notNull().default(0),
    eventCount: integer("event_count").notNull().default(0),
    lastAlertThreshold: integer("last_alert_threshold"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("budget_usages_budget_period_uidx").on(t.budgetId, t.periodStart),
    index("budget_usages_budget_idx").on(t.budgetId),
  ],
);

export const runs = pgTable(
  "runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    team: text("team"),
    userLabel: text("user_label"),
    status: runStatusEnum("status").notNull().default("running"),
    totalCostUsd: doublePrecision("total_cost_usd").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [
    index("runs_project_idx").on(t.projectId),
    index("runs_agent_idx").on(t.agentId),
    index("runs_started_idx").on(t.startedAt),
  ],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    runId: uuid("run_id").references(() => runs.id, { onDelete: "set null" }),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    requestId: text("request_id").notNull(),
    type: eventTypeEnum("type").notNull(),
    provider: text("provider"),
    model: text("model"),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    costUsd: doublePrecision("cost_usd").notNull().default(0),
    costEstimated: boolean("cost_estimated").notNull().default(false),
    latencyMs: integer("latency_ms"),
    toolName: text("tool_name"),
    team: text("team"),
    userLabel: text("user_label"),
    errorMessage: text("error_message"),
    payloadRef: text("payload_ref"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("events_project_created_idx").on(t.projectId, t.createdAt),
    index("events_run_idx").on(t.runId),
    index("events_agent_idx").on(t.agentId),
    index("events_request_idx").on(t.requestId),
  ],
);

export const alertChannels = pgTable(
  "alert_channels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: alertChannelTypeEnum("type").notNull(),
    target: text("target").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("alert_channels_org_idx").on(t.organizationId)],
);

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Run = typeof runs.$inferSelect;
export type Event = typeof events.$inferSelect;
