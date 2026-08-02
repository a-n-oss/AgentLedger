"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-[var(--al-paper)] text-[var(--al-ink)]">
      <AppSidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-[var(--al-line)] px-6 py-3">
          <ThemeToggle />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
