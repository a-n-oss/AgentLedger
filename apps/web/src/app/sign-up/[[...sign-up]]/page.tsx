import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Sign up</h1>
        <p className="mt-2 text-sm text-[var(--al-muted)]">
          Clerk keys are not configured. Enable demo mode or add Clerk credentials.
        </p>
        <div className="mt-6">
          <Link href="/app">
            <Button variant="accent">Open app</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
      <SignUp fallbackRedirectUrl="/app" signInUrl="/sign-in" />
    </div>
  );
}
