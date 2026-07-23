import { listAgents } from "@/app/actions";
import { formatNumber, formatUsd } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AgentsPage() {
  const agents = await listAgents();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Agents</h1>
        <p className="text-sm text-[var(--al-muted)]">Auto-created from x-al-agent headers and SDK runs</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Spend by agent</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--al-muted)]">
              <tr>
                <th className="py-2">Agent</th>
                <th>Project</th>
                <th>Events</th>
                <th>Spend</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-t border-[var(--al-line)]">
                  <td className="py-2 font-medium">{agent.name}</td>
                  <td>{agent.projectName}</td>
                  <td>{formatNumber(agent.events)}</td>
                  <td className="font-mono">{formatUsd(agent.spend, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {agents.length === 0 && <p className="text-sm text-[var(--al-muted)]">No agents yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
