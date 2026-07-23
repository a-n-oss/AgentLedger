import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Sign up</h1>
      <p className="mt-2 text-sm text-[var(--al-muted)]">
        In demo mode, accounts are not required. Connect Clerk for multi-user orgs.
      </p>
      <div className="mt-6">
        <Link href="/app">
          <Button variant="accent">Open app</Button>
        </Link>
      </div>
    </div>
  );
}
