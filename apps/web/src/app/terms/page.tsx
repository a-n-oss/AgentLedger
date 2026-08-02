import { LegalShell } from "@/components/legal-shell";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service">
      <p>
        AgentLedger is provided as a subscription SaaS. You are responsible for API keys issued to
        your projects, lawful use of proxied model providers, and configuring budgets appropriate to
        your risk tolerance.
      </p>
      <p>
        Hard budget enforcement stops proxy traffic when caps are exceeded; it is not a guarantee
        against all upstream provider charges (e.g. in-flight streams). The service is provided as-is
        without warranties beyond those required by law.
      </p>
    </LegalShell>
  );
}
