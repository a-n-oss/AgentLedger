import { listAlertChannels } from "@/app/actions";
import { AlertsManager } from "@/components/alerts-manager";

export default async function AlertsPage() {
  const channels = await listAlertChannels();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Alerts</h1>
        <p className="text-sm text-[var(--al-muted)]">
          Budget threshold notifications (50/80/100%). With Resend’s{" "}
          <code>onboarding@resend.dev</code> sender, test emails can only go to your Resend account
          email until you verify a domain.
        </p>
      </div>
      <AlertsManager channels={channels} />
    </div>
  );
}
