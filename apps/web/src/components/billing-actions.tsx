"use client";

/**
 * Stripe upgrade / portal UI is deferred (pre-monetization).
 * Server actions still refuse checkout when AGENTLEDGER_BILLING_ENABLED is unset.
 */
export function BillingActions() {
  return (
    <p className="rounded-md border border-[var(--al-line)] bg-[var(--al-panel-2)] px-3 py-2 text-sm text-[var(--al-muted)]">
      Billing is not available. Self-host installs use unlocked entitlements; SaaS subscriptions are
      deferred.
    </p>
  );
}
