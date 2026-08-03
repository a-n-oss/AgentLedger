"use client";

import { useState, useTransition } from "react";
import type { PlanId } from "@agentledger/shared";
import { createCheckoutSessionAction, createPortalSessionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  team: 2,
};

export function BillingActions({
  stripeReady,
  currentPlan,
}: {
  stripeReady: boolean;
  currentPlan: PlanId;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rank = PLAN_RANK[currentPlan];
  const canUpgradePro = rank < PLAN_RANK.pro;
  const canUpgradeTeam = rank < PLAN_RANK.team;
  const onPaidPlan = rank > PLAN_RANK.free;

  async function go(urlPromise: Promise<{ url: string | null }>) {
    setError(null);
    try {
      const { url } = await urlPromise;
      if (url) window.location.href = url;
      else setError("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing action failed");
    }
  }

  return (
    <div className="space-y-3">
      {!stripeReady ? (
        <p className="rounded-md border border-[var(--al-line)] bg-[var(--al-panel-2)] px-3 py-2 text-sm text-[var(--al-muted)]">
          Stripe is not fully configured on this host yet (
          <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRICE_PRO</code>,{" "}
          <code>STRIPE_PRICE_TEAM</code>).
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {canUpgradePro ? (
          <Button
            variant="accent"
            disabled={pending || !stripeReady}
            onClick={() => startTransition(() => go(createCheckoutSessionAction("pro")))}
          >
            Upgrade to Pro
          </Button>
        ) : null}
        {canUpgradeTeam ? (
          <Button
            variant={canUpgradePro ? "secondary" : "accent"}
            disabled={pending || !stripeReady}
            onClick={() => startTransition(() => go(createCheckoutSessionAction("team")))}
          >
            Upgrade to Team
          </Button>
        ) : null}
        <Button
          variant="outline"
          disabled={pending || !stripeReady || !onPaidPlan}
          onClick={() => startTransition(() => go(createPortalSessionAction()))}
        >
          {onPaidPlan ? "Manage subscription" : "Customer portal"}
        </Button>
      </div>
      {!canUpgradePro && !canUpgradeTeam ? (
        <p className="text-sm text-[var(--al-muted)]">
          You are on the {currentPlan === "team" ? "Team" : "Pro"} plan. Use Manage subscription to
          change or cancel.
        </p>
      ) : null}
      {error ? <p className="text-sm text-[var(--al-danger)]">{error}</p> : null}
    </div>
  );
}
