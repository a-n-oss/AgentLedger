import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--al-muted)]">
          Clerk keys are not configured. Enable demo mode or add Clerk credentials.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/app">
            <Button variant="accent">Continue to app</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <SignIn fallbackRedirectUrl="/app" signUpUrl="/sign-up" />
    </div>
  );
}
