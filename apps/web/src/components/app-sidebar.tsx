import { BadgeCheck, Boxes, Gauge, KeyRound, Receipt, ScrollText, Settings, ShieldAlert, Workflow } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Overview", icon: Gauge },
  { href: "/app/projects", label: "Projects", icon: Boxes },
  { href: "/app/agents", label: "Agents", icon: Workflow },
  { href: "/app/runs", label: "Runs", icon: ScrollText },
  { href: "/app/budgets", label: "Budgets", icon: ShieldAlert },
  { href: "/app/alerts", label: "Alerts", icon: BadgeCheck },
  { href: "/app/export", label: "Export", icon: Receipt },
  { href: "/app/settings/billing", label: "Billing", icon: KeyRound },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function activeHrefFor(pathname: string) {
  let best: string | null = null;
  for (const { href } of links) {
    const matches =
      pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
    if (!matches) continue;
    if (!best || href.length > best.length) best = href;
  }
  return best;
}

export function AppSidebar({ pathname }: { pathname: string }) {
  const activeHref = activeHrefFor(pathname);
  return (
    <aside className="flex h-full w-60 flex-col border-r border-[var(--al-line)] bg-[var(--al-panel)]/80 px-3 py-5 backdrop-blur">
      <BrandLockup href="/" markSize={28} className="mb-6 px-3 text-lg" />
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active = link.href === activeHref;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--al-accent)] text-white"
                  : "text-[var(--al-muted)] hover:bg-[var(--al-panel-2)] hover:text-[var(--al-ink)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-3 text-xs text-[var(--al-muted)]">Control plane for agent spend</p>
    </aside>
  );
}
