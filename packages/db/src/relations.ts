import { relations } from "drizzle-orm";
import {
  agents,
  alertChannels,
  apiKeys,
  budgetUsages,
  budgets,
  events,
  memberships,
  organizations,
  projects,
  providerSecrets,
  runs,
} from "./schema.js";

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  projects: many(projects),
  alertChannels: many(alertChannels),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  apiKeys: many(apiKeys),
  providerSecrets: many(providerSecrets),
  agents: many(agents),
  budgets: many(budgets),
  events: many(events),
  runs: many(runs),
}));

export const providerSecretsRelations = relations(providerSecrets, ({ one }) => ({
  project: one(projects, {
    fields: [providerSecrets.projectId],
    references: [projects.id],
  }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  project: one(projects, {
    fields: [agents.projectId],
    references: [projects.id],
  }),
  events: many(events),
  runs: many(runs),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  project: one(projects, {
    fields: [budgets.projectId],
    references: [projects.id],
  }),
  agent: one(agents, {
    fields: [budgets.agentId],
    references: [agents.id],
  }),
  usages: many(budgetUsages),
}));

export const runsRelations = relations(runs, ({ one, many }) => ({
  project: one(projects, {
    fields: [runs.projectId],
    references: [projects.id],
  }),
  agent: one(agents, {
    fields: [runs.agentId],
    references: [agents.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  project: one(projects, {
    fields: [events.projectId],
    references: [projects.id],
  }),
  run: one(runs, {
    fields: [events.runId],
    references: [runs.id],
  }),
  agent: one(agents, {
    fields: [events.agentId],
    references: [agents.id],
  }),
}));
