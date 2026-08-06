import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader({
  variant = "marketing",
  className,
  contentClassName,
}: {
  variant?: "marketing" | "simple";
  className?: string;
  contentClassName?: string;
}) {
  return (
    <header className={cn("w-full", className)}>
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 px-6 py-6",
          variant === "marketing" ? "max-w-6xl" : "max-w-3xl",
          contentClassName,
        )}
      >
        <BrandLockup
          markSize={variant === "marketing" ? 34 : 28}
          className={variant === "marketing" ? "text-2xl" : "text-lg"}
        />
        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link href="/docs" className="text-[var(--al-muted)] hover:text-[var(--al-ink)]">
            Docs
          </Link>
          <a
            href="https://github.com/a-n-oss/AgentLedger"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--al-muted)] hover:text-[var(--al-ink)]"
          >
            GitHub
          </a>
          <ThemeToggle />
          {variant === "marketing" ? (
            <Link href="/docs">
              <Button size="sm" variant="accent">
                Self-host
              </Button>
            </Link>
          ) : (
            <Link href="/docs" className="font-medium text-[var(--al-accent)] hover:underline">
              Self-host
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
