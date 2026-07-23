import { listRuns } from "@/app/actions";
import { formatUsd } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RunsPage() {
  const runs = await listRuns();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Runs</h1>
        <p className="text-sm text-[var(--al-muted)]">Multi-step agent ledgers from the SDK</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--al-muted)]">
              <tr>
                <th className="py-2">Started</th>
                <th>Agent</th>
                <th>Project</th>
                <th>Team</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-t border-[var(--al-line)]">
                  <td className="py-2 font-mono text-xs">{run.startedAt.toISOString()}</td>
                  <td>{run.agentName ?? "—"}</td>
                  <td>{run.projectName}</td>
                  <td>{run.team ?? "—"}</td>
                  <td>{run.status}</td>
                  <td className="font-mono">{formatUsd(run.totalCostUsd, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {runs.length === 0 && <p className="text-sm text-[var(--al-muted)]">No runs yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
