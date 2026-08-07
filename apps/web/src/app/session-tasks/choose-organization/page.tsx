import { TaskChooseOrganization } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ChooseOrganizationTaskPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <AuthShell title="Choose organization" subtitle="Clerk is not configured.">
        <p className="text-sm text-[var(--al-muted)]">Sign-in is unavailable in this environment.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose organization"
      subtitle="Select a workspace to continue into AgentLedger."
    >
      <TaskChooseOrganization redirectUrlComplete="/app" />
    </AuthShell>
  );
}
