import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SSOCallbackPage() {
  if (!clerkConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--al-muted)]">
        Sign-in is not configured for this environment.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-[var(--al-muted)]">
      <AuthenticateWithRedirectCallback />
      Completing sign-in…
    </div>
  );
}
