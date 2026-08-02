import {
  BadgeCheck,
  Boxes,
  Gauge,
  KeyRound,
  Receipt,
  ScrollText,
  Settings,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const linkDefs = [
  { path: "", label: "Overview", icon: Gauge },
  { path: "/projects", label: "Projects", icon: Boxes },
  { path: "/agents", label: "Agents", icon: Workflow },
  { path: "/runs", label: "Runs", icon: ScrollText },
  { path: "/budgets", label: "Budgets", icon: ShieldAlert },
  { path: "/alerts", label: "Alerts", icon: BadgeCheck },
  { path: "/export", label: "Export", icon: Receipt },
  { path: "/settings/billing", label: "Billing", icon: KeyRound },
  { path: "/settings", label: "Settings", icon: Settings },
] as const;

function activePathFor(pathname: string, basePath: string) {
  const relative =
    pathname === basePath ? "" : pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname;
  let best: string | null = null;
  for (const { path } of linkDefs) {
    const matches = relative === path || (path !== "" && relative.startsWith(`${path}/`));
    if (!matches) continue;
    if (best === null || path.length > best.length) best = path;
  }
  return best;
}

export function AppSidebar({
  pathname,
  basePath = "/app",
  isDemo = false,
}: {
  pathname: string;
  basePath?: string;
  isDemo?: boolean;
}) {
  const activePath = activePathFor(pathname, basePath);
  return (
    <aside className="flex h-full w-60 flex-col border-r border-[var(--al-line)] bg-[var(--al-panel)]/80 px-3 py-5 backdrop-blur">
      <BrandLockup href="/" markSize={28} className="mb-6 px-3 text-lg" />
      {isDemo ? (
        <p className="mb-4 rounded-md bg-[var(--al-panel-2)] px-3 py-2 text-xs text-[var(--al-muted)]">
          Seeded demo · read-mostly explore
        </p>
      ) : null}
      <nav className="flex flex-1 flex-col gap-1">
        {linkDefs.map((link) => {
          const href = `${basePath}${link.path}`;
          const active = link.path === activePath;
          const Icon = link.icon;
          return (
            <Link
              key={link.path || "overview"}
              href={href}
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
