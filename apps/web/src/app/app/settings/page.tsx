import { isDemoSession, requireAppSession } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await requireAppSession();
  const demo = isDemoSession(session);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Name: {session.orgName}</div>
          <div>Role: {session.role}</div>
          <div>Entitlements: {session.plan.name} (self-host unlocked)</div>
          <div>Surface: {demo ? "Seeded demo (/demo)" : "Live app (/app)"}</div>
          <div className="text-[var(--al-muted)]">
            Privacy default: metadata + tokens only. Enable payload retention per project when needed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
