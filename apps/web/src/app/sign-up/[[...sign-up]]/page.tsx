import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const inviteOnly = process.env.NEXT_PUBLIC_CLERK_INVITE_ONLY === "true";

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <AuthShell title="Sign up" subtitle="Clerk keys are not configured yet.">
        <div className="space-y-4">
          <p className="text-sm text-[var(--al-muted)]">
            Add Clerk credentials to enable sign-up, or see the self-host docs.
          </p>
          <Link href="/app">
            <Button variant="accent">Open app</Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (inviteOnly) {
    return (
      <AuthShell
        title="Invite only"
        subtitle="This AgentLedger instance does not allow public sign-up."
      >
        <RedirectIfAuthenticated />
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--al-muted)]">
            Ask an admin to invite you (<code>pnpm invite -- you@example.com</code> or Clerk
            Dashboard), then use the email link or{" "}
            <Link href="/sign-in" className="font-medium text-[var(--al-accent)] hover:underline">
              sign in
            </Link>
            .
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/sign-in">
              <Button variant="accent">Sign in</Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary">Self-host docs</Button>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Start controlling agent spend in minutes.">
      <RedirectIfAuthenticated />
      <SignUpForm />
    </AuthShell>
  );
}
