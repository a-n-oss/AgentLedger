import { PLANS } from "@agentledger/shared";
import { requireAppSession } from "@/lib/auth-session";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Billing</h1>
        <p className="text-sm text-[var(--al-muted)]">Stripe Checkout + Customer Portal</p>
      </div>
      {params.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Subscription updated.</p>
      )}
      {params.canceled && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Checkout canceled.</p>
      )}
      {params.demo && (
        <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">
          Seeded demo: configure STRIPE_* env vars on a live /app install to enable checkout.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Current plan: {plan.name}</CardTitle>
          <CardDescription>
            {plan.eventQuota.toLocaleString()} events/mo · hard budgets: {plan.hardBudgets ? "yes" : "no"} ·
            audit export: {plan.auditExport ? "yes" : "no"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingActions />
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.values(PLANS).map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>${p.priceMonthlyUsd}/mo</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[var(--al-muted)]">
              {p.eventQuota.toLocaleString()} events · {p.maxProjects} projects
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
