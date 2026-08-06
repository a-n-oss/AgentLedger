import { and, eq, isNull } from "drizzle-orm";
import { apiKeys, organizations, projects } from "@agentledger/db";
import type { PlanEntitlements } from "@agentledger/shared";
import { resolveEntitlements } from "./billing";
import { getDb } from "./db";
import { extractBearerToken, hashApiKey } from "./api-keys";

export type AuthenticatedProject = {
  apiKeyId: string;
  projectId: string;
  organizationId: string;
  projectName: string;
  retainPayloads: boolean;
  plan: PlanEntitlements;
  org: typeof organizations.$inferSelect;
};

export async function authenticateApiKey(authHeader: string | null): Promise<AuthenticatedProject | null> {
  const token = extractBearerToken(authHeader);
  if (!token) return null;

  const db = getDb();
  const keyHash = hashApiKey(token);
  const row = await db
    .select({
      apiKeyId: apiKeys.id,
      projectId: projects.id,
      projectName: projects.name,
      retainPayloads: projects.retainPayloads,
      organizationId: organizations.id,
      org: organizations,
    })
    .from(apiKeys)
    .innerJoin(projects, eq(apiKeys.projectId, projects.id))
    .innerJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);

  const match = row[0];
  if (!match) return null;

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, match.apiKeyId));

  return {
    apiKeyId: match.apiKeyId,
    projectId: match.projectId,
    projectName: match.projectName,
    retainPayloads: match.retainPayloads,
    organizationId: match.organizationId,
    plan: resolveEntitlements(match.org.plan),
    org: match.org,
  };
}
