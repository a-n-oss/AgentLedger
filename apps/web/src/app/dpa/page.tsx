import { LegalShell } from "@/components/legal-shell";

export default function DpaPage() {
  return (
    <LegalShell title="Data Processing Addendum">
      <p>
        This outline DPA describes roles for AgentLedger as a processor of customer telemetry and the
        customer as controller. Processing purposes: provide spend control, alerting, audit export,
        and billing entitlements.
      </p>
      <p>
        Security measures include hashed API keys, org isolation, TLS in transit, and optional
        payload retention controls. A signed DPA is available for Team customers on request.
      </p>
    </LegalShell>
  );
}
