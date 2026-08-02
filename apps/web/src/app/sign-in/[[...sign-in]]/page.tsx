import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
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
      <SignInForm />
    </AuthShell>
  );
}
