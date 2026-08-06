import { requireAppSession } from "@/lib/auth-session";
import { isBillingEnabled } from "@/lib/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage() {
  const session = await requireAppSession();
  const billingOn = isBillingEnabled();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Billing</h1>
        <p className="text-sm text-[var(--al-muted)]">
          {billingOn
            ? "Stripe Checkout + Customer Portal"
            : "SaaS subscriptions are deferred — self-host entitlements are unlocked"}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {billingOn ? `Current plan: ${session.plan.name}` : "Self-host entitlements"}
          </CardTitle>
          <CardDescription>
            {session.plan.eventQuota.toLocaleString()} events/mo · hard budgets:{" "}
            {session.plan.hardBudgets ? "yes" : "no"} · audit export:{" "}
            {session.plan.auditExport ? "yes" : "no"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--al-muted)]">
          {billingOn ? (
            <p>
              Billing is enabled on this instance. Configure Stripe price IDs and use Checkout from a
              future release of the billing UI.
            </p>
          ) : (
            <>
              <p>
                AgentLedger is self-host first. Paid SaaS plans and Stripe Checkout are not offered
                yet. Every organization on this install receives full product entitlements (hard
                budgets, audit export, Slack alerts, payload retention) without a subscription.
              </p>
              <p>
                To re-enable SaaS billing later, set <code>AGENTLEDGER_BILLING_ENABLED=true</code>{" "}
                and configure Stripe keys — see DEPLOY.md.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
