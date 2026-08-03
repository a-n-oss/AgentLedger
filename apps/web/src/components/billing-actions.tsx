"use client";

import { useState, useTransition } from "react";
import { createCheckoutSessionAction, createPortalSessionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function BillingActions({ stripeReady }: { stripeReady: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
        <Button
          variant="accent"
          disabled={pending || !stripeReady}
          onClick={() => startTransition(() => go(createCheckoutSessionAction("pro")))}
        >
          Upgrade to Pro
        </Button>
        <Button
          variant="secondary"
          disabled={pending || !stripeReady}
          onClick={() => startTransition(() => go(createCheckoutSessionAction("team")))}
        >
          Upgrade to Team
        </Button>
        <Button
          variant="outline"
          disabled={pending || !stripeReady}
          onClick={() => startTransition(() => go(createPortalSessionAction()))}
        >
          Customer portal
        </Button>
      </div>
      {error ? <p className="text-sm text-[var(--al-danger)]">{error}</p> : null}
    </div>
  );
}
