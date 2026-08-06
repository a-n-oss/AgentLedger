import Stripe from "stripe";
import type { PlanId } from "@agentledger/shared";
import { isBillingEnabled } from "./billing";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/** True only when SaaS billing is enabled and Stripe price IDs are configured. */
export function stripeConfigured() {
  if (!isBillingEnabled()) return false;
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_PRO &&
      process.env.STRIPE_PRICE_TEAM,
  );
}

export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

/** Map a Stripe Price ID (or metadata.plan) to an app plan. */
export function planFromStripePrice(priceId: string | null | undefined, metadataPlan?: string | null): PlanId | null {
  if (metadataPlan === "pro" || metadataPlan === "team") return metadataPlan;
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_TEAM) return "team";
  return null;
}
