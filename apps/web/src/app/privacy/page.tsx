import { LegalShell } from "@/components/legal-shell";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p>
        AgentLedger processes metadata about AI agent runs (tokens, models, tool names, cost, latency)
        to provide spend control and audit features. By default we do not retain full prompts or
        completions. Payload retention is opt-in with finite retention windows (unlocked on
        self-host; gated by plan when hosted billing is enabled).
      </p>
      <p>
        Self-host operators control their own infrastructure. Hosted instances may use
        authentication, optional billing, and infrastructure subprocessors (e.g. Clerk, Stripe,
        hosting, email) solely to operate the service. Contact privacy@agentledger.dev for data
        requests on a hosted instance you do not operate yourself.
      </p>
    </LegalShell>
  );
}
