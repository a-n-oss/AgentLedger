"use client";

import { useTransition } from "react";
import { createCheckoutSessionAction, createPortalSessionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function BillingActions() {
  const [pending, startTransition] = useTransition();

  async function go(urlPromise: Promise<{ url: string | null }>) {
    const { url } = await urlPromise;
    if (url) window.location.href = url;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="accent"
        disabled={pending}
        onClick={() => startTransition(() => go(createCheckoutSessionAction("pro")))}
      >
        Upgrade to Pro
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => startTransition(() => go(createCheckoutSessionAction("team")))}
      >
        Upgrade to Team
      </Button>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => go(createPortalSessionAction()))}
      >
        Customer portal
      </Button>
    </div>
  );
}
