import { PLANS } from "@agentledger/shared";
import { requireAppSession } from "@/lib/auth-session";
import { stripeConfigured } from "@/lib/stripe";
import { BillingActions } from "@/components/billing-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; demo?: string }>;
}) {
  const session = await requireAppSession();
  const params = await searchParams;
  const plan = PLANS[session.plan.id];
  const ready = stripeConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Billing</h1>
        <p className="text-sm text-[var(--al-muted)]">Stripe Checkout + Customer Portal</p>
      </div>
      {params.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Checkout complete. If your plan has not updated yet, wait a few seconds for the webhook.
        </p>
      )}
      {params.canceled && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Checkout canceled.</p>
      )}
      {params.demo && (
        <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">
          Seeded demo cannot run live Checkout. Use a Clerk-signed-in <code>/app</code> session.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Current plan: {plan.name}</CardTitle>
          <CardDescription>
            {plan.eventQuota.toLocaleString()} events/mo · hard budgets:{" "}
            {plan.hardBudgets ? "yes" : "no"} · audit export: {plan.auditExport ? "yes" : "no"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingActions stripeReady={ready} currentPlan={plan.id} />
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.values(PLANS).map((p) => {
          const current = p.id === plan.id;
          return (
            <Card
              key={p.id}
              className={current ? "border-[var(--al-accent)] ring-1 ring-[var(--al-accent)]" : undefined}
            >
              <CardHeader>
                <CardTitle>
                  {p.name}
                  {current ? (
                    <span className="ml-2 text-xs font-medium text-[var(--al-accent)]">Current</span>
                  ) : null}
                </CardTitle>
                <CardDescription>${p.priceMonthlyUsd}/mo</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[var(--al-muted)]">
                {p.eventQuota.toLocaleString()} events · {p.maxProjects} projects
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
