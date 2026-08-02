"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-[var(--al-paper)] text-[var(--al-ink)]">
      <AppSidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end gap-3 border-b border-[var(--al-line)] px-6 py-3">
          {clerkConfigured ? (
            <>
              <OrganizationSwitcher
                hidePersonal
                afterCreateOrganizationUrl="/app"
                afterSelectOrganizationUrl="/app"
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    organizationSwitcherTrigger:
                      "rounded-md border border-[var(--al-line)] bg-[var(--al-paper)] px-2 py-1 text-sm",
                  },
                }}
              />
              <UserButton afterSignOutUrl="/" />
            </>
          ) : null}
          <ThemeToggle />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
