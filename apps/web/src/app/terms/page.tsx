export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-[var(--al-muted)]">
        <p>
          AgentLedger is provided as a subscription SaaS. You are responsible for API keys issued to
          your projects, lawful use of proxied model providers, and configuring budgets appropriate
          to your risk tolerance.
        </p>
        <p>
          Hard budget enforcement stops proxy traffic when caps are exceeded; it is not a guarantee
          against all upstream provider charges (e.g. in-flight streams). The service is provided
          as-is without warranties beyond those required by law.
        </p>
      </div>
    </div>
  );
}
