import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <AuthShell title="Sign up" subtitle="Clerk keys are not configured yet.">
        <div className="space-y-4">
          <p className="text-sm text-[var(--al-muted)]">
            Add Clerk credentials, or enable demo mode to explore the app.
          </p>
          <Link href="/app">
            <Button variant="accent">Open app</Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Start controlling agent spend in minutes.">
      <SignUpForm />
    </AuthShell>
  );
}
