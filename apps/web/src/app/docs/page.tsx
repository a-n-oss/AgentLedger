import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function DocsPage() {
  return (
    <div className="docs-shell min-h-screen text-[var(--al-ink)]">
      <SiteHeader variant="simple" />
      <div className="mx-auto max-w-3xl px-6 pb-14 pt-2 md:pb-16">
        <article className="docs-prose">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
            Proxy quickstart
          </h1>
          <p className="mt-4 text-lg text-[var(--al-muted)]">
            Swap your OpenAI base URL. Attribution headers map spend to agents and teams.
          </p>

          <h2 className="mt-12 text-2xl font-semibold">1. Create a project + API key</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            In the app, open{" "}
            <Link href="/app/projects" className="font-medium text-[var(--al-accent)] underline">
              Projects
            </Link>{" "}
            and copy the live key (shown once).
          </p>

          <h2 className="mt-10 text-2xl font-semibold">2. Point the SDK at AgentLedger</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
{`import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseURL: "${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1",
  defaultHeaders: {
    "x-al-agent": "support-triage",
    "x-al-team": "support",
    "x-al-user": "user_42",
  },
});

const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Summarize this ticket" }],
});`}
          </pre>

          <h2 className="mt-10 text-2xl font-semibold">3. Optional: multi-step run ledger</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
{`import { createClient } from "@agentledger/sdk";

const al = createClient({
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseUrl: "${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}",
});

const { runId } = await al.openRun({ agent: "support-triage", team: "support" });
await al.span({ runId, type: "tool", toolName: "lookup_order", latencyMs: 80 });
await al.endRun({ runId, status: "completed" });`}
          </pre>

          <h2 className="mt-10 text-2xl font-semibold">4. Set hard budgets</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Create a monthly project budget in the app. When spent ≥ amount on a hard budget
            (Pro/Team), the proxy returns HTTP 402 and stops further calls.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">Provider keys</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Configure <code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, and/or{" "}
            <code>GOOGLE_API_KEY</code> on the AgentLedger server. Clients only need the AgentLedger
            key.
          </p>
        </article>
      </div>
    </div>
  );
}
