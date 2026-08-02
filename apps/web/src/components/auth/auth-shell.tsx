import { BrandLockup } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen text-[var(--al-ink)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 12%, var(--al-hero-spot-1), transparent 40%),
            radial-gradient(circle at 82% 8%, var(--al-hero-spot-2), transparent 36%),
            linear-gradient(var(--al-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--al-grid) 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, 48px 48px, 48px 48px",
        }}
      />

      <header className="mx-auto flex max-w-lg items-center justify-between px-6 py-6">
        <BrandLockup markSize={28} />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-lg flex-col px-6 pb-16 pt-4">
        <div className="mb-4">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--al-muted)]">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-[var(--al-line)] bg-[var(--al-panel)]/90 p-6 shadow-[var(--al-shadow)] backdrop-blur sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
