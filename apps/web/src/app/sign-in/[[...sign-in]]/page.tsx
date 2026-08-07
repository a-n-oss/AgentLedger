import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";
import { CHOOSE_ORGANIZATION_TASK_PATH } from "@/lib/auth-navigation";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ "sign-in"?: string[] }>;
}) {
  const segments = (await params)["sign-in"] ?? [];
  // Legacy Clerk default task URL before taskUrls was configured.
  if (segments[0] === "tasks") {
    redirect(CHOOSE_ORGANIZATION_TASK_PATH);
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <AuthShell title="Sign in" subtitle="Clerk keys are not configured yet.">
        <div className="space-y-4">
          <p className="text-sm text-[var(--al-muted)]">
            Add Clerk credentials, or enable demo mode to explore the app.
          </p>
          <div className="flex gap-3">
            <Link href="/app">
              <Button variant="accent">Continue to app</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Home</Button>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Sign in" subtitle="Access your agent spend control plane.">
      <RedirectIfAuthenticated />
      <SignInForm />
    </AuthShell>
  );
}
