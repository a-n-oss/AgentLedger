import { eq } from "drizzle-orm";
import { organizations, stripeEvents } from "@agentledger/db";
import { PLANS, type PlanId } from "@agentledger/shared";
import { isBillingEnabled } from "@/lib/billing";
import { getDb } from "@/lib/db";
import { getStripe, planFromStripePrice } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isBillingEnabled()) {
    return Response.json({ received: true, billingDisabled: true });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing webhook config" }, { status: 400 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 },
    );
  }

  const db = getDb();
  const existing = await db.query.stripeEvents.findFirst({ where: eq(stripeEvents.id, event.id) });
  if (existing) {
    return Response.json({ received: true, duplicate: true });
  }

  await db.insert(stripeEvents).values({ id: event.id, type: event.type });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const organizationId = session.metadata?.organizationId;
      if (!organizationId) break;

      let plan = planFromStripePrice(null, session.metadata?.plan);
      let priceId: string | null = null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        priceId = subscription.items.data[0]?.price.id ?? null;
        plan =
          plan ??
          planFromStripePrice(priceId, subscription.metadata?.plan) ??
          planFromStripePrice(priceId, session.metadata?.plan);
      }

      if (plan === "pro" || plan === "team") {
        await db
          .update(organizations)
          .set({
            plan,
            eventQuota: PLANS[plan].eventQuota,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripePriceId: priceId,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, organizationId));
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const organizationId = subscription.metadata?.organizationId;
      if (!organizationId) break;

      if (event.type === "customer.subscription.deleted" || subscription.status === "canceled") {
        await db
          .update(organizations)
          .set({
            plan: "free",
            eventQuota: PLANS.free.eventQuota,
            stripeSubscriptionId: null,
            stripePriceId: null,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, organizationId));
      } else {
        const priceId = subscription.items.data[0]?.price.id ?? null;
        const plan: PlanId =
          planFromStripePrice(priceId, subscription.metadata?.plan) ?? "pro";
        if (plan === "pro" || plan === "team") {
          await db
            .update(organizations)
            .set({
              plan,
              eventQuota: PLANS[plan].eventQuota,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, organizationId));
        }
      }
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
