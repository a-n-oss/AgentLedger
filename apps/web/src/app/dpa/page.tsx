import { LegalShell } from "@/components/legal-shell";

export default function DpaPage() {
  return (
    <LegalShell title="Data Processing Addendum">
      <p>
        This outline DPA describes roles when a hosted AgentLedger operator acts as a processor of
        customer telemetry and the customer as controller. Processing purposes: provide spend
        control, alerting, audit export, and (when enabled) billing entitlements. Self-host
        operators are typically both controller and processor for their own instance.
      </p>
      <p>
        Security measures include hashed API keys, org isolation, TLS in transit, and optional
        payload retention controls. A signed DPA is available for hosted customers on request.
      </p>
    </LegalShell>
  );
}
