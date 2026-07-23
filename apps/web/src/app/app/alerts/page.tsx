import { listAlertChannels } from "@/app/actions";
import { AlertsManager } from "@/components/alerts-manager";

export default async function AlertsPage() {
  const channels = await listAlertChannels();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Alerts</h1>
        <p className="text-sm text-[var(--al-muted)]">Budget threshold notifications (50/80/100%)</p>
      </div>
      <AlertsManager channels={channels} />
    </div>
  );
}
