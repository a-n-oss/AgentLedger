import { getOverviewStats } from "@/app/actions";
import { requireAppSession } from "@/lib/auth-session";
import { SpendChart } from "@/components/spend-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatUsd } from "@/lib/utils";

export default async function AppOverviewPage() {
  const session = await requireAppSession();
  const stats = await getOverviewStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Overview</h1>
        <p className="text-sm text-[var(--al-muted)]">
          {session.orgName} · {session.plan.name} entitlements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Spend (30d)", value: formatUsd(stats.spend30d, 2) },
          { label: "Events (30d)", value: formatNumber(stats.events30d) },
          { label: "Agents", value: formatNumber(stats.agents) },
          { label: "Error rate", value: `${(stats.errorRate * 100).toFixed(1)}%` },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spend over time</CardTitle>
          <CardDescription>Last 30 days across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.series.length === 0 ? (
            <p className="text-sm text-[var(--al-muted)]">No events yet. Point your OpenAI client at /api/v1.</p>
          ) : (
            <SpendChart data={stats.series} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topAgents.map((a) => (
              <div key={a.name} className="flex justify-between text-sm">
                <span>{a.name}</span>
                <span className="font-mono">{formatUsd(a.spend, 4)}</span>
              </div>
            ))}
            {stats.topAgents.length === 0 && (
              <p className="text-sm text-[var(--al-muted)]">No agent spend yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topModels.map((m) => (
              <div key={m.model} className="flex justify-between text-sm">
                <span>{m.model}</span>
                <span className="font-mono">{formatUsd(m.spend, 4)}</span>
              </div>
            ))}
            {stats.topModels.length === 0 && (
              <p className="text-sm text-[var(--al-muted)]">No model spend yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
