import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--al-muted)]">
        Configure Clerk keys for production auth, or use demo mode to explore the app without Clerk.
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
