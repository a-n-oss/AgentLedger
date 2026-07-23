import { and, eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { memberships, organizations } from "@agentledger/db";
import { getPlan, type PlanEntitlements } from "@agentledger/shared";
import { getDb, isDemoMode } from "./db";

export type AppSession = {
  userId: string;
  orgId: string;
  clerkOrgId: string;
  orgName: string;
  role: "owner" | "admin" | "member";
  plan: PlanEntitlements;
  email?: string | null;
};

const DEMO_ORG_CLERK_ID = process.env.SEED_CLERK_ORG_ID ?? "org_demo_agentledger";

export async function requireAppSession(): Promise<AppSession> {
  if (isDemoMode()) {
    const db = getDb();
    let org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkOrgId, DEMO_ORG_CLERK_ID),
    });
    if (!org) {
      const [created] = await db
        .insert(organizations)
        .values({
          clerkOrgId: DEMO_ORG_CLERK_ID,
          name: "Demo Org",
          plan: "team",
          eventQuota: 1_000_000,
        })
        .returning();
      org = created;
    }
    return {
      userId: "user_demo",
      orgId: org.id,
      clerkOrgId: org.clerkOrgId,
      orgName: org.name,
      role: "owner",
      plan: getPlan(org.plan),
      email: "demo@agentledger.dev",
    };
  }

  const session = await auth();
  if (!session.userId) {
    throw new Error("UNAUTHORIZED");
  }

  const db = getDb();
  const clerkOrgId = session.orgId;
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!clerkOrgId) {
    // Personal workspace fallback: find or create a personal org keyed by user
    const personalKey = `user_${session.userId}`;
    let org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkOrgId, personalKey),
    });
    if (!org) {
      const [created] = await db
        .insert(organizations)
        .values({
          clerkOrgId: personalKey,
          name: user?.fullName ? `${user.fullName}'s Org` : "Personal Org",
          plan: "free",
        })
        .returning();
      org = created;
      await db.insert(memberships).values({
        organizationId: org.id,
        clerkUserId: session.userId,
        role: "owner",
        email,
      });
    }
    return {
      userId: session.userId,
      orgId: org.id,
      clerkOrgId: org.clerkOrgId,
      orgName: org.name,
      role: "owner",
      plan: getPlan(org.plan),
      email,
    };
  }

  let org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkOrgId, clerkOrgId),
  });
  if (!org) {
    const [created] = await db
      .insert(organizations)
      .values({
        clerkOrgId,
        name: "Organization",
        plan: "free",
      })
      .returning();
    org = created;
  }

  let membership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.organizationId, org.id),
      eq(memberships.clerkUserId, session.userId),
    ),
  });
  if (!membership) {
    const [created] = await db
      .insert(memberships)
      .values({
        organizationId: org.id,
        clerkUserId: session.userId,
        role: "owner",
        email,
      })
      .returning();
    membership = created;
  }

  return {
    userId: session.userId,
    orgId: org.id,
    clerkOrgId: org.clerkOrgId,
    orgName: org.name,
    role: membership.role,
    plan: getPlan(org.plan),
    email,
  };
}
