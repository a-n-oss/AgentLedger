import { z } from "zod";

export const AttributionHeadersSchema = z.object({
  agent: z.string().min(1).max(128).optional(),
  team: z.string().min(1).max(128).optional(),
  user: z.string().min(1).max(128).optional(),
  runId: z.string().uuid().optional(),
});

export type AttributionHeaders = z.infer<typeof AttributionHeadersSchema>;

export const OpenRunSchema = z.object({
  agent: z.string().min(1).max(128),
  team: z.string().min(1).max(128).optional(),
  user: z.string().min(1).max(128).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const SpanSchema = z.object({
  runId: z.string().uuid(),
  type: z.enum(["llm", "tool", "mcp", "error"]),
  provider: z.string().optional(),
  model: z.string().optional(),
  tokensIn: z.number().int().nonnegative().optional(),
  tokensOut: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  latencyMs: z.number().int().nonnegative().optional(),
  toolName: z.string().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const EndRunSchema = z.object({
  runId: z.string().uuid(),
  status: z.enum(["completed", "failed", "cancelled"]).default("completed"),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateBudgetSchema = z.object({
  name: z.string().min(1).max(128),
  scope: z.enum(["project", "agent"]),
  agentId: z.string().uuid().optional(),
  period: z.enum(["daily", "monthly"]),
  amountUsd: z.number().positive(),
  hard: z.boolean().default(true),
  alertThresholds: z.array(z.number().min(1).max(100)).default([50, 80, 100]),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(128),
  retainPayloads: z.boolean().optional(),
});

export const CreateAlertChannelSchema = z.object({
  type: z.enum(["slack", "email"]),
  target: z.string().min(1).max(512),
});
