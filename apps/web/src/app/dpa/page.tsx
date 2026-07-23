export default function DpaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Data Processing Addendum</h1>
      <div className="mt-6 space-y-4 text-[var(--al-muted)]">
        <p>
          This outline DPA describes roles for AgentLedger as a processor of customer telemetry and
          the customer as controller. Processing purposes: provide spend control, alerting, audit
          export, and billing entitlements.
        </p>
        <p>
          Security measures include hashed API keys, org isolation, TLS in transit, and optional
          payload retention controls. A signed DPA is available for Team customers on request.
        </p>
      </div>
    </div>
  );
}
