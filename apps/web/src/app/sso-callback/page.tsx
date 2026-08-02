import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-[var(--al-muted)]">
      <AuthenticateWithRedirectCallback />
      Completing sign-in…
    </div>
  );
}
