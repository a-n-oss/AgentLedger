import { requireAppSession } from "@/lib/auth-session";
import { ExportForm } from "@/components/export-form";

export default async function ExportPage() {
  const session = await requireAppSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Audit export</h1>
        <p className="text-sm text-[var(--al-muted)]">
          Team plan feature · current plan: {session.plan.name}
        </p>
      </div>
      {!session.plan.auditExport ? (
        <p className="rounded-xl border border-[var(--al-line)] bg-[var(--al-panel)] p-4 text-sm text-[var(--al-muted)]">
          Upgrade to Team to export CSV/JSON ledgers for compliance reviews.
        </p>
      ) : (
        <ExportForm />
      )}
    </div>
  );
}
