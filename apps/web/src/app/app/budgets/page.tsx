import { listAgents, listBudgets, listProjects } from "@/app/actions";
import { CreateBudgetForm } from "@/components/create-budget-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils";

export default async function BudgetsPage() {
  const [budgets, projects, agents] = await Promise.all([listBudgets(), listProjects(), listAgents()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Budgets</h1>
        <p className="text-sm text-[var(--al-muted)]">Soft alerts or hard stops that return HTTP 402</p>
      </div>
      <CreateBudgetForm
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        agents={agents.map((a) => ({ id: a.id, name: a.name, projectId: a.projectId }))}
      />
      <Card>
        <CardHeader>
          <CardTitle>Configured budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {budgets.map((b) => (
            <div key={b.id} className="flex flex-wrap justify-between gap-2 border-t border-[var(--al-line)] py-3 text-sm first:border-0">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-[var(--al-muted)]">
                  {b.projectName} · {b.scope}
                  {b.agentName ? `/${b.agentName}` : ""} · {b.period}
                </div>
              </div>
              <div className="font-mono">
                {formatUsd(b.amountUsd)} {b.hard ? "HARD" : "SOFT"}
              </div>
            </div>
          ))}
          {budgets.length === 0 && <p className="text-sm text-[var(--al-muted)]">No budgets yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
