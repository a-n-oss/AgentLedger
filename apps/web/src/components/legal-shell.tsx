import { SiteHeader } from "@/components/site-header";

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-[var(--al-ink)]">
      <SiteHeader variant="simple" />
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{title}</h1>
        <div className="mt-6 space-y-4 text-[var(--al-muted)]">{children}</div>
      </div>
    </div>
  );
}
