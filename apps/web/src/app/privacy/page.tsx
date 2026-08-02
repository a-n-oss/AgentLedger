import { LegalShell } from "@/components/legal-shell";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p>
        AgentLedger processes metadata about AI agent runs (tokens, models, tool names, cost, latency)
        to provide spend control and audit features. By default we do not retain full prompts or
        completions. Payload retention is opt-in on Team plans with finite retention windows.
      </p>
      <p>
        We use authentication, billing, and infrastructure subprocessors (e.g. Clerk, Stripe, hosting,
        email) solely to operate the service. Contact privacy@agentledger.dev for data requests.
      </p>
    </LegalShell>
  );
}
