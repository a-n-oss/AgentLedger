import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const cloneBlock = `git clone https://github.com/a-n-oss/AgentLedger.git
cd AgentLedger
docker compose up -d`;

const envBlock = `cp apps/web/.env.example apps/web/.env.local
# Defaults:
#   DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
#   AGENTLEDGER_DEMO_MODE=true
#   NEXT_PUBLIC_APP_URL=http://localhost:3000

# For live proxy on your host, add:
#   OPENAI_API_KEY=sk-...`;

const installBlock = `pnpm install
pnpm db:migrate
pnpm db:seed
# save the printed Demo API key

pnpm dev      # http://localhost:3000`;

const openaiBlock = `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseURL: "http://localhost:3000/api/v1",
  defaultHeaders: {
    "x-al-agent": "support-triage",
    "x-al-team": "support",
    "x-al-user": "user_42",
  },
});

const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Summarize this ticket" }],
});`;

const sdkBlock = `import { createClient } from "@agentledger/sdk";

const al = createClient({
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseUrl: "http://localhost:3000",
});

const { runId } = await al.openRun({ agent: "support-triage", team: "support" });
await al.span({ runId, type: "tool", toolName: "lookup_order", latencyMs: 80 });
await al.endRun({ runId, status: "completed" });`;

export default function DocsPage() {
  return (
    <div className="docs-shell min-h-screen text-[var(--al-ink)]">
      <SiteHeader variant="simple" />
      <div className="mx-auto max-w-3xl px-6 pb-14 pt-2 md:pb-16">
        <article className="docs-prose">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
            Self-host AgentLedger
          </h1>
          <p className="mt-4 text-lg text-[var(--al-muted)]">
            Run the control plane on your machine or infra. This public site is docs plus a{" "}
            <Link href="/app" className="font-medium text-[var(--al-accent)] underline">
              seeded demo
            </Link>
            — do not point production agent traffic here.
          </p>

          <h2 className="mt-12 text-2xl font-semibold">1. Clone and start Postgres</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {cloneBlock}
          </pre>
          <p className="mt-3 text-[var(--al-muted)]">
            Compose maps host port <code>5433</code> → Postgres <code>5432</code>.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">2. Configure env</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {envBlock}
          </pre>

          <h2 className="mt-10 text-2xl font-semibold">3. Install, migrate, seed</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {installBlock}
          </pre>

          <h2 className="mt-10 text-2xl font-semibold">4. Create a project + API key</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Open{" "}
            <Link href="/app/projects" className="font-medium text-[var(--al-accent)] underline">
              Projects
            </Link>{" "}
            on your self-hosted app (or the public demo) and copy the live key (shown once).
          </p>

          <h2 className="mt-10 text-2xl font-semibold">5. Point the SDK at your host</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {openaiBlock}
          </pre>

          <h2 className="mt-10 text-2xl font-semibold">6. Optional: multi-step run ledger</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {sdkBlock}
          </pre>

          <h2 className="mt-10 text-2xl font-semibold">7. Set hard budgets</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Create a monthly project budget in the app. When spent ≥ amount on a hard budget
            (Pro/Team), the proxy returns HTTP 402 and stops further calls.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">Provider keys</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Configure <code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, and/or{" "}
            <code>GOOGLE_API_KEY</code> on <strong>your</strong> AgentLedger server. Clients only
            need the AgentLedger key. The public demo does not expose live provider proxying.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">More</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Full self-host and demo-site notes:{" "}
            <a
              href="https://github.com/a-n-oss/AgentLedger/blob/main/DEPLOY.md"
              className="font-medium text-[var(--al-accent)] underline"
            >
              DEPLOY.md
            </a>{" "}
            in the repo.
          </p>
        </article>
      </div>
    </div>
  );
}
